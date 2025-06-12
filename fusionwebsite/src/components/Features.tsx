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
    <div className='flex justify-center items-center text-center mx-auto'>
      <div className='text-white'>
        <div className='mt-10 px-6'>
          <span className='doto-title text-3xl sm:text-3xl md:text-5xl lg:text-7xl font-bold'>
            Mail Summarizer
          </span>
          <p className='text-xl sm:text-xl md:text-3xl lg:text-4xl font-thin mb-10 '>
            Fusion generates the email summary for you to quickly go through your emails.
          </p>
          <img src="/featsumm.svg" className=' mx-auto lg:w-6xl md:w-3xl sm:w-2xl' />
        </div>

        <div className='mt-10 px-6'>
          <span className='doto-title text-3xl sm:text-3xl md:text-5xl lg:text-7xl font-bold'>
          AI Email Agent
          </span>
          <p className='text-xl sm:text-xl md:text-3xl lg:text-4xl font-thin mb-10 '>
          Fusion AI is a powerful Agent that helps you to manage your emails.
          </p>
          <img src="/featagent.svg" className=' mx-auto lg:w-6xl md:w-3xl sm:w-2xl' />
        </div>

        <div className='mt-10 px-6'>
          <span className='doto-title text-3xl sm:text-3xl md:text-5xl lg:text-7xl font-bold'>
          Autofill OTP
          </span>
          <p className='text-xl sm:text-xl md:text-3xl lg:text-4xl font-thin mb-10 '>
          Fusion mail extension detects the OTP and automatically fills it for you.
          </p>
          <img src="/featotp.svg"  className=' mx-auto lg:w-6xl md:w-3xl sm:w-2xl' />
        </div>
      </div>
    </div> 
  )
}

export default Features