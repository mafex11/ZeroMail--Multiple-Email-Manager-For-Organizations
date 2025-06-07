import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  email: string
  name: string
  image?: string
  provider: string
  providerId: string
  accounts: IGmailAccount[]
  subscription: ISubscription
  createdAt: Date
  updatedAt: Date
}

export interface IGmailAccount {
  email: string
  accessToken: string
  refreshToken: string
  profilePicture?: string
  isActive: boolean
  addedAt: Date
}

export interface ISubscription {
  plan: 'free' | 'weekly' | 'monthly' | 'lifetime'
  status: 'active' | 'inactive' | 'cancelled' | 'expired'
  startDate?: Date
  endDate?: Date
  razorpaySubscriptionId?: string
  razorpayPaymentId?: string
  razorpayOrderId?: string
  amount?: number
  currency?: string
  features: {
    aiQueries: number // -1 for unlimited
    emailSummaries: number // -1 for unlimited
    advancedSearch: boolean
    otpAutoFill: boolean
    prioritySupport: boolean
    earlyAccess: boolean
  }
}

const GmailAccountSchema = new Schema<IGmailAccount>({
  email: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  profilePicture: { type: String },
  isActive: { type: Boolean, default: true },
  addedAt: { type: Date, default: Date.now }
})

const SubscriptionSchema = new Schema<ISubscription>({
  plan: { 
    type: String, 
    enum: ['free', 'weekly', 'monthly', 'lifetime'], 
    default: 'free' 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'cancelled', 'expired'], 
    default: 'active' 
  },
  startDate: { type: Date },
  endDate: { type: Date },
  razorpaySubscriptionId: { type: String },
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String },
  amount: { type: Number },
  currency: { type: String, default: 'INR' },
  features: {
    aiQueries: { type: Number, default: 3 }, // Free tier: 3 per day
    emailSummaries: { type: Number, default: 3 }, // Free tier: top 3 emails only
    advancedSearch: { type: Boolean, default: false },
    otpAutoFill: { type: Boolean, default: true }, // Available for all plans
    prioritySupport: { type: Boolean, default: false },
    earlyAccess: { type: Boolean, default: false }
  }
})

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
  accounts: [GmailAccountSchema],
  subscription: { type: SubscriptionSchema, default: () => ({}) }
}, {
  timestamps: true
})

// Create indexes for better performance
UserSchema.index({ email: 1 })
UserSchema.index({ 'accounts.email': 1 })
UserSchema.index({ 'subscription.razorpaySubscriptionId': 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema) 