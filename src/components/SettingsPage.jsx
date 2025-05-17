import { ArrowLeftIcon } from '@heroicons/react/24/outline'

function SettingsPage({ accounts, onAddAccount, onRemoveAccount, onBack }) {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gmail-blue/10 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gmail-gray" />
        </button>
        <h2 className="text-xl font-bold text-gmail-blue">Settings</h2>
      </div>

      <div>
        <h3 className="text-md font-medium mb-3">Connected Accounts</h3>
        <div className="space-y-2">
          {accounts.map((account) => (
            <div
              key={account.email}
              className="flex items-center justify-between p-3 bg-gmail-light rounded-lg"
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
                <span className="text-sm text-gray-700">{account.email}</span>
              </div>
              <button
                onClick={() => onRemoveAccount(account.email)}
                className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          {accounts.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No accounts connected
            </p>
          )}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="text-md font-medium mb-3">About</h3>
        <p className="text-sm text-gmail-gray">
          Zero Mail v1.0 - A simple email manager for multiple Gmail accounts.
        </p>
      </div>
    </div>
  )
}

export default SettingsPage 