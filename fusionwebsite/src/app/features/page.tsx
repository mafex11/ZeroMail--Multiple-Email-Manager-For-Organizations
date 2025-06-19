'use client'
import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronLeft, Mail, Shield, Search, Users, Bell, Globe, Zap, Database, Lock, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Features = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [visibleFeatures, setVisibleFeatures] = useState<boolean[]>([false, false, false, false])
  
  const featureRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  
  const aiAgentImages = [
    "/aiagent1.svg",
    "/aiagent2.svg"
  ]

  // Additional features data
  const additionalFeatures = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multiple Account Management",
      description: "Connect and manage multiple email accounts from different providers in one unified dashboard. Support for Gmail, Outlook, Yahoo Mail, Apple Mail, and more."
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Advanced Search & Analytics",
      description: "Powerful search capabilities with smart filters and detailed analytics to track your email patterns and productivity metrics."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Cross-Platform Support",
      description: "Works seamlessly across all major browsers including Chrome, Firefox, Safari, and Edge. Available as a browser extension for easy access."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Smart Categorization",
      description: "AI-powered email categorization that automatically sorts your emails into relevant folders and labels for better organization."
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Easy Notifications",
      description: "Smart notification system that alerts you only about important emails, reducing noise and helping you stay focused."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Priority Support",
      description: "Get faster response times and dedicated assistance from our support team with premium plans."
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Data Security",
      description: "Enterprise-grade encryption ensures your email data remains secure. We never store your actual email content."
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Privacy First",
      description: "Your emails and data remain yours. We respect your privacy and never claim ownership of your content."
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "VIP Support",
      description: "Premium users get access to VIP support with faster response times and priority assistance."
    }
  ]

  useEffect(() => {
    const observers = featureRefs.map((ref, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleFeatures(prev => {
              const newState = [...prev]
              newState[index] = true
              return newState
            })
          }
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -100px 0px'
        }
      )

      if (ref.current) {
        observer.observe(ref.current)
      }

      return observer
    })

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [])

  const nextImage = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentImageIndex((prevIndex) => 
      prevIndex === aiAgentImages.length - 1 ? 0 : prevIndex + 1
    )
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const prevImage = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? aiAgentImages.length - 1 : prevIndex - 1
    )
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToImage = (index: number) => {
    if (isTransitioning || index === currentImageIndex) return
    setIsTransitioning(true)
    setCurrentImageIndex(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  return (
    <div className=' bg-zinc-950 min-h-screen flex flex-col justify-center items-center text-center mx-auto'>
      <div className='text-white mt-50 '>
      <span className=' doto-title font-semibold text-3xl sm:text-3xl md:text-5xl lg:text-7xl text-center'>
      Features
      </span>
      <span className='font-thin text-3xl sm:text-md md:text-lg lg:text-2xl text-center mt-4'>
        <br />
        Discover the Power of Fusion Mail
      </span>
      
      <div className='flex justify-center mt-8'>
        <Button 
          className="bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-white text-black font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
          onClick={() => window.location.href = '/pricing'}
        >
          Get Started Now
        </Button>
      </div>
        
        <div 
          ref={featureRefs[0]}
          className={`mt-10 flex flex-col items-center transition-all duration-1000 ease-out ${
            visibleFeatures[0] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
          <span className='text-3xl sm:text-3xl md:text-5xl lg:text-5xl font-semibold text-center'>
            Mail Summarizer
          </span>
          <p className='text-xl sm:text-xl md:text-3xl lg:text-2xl font-thin mb-10 text-center max-w-4xl mt-2'>
            Fusion generates the email summary for you to quickly go through your emails.
          </p>
          {/* Mobile and tablet image */}
          <img src="/featsummob.png" className='mx-auto lg:hidden' />
          {/* Desktop image */}
          <img src="/featsumm.png" className='mx-auto hidden lg:block lg:w-7xl' />
        </div>

        <div 
          ref={featureRefs[1]}
          className={`flex flex-col items-center mt-20 transition-all duration-1000 ease-out delay-200 ${
            visibleFeatures[1] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <span className='text-3xl sm:text-3xl md:text-5xl lg:text-5xl font-semibold text-center'>
            AI Email Agent
          </span>
          <p className='text-xl sm:text-xl md:text-3xl lg:text-2xl font-thin mb-10 text-center max-w-4xl mt-2'>
            Fusion AI is a powerful Agent that helps you to manage your emails.
          </p>
          {/* Mobile and tablet image */}
          <img src="/featagentmob.png" className='mx-auto lg:hidden' />
          {/* Desktop image */}
          <img src="/featagent.png" className='mx-auto hidden lg:block lg:w-7xl' />
        </div>

        <div 
          ref={featureRefs[2]}
          className={`flex flex-col items-center mt-20 transition-all duration-1000 ease-out delay-400 ${
            visibleFeatures[2] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <span className='text-3xl sm:text-3xl md:text-5xl lg:text-5xl font-semibold text-center'>
            Autofill OTP
          </span>
          <p className='text-xl sm:text-xl md:text-3xl lg:text-2xl font-thin mb-10 text-center max-w-4xl mt-2'>
            Fusion mail extension detects the OTP and automatically fills it for you.
          </p>
          {/* Mobile and tablet image */}
          <img src="/featotpmob.png" className='mx-auto lg:hidden' />
          {/* Desktop image */}
          <img src="/featotp.png" className='mx-auto hidden lg:block lg:w-7xl' />
        </div>

        {/* Additional Features Section */}
        <div 
          ref={featureRefs[3]}
          className={`mt-32 mb-20 transition-all duration-1000 ease-out delay-600 ${
            visibleFeatures[3] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className='text-center mb-16'>
            <span className='doto-title text-3xl sm:text-3xl md:text-5xl lg:text-5xl font-bold text-center'>
              Additional Features
            </span>
            <p className='text-xl sm:text-xl md:text-2xl lg:text-xl font-thin mt-4 text-center max-w-4xl mx-auto'>
              Explore more powerful features that make Fusion Mail your ultimate email companion
            </p>
          </div>

          <div className='max-w-7xl mx-auto px-6 mb-30'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {additionalFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className='group relative p-6 rounded-2xl bg-zinc-900/50 border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:bg-zinc-900/80 hover:scale-105'
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className='relative z-10'>
                    <div className='text-white mb-4 flex justify-center'>
                      {feature.icon}
                    </div>
                    <h3 className='text-xl font-semibold text-white mb-3 text-center group-hover:text-white transition-colors'>
                      {feature.title}
                    </h3>
                    <p className='text-gray-300 text-sm leading-relaxed text-center group-hover:text-gray-100 transition-colors'>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div> 
  )
}

export default Features