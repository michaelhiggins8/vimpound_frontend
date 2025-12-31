import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface NotSubscribedProps {
  onSubscribeClick?: () => void
}

export default function NotSubscribed({ onSubscribeClick }: NotSubscribedProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  const handleSubscribe = async () => {
    // If a custom handler is provided, use it
    if (onSubscribeClick) {
      onSubscribeClick()
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
        setError('You must be signed in to subscribe')
        setLoading(false)
        return
      }

      const accessToken = session.access_token

      // Call the backend to get the subscription URL
      const response = await fetch(`${backendUrl}/subscribe-url`, {
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
        const errorMessage = data.detail || data.message || JSON.stringify(data) || 'Failed to get subscription URL'
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Open the returned URL in a new tab
      if (data.url) {
        window.open(data.url, '_blank')
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
      {/* Header Section - Better visual hierarchy */}
      <div className="text-center md:text-left">
        <h3 className="text-2xl md:text-3xl font-bold text-[#111827] mb-3 tracking-tight">
          Subscribe
        </h3>
        <p className="text-base md:text-lg text-[#6b7280] leading-relaxed max-w-xl">
          Join today to create your phone agent and unlock powerful automation features.
        </p>
      </div>

      {/* Error Message - Positioned prominently at top if present */}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
            <p className="text-sm text-red-700 break-words">{error}</p>
          </div>
        </div>
      )}
      
      {/* Pricing Card - Separated from CTA for better visual balance */}
      <div className="bg-white border-2 border-[#3b82f6] rounded-xl p-8 shadow-lg transition-shadow hover:shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-[#f0fdf4] rounded-lg">
            <svg 
              className="w-5 h-5 text-[#10b981]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-[#111827]">Pricing Details</h4>
        </div>
        
        <ul className="space-y-4 mb-8">
          <li className="flex items-start gap-4 p-4 bg-[#f9fafb] rounded-lg border border-[#f3f4f6]">
            <div className="flex-shrink-0 mt-0.5">
              <svg 
                className="w-5 h-5 text-[#10b981]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-semibold text-[#111827] block mb-1">Base fee</span>
              <span className="text-[#374151]">$500 per month</span>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 bg-[#f9fafb] rounded-lg border border-[#f3f4f6]">
            <div className="flex-shrink-0 mt-0.5">
              <svg 
                className="w-5 h-5 text-[#10b981]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-semibold text-[#111827] block mb-1">Usage</span>
              <span className="text-[#374151]">$0.20 per minute</span>
            </div>
          </li>
        </ul>
      </div>
      
      {/* CTA Button - Separated and more prominent */}
      <div className="flex justify-center">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full md:w-auto md:min-w-[200px] px-6 py-3 text-base font-semibold text-white bg-[#10b981] rounded-lg hover:bg-[#059669] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#10b981] flex items-center justify-center gap-2"
          aria-label={loading ? 'Processing subscription...' : 'Subscribe to service'}
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
              <span>Processing...</span>
            </>
          ) : (
            <span>Subscribe Now</span>
          )}
        </button>
      </div>
    </div>
  )
}
