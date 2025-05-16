import { XMarkIcon } from '@heroicons/react/24/outline'

function AccountList({ accounts, onRemoveAccount }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-medium text-gray-900 mb-3">Connected Accounts</h2>
      <div className="space-y-2">
        {accounts.map((account) => (
          <div
            key={account.email}
            className="flex items-center justify-between p-3 bg-gmail-light rounded-lg"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://www.gstatic.com/favicon.ico"
                alt="Gmail"
                className="w-6 h-6"
              />
              <span className="text-sm text-gray-700">{account.email}</span>
            </div>
            <button
              onClick={() => onRemoveAccount(account.email)}
              className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
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
  )
}

export default AccountList 