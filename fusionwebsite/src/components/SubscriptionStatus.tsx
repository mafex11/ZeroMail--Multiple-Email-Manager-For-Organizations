'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'

interface Subscription {
  planType: string
  isActive: boolean
  endDate?: string
  startDate?: string
}

export default function SubscriptionStatus() {
  const { data: session } = useSession()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchSubscription()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session || loading) {
    return null
  }

  const getPlanBadge = (planType: string, isActive: boolean) => {
    if (!isActive || planType === 'free') {
      return (
        <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-600">
          Free Plan
        </Badge>
      )
    }

    const planConfig = {
      weekly: { label: 'Weekly Plan', className: 'bg-blue-600 text-white' },
      monthly: { label: 'Monthly Plan', className: 'bg-green-600 text-white' },
      lifetime: { label: 'Lifetime Access', className: 'bg-purple-600 text-white' }
    }

    const config = planConfig[planType as keyof typeof planConfig]
    if (!config) return null

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">Plan:</span>
      {getPlanBadge(subscription?.planType || 'free', subscription?.isActive || false)}
    </div>
  )
} 