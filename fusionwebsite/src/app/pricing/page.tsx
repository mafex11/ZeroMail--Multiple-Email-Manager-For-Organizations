"use client";
import { CheckIcon, StarIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

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
    badgeColor: "bg-green-500"
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
    badgeColor: "bg-purple-500"
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
    badgeColor: "bg-blue-500"
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
    badgeColor: "bg-gradient-to-r from-yellow-500 to-orange-500"
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="container mx-auto px-6 py-12">
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
                plan.name === "Lifetime Access"
                  ? "border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
                  : plan.popular
                  ? "border-purple-500/50 bg-purple-500/10 transform scale-105"
                  : plan.name === "Monthly Plan"
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-gray-700 bg-gray-900/50"
              }`}
            >
              {/* Badge */}
              {(plan.popular || plan.badge) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className={`px-4 py-1 text-sm font-semibold text-white rounded-full ${plan.badgeColor}`}>
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
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-auto">
                {plan.name === "Lifetime Access" ? (
                  <InteractiveHoverButton className="w-full py-3 text-sm font-semibold">
                    {plan.buttonText}
                  </InteractiveHoverButton>
                ) : plan.popular ? (
                  <Button 
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                ) : plan.name === "Monthly Plan" ? (
                  <Button 
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full py-3 border-gray-600 text-white hover:bg-gray-800 font-semibold"
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">What's included in the free plan?</h3>
                <p className="text-gray-400">
                  The free plan includes 3 daily chat queries, summaries for your top 3 emails, 
                  automatic OTP auto-fill, and basic email management across multiple accounts.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Can I upgrade or downgrade anytime?</h3>
                <p className="text-gray-400">
                  Yes! You can upgrade to any premium plan or cancel your subscription anytime. 
                  Changes take effect immediately or at the end of your current billing period.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Is the lifetime plan really forever?</h3>
                <p className="text-gray-400">
                  Absolutely! Pay once and get lifetime access to all premium features, 
                  including future updates and new features as they're released.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-400">
                  We accept all major credit cards, PayPal, and other secure payment methods 
                  through our encrypted payment processor.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-gray-400">
                  Yes, we offer a 7-day money-back guarantee for all paid plans. 
                  If you're not satisfied, contact us for a full refund.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">How does the AI chat work?</h3>
                <p className="text-gray-400">
                  Our AI understands your emails and can help you manage them efficiently. 
                  Ask questions, get summaries, search for specific content, and more.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30">
          <StarIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Email Experience?</h2>
          <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of users who have already revolutionized their email workflow with Fusion Mail's AI-powered features.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800">
              View Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}