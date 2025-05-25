import { useState } from 'react'
import { XMarkIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline'
import { subscriptionService } from '../utils/subscriptionService'
import { ShimmerButton } from './magicui/shimmer-button'

function PaywallModal({ isOpen, onClose, featureName, isDarkMode }) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleUpgrade = async () => {
    try {
      setLoading(true)
      await subscriptionService.openSubscriptionPage()
      onClose()
    } catch (error) {
      console.error('Error opening subscription page:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    'Unlimited AI email chat',
    'Smart email summaries',
    'Advanced search capabilities',
    'Email analytics & insights',
    'Priority customer support',
    'Early access to new features'
  ]

  const getFeatureTitle = (feature) => {
    switch (feature) {
      case 'email_chat':
        return 'AI Email Assistant'
      case 'email_summaries':
        return 'Smart Email Summaries'
      case 'advanced_search':
        return 'Advanced Search'
      case 'email_analytics':
        return 'Email Analytics'
      default:
        return 'Premium AI Features'
    }
  }

  const getFeatureDescription = (feature) => {
    switch (feature) {
      case 'email_chat':
        return 'Get intelligent assistance with your emails using our advanced AI chat feature.'
      case 'email_summaries':
        return 'Automatically generate concise summaries of your emails to save time.'
      case 'advanced_search':
        return 'Use powerful AI-powered search to find exactly what you\'re looking for.'
      case 'email_analytics':
        return 'Get insights into your email patterns and productivity metrics.'
      default:
        return 'Unlock the full power of AI-enhanced email management.'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
        isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Upgrade to Premium
            </h2>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {getFeatureDescription(featureName)}
            </p>
          </div>

          {/* Feature being accessed */}
          <div className={`p-4 rounded-lg mb-6 border ${
            isDarkMode 
              ? 'bg-blue-500/10 border-blue-500/20' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <h3 className={`font-semibold mb-1 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-700'
            }`}>
              {getFeatureTitle(featureName)}
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-blue-300' : 'text-blue-600'
            }`}>
              This premium feature requires a subscription to access.
            </p>
          </div>

          {/* Features list */}
          <div className="mb-6">
            <h4 className={`font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What you'll get:
            </h4>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className={`text-center mb-6 p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                $9.99
              </span>
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                /month
              </span>
            </div>
            <p className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Cancel anytime • 7-day free trial
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <ShimmerButton
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-3 text-sm font-medium"
              background="rgba(59, 130, 246, 1)"
              shimmerColor="#ffffff"
              shimmerDuration="2s"
            >
              {loading ? 'Opening...' : 'Start Free Trial'}
            </ShimmerButton>
            
            <button
              onClick={onClose}
              className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Maybe later
            </button>
          </div>

          {/* Trust indicators */}
          <div className={`text-center mt-4 text-xs ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            🔒 Secure payment • 💳 Cancel anytime • 🌟 Thousands of happy users
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaywallModal 