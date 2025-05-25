'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Sparkles, Crown, Infinity } from 'lucide-react'
import { toast } from 'sonner'

declare global {
  interface Window {
    Razorpay: {
      new (options: {
        key: string
        amount: number
        currency: string
        name: string
        description: string
        order_id: string
        handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void
        prefill: { name?: string; email?: string }
        theme: { color: string }
        modal: { ondismiss: () => void }
      }): { open: () => void }
    }
  }
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for trying out Fusion Mail',
    features: [
      '3 AI chat queries per day',
      'Summaries for top 3 emails only',
      'OTP auto-fill',
      'Basic email management'
    ],
    buttonText: 'Current Plan',
    popular: false,
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    id: 'weekly',
    name: 'Weekly',
    price: '₹6.99',
    period: 'per week',
    description: 'Great for regular users',
    features: [
      '20 AI chat queries per day',
      'Full email content & summaries',
      'Expanded search & analytics',
      'OTP auto-fill',
      'Priority support'
    ],
    buttonText: 'Choose Weekly',
    popular: false,
    icon: <Check className="h-5 w-5" />
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '₹9.99',
    period: 'per month',
    description: 'Most popular choice',
    features: [
      'Unlimited AI chat',
      'Full email content & summaries',
      'Expanded search & analytics',
      'OTP auto-fill',
      'Priority support',
      'Early access to new features'
    ],
    buttonText: 'Choose Monthly',
    popular: true,
    icon: <Crown className="h-5 w-5" />
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '₹14.99',
    period: 'one-time',
    description: 'Best value for power users',
    features: [
      'Unlimited AI chat',
      'Full email content & summaries',
      'Expanded search & analytics',
      'OTP auto-fill',
      'Priority support',
      'Early access to new features',
      'Lifetime updates'
    ],
    buttonText: 'Choose Lifetime',
    popular: false,
    icon: <Infinity className="h-5 w-5" />
  }
]

export default function PricingPlans() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      toast.error('Please sign in to subscribe')
      return
    }

    if (planId === 'free') {
      toast.info('You are already on the free plan')
      return
    }

    setLoading(planId)

    try {
      // Create order
      const response = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId }),
      })

      const orderData = await response.json()

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount as number,
        currency: orderData.currency as string,
        name: 'Fusion Mail',
        description: `${plans.find(p => p.id === planId)?.name} Plan Subscription`,
        order_id: orderData.orderId as string,
                 handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/subscription/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planId,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok) {
              toast.success('Payment successful! Your subscription is now active.')
              // Refresh the page to update subscription status
              window.location.reload()
            } else {
              throw new Error(verifyData.error || 'Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: session.user?.name || '',
          email: session.user?.email || '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function () {
            setLoading(null)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Subscription error:', error)
      toast.error('Failed to initiate payment. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of AI-powered email management with our flexible pricing plans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular
                ? 'border-blue-500 shadow-lg scale-105'
                : 'border-border'
            } ${plan.id === 'lifetime' ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
            )}

            {plan.id === 'lifetime' && (
              <div className="absolute -top-3 right-3">
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Best Value
                </span>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-2">
                {plan.icon}
                <CardTitle className="ml-2">{plan.name}</CardTitle>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground ml-1">/{plan.period}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id || plan.id === 'free'}
              >
                {loading === plan.id ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  plan.buttonText
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
    </div>
  )
} 