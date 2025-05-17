import { useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

function MessageList({ messages, accounts }) {
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  const getAccountProfilePicture = (accountEmail) => {
    const account = accounts.find(acc => acc.email === accountEmail)
    return account?.profilePicture || "https://www.gstatic.com/favicon.ico"
  }

  const sortMessages = (messages) => {
    return [...messages].sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date)
          break
        case 'sender':
          comparison = a.from.localeCompare(b.from)
          break
        case 'subject':
          comparison = a.subject.localeCompare(b.subject)
          break
        case 'account':
          comparison = a.accountEmail.localeCompare(b.accountEmail)
          break
        default:
          comparison = 0
      }
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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedMessages = sortMessages(messages)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-gmail-gray">
        <span className="font-medium">Sort by:</span>
        <button
          onClick={() => handleSort('sender')}
          className={`flex items-center px-3 py-1.5 rounded-full transition-colors ${
            sortBy === 'sender' 
              ? 'bg-gmail-blue text-white' 
              : 'hover:bg-gmail-blue/10'
          }`}
        >
          Name
          {sortBy === 'sender' && (
            sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
        <button
          onClick={() => handleSort('date')}
          className={`flex items-center px-3 py-1.5 rounded-full transition-colors ${
            sortBy === 'date' 
              ? 'bg-gmail-blue text-white' 
              : 'hover:bg-gmail-blue/10'
          }`}
        >
          Date/Time
          {sortBy === 'date' && (
            sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
        <button
          onClick={() => handleSort('subject')}
          className={`flex items-center px-3 py-1.5 rounded-full transition-colors ${
            sortBy === 'subject' 
              ? 'bg-gmail-blue text-white' 
              : 'hover:bg-gmail-blue/10'
          }`}
        >
          Subject
          {sortBy === 'subject' && (
            sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      </div>

      <div className="space-y-2">
        {sortedMessages.length > 0 ? (
          sortedMessages.map((message) => {
            const { date, time } = formatDate(message.date)
            const senderName = extractSenderName(message.from)
            
            return (
              <div
                key={message.id}
                className="p-3 hover:bg-gmail-hover rounded cursor-pointer"
                onClick={() => window.open(`https://mail.google.com/mail/u/${message.accountEmail}/#inbox/${message.id}`, '_blank')}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className={`text-sm ${message.isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {senderName}
                    </div>
                    <div className={`text-sm mt-1 ${message.isUnread ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      {message.subject}
                    </div>
                    <div className="text-xs text-gmail-gray line-clamp-1 mt-1">{message.snippet}</div>
                  </div>
                  <div className="text-xs text-gmail-gray text-right flex flex-col items-end">
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
          <div className="text-center text-gmail-gray py-4">
            No messages to display
          </div>
        )}
      </div>
      
      <div className="flex justify-end mt-2">
        <button
          onClick={() => handleSort('account')}
          className="flex items-center text-xs text-gmail-gray hover:text-gmail-blue"
        >
          Sort by Account
          {sortBy === 'account' && (
            sortOrder === 'asc' ? <ChevronUpIcon className="h-3 w-3 ml-1" /> : <ChevronDownIcon className="h-3 w-3 ml-1" />
          )}
        </button>
      </div>
    </div>
  )
}

export default MessageList 