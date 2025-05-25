import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Razorpay from 'razorpay'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { authOptions } from '@/lib/auth'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const PLAN_PRICES = {
  weekly: 699, // ₹6.99 in paise
  monthly: 999, // ₹9.99 in paise
  lifetime: 1499, // ₹14.99 in paise
}

const PLAN_FEATURES = {
  weekly: {
    aiQueries: 20,
    emailSummaries: -1, // unlimited
    advancedSearch: true,
    otpAutoFill: true,
    prioritySupport: true,
    earlyAccess: false
  },
  monthly: {
    aiQueries: -1, // unlimited
    emailSummaries: -1, // unlimited
    advancedSearch: true,
    otpAutoFill: true,
    prioritySupport: true,
    earlyAccess: true
  },
  lifetime: {
    aiQueries: -1, // unlimited
    emailSummaries: -1, // unlimited
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

    const { plan } = await request.json()

    if (!plan || !PLAN_PRICES[plan as keyof typeof PLAN_PRICES]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `fusion_mail_${plan}_${user._id}_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        plan: plan,
        email: user.email
      }
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: plan,
      features: PLAN_FEATURES[plan as keyof typeof PLAN_FEATURES]
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
} 