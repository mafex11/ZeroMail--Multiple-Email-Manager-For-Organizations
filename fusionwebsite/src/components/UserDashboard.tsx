'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CalendarIcon, CreditCardIcon, UserIcon, CheckCircleIcon } from 'lucide-react'

interface PaymentData {
  user: any
  payments: {
    history: any[]
    statistics: {
      totalPayments: number
      totalAmountSpent: number
      currency: string
    }
  }
  subscriptions: {
    current: any
    history: any[]
    statistics: {
      totalSubscriptions: number
      activeSubscription: boolean
    }
  }
}

export default function UserDashboard() {
  const { data: session } = useSession()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchPaymentData()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchPaymentData = async () => {
    try {
      const response = await fetch('/api/user/payments')
      if (response.ok) {
        const data = await response.json()
        setPaymentData(data)
      }
    } catch (error) {
      console.error('Failed to fetch payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount / 100) // Convert from paise to rupees
  }

  const getPlanBadgeColor = (planType: string) => {
    const colors = {
      'free': 'bg-gray-500',
      'weekly': 'bg-blue-500',
      'monthly': 'bg-green-500',
      'lifetime': 'bg-purple-500'
    }
    return colors[planType as keyof typeof colors] || 'bg-gray-500'
  }

  if (!session || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Failed to load dashboard data</div>
      </div>
    )
  }

  const { user, payments, subscriptions } = paymentData

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Account Dashboard</h1>
        <p className="text-gray-400">Manage your subscription and view payment history</p>
      </div>

      {/* Current Subscription Card */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <UserIcon className="w-5 h-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.current ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={`${getPlanBadgeColor(subscriptions.current.planType)} text-white`}>
                    {subscriptions.current.planName}
                  </Badge>
                  <p className="text-gray-400 mt-1">
                    Active since {formatDate(subscriptions.current.startDate)}
                  </p>
                  {subscriptions.current.endDate && (
                    <p className="text-gray-400">
                      Expires on {formatDate(subscriptions.current.endDate)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(subscriptions.current.amount, subscriptions.current.currency)}
                  </p>
                  <p className="text-gray-400">Total paid</p>
                </div>
              </div>
              
              <Separator className="bg-gray-700" />
              
              <div>
                <h4 className="font-semibold text-white mb-2">Plan Features:</h4>
                <ul className="space-y-1">
                  {subscriptions.current.features?.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300">
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-600">
                Free Plan
              </Badge>
              <p className="text-gray-400 mt-2">You're currently on the free plan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{payments.statistics.totalPayments}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(payments.statistics.totalAmountSpent, payments.statistics.currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{subscriptions.statistics.totalSubscriptions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      {payments.history.length > 0 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CreditCardIcon className="w-5 h-5" />
              Payment History
            </CardTitle>
            <CardDescription>Your recent payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.history.map((payment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <CreditCardIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{payment.planName}</p>
                      <p className="text-sm text-gray-400">
                        {formatDate(payment.paymentDate)} • {payment.razorpayPaymentId}
                      </p>
                      {payment.isTestPayment && (
                        <Badge variant="outline" className="mt-1 text-xs">Test Payment</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <Badge 
                      className={`mt-1 ${
                        payment.paymentStatus === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                      } text-white`}
                    >
                      {payment.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription History */}
      {subscriptions.history.length > 1 && (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CalendarIcon className="w-5 h-5" />
              Subscription History
            </CardTitle>
            <CardDescription>Your past subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.history.slice(1).map((subscription: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-800">
                  <div>
                    <Badge className={`${getPlanBadgeColor(subscription.planType)} text-white`}>
                      {subscription.planName}
                    </Badge>
                    <p className="text-sm text-gray-400 mt-1">
                      {formatDate(subscription.startDate)} - {subscription.endDate ? formatDate(subscription.endDate) : 'Lifetime'}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      subscription.status === 'active' ? 'border-green-500 text-green-500' : 'border-gray-500 text-gray-400'
                    }`}
                  >
                    {subscription.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 