import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PricingPlans from '@/components/PricingPlans'
import { Mail, Sparkles, Search, Shield, Zap, Users } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <Mail className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-5xl font-bold text-foreground">
              Fusion Mail
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your Gmail experience with AI-powered summaries, smart search, 
            and intelligent automation. Manage multiple accounts effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started Free
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Powerful Features for Modern Email Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of email with our AI-powered Chrome extension
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Sparkles className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>AI-Powered Summaries</CardTitle>
                <CardDescription>
                  Get instant, intelligent summaries of your emails to quickly understand what matters most
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Smart Search & Analytics</CardTitle>
                <CardDescription>
                  Advanced search capabilities with analytics to help you find and organize emails efficiently
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>OTP Auto-Fill</CardTitle>
                <CardDescription>
                  Automatically detect and fill OTP codes from your emails for seamless authentication
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-600 mb-2" />
                <CardTitle>Multi-Account Support</CardTitle>
                <CardDescription>
                  Manage multiple Gmail accounts from a single interface with easy account switching
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>AI Chat Assistant</CardTitle>
                <CardDescription>
                  Chat with AI about your emails, get insights, and automate common email tasks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Gmail Integration</CardTitle>
                <CardDescription>
                  Seamlessly integrates with Gmail using official APIs for secure and reliable access
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl">
          <PricingPlans />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Email Experience?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have already upgraded their Gmail workflow with Fusion Mail
          </p>
          <Link href="/pricing">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Mail className="h-6 w-6 text-blue-400 mr-2" />
                <span className="text-lg font-bold">Fusion Mail</span>
              </div>
              <p className="text-gray-400">
                AI-powered email management for the modern professional
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Fusion Mail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
