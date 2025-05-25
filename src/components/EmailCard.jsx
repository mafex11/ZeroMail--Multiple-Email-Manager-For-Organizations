import { useState } from 'react'
import { 
  ArchiveBoxIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  StarIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

function EmailCard({ 
  message, 
  isDarkMode, 
  showQuickActions = false,
  onArchive,
  onToggleRead,
  onToggleStar,
  emailSummary,
  isLoadingSummary
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const extractSenderName = (from) => {
    const match = from.match(/^([^<]+)/)
    return match ? match[1].trim() : from
  }

  const getAccountProfilePicture = (accountEmail) => {
    return "https://www.gstatic.com/favicon.ico" // Default for chat view
  }

  const handleAction = (e, action) => {
    e.stopPropagation()
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
      <Icon className="w-4 h-4" />
    </button>
  )

  const { date, time } = formatDate(message.date)
  const senderName = extractSenderName(message.from)

  return (
    <div
      className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 backdrop-blur-md border shadow-md hover:shadow-lg ${
        !isDarkMode 
          ? 'hover:bg-white/60 bg-white/30 border-gray-200/30 hover:border-gray-300/50' 
          : 'hover:bg-gray-800/60 bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50'
      }`}
      onClick={() => window.open(`https://mail.google.com/mail/u/${message.accountEmail}/#inbox/${message.id}`, '_blank')}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`truncate ${
              isDarkMode 
                ? `text-sm ${message.isUnread ? 'font-medium' : 'font-light'} text-white` 
                : `text-sm ${message.isUnread ? 'font-medium' : 'font-light'} text-gray-900`
            }`}>
              {senderName}
            </div>
            <div className={`flex-shrink-0 text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {time}
            </div>
            {showQuickActions && (
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <QuickActionButton
                  icon={ArchiveBoxIcon}
                  label="Archive"
                  onClick={(e) => handleAction(e, 'archive')}
                />
                <QuickActionButton
                  icon={message.isUnread ? EnvelopeOpenIcon : EnvelopeIcon}
                  label={message.isUnread ? "Mark as read" : "Mark as unread"}
                  onClick={(e) => handleAction(e, 'toggleRead')}
                />
                <QuickActionButton
                  icon={message.isStarred ? StarIconSolid : StarIcon}
                  label={message.isStarred ? "Unstar" : "Star"}
                  onClick={(e) => handleAction(e, 'toggleStar')}
                  isActive={message.isStarred}
                />
              </div>
            )}
          </div>
          <div className={`truncate ${
            isDarkMode ? 'text-xs font-light text-gray-300' : 'text-xs font-light text-gray-600'
          }`}>
            {message.subject}
          </div>
          
          {/* AI Summary Display */}
          {emailSummary ? (
            <div className={`flex items-center gap-1.5 text-xs italic ${
              isDarkMode ? 'text-blue-300' : 'text-blue-600'
            }`}>
              <SparklesIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{emailSummary}</span>
            </div>
          ) : isLoadingSummary ? (
            <div className={`flex items-center gap-1.5 truncate text-xs italic ${
              isDarkMode ? 'text-yellow-300' : 'text-yellow-600'
            }`}>
              <ArrowPathIcon className="w-3 h-3 flex-shrink-0 animate-spin" />
              <span>Generating summary...</span>
            </div>
          ) : message.snippet && message.snippet.length > 0 ? (
            <div className={`text-xs truncate ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {message.snippet.substring(0, 100) + (message.snippet.length > 100 ? '...' : '')}
            </div>
          ) : null}
        </div>
        <div className={`text-xs text-right flex flex-col items-end font-medium ${
          !isDarkMode ? 'text-gmail-gray' : 'text-gray-500'
        }`}>
          <div>{date}</div>
          <div className="mt-1">
            <img
              src={getAccountProfilePicture(message.accountEmail)}
              alt={`${message.accountEmail}'s profile`}
              className="w-5 h-5 rounded-full"
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
}

export default EmailCard 