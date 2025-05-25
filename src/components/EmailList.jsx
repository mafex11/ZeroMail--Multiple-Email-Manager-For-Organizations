import { useState } from 'react'
import { ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import EmailCard from './EmailCard'

function EmailList({ 
  emails, 
  isDarkMode, 
  title,
  maxHeight = "400px",
  showQuickActions = false,
  onArchive,
  onToggleRead,
  onToggleStar,
  emailSummaries = new Map(),
  loadingSummaries = new Set(),
  // Pagination props
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  totalCount = 0,
  initialQuery = ""
}) {
  const [displayedEmails, setDisplayedEmails] = useState(emails)

  const handleLoadMore = async () => {
    if (onLoadMore && !isLoadingMore) {
      const moreEmails = await onLoadMore()
      if (moreEmails && moreEmails.length > 0) {
        setDisplayedEmails(prev => [...prev, ...moreEmails])
      }
    }
  }

  if (!emails || emails.length === 0) {
    return (
      <div className={`text-center py-4 text-sm ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        No emails found
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {title && (
        <div className={`text-sm font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {title}
          {totalCount > 0 && (
            <span className={`ml-2 text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              (Showing {displayedEmails.length} of {totalCount})
            </span>
          )}
        </div>
      )}
      
      <div 
        className="space-y-2 overflow-y-auto pr-2"
        style={{ maxHeight }}
      >
        {displayedEmails.map((email, index) => (
          <EmailCard
            key={email.id || index}
            message={email}
            isDarkMode={isDarkMode}
            showQuickActions={showQuickActions}
            onArchive={onArchive}
            onToggleRead={onToggleRead}
            onToggleStar={onToggleStar}
            emailSummary={emailSummaries.get(email.id)}
            isLoadingSummary={loadingSummaries.has(email.id)}
          />
        ))}
      </div>
      
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              isLoadingMore
                ? isDarkMode
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLoadingMore ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Loading more...
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4" />
                Load More ({totalCount - displayedEmails.length} remaining)
              </>
            )}
          </button>
        </div>
      )}
      
      {displayedEmails.length > 5 && (
        <div className={`text-xs text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {hasMore ? 'Scroll to see more • Click "Load More" for additional emails' : 'All emails loaded'}
        </div>
      )}
    </div>
  )
}

export default EmailList 