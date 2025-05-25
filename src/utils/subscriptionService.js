class SubscriptionService {
  constructor() {
    this.apiBaseUrl = 'https://your-backend-api.com' // Replace with your actual API
    this.subscriptionCache = null
    this.cacheExpiry = null
  }

  // Check if user has active subscription
  async hasActiveSubscription() {
    try {
      // Check cache first (valid for 5 minutes)
      if (this.subscriptionCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
        return this.subscriptionCache.isActive
      }

      // Get user ID (from Google OAuth or your auth system)
      const userId = await this.getUserId()
      if (!userId) {
        return false
      }

      // Check with your backend API
      const response = await fetch(`${this.apiBaseUrl}/api/subscription/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Failed to check subscription status')
        return false
      }

      const subscriptionData = await response.json()
      
      // Cache the result for 5 minutes
      this.subscriptionCache = subscriptionData
      this.cacheExpiry = Date.now() + (5 * 60 * 1000)

      return subscriptionData.isActive
    } catch (error) {
      console.error('Error checking subscription:', error)
      return false
    }
  }

  // Get subscription details
  async getSubscriptionDetails() {
    try {
      const userId = await this.getUserId()
      if (!userId) return null

      const response = await fetch(`${this.apiBaseUrl}/api/subscription/details`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) return null

      return await response.json()
    } catch (error) {
      console.error('Error getting subscription details:', error)
      return null
    }
  }

  // Create checkout session for subscription
  async createCheckoutSession(priceId = 'price_ai_features_monthly') {
    try {
      const userId = await this.getUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }

      const response = await fetch(`${this.apiBaseUrl}/api/subscription/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl: chrome.runtime.getURL('success.html'),
          cancelUrl: chrome.runtime.getURL('cancel.html')
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      return checkoutUrl
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  // Open subscription page
  async openSubscriptionPage() {
    try {
      const checkoutUrl = await this.createCheckoutSession()
      chrome.tabs.create({ url: checkoutUrl })
    } catch (error) {
      console.error('Error opening subscription page:', error)
      // Fallback to a general pricing page
      chrome.tabs.create({ url: `${this.apiBaseUrl}/pricing` })
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      // Clear cache
      this.subscriptionCache = null
      this.cacheExpiry = null

      return await response.json()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  // Helper methods
  async getUserId() {
    try {
      // Get from Chrome storage or Google OAuth
      const result = await chrome.storage.local.get(['accounts'])
      const accounts = result.accounts || []
      
      if (accounts.length > 0) {
        // Use the first account's email as user ID
        return accounts[0].email
      }
      
      return null
    } catch (error) {
      console.error('Error getting user ID:', error)
      return null
    }
  }

  async getAuthToken() {
    try {
      // Get from Chrome storage
      const result = await chrome.storage.local.get(['accounts'])
      const accounts = result.accounts || []
      
      if (accounts.length > 0) {
        return accounts[0].accessToken
      }
      
      return null
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  // Clear subscription cache (call when user logs out)
  clearCache() {
    this.subscriptionCache = null
    this.cacheExpiry = null
  }

  // Check if specific AI feature is available
  async canUseAIFeature(featureName) {
    const hasSubscription = await this.hasActiveSubscription()
    
    // Define which features require subscription
    const premiumFeatures = [
      'email_chat',
      'email_summaries', 
      'advanced_search',
      'email_analytics'
    ]

    // Allow free tier for basic features
    const freeFeatures = [
      'basic_search',
      'email_organization'
    ]

    if (freeFeatures.includes(featureName)) {
      return true
    }

    if (premiumFeatures.includes(featureName)) {
      return hasSubscription
    }

    // Default to requiring subscription for unknown features
    return hasSubscription
  }

  // Get usage limits for free tier
  async getUsageLimits() {
    const hasSubscription = await this.hasActiveSubscription()
    
    if (hasSubscription) {
      return {
        aiQueries: -1, // Unlimited
        emailSummaries: -1, // Unlimited - full content & summaries
        advancedSearches: -1 // Unlimited
      }
    }

    return {
      aiQueries: 3, // 3 per day
      emailSummaries: 3, // Only top 3 emails get summaries
      advancedSearches: 3 // 3 per day
    }
  }

  // Track usage for free tier limits
  async trackUsage(featureName) {
    try {
      const today = new Date().toDateString()
      const storageKey = `usage_${today}`
      
      const result = await chrome.storage.local.get([storageKey])
      const usage = result[storageKey] || {}
      
      usage[featureName] = (usage[featureName] || 0) + 1
      
      await chrome.storage.local.set({ [storageKey]: usage })
      
      return usage[featureName]
    } catch (error) {
      console.error('Error tracking usage:', error)
      return 0
    }
  }

  // Check if user has exceeded free tier limits
  async hasExceededLimit(featureName) {
    const hasSubscription = await this.hasActiveSubscription()
    if (hasSubscription) return false

    const limits = await this.getUsageLimits()
    const limit = limits[featureName]
    
    if (limit === -1) return false // Unlimited

    const today = new Date().toDateString()
    const storageKey = `usage_${today}`
    
    const result = await chrome.storage.local.get([storageKey])
    const usage = result[storageKey] || {}
    
    return (usage[featureName] || 0) >= limit
  }

  // Check if email should show summary or full content
  async shouldShowEmailSummary(emailIndex) {
    const hasSubscription = await this.hasActiveSubscription()
    
    // Paid users get full content for all emails
    if (hasSubscription) {
      return false // Show full content
    }
    
    // Free users only get summaries for top 3 emails (index 0, 1, 2)
    return emailIndex < 3
  }

  // Check if email should show full content
  async shouldShowEmailContent(emailIndex) {
    const hasSubscription = await this.hasActiveSubscription()
    
    // Paid users get full content for all emails
    if (hasSubscription) {
      return true
    }
    
    // Free users get full content for emails beyond top 3
    return emailIndex >= 3
  }
}

export const subscriptionService = new SubscriptionService() 