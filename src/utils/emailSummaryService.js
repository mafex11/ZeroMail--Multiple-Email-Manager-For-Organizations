// Email Summary Service using DeepSeek API with persistent caching
export class EmailSummaryService {
  constructor() {
    this.apiKey = 'sk-7b936c669e244234ae536eddf9281dfa'
    this.baseUrl = 'https://api.deepseek.com/chat/completions'
    this.model = 'deepseek-chat' // Cheapest model
    this.summaryCache = new Map() // In-memory cache
    this.persistentCacheKey = 'email_summaries_cache' // Chrome storage key
    this.processedEmailsKey = 'processed_emails_set' // Track processed emails
    this.isInitialized = false
  }

  // Initialize the service by loading cached data
  async initialize() {
    if (this.isInitialized) return
    
    try {
      // Load cached summaries from Chrome storage
      const result = await chrome.storage.local.get([this.persistentCacheKey, this.processedEmailsKey])
      
      if (result[this.persistentCacheKey]) {
        // Convert stored object back to Map
        const cachedData = result[this.persistentCacheKey]
        this.summaryCache = new Map(Object.entries(cachedData))
        console.log(`Loaded ${this.summaryCache.size} cached summaries from storage`)
      }
      
      if (result[this.processedEmailsKey]) {
        this.processedEmails = new Set(result[this.processedEmailsKey])
        console.log(`Loaded ${this.processedEmails.size} processed email IDs from storage`)
      } else {
        this.processedEmails = new Set()
      }
      
      this.isInitialized = true
    } catch (error) {
      console.error('Error initializing email summary service:', error)
      this.summaryCache = new Map()
      this.processedEmails = new Set()
      this.isInitialized = true
    }
  }

  // Save cache to Chrome storage
  async saveCacheToStorage() {
    try {
      // Convert Map to object for storage
      const cacheObject = Object.fromEntries(this.summaryCache)
      const processedArray = Array.from(this.processedEmails)
      
      await chrome.storage.local.set({
        [this.persistentCacheKey]: cacheObject,
        [this.processedEmailsKey]: processedArray
      })
      
      console.log(`Saved ${this.summaryCache.size} summaries and ${this.processedEmails.size} processed emails to storage`)
    } catch (error) {
      console.error('Error saving cache to storage:', error)
    }
  }

  // Generate a cache key for the email
  getCacheKey(message) {
    return `${message.id}_${message.subject}_${message.snippet.substring(0, 50)}`
  }

  // Check if we already have a summary for this email
  getCachedSummary(message) {
    const key = this.getCacheKey(message)
    return this.summaryCache.get(key)
  }

  // Store summary in cache and persist to storage
  async setCachedSummary(message, summary) {
    const key = this.getCacheKey(message)
    this.summaryCache.set(key, summary)
    this.processedEmails.add(message.id)
    
    // Save to persistent storage
    await this.saveCacheToStorage()
  }

  // Check if email has been processed before (even if summary failed)
  isEmailProcessed(message) {
    return this.processedEmails.has(message.id)
  }

  // Get summary from cache or return null (no API calls in this method)
  getSummaryFromCache(message) {
    // Ensure service is initialized
    if (!this.isInitialized) {
      console.warn('EmailSummaryService not initialized yet')
      return null
    }
    
    const cached = this.getCachedSummary(message)
    return cached || null
  }

  // Background summary generation (called separately)
  async generateSummaryInBackground(message) {
    try {
      // Ensure service is initialized
      await this.initialize()
      
      // Skip if already processed
      if (this.isEmailProcessed(message)) {
        console.log('Email already processed, skipping:', message.id)
        return this.getCachedSummary(message)
      }

      // Skip if no content to summarize
      if (!message.subject && !message.snippet) {
        console.log('No content to summarize for:', message.id)
        await this.setCachedSummary(message, null)
        return null
      }

      // Prepare the content for summarization
      const emailContent = `Subject: ${message.subject || 'No subject'}\nContent: ${message.snippet || 'No content'}`
      
      console.log('Generating background summary for email:', message.id)
      
      // Make API call to DeepSeek
      const requestBody = {
        "model": this.model,
        "messages": [
          {
            "role": "user",
            "content": `Summarize this email in one clear, concise sentence. Include key info like service name, purpose (e.g. login, payment), OTP codes, and deadlines if mentioned. Avoid generic phrases. No emojis. no notes, no other text, just the summary. Email: ${emailContent}`
          }
        ],
        "max_tokens": 20,
        "temperature": 0.2,
        "stream": false
      }

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('DeepSeek API error:', response.status, errorText)
        
        // Mark as processed even if failed to avoid retrying
        await this.setCachedSummary(message, null)
        return null
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected DeepSeek API response structure:', data)
        await this.setCachedSummary(message, null)
        return null
      }
      
      const summary = data.choices[0].message.content?.trim() || null
      
      // Cache the summary
      await this.setCachedSummary(message, summary)
      
      console.log('Generated and cached summary for:', message.id, summary)
      return summary
    } catch (error) {
      console.error('Error generating background summary:', error)
      
      // Mark as processed to avoid retrying
      await this.setCachedSummary(message, null)
      return null
    }
  }

  // Process multiple emails in background with rate limiting
  async processEmailsInBackground(messages) {
    await this.initialize()
    
    // Filter out already processed emails
    const unprocessedMessages = messages.filter(msg => !this.isEmailProcessed(msg))
    
    if (unprocessedMessages.length === 0) {
      console.log('All emails already processed')
      return
    }
    
    console.log(`Processing ${unprocessedMessages.length} unprocessed emails in background`)
    
    // Process emails one by one with delays to avoid rate limiting
    for (let i = 0; i < unprocessedMessages.length; i++) {
      const message = unprocessedMessages[i]
      
      try {
        await this.generateSummaryInBackground(message)
        
        // Add delay between requests (2 seconds)
        if (i < unprocessedMessages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error('Error processing email in background:', message.id, error)
      }
    }
    
    console.log('Background processing completed')
  }

  // Clear cache (useful for debugging)
  async clearCache() {
    this.summaryCache.clear()
    this.processedEmails.clear()
    await chrome.storage.local.remove([this.persistentCacheKey, this.processedEmailsKey])
    console.log('Cache cleared')
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cachedSummaries: this.summaryCache.size,
      processedEmails: this.processedEmails.size,
      isInitialized: this.isInitialized
    }
  }

  // Get remaining credit estimate
  getRemainingCreditEstimate() {
    const estimatedCostPerSummary = 0.000049
    const totalCredit = 2.0
    const usedSummaries = this.processedEmails.size
    const usedCredit = usedSummaries * estimatedCostPerSummary
    const remainingCredit = totalCredit - usedCredit
    const remainingSummaries = Math.floor(remainingCredit / estimatedCostPerSummary)
    
    return {
      totalCredit,
      usedCredit: usedCredit.toFixed(6),
      remainingCredit: remainingCredit.toFixed(6),
      usedSummaries,
      remainingSummaries
    }
  }
}

// Create singleton instance
export const emailSummaryService = new EmailSummaryService() 