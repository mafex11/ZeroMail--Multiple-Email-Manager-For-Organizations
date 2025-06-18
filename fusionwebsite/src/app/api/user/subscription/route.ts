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

    // Get user with subscription info
    const user = await users.findOne({ _id: new ObjectId(session.user.id) })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if subscription is still active
    let subscriptionStatus = 'free'
    let isActive = false
    
    if (user.currentSubscription) {
      const { planType, endDate, status } = user.currentSubscription
      
      if (status === 'active') {
        if (planType === 'lifetime' || (endDate && new Date() < new Date(endDate))) {
          subscriptionStatus = planType
          isActive = true
        } else if (endDate && new Date() >= new Date(endDate)) {
          // Subscription expired, update status
          await users.updateOne(
            { _id: new ObjectId(session.user.id) },
            {
              $set: {
                'currentSubscription.status': 'expired',
                updatedAt: new Date()
              }
            }
          )
        }
      }
    }

    return NextResponse.json({
      subscription: {
        planType: subscriptionStatus,
        isActive,
        ...user.currentSubscription
      }
    })

  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
} 