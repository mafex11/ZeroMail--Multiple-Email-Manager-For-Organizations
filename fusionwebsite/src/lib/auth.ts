import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDatabase } from './mongodb'
import { User, CreateUserData, LoginCredentials } from './models/User'

const JWT_SECRET = process.env.JWT_SECRET!

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function createUser(userData: CreateUserData): Promise<User> {
  const db = await getDatabase()
  const users = db.collection<User>('users')

  // Check if user already exists
  const existingUser = await users.findOne({ email: userData.email })
  if (existingUser) {
    throw new Error('User already exists')
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password)

  // Create user object
  const user: Omit<User, '_id'> = {
    email: userData.email,
    password: hashedPassword,
    firstName: userData.firstName,
    lastName: userData.lastName,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    subscription: {
      plan: 'free',
      status: 'active',
      startDate: new Date()
    }
  }

  // Insert user
  const result = await users.insertOne(user)
  
  // Return user without password
  const { password, ...userWithoutPassword } = user
  return { ...userWithoutPassword, _id: result.insertedId } as User
}

export async function authenticateUser(credentials: LoginCredentials): Promise<User | null> {
  const db = await getDatabase()
  const users = db.collection<User>('users')

  // Find user by email
  const user = await users.findOne({ email: credentials.email })
  if (!user) {
    return null
  }

  // Verify password
  const isValidPassword = await verifyPassword(credentials.password, user.password)
  if (!isValidPassword) {
    return null
  }

  // Update last login
  await users.updateOne(
    { _id: user._id },
    { 
      $set: { 
        lastLoginAt: new Date(),
        updatedAt: new Date()
      }
    }
  )

  return user
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = await getDatabase()
  const users = db.collection<User>('users')
  
  const user = await users.findOne({ _id: new (await import('mongodb')).ObjectId(userId) })
  return user
}