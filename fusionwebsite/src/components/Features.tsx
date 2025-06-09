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

        <div className='text-bold text-center mt-16 sm:mt-24 md:mt-30'>
          <h1 className='doto-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold'>
            AI Email Agent
          </h1>
          <p className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-thin w-full max-w-4xl mx-auto py-2 sm:py-10 px-4'>
            Fusion AI is a powerful Agent that helps you to manage your emails.
          </p>
          
          {/* Image Carousel */}
          <div className='relative w-full max-w-4xl h-full overflow-hidden mx-auto'>
            {/* Navigation Buttons */}
            <Button
              onClick={prevImage}
              disabled={isTransitioning}
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-zinc-800/80 border-zinc-700 text-white hover:bg-zinc-700/90 backdrop-blur-sm z-10 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={nextImage}
              disabled={isTransitioning}
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-zinc-800/80 border-zinc-700 text-white hover:bg-zinc-700/90 backdrop-blur-sm z-10 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div 
              className='flex transition-transform duration-500 ease-in-out'
              style={{
                transform: `translateX(-${currentImageIndex * 100}%)`,
                width: `${aiAgentImages.length * 100}%`
              }}
            >
              {aiAgentImages.map((imageSrc, index) => (
                <div key={index} className='flex-shrink-0'>
                  <img 
                    src={imageSrc} 
                    className='' 
                    alt={`AI Agent ${index + 1}`}
                  />
                </div>
              ))}
              
            </div>
            
            
            
            {/* Image Indicators */}
            <div className='flex justify-center items-center gap-2 mt-4 sm:mt-6'>
              {aiAgentImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  disabled={isTransitioning}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 disabled:cursor-not-allowed ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-zinc-600 hover:bg-zinc-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div> 
  )
}

export default Features