import { useState, useEffect } from 'react'
import { Cog6ToothIcon, PlusIcon, ClockIcon, EnvelopeIcon, UserGroupIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import MessageList from './components/MessageList'
import SettingsPage from './components/SettingsPage'
import AvatarPage from './components/AvatarPage'
import { mockMessages } from './mockData'

const clientId = '78669493829-j94lrbse4jre3slbe2ol613sbn288mqf.apps.googleusercontent.com'
const redirectUri = 'https://nmgohjeebbjdpackknbamacpelkkbmcc.chromiumapp.org/'
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
].join(' ')

function App() {
  const [accounts, setAccounts] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState('main')
  const [sortBy, setSortBy] = useState('recent') // 'recent' or 'unread'
  const [selectedAccount, setSelectedAccount] = useState('all') // 'all' or email address

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setError(null)
        
        // For development, use mock data
        if (import.meta.env.DEV) {
          setMessages(mockMessages)
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
          return
        }

        // Load accounts and cached messages first
        const storage = await chrome.storage.local.get(['accounts', 'cachedMessages'])
        const savedAccounts = storage.accounts || []
        const cachedMessages = storage.cachedMessages || []
        
        // Set initial state from cache
        setAccounts(savedAccounts)
        if (cachedMessages.length > 0) {
          setMessages(cachedMessages)
        }
        
        // Remove loading screen since we have either cached data or empty state
        setLoading(false)

        // If we have accounts, refresh messages in the background
        if (savedAccounts.length > 0) {
          setRefreshing(true)
          try {
            await loadMessages(savedAccounts)
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
      await loadMessages(accounts)
      console.log('Messages refreshed successfully')
    } catch (error) {
      console.error('Error during refresh:', error)
      setError('Failed to refresh messages. Please try again.')
    } finally {
      setRefreshing(false)
    }
  }

  const loadMessages = async (accountsToLoad) => {
    try {
      if (!accountsToLoad || accountsToLoad.length === 0) {
        setMessages([])
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

          // Fetch message list and details in parallel for each account
          const messagesPromise = fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=in:inbox`,
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
                const isUnread = messageData.labelIds?.includes('UNREAD') || false

                return {
                  id: message.id,
                  subject,
                  from,
                  date: new Date(date).toISOString(),
                  snippet: messageData.snippet || '',
                  accountEmail: account.email,
                  isUnread,
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
      
      // Cache the messages
      await chrome.storage.local.set({ 
        cachedMessages: sortedMessages,
        lastFetch: Date.now()
      })

      setMessages(sortedMessages)
    } catch (error) {
      console.error('Error in loadMessages:', error)
      setError('Failed to load messages. Please try again.')
      setMessages([]) // Reset messages on error
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
        await loadMessages([newAccount])
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
      await loadMessages(updatedAccounts)
    } catch (error) {
      console.error('Error removing account:', error)
    }
  }

  const sortedMessages = () => {
    let filtered = messages;
    
    // Filter by selected account
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(msg => msg.accountEmail === selectedAccount);
    }

    // Sort messages
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === 'unread') {
        // Sort unread first, then by date
        if (a.isUnread !== b.isUnread) {
          return b.isUnread ? 1 : -1;
        }
        return new Date(b.date) - new Date(a.date);
      }
      return 0;
    });

    // Limit to 20 messages total
    return filtered.slice(0, 20);
  };

  const SortButton = ({ type, icon: Icon, label }) => (
    <button
      onClick={() => setSortBy(type)}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
        sortBy === type
          ? 'bg-gmail-blue text-white font-medium'
          : 'text-gmail-gray hover:bg-gmail-blue/10'
      }`}
    >
      <Icon className={`h-4 w-4 ${sortBy === type ? 'text-white' : 'text-gmail-gray'}`} />
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="w-[500px] h-[600px] bg-gradient-to-br from-gmail-light to-white">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gmail-blue border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[500px] h-[600px] bg-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-gmail-blue/10 sticky top-0 z-10">
        <div className="font-bold text-2xl text-gmail-blue tracking-tight select-none">Zero Mail</div>
        <div className="flex items-center gap-2">
          <button 
            onClick={refreshMessages}
            disabled={refreshing}
            className={`p-2 rounded-full transition-colors ${
              refreshing 
                ? 'text-gmail-gray/50 cursor-not-allowed'
                : 'text-gmail-gray hover:bg-gmail-blue/20'
            }`}
            aria-label="Refresh"
          >
            <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleAddAccount}
            className="p-2 hover:bg-gmail-blue/20 rounded-full transition-colors"
            aria-label="Add Account"
          >
            <PlusIcon className="h-6 w-6 text-gmail-gray" />
          </button>
          <button 
            onClick={() => setCurrentPage('settings')}
            className="p-2 hover:bg-gmail-blue/20 rounded-full transition-colors"
            aria-label="Settings"
          >
            <Cog6ToothIcon className="h-6 w-6 text-gmail-gray" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {currentPage === 'main' && (
          <div className="p-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center justify-between">
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)} 
                  className="text-red-500 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mb-4">
              <SortButton type="recent" icon={ClockIcon} label="Recent" />
              <SortButton type="unread" icon={EnvelopeIcon} label="Unread" />
              <div className="ml-auto">
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="bg-transparent border border-gmail-gray/20 rounded-lg px-2 py-1.5 text-sm text-gmail-gray hover:border-gmail-blue focus:outline-none focus:border-gmail-blue"
                >
                  <option value="all">All Accounts</option>
                  {accounts.map(account => (
                    <option key={account.email} value={account.email}>
                      {account.email.split('@')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gmail-blue border-t-transparent"></div>
              </div>
            ) : accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-gmail-gray">
                <p className="mb-2">No accounts connected</p>
                <button
                  onClick={handleAddAccount}
                  className="text-gmail-blue hover:text-gmail-hover"
                >
                  Add your first account
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] text-gmail-gray">
                No messages to display
              </div>
            ) : (
              <MessageList 
                messages={sortedMessages()} 
                accounts={accounts}
              />
            )}
          </div>
        )}
        
        {currentPage === 'settings' && (
          <SettingsPage 
            accounts={accounts} 
            onAddAccount={handleAddAccount} 
            onRemoveAccount={handleRemoveAccount}
            onBack={() => setCurrentPage('main')}
          />
        )}

        {currentPage === 'avatar' && (
          <AvatarPage onBack={() => setCurrentPage('main')} />
        )}
      </div>
    </div>
  )
}

export default App


