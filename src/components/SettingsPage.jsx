import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

function SettingsPage({ accounts, onAddAccount, onRemoveAccount, onBack }) {
  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gmail-hover rounded-full mr-2"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gmail-gray" />
        </button>
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">Manage Accounts</h3>
        <button
          onClick={onAddAccount}
          className="flex items-center justify-center w-full py-2 px-4 bg-gmail-blue text-white rounded hover:bg-gmail-hover transition-colors mb-4"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Account
        </button>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gmail-gray mb-2">Connected Accounts</h4>
          {accounts.length === 0 ? (
            <div className="text-sm text-gmail-gray py-2">No accounts connected</div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div 
                  key={account.email}
                  className="flex items-center justify-between p-3 bg-gmail-light rounded"
                >
                  <div>
                    <div className="font-medium">{account.email}</div>
                  </div>
                  <button
                    onClick={() => onRemoveAccount(account.email)}
                    className="p-1 hover:bg-red-100 rounded-full"
                    aria-label={`Remove account ${account.email}`}
                  >
                    <XMarkIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-md font-medium mb-3">Connected Email Accounts</h3>
        {accounts.length === 0 ? (
          <p className="text-sm text-gmail-gray">No email accounts connected.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {accounts.map(account => (
              <li key={account.email} className="text-sm">
                {account.email}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-gmail-gray mt-4">
          Total accounts: {accounts.length}
        </p>
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