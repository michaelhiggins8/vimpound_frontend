import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface SubscribedProps {
  onManageClick?: () => void
}

export default function Subscribed({ onManageClick }: SubscribedProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  const handleManageBilling = async () => {
    // If a custom handler is provided, use it
    if (onManageClick) {
      onManageClick()
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        setLoading(false)
        return
      }

      if (!session) {
        setError('You must be signed in to access billing information')
        setLoading(false)
        return
      }

      const accessToken = session.access_token

      // Call the backend to get the billing portal URL
      const response = await fetch(`${backendUrl}/orgs/customer-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show the full error detail from the backend
        const errorMessage = data.detail || data.message || JSON.stringify(data) || 'Failed to get billing portal URL'
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Open the returned URL in a new tab
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      } else {
        setError('No URL returned from server')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center md:text-left">
        <h3 className="text-2xl md:text-3xl font-bold text-[#111827] mb-3 tracking-tight">
          Subscription Active
        </h3>
        <p className="text-base md:text-lg text-[#6b7280] leading-relaxed max-w-xl">
          You are currently subscribed to our service. Manage your billing information, update payment methods, view invoices, and modify your subscription settings.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
          role="alert"
          aria-live="polite"
        >
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
            <p className="text-sm text-red-700 break-words">{error}</p>
          </div>
        </div>
      )}

      {/* Billing Card */}
      <div className="bg-white rounded-xl p-8 shadow-lg transition-shadow hover:shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f0fdf4] rounded-lg">
              <svg
                className="w-5 h-5 text-[#10b981]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#111827] leading-tight">
                Billing Management
              </h4>
              <p className="text-sm text-[#6b7280] mt-1">
                Access your billing portal to manage payment methods, view invoices, and update your subscription.
              </p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="grid gap-3 mb-7">
          <div className="flex items-start gap-3 p-4 bg-[#f9fafb] rounded-lg">
            <svg
              className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-[#111827] mb-1">Payment Methods</div>
              <div className="text-sm text-[#374151] leading-relaxed">
                Update or change your payment information securely through the billing portal.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#f9fafb] rounded-lg">
            <svg
              className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-[#111827] mb-1">Invoice History</div>
              <div className="text-sm text-[#374151] leading-relaxed">
                View and download past invoices for your records and accounting needs.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-[#f9fafb] rounded-lg">
            <svg
              className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-[#111827] mb-1">Subscription Settings</div>
              <div className="text-sm text-[#374151] leading-relaxed">
                Modify or cancel your subscription, update billing details, and manage your plan.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center">
        <button
          onClick={handleManageBilling}
          disabled={loading}
          className="w-full md:w-auto md:min-w-[200px] px-6 py-3 text-base font-semibold text-white bg-[#10b981] rounded-lg hover:bg-[#059669] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#10b981] flex items-center justify-center gap-2"
          aria-label={loading ? 'Loading billing portal...' : 'Open billing portal in new tab'}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Opening Portal...</span>
            </>
          ) : (
            <span>Manage Billing</span>
          )}
        </button>
      </div>
    </div>
  )
}
