import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { CreateUserData } from '@/lib/models/User'
import { hash } from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // Validate the input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('fusionmail')
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await hash(password, 12)

    // Create the user
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        userId: result.insertedId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}