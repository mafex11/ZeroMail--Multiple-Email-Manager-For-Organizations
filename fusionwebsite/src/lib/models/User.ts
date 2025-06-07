import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  password: string
  firstName: string
  lastName: string
  profilePicture?: string
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  subscription?: {
    plan: 'free' | 'weekly' | 'monthly' | 'lifetime'
    status: 'active' | 'cancelled' | 'expired'
    startDate: Date
    endDate?: Date
  }
}

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginCredentials {
  email: string
  password: string
}