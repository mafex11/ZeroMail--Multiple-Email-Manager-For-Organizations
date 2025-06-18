import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  
  // Current active subscription
  currentSubscription?: {
    subscriptionId: ObjectId
    planType: 'weekly' | 'monthly' | 'lifetime'
    planName: string
    status: 'active' | 'expired' | 'cancelled'
    startDate: Date
    endDate?: Date
    durationInDays?: number
    features: string[]
    isActive: boolean
    lastPaymentId: ObjectId
    lastPaymentDate: Date
  }
  
  // Subscription history
  subscriptionHistory?: Array<{
    subscriptionId: ObjectId
    planType: string
    startDate: Date
    endDate?: Date
    status: string
    paymentId: ObjectId
  }>
  
  // Timestamps
  lastSubscriptionUpdate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  name: string
  email: string
  password: string
}

export interface Subscription {
  _id: ObjectId
  userId: string
  userEmail: string
  userName: string
  
  // Subscription details
  planType: 'weekly' | 'monthly' | 'lifetime'
  planName: string
  status: 'active' | 'expired' | 'cancelled'
  
  // Duration details
  startDate: Date
  endDate?: Date
  durationInDays?: number
  
  // Payment reference
  paymentId: ObjectId
  razorpayOrderId: string
  razorpayPaymentId: string
  
  // Pricing details
  amount: number
  currency: string
  
  // Features based on plan
  features: string[]
  
  // Subscription metadata
  isActive: boolean
  autoRenew: boolean
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastAccessedAt: Date
}

export interface Payment {
  _id: ObjectId
  userId: string
  userEmail: string
  subscriptionId: ObjectId
  
  // Razorpay payment details
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature?: string
  
  // Payment amount and currency
  amount: number
  currency: string
  
  // Plan details
  planType: 'weekly' | 'monthly' | 'lifetime'
  planName: string
  
  // Payment status and metadata
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: 'razorpay'
  isTestPayment: boolean
  
  // Timestamps
  paymentDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}