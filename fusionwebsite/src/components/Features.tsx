'use client'
import React, { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Features = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const aiAgentImages = [
    "/aiagent1.svg",
    "/aiagent2.svg"
  ]

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
    <div className='flex justify-center items-center text-center mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='text-white w-full'>
        <div className='text-bold text-center mt-10 sm:mt-20'>
          <span className='doto-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold'>
            Mail Summarizer
          </span>
          <p className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-thin w-full max-w-4xl mx-auto py-2 sm:py-10 px-4'>
            Fusion generates the email summary for you to quickly go through your emails.
          </p>
          <img 
            src="/featsumm.svg" 
            className='w-full max-w-[90%] sm:max-w-4xl h-auto mx-auto' 
            alt="Mail Summarizer Feature"
          />
        </div>

        <div className='text-bold text-center mt-10 sm:mt-20'>
          <span className='doto-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold'>
          AI Email Agent
          </span>
          <p className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-thin w-full max-w-4xl mx-auto py-2 sm:py-10 px-4'>
          Fusion AI is a powerful Agent that helps you to manage your emails.          </p>
          <img 
            src="/aiagent1.svg" 
            className='w-full max-w-[90%] sm:max-w-4xl h-auto mx-auto' 
            alt="Mail Summarizer Feature"
          />
        </div>

        <div className='text-bold text-center mt-10 sm:mt-20'>
          <span className='doto-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold'>
          Autofill OTP
          </span>
          <p className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-thin w-full max-w-4xl mx-auto py-2 sm:py-10 px-4'>
          Fusion mail extension detects the OTP and automatically fills it for you.          </p>
          <img 
            src="/otp.svg" 
            className='w-full max-w-[90%] sm:max-w-4xl h-auto mx-auto' 
            alt="Mail Summarizer Feature"
          />
        </div>

         
          
      
      </div>
    </div> 
  )
}

export default Features