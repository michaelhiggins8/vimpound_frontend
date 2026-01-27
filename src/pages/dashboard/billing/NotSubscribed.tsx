import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface NotSubscribedProps {
  onSubscribeClick?: () => void
}

export default function NotSubscribed({ onSubscribeClick }: NotSubscribedProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

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
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

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
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show the full error detail from the backend
        const errorMessage =
          data.detail || data.message || JSON.stringify(data) || 'Failed to get subscription URL'
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
      {/* Header Section */}
      <div className="text-center md:text-left">
        <h3 className="text-2xl md:text-3xl font-bold text-[#111827] mb-3 tracking-tight">
          Subscribe
        </h3>
        <p className="text-base md:text-lg text-[#6b7280] leading-relaxed max-w-xl">
          Turn missed calls into clean tow requests and instant answers — with a voice agent and live
          dashboards built for impound lots.
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

      {/* Pricing Card */}
      <div className="bg-white rounded-xl p-8 shadow-lg transition-shadow hover:shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ecfeff] rounded-lg">
              <svg
                className="w-5 h-5 text-[#0ea5e9]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#111827] leading-tight">
                Vimpound Phone Agent + Live Dashboards
              </h4>
              <p className="text-sm text-[#6b7280] mt-1">
                Answers customer calls, collects tow details, and supports “is my car there?”
                questions — while your team stays in control.
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold text-[#111827]">$500</div>
            <div className="text-sm text-[#6b7280] -mt-1">per month</div>
          </div>
        </div>

        {/* What they get */}
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
              <div className="font-semibold text-[#111827] mb-1">24/7 call handling (your rules)</div>
              <div className="text-sm text-[#374151] leading-relaxed">
                Your agent answers the phone, follows your hours & identity, and handles the two
                core call types: tow requests + general questions.
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
              <div className="font-semibold text-[#111827] mb-1">Tow Requests dashboard (human-in-the-loop)</div>
              <div className="text-sm text-[#374151] leading-relaxed">
                When someone needs a tow, Vimpound collects the key details and posts a clean “Tow
                Request” for your dispatcher to act on.
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
              <div className="font-semibold text-[#111827] mb-1">Vehicle Panel (keeps the agent accurate)</div>
              <div className="text-sm text-[#374151] leading-relaxed">
                Add/update vehicles in your lot so the agent can answer common questions like
                availability, location, and retrieval info.
              </div>
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="rounded-lg bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold text-[#111827]">Usage</div>
              <div className="text-sm text-[#6b7280] mt-1">
                You only pay more when the phone agent is actively on calls.
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-[#111827]">$0.20</div>
              <div className="text-sm text-[#6b7280] -mt-1">per minute</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-[#6b7280] leading-relaxed">
            Minutes are based on talk time. (No confusing “seat” pricing — this is tied directly to
            call volume.)
          </div>
        </div>
      </div>

      {/* Terms Agreement Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-4 bg-[#f9fafb] rounded-lg">
          <input
            type="checkbox"
            id="terms-agreement"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-[#10b981] rounded focus:ring-[#10b981] focus:ring-2 cursor-pointer"
          />
          <label htmlFor="terms-agreement" className="flex-1 text-sm text-[#374151] cursor-pointer">
            I agree to the{' '}
            <button
              type="button"
              onClick={() => window.open('/terms', '_blank')}
              className="text-[#3b82f6] hover:text-[#2563eb] underline font-medium focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-1 rounded"
            >
              Terms of Service
            </button>
          </label>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubscribe}
          disabled={loading || !agreedToTerms}
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
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
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
