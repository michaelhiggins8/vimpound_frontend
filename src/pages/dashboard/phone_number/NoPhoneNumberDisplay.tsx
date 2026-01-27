import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface NoPhoneNumberDisplayProps {
  onSubmitPhoneNumber: (phoneNumber: PhoneNumber) => void
}

interface PhoneNumber {
  phone_number: string
  friendly_name: string
  locality: string
  region: string
  iso_country: string
}

interface AvailablePhoneNumbersResponse {
  area_code: number
  count: number
  phone_numbers: PhoneNumber[]
}

export default function NoPhoneNumberDisplay({ onSubmitPhoneNumber }: NoPhoneNumberDisplayProps) {
  const [areaCode, setAreaCode] = useState('')
  const [availableNumbers, setAvailableNumbers] = useState<PhoneNumber[]>([])
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  const handleSearchNumbers = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setAvailableNumbers([])
    setSelectedNumber(null)

    // Validate area code
    const areaCodeNum = parseInt(areaCode.trim())
    if (isNaN(areaCodeNum) || areaCodeNum < 200 || areaCodeNum > 999) {
      setError('Please enter a valid 3-digit area code (e.g., 760)')
      setLoading(false)
      return
    }

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        setLoading(false)
        return
      }

      if (!session) {
        setError('You must be signed in to search for phone numbers')
        setLoading(false)
        return
      }

      const accessToken = session.access_token

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/phone-numbers/available`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ area_code: areaCodeNum }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to fetch available phone numbers')
        setLoading(false)
        return
      }

      const data: AvailablePhoneNumbersResponse = await response.json()
      setAvailableNumbers(data.phone_numbers)
      if (data.phone_numbers.length === 0) {
        setError(`No phone numbers available for area code ${areaCodeNum}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPhoneNumber = async () => {
    if (!selectedNumber) {
      setError('Please select a phone number first')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        setSubmitting(false)
        return
      }

      if (!session) {
        setError('You must be signed in to create a phone number')
        setSubmitting(false)
        return
      }

      const accessToken = session.access_token

      // Variable for testing - can reassign phoneNumber to a different value
       

      // Make the fetch call to create the phone number
      const response = await fetch(`${backendUrl}/vapi/phone-numbers/twilio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ phone_number: selectedNumber.phone_number }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.detail?.error || errorData.detail || 'Failed to create phone number')
        setSubmitting(false)
        return
      }

      await response.json()
      
      // Call the success handler with the created phone number
      onSubmitPhoneNumber(selectedNumber)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

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

        {/* Area Code Search Section */}
        <div className="bg-blue-50 rounded-lg p-5 border border-blue-200 mb-6">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Search Available Phone Numbers
          </label>
          <form onSubmit={handleSearchNumbers} className="mb-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="Enter area code (e.g., 760)"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !areaCode.trim()}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 
                         transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Search
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Available Phone Numbers List */}
          {availableNumbers.length > 0 && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                Available Phone Numbers ({availableNumbers.length})
              </label>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {availableNumbers.map((number) => (
                  <button
                    key={number.phone_number}
                    type="button"
                    onClick={() => setSelectedNumber(number)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedNumber?.phone_number === number.phone_number
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">{number.phone_number}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {number.locality}, {number.region}
                        </p>
                      </div>
                      {selectedNumber?.phone_number === number.phone_number && (
                        <div className="flex-shrink-0 ml-3">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {selectedNumber && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    Selected: <span className="font-semibold">{selectedNumber.phone_number}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">
              {selectedNumber 
                ? `Ready to create phone number ${selectedNumber.phone_number}?`
                : 'Select a phone number above to continue'}
            </p>
            <p className="text-gray-500">
              {selectedNumber 
                ? 'Click the button on the right to create your phone number. (may take several minutes to fully update after completion)'
                : 'Search for available phone numbers by entering an area code.'}
            </p>
          </div>
          <button
            onClick={handleSubmitPhoneNumber}
            disabled={!selectedNumber || submitting}
            className="ml-6 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 
                     transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     active:transform active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="flex items-center gap-2">
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
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
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
