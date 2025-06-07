'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MailIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"

function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { signup } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const success = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      })

      if (success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError('Failed to create account. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6 text-center", className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white doto-navbar">Account Created!</h1>
          <p className="text-gray-400">
            Your account has been created successfully. Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold text-white doto-navbar">Create Account</h1>
        <p className="text-gray-400 text-sm">
          Join Fusion Mail and revolutionize your email experience
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-red-900/20 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <div className="grid gap-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="firstName" className="text-white text-sm font-medium">
              First Name
            </Label>
            <Input 
              id="firstName" 
              name="firstName"
              type="text" 
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-white focus:ring-white/20"
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName" className="text-white text-sm font-medium">
              Last Name
            </Label>
            <Input 
              id="lastName" 
              name="lastName"
              type="text" 
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-white focus:ring-white/20"
              required 
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="grid gap-3">
          <Label htmlFor="email" className="text-white text-sm font-medium">
            Email Address
          </Label>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-white focus:ring-white/20"
            required 
          />
        </div>

        {/* Password Field */}
        <div className="grid gap-3">
          <Label htmlFor="password" className="text-white text-sm font-medium">
            Password
          </Label>
          <Input 
            id="password" 
            name="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-white focus:ring-white/20"
            required 
          />
        </div>

        {/* Confirm Password Field */}
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">
            Confirm Password
          </Label>
          <Input 
            id="confirmPassword" 
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-white focus:ring-white/20"
            required 
          />
        </div>

        {/* Create Account Button */}
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3 transition-colors"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-sm">
        <span className="text-gray-400">Already have an account? </span>
        <a 
          href="/login" 
          className="text-white hover:text-gray-300 underline underline-offset-4 transition-colors font-medium"
        >
          Sign In
        </a>
      </div>
    </form>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left side - Signup Form */}
        <div className="flex flex-col gap-4 p-6 md:p-10 bg-black">
          {/* Logo/Brand */}
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="/" className="flex items-center gap-2 font-medium text-white hover:opacity-80 transition-opacity">
              <div className="bg-white text-black flex size-8 items-center justify-center rounded-md">
                <MailIcon className="size-5" />
              </div>
              <span className="text-xl font-bold doto-navbar">Fusion Mail</span>
            </a>
          </div>
          
          {/* Form Container */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <SignupForm />
            </div>
          </div>
        </div>

        {/* Right side - Features */}
        <div className="hidden lg:flex bg-gray-900 relative">
          <div className="flex flex-col justify-center items-center p-12 text-center">
            <div className="max-w-md">
              <h2 className="text-4xl font-bold mb-6 doto-navbar">
                Join the Revolution
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Transform your email workflow with AI-powered features designed for modern productivity.
              </p>
              
              {/* Benefits */}
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-gray-300">Start with a free account</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-gray-300">No credit card required</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-gray-300">Upgrade anytime</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-gray-300">Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}