import { useState, useEffect, useRef } from 'react'
import { 
  ArrowLeftIcon, 
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import { emailChatService } from '../utils/emailChatService'
import { subscriptionService } from '../utils/subscriptionService'
import EmailList from './EmailList'
import ActionButtons from './ActionButtons'
import PaywallModal from './PaywallModal'

// Simple Markdown Renderer Component
const MarkdownRenderer = ({ content, isDarkMode }) => {
  const renderMarkdown = (text) => {
    if (!text) return text

    // Convert markdown to HTML-like JSX
    let rendered = text
      // Headers
      .replace(/### (.*$)/gm, '<h3>$1</h3>')
      .replace(/## (.*$)/gm, '<h2>$1</h2>')
      .replace(/# (.*$)/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(.*?)```/gs, '<code>$1</code>')
      // Inline code
      .replace(/`(.*?)`/g, '<code-inline>$1</code-inline>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Horizontal rules
      .replace(/---/g, '<hr>')
      // Lists
      .replace(/^\d+\.\s+(.*$)/gm, '<li-ordered>$1</li-ordered>')
      .replace(/^-\s+(.*$)/gm, '<li-unordered>$1</li-unordered>')

    // Split by custom tags and render
    const parts = rendered.split(/(<[^>]+>.*?<\/[^>]+>|<[^>]+\/>|<br>)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('<h1>')) {
        return <h1 key={index} className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {part.replace(/<\/?h1>/g, '')}
        </h1>
      } else if (part.startsWith('<h2>')) {
        return <h2 key={index} className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {part.replace(/<\/?h2>/g, '')}
        </h2>
      } else if (part.startsWith('<h3>')) {
        return <h3 key={index} className={`text-md font-medium mb-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
          {part.replace(/<\/?h3>/g, '')}
        </h3>
      } else if (part.startsWith('<strong>')) {
        return <strong key={index} className="font-semibold">
          {part.replace(/<\/?strong>/g, '')}
        </strong>
      } else if (part.startsWith('<em>')) {
        return <em key={index} className="italic">
          {part.replace(/<\/?em>/g, '')}
        </em>
      } else if (part.startsWith('<code>')) {
        return <pre key={index} className={`bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm font-mono my-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {part.replace(/<\/?code>/g, '')}
        </pre>
      } else if (part.startsWith('<code-inline>')) {
        return <code key={index} className={`px-1 py-0.5 rounded text-sm font-mono ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
          {part.replace(/<\/?code-inline>/g, '')}
        </code>
      } else if (part === '<br>') {
        return <br key={index} />
      } else if (part === '<hr>') {
        return <hr key={index} className={`my-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
      } else if (part.startsWith('<li-ordered>')) {
        return <div key={index} className={`ml-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          • {part.replace(/<\/?li-ordered>/g, '')}
        </div>
      } else if (part.startsWith('<li-unordered>')) {
        return <div key={index} className={`ml-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          • {part.replace(/<\/?li-unordered>/g, '')}
        </div>
      } else {
        return <span key={index}>{part}</span>
      }
    })
  }

  return <div className="markdown-content">{renderMarkdown(content)}</div>
}

function ChatPage({ 
  onBack, 
  isDarkMode, 
  messages, 
  accounts, 
  currentAccount, 
  currentFilter,
  onAccountChange,
  onFilterChange,
  onRefresh,
  onSearch,
  onPerformGmailSearch,
  onArchive,
  onToggleRead,
  onToggleStar,
  emailSummaries,
  loadingSummaries
}) {
  const [chatHistory, setChatHistory] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(new Set())
  const [processingAction, setProcessingAction] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const [dailyLimit, setDailyLimit] = useState(5)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Initialize chat service with email context and extension functions
  useEffect(() => {
    if (messages && messages.length > 0 && accounts) {
      emailChatService.setEmailContext(messages, accounts, currentAccount, currentFilter)
      
      // Set extension function callbacks
      emailChatService.setExtensionFunctions({
        switchAccount: async (accountEmail) => {
          onAccountChange(accountEmail)
          await new Promise(resolve => setTimeout(resolve, 500))
        },
        setMessageFilter: async (filter) => {
          onFilterChange(filter)
          await new Promise(resolve => setTimeout(resolve, 500))
        },
        refreshMessages: async () => {
          await onRefresh()
        },
        searchEmails: async (query) => {
          onSearch(query)
          await new Promise(resolve => setTimeout(resolve, 500))
        },
        performGmailSearch: async (query, account) => {
          return await onPerformGmailSearch(query, account)
        },
        performAdvancedSearch: async (query, account, limit) => {
          // Perform more comprehensive search
          return await onPerformGmailSearch(query, account, limit)
        }
      })
    }
  }, [messages, accounts, currentAccount, currentFilter, onAccountChange, onFilterChange, onRefresh, onSearch, onPerformGmailSearch])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Check subscription status and usage limits
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const subscription = await subscriptionService.hasActiveSubscription()
        setHasSubscription(subscription)
        
        if (!subscription) {
          // Get usage limits for free tier
          const limits = await subscriptionService.getUsageLimits()
          setDailyLimit(limits.aiQueries)
          
          // Get current usage
          const today = new Date().toDateString()
          const storageKey = `usage_${today}`
          const result = await chrome.storage.local.get([storageKey])
          const usage = result[storageKey] || {}
          setUsageCount(usage.aiQueries || 0)
        }
      } catch (error) {
        console.error('Error checking subscription status:', error)
      }
    }

    checkSubscriptionStatus()
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // Check if user has exceeded free tier limits
    if (!hasSubscription && usageCount >= dailyLimit) {
      setShowPaywall(true)
      return
    }

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    // Track usage for free tier users
    if (!hasSubscription) {
      const newUsageCount = await subscriptionService.trackUsage('aiQueries')
      setUsageCount(newUsageCount)
    }

    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }

    setChatHistory(prev => [...prev, newUserMessage])

    try {
      // Get AI response (may include email cards and action buttons)
      const aiResponse = await emailChatService.processQuery(userMessage)
      
      console.log('AI Response received:', aiResponse) // Debug log
      
      // Handle both text-only and email card responses with actions
      const newAiMessage = {
        role: 'assistant',
        content: aiResponse.text || aiResponse,
        emails: aiResponse.emails || null,
        emailsTitle: aiResponse.title || null,
        hasMore: aiResponse.hasMore || false,
        totalCount: aiResponse.totalCount || 0,
        queryId: aiResponse.queryId || null,
        actions: aiResponse.actions || null,
        timestamp: new Date().toISOString()
      }

      console.log('New AI message with actions:', newAiMessage.actions) // Debug log

      setChatHistory(prev => [...prev, newAiMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }

      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle action button clicks
  const handleActionClick = async (action) => {
    if (processingAction) return
    
    setProcessingAction(true)
    
    try {
      // Add a user message showing what action was clicked
      const actionUserMessage = {
        role: 'user',
        content: `🔘 ${action.title}`,
        timestamp: new Date().toISOString(),
        isActionClick: true
      }
      
      setChatHistory(prev => [...prev, actionUserMessage])
      
      // Process the action
      const actionResult = await emailChatService.handleActionClick(action)
      
      // Add the result to chat
      const actionResponseMessage = {
        role: 'assistant',
        content: actionResult.text,
        emails: actionResult.emails || null,
        emailsTitle: actionResult.title || null,
        hasMore: actionResult.hasMore || false,
        totalCount: actionResult.totalCount || 0,
        queryId: actionResult.queryId || null,
        actions: actionResult.actions || null,
        timestamp: new Date().toISOString()
      }
      
      setChatHistory(prev => [...prev, actionResponseMessage])
      
      // Handle follow-up actions if any
      if (actionResult.followUpAction) {
        setTimeout(async () => {
          const followUpResult = await emailChatService.handleActionClick({
            type: actionResult.followUpAction.type,
            data: actionResult.followUpAction.data
          })
          
          const followUpMessage = {
            role: 'assistant',
            content: followUpResult.text,
            emails: followUpResult.emails || null,
            emailsTitle: followUpResult.title || null,
            hasMore: followUpResult.hasMore || false,
            totalCount: followUpResult.totalCount || 0,
            queryId: followUpResult.queryId || null,
            actions: followUpResult.actions || null,
            timestamp: new Date().toISOString()
          }
          
          setChatHistory(prev => [...prev, followUpMessage])
        }, 1000)
      }
      
    } catch (error) {
      console.error('Error handling action click:', error)
      
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while performing that action. Please try again.',
        timestamp: new Date().toISOString()
      }
      
      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setProcessingAction(false)
    }
  }

  // Handle loading more emails for a specific query
  const handleLoadMore = async (queryId) => {
    if (loadingMore.has(queryId)) return []
    
    setLoadingMore(prev => new Set(prev).add(queryId))
    
    try {
      const moreEmails = await emailChatService.loadMoreEmails(queryId, 10)
      
      // Update the chat history to reflect new hasMore state
      setChatHistory(prev => prev.map(msg => {
        if (msg.queryId === queryId) {
          return {
            ...msg,
            hasMore: emailChatService.hasMoreEmails(queryId)
          }
        }
        return msg
      }))
      
      return moreEmails
    } catch (error) {
      console.error('Error loading more emails:', error)
      return []
    } finally {
      setLoadingMore(prev => {
        const newSet = new Set(prev)
        newSet.delete(queryId)
        return newSet
      })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setChatHistory([])
    setLoadingMore(new Set())
    emailChatService.clearChatHistory()
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Custom markdown components for proper styling
  const markdownComponents = {
    // Headers
    h1: ({children}) => (
      <h1 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {children}
      </h1>
    ),
    h2: ({children}) => (
      <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {children}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className={`text-md font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
        {children}
      </h3>
    ),
    
    // Paragraphs
    p: ({children}) => (
      <p className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {children}
      </p>
    ),
    
    // Strong/Bold
    strong: ({children}) => (
      <strong className="font-semibold">
        {children}
      </strong>
    ),
    
    // Emphasis/Italic
    em: ({children}) => (
      <em className="italic">
        {children}
      </em>
    ),
    
    // Code blocks
    code: ({inline, children}) => {
      if (inline) {
        return (
          <code className={`px-1 py-0.5 rounded text-sm font-mono ${
            isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
          }`}>
            {children}
          </code>
        )
      }
      return (
        <pre className={`bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono my-3 overflow-x-auto ${
          isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          <code>{children}</code>
        </pre>
      )
    },
    
    // Lists
    ul: ({children}) => (
      <ul className={`list-disc list-inside mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {children}
      </ul>
    ),
    ol: ({children}) => (
      <ol className={`list-decimal list-inside mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {children}
      </ol>
    ),
    li: ({children}) => (
      <li className="mb-1">
        {children}
      </li>
    ),
    
    // Horizontal rule
    hr: () => (
      <hr className={`my-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} />
    ),
    
    // Blockquotes
    blockquote: ({children}) => (
      <blockquote className={`border-l-4 pl-4 my-3 italic ${
        isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'
      }`}>
        {children}
      </blockquote>
    ),
    
    // Links
    a: ({href, children}) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
      >
        {children}
      </a>
    )
  }

  return (
    <div className={`h-full w-full flex flex-col ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Fixed Header */}
      <div className={`flex-shrink-0 flex items-center justify-between p-4 border-b backdrop-blur-md ${
        isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/30 border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            
            <div className='flex items-center gap-2'>
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white-500" />
              <h1 className="text-lg font-semibold doto-title">CHAT</h1>
              <div className='flex items-center gap-2 font-light'>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentAccount} • {currentFilter} • {messages?.length || 0} emails
              </p>
              {!hasSubscription && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  usageCount >= dailyLimit 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {usageCount}/{dailyLimit} free
                </span>
              )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Refresh emails"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          <button
            onClick={clearChat}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Clear chat"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Content Area */}
      <div className={`flex-1 ${chatHistory.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        {chatHistory.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center p-4 space-y-6">
            <div className="text-center space-y-2">
              <SparklesIcon className="w-12 h-12 mx-auto text-blue-500" />
              <h2 className="text-xl font-semibold doto-title">FUSION CHAT</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                I can help you navigate, search, and manage your emails!
              </p>
            </div>
            
            <div className="space-y-2 w-full max-w-sm">
              <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Try asking me to:
              </p>
              <div className="space-y-1">
                {["Show me my unread emails", "Fetch emails about payments", "Find emails from GitHub", "Show me starred emails"].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300' 
                        : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-700'
                    }`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages with React Markdown */
          <div className="p-4 space-y-4">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                  }`}>
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[85%] ${message.role === 'user' ? 'max-w-[70%]' : ''}`}>
                  {/* Enhanced Text Message with React Markdown */}
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? message.isActionClick
                        ? isDarkMode 
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-500 text-white'
                        : isDarkMode 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-500 text-white'
                      : isDarkMode
                        ? 'bg-gray-800/50 text-gray-100'
                        : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm max-w-none">
                        <ReactMarkdown components={markdownComponents}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    <p className={`text-xs mt-2 opacity-70`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  {message.role === 'assistant' && message.actions && message.actions.length > 0 && (
                    <ActionButtons
                      actions={message.actions}
                      isDarkMode={isDarkMode}
                      onActionClick={handleActionClick}
                    />
                  )}
                  
                  {/* Email Cards */}
                  {message.role === 'assistant' && message.emails && message.emails.length > 0 && (
                    <div className="mt-3">
                      <EmailList
                        emails={message.emails}
                        isDarkMode={isDarkMode}
                        title={message.emailsTitle}
                        maxHeight="400px"
                        showQuickActions={true}
                        onArchive={onArchive}
                        onToggleRead={onToggleRead}
                        onToggleStar={onToggleStar}
                        emailSummaries={emailSummaries}
                        loadingSummaries={loadingSummaries}
                        hasMore={message.hasMore}
                        onLoadMore={() => handleLoadMore(message.queryId)}
                        isLoadingMore={loadingMore.has(message.queryId)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                }`}>
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <div className={`rounded-lg p-3 ${
                  isDarkMode ? 'bg-gray-800/50 text-gray-100' : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Input Area */}
      <div className={`flex-shrink-0 p-4 border-t backdrop-blur-md ${
        isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/30 border-gray-200'
      }`}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your emails..."
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !inputMessage.trim() || isLoading
                ? isDarkMode
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureName="email_chat"
        isDarkMode={isDarkMode}
      />
    </div>
  )
}

export default ChatPage 