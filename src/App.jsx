import { useState, useEffect } from 'react'
import { Cog6ToothIcon, PlusIcon, EnvelopeIcon, ArrowPathIcon, SunIcon, MoonIcon, InboxIcon, PaperAirplaneIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import MessageList from './components/MessageList'
import SettingsPage from './components/SettingsPage'
import AvatarPage from './components/AvatarPage'
import { mockMessages } from './mockData'
import bgImage from './assets/bg.png'
import logo from './assets/email-envelope-close--Streamline-Pixel.svg'
import './styles.css'

const clientId = '78669493829-j94lrbse4jre3slbe2ol613sbn288mqf.apps.googleusercontent.com'
const redirectUri = 'https://nmgohjeebbjdpackknbamacpelkkbmcc.chromiumapp.org/'
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

  // Background refresh interval (15 seconds)
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
    }, 15000); // 15 seconds

    // Cleanup interval on unmount or when accounts change
    return () => clearInterval(intervalId);
  }, [accounts, refreshing]); // Dependencies: accounts and refreshing state

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

  const refreshMessages = async () => {
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
  }

  const loadMessages = async (accountsToLoad, type = 'inbox') => {
    try {
      if (!accountsToLoad || accountsToLoad.length === 0) {
        return []
      }

      const allMessages = []
      const failedAccounts = []

      // Process each account in parallel
      const accountPromises = accountsToLoad.map(async account => {
        try {
          // First, verify the token still works
          const testResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${account.accessToken}` }
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
                Authorization: `Bearer ${account.accessToken}`,
              },
            }
          )

          if (!messagesResponse.ok) {
            throw new Error(`Failed to fetch messages: ${messagesResponse.statusText}`)
          }

          const data = await messagesResponse.json()
          if (!data.messages || !Array.isArray(data.messages)) {
            console.error(`Invalid message data for ${account.email}:`, data)
            return []
          }

          // Fetch all message details in parallel
          const detailsPromises = data.messages.map(message =>
            fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
              {
                headers: {
                  Authorization: `Bearer ${account.accessToken}`,
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
      
      // Return the sorted messages
      return sortedMessages

    } catch (error) {
      console.error('Error in loadMessages:', error)
      setError('Failed to load messages. Please try again.')
      return []
    }
  }

  const handleAddAccount = async () => {
    try {
      setError(null)
      setLoading(true)
      console.log('Starting account addition process...')
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
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
      let accessToken
      try {
        const url = new URL(responseUrl)
        const hashParams = new URLSearchParams(url.hash.substring(1))
        accessToken = hashParams.get('access_token')
        
        if (!accessToken) {
          console.error('No access token in response URL')
          throw new Error('No access token received')
        }
        console.log('Access token extracted successfully')
      } catch (urlError) {
        console.error('Failed to parse response URL:', urlError)
        throw new Error('Failed to process authentication response')
      }

      // Verify the token works by fetching user info
      console.log('Verifying token with userinfo endpoint...')
      let userInfo
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
        accessToken: accessToken,
        profilePicture: userInfo.picture // Google OAuth returns the picture URL in userInfo
      }

      try {
        const updatedAccounts = [...existingAccounts, newAccount]
        await chrome.storage.local.set({ accounts: updatedAccounts })
        setAccounts(updatedAccounts)
        console.log('Account added successfully')
        
        // Refresh messages after adding account
        await refreshMessages()
        console.log('Messages refreshed after adding account')
      } catch (saveError) {
        console.error('Failed to save account:', saveError)
        throw new Error('Failed to save account')
      }

      // Load initial messages
      console.log('Loading initial messages...')
      try {
        await Promise.all([
          loadMessages([newAccount], 'all'),
          loadMessages([newAccount], 'inbox'),
          loadMessages([newAccount], 'sent')
        ])
        console.log('Initial messages loaded successfully')
      } catch (messageError) {
        console.error('Failed to load initial messages:', messageError)
        // Don't throw here, we still added the account successfully
      }

    } catch (error) {
      console.error('Account addition failed:', error)
      setError(error.message || 'Failed to add account. Please try again.')
    } finally {
      setLoading(false)
    }
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
    try {
      const account = accounts.find(acc => acc.email === message.accountEmail)
      if (!account) return

      // Call Gmail API to archive the message
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}/modify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.accessToken}`,
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
  }

  const handleToggleRead = async (message) => {
    try {
      const account = accounts.find(acc => acc.email === message.accountEmail)
      if (!account) return

      const newIsUnread = !message.isUnread
      
      // Call Gmail API to toggle read status
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}/modify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.accessToken}`,
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

      const newIsStarred = !message.isStarred
      
      // Call Gmail API to toggle star status
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}/modify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.accessToken}`,
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

    return filtered;
  };

  const FilterButton = ({ type, icon: Icon, label }) => {
    return (
      <button
        onClick={() => {
          setMessageFilter(type)
        }}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
          messageFilter === type
            ? isDarkMode 
              ? 'bg-gmail-blue text-white font-medium'
              : 'bg-gmail-blue text-white font-medium'
            : isDarkMode
              ? 'text-gray-400 hover:bg-gray-700'
              : 'text-gmail-gray hover:bg-gmail-blue/10'
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
          {/* <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full transition-colors text-white hover:bg-white/10"
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button> */}
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

      <div className="flex-1 overflow-y-scroll backdrop-blur-md bg-black/5">
        {currentPage === 'main' && (
          <div className={`p-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center justify-between">
                <span className="font-medium">{error}</span>
                <button 
                  onClick={() => setError(null)} 
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            <div className="flex flex-col gap-4">
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
                    className={`pl-9 pr-3 py-1.5 rounded-full text-sm transition-colors w-[200px] focus:outline-none ${
                      isDarkMode
                        ? 'bg-gray-800/50 text-gray-200 placeholder-gray-400 focus:bg-gray-800'
                        : 'bg-white/50 text-gray-800 placeholder-gray-500 focus:bg-white'
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
        )}
        
        {currentPage === 'settings' && (
          <SettingsPage 
            accounts={accounts} 
            onAddAccount={handleAddAccount} 
            onRemoveAccount={handleRemoveAccount}
            onBack={() => setCurrentPage('main')}
            isDarkMode={isDarkMode}
          />
        )}

        {currentPage === 'avatar' && (
          <AvatarPage onBack={() => setCurrentPage('main')} isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  )
}

export default App


