"use client";
import { CheckIcon, StarIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { keyframes } from "motion/react";

const pricingPlans = [
  {
    name: "Free Plan",
    price: "$0",
    period: "/forever",
    description: "Perfect for getting started with email management",
    features: [
      "3 chat queries per day",
      "Summaries for top 3 emails only",
      "Automatic OTP auto-fill",
      "Basic email management",
      "Multiple account support"
    ],
    buttonText: "Get Started Free",
    popular: false,
    href: "#",
    badge: "Free Forever",
    badgeColor: "bg-white text-black"
  },
  {
    name: "Weekly Plan",
    price: "$6.99",
    period: "/week",
    description: "Great for testing premium features short-term",
    features: [
      "20 chat queries per day",
      "Full email content & summaries",
      "Automatic OTP auto-fill",
      "Advanced search",
      "Priority support"
    ],
    buttonText: "Start Weekly Plan",
    popular: true,
    href: "#",
    badge: "Popular",
    badgeColor: "bg-black text-white border border-white"
  },
  {
    name: "Monthly Plan",
    price: "$9.99",
    period: "/month",
    description: "Best value for regular users with unlimited access",
    features: [
      "Unlimited AI chat",
      "Full email content & summaries",
      "Automatic OTP auto-fill",
      "Expanded search & analytics",
      "Priority support",
      "Early access to new features"
    ],
    buttonText: "Start Monthly Plan",
    popular: false,
    href: "#",
    badge: "Best Value",
    badgeColor: "bg-gray-800 text-white"
  },
  {
    name: "Lifetime Access",
    price: "$14.99",
    period: "/lifetime",
    description: "Pay once, use forever - No recurring charges",
    features: [
      "Unlimited AI chat",
      "Full email content & summaries",
      "Automatic OTP auto-fill",
      "All premium features",
      "Lifetime updates",
      "VIP support"
    ],
    buttonText: "Get Lifetime Access",
    popular: false,
    href: "#",
    badge: "Best Deal",
    badgeColor: "bg-white text-black"
  }
];

const faqData = [
  {
    question: "Why isn't FusionMail completely free?",
    answer: "AI models and email processing services cost money to run. To grow FusionMail sustainably without compromising our service quality, we need to cover our operational costs."
  },
  {
    question: "What email providers do you support?",
    answer: "We support all major email providers including Gmail, Outlook, Yahoo Mail, Apple Mail, and more. You can connect multiple accounts from different providers in one dashboard."
  },
  {
    question: "Who owns the emails and data in FusionMail?",
    answer: "You! Regardless of whether you use the free, pro or lifetime version of FusionMail, all your emails and data remain yours. We never claim ownership of your content."
  },
  {
    question: "Where does FusionMail use AI models?",
    answer: "FusionMail uses AI for email summarization, OTP detection, smart categorization, and our AI mail agent. These features help automate and enhance your email management experience."
  },
  {
    question: "How do the plan limits work?",
    answer: "If you go over your limit, we'll nicely ask you to upgrade. Our generous limits are designed to accommodate most users' needs without interruption."
  },
  {
    question: "What email data do you store?",
    answer: "We only store necessary metadata for app functionality. Your actual email content stays with your email provider. We may collect usage analytics to improve the service, but you can opt out anytime."
  },
  {
    question: "What is the OTP auto-detection feature?",
    answer: "This is FusionMail's smart OTP detection that automatically identifies verification codes in your emails and copies them to your clipboard for quick use."
  },
  {
    question: "Do all features work with external email APIs?",
    answer: "Most features work with standard email APIs, but some advanced AI features like smart summarization and OTP detection use our custom processing for better accuracy."
  },
  {
    question: "Is my data secure with FusionMail?",
    answer: "Absolutely! We use enterprise-grade encryption, secure OAuth authentication, and never store your actual email content. Your privacy and security are our top priorities."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time with no questions asked. You'll continue to have access to premium features until the end of your billing period."
  }
];

export default function PricingPage() {
  const { initiatePayment, isLoading } = useRazorpay()
  const { data: session } = useSession()
  const router = useRouter()

  const handlePlanSelect = (planType: string) => {
    if (planType === 'free') {
      // Free plan - just redirect to signup if not logged in
      if (!session) {
        router.push('/signup')
      } else {
        alert('You are already on the free plan!')
      }
      return
    }

    if (!session) {
      router.push('/login')
      return
    }

    // Map plan names to payment types
    const planTypeMap: { [key: string]: 'weekly' | 'monthly' | 'lifetime' } = {
      'Weekly Plan': 'weekly',
      'Monthly Plan': 'monthly',
      'One time payment': 'lifetime'
    }

const paymentPlanType = planTypeMap[planType]
    if (paymentPlanType) {
      initiatePayment({
        planType: paymentPlanType,
        onSuccess: () => {
          console.log('Payment successful!')
        },
        onError: (error) => {
          console.error('Payment failed:', error)
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="container mx-auto px-6 py-60">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 doto-navbar">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Supercharge your email experience with AI-powered features. 
            From basic management to advanced analytics, we have the perfect plan for you.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "border-white bg-gray-900/80 transform scale-105 shadow-2xl shadow-white/10"
                  : "border-gray-700 bg-gray-900/50 hover:border-gray-500"
              }`}
            >
              {/* Badge */}
              {(plan.popular || plan.badge) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className={`px-4 py-1 text-sm font-semibold rounded-full ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm">
                    <CheckIcon className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-auto">
                {plan.popular ? (
                  <Button 
                    className="w-full py-3 bg-white text-black hover:bg-gray-200 font-semibold transition-all duration-200"
                    size="lg"
                    onClick={() => handlePlanSelect(plan.name)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : plan.buttonText}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full py-3 border-white text-white hover:bg-white hover:text-black font-semibold transition-all duration-200"
                    size="lg"
                    onClick={() => handlePlanSelect(plan.name)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : plan.buttonText}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Bento Grid Section */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 doto-navbar">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {faqData.slice(0, 8).map((faq, index) => (
              <div
                key={index}
                className={`
                  relative p-6 rounded-2xl bg-gray-900/50 border border-gray-700 
                  hover:border-gray-500 transition-all duration-300 group
                  ${index === 0 ? 'lg:col-span-1' : ''}
                  ${index === 1 ? 'lg:col-span-1' : ''}
                  ${index === 2 ? 'lg:col-span-1' : ''}
                  ${index === 3 ? 'lg:col-span-1' : ''}
                  ${index === 4 ? 'lg:col-span-1' : ''}
                  ${index === 5 ? 'lg:col-span-1' : ''}
                  ${index === 6 ? 'lg:col-span-2' : ''}
                  ${index === 7 ? 'lg:col-span-1' : ''}
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-4 text-white group-hover:text-gray-100 transition-colors">
                    {faq.question}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-gray-900/50 border border-gray-700">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <StarIcon className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Email Experience?</h2>
          <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of users who have already revolutionized their email workflow with Fusion Mail's AI-powered features.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-200"
              onClick={() => handlePlanSelect('Free Plan')}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Start Free Trial'}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-black"
              onClick={() => router.push('/')}
            >
              View Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}