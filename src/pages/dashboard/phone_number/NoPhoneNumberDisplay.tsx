interface NoPhoneNumberDisplayProps {
  onCreateClick: () => void
}

export default function NoPhoneNumberDisplay({ onCreateClick }: NoPhoneNumberDisplayProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Phone Number</h2>
            <p className="text-sm text-gray-600">
              Set up your phone number to create your vimpound agent.</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-6">
        {/* Explanation Text */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-900 font-medium mb-1">Get started with a phone number</p>
              <p className="text-sm text-amber-800 leading-relaxed">
                This is the phone number that pick up clients will call to talk to your agent.      </p>
            </div>
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Current Status
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      No Phone Number Configured
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      Setup required
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Ready to create your phone number?</p>
            <p className="text-gray-500">
              Click the button on the right to start the setup process. (may take several minutes to fully update after completion)
            </p>
          </div>
          <button
            onClick={onCreateClick}
            className="ml-6 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 
                     transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     active:transform active:translate-y-0"
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Phone Number
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
