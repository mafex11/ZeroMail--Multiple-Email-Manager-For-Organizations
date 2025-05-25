import { useState, useEffect, memo, useCallback } from 'react'
import { KeyIcon, ClipboardDocumentIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { otpService } from '../utils/otpService'

function OTPIndicator({ isDarkMode = true }) {
  const [recentOTPs, setRecentOTPs] = useState([])
  const [copiedOTP, setCopiedOTP] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Initial load
    const otps = otpService.getRecentOTPs()
    setRecentOTPs(otps)
    
    // Check for recent OTPs every 5 seconds (reduced from 1 second)
    const interval = setInterval(() => {
      const otps = otpService.getRecentOTPs()
      // Only update if there are actual changes
      setRecentOTPs(prevOTPs => {
        if (JSON.stringify(prevOTPs) !== JSON.stringify(otps)) {
          return otps
        }
        return prevOTPs
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleCopyOTP = useCallback(async (otpCode) => {
    try {
      await otpService.manuallyHandleOTP(otpCode)
      setCopiedOTP(otpCode)
      setTimeout(() => setCopiedOTP(null), 2000)
    } catch (error) {
      console.error('Error handling OTP:', error)
    }
  }, [])

  const formatTimeAgo = (timestamp) => {
    return "Will disappear in 2 minutes"
  }

  if (recentOTPs.length === 0) return null

  return (
    <div className={` rounded-lg border transition-all duration-300 ${
      isCollapsed ? 'p-2' : 'p-3'
    } ${
      isDarkMode 
        ? 'bg-blue-900/20 border-blue-700/30 text-blue-200' 
        : 'bg-blue-50 border-blue-200 text-blue-800'
    }`}>
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`flex items-center justify-between w-full hover:opacity-80 transition-opacity ${
          isCollapsed ? 'mb-0' : 'mb-2'
        }`}
      >
        <div className="flex items-center gap-2">
          <KeyIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            {recentOTPs.length === 1 ? 'OTP Code Detected' : `${recentOTPs.length} OTP Codes Detected`}
          </span>
        </div>
        {isCollapsed ? (
          <ChevronDownIcon className="h-4 w-4 transition-transform duration-200" />
        ) : (
          <ChevronUpIcon className="h-4 w-4 transition-transform duration-200" />
        )}
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
      }`}>
        <div className="space-y-2 pt-2">
          {recentOTPs.slice(0, 3).map((otp, index) => {
            const secondsElapsed = Math.floor((Date.now() - otp.timestamp) / 1000)
            const isExpiringSoon = secondsElapsed > 90 // Last 30 seconds
            
            return (
              <div 
                key={otp.code + otp.timestamp}
                className={`flex items-center justify-between p-2 rounded transition-colors ${
                  isExpiringSoon
                    ? isDarkMode 
                      ? 'bg-red-900/30 border border-red-700/50' 
                      : 'bg-red-50 border border-red-200'
                    : isDarkMode 
                      ? 'bg-blue-800/30' 
                      : 'bg-blue-100'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center ">
                    <code className={`doto-title text-lg font-bold ${
                      isDarkMode ? 'text-blue-100' : 'text-blue-900'
                    }`}>
                      {otp.code}
                    </code>
                    <span className={`text-xs ml-2 px-1 py-1 rounded ${
                      isDarkMode ? 'bg-blue-700/50 text-blue-200' : 'bg-blue-200 text-blue-700'
                    }`}>
                      {Math.round(otp.confidence)}% confidence
                    </span>
                  </div>
                  <div className={`text-xs truncate ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-600'
                  }`}>
                    {formatTimeAgo(otp.timestamp)}
                  </div>
                </div>
                
                <button
                  onClick={() => handleCopyOTP(otp.code)}
                  className={`ml-2 p-2 rounded-full transition-colors ${
                    copiedOTP === otp.code
                      ? isDarkMode
                        ? 'bg-green-700 text-green-100'
                        : 'bg-green-500 text-white'
                      : isDarkMode
                        ? 'bg-blue-700 hover:bg-blue-600 text-blue-100'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  title={copiedOTP === otp.code ? 'Copied!' : 'Copy/Autofill OTP'}
                >
                  {copiedOTP === otp.code ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            )
          })}
          
          {recentOTPs.length > 3 && (
            <div className={`text-xs mt-2 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-600'
            }`}>
              +{recentOTPs.length - 3} more OTP codes available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(OTPIndicator) 