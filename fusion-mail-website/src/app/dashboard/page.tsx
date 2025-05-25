'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, User, Crown, Calendar, CreditCard, Settings } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

interface UserProfile {
  id: string
  email: string
  name: string
  image?: string
  subscription: {
    plan: string
    status: string
    startDate?: string
    endDate?: string
    features: {
      aiQueries: number
      emailSummaries: number
      advancedSearch: boolean
      otpAutoFill: boolean
      prioritySupport: boolean
      earlyAccess: boolean
    }
  }
  accounts: Array<{
    email: string
    profilePicture?: string
    isActive: boolean
    addedAt: string
  }>
  createdAt: string
}

export default function DashboardPage() {
  const { status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        toast.error('Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">
                Go to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Unable to load your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchProfile} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800'
      case 'weekly': return 'bg-blue-100 text-blue-800'
      case 'monthly': return 'bg-purple-100 text-purple-800'
      case 'lifetime': return 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Fusion Mail account and subscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Member since {formatDate(profile.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connected Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Connected Gmail Accounts
                </CardTitle>
                <CardDescription>
                  Gmail accounts connected to your Fusion Mail extension
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.accounts.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {account.profilePicture ? (
                          <Image
                            src={account.profilePicture}
                            alt={account.email}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{account.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Added {formatDate(account.addedAt)}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="h-5 w-5 mr-2" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${getPlanBadgeColor(profile.subscription.plan)}`}>
                    {profile.subscription.plan.charAt(0).toUpperCase() + profile.subscription.plan.slice(1)} Plan
                  </div>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ml-2 ${
                    profile.subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.subscription.status}
                  </div>
                </div>

                {profile.subscription.startDate && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Started:</span>
                      <span className="text-foreground">{formatDate(profile.subscription.startDate)}</span>
                    </div>
                    {profile.subscription.endDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="text-foreground">{formatDate(profile.subscription.endDate)}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-foreground mb-2">Plan Features:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• AI Queries: {profile.subscription.features.aiQueries === -1 ? 'Unlimited' : `${profile.subscription.features.aiQueries} per day`}</li>
                    <li>• Email Summaries: {profile.subscription.features.emailSummaries === -1 ? 'Unlimited' : `Top ${profile.subscription.features.emailSummaries} emails`}</li>
                    <li>• Advanced Search: {profile.subscription.features.advancedSearch ? 'Yes' : 'No'}</li>
                    <li>• OTP Auto-fill: {profile.subscription.features.otpAutoFill ? 'Yes' : 'No'}</li>
                    <li>• Priority Support: {profile.subscription.features.prioritySupport ? 'Yes' : 'No'}</li>
                    <li>• Early Access: {profile.subscription.features.earlyAccess ? 'Yes' : 'No'}</li>
                  </ul>
                </div>

                <div className="mt-6 space-y-2">
                  <Link href="/pricing">
                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Download Extension
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Usage History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 