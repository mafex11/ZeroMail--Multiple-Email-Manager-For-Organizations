import PricingPlans from '@/components/PricingPlans'
import { Mail } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Mail className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-foreground">
              Choose Your Plan
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock the full potential of AI-powered email management. 
                         Start with our free plan and upgrade when you&apos;re ready for more features.
          </p>
        </div>
        
        <PricingPlans />
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6 text-left">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">
                Is my data secure?
              </h3>
              <p className="text-muted-foreground">
                Absolutely. We use industry-standard encryption and only access your emails through official Gmail APIs with your explicit permission.
              </p>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">
                What happens if I cancel?
              </h3>
              <p className="text-muted-foreground">
                                 You can cancel anytime. You&apos;ll continue to have access to paid features until the end of your billing period, then automatically switch to the free plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 