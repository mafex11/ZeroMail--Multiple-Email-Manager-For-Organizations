'use client'
import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Features = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [visibleFeatures, setVisibleFeatures] = useState<boolean[]>([false, false, false])
  
  const featureRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  
  const aiAgentImages = [
    "/aiagent1.svg",
    "/aiagent2.svg"
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
    <div className='flex flex-col justify-center items-center text-center mx-auto mt-20'>
      <div className='text-white '>
        
        <div 
          ref={featureRefs[0]}
          className={`mt-10 flex flex-col items-center transition-all duration-1000 ease-out ${
            visibleFeatures[0] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}>
          <span className='doto-title text-3xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-center'>
            Mail Summarizer
          </span>
          <p className='text-xl sm:text-xl md:text-3xl lg:text-4xl font-thin mb-10 text-center max-w-4xl mt-2'>
            Fusion generates the email summary for you to quickly go through your emails.
          </p>
          {/* Mobile and tablet image */}
          <img src="/featsummob.png" className='mx-auto lg:hidden' />
          {/* Desktop image */}
          <img src="/featsumm.png" className='mx-auto hidden lg:block lg:w-6xl' />
        </div>

        <div 
          ref={featureRefs[1]}
          className={`flex flex-col items-center mt-20 transition-all duration-1000 ease-out delay-200 ${
            visibleFeatures[1] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <span className='doto-title text-3xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-center'>
            AI Email Agent
          </span>
          <p className='text-xl sm:text-xl md:text-3xl lg:text-4xl font-thin mb-10 text-center max-w-4xl mt-2'>
            Fusion AI is a powerful Agent that helps you to manage your emails.
          </p>
          {/* Mobile and tablet image */}
          <img src="/featagentmob.png" className='mx-auto lg:hidden' />
          {/* Desktop image */}
          <img src="/featagent.png" className='mx-auto hidden lg:block lg:w-6xl' />
        </div>

        <div 
          ref={featureRefs[2]}
          className={`flex flex-col items-center mt-20 transition-all duration-1000 ease-out delay-400 ${
            visibleFeatures[2] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <span className='doto-title text-3xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-center'>
            Autofill OTP
          </span>
          <p className='text-xl sm:text-xl md:text-3xl lg:text-4xl font-thin mb-10 text-center max-w-4xl mt-2'>
            Fusion mail extension detects the OTP and automatically fills it for you.
          </p>
          {/* Mobile and tablet image */}
          <img src="/featotpmob.png" className='mx-auto lg:hidden' />
          {/* Desktop image */}
          <img src="/featotp.png" className='mx-auto hidden lg:block lg:w-6xl' />
        </div>
      </div>
    </div> 
  )
}

export default Features