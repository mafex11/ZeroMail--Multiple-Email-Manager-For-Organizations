import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Mock Chrome APIs for development
const isDevelopment = import.meta.env.DEV
if (isDevelopment && !window.chrome) {
  // Mock fetch for token exchange in development
  const originalFetch = window.fetch
  window.fetch = function(url, options) {
    // Mock Google OAuth token endpoint
    if (url === 'https://oauth2.googleapis.com/token') {
      console.log('Mocking token exchange for development')
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          access_token: 'dev_mock_access_token_' + Date.now(),
          refresh_token: 'dev_mock_refresh_token_' + Date.now(),
          expires_in: 3600,
          token_type: 'Bearer'
        })
      })
    }
    // Use original fetch for other requests
    return originalFetch.apply(this, arguments)
  }
  window.chrome = {
    storage: {
      local: {
        get: (key) => Promise.resolve({ [key]: JSON.parse(localStorage.getItem(key) || 'null') }),
        set: (data) => {
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, JSON.stringify(data[key]))
          })
          return Promise.resolve()
        }
      }
    },
    identity: {
      getRedirectURL: () => 'https://nfjapmmpjppfkhcbcoomnigcdnmpihkl.chromiumapp.org/',
      launchWebAuthFlow: (options) => {
        console.log('Would launch auth flow with URL:', options.url)
        // In dev mode, simulate a successful auth response with authorization code
        const mockCode = 'dev_mock_code_' + Date.now()
        const mockRedirectUrl = 'https://nfjapmmpjppfkhcbcoomnigcdnmpihkl.chromiumapp.org/?code=' + mockCode
        return Promise.resolve(mockRedirectUrl)
      }
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
