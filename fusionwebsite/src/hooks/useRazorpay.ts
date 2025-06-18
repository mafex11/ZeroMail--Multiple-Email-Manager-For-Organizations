import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PaymentOptions {
  planType: 'weekly' | 'monthly' | 'lifetime'
  onSuccess?: () => void
  onError?: (error: any) => void
}

export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const initiatePayment = async ({ planType, onSuccess, onError }: PaymentOptions) => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    setIsLoading(true)

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script')
      }

      // Create order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order')
      }

      const orderData = await orderResponse.json()

      // Configure Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Fusion Mail',
        description: `${orderData.planName} Subscription`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType,
                isMockOrder: orderData.isMockOrder,
                amount: orderData.amount,
                currency: orderData.currency,
                planName: orderData.planName
              }),
            })

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json()
              onSuccess?.()
              
              // Show success message or redirect
              alert(`Payment successful! Your ${orderData.planName} is now active.`)
              
              // Refresh the page to update user session
              window.location.reload()
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            onError?.(error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: session.user.name || '',
          email: session.user.email || '',
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
          }
        }
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Payment initiation error:', error)
      onError?.(error)
      alert('Failed to initiate payment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    initiatePayment,
    isLoading
  }
} 