import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const client = await clientPromise
    const db = client.db('fusionmail')
    const users = db.collection('users')
    const payments = db.collection('payments')
    const subscriptions = db.collection('subscriptions')

    // Get user with complete subscription details
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get all payment history for the user
    const paymentHistory = await payments
      .find({ userId: session.user.id })
      .sort({ paymentDate: -1 })
      .toArray()

    // Get all subscription history for the user
    const subscriptionHistory = await subscriptions
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    // Get current active subscription details
    const currentSubscription = await subscriptions.findOne({
      userId: session.user.id,
      status: 'active',
      $or: [
        { endDate: null }, // lifetime plan
        { endDate: { $gt: new Date() } } // not expired
      ]
    })

    // Calculate subscription statistics
    const totalPayments = paymentHistory.length
    const totalAmountSpent = paymentHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const subscriptionCount = subscriptionHistory.length

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currentSubscription: user.currentSubscription,
        subscriptionHistory: user.subscriptionHistory || []
      },
      payments: {
        history: paymentHistory,
        statistics: {
          totalPayments,
          totalAmountSpent,
          currency: paymentHistory[0]?.currency || 'INR'
        }
      },
      subscriptions: {
        current: currentSubscription,
        history: subscriptionHistory,
        statistics: {
          totalSubscriptions: subscriptionCount,
          activeSubscription: currentSubscription ? true : false
        }
      }
    })

  } catch (error) {
    console.error('Payment history fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    )
  }
} 