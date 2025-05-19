import { ArrowLeftIcon } from '@heroicons/react/24/outline'

function SettingsPage({ accounts, onAddAccount, onRemoveAccount, onBack, isDarkMode = true }) {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gmail-blue/10 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-white" />
        </button>
        <h2 className="text-3xl font-light text-white doto-title">Settings</h2>
      </div>

      <div>
        <h3 className="text-md font-light mb-3 text-white">Connected Accounts</h3>
        <div className="space-y-2">
          {accounts.map((account) => (
            <div
              key={account.email}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-700"
            >
              <div className="flex items-center gap-3">
                <img
                  src={account.profilePicture || "https://www.gstatic.com/favicon.ico"}
                  alt={`${account.email}'s profile`}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://www.gstatic.com/favicon.ico";
                  }}
                />
                <span className="text-sm font-thin text-white">{account.email}</span>
              </div>
              <button
                onClick={() => onRemoveAccount(account.email)}
                className="px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors font-thin"
              >
                Remove
              </button>
            </div>
          ))}
          {accounts.length === 0 && (
            <p className="text-sm font-thin text-gray-400 text-center py-2">
              No accounts connected
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4 mt-4">
        <h3 className="text-lg font-light mb-3 text-white">About</h3>
        <p className="text-sm font-light text-gray-300">
          Fusion Mail v1.0 - A simple email manager for multiple Gmail accounts.
        </p>
      </div>
    </div>
  )
}

export default SettingsPage 