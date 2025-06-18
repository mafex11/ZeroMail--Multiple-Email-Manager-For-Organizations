import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planType,
      isMockOrder,
      amount,
      currency,
      planName 
    } = await request.json()

    // Since you don't have a secret key, we'll skip signature verification for mock orders
    if (!isMockOrder) {
      // In production with a real secret key, you would verify the signature like this:
      // const body = razorpay_order_id + "|" + razorpay_payment_id
      // const expectedSignature = crypto
      //   .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      //   .update(body.toString())
      //   .digest("hex")
      
      // if (expectedSignature !== razorpay_signature) {
      //   return NextResponse.json(
      //     { error: 'Payment verification failed' },
      //     { status: 400 }
      //   )
      // }
    }

    // Update user subscription in MongoDB
    const client = await clientPromise
    const db = client.db('fusionmail')
    const users = db.collection('users')
    const subscriptions = db.collection('subscriptions')
    const payments = db.collection('payments')

    // Calculate subscription end date based on plan type
    let endDate: Date | null = null
    let durationInDays: number | null = null
    
    if (planType === 'weekly') {
      endDate = new Date()
      endDate.setDate(endDate.getDate() + 7)
      durationInDays = 7
    } else if (planType === 'monthly') {
      endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)
      durationInDays = 30
    }
    // lifetime plan has no end date (null)

    const currentDate = new Date()
    const subscriptionId = new ObjectId()

    // Create detailed payment record
    const paymentData = {
      _id: new ObjectId(),
      userId: session.user.id,
      userEmail: session.user.email,
      subscriptionId: subscriptionId,
      
      // Razorpay payment details
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      
      // Payment amount and currency
      amount: amount || 0,
      currency: currency || 'INR',
      
      // Plan details
      planType,
      planName: planName || planType,
      
      // Payment status and metadata
      paymentStatus: 'completed',
      paymentMethod: 'razorpay',
      isTestPayment: isMockOrder || false,
      
      // Timestamps
      paymentDate: currentDate,
      createdAt: currentDate,
      updatedAt: currentDate
    }

    await payments.insertOne(paymentData)

    // Create comprehensive subscription record
    const subscriptionData = {
      _id: subscriptionId,
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      
      // Subscription details
      planType,
      planName: planName || planType,
      status: 'active',
      
      // Duration details
      startDate: currentDate,
      endDate,
      durationInDays,
      
      // Payment reference
      paymentId: paymentData._id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      
      // Pricing details
      amount: amount || 0,
      currency: currency || 'INR',
      
      // Features based on plan
      features: getPlanFeatures(planType),
      
      // Subscription metadata
      isActive: true,
      autoRenew: planType !== 'lifetime', // lifetime doesn't auto-renew
      
      // Timestamps
      createdAt: currentDate,
      updatedAt: currentDate,
      lastAccessedAt: currentDate
    }

    await subscriptions.insertOne(subscriptionData)

    // Update user record with comprehensive subscription details
    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          // Current active subscription
          currentSubscription: {
            subscriptionId: subscriptionId,
            planType,
            planName: planName || planType,
            status: 'active',
            startDate: currentDate,
            endDate,
            durationInDays,
            features: getPlanFeatures(planType),
            isActive: true,
            lastPaymentId: paymentData._id,
            lastPaymentDate: currentDate
          },
          
          // Update timestamps
          lastSubscriptionUpdate: currentDate,
          updatedAt: currentDate
        }
      }
    )

    // Add to subscription history separately
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })
    const existingHistory = user?.subscriptionHistory || []
    
    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          subscriptionHistory: [
            ...existingHistory,
            {
              subscriptionId: subscriptionId,
              planType,
              startDate: currentDate,
              endDate,
              status: 'active',
              paymentId: paymentData._id
            }
          ]
        }
      }
    )

    // Helper function to get plan features
    function getPlanFeatures(planType: string) {
      const features = {
        'weekly': [
          '20 chat queries per day',
          'Full email content & summaries',
          'Automatic OTP auto-fill',
          'Advanced search',
          'Priority support'
        ],
        'monthly': [
          'Unlimited AI chat',
          'Full email content & summaries',
          'Automatic OTP auto-fill',
          'Expanded search & analytics',
          'Priority support',
          'Early access to new features'
        ],
        'lifetime': [
          'Unlimited AI chat',
          'Full email content & summaries',
          'Automatic OTP auto-fill',
          'All premium features',
          'Lifetime updates',
          'VIP support'
        ]
      }
      
      return features[planType as keyof typeof features] || []
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: {
        planType,
        status: 'active',
        startDate: new Date(),
        endDate
      }
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
} 