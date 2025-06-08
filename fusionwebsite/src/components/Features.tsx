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
        <div className='text-bold text-center mt-30'>
          <h1 className='doto-title text-7xl'>
            Mail Summarizer
          </h1>
          <p className='text-4xl font-thin w-full mx-auto p-10'>
            Fusion generates the email summary for you to quickly go through your emails.
          </p>
          <img src="/featsumm.svg" className=' w-4xl h-full mx-auto' />
        </div>

        <div className='text-bold text-center mt-30'>
          <h1 className='doto-title text-7xl'>
            AI Email Agent
          </h1>
          <p className='text-4xl font-thin w-full mx-auto p-10'>
            Fusion AI is a powerful Agent that helps you to manage your emails.
          </p>
          
          {/* Image Carousel */}
          <div className='relative w-4xl h-full overflow-hidden mx-auto'>
            <div 
              className='flex transition-transform duration-500 ease-in-out'
              style={{
                transform: `translateX(-${currentImageIndex * 100}%)`,
                width: `${aiAgentImages.length * 100}%`
              }}
            >
              {aiAgentImages.map((imageSrc, index) => (
                <div key={index} className='w-full flex-shrink-0'>
                  <img 
                    src={imageSrc} 
                    className='w-4xl h-full object-contain' 
                    alt={`AI Agent ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            
            {/* Left Navigation Button */}
            <Button
              onClick={prevImage}
              disabled={isTransitioning}
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-zinc-800/80 border-zinc-700 text-white hover:bg-zinc-700/90 backdrop-blur-sm z-10 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Right Navigation Button */}
            <Button
              onClick={nextImage}
              disabled={isTransitioning}
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-zinc-800/80 border-zinc-700 text-white hover:bg-zinc-700/90 backdrop-blur-sm z-10 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Image Indicators - Keep below the image */}
            <div className='flex justify-center items-center gap-2 mt-6'>
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