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
    <div className="bg-white border-2 border-[#10b981] rounded-xl p-8 shadow-lg transition-shadow hover:shadow-xl">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          <div className="p-3 bg-[#f0fdf4] rounded-lg flex-shrink-0">
            <svg 
              className="w-6 h-6 text-[#10b981]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          
          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-[#111827] tracking-tight">
                Subscription Active
              </h3>
              <span className="px-3 py-1 text-xs font-semibold text-white bg-[#10b981] rounded-full uppercase tracking-wide">
                Active
              </span>
            </div>
            <p className="text-base text-[#6b7280] leading-relaxed">
              You are currently subscribed to our service. Manage your billing information, update payment methods, view invoices, and modify your subscription settings.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div 
          className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
            <p className="text-sm text-red-700 break-words">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
            aria-label="Dismiss error"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Features List */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-start gap-3 p-3 bg-[#f9fafb] rounded-lg border border-[#f3f4f6]">
          <svg 
            className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#111827]">Payment Methods</p>
            <p className="text-xs text-[#6b7280]">Update or change your payment information</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-[#f9fafb] rounded-lg border border-[#f3f4f6]">
          <svg 
            className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#111827]">Invoice History</p>
            <p className="text-xs text-[#6b7280]">View and download past invoices</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-[#f9fafb] rounded-lg border border-[#f3f4f6]">
          <svg 
            className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#111827]">Billing Details</p>
            <p className="text-xs text-[#6b7280]">Review your subscription and billing</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-[#f9fafb] rounded-lg border border-[#f3f4f6]">
          <svg 
            className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#111827]">Subscription Settings</p>
            <p className="text-xs text-[#6b7280]">Modify or cancel your subscription</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          onClick={handleManageBilling}
          disabled={loading}
          className="flex-1 px-6 py-3 text-base font-semibold text-white bg-[#10b981] rounded-lg hover:bg-[#059669] active:bg-[#047857] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#10b981] disabled:hover:shadow-sm flex items-center justify-center gap-2"
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
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Opening Portal...</span>
            </>
          ) : (
            <>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Manage Billing</span>
            </>
          )}
        </button>
        
        {/* Info Text */}
        <div className="flex items-center gap-2 text-sm text-[#6b7280] px-2">
          <svg 
            className="w-4 h-4 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs">Opens in a new tab</span>
        </div>
      </div>
    </div>
  )
}
