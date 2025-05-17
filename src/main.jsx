import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Mock Chrome APIs for development
const isDevelopment = import.meta.env.DEV
if (isDevelopment && !window.chrome) {
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
      getRedirectURL: () => 'https://nmgohjeebbjdpackknbamacpelkkbmcc.chromiumapp.org/',
      launchWebAuthFlow: (options) => {
        console.log('Would launch auth flow with URL:', options.url)
        // In dev mode, simulate a successful auth response
        const mockToken = 'dev_mock_token_' + Date.now()
        const mockRedirectUrl = 'https://nmgohjeebbjdpackknbamacpelkkbmcc.chromiumapp.org/#access_token=' + mockToken
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
