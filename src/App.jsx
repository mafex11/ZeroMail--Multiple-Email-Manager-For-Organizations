import { useState, useEffect } from 'react'
import { Cog6ToothIcon, PlusIcon, EnvelopeIcon, ArrowPathIcon, SunIcon, MoonIcon, InboxIcon, PaperAirplaneIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { ShimmerButton } from './components/magicui/shimmer-button'
import MessageList from './components/MessageList'
import SettingsPage from './components/SettingsPage'
import AvatarPage from './components/AvatarPage'
import OTPIndicator from './components/OTPIndicator'
import { mockMessages } from './mockData'
import { otpService } from './utils/otpService'
import { performanceMonitor } from './utils/performance'
import bgImage from './assets/bg.png'
import logo from './assets/email-envelope-close--Streamline-Pixel.svg'
import ChatPage from './components/ChatPage'
import './styles.css'

const clientId = '5870068255-c7vvtfeb7ol54qcto4fpr5nl45b4sp72.apps.googleusercontent.com'
const clientSecret = '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'
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels'
].join(' ')

function App() {
  const [accounts, setAccounts] = useState([])
  const [messages, setMessages] = useState({ inbox: [], sent: [], all: [] })
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState('main')
  const [messageFilter, setMessageFilter] = useState('inbox')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [bgLoaded, setBgLoaded] = useState(false)

  // Background refresh interval (30 seconds - reduced frequency)
  useEffect(() => {
    // Don't set up interval if no accounts
    if (accounts.length === 0) return;

    const intervalId = setInterval(async () => {
      if (!refreshing) { // Only refresh if not already refreshing
        console.log('Starting background refresh...');
        try {
          setRefreshing(true);
          await Promise.all([
            loadMessages(accounts, 'all'),
            loadMessages(accounts, 'inbox'),
            loadMessages(accounts, 'sent')
          ]);
        } catch (error) {
          console.error('Background refresh failed:', error);
          // Don't show error to user for background refreshes
        } finally {
          setRefreshing(false);
        }
      }
    }, 30000); // 30 seconds (reduced from 15)

    // Cleanup interval on unmount or when accounts change
    return () => clearInterval(intervalId);
  }, [accounts]); // Removed refreshing dependency to prevent recreation

  // Preload background image
  useEffect(() => {
    const img = new Image()
    img.src = bgImage
    img.onload = () => setBgLoaded(true)
  }, [])

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setError(null)
        
        // Initialize OTP service
        otpService.startMonitoring()
        
        // For development, use mock data
        if (import.meta.env.DEV) {
          const mockInbox = mockMessages.filter(msg => !msg.isSent)
          const mockSent = mockMessages.filter(msg => msg.isSent)
          const mockAll = mockMessages
          setMessages({
            inbox: mockInbox,
            sent: mockSent,
            all: mockAll
          })
          setAccounts([
            { 
              email: 'user1@gmail.com', 
              accessToken: 'mock-token-1',
              profilePicture: 'https://lh3.googleusercontent.com/a/default-user=s32-c'
            },
            { 
              email: 'user2@gmail.com', 
              accessToken: 'mock-token-2',
              profilePicture: 'https://lh3.googleusercontent.com/a/default-user=s32-c'
            }
          ])
          
          // Process mock messages for OTP detection in development
          console.log('Processing mock messages for OTP detection...')
          otpService.processMessages(mockAll)
          
          setLoading(false)
          setInitializing(false)
          return
        }

        // Load accounts and cached messages first
        const storage = await chrome.storage.local.get(['accounts', 'cachedMessages', 'isDarkMode'])
        const savedAccounts = storage.accounts || []
        const cachedMessages = storage.cachedMessages || { inbox: [], sent: [], all: [] }
        
        // Set initial state from cache immediately
        setAccounts(savedAccounts)
        setIsDarkMode(storage.isDarkMode ?? true)
        setMessages(cachedMessages)
        
        // If we have cached messages or no accounts, we can stop loading
        if (cachedMessages.all.length > 0 || savedAccounts.length === 0) {
          setLoading(false)
        }
        
        // Always set initializing to false after initial data load
        setInitializing(false)

        // If we have accounts, refresh ALL message types for ALL accounts in background
        if (savedAccounts.length > 0) {
          console.log('Starting background refresh for all accounts...')
          setRefreshing(true)
          try {
            // Load all message types in parallel for all accounts
            const messageTypes = ['all', 'inbox', 'sent']
            const refreshPromises = messageTypes.map(type => loadMessages(savedAccounts, type))
            
            // Wait for all message types to load
            const results = await Promise.all(refreshPromises)
            console.log('Background refresh completed:', results)
            
            // Update cache with fresh data
            const freshMessages = {
              inbox: results[1],
              sent: results[2],
              all: results[0]
            }
            
            // Set the fresh messages
            setMessages(freshMessages)
            
            // Update cache
            await chrome.storage.local.set({
              cachedMessages: freshMessages,
              lastFetch: Date.now()
            })
          } catch (error) {
            console.error('Error refreshing messages:', error)
            setError('Some messages failed to load. Please try refreshing.')
          } finally {
            setRefreshing(false)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error)
        setError('Failed to initialize. Please try again.')
        setLoading(false)
        setInitializing(false)
      }
    }

    initializeApp()
  }, [])

  // Helper function to refresh access tokens
  const refreshAccessToken = async (account) => {
    try {
      console.log(`Refreshing token for ${account.email}...`)
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: account.refreshToken,
          grant_type: 'refresh_token'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Token refresh failed:', errorText)
        throw new Error('Failed to refresh token')
      }

      const tokenData = await response.json()
      console.log(`Token refreshed successfully for ${account.email}`)
      
      // Update account with new token and expiry
      const updatedAccount = {
        ...account,
        accessToken: tokenData.access_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000)
      }

      // Update in storage
      const result = await chrome.storage.local.get('accounts')
      const existingAccounts = result.accounts || []
      const updatedAccounts = existingAccounts.map(acc => 
        acc.email === account.email ? updatedAccount : acc
      )
      await chrome.storage.local.set({ accounts: updatedAccounts })
      
      // Update in state
      setAccounts(updatedAccounts)
      
      return updatedAccount
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw error
    }
  }

  // Helper function to ensure valid token before API calls
  const ensureValidToken = async (account) => {
    const now = Date.now()
    const expiryBuffer = 5 * 60 * 1000 // Refresh 5 minutes before expiry
    
    if (!account.expiresAt || account.expiresAt - now < expiryBuffer) {
      console.log(`Token expiring soon for ${account.email}, refreshing...`)
      const refreshedAccount = await refreshAccessToken(account)
      return refreshedAccount.accessToken
    }
    
    return account.accessToken
  }

  const refreshMessages = async () => {
    return performanceMonitor.measureAsync('refreshMessages', async () => {
      try {
        setRefreshing(true)
        setError(null)
        console.log('Starting message refresh...')
        // Refresh all mail types in parallel
        await Promise.all([
          loadMessages(accounts, messageFilter),
          messageFilter === 'all' ? loadMessages(accounts, 'all') : Promise.resolve()
        ])
        console.log('Messages refreshed successfully')
      } catch (error) {
        console.error('Error during refresh:', error)
        setError('Failed to refresh messages. Please try again.')
      } finally {
        setRefreshing(false)
      }
    })
  }

  const loadMessages = async (accountsToLoad, type = 'inbox') => {
    return performanceMonitor.measureAsync(`loadMessages-${type}`, async () => {
    try {
      if (!accountsToLoad || accountsToLoad.length === 0) {
        return []
      }

      const allMessages = []
      const failedAccounts = []

      // Process each account in parallel
      const accountPromises = accountsToLoad.map(async account => {
        try {
          // Ensure we have a valid token before making API calls
          const validAccessToken = await ensureValidToken(account)
          
          // Verify the token still works
          const testResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${validAccessToken}` }
          })

          if (!testResponse.ok) {
            console.error(`Token invalid for ${account.email}`)
            failedAccounts.push(account.email)
            return []
          }

          // Construct query based on type
          let query = ''
          switch (type) {
            case 'inbox':
              query = 'label:inbox category:primary -in:spam -in:trash'
              break
            case 'sent':
              query = 'in:sent -in:spam -in:trash'
              break
            case 'all':
              query = '-in:spam -in:trash -in:drafts'
              break
            default:
              query = 'label:inbox category:primary -in:spam -in:trash'
          }

          // Fetch message list
          const messagesResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=${encodeURIComponent(query)}`,
            {
              headers: {
                Authorization: `Bearer ${validAccessToken}`,
              },
            }
          )

          if (!messagesResponse.ok) {
            throw new Error(`Failed to fetch messages: ${messagesResponse.statusText}`)
          }

          const data = await messagesResponse.json()
          
          // Check if no messages were found (this is normal, not an error)
          if (!data.messages) {
            console.log(`No messages found for ${account.email} in ${type}`)
            return []
          }
          
          if (!Array.isArray(data.messages)) {
            console.error(`Invalid message data for ${account.email}:`, JSON.stringify(data, null, 2))
            return []
          }

          // Fetch all message details in parallel
          const detailsPromises = data.messages.map(message =>
                          fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
              {
                headers: {
                  Authorization: `Bearer ${validAccessToken}`,
                },
              }
            ).then(async (messageResponse) => {
              if (!messageResponse.ok) {
                throw new Error(`Failed to fetch message details: ${messageResponse.statusText}`)
              }
              const messageData = await messageResponse.json()
              
              if (!messageData || !messageData.payload || !messageData.payload.headers) {
                console.error('Invalid message data structure:', messageData)
                return null
              }

              const headers = messageData.payload.headers
              const subject = headers.find((h) => h.name === 'Subject')?.value || '(No Subject)'
              const from = headers.find((h) => h.name === 'From')?.value || 'Unknown'
              const date = headers.find((h) => h.name === 'Date')?.value || new Date().toISOString()
              const labels = messageData.labelIds || []
              const isUnread = labels.includes('UNREAD')
              const isSent = labels.includes('SENT')
              const isInbox = labels.includes('INBOX')

              return {
                id: message.id,
                subject,
                from,
                date: new Date(date).toISOString(),
                snippet: messageData.snippet || '',
                accountEmail: account.email,
                isUnread,
                isSent,
                isInbox,
                labels,
                messageType: type
              }
            }).catch(error => {
              console.error(`Error processing message:`, error)
              return null
            })
          )

          const messages = await Promise.all(detailsPromises)
          return messages.filter(msg => msg !== null)
        } catch (error) {
          console.error(`Error processing account ${account.email}:`, error)
          failedAccounts.push(account.email)
          return []
        }
      })

      // Wait for all accounts to be processed
      const accountResults = await Promise.all(accountPromises)
      allMessages.push(...accountResults.flat())

      // Remove failed accounts
      if (failedAccounts.length > 0) {
        const validAccounts = accounts.filter(acc => !failedAccounts.includes(acc.email))
        await chrome.storage.local.set({ accounts: validAccounts })
        setAccounts(validAccounts)
        
        if (failedAccounts.length === accountsToLoad.length) {
          setError('Failed to load messages. Please try adding your account again.')
          return []
        }
      }

      // Sort messages by date
      const sortedMessages = allMessages.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      // Process messages for OTP detection
      if (sortedMessages.length > 0) {
        otpService.processMessages(sortedMessages)
      }
      
      // Return the sorted messages
      return sortedMessages

    } catch (error) {
      console.error('Error in loadMessages:', error)
      setError('Failed to load messages. Please try again.')
      return []
    }
    })
  }

  const handleAddAccount = async () => {
    return performanceMonitor.measureAsync('addAccount', async () => {
    try {
      setError(null)
      setLoading(true)
      console.log('Starting account addition process...')
      
      const redirectUri = chrome?.identity?.getRedirectURL?.()
      if (!redirectUri) {
        throw new Error('Unable to get redirect URI from Chrome extension')
      }
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `scope=${encodeURIComponent(SCOPES)}`
      
      console.log('Auth URL:', authUrl)
      console.log('Launching OAuth flow...')
      
      let responseUrl
      try {
        responseUrl = await chrome.identity.launchWebAuthFlow({
          url: authUrl,
          interactive: true
        })
        console.log('OAuth flow completed successfully')
        console.log('Response URL:', responseUrl) // Log the full response URL for debugging
      } catch (oauthError) {
        console.error('OAuth flow failed:', oauthError)
        throw new Error(`OAuth failed: ${oauthError.message}`)
      }

      if (!responseUrl) {
        console.error('OAuth flow returned no URL')
        throw new Error('Authentication was cancelled or failed')
      }

      console.log('Processing OAuth response...')
      let authorizationCode
      try {
        const url = new URL(responseUrl)
        const urlParams = new URLSearchParams(url.search)
        authorizationCode = urlParams.get('code')
        
        if (!authorizationCode) {
          console.error('No authorization code in response URL')
          throw new Error('No authorization code received')
        }
        console.log('Authorization code extracted successfully')
      } catch (urlError) {
        console.error('Failed to parse response URL:', urlError)
        throw new Error('Failed to process authentication response')
      }

      // Exchange authorization code for tokens
      console.log('Exchanging authorization code for tokens...')
      let tokenData
      try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: authorizationCode,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
          })
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          console.error('Token exchange failed:', errorText)
          throw new Error('Failed to exchange authorization code for tokens')
        }

        tokenData = await tokenResponse.json()
        console.log('Token exchange successful')
      } catch (tokenError) {
        console.error('Failed to exchange tokens:', tokenError)
        throw new Error('Failed to get access tokens')
      }

      // Verify the token works by fetching user info
      console.log('Verifying token with userinfo endpoint...')
      let userInfo
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json'
          }
        })
        
        if (!userInfoResponse.ok) {
          console.error('User info response not OK:', {
            status: userInfoResponse.status,
            statusText: userInfoResponse.statusText
          })
          const errorText = await userInfoResponse.text()
          console.error('Error response:', errorText)
          throw new Error('Failed to verify account access')
        }

        userInfo = await userInfoResponse.json()
        console.log('User info fetched successfully:', userInfo)
      } catch (userInfoError) {
        console.error('Failed to fetch user info:', userInfoError)
        throw new Error('Failed to verify account')
      }

      // Check if account already exists
      console.log('Checking for existing account...')
      let existingAccounts = []
      try {
        const result = await chrome.storage.local.get('accounts')
        existingAccounts = result.accounts || []
        
        if (existingAccounts.some(acc => acc.email === userInfo.email)) {
          console.log('Account already exists')
          throw new Error('This account is already connected')
        }
      } catch (storageError) {
        console.error('Storage access failed:', storageError)
        throw new Error('Failed to check existing accounts')
      }

      // Add new account
      console.log('Adding new account to storage...')
      const newAccount = {
        email: userInfo.email,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: Date.now() + (tokenData.expires_in * 1000),
        profilePicture: userInfo.picture // Google OAuth returns the picture URL in userInfo
      }

      try {
        const updatedAccounts = [...existingAccounts, newAccount]
        await chrome.storage.local.set({ accounts: updatedAccounts })
        setAccounts(updatedAccounts)
        console.log('Account added successfully')
        
        // Load messages for ALL accounts (including the new one)
        console.log('Loading messages for all accounts including new account...')
        const [allMessages, inboxMessages, sentMessages] = await Promise.all([
          loadMessages(updatedAccounts, 'all'),
          loadMessages(updatedAccounts, 'inbox'),
          loadMessages(updatedAccounts, 'sent')
        ])
        
        // Update the messages state immediately
        setMessages({
          all: allMessages,
          inbox: inboxMessages,
          sent: sentMessages
        })
        
        // Update cache with the new messages
        await chrome.storage.local.set({
          cachedMessages: {
            all: allMessages,
            inbox: inboxMessages,
            sent: sentMessages
          },
          lastFetch: Date.now()
        })
        
        console.log('Messages loaded and state updated successfully')
      } catch (saveError) {
        console.error('Failed to save account or load messages:', saveError)
        throw new Error('Failed to save account')
      }

    } catch (error) {
      console.error('Account addition failed:', error)
      setError(error.message || 'Failed to add account. Please try again.')
    } finally {
      setLoading(false)
    }
    })
  }

  const handleRemoveAccount = async (emailToRemove) => {
    try {
      const result = await chrome.storage.local.get('accounts')
      const existingAccounts = result.accounts || []
      const updatedAccounts = existingAccounts.filter(account => account.email !== emailToRemove)
      
      await chrome.storage.local.set({ accounts: updatedAccounts })
      setAccounts(updatedAccounts)
      await Promise.all([
        loadMessages(updatedAccounts, 'all'),
        loadMessages(updatedAccounts, 'inbox'),
        loadMessages(updatedAccounts, 'sent')
      ])
    } catch (error) {
      console.error('Error removing account:', error)
    }
  }

  const handleArchive = async (message) => {
    return performanceMonitor.measureAsync('archiveMessage', async () => {
    try {
      const account = accounts.find(acc => acc.email === message.accountEmail)
      if (!account) return

      // Ensure we have a valid token
      const validAccessToken = await ensureValidToken(account)

      // Call Gmail API to archive the message
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}/modify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${validAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            removeLabelIds: ['INBOX'],
            addLabelIds: ['ARCHIVE']
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to archive message')
      }

      // Update all message lists in state immediately
      const updatedMessage = { 
        ...message, 
        isInbox: false, 
        labels: message.labels.filter(l => l !== 'INBOX').concat(['ARCHIVE']) 
      }

      // Remove from current view if we're in inbox or all view
      setMessages(prev => {
        const newState = { ...prev }
        
        // Always remove from inbox
        newState.inbox = prev.inbox.filter(msg => msg.id !== message.id)
        
        // Keep in sent if it was there
        if (message.isSent) {
          newState.sent = prev.sent.map(msg => 
            msg.id === message.id ? updatedMessage : msg
          )
        } else {
          newState.sent = prev.sent.filter(msg => msg.id !== message.id)
        }
        
        // Update in all messages list but don't show in main views
        newState.all = prev.all.map(msg => 
          msg.id === message.id ? updatedMessage : msg
        ).filter(msg => 
          messageFilter === 'sent' ? msg.isSent : msg.isInbox || msg.isSent
        )
        
        return newState
      })
      
      // Update cache
      const storage = await chrome.storage.local.get('cachedMessages')
      const cachedMessages = storage.cachedMessages || { inbox: [], sent: [], all: [] }
      await chrome.storage.local.set({
        cachedMessages: {
          ...cachedMessages,
          inbox: cachedMessages.inbox.filter(msg => msg.id !== message.id),
          sent: message.isSent 
            ? cachedMessages.sent.map(msg => msg.id === message.id ? updatedMessage : msg)
            : cachedMessages.sent.filter(msg => msg.id !== message.id),
          all: cachedMessages.all.map(msg => 
            msg.id === message.id ? updatedMessage : msg
          )
        }
      })
    } catch (error) {
      console.error('Error archiving message:', error)
      setError('Failed to archive message. Please try again.')
    }
    })
  }

  const handleToggleRead = async (message) => {
    try {
      const account = accounts.find(acc => acc.email === message.accountEmail)
      if (!account) return

      // Ensure we have a valid token
      const validAccessToken = await ensureValidToken(account)

      const newIsUnread = !message.isUnread
      
      // Call Gmail API to toggle read status
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}/modify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${validAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            removeLabelIds: newIsUnread ? [] : ['UNREAD'],
            addLabelIds: newIsUnread ? ['UNREAD'] : []
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update message read status')
      }

      // Update all message lists in state immediately
      const updatedMessage = { ...message, isUnread: newIsUnread }

      setMessages(prev => ({
        ...prev,
        inbox: prev.inbox.map(msg => msg.id === message.id ? updatedMessage : msg),
        sent: prev.sent.map(msg => msg.id === message.id ? updatedMessage : msg),
        all: prev.all.map(msg => msg.id === message.id ? updatedMessage : msg)
      }))
      
      // Update cache
      const storage = await chrome.storage.local.get('cachedMessages')
      const cachedMessages = storage.cachedMessages || { inbox: [], sent: [], all: [] }
      await chrome.storage.local.set({
        cachedMessages: {
          ...cachedMessages,
          inbox: cachedMessages.inbox.map(msg => msg.id === message.id ? updatedMessage : msg),
          sent: cachedMessages.sent.map(msg => msg.id === message.id ? updatedMessage : msg),
          all: cachedMessages.all.map(msg => msg.id === message.id ? updatedMessage : msg)
        }
      })
    } catch (error) {
      console.error('Error toggling message read status:', error)
      setError('Failed to update message status. Please try again.')
    }
  }

  const handleToggleStar = async (message) => {
    try {
      const account = accounts.find(acc => acc.email === message.accountEmail)
      if (!account) return

      // Ensure we have a valid token
      const validAccessToken = await ensureValidToken(account)

      const newIsStarred = !message.isStarred
      
      // Call Gmail API to toggle star status
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}/modify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${validAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            removeLabelIds: newIsStarred ? [] : ['STARRED'],
            addLabelIds: newIsStarred ? ['STARRED'] : []
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update message star status')
      }

      // Update all message lists in state immediately
      const updatedMessage = { ...message, isStarred: newIsStarred }

      setMessages(prev => ({
        ...prev,
        inbox: prev.inbox.map(msg => msg.id === message.id ? updatedMessage : msg),
        sent: prev.sent.map(msg => msg.id === message.id ? updatedMessage : msg),
        all: prev.all.map(msg => msg.id === message.id ? updatedMessage : msg)
      }))
      
      // Update cache
      const storage = await chrome.storage.local.get('cachedMessages')
      const cachedMessages = storage.cachedMessages || { inbox: [], sent: [], all: [] }
      await chrome.storage.local.set({
        cachedMessages: {
          ...cachedMessages,
          inbox: cachedMessages.inbox.map(msg => msg.id === message.id ? updatedMessage : msg),
          sent: cachedMessages.sent.map(msg => msg.id === message.id ? updatedMessage : msg),
          all: cachedMessages.all.map(msg => msg.id === message.id ? updatedMessage : msg)
        }
      })
    } catch (error) {
      console.error('Error toggling message star status:', error)
      setError('Failed to update message status. Please try again.')
    }
  }

  const sortedMessages = () => {
    return performanceMonitor.measure('sortMessages', () => {
      let filtered = [];
      
      // Select message list based on filter
      switch (messageFilter) {
        case 'inbox':
          filtered = [...messages.inbox];
          break;
        case 'sent':
          filtered = [...messages.sent];
          break;
        case 'all':
          filtered = [...messages.all];
          break;
        default:
          filtered = [...messages.all];
      }
      
      // Filter by selected account
      if (selectedAccount !== 'all') {
        filtered = filtered.filter(msg => msg.accountEmail === selectedAccount);
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim()
        filtered = filtered.filter(msg => 
          msg.subject.toLowerCase().includes(term) ||
          msg.from.toLowerCase().includes(term) ||
          msg.snippet.toLowerCase().includes(term)
        )
      }

      // Sort messages by date (most recent first)
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Limit to 20 emails for all categories
      return filtered.slice(0, 20);
    });
  };

  const FilterButton = ({ type, icon: Icon, label }) => {
    return (
      <button
        onClick={() => {
          setMessageFilter(type)
        }}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 backdrop-blur-md border shadow-lg hover:shadow-xl ${
                      messageFilter === type
              ? isDarkMode 
                ? 'bg-gmail-blue/30 hover:bg-gmail-blue/70 text-white font-medium border-white/40'
                : 'bg-gmail-blue/30 hover:bg-gmail-blue/70 text-white font-medium border-white/40'
            : isDarkMode
              ? 'text-gray-400 hover:bg-gray-700/80 bg-gray-800/40 border-gray-600/70 hover:border-gray-500/90'
              : 'text-gmail-gray hover:bg-white/60 bg-white/30 border-gray-300/30 hover:border-gray-400/50'
        }`}
      >
        <Icon className={`h-4 w-4 ${
          messageFilter === type ? 'text-white' : ''
        }`} />
        <span>{label}</span>
      </button>
    )
  }

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    await chrome.storage.local.set({ isDarkMode: newDarkMode })
  }

  // Add this new function for expanded Gmail search
  const performGmailSearch = async (query, accountEmail = 'all') => {
    try {
      const accountsToSearch = accountEmail === 'all' ? accounts : accounts.filter(acc => acc.email === accountEmail)
      const searchResults = []
      
      for (const account of accountsToSearch) {
        try {
          // Ensure we have a valid token
          const validAccessToken = await ensureValidToken(account)
          
          // Use Gmail API to search with the query
          const response = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=100&q=${encodeURIComponent(query)}`,
            {
              headers: {
                Authorization: `Bearer ${validAccessToken}`,
              },
            }
          )
          
          if (!response.ok) continue
          
          const data = await response.json()
          if (!data.messages) continue
          
          // Fetch details for found messages
          const messagePromises = data.messages.slice(0, 50).map(async (msg) => {
            const msgResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
              {
                headers: {
                  Authorization: `Bearer ${validAccessToken}`,
                },
              }
            )
            
            if (!msgResponse.ok) return null
            
            const msgData = await msgResponse.json()
            const headers = msgData.payload.headers
            
            return {
              id: msg.id,
              subject: headers.find(h => h.name === 'Subject')?.value || '(No Subject)',
              from: headers.find(h => h.name === 'From')?.value || 'Unknown',
              date: headers.find(h => h.name === 'Date')?.value || new Date().toISOString(),
              snippet: msgData.snippet || '',
              accountEmail: account.email
            }
          })
          
          const messages = await Promise.all(messagePromises)
          searchResults.push(...messages.filter(msg => msg !== null))
          
        } catch (error) {
          console.error(`Search failed for account ${account.email}:`, error)
        }
      }
      
      return searchResults.sort((a, b) => new Date(b.date) - new Date(a.date))
      
    } catch (error) {
      console.error('Gmail search failed:', error)
      throw error
    }
  }

  if (initializing) {
    return (
      <div className={`w-[500px] h-[600px] ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gmail-blue border-t-transparent"></div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`w-[500px] h-[600px] flex flex-col ${isDarkMode ? 'dark' : ''} transition-[background-image] duration-300`}
      style={{
        ...(bgLoaded && {
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'left'
        }),
        backgroundColor: isDarkMode ? 'rgb(17, 24, 39)' : 'rgb(243, 244, 246)'
      }}
    >
      <div className={`flex items-center justify-between p-4 border-b backdrop-blur-md ${
        isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/30 border-gray-200'
      } sticky top-0 z-10`}>
        <div className="flex items-center gap-2">
          <img 
            src={logo} 
            alt="Fusion Mail Logo" 
            className={`w-8 h-8 transition-all ${
              isDarkMode 
                ? 'brightness-0 invert' // Makes the logo white in dark mode
                : 'brightness-100 invert-0 text-gmail-blue' // Original color in light mode
            }`}
          />
          <div className={`font-semibold text-2xl tracking-tight select-none doto-title ${
            isDarkMode ? 'text-white' : 'text-gmail-blue'
          }`}>
            FUSION MAIL
          </div>
          {/* Shimmer Chat Button */}
          <ShimmerButton
            onClick={() => setCurrentPage('chat')}
            className="ml-3 px-3 py-1.5 text-sm text-white"
            shimmerColor={isDarkMode ? "#ffffff" : "#ffffff"}
            textColor="#ffffff"
            borderRadius="100px"
            shimmerDuration="1s"
            background="rgba(20, 20, 150, 1)"
            
          >
            {/* <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1 text-white" /> */}
            <p className='text-white doto-title'>Fusion AI</p>
          </ShimmerButton>
        </div>
        <div className={`flex items-center gap-2`}>
          <button 
            onClick={refreshMessages}
            disabled={refreshing}
            className={`p-2 rounded-full transition-colors ${
              refreshing 
                ? 'text-white/50 cursor-not-allowed'
                : 'text-white hover:bg-white/10'
            }`}
            aria-label="Refresh"
          >
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={handleAddAccount}
            className="p-2 rounded-full transition-colors text-white hover:bg-white/10"
            aria-label="Add Account"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
          <button 
            onClick={() => setCurrentPage('settings')}
            className="p-2 rounded-full transition-colors text-white hover:bg-white/10"
            aria-label="Settings"
          >
            <Cog6ToothIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden backdrop-blur-md bg-black/5 relative">
        {/* Main Page */}
        <div className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          currentPage === 'main' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } overflow-y-scroll scroll-smooth`}>
          <div className={`p-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            {error && (
              <div className="mb-4 p-3 backdrop-blur-md bg-red-500/20 border border-red-400/40 text-red-100 rounded-lg text-sm flex items-center justify-between shadow-lg">
                <span className="font-medium">{error}</span>
                <button 
                  onClick={() => setError(null)} 
                  className="text-red-200 hover:text-red-100 font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            <div className="flex flex-col gap-4">
              {/* OTP Indicator */}
              <OTPIndicator isDarkMode={isDarkMode} />
              
              {/* Filter buttons and search */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <FilterButton type="all" icon={EnvelopeIcon} label="All" />
                  <FilterButton type="inbox" icon={InboxIcon} label="Inbox" />
                  <FilterButton type="sent" icon={PaperAirplaneIcon} label="Sent" />
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search emails..."
                    className={`pl-9 pr-3 py-1.5 rounded-full text-sm transition-all duration-200 backdrop-blur-md border shadow-lg hover:shadow-xl focus:shadow-xl w-[200px] focus:outline-none ${
                      isDarkMode
                        ? 'bg-gray-800/40 hover:bg-gray-800/50 focus:bg-gray-800/60 text-gray-200 placeholder-gray-400 border-white/50'
                        : 'bg-white/40 hover:bg-white/50 focus:bg-white/60 text-gray-800 placeholder-gray-500 border-white/50'
                    }`}
                  />
                  <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-white" />
                </div>
              </div>

              {accounts.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-[400px] ${
                  isDarkMode ? 'text-gray-400' : 'text-gmail-gray'
                }`}>
                  <p className="mb-2 font-medium">No accounts connected</p>
                  <button
                    onClick={handleAddAccount}
                    className={`font-medium ${
                      isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-gmail-blue hover:text-gmail-hover'
                    }`}
                  >
                    Add your first account
        </button>
                </div>
              ) : messages.all.length === 0 && !refreshing ? (
                <div className={`flex items-center justify-center h-[400px] ${
                  isDarkMode ? 'text-gray-400' : 'text-gmail-gray'
                }`}>
                  <span className="font-medium">No messages to display</span>
                </div>
              ) : (
                <MessageList 
                  messages={sortedMessages()} 
                  accounts={accounts}
                  isDarkMode={isDarkMode}
                  onArchive={handleArchive}
                  onToggleRead={handleToggleRead}
                  onToggleStar={handleToggleStar}
                  messageFilter={messageFilter}
                  selectedAccount={selectedAccount}
                  onAccountChange={setSelectedAccount}
                />
              )}
            </div>
          </div>
        </div>

        {/* Settings Page */}
        <div className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          currentPage === 'settings' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } overflow-y-scroll scroll-smooth`}>
          <SettingsPage 
            accounts={accounts} 
            onAddAccount={handleAddAccount} 
            onRemoveAccount={handleRemoveAccount}
            onBack={() => setCurrentPage('main')}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Avatar Page */}
        <div className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          currentPage === 'avatar' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } overflow-y-scroll scroll-smooth`}>
          <AvatarPage onBack={() => setCurrentPage('main')} isDarkMode={isDarkMode} />
        </div>

        {/* Enhanced Chat Page with Full Extension Access */}
        <div className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          currentPage === 'chat' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <ChatPage 
            onBack={() => setCurrentPage('main')}
            isDarkMode={isDarkMode}
            messages={sortedMessages()}
            accounts={accounts}
            currentAccount={selectedAccount}
            currentFilter={messageFilter}
            onAccountChange={(account) => {
              setSelectedAccount(account)
              if (account !== 'all') {
                loadMessages(accounts.filter(acc => acc.email === account), messageFilter)
              }
            }}
            onFilterChange={(filter) => {
              setMessageFilter(filter)
            }}
            onRefresh={refreshMessages}
            onSearch={(query) => {
              setSearchTerm(query)
              setCurrentPage('main')
            }}
            onPerformGmailSearch={performGmailSearch}
            onArchive={handleArchive}
            onToggleRead={handleToggleRead}
            onToggleStar={handleToggleStar}
            emailSummaries={new Map()}
            loadingSummaries={new Set()}
          />
        </div>
      </div>
    </div>
  )
}

export default App


