import { useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

function MessageList({ messages }) {
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

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
      <div className="flex items-center justify-between text-sm text-gmail-gray">
        <button
          onClick={() => handleSort('sender')}
          className="flex items-center hover:text-gmail-blue"
        >
          Name
          {sortBy === 'sender' && (
            sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
        <button
          onClick={() => handleSort('date')}
          className="flex items-center hover:text-gmail-blue"
        >
          Date/Time
          {sortBy === 'date' && (
            sortOrder === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
        <button
          onClick={() => handleSort('subject')}
          className="flex items-center hover:text-gmail-blue"
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
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium truncate">{senderName}</div>
                  <div className="text-xs text-gmail-gray text-right">
                    <div>{date}</div>
                    <div>{time}</div>
                  </div>
                  <div className="text-sm font-medium truncate">{message.subject}</div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-gmail-gray line-clamp-1">{message.snippet}</div>
                  <div 
                    className="text-xs bg-gmail-light rounded-full px-2 py-0.5 ml-2 flex-shrink-0" 
                    title={`From account: ${message.accountEmail}`}
                  >
                    {message.accountEmail}
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