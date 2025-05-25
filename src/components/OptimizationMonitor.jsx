import { useState, useEffect } from 'react'
import { ChartBarIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { emailSummaryService } from '../utils/emailSummaryService'
import { emailChatService } from '../utils/emailChatService'

function OptimizationMonitor({ isDarkMode }) {
  const [stats, setStats] = useState({
    summaryCache: 0,
    chatCache: 0,
    apiCallsSaved: 0,
    estimatedSavings: 0
  })

  useEffect(() => {
    const updateStats = () => {
      const summaryStats = emailSummaryService.getCacheStats()
      const apiCallsSaved = summaryStats.cachedSummaries + summaryStats.responseCacheSize
      const estimatedSavings = apiCallsSaved * 0.000049 // Estimated cost per call
      
      setStats({
        summaryCache: summaryStats.cachedSummaries,
        chatCache: summaryStats.responseCacheSize,
        apiCallsSaved,
        estimatedSavings
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [])

  if (stats.apiCallsSaved === 0) return null

  return (
    <div className={`text-xs p-2 rounded-lg ${
      isDarkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-100 text-green-700'
    }`}>
      <div className="flex items-center gap-2">
        <CpuChipIcon className="w-4 h-4" />
        <span>Optimization: {stats.apiCallsSaved} API calls saved • ${stats.estimatedSavings.toFixed(4)} saved</span>
      </div>
    </div>
  )
}

export default OptimizationMonitor 