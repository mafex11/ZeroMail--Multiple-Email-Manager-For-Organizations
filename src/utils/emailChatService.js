// Enhanced Email Chat Service with intelligent pagination and full UI access
export class EmailChatService {
  constructor() {
    this.apiKey = 'sk-7b936c669e244234ae536eddf9281dfa'
    this.baseUrl = 'https://api.deepseek.com/chat/completions'
    this.model = 'deepseek-chat'
    this.chatHistory = []
    this.emailContext = []
    this.accounts = []
    this.currentAccount = 'all'
    this.currentFilter = 'inbox'
    
    // Pagination state
    this.paginationState = new Map() // Store pagination state for different queries
    
    // Extension function callbacks
    this.extensionFunctions = {
      switchAccount: null,
      refreshMessages: null,
      setMessageFilter: null,
      archiveEmail: null,
      toggleRead: null,
      toggleStar: null,
      searchEmails: null,
      loadMessages: null,
      fetchMoreEmails: null,
      performGmailSearch: null,
      performAdvancedSearch: null
    }
  }

  // Set extension function callbacks
  setExtensionFunctions(functions) {
    this.extensionFunctions = { ...this.extensionFunctions, ...functions }
  }

  // Set email context and account info
  setEmailContext(messages, accounts, currentAccount = 'all', currentFilter = 'inbox') {
    this.emailContext = messages.map(msg => ({
      id: msg.id,
      subject: msg.subject,
      from: msg.from,
      date: msg.date,
      snippet: msg.snippet,
      isUnread: msg.isUnread,
      isStarred: msg.isStarred,
      accountEmail: msg.accountEmail,
      labels: msg.labels || [],
      messageType: msg.messageType
    }))
    
    this.accounts = accounts
    this.currentAccount = currentAccount
    this.currentFilter = currentFilter
  }

  // Enhanced query processing with STRICT email-only validation
  async processQuery(userMessage) {
    try {
      // STRICT EMAIL-ONLY VALIDATION - This is the wall!
      if (!this.isEmailRelatedQuery(userMessage)) {
        const restrictedResponse = `I'm an **Email Assistant** for the Fusion Mail extension. I can only help with:

📧 **Email Management:**
- Show/find/search emails
- Archive, star, mark as read/unread
- Switch between accounts and folders
- Email summaries and organization

🚫 **I cannot help with:**
- General questions (like "what is a zoo")
- Non-email topics
- External information

**Try asking me:**
- "Show me unread emails"
- "Find emails about payments"
- "Search emails from GitHub"
- "Show starred emails"

Please ask me something about your emails!`

        this.chatHistory.push({
          role: 'assistant',
          content: restrictedResponse,
          timestamp: new Date().toISOString()
        })
        
        return restrictedResponse
      }

      // Add user message to chat history
      this.chatHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      })

      // Check for context-dependent follow-up queries
      const contextualQuery = this.resolveContextualQuery(userMessage)
      const finalQuery = contextualQuery || userMessage
      
      console.log('Final query after context resolution:', finalQuery) // Debug log

      // Check if this is an email request that should show email cards
      const emailRequest = this.analyzeEmailRequest(finalQuery)
      
      console.log('Email request analysis result:', emailRequest) // Debug log
      
      if (emailRequest) {
        console.log('Processing as email request') // Debug log
        // Handle email display requests
        const emailResult = await this.handleEmailRequest(emailRequest)
        
        console.log('Email request result:', emailResult) // Debug log
        
        this.chatHistory.push({
          role: 'assistant',
          content: emailResult.text,
          emails: emailResult.emails,
          emailsTitle: emailResult.title,
          hasMore: emailResult.hasMore,
          totalCount: emailResult.totalCount,
          queryId: emailResult.queryId,
          actions: emailResult.actions,
          timestamp: new Date().toISOString()
        })
        
        return emailResult
      }

      // Check if this requires expanded email access
      const needsMoreEmails = this.requiresExpandedAccess(finalQuery)
      
      console.log('Requires expanded access:', needsMoreEmails) // Debug log
      
      if (needsMoreEmails) {
        console.log('Processing as expanded query') // Debug log
        // Perform expanded search
        const expandedResult = await this.handleExpandedQuery(finalQuery)
        
        this.chatHistory.push({
          role: 'assistant',
          content: expandedResult.text || expandedResult,
          emails: expandedResult.emails || null,
          emailsTitle: expandedResult.title || null,
          hasMore: expandedResult.hasMore || false,
          totalCount: expandedResult.totalCount || 0,
          queryId: expandedResult.queryId || null,
          timestamp: new Date().toISOString()
        })
        
        return expandedResult
      }

      // Analyze if the query requires function calls
      const functionCall = await this.analyzeFunctionCall(finalQuery)
      
      console.log('Function call analysis:', functionCall) // Debug log
      
      let response = ''
      
      if (functionCall) {
        console.log('Processing as function call') // Debug log
        // Execute the function and get results
        const functionResult = await this.executeFunctionCall(functionCall)
        response = functionResult.response
        
        // If function execution changed the view, mention it
        if (functionResult.actionTaken) {
          response = `${functionResult.actionTaken}\n\n${response}`
        }
      } else {
        console.log('Processing as regular AI response') // Debug log
        // Regular AI response
        response = await this.getAIResponse(finalQuery)
      }
      
      // Add AI response to chat history
      this.chatHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      })

      return response
    } catch (error) {
      console.error('Error processing chat query:', error)
      const errorResponse = 'Sorry, I encountered an error while processing your request. Please try again.'
      
      this.chatHistory.push({
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date().toISOString()
      })
      
      return errorResponse
    }
  }

  // STRICT email-only validation function
  isEmailRelatedQuery(userMessage) {
    const message = userMessage.toLowerCase().trim()
    
    // Email-related keywords that are allowed
    const emailKeywords = [
      'email', 'emails', 'mail', 'message', 'messages',
      'inbox', 'sent', 'draft', 'drafts', 'archive', 'archived',
      'unread', 'read', 'star', 'starred', 'favorite', 'favourites',
      'from', 'to', 'subject', 'sender', 'recipient',
      'search', 'find', 'show', 'display', 'list', 'get', 'fetch',
      'delete', 'remove', 'archive', 'mark', 'flag',
      'account', 'accounts', 'gmail', 'google',
      'refresh', 'reload', 'update', 'sync',
      'filter', 'sort', 'organize', 'manage',
      'attachment', 'attachments', 'file', 'files',
      'notification', 'notifications', 'alert', 'alerts',
      'folder', 'folders', 'label', 'labels', 'category', 'categories'
    ]
    
    // Extension-specific keywords
    const extensionKeywords = [
      'fusion mail', 'extension', 'app', 'interface', 'ui',
      'switch', 'change', 'view', 'page', 'tab',
      'help', 'how to', 'tutorial', 'guide', 'instruction',
      'setting', 'settings', 'configure', 'setup',
      'load more', 'show more', 'next', 'previous',
      'back', 'return', 'go to', 'navigate'
    ]
    
    // Context-dependent phrases (follow-up queries)
    const contextPhrases = [
      'yes', 'no', 'ok', 'okay', 'sure', 'please',
      'that', 'this', 'these', 'those', 'it', 'them',
      'more', 'less', 'again', 'repeat', 'continue',
      'stop', 'cancel', 'clear', 'reset', 'restart'
    ]
    
    // Combine all allowed keywords
    const allowedKeywords = [...emailKeywords, ...extensionKeywords, ...contextPhrases]
    
    // Check if the message contains any email-related keywords
    const hasEmailKeywords = allowedKeywords.some(keyword => 
      message.includes(keyword)
    )
    
    // Additional patterns for email-related queries
    const emailPatterns = [
      /\b(show|find|search|get|fetch|list|display)\b.*\b(email|mail|message)\b/i,
      /\b(email|mail|message)\b.*\b(from|to|about|containing|with)\b/i,
      /\b(unread|starred?|sent|inbox|archive|draft)\b/i,
      /\b(gmail|google)\b.*\b(account|search|find)\b/i,
      /@\w+\.\w+/i, // Email addresses
      /\b(payment|receipt|invoice|order|shipping|delivery|subscription)\b.*\b(email|mail)\b/i
    ]
    
    const hasEmailPatterns = emailPatterns.some(pattern => pattern.test(message))
    
    // Very short queries (1-3 words) that might be context-dependent
    const words = message.split(/\s+/).filter(word => word.length > 0)
    const isShortContextQuery = words.length <= 3 && contextPhrases.some(phrase => 
      message.includes(phrase)
    )
    
    return hasEmailKeywords || hasEmailPatterns || isShortContextQuery
  }

  // Provide helpful email-related guidance instead of general AI responses
  getEmailGuidanceResponse(userMessage) {
    return `I understand you're asking about "${userMessage}", but I can only help with email-related tasks.

**Here's what I can help you with:**

📧 **Find & Search Emails:**
- "Find emails about payments"
- "Show emails from GitHub"
- "Search for emails containing invoice"

📋 **Manage Emails:**
- "Show unread emails"
- "Display starred emails"
- "List recent emails"

⚙️ **Extension Functions:**
- "Switch to sent folder"
- "Refresh emails"
- "Change to all accounts view"

**Try asking me something about your emails!**`
  }

  // Enhanced email request analysis with better pattern matching
  analyzeEmailRequest(userMessage) {
    const message = userMessage.toLowerCase()
    
    console.log('Analyzing email request for:', message) // Debug log
    
    // Enhanced patterns that should show email cards
    const emailDisplayPatterns = [
      { pattern: /show\s+(?:me\s+)?(?:my\s+)?unread\s+emails?/i, type: 'unread' },
      { pattern: /show\s+(?:me\s+)?(?:my\s+)?starred?\s+emails?/i, type: 'starred' },
      { pattern: /show\s+(?:me\s+)?(?:my\s+)?recent\s+emails?/i, type: 'recent' },
      { pattern: /show\s+(?:me\s+)?emails?\s+from\s+(.+)/i, type: 'from' },
      { pattern: /show\s+(?:me\s+)?emails?\s+about\s+(.+)/i, type: 'about' },
      
      // Fixed search patterns - capture the term after "about/regarding/containing"
      { pattern: /(?:find|fetch|get|search)\s+emails?\s+(?:regarding|about|containing)\s+(.+)/i, type: 'search' },
      { pattern: /(?:find|fetch|get|search)\s+emails?\s+from\s+(.+)/i, type: 'from' },
      
      // More flexible patterns
      { pattern: /emails?\s+about\s+(.+)/i, type: 'search' },
      { pattern: /emails?\s+from\s+(.+)/i, type: 'from' },
      { pattern: /emails?\s+containing\s+(.+)/i, type: 'search' },
      
      { pattern: /list\s+(?:my\s+)?(?:recent\s+)?emails?/i, type: 'recent' },
      { pattern: /what\s+emails?\s+(?:do\s+)?(?:i\s+)?(?:have|got|received)/i, type: 'recent' }
    ]
    
    for (const { pattern, type } of emailDisplayPatterns) {
      const match = message.match(pattern)
      if (match) {
        console.log(`Matched pattern: ${pattern} with type: ${type}, value: ${match[1]}`) // Debug log
        return {
          type,
          value: match[1]?.trim() || '',
          originalQuery: userMessage,
          limit: 10 // Initial load limit
        }
      }
    }
    
    console.log('No email request pattern matched') // Debug log
    return null
  }

  // Enhanced email request handler that ALWAYS returns action buttons when no results found
  async handleEmailRequest(emailRequest) {
    const queryId = `${emailRequest.type}_${emailRequest.value}_${Date.now()}`
    
    try {
      let filteredEmails = []
      let totalCount = 0
      let searchDescription = ''
      
      switch (emailRequest.type) {
        case 'unread':
          filteredEmails = this.emailContext.filter(email => email.isUnread)
          totalCount = filteredEmails.length
          searchDescription = 'unread emails'
          break
          
        case 'starred':
          filteredEmails = this.emailContext.filter(email => email.isStarred)
          totalCount = filteredEmails.length
          searchDescription = 'starred emails'
          break
          
        case 'recent':
          filteredEmails = this.emailContext.slice(0, 50)
          totalCount = filteredEmails.length
          searchDescription = 'recent emails'
          break
          
        case 'from':
          const senderQuery = emailRequest.value.toLowerCase()
          filteredEmails = this.emailContext.filter(email => 
            email.from.toLowerCase().includes(senderQuery)
          )
          totalCount = filteredEmails.length
          searchDescription = `emails from "${emailRequest.value}"`
          break
          
        case 'about':
        case 'search':
          const searchQuery = emailRequest.value.toLowerCase()
          filteredEmails = this.emailContext.filter(email => 
            email.subject.toLowerCase().includes(searchQuery) ||
            email.snippet.toLowerCase().includes(searchQuery) ||
            email.from.toLowerCase().includes(searchQuery)
          )
          totalCount = filteredEmails.length
          searchDescription = `emails about "${emailRequest.value}"`
          break
          
        default:
          filteredEmails = this.emailContext.slice(0, 20)
          totalCount = filteredEmails.length
          searchDescription = 'emails'
      }
      
      // If no results found, ALWAYS return action buttons
      if (totalCount === 0) {
        const actionButtons = this.createActionButtons(emailRequest)
        
        console.log('No emails found, returning action buttons:', actionButtons) // Debug log
        
        return {
          text: `I couldn't find any ${searchDescription} in your current loaded emails (${this.emailContext.length} emails from ${this.currentFilter} view).`,
          emails: [],
          title: null,
          hasMore: false,
          totalCount: 0,
          queryId: null,
          actions: actionButtons // This should always be an array with buttons
        }
      }
      
      // Sort by date (newest first)
      filteredEmails.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      // Store pagination state
      this.paginationState.set(queryId, {
        allEmails: filteredEmails,
        currentIndex: emailRequest.limit,
        query: emailRequest,
        totalCount
      })
      
      // Get initial batch
      const initialEmails = filteredEmails.slice(0, emailRequest.limit)
      const hasMore = filteredEmails.length > emailRequest.limit
      
      let responseText = ''
      if (totalCount <= emailRequest.limit) {
        responseText = `Here ${totalCount === 1 ? 'is' : 'are'} your ${totalCount} ${searchDescription}:`
      } else {
        responseText = `Found ${totalCount} ${searchDescription}. Showing the first ${emailRequest.limit}:`
      }
      
      return {
        text: responseText,
        emails: initialEmails,
        title: `${searchDescription.charAt(0).toUpperCase() + searchDescription.slice(1)} (${initialEmails.length}${hasMore ? `/${totalCount}` : ''})`,
        hasMore,
        totalCount,
        queryId,
        actions: null
      }
      
    } catch (error) {
      console.error('Error handling email request:', error)
      return {
        text: `Sorry, I encountered an error while searching for ${emailRequest.type} emails. Please try again.`,
        emails: [],
        title: 'Error',
        hasMore: false,
        totalCount: 0,
        queryId: null,
        actions: null
      }
    }
  }

  // Enhanced createActionButtons with consolidated account dropdown
  createActionButtons(emailRequest) {
    const actions = []
    
    // Primary option: Search all accounts
    actions.push({
      type: 'expandedSearch',
      title: 'Search Entire Gmail Account',
      description: `Search all emails in your Gmail for "${emailRequest.value}"`,
      data: {
        query: emailRequest.value,
        originalRequest: emailRequest,
        account: 'all'
      }
    })
    
    // Add account-specific search options (these will be shown in dropdown)
    if (this.accounts && this.accounts.length > 1) {
      this.accounts.forEach(account => {
        const accountName = account.email.split('@')[0] // Extract username
        actions.push({
          type: 'expandedSearchAccount',
          title: `Search ${accountName} Account Only`,
          description: `Search all emails in ${account.email} for "${emailRequest.value}"`,
          data: {
            query: emailRequest.value,
            originalRequest: emailRequest,
            account: account.email,
            accountName: accountName
          }
        })
      })
    }
    
    // Offer to filter current emails if we have some loaded
    if (this.emailContext.length > 0) {
      actions.push({
        type: 'filterCurrent',
        title: 'Filter Current Emails',
        description: `Search within the ${this.emailContext.length} loaded emails`,
        data: {
          query: emailRequest.value,
          originalRequest: emailRequest
        }
      })
    }
    
    // Offer to refresh emails
    actions.push({
      type: 'refresh',
      title: 'Refresh & Search Again',
      description: 'Load latest emails and search again',
      data: {
        query: emailRequest.value,
        originalRequest: emailRequest
      }
    })
    
    // Offer to switch views if not already in 'all'
    if (this.currentFilter !== 'all') {
      actions.push({
        type: 'switchView',
        title: 'Search All Email Categories',
        description: 'Switch to "All" view and search there',
        data: {
          query: emailRequest.value,
          originalRequest: emailRequest
        }
      })
    }
    
    return actions
  }

  // Enhanced handleActionClick with account-specific search handling
  async handleActionClick(action) {
    try {
      switch (action.type) {
        case 'expandedSearch':
          // Perform expanded Gmail search across all accounts
          if (this.extensionFunctions.performGmailSearch) {
            const results = await this.extensionFunctions.performGmailSearch(
              action.data.query, 
              'all' // Search all accounts
            )
            
            if (results && results.length > 0) {
              // Sort and paginate results
              results.sort((a, b) => new Date(b.date) - new Date(a.date))
              const queryId = `expanded_all_${action.data.query}_${Date.now()}`
              
              // Store pagination state
              this.paginationState.set(queryId, {
                allEmails: results,
                currentIndex: 10,
                query: action.data.originalRequest,
                totalCount: results.length
              })
              
              const initialEmails = results.slice(0, 10)
              const hasMore = results.length > 10
              
              return {
                text: `✅ Found ${results.length} emails across **all your accounts** matching "${action.data.query}":`,
                emails: initialEmails,
                title: `All Accounts Search: "${action.data.query}" (${initialEmails.length}${hasMore ? `/${results.length}` : ''})`,
                hasMore,
                totalCount: results.length,
                queryId,
                actions: null
              }
            } else {
              return {
                text: `I searched all your Gmail accounts but couldn't find any emails matching "${action.data.query}".`,
                emails: [],
                title: null,
                hasMore: false,
                totalCount: 0,
                queryId: null,
                actions: null
              }
            }
          } else {
            return {
              text: `Gmail search function is not available. Please try refreshing the extension.`,
              emails: [],
              title: null,
              hasMore: false,
              totalCount: 0,
              queryId: null,
              actions: null
            }
          }
          
        case 'expandedSearchAccount':
          // NEW: Perform expanded Gmail search for specific account
          if (this.extensionFunctions.performGmailSearch) {
            const results = await this.extensionFunctions.performGmailSearch(
              action.data.query, 
              action.data.account // Search specific account
            )
            
            if (results && results.length > 0) {
              // Sort and paginate results
              results.sort((a, b) => new Date(b.date) - new Date(a.date))
              const queryId = `expanded_${action.data.accountName}_${action.data.query}_${Date.now()}`
              
              // Store pagination state
              this.paginationState.set(queryId, {
                allEmails: results,
                currentIndex: 10,
                query: action.data.originalRequest,
                totalCount: results.length
              })
              
              const initialEmails = results.slice(0, 10)
              const hasMore = results.length > 10
              
              return {
                text: `✅ Found ${results.length} emails in **${action.data.accountName}** account matching "${action.data.query}":`,
                emails: initialEmails,
                title: `${action.data.accountName} Search: "${action.data.query}" (${initialEmails.length}${hasMore ? `/${results.length}` : ''})`,
                hasMore,
                totalCount: results.length,
                queryId,
                actions: null
              }
            } else {
              return {
                text: `I searched the **${action.data.accountName}** account but couldn't find any emails matching "${action.data.query}".`,
                emails: [],
                title: null,
                hasMore: false,
                totalCount: 0,
                queryId: null,
                actions: null
              }
            }
          } else {
            return {
              text: `Gmail search function is not available. Please try refreshing the extension.`,
              emails: [],
              title: null,
              hasMore: false,
              totalCount: 0,
              queryId: null,
              actions: null
            }
          }
          
        case 'filterCurrent':
          // Re-run the original request with more flexible matching
          const flexibleResults = this.emailContext.filter(email => {
            const query = action.data.query.toLowerCase()
            return (
              email.subject.toLowerCase().includes(query) ||
              email.snippet.toLowerCase().includes(query) ||
              email.from.toLowerCase().includes(query) ||
              // More flexible matching
              email.from.toLowerCase().split(' ').some(word => word.includes(query)) ||
              email.subject.toLowerCase().split(' ').some(word => word.includes(query))
            )
          })
          
          if (flexibleResults.length > 0) {
            flexibleResults.sort((a, b) => new Date(b.date) - new Date(a.date))
            const queryId = `flexible_${action.data.query}_${Date.now()}`
            
            this.paginationState.set(queryId, {
              allEmails: flexibleResults,
              currentIndex: 10,
              query: action.data.originalRequest,
              totalCount: flexibleResults.length
            })
            
            const initialEmails = flexibleResults.slice(0, 10)
            const hasMore = flexibleResults.length > 10
            
            return {
              text: `✅ Found ${flexibleResults.length} emails in your loaded emails with flexible matching:`,
              emails: initialEmails,
              title: `Filtered Results: "${action.data.query}" (${initialEmails.length}${hasMore ? `/${flexibleResults.length}` : ''})`,
              hasMore,
              totalCount: flexibleResults.length,
              queryId,
              actions: null
            }
          } else {
            return {
              text: `Still no results found in your loaded emails. Try the "Search Entire Gmail Account" option above.`,
              emails: [],
              title: null,
              hasMore: false,
              totalCount: 0,
              queryId: null,
              actions: null
            }
          }
          
        case 'refresh':
          // Trigger refresh and then search again
          if (this.extensionFunctions.refreshMessages) {
            await this.extensionFunctions.refreshMessages()
            
            return {
              text: `✅ Emails refreshed! Now searching again for "${action.data.query}"...`,
              emails: [],
              title: null,
              hasMore: false,
              totalCount: 0,
              queryId: null,
              actions: null,
              followUpAction: {
                type: 'searchAfterRefresh',
                data: action.data
              }
            }
          } else {
            return {
              text: `Refresh function is not available. Please try manually refreshing the extension.`,
              emails: [],
              title: null,
              hasMore: false,
              totalCount: 0,
              queryId: null,
              actions: null
            }
          }
          
        case 'switchView':
          // Switch to 'all' view and search
          if (this.extensionFunctions.setMessageFilter) {
            await this.extensionFunctions.setMessageFilter('all')
            this.currentFilter = 'all'
            
            return {
              text: `✅ Switched to "All" emails view. Now searching for "${action.data.query}"...`,
              emails: [],
              title: null,
              hasMore: false,
              totalCount: 0,
              queryId: null,
              actions: null,
              followUpAction: {
                type: 'searchAfterSwitch',
                data: action.data
              }
            }
          } else {
            return {
              text: `Filter switch function is not available. Please try manually changing the filter.`,
              emails: [],
              title: null,
              hasMore: false,
              totalCount: 0,
              queryId: null,
              actions: null
            }
          }
          
        // NEW: Handle follow-up actions
        case 'searchAfterRefresh':
        case 'searchAfterSwitch':
          // Perform the search after refresh or switch
          const searchRequest = {
            type: 'search',
            value: action.data.query,
            originalQuery: `search for emails about ${action.data.query}`,
            limit: 10
          }
          
          // Use the handleEmailRequest method to perform the search
          const searchResult = await this.handleEmailRequest(searchRequest)
          
          return {
            text: searchResult.text,
            emails: searchResult.emails,
            title: searchResult.title,
            hasMore: searchResult.hasMore,
            totalCount: searchResult.totalCount,
            queryId: searchResult.queryId,
            actions: searchResult.actions
          }
          
        default:
          console.error('Unknown action type:', action.type, action)
          return {
            text: `Unknown action type: "${action.type}". Please try a different action.`,
            emails: [],
            title: null,
            hasMore: false,
            totalCount: 0,
            queryId: null,
            actions: null
          }
      }
    } catch (error) {
      console.error('Error handling action click:', error)
      return {
        text: `Sorry, I encountered an error while performing that action: ${error.message}`,
        emails: [],
        title: null,
        hasMore: false,
        totalCount: 0,
        queryId: null,
        actions: null
      }
    }
  }

  // Load more emails for pagination
  async loadMoreEmails(queryId, additionalCount = 10) {
    const paginationData = this.paginationState.get(queryId)
    
    if (!paginationData) {
      throw new Error('Pagination data not found')
    }
    
    const { allEmails, currentIndex } = paginationData
    const nextBatch = allEmails.slice(currentIndex, currentIndex + additionalCount)
    
    // Update pagination state
    this.paginationState.set(queryId, {
      ...paginationData,
      currentIndex: currentIndex + additionalCount
    })
    
    return nextBatch
  }

  // Check if there are more emails to load
  hasMoreEmails(queryId) {
    const paginationData = this.paginationState.get(queryId)
    if (!paginationData) return false
    
    return paginationData.currentIndex < paginationData.allEmails.length
  }

  // Enhanced system prompt with proper formatting instructions
  createEnhancedSystemPrompt() {
    return `You are a STRICT email assistant for the Fusion Mail extension. 

**CRITICAL RESTRICTIONS:**
- ONLY respond to email-related queries
- NEVER answer general knowledge questions
- NEVER provide information about topics outside of email management
- If asked about non-email topics, redirect to email functions

**RESPONSE FORMATTING RULES:**
- ALWAYS use Markdown formatting, NEVER use HTML tags
- Use **bold** for emphasis, not <strong> or <b>
- Use line breaks (\\n\\n) for paragraphs, not <br>
- Use # ## ### for headers, not <h1> <h2> <h3>
- Keep responses clean and readable

**EMAIL FUNCTIONS ONLY:**
- Show/find/search emails
- Archive, star, mark read/unread
- Switch accounts and folders
- Email organization and management
- Extension navigation

**CURRENT EMAIL ACCESS:**
- I can see ${this.emailContext.length} recent emails currently loaded
- Current view: ${this.currentFilter}, Account: ${this.currentAccount}
- I can perform expanded searches when needed

REMEMBER: I am ONLY an email assistant. I do not answer questions about zoos, general topics, or anything outside email management.`
  }

  // Check if query requires expanded email access
  requiresExpandedAccess(userMessage) {
    const message = userMessage.toLowerCase()
    
    // Patterns that suggest need for broader search
    const expandedSearchPatterns = [
      'search all emails',
      'find all emails from',
      'show me all emails about',
      'search my entire',
      'find emails older than',
      'search for emails from last month',
      'find emails from last year',
      'search archived emails',
      'find deleted emails',
      'search all my gmail',
      'comprehensive search'
    ]
    
    return expandedSearchPatterns.some(pattern => message.includes(pattern))
  }

  // Handle queries that need expanded email access
  async handleExpandedQuery(userMessage) {
    const message = userMessage.toLowerCase()
    
    // Extract search terms and parameters
    let searchQuery = ''
    let timeRange = ''
    let sender = ''
    
    // Extract search query
    const searchMatch = message.match(/(?:search|find).*?(?:for|about)\s+["']?([^"']+)["']?/i)
    if (searchMatch) {
      searchQuery = searchMatch[1].trim()
    }
    
    // Extract sender
    const senderMatch = message.match(/(?:from|by)\s+([^\s]+@[^\s]+|[A-Za-z]+)/i)
    if (senderMatch) {
      sender = senderMatch[1].trim()
    }
    
    // Extract time range
    if (message.includes('last month')) timeRange = 'last month'
    if (message.includes('last year')) timeRange = 'last year'
    if (message.includes('older than')) timeRange = 'older'
    
    try {
      // Perform expanded Gmail search
      const searchResults = await this.performExpandedGmailSearch({
        query: searchQuery,
        sender: sender,
        timeRange: timeRange,
        account: this.currentAccount
      })
      
      if (searchResults.length === 0) {
        return {
          text: `I searched your entire Gmail account but couldn't find any emails matching "${userMessage}". 

**Search scope**: All emails in your account (not just the ${this.emailContext.length} shown in the extension)
**Accounts searched**: ${this.currentAccount === 'all' ? 'All connected accounts' : this.currentAccount}

Try refining your search terms or checking if the emails might be in a different account.`,
          emails: [],
          title: `Search Results: "${userMessage}" (${searchResults.length} found)`
        }
      }
      
      const resultSummary = this.formatExpandedSearchResults(searchResults, userMessage)
      return {
        text: `**Expanded Gmail Search Results** (searched entire account, not just visible emails):

${resultSummary}

**Note**: This search covered your entire Gmail account, including archived and older emails beyond what's shown in the extension.`,
        emails: searchResults.slice(0, 20), // Limit to 20 for performance
        title: `Search Results: "${userMessage}" (${searchResults.length} found)`
      }
      
    } catch (error) {
      console.error('Expanded search failed:', error)
      return {
        text: `I tried to search your entire Gmail account but encountered an error. Here are the results from the search:

${searchQuery}

**Current limitation**: I can only search within the ${this.emailContext.length} emails currently loaded in the extension.

**What I searched**: Recent emails from ${this.currentFilter} view
**Accounts**: ${this.currentAccount}

For a complete search of all your emails, you might need to use Gmail's web interface directly.`,
        emails: [],
        title: `Search Results: "${userMessage}" (${searchResults.length} found)`
      }
    }
  }

  // Perform expanded Gmail search using Gmail API
  async performExpandedGmailSearch({ query, sender, timeRange, account }) {
    if (!this.extensionFunctions.performGmailSearch) {
      throw new Error('Gmail search function not available')
    }
    
    // Build Gmail search query
    let gmailQuery = ''
    
    if (query) gmailQuery += query
    if (sender) gmailQuery += ` from:${sender}`
    
    // Add time range
    switch (timeRange) {
      case 'last month':
        const lastMonth = new Date()
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        gmailQuery += ` after:${lastMonth.toISOString().split('T')[0]}`
        break
      case 'last year':
        const lastYear = new Date()
        lastYear.setFullYear(lastYear.getFullYear() - 1)
        gmailQuery += ` after:${lastYear.toISOString().split('T')[0]}`
        break
      case 'older':
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        gmailQuery += ` before:${sixMonthsAgo.toISOString().split('T')[0]}`
        break
    }
    
    // Perform the search
    return await this.extensionFunctions.performGmailSearch(gmailQuery, account)
  }

  // Format expanded search results
  formatExpandedSearchResults(results, originalQuery) {
    const totalResults = results.length
    const recentResults = results.slice(0, 10) // Show top 10 results
    
    let summary = `Found ${totalResults} emails matching your search.\n\n`
    
    if (totalResults > 10) {
      summary += `**Top 10 results** (${totalResults - 10} more found):\n\n`
    }
    
    recentResults.forEach((email, index) => {
      const date = new Date(email.date).toLocaleDateString()
      const sender = email.from.split('<')[0].trim()
      summary += `${index + 1}. **${email.subject}**\n   From: ${sender} | ${date}\n   ${email.snippet.substring(0, 100)}...\n\n`
    })
    
    if (totalResults > 10) {
      summary += `💡 **Tip**: Use the main extension search to see all ${totalResults} results.`
    }
    
    return summary
  }

  // Analyze if user query requires function calls
  async analyzeFunctionCall(userMessage) {
    const message = userMessage.toLowerCase()
    
    // Handle "load more" requests with helpful UI
    if (message.includes('load more') || message.includes('show more') || message.includes('more emails')) {
      return { 
        type: 'loadMoreHelp',
        showActions: true
      }
    }
    
    // Account switching patterns
    if (message.includes('switch to') || message.includes('change to') || message.includes('show emails from')) {
      const accountMatch = this.accounts.find(acc => 
        message.includes(acc.email.toLowerCase()) || 
        message.includes(acc.email.split('@')[0].toLowerCase())
      )
      if (accountMatch) {
        return { type: 'switchAccount', account: accountMatch.email }
      }
    }
    
    // Filter switching patterns
    if (message.includes('show inbox') || message.includes('go to inbox')) {
      return { type: 'setFilter', filter: 'inbox' }
    }
    if (message.includes('show sent') || message.includes('go to sent')) {
      return { type: 'setFilter', filter: 'sent' }
    }
    if (message.includes('show all') || message.includes('show all emails')) {
      return { type: 'setFilter', filter: 'all' }
    }
    
    // Email actions
    if (message.includes('refresh') || message.includes('reload') || message.includes('update emails')) {
      return { type: 'refresh' }
    }
    
    // Search patterns
    if (message.includes('search for') || message.includes('find emails')) {
      const searchMatch = message.match(/(?:search for|find emails?)(?:\s+(?:with|containing|from))?\s+["']?([^"']+)["']?/i)
      if (searchMatch) {
        return { type: 'search', query: searchMatch[1].trim() }
      }
    }
    
    // Email management
    if (message.includes('archive') && message.includes('email')) {
      return { type: 'showArchiveInstructions' }
    }
    
    if (message.includes('mark as read') || message.includes('mark as unread')) {
      return { type: 'showReadInstructions' }
    }
    
    if (message.includes('star') || message.includes('unstar')) {
      return { type: 'showStarInstructions' }
    }
    
    return null
  }

  // Execute function calls
  async executeFunctionCall(functionCall) {
    let actionTaken = ''
    let response = ''
    let actions = null
    
    try {
      switch (functionCall.type) {
        case 'loadMoreHelp':
          response = `I understand you want to load more emails! Here are your options:`
          
          actions = [
            {
              type: 'expandedSearch',
              title: 'Search Entire Gmail Account',
              description: 'Search all emails in your Gmail for specific content',
              data: { query: '', originalRequest: null }
            },
            {
              type: 'refresh',
              title: 'Refresh Current Emails',
              description: 'Load the latest emails in current view',
              data: { query: '', originalRequest: null }
            },
            {
              type: 'switchView',
              title: 'Switch Email Category',
              description: 'Change between Inbox, Sent, or All emails',
              data: { query: '', originalRequest: null }
            }
          ]
          break
          
        case 'switchAccount':
          if (this.extensionFunctions.switchAccount) {
            await this.extensionFunctions.switchAccount(functionCall.account)
            this.currentAccount = functionCall.account
            actionTaken = `✅ Switched to account: ${functionCall.account}`
            response = `Now showing emails from ${functionCall.account}. You can see all emails from this account in the main view.`
          }
          break
          
        case 'setFilter':
          if (this.extensionFunctions.setMessageFilter) {
            await this.extensionFunctions.setMessageFilter(functionCall.filter)
            this.currentFilter = functionCall.filter
            actionTaken = `✅ Switched to ${functionCall.filter} view`
            response = `Now showing ${functionCall.filter} emails. You can see them in the main view.`
          }
          break
          
        case 'refresh':
          if (this.extensionFunctions.refreshMessages) {
            await this.extensionFunctions.refreshMessages()
            actionTaken = `✅ Refreshed emails`
            response = `Emails have been refreshed. Check the main view for the latest messages.`
          }
          break
          
        case 'search':
          if (this.extensionFunctions.searchEmails) {
            await this.extensionFunctions.searchEmails(functionCall.query)
            actionTaken = `✅ Searching for: "${functionCall.query}"`
            response = `Search results for "${functionCall.query}" are now displayed in the main view.`
          }
          break
          
        case 'showArchiveInstructions':
          response = `To archive emails:
1. Go to the main view
2. Hover over any email
3. Click the archive icon (📦) that appears
4. The email will be moved to archive

You can also ask me to "show archive" to see archived emails.`
          break
          
        case 'showReadInstructions':
          response = `To mark emails as read/unread:
1. Go to the main view
2. Hover over any email
3. Click the envelope icon that appears
4. This will toggle between read/unread status

You can also use the filter buttons to show only read or unread emails.`
          break
          
        case 'showStarInstructions':
          response = `To star/unstar emails:
1. Go to the main view
2. Hover over any email
3. Click the star icon that appears
4. This will toggle the star status

You can also ask me to "show starred emails" to see only starred messages.`
          break
          
        default:
          response = await this.getAIResponse(functionCall.originalQuery || 'Please help me with my emails.')
      }
    } catch (error) {
      console.error('Error executing function call:', error)
      response = 'I encountered an error while trying to perform that action. Please try again or do it manually in the main view.'
    }
    
    return { response, actionTaken, actions }
  }

  // Clean HTML from AI responses and convert to proper markdown
  cleanResponse(response) {
    if (!response) return response
    
    return response
      // Remove HTML tags and convert to markdown
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<br>/gi, '\n')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '*$1*')
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1')
      .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<div>(.*?)<\/div>/gi, '$1\n')
      .replace(/<span>(.*?)<\/span>/gi, '$1')
      // Remove any remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // Get AI response for general queries with HTML cleaning
  async getAIResponse(userMessage) {
    const systemPrompt = this.createEnhancedSystemPrompt()
    
    // Build messages array with full conversation history
    const messages = [
      {
        "role": "system",
        "content": systemPrompt
      }
    ]
    
    // Add recent chat history for context (last 10 messages to avoid token limits)
    const recentHistory = this.chatHistory.slice(-10)
    messages.push(...recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })))
    
    // Add current user message
    messages.push({
      "role": "user", 
      "content": userMessage
    })

    const requestBody = {
      "model": this.model,
      "messages": messages,
      "max_tokens": 400,
      "temperature": 0.3,
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
      throw new Error('Failed to get AI response')
    }

    const data = await response.json()
    const rawResponse = data.choices[0].message.content?.trim() || 'Sorry, I could not process your request.'
    
    // Clean HTML and return proper markdown
    return this.cleanResponse(rawResponse)
  }

  // Create detailed email summary with current context
  createDetailedEmailSummary() {
    if (this.emailContext.length === 0) {
      return "No emails available in the current context."
    }

    const totalEmails = this.emailContext.length
    const unreadEmails = this.emailContext.filter(email => email.isUnread).length
    const starredEmails = this.emailContext.filter(email => email.isStarred).length
    
    // Filter by current account if not 'all'
    const currentAccountEmails = this.currentAccount === 'all' 
      ? this.emailContext 
      : this.emailContext.filter(email => email.accountEmail === this.currentAccount)
    
    // Get recent emails (last 5 for detailed view)
    const recentEmails = currentAccountEmails.slice(0, 5)
    
    // Get unique senders
    const senders = [...new Set(currentAccountEmails.map(email => email.from))].slice(0, 5)
    
    let summary = `Email Summary (${this.currentFilter} view, ${this.currentAccount} account):
- Total emails in view: ${currentAccountEmails.length}
- Unread emails: ${currentAccountEmails.filter(e => e.isUnread).length}
- Starred emails: ${currentAccountEmails.filter(e => e.isStarred).length}

Recent emails in current view:
${recentEmails.map((email, index) => 
  `${index + 1}. From: ${email.from.split('<')[0].trim()} | Subject: ${email.subject} | ${new Date(email.date).toLocaleDateString()} | ${email.isUnread ? 'Unread' : 'Read'}${email.isStarred ? ' ⭐' : ''}`
).join('\n')}

Top senders in current view:
${senders.join(', ')}`

    return summary
  }

  // Get filtered emails based on criteria
  getFilteredEmails(criteria) {
    let filteredEmails = this.emailContext

    // Apply account filter
    if (criteria.account && criteria.account !== 'all') {
      filteredEmails = filteredEmails.filter(email => email.accountEmail === criteria.account)
    }

    // Apply other filters
    switch (criteria.type) {
      case 'unread':
        return filteredEmails.filter(email => email.isUnread)
      case 'starred':
        return filteredEmails.filter(email => email.isStarred)
      case 'from':
        return filteredEmails.filter(email => 
          email.from.toLowerCase().includes(criteria.value.toLowerCase())
        )
      case 'subject':
        return filteredEmails.filter(email => 
          email.subject.toLowerCase().includes(criteria.value.toLowerCase())
        )
      case 'recent':
        const days = criteria.days || 7
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        return filteredEmails.filter(email => 
          new Date(email.date) >= cutoffDate
        )
      case 'search':
        const searchTerm = criteria.value.toLowerCase()
        return filteredEmails.filter(email => 
          email.subject.toLowerCase().includes(searchTerm) ||
          email.from.toLowerCase().includes(searchTerm) ||
          email.snippet.toLowerCase().includes(searchTerm)
        )
      default:
        return filteredEmails
    }
  }

  // Get chat history
  getChatHistory() {
    return this.chatHistory
  }

  // Clear chat history and pagination state
  clearChatHistory() {
    this.chatHistory = []
    this.paginationState.clear()
  }

  // Create contextual prompt with scope clarification
  createContextualPrompt(userMessage) {
    const emailSummary = this.createDetailedEmailSummary()
    
    return `**IMPORTANT**: I currently have access to ${this.emailContext.length} recent emails loaded in the extension, not your entire Gmail account.

Current Extension State:
- Active Account: ${this.currentAccount}
- Current View: ${this.currentFilter}
- Available Accounts: ${this.accounts.map(acc => acc.email).join(', ')}

${emailSummary}

User Request: "${userMessage}"

If the user is asking for comprehensive search or "all emails", I should clarify the scope and offer expanded search capabilities.`
  }

  // Resolve contextual queries based on chat history
  resolveContextualQuery(userMessage) {
    const message = userMessage.toLowerCase().trim()
    
    // Get the last few messages for context
    const recentMessages = this.chatHistory.slice(-6)
    
    // Look for patterns that indicate context-dependent queries
    const contextPatterns = [
      {
        pattern: /^(perform|do|execute|run)\s+(on|for|in)\s+(\w+)$/i,
        resolver: (match) => {
          // Look for previous search requests
          const lastSearchRequest = recentMessages
            .reverse()
            .find(msg => 
              msg.role === 'user' && 
              (msg.content.toLowerCase().includes('find') || 
               msg.content.toLowerCase().includes('search') ||
               msg.content.toLowerCase().includes('fetch'))
            )
          
          if (lastSearchRequest) {
            const account = match[3] // Extract account name
            // Reconstruct the full query with account context
            return `${lastSearchRequest.content} in ${account} account`
          }
          return null
        }
      },
      {
        pattern: /^(expanded search|expand|search all)$/i,
        resolver: () => {
          // Look for the last search query
          const lastSearchRequest = recentMessages
            .reverse()
            .find(msg => 
              msg.role === 'user' && 
              (msg.content.toLowerCase().includes('find') || 
               msg.content.toLowerCase().includes('search') ||
               msg.content.toLowerCase().includes('fetch'))
            )
          
          if (lastSearchRequest) {
            return `Perform expanded search: ${lastSearchRequest.content}`
          }
          return null
        }
      },
      {
        pattern: /^(load more|show more|more)$/i,
        resolver: () => {
          // This should trigger pagination for the last query
          return "load more emails from previous search"
        }
      }
    ]
    
    for (const { pattern, resolver } of contextPatterns) {
      const match = message.match(pattern)
      if (match) {
        const resolvedQuery = resolver(match)
        if (resolvedQuery) {
          console.log(`Resolved contextual query: "${userMessage}" -> "${resolvedQuery}"`)
          return resolvedQuery
        }
      }
    }
    
    return null
  }
}

// Create singleton instance
export const emailChatService = new EmailChatService() 