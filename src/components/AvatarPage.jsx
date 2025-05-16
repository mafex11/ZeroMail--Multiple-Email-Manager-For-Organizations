import { useState, useEffect } from 'react'
import { ArrowLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline'

function AvatarPage({ onBack }) {
  const [name, setName] = useState('')
  const [avatarColor, setAvatarColor] = useState('#1a73e8')
  const [initials, setInitials] = useState('ZM')

  useEffect(() => {
    // Load saved profile data
    const loadProfile = async () => {
      try {
        const result = await chrome.storage.local.get('userProfile')
        if (result.userProfile) {
          setName(result.userProfile.name || '')
          setAvatarColor(result.userProfile.avatarColor || '#1a73e8')
          setInitials(result.userProfile.initials || 'ZM')
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }
    loadProfile()
  }, [])

  const saveProfile = async () => {
    try {
      await chrome.storage.local.set({
        userProfile: {
          name,
          avatarColor,
          initials: initials || getInitialsFromName(name) || 'ZM'
        }
      })
      alert('Profile saved!')
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const getInitialsFromName = (fullName) => {
    if (!fullName) return ''
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleNameChange = (e) => {
    setName(e.target.value)
    if (e.target.value) {
      setInitials(getInitialsFromName(e.target.value))
    }
  }

  const colorOptions = [
    { color: '#1a73e8', name: 'Blue' },
    { color: '#34a853', name: 'Green' },
    { color: '#ea4335', name: 'Red' },
    { color: '#fbbc05', name: 'Yellow' },
    { color: '#9c27b0', name: 'Purple' },
    { color: '#ff6d01', name: 'Orange' },
    { color: '#0097a7', name: 'Teal' },
    { color: '#795548', name: 'Brown' },
  ]

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gmail-hover rounded-full mr-2"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gmail-gray" />
        </button>
        <h2 className="text-lg font-semibold">Customize Profile</h2>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>

        <div className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gmail-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initials (max 2 characters)
            </label>
            <input
              type="text"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().substring(0, 2))}
              maxLength={2}
              placeholder="ZM"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gmail-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.color}
                  onClick={() => setAvatarColor(option.color)}
                  className={`w-8 h-8 rounded-full ${avatarColor === option.color ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
                  style={{ backgroundColor: option.color }}
                  aria-label={`Select ${option.name} color`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={saveProfile}
        className="w-full py-2 px-4 bg-gmail-blue text-white rounded hover:bg-gmail-hover transition-colors"
      >
        Save Profile
      </button>
    </div>
  )
}

export default AvatarPage 