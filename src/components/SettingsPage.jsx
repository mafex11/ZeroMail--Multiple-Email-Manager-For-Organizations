import { useState, useEffect } from 'react'
import { 
  ArrowLeftIcon, 
  ChartBarIcon, 
  CpuChipIcon, 
  ClockIcon,
  UserIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { performanceMonitor } from '../utils/performance'
import { ShimmerButton } from './magicui/shimmer-button'

function SettingsPage({ accounts, onAddAccount, onRemoveAccount, onBack, isDarkMode = true }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [performanceData, setPerformanceData] = useState(null)
  const [showPerformance, setShowPerformance] = useState(false)
  const [signedInAccount, setSignedInAccount] = useState(null)
  const [showAccountSelector, setShowAccountSelector] = useState(false)
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    // Update performance data every 5 seconds
    const updatePerformance = () => {
      const report = performanceMonitor.getReport()
      setPerformanceData(report)
    }

    updatePerformance() // Initial load
    const interval = setInterval(updatePerformance, 5000)

    return () => clearInterval(interval)
  }, [])



  // Load signed-in account from storage
  useEffect(() => {
    const loadSignedInAccount = async () => {
      try {
        const result = await chrome.storage.local.get(['signedInAccount'])
        if (result.signedInAccount && accounts.length > 0) {
          // Verify the signed-in account still exists in accounts
          const account = accounts.find(acc => acc.email === result.signedInAccount)
          if (account) {
            setSignedInAccount(account)
          } else {
            // Clear invalid signed-in account
            await chrome.storage.local.remove(['signedInAccount'])
          }
        } else if (accounts.length > 0 && !signedInAccount) {
          // Auto-sign in with the first account if no signed-in account is set
          const firstAccount = accounts[0]
          setSignedInAccount(firstAccount)
          await chrome.storage.local.set({ signedInAccount: firstAccount.email })
        }
      } catch (error) {
        console.error('Error loading signed-in account:', error)
      }
    }

    loadSignedInAccount()
  }, [accounts, signedInAccount])

  const formatDuration = (duration) => {
    if (!duration) return 'N/A'
    return `${duration.toFixed(1)}ms`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'fast': return 'text-green-400'
      case 'slow': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const handleUpgrade = async (planType = 'monthly') => {
    try {
      // Redirect to external pricing page
      chrome.tabs.create({ url: 'https://fusionmail.vercel.app/pricing' })
    } catch (error) {
      console.error('Error opening pricing page:', error)
      // Fallback to opening URL directly
      window.open('https://fusionmail.vercel.app/pricing', '_blank')
    }
  }

  const handleSignIn = async () => {
    if (accounts.length === 0) {
      // No accounts available, add a new one
      setSigningIn(true)
      try {
        await onAddAccount()
        // After adding account, it will be automatically set as signed-in account
        // due to the useEffect that monitors accounts changes
      } catch (error) {
        console.error('Error adding account:', error)
      } finally {
        setSigningIn(false)
      }
    } else {
      // Show account selector
      setShowAccountSelector(true)
    }
  }

  const handleAccountSelect = async (account) => {
    try {
      setSignedInAccount(account)
      await chrome.storage.local.set({ signedInAccount: account.email })
      setShowAccountSelector(false)
    } catch (error) {
      console.error('Error setting signed-in account:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      setSignedInAccount(null)
      await chrome.storage.local.remove(['signedInAccount'])
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleAddNewAccount = async () => {
    setSigningIn(true)
    setShowAccountSelector(false)
    try {
      await onAddAccount()
    } catch (error) {
      console.error('Error adding new account:', error)
    } finally {
      setSigningIn(false)
    }
  }



  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button
          onClick={onBack}
          className={`p-2 rounded-full transition-colors ${
            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
          }`}
        >
          <ArrowLeftIcon className={`h-5 w-5 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
        </button>
        <h2 className={`text-2xl font-semibold doto-title ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Settings
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? isDarkMode
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                    : 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* User Profile Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                User Profile
              </h3>
              
              {signedInAccount ? (
                <div className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : 'border-green-200 bg-green-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={signedInAccount.profilePicture || "https://www.gstatic.com/favicon.ico"}
                        alt="Profile"
                        className="w-16 h-16 rounded-full border-2 border-green-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://www.gstatic.com/favicon.ico";
                        }}
                      />
                      <div>
                        <h4 className={`text-lg font-semibold ${
                          isDarkMode ? 'text-green-300' : 'text-green-700'
                        }`}>
                          {signedInAccount.email.split('@')[0]}
                        </h4>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>
                          {signedInAccount.email}
                        </p>
                        <div className={`text-xs mt-1 flex items-center gap-2 ${
                          isDarkMode ? 'text-green-500' : 'text-green-500'
                        }`}>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Signed in
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {accounts.length > 1 && (
                        <button
                          onClick={() => setShowAccountSelector(true)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            isDarkMode
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          Switch Account
                        </button>
                      )}
                      <button
                        onClick={handleSignOut}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          isDarkMode
                            ? 'bg-gray-600 hover:bg-gray-700 text-white'
                            : 'bg-gray-500 hover:bg-gray-600 text-white'
                        }`}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-8 rounded-lg border-2 border-dashed ${
                  isDarkMode ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50'
                }`}>
                  <UserIcon className={`w-12 h-12 mx-auto mb-4 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <h4 className={`text-lg font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Sign in to Fusion Mail
                  </h4>
                  <p className={`text-sm mb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {accounts.length > 0 
                      ? 'Choose an account to sign in with or add a new one'
                      : 'Connect your Gmail account to get started'
                    }
                  </p>
                  <ShimmerButton
                    onClick={handleSignIn}
                    disabled={signingIn}
                    className="px-6 py-2 text-sm"
                    background="rgba(59, 130, 246, 1)"
                    shimmerColor="#ffffff"
                    shimmerDuration="2s"
                  >
                    {signingIn ? 'Signing In...' : 'Sign In'}
                  </ShimmerButton>
                </div>
              )}
            </div>

            {/* Connected Accounts Section */}
      <div>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Connected Accounts
              </h3>
              
              {accounts.length === 0 ? (
                <div className={`text-center py-6 rounded-lg border ${
                  isDarkMode ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50'
                }`}>
                  <p className={`text-sm mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    No accounts connected to the extension
                  </p>
                  <button
                    onClick={onAddAccount}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Add Gmail Account
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.email}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isDarkMode 
                          ? 'border-gray-700 bg-gray-800/30' 
                          : 'border-gray-200 bg-white'
                      }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={account.profilePicture || "https://www.gstatic.com/favicon.ico"}
                  alt={`${account.email}'s profile`}
                          className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://www.gstatic.com/favicon.ico";
                  }}
                />
                        <div>
                          <div className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {account.email}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Connected account
                          </div>
                        </div>
              </div>
              <button
                onClick={() => onRemoveAccount(account.email)}
                        className="px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
                  
                  {/* Add Another Account Button */}
                  <button
                    onClick={onAddAccount}
                    className={`w-full p-4 rounded-lg border-2 border-dashed transition-colors ${
                      isDarkMode
                        ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                        : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700'
                    }`}
                  >
                    + Add Another Account
                  </button>
                </div>
              )}
            </div>


          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
      {/* Performance Monitoring Section */}
      {import.meta.env.DEV && (
              <div>
          <button
            onClick={() => setShowPerformance(!showPerformance)}
                  className={`flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Performance Monitor</h3>
                  <span className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    (Dev Only)
                  </span>
          </button>
          
          {showPerformance && performanceData && (
            <div className="space-y-4">
              {/* Memory Usage */}
              {performanceData.memory && (
                      <div className={`rounded-lg p-4 ${
                        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
                      }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CpuChipIcon className="h-4 w-4 text-blue-400" />
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            Memory Usage
                          </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                            <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Used</div>
                            <div className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {performanceData.memory.used}MB
                            </div>
                    </div>
                    <div className="text-center">
                            <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total</div>
                            <div className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {performanceData.memory.total}MB
                            </div>
                    </div>
                    <div className="text-center">
                            <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Limit</div>
                            <div className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {performanceData.memory.limit}MB
                            </div>
                    </div>
                  </div>
                  <div className="mt-2">
                          <div className={`rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((performanceData.memory.used / performanceData.memory.total) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    performanceMonitor.clear()
                    setPerformanceData(null)
                  }}
                        className={`px-3 py-1.5 text-xs rounded transition-colors ${
                          isDarkMode
                            ? 'text-white bg-gray-600 hover:bg-gray-500'
                            : 'text-white bg-gray-600 hover:bg-gray-500'
                        }`}
                >
                  Clear Metrics
                </button>
                <button
                  onClick={() => {
                    const report = performanceMonitor.getReport()
                    console.log('📊 Performance Report:', report)
                  }}
                  className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                >
                  Log Report
                </button>
              </div>
            </div>
          )}
        </div>
      )}

            {/* About Section */}
            <div className={`border-t pt-6 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                About Fusion Mail
              </h3>
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <SparklesIcon className="w-8 h-8 text-blue-500" />
                  <div>
                    <h4 className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Fusion Mail
                    </h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Version 1.0.0
                    </p>
                  </div>
                </div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  A powerful email management extension with AI-powered features for Gmail. 
                  Streamline your email workflow with intelligent search, summaries, and chat assistance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Selector Modal */}
      {showAccountSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${
            isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            {/* Close button */}
            <button
              onClick={() => setShowAccountSelector(false)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className={`text-xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Choose Account
                </h2>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Select which account to sign in with
                </p>
              </div>

              {/* Account List */}
              <div className="space-y-3 mb-4">
                {accounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleAccountSelect(account)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-800/50 hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600/70 text-gray-200 hover:text-white'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200/50 hover:border-gray-300/70 text-gray-700 hover:text-gray-900'
                    } ${signedInAccount?.email === account.email ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <img
                      src={account.profilePicture || "https://www.gstatic.com/favicon.ico"}
                      alt={`${account.email}'s profile`}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://www.gstatic.com/favicon.ico";
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{account.email.split('@')[0]}</div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {account.email}
                      </div>
                    </div>
                    {signedInAccount?.email === account.email && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Add New Account Button */}
              <button
                onClick={handleAddNewAccount}
                disabled={signingIn}
                className={`w-full p-3 rounded-lg border-2 border-dashed transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                    : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700'
                } ${signingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {signingIn ? 'Adding Account...' : '+ Add New Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage 