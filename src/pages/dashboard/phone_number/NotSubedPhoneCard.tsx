import { useNavigate } from 'react-router-dom'

export default function NotSubedPhoneCard() {
  const navigate = useNavigate()

  const handleGoToBilling = () => {
    navigate('/dashboard/billing')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm">
            <svg 
              className="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Subscription Required</h2>
            <p className="text-sm text-gray-600">
              Activate a subscription plan to unlock phone number creation and management
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-6">
        {/* Explanation Text */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5"
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
              <p className="text-sm text-blue-900 font-medium mb-1">Why subscription is needed</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                Phone number creation requires an active subscription. Once created, you will be able to customize your vimpound agent in Identity and Retrieval. It will then be ready for your pick up customers to call and have real conversations.</p>
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
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      No Active Subscription
                    </p>
                    <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Subscription required
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
            <p className="font-medium text-gray-700 mb-1">Ready to get started?</p>
            <p className="text-gray-500">
              Click the button the the right to begin.
            </p>
          </div>
          <button
            onClick={handleGoToBilling}
            className="ml-6 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg 
                     hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg 
                     transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                     active:transform active:translate-y-0"
            aria-label="Navigate to billing plans"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
              View Plan
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
