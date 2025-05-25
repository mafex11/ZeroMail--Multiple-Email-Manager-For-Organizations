import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowPathIcon,
  FolderIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

function ActionButtons({ 
  actions, 
  isDarkMode, 
  onActionClick 
}) {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  
  console.log('ActionButtons rendered with:', actions) // Debug log
  
  if (!actions || actions.length === 0) {
    console.log('No actions to render') // Debug log
    return null
  }

  // Separate account-specific actions from regular actions
  const accountActions = actions.filter(action => action.type === 'expandedSearchAccount')
  const regularActions = actions.filter(action => action.type !== 'expandedSearchAccount')

  const getActionIcon = (type) => {
    switch (type) {
      case 'expandedSearch':
        return MagnifyingGlassIcon
      case 'expandedSearchAccount':
        return UserIcon
      case 'filterCurrent':
        return FunnelIcon
      case 'refresh':
        return ArrowPathIcon
      case 'switchView':
        return FolderIcon
      default:
        return ChevronRightIcon
    }
  }

  const getActionColor = (type) => {
    switch (type) {
      case 'expandedSearch':
        return 'blue'
      case 'expandedSearchAccount':
        return 'indigo'
      case 'filterCurrent':
        return 'green'
      case 'refresh':
        return 'purple'
      case 'switchView':
        return 'orange'
      default:
        return 'gray'
    }
  }

  console.log('Rendering', actions.length, 'action buttons') // Debug log

  return (
    <div className="space-y-2 mt-3">
      <div className={`text-xs font-medium ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Choose an option:
      </div>
      <div className="space-y-2">
        {/* Regular action buttons */}
        {regularActions.map((action, index) => {
          const Icon = getActionIcon(action.type)
          const color = getActionColor(action.type)
          
          console.log(`Rendering button ${index}:`, action.title) // Debug log
          
          return (
            <button
              key={index}
              onClick={() => {
                console.log('Button clicked:', action.title) // Debug log
                onActionClick(action)
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                isDarkMode
                  ? `bg-gray-800/50 hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600/70 text-gray-200 hover:text-white`
                  : `bg-white/50 hover:bg-white/70 border border-gray-200/50 hover:border-gray-300/70 text-gray-700 hover:text-gray-900`
              } shadow-sm hover:shadow-md`}
            >
              <div className={`p-2 rounded-lg ${
                color === 'blue' ? 'bg-blue-500/20 text-blue-500' :
                color === 'indigo' ? 'bg-indigo-500/20 text-indigo-500' :
                color === 'green' ? 'bg-green-500/20 text-green-500' :
                color === 'purple' ? 'bg-purple-500/20 text-purple-500' :
                color === 'orange' ? 'bg-orange-500/20 text-orange-500' :
                'bg-gray-500/20 text-gray-500'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{action.title}</div>
                <div className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {action.description}
                </div>
              </div>
              <ChevronRightIcon className={`w-4 h-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </button>
          )
        })}

        {/* Account-specific search dropdown button */}
        {accountActions.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                isDarkMode
                  ? `bg-gray-800/50 hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600/70 text-gray-200 hover:text-white`
                  : `bg-white/50 hover:bg-white/70 border border-gray-200/50 hover:border-gray-300/70 text-gray-700 hover:text-gray-900`
              } shadow-sm hover:shadow-md`}
            >
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Search in Specific Account</div>
                <div className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Choose which account to search in
                </div>
              </div>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${
                showAccountDropdown ? 'rotate-180' : ''
              } ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </button>

            {/* Dropdown menu */}
            {showAccountDropdown && (
              <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border z-10 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="py-1">
                  {accountActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        console.log('Account button clicked:', action.title) // Debug log
                        onActionClick(action)
                        setShowAccountDropdown(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                        isDarkMode
                          ? 'hover:bg-gray-700/60 text-gray-200 hover:text-white'
                          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{action.data.accountName}@gmail.com</div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Search all emails in this account
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActionButtons 