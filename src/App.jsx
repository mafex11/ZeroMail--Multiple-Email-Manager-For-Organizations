import { useState, useEffect } from 'react'
import { Cog6ToothIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import AccountList from './components/AccountList'
import MessageList from './components/MessageList'
import SettingsPage from './components/SettingsPage'
import AvatarPage from './components/AvatarPage'
import './App.css'

const clientId = '78669493829-j94lrbse4jre3slbe2ol613sbn288mqf.apps.googleusercontent.com'
const redirectUri = 'https://nmgohjeebbjdpackknbamacpelkkbmcc.chromiumapp.org/'

function App() {
  const [accounts, setAccounts] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('main') // 'main', 'settings', or 'avatar'
  const [userProfile, setUserProfile] = useState({
    name: '',
    avatarColor: '#1a73e8',
    initials: 'ZM'
  })

  useEffect(() => {
    loadAccounts()
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const result = await chrome.storage.local.get('userProfile')
      if (result.userProfile) {
        setUserProfile(result.userProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadAccounts = async () => {
    try {
      const result = await chrome.storage.local.get('accounts')
      const savedAccounts = result.accounts || []
      setAccounts(savedAccounts)
      if (savedAccounts.length > 0) {
        await loadMessages(savedAccounts)
      }
    } catch (error) {
      console.error('Error loading accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (accountsToLoad) => {
    try {
      const allMessages = []
      for (const account of accountsToLoad) {
        try {
          const response = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10`,
            {
              headers: {
                Authorization: `Bearer ${account.accessToken}`,
              },
            }
          )

          if (!response.ok) {
            throw new Error(`Failed to fetch messages: ${response.statusText}`)
          }

          const data = await response.json()
          if (data.messages) {
            const messageDetails = await Promise.all(
              data.messages.map(async (message) => {
                const messageResponse = await fetch(
                  `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${account.accessToken}`,
                    },
                  }
                )
                const messageData = await messageResponse.json()
                const headers = messageData.payload.headers
                const subject = headers.find((h) => h.name === 'Subject')?.value || '(No Subject)'
                const from = headers.find((h) => h.name === 'From')?.value || 'Unknown'
                const date = headers.find((h) => h.name === 'Date')?.value || new Date().toISOString()
                return {
                  id: message.id,
                  subject,
                  from,
                  date,
                  snippet: messageData.snippet,
                  accountEmail: account.email,
                }
              })
            )
            allMessages.push(...messageDetails)
          }
        } catch (error) {
          console.error(`Error fetching messages for ${account.email}:`, error)
        }
      }
      setMessages(allMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleAddAccount = async () => {
    try {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly')}`
      
      const responseUrl = await chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
      })

      if (responseUrl) {
        const url = new URL(responseUrl)
        const accessToken = url.hash.substring(1).split('&').find(param => param.startsWith('access_token=')).split('=')[1]
        
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        
        const userInfo = await userInfoResponse.json()
        const newAccount = {
          email: userInfo.email,
          accessToken: accessToken
        }

        const result = await chrome.storage.local.get('accounts')
        const existingAccounts = result.accounts || []
        const updatedAccounts = [...existingAccounts, newAccount]
        
        await chrome.storage.local.set({ accounts: updatedAccounts })
        setAccounts(updatedAccounts)
        await loadMessages(updatedAccounts)
      }
    } catch (error) {
      console.error('Error adding account:', error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gmail-blue"></div>
      </div>
    )
  }

  return (
    <div className="w-[400px] min-h-[500px] bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1"></div>
        <h1 className="text-xl font-semibold text-gmail-blue">Zero Mail</h1>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button 
            onClick={() => setCurrentPage('avatar')}
            className="p-1 hover:bg-gmail-hover rounded-full"
            aria-label="Profile settings"
          >
            {userProfile ? (
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: userProfile.avatarColor }}
              >
                {userProfile.initials}
              </div>
            ) : (
              <UserCircleIcon className="h-6 w-6 text-gmail-gray" />
            )}
          </button>
          <button 
            onClick={() => setCurrentPage('settings')}
            className="p-2 hover:bg-gmail-hover rounded-full"
            aria-label="Settings"
          >
            <Cog6ToothIcon className="h-5 w-5 text-gmail-gray" />
          </button>
        </div>
      </div>
      
      {currentPage === 'main' && (
        <div className="p-4">
          {accounts.length > 0 ? (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gmail-gray">Connected Accounts</h2>
                  <button
                    onClick={() => setCurrentPage('settings')}
                    className="text-xs text-gmail-blue hover:underline"
                  >
                    Manage
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {accounts.map(account => (
                    <div 
                      key={account.email} 
                      className="text-xs bg-gmail-light rounded-full px-2 py-1 truncate max-w-[150px]"
                      title={account.email}
                    >
                      {account.email}
                    </div>
                  ))}
                </div>
              </div>
              <MessageList messages={messages} />
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gmail-gray mb-4">No accounts connected</p>
              <button
                onClick={() => setCurrentPage('settings')}
                className="px-4 py-2 bg-gmail-blue text-white rounded hover:bg-gmail-hover transition-colors"
              >
                Add Account
              </button>
            </div>
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
        <AvatarPage onBack={() => {
          setCurrentPage('main')
          loadUserProfile() // Reload profile when returning from avatar page
        }} />
      )}
    </div>
  )
}

export default App
