import { useState, useEffect, useRef } from 'react'
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  ArchiveBoxIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  StarIcon,
  InboxIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { emailSummaryService } from '../utils/emailSummaryService'
import { subscriptionService } from '../utils/subscriptionService'

// Enhanced component for scrolling text with fade-in animation
const ScrollingText = ({ text, className }) => {
  const textRef = useRef(null)
  const containerRef = useRef(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [animationReady, setAnimationReady] = useState(false)

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth
      const containerWidth = containerRef.current.clientWidth
      setShouldScroll(textWidth > containerWidth)
    }
  }, [text])

  useEffect(() => {
    // Start fade-in immediately when text appears
    setIsVisible(true)
    
    // Delay the marquee animation to let fade-in complete first
    const timer = setTimeout(() => {
      setAnimationReady(true)
    }, 800) // Wait 800ms for fade-in to complete
    
    return () => clearTimeout(timer)
  }, [text])

  return (
    <div ref={containerRef} className="overflow-hidden flex-1 min-w-0">
      <div
        ref={textRef}
        className={`whitespace-nowrap transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        } ${shouldScroll && animationReady ? 'animate-marquee' : ''} ${className}`}
      >
        {text}
      </div>
    </div>
  )
}

function MessageList({ 
  messages, 
  accounts, 
  isDarkMode = true, 
  onArchive, 
  onToggleRead, 
  onToggleStar,
  messageFilter = 'all',
  selectedAccount = 'all',
  onAccountChange
}) {
  const [sortOrder, setSortOrder] = useState('desc')
  const [readFilter, setReadFilter] = useState('all')
  const [emailSummaries, setEmailSummaries] = useState(new Map())
  const [loadingSummaries, setLoadingSummaries] = useState(new Set())
  const [hasSubscription, setHasSubscription] = useState(false)

  const getAccountProfilePicture = (accountEmail) => {
    const account = accounts.find(acc => acc.email === accountEmail)
    
    // If we have a valid profile picture URL from Google, use it
    if (account?.profilePicture && account.profilePicture !== "https://www.gstatic.com/favicon.ico") {
      return account.profilePicture
    }
    
    // Otherwise, generate a consistent avatar based on email
    return generateAvatarUrl(accountEmail)
  }

  const generateAvatarUrl = (email) => {
    // Extract initials from email
    const username = email.split('@')[0]
    const initials = username.length >= 2 
      ? username.substring(0, 2).toUpperCase()
      : username.substring(0, 1).toUpperCase() + 'M'
    
    // Generate a consistent color based on email
    const colors = [
      '#1a73e8', '#34a853', '#ea4335', '#fbbc05', 
      '#9c27b0', '#ff6d01', '#0097a7', '#795548'
    ]
    
    let hash = 0
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colorIndex = Math.abs(hash) % colors.length
    const backgroundColor = colors[colorIndex]
    
    // Create SVG avatar
    const svg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="${backgroundColor}"/>
        <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${initials}</text>
      </svg>
    `
    
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  const sortMessages = (messages) => {
    return [...messages].sort((a, b) => {
      let comparison = 0
      
      // Apply read/unread filter if not set to 'all'
      if (readFilter !== 'all') {
        const wantUnread = readFilter === 'unread'
        if (a.isUnread !== b.isUnread) {
          return wantUnread ? (a.isUnread ? -1 : 1) : (a.isUnread ? 1 : -1)
        }
      }
      
      // Then apply date sort
      comparison = new Date(a.date) - new Date(b.date)
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const extractSenderName = (from) => {
    // Extract name from "Name <email@example.com>" format
    const match = from.match(/^([^<]+)/)
    return match ? match[1].trim() : from
  }

  const extractUsername = (email) => {
    // Extract username from email (part before @)
    return email.split('@')[0]
  }

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const handleAction = (e, action, message) => {
    e.stopPropagation() // Prevent message opening when clicking actions
    switch (action) {
      case 'archive':
        onArchive?.(message)
        break
      case 'toggleRead':
        onToggleRead?.(message)
        break
      case 'toggleStar':
        onToggleStar?.(message)
        break
    }
  }

  const QuickActionButton = ({ icon: Icon, label, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-full transition-colors ${
        !isDarkMode
          ? 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
          : 'hover:bg-gray-700 text-gray-400 hover:text-white'
      } ${isActive ? '!text-gmail-blue' : ''}`}
      title={label}
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  )

  const sortedMessages = sortMessages(messages)

  // Initialize service and load cached summaries
  useEffect(() => {
    const initializeAndLoadSummaries = async () => {
      await emailSummaryService.initialize()
      
      // Check subscription status to determine summary eligibility
      const subscriptionStatus = await subscriptionService.hasActiveSubscription()
      setHasSubscription(subscriptionStatus)
      
      // Load cached summaries for current messages
      const cachedSummaries = new Map()
      const needsProcessing = new Set()
      
      sortedMessages.forEach((message, index) => {
        // For free tier, only show summaries for top 3 emails
        const shouldShowSummary = subscriptionStatus || index < 3
        
        if (shouldShowSummary) {
          const summary = emailSummaryService.getSummaryFromCache(message)
          if (summary !== null) {
            cachedSummaries.set(message.id, summary)
          } else if (!emailSummaryService.isEmailProcessed(message)) {
            // Email needs processing
            needsProcessing.add(message.id)
          }
        }
      })
      
      setEmailSummaries(cachedSummaries)
      setLoadingSummaries(needsProcessing)
              console.log(`Loaded ${cachedSummaries.size} cached summaries, ${needsProcessing.size} emails need processing (${subscriptionStatus ? 'paid' : 'free'} tier)`)
    }

    if (sortedMessages.length > 0) {
      initializeAndLoadSummaries()
    }
  }, [sortedMessages.map(m => m.id).join(',')])

  // Background processing for new emails
  useEffect(() => {
    const processNewEmailsInBackground = async () => {
      if (sortedMessages.length === 0 || loadingSummaries.size === 0) return
      
      try {
        // For free tier: only process top 3 emails for summaries
        // For paid tier: process top 5 emails to conserve credits
        const maxEmailsToProcess = hasSubscription ? 5 : 3
        
        const emailsToProcess = sortedMessages
          .filter(msg => loadingSummaries.has(msg.id))
          .slice(0, maxEmailsToProcess)
        
        if (emailsToProcess.length === 0) return
        
        console.log(`Processing ${emailsToProcess.length} emails (${hasSubscription ? 'paid' : 'free'} tier)`)
        
        // Process emails one by one
        for (let i = 0; i < emailsToProcess.length; i++) {
          const message = emailsToProcess[i]
          
          try {
            // For free tier, only generate summaries for top 3 emails
            if (!hasSubscription && i >= 3) {
              console.log(`Skipping summary for email ${i + 1} (free tier limit: top 3 only)`)
              
              // Remove from loading set without generating summary
              setLoadingSummaries(prev => {
                const newSet = new Set(prev)
                newSet.delete(message.id)
                return newSet
              })
              continue
            }
            
            const summary = await emailSummaryService.generateSummaryInBackground(message)
            
            // Update the summary immediately when it's generated
            setEmailSummaries(prev => {
              const newMap = new Map(prev)
              if (summary) {
                newMap.set(message.id, summary)
              }
              return newMap
            })
            
            // Remove from loading set
            setLoadingSummaries(prev => {
              const newSet = new Set(prev)
              newSet.delete(message.id)
              return newSet
            })
            
            console.log(`Generated summary for email ${i + 1}/${emailsToProcess.length} (${message.id}):`, summary)
            
            // Small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000))
            
          } catch (error) {
            console.error(`Error processing email ${message.id}:`, error)
            
            // Remove from loading set even if failed
            setLoadingSummaries(prev => {
              const newSet = new Set(prev)
              newSet.delete(message.id)
              return newSet
            })
          }
        }
        
      } catch (error) {
        console.error('Error in background processing:', error)
      }
    }

    // Start background processing after a short delay
    const timeoutId = setTimeout(processNewEmailsInBackground, 1000)
    return () => clearTimeout(timeoutId)
  }, [sortedMessages.map(m => m.id).join(','), loadingSummaries.size])

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between gap-3 text-sm ${!isDarkMode ? 'text-gmail-gray' : 'text-gray-400'}`}>
        <div className="flex items-center gap-3">
          <span className="font-medium">Sort:</span>
          <button
            onClick={handleSort}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 backdrop-blur-md bg-gmail-blue/30 hover:bg-gmail-blue/70 text-white font-medium border border-white/40 shadow-lg hover:shadow-xl`}
          >
            <ClockIcon className="w-4 h-4" />
            <span>Recent</span>
            {sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />}
          </button>
          <button
            onClick={() => setReadFilter(prev => {
              // Cycle through states: all -> unread -> read -> all
              switch(prev) {
                case 'all': return 'unread'
                case 'unread': return 'read'
                case 'read': return 'all'
                default: return 'all'
              }
            })}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 backdrop-blur-md w-[100px] border shadow-lg hover:shadow-xl ${
              readFilter !== 'all'
                ? 'bg-gmail-blue/30 hover:bg-gmail-blue/70 text-white font-medium border-white/40' 
                : !isDarkMode
                  ? 'bg-gray-200/80 hover:bg-gray-300/80 text-gray-600 border-gray-300/30'
                  : 'bg-gray-700/30 hover:bg-gray-600/60 text-gray-200 border-gray-500/70 hover:border-gray-400/90'
            }`}
          >
            {readFilter === 'all' ? (
              <>
                <InboxIcon className="w-4 h-4" />
                <span>All</span>
              </>
            ) : readFilter === 'unread' ? (
              <>
                <EnvelopeIcon className="w-4 h-4" />
                <span>Unread</span>
              </>
            ) : (
              <>
                <EnvelopeOpenIcon className="w-4 h-4" />
                <span>Read</span>
              </>
            )}
          </button>
        </div>
        <select
          value={selectedAccount}
          onChange={(e) => onAccountChange(e.target.value)}
          className={`backdrop-blur-md border rounded-lg px-2 py-1.5 text-sm font-medium w-[140px] transition-all duration-200 shadow-lg hover:shadow-xl ${
            isDarkMode 
              ? 'border-gray-700/50 text-gray-300 hover:border-gray-500/70 focus:border-gray-500/70 bg-gray-800/40 hover:bg-gray-800/50'
              : 'border-gmail-gray/30 text-gmail-gray hover:border-gmail-blue/50 focus:border-gmail-blue/50 bg-white/40 hover:bg-white/50'
          } focus:outline-none`}
        >
          <option value="all" className={isDarkMode ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80'}>All Accounts</option>
          {accounts.map(account => (
            <option 
              key={account.email} 
              value={account.email}
              className={isDarkMode ? 'bg-gray-800/80 text-gray-300' : 'bg-white/80'}
            >
              {extractUsername(account.email)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 ">
        {sortedMessages.length > 0 ? (
          sortedMessages.map((message, index) => {
            const { date, time } = formatDate(message.date)
            const senderName = extractSenderName(message.from)
            const showArchive = messageFilter !== 'archive' && messageFilter !== 'sent'
            
            // Check if this email has a summary, is loading, or needs processing
            const hasSummary = emailSummaries.has(message.id) && emailSummaries.get(message.id)
            const isLoading = loadingSummaries.has(message.id)
            
            return (
              <div
                key={message.id}
                className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-md border shadow-md hover:shadow-lg ${
                  !isDarkMode 
                    ? 'hover:bg-white/60 bg-white/30 border-gray-200/30 hover:border-gray-300/50' 
                    : 'hover:bg-gray-800/60 bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50'
                } ${
                  index !== sortedMessages.length - 1 ? 'mb-2' : ''
                }`}
                onClick={() => window.open(`https://mail.google.com/mail/u/${message.accountEmail}/#inbox/${message.id}`, '_blank')}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`truncate ${
                        isDarkMode 
                          ? `text-lg ${message.isUnread ? 'font-medium' : 'font-light'} text-white` 
                          : `text-lg ${message.isUnread ? 'font-medium' : 'font-light'} text-gray-900`
                      }`}>
                        {senderName}
                      </div>
                      {/* Free tier indicator for top 3 emails */}
                      {!hasSubscription && index < 3 && (
                        <div className={`px-1.5 py-0.5 text-xs rounded-full ${
                          isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
                        }`}>
                          AI
                        </div>
                      )}
                      <div className={`flex-shrink-0 text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {time}
                      </div>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {showArchive && (
                          <QuickActionButton
                            icon={ArchiveBoxIcon}
                            label="Archive"
                            onClick={(e) => handleAction(e, 'archive', message)}
                          />
                        )}
                        {messageFilter !== 'sent' && (
                          <QuickActionButton
                            icon={message.isUnread ? EnvelopeOpenIcon : EnvelopeIcon}
                            label={message.isUnread ? "Mark as read" : "Mark as unread"}
                            onClick={(e) => handleAction(e, 'toggleRead', message)}
                          />
                        )}
                        <QuickActionButton
                          icon={message.isStarred ? StarIconSolid : StarIcon}
                          label={message.isStarred ? "Unstar" : "Star"}
                          onClick={(e) => handleAction(e, 'toggleStar', message)}
                          isActive={message.isStarred}
                        />
                      </div>
                    </div>
                    <div className={`truncate ${
                      isDarkMode ? 'text-sm font-light text-gray-300' : 'text-sm font-light text-gray-600'
                    }`}>
                      {message.subject}
                    </div>
                    
                    {/* Professional AI Summary Display with Fade-in and Smart Scrolling */}
                    {hasSummary ? (
                      <div className={`flex items-center gap-1.5 text-xs italic ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-600'
                      }`}>
                        <SparklesIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <ScrollingText 
                          text={emailSummaries.get(message.id)} 
                          className=""
                        />
                      </div>
                    ) : isLoading ? (
                      <div className={`flex items-center gap-1.5 truncate text-xs italic ${
                        isDarkMode ? 'text-yellow-300' : 'text-yellow-600'
                      }`}>
                        <ArrowPathIcon className="w-3.5 h-3.5 flex-shrink-0 animate-spin" />
                        <span>Generating summary...</span>
                      </div>
                    ) : !hasSubscription && index >= 3 ? (
                      <div className="space-y-1">
                        {/* Email content snippet for free tier users */}
                        <div className={`text-xs ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          {message.snippet && message.snippet.length > 0 
                            ? message.snippet.substring(0, 120) + (message.snippet.length > 120 ? '...' : '')
                            : 'No preview available'
                          }
                        </div>
                        {/* Upgrade prompt */}
                        <div className={`flex items-center gap-1.5 text-xs italic ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          <SparklesIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                          <span>Upgrade for AI summaries</span>
                        </div>
                      </div>
                    ) : message.snippet && message.snippet.length > 0 ? (
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {message.snippet.substring(0, 120) + (message.snippet.length > 120 ? '...' : '')}
                      </div>
                    ) : null}
                  </div>
                  <div className={`text-xs text-right flex flex-col items-end font-medium ${
                    !isDarkMode ? 'text-gmail-gray' : 'text-gray-500'
                  }`}>
                    <div>{date}</div>
                    <div>{time}</div>
                    <div className="mt-2">
                      <img
                        src={getAccountProfilePicture(message.accountEmail)}
                        alt={`${message.accountEmail}'s profile`}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://www.gstatic.com/favicon.ico";
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className={`text-center py-4 font-medium ${
            !isDarkMode ? 'text-gmail-gray' : 'text-gray-400'
          }`}>
            No messages to display in {messageFilter.toLowerCase()}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageList 