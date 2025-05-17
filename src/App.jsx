import { useState, useEffect } from 'react'
import { Cog6ToothIcon, PlusIcon, ClockIcon, EnvelopeIcon, UserGroupIcon, ArrowPathIcon, SunIcon, MoonIcon, InboxIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import MessageList from './components/MessageList'
import SettingsPage from './components/SettingsPage'
import AvatarPage from './components/AvatarPage'
import { mockMessages } from './mockData'

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
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState('main')
  const [sortBy, setSortBy] = useState('recent')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [messageFilter, setMessageFilter] = useState('inbox')

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
          const storage = await chrome.storage.local.get('isDarkMode')
          setIsDarkMode(storage.isDarkMode ?? true)
          setLoading(false)
          return
        }

        // Load accounts and cached messages first
        const storage = await chrome.storage.local.get(['accounts', 'cachedMessages'])
        const savedAccounts = storage.accounts || []
        const cachedMessages = storage.cachedMessages || { inbox: [], sent: [], all: [] }
        
        // Set initial state from cache
        setAccounts(savedAccounts)
        if (cachedMessages.all.length > 0) {
          setMessages(cachedMessages)
        }
        
        // Remove loading screen since we have either cached data or empty state
        setLoading(false)

        // If we have accounts, refresh messages in the background
        if (savedAccounts.length > 0) {
          setRefreshing(true)
          try {
            // Load all mail types in parallel
            await Promise.all([
              loadMessages(savedAccounts, 'all'),
              loadMessages(savedAccounts, 'inbox'),
              loadMessages(savedAccounts, 'sent')
            ])
          } finally {
            setRefreshing(false)
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error)
        setError('Failed to initialize. Please try again.')
        setLoading(false)
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
        setMessages(prev => ({ ...prev, [type]: [], all: [] }))
        return
      }

      const allMessages = []
      const failedAccounts = []
      const messagePromises = []

      for (const account of accountsToLoad) {
        try {
          // First, verify the token still works
          const testResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${account.accessToken}` }
          })

          if (!testResponse.ok) {
            console.error(`Token invalid for ${account.email}`)
            failedAccounts.push(account.email)
            continue
          }

          // Construct query based on type
          let query = ''
          switch (type) {
            case 'inbox':
              query = 'label:inbox -in:spam -in:trash'
              break
            case 'sent':
              query = 'in:sent -in:spam -in:trash'
              break
            case 'all':
              // Fetch all mail except spam, trash, and drafts
              query = '-in:spam -in:trash -in:drafts'
              break
            default:
              query = 'label:inbox -in:spam -in:trash'
          }

          // Fetch message list and details in parallel for each account
          const messagesPromise = fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=${encodeURIComponent(query)}`,
            {
              headers: {
                Authorization: `Bearer ${account.accessToken}`,
              },
            }
          ).then(async (response) => {
            if (!response.ok) throw new Error(`Failed to fetch messages: ${response.statusText}`)
            const data = await response.json()
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
                if (!messageResponse.ok) throw new Error(`Failed to fetch message details: ${messageResponse.statusText}`)
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
                const messageType = type // Store the original query type

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
                  messageType
                }
              }).catch(error => {
                console.error(`Error processing message:`, error)
                return null
              })
            )

            const messages = await Promise.all(detailsPromises)
            return messages.filter(msg => msg !== null)
          }).catch(error => {
            console.error(`Error fetching messages for ${account.email}:`, error)
            failedAccounts.push(account.email)
            return []
          })

          messagePromises.push(messagesPromise)
        } catch (error) {
          console.error(`Error processing account ${account.email}:`, error)
          failedAccounts.push(account.email)
        }
      }

      // Wait for all message fetching to complete
      const messageResults = await Promise.all(messagePromises)
      allMessages.push(...messageResults.flat())

      // Remove failed accounts
      if (failedAccounts.length > 0) {
        const validAccounts = accounts.filter(acc => !failedAccounts.includes(acc.email))
        await chrome.storage.local.set({ accounts: validAccounts })
        setAccounts(validAccounts)
        
        if (failedAccounts.length === accountsToLoad.length) {
          setError('Failed to load messages. Please try adding your account again.')
        }
      }

      // Sort messages by date
      const sortedMessages = allMessages.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      // Update messages state based on type
      setMessages(prev => {
        const newMessages = {
          ...prev,
          [type]: sortedMessages
        }
        return newMessages
      })

      // Cache the messages
      await chrome.storage.local.set({ 
        cachedMessages: messages,
        lastFetch: Date.now()
      })

    } catch (error) {
      console.error('Error in loadMessages:', error)
      setError('Failed to load messages. Please try again.')
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

      // Remove message from local state
      setMessages(prev => ({
        ...prev,
        inbox: prev.inbox.filter(msg => msg.id !== message.id),
        sent: prev.sent.filter(msg => msg.id !== message.id)
      }))
      
      // Update cache
      const storage = await chrome.storage.local.get('cachedMessages')
      const cachedMessages = storage.cachedMessages || { inbox: [], sent: [], all: [] }
      await chrome.storage.local.set({
        cachedMessages: {
          ...cachedMessages,
          inbox: cachedMessages.inbox.filter(msg => msg.id !== message.id),
          sent: cachedMessages.sent.filter(msg => msg.id !== message.id)
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

      // Update message in local state
      setMessages(prev => ({
        ...prev,
        inbox: prev.inbox.map(msg =>
          msg.id === message.id ? { ...msg, isUnread: newIsUnread } : msg
        ),
        sent: prev.sent.map(msg =>
          msg.id === message.id ? { ...msg, isUnread: newIsUnread } : msg
        )
      }))
      
      // Update cache
      const storage = await chrome.storage.local.get('cachedMessages')
      const cachedMessages = storage.cachedMessages || { inbox: [], sent: [], all: [] }
      await chrome.storage.local.set({
        cachedMessages: {
          ...cachedMessages,
          inbox: cachedMessages.inbox.map(msg =>
            msg.id === message.id ? { ...msg, isUnread: newIsUnread } : msg
          ),
          sent: cachedMessages.sent.map(msg =>
            msg.id === message.id ? { ...msg, isUnread: newIsUnread } : msg
          )
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

      // Update message in local state
      setMessages(prev => ({
        ...prev,
        inbox: prev.inbox.map(msg =>
          msg.id === message.id ? { ...msg, isStarred: newIsStarred } : msg
        ),
        sent: prev.sent.map(msg =>
          msg.id === message.id ? { ...msg, isStarred: newIsStarred } : msg
        )
      }))
      
      // Update cache
      const storage = await chrome.storage.local.get('cachedMessages')
      const cachedMessages = storage.cachedMessages || { inbox: [], sent: [], all: [] }
      await chrome.storage.local.set({
        cachedMessages: {
          ...cachedMessages,
          inbox: cachedMessages.inbox.map(msg =>
            msg.id === message.id ? { ...msg, isStarred: newIsStarred } : msg
          ),
          sent: cachedMessages.sent.map(msg =>
            msg.id === message.id ? { ...msg, isStarred: newIsStarred } : msg
          )
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
      case 'recent':
        // For 'all' and 'recent', use the dedicated all mail list
        filtered = [...messages.all];
        break;
      case 'unread':
        // For unread, filter from all messages
        filtered = messages.all.filter(msg => msg.isUnread);
        break;
      default:
        filtered = [...messages.all];
    }
    
    // Filter by selected account
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(msg => msg.accountEmail === selectedAccount);
    }

    // Sort messages
    if (sortBy === 'recent' || messageFilter === 'recent') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'unread' || messageFilter === 'unread') {
      filtered.sort((a, b) => {
        // Sort unread first, then by date
        if (a.isUnread !== b.isUnread) {
          return b.isUnread ? 1 : -1;
        }
        return new Date(b.date) - new Date(a.date);
      });
    }

    return filtered;
  };

  const FilterButton = ({ type, icon: Icon, label }) => (
    <button
      onClick={() => {
        setMessageFilter(type)
        if (type === 'recent') {
          setSortBy('recent')
        } else if (type === 'unread') {
          setSortBy('unread')
        }
        refreshMessages()
      }}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
        messageFilter === type || (type === 'recent' && sortBy === 'recent') || (type === 'unread' && sortBy === 'unread')
          ? isDarkMode 
            ? 'bg-gmail-blue text-white font-medium'
            : 'bg-gmail-blue text-white font-medium'
          : isDarkMode
            ? 'text-gray-400 hover:bg-gray-700'
            : 'text-gmail-gray hover:bg-gmail-blue/10'
      }`}
    >
      <Icon className={`h-4 w-4 ${
        messageFilter === type || (type === 'recent' && sortBy === 'recent') || (type === 'unread' && sortBy === 'unread')
          ? 'text-white' 
          : ''
      }`} />
      <span>{label}</span>
    </button>
  )

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    await chrome.storage.local.set({ isDarkMode: newDarkMode })
  }

  if (loading) {
    return (
      <div className={`w-[500px] h-[600px] ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gmail-blue border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-[500px] h-[600px] flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <div className={`flex items-center justify-between p-4 border-b ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gmail-blue/10'
      } sticky top-0 z-10`}>
        <div className={`font-semibold text-2xl tracking-tight select-none ${
          isDarkMode ? 'text-white' : 'text-gmail-blue'
        }`}>
          Zero Mail
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={refreshMessages}
            disabled={refreshing}
            className={`p-2 rounded-full transition-colors ${
              refreshing 
                ? 'text-gray-500 cursor-not-allowed'
                : isDarkMode
                  ? 'text-gray-400 hover:bg-gray-700'
                  : 'text-gmail-gray hover:bg-gmail-blue/20'
            }`}
            aria-label="Refresh"
          >
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:bg-gray-700'
                : 'text-gmail-gray hover:bg-gmail-blue/20'
            }`}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
          <button 
            onClick={handleAddAccount}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:bg-gray-700'
                : 'text-gmail-gray hover:bg-gmail-blue/20'
            }`}
            aria-label="Add Account"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
          <button 
            onClick={() => setCurrentPage('settings')}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode
                ? 'text-gray-400 hover:bg-gray-700'
                : 'text-gmail-gray hover:bg-gmail-blue/20'
            }`}
            aria-label="Settings"
          >
            <Cog6ToothIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentPage === 'main' && (
          <div className={`p-4 ${isDarkMode ? 'text-gray-300' : ''}`}>
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
              {/* Filter buttons */}
              <div className="flex items-center gap-1.5 pb-2 border-b border-gray-200 dark:border-gray-700">
                <FilterButton type="all" icon={EnvelopeIcon} label="All" />
                <FilterButton type="inbox" icon={InboxIcon} label="Inbox" />
                <FilterButton type="sent" icon={PaperAirplaneIcon} label="Sent" />
                <FilterButton type="recent" icon={ClockIcon} label="Recent" />
                <FilterButton type="unread" icon={EnvelopeIcon} label="Unread" />
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className={`animate-spin rounded-full h-10 w-10 border-4 border-t-transparent ${
                    isDarkMode ? 'border-gray-600' : 'border-gmail-blue'
                  }`}></div>
                </div>
              ) : accounts.length === 0 ? (
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
              ) : messages.all.length === 0 ? (
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


