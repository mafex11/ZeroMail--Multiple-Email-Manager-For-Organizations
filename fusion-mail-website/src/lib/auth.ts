import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import connectDB from './mongodb'
import User, { IGmailAccount } from './models/User'

const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = client.connect()

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB()
          
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            // Create new user with default free subscription
            existingUser = new User({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
              accounts: [{
                email: user.email!,
                accessToken: account.access_token!,
                refreshToken: account.refresh_token!,
                profilePicture: user.image,
                isActive: true,
                addedAt: new Date()
              }],
              subscription: {
                plan: 'free',
                status: 'active',
                startDate: new Date(),
                features: {
                  aiQueries: 3,
                  emailSummaries: 3,
                  advancedSearch: false,
                  otpAutoFill: true,
                  prioritySupport: false,
                  earlyAccess: false
                }
              }
            })
            await existingUser.save()
          } else {
            // Update existing user's account if needed
            const existingAccount = existingUser.accounts.find((acc: IGmailAccount) => acc.email === user.email)
            if (!existingAccount) {
              existingUser.accounts.push({
                email: user.email!,
                accessToken: account.access_token!,
                refreshToken: account.refresh_token!,
                profilePicture: user.image,
                isActive: true,
                addedAt: new Date()
              })
              await existingUser.save()
            } else {
              // Update tokens
              existingAccount.accessToken = account.access_token!
              existingAccount.refreshToken = account.refresh_token!
              await existingUser.save()
            }
          }
          
          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          await connectDB()
          const user = await User.findOne({ email: session.user.email })
          if (user) {
            session.user.id = user._id.toString()
            session.user.subscription = user.subscription
            session.user.accounts = user.accounts
          }
        } catch (error) {
          console.error('Error in session callback:', error)
        }
      }
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions 