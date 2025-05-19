import { useState } from 'react'
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  ArchiveBoxIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  StarIcon,
  InboxIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

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
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [readFilter, setReadFilter] = useState('all')

  const getAccountProfilePicture = (accountEmail) => {
    const account = accounts.find(acc => acc.email === accountEmail)
    return account?.profilePicture || "https://www.gstatic.com/favicon.ico"
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

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between gap-3 text-sm ${!isDarkMode ? 'text-gmail-gray' : 'text-gray-400'}`}>
        <div className="flex items-center gap-3">
          <span className="font-medium">Sort by:</span>
          <button
            onClick={handleSort}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors bg-gmail-blue text-white font-medium`}
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
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full transition-colors min-w-[90px] ${
              readFilter !== 'all'
                ? 'bg-gmail-blue text-white font-medium' 
                : !isDarkMode
                  ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
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
          className={`bg-transparent border rounded-lg px-2 py-1.5 text-sm font-medium w-[140px] ${
            isDarkMode 
              ? 'border-gray-700 text-gray-300 hover:border-gray-500 focus:border-gray-500 bg-gray-800'
              : 'border-gmail-gray/20 text-gmail-gray hover:border-gmail-blue focus:border-gmail-blue'
          } focus:outline-none`}
        >
          <option value="all" className={isDarkMode ? 'bg-gray-800 text-gray-300' : ''}>All Accounts</option>
          {accounts.map(account => (
            <option 
              key={account.email} 
              value={account.email}
              className={isDarkMode ? 'bg-gray-800 text-gray-300' : ''}
            >
              {account.email}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {sortedMessages.length > 0 ? (
          sortedMessages.map((message, index) => {
            const { date, time } = formatDate(message.date)
            const senderName = extractSenderName(message.from)
            
            const showArchive = messageFilter !== 'archive' && messageFilter !== 'sent'
            
            return (
              <div
                key={message.id}
                className={`group p-3 rounded cursor-pointer ${
                  !isDarkMode 
                    ? 'hover:bg-gmail-hover' 
                    : 'hover:bg-gray-800'
                } ${
                  index !== sortedMessages.length - 1
                    ? !isDarkMode
                      ? 'border-b border-gray-200'
                      : 'border-b border-gray-700'
                    : ''
                }`}
                onClick={() => window.open(`https://mail.google.com/mail/u/${message.accountEmail}/#inbox/${message.id}`, '_blank')}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`text-lg flex-1 ${
                        message.isUnread 
                          ? !isDarkMode
                            ? 'font-semibold text-gray-900'
                            : 'font-semibold text-white'
                          : !isDarkMode
                            ? 'font-medium text-gray-700'
                            : 'font-medium text-gray-300'
                      }`}>
                        {senderName}
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
                    <div className={`text-mdd mt-1 truncate ${
                      message.isUnread
                        ? !isDarkMode
                          ? 'font-semibold text-gray-800'
                          : 'font-semibold text-gray-200'
                        : !isDarkMode
                          ? 'font-medium text-gray-600'
                          : 'font-medium text-gray-400'
                    }`}>
                      {message.subject}
                    </div>
                    <div className={`text-xs line-clamp-1 mt-1 ${
                      !isDarkMode ? 'text-gmail-gray' : 'text-gray-500'
                    }`}>
                      {message.snippet}
                    </div>
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