import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Since you mentioned there's no secret key, we'll work with just the key ID
// In production, you should have a secret key for security
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: 'dummy_secret' // Placeholder since you don't have a secret key
})

const PLAN_PRICES = {
  'weekly': { amount: 699, currency: 'INR', name: 'Weekly Plan' }, // $6.99 ≈ ₹699
  'monthly': { amount: 999, currency: 'INR', name: 'Monthly Plan' }, // $9.99 ≈ ₹999
  'lifetime': { amount: 1499, currency: 'INR', name: 'Lifetime Access' } // $14.99 ≈ ₹1499
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { planType } = await request.json()

    if (!planType || !PLAN_PRICES[planType as keyof typeof PLAN_PRICES]) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    const plan = PLAN_PRICES[planType as keyof typeof PLAN_PRICES]

    // Create Razorpay order
    const options: any = {
      amount: plan.amount * 100, // Amount in paise (multiply by 100)
      currency: plan.currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        planType,
        userId: session.user.id,
        userEmail: session.user.email
      }
    }

    try {
      const order = await razorpay.orders.create(options)
      
      return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planName: plan.name,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      })
    } catch (razorpayError) {
      console.error('Razorpay order creation failed:', razorpayError)
      
      // Since you don't have a secret key, we'll create a mock order for testing
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: plan.amount * 100,
        currency: plan.currency
      }
      
      return NextResponse.json({
        orderId: mockOrder.id,
        amount: mockOrder.amount,
        currency: mockOrder.currency,
        planName: plan.name,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        isMockOrder: true
      })
    }

  } catch (error) {
    console.error('Payment order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
} 