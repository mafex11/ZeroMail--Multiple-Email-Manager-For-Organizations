import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { authOptions } from '@/lib/auth'

const PLAN_FEATURES = {
  weekly: {
    aiQueries: 20,
    emailSummaries: -1,
    advancedSearch: true,
    otpAutoFill: true,
    prioritySupport: true,
    earlyAccess: false
  },
  monthly: {
    aiQueries: -1,
    emailSummaries: -1,
    advancedSearch: true,
    otpAutoFill: true,
    prioritySupport: true,
    earlyAccess: true
  },
  lifetime: {
    aiQueries: -1,
    emailSummaries: -1,
    advancedSearch: true,
    otpAutoFill: true,
    prioritySupport: true,
    earlyAccess: true
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan
    } = await request.json()

    // Verify payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate subscription dates
    const startDate = new Date()
    let endDate: Date | undefined

    if (plan === 'weekly') {
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    } else if (plan === 'monthly') {
      endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
    // lifetime plan doesn't have an end date

    // Update user subscription
    user.subscription = {
      plan: plan,
      status: 'active',
      startDate: startDate,
      endDate: endDate,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      amount: plan === 'weekly' ? 699 : plan === 'monthly' ? 999 : 1499,
      currency: 'INR',
      features: PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES]
    }

    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription updated',
      subscription: user.subscription
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
} 