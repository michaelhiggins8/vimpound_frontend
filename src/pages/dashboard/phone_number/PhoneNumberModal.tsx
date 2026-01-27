import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface PhoneNumberModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  currentPhoneNumber: string
  phoneNumberLastChanged: string | null
  hasFetchError: boolean
}

export default function PhoneNumberModal({ isOpen, onClose, onSuccess, currentPhoneNumber, phoneNumberLastChanged, hasFetchError }: PhoneNumberModalProps) {
  const [formData, setFormData] = useState({
    area_code: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user can change phone number
  const canChangePhoneNumber = () => {
    // If there's a fetch error, don't allow changes
    if (hasFetchError) {
      return false
    }
    
    // If phoneNumberLastChanged is null (never changed before), allow changes
    if (phoneNumberLastChanged === null) {
      return true
    }
    
    // Check if it's been more than a month
    const lastChangedDate = new Date(phoneNumberLastChanged)
    const now = new Date()
    const oneMonthAgo = new Date(now)
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    return lastChangedDate <= oneMonthAgo
  }

  const getNextAvailableDate = () => {
    // If there's an error or never changed, return null
    if (hasFetchError || phoneNumberLastChanged === null) {
      return null
    }
    
    const lastChangedDate = new Date(phoneNumberLastChanged)
    const nextAvailableDate = new Date(lastChangedDate)
    nextAvailableDate.setMonth(nextAvailableDate.getMonth() + 1)
    
    return nextAvailableDate
  }

  const canChange = canChangePhoneNumber()
  const nextAvailableDate = getNextAvailableDate()

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user can change phone number
    if (!canChange) {
      setError('You cannot change your phone number at this time')
      return
    }
    
    // Area code is required
    if (!formData.area_code.trim()) {
      setError('Area code is required')
      return
    }

    // Validate area code (should be 3 digits)
    if (!/^\d{3}$/.test(formData.area_code.trim())) {
      setError('Area code must be exactly 3 digits')
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
        setError('You must be signed in to change phone number')
        setLoading(false)
        return
      }

      const accessToken = session.access_token

      // Prepare request body - only send area code
      const body = {
        area_code: formData.area_code.trim()
      }

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/vapi/phone-numbers/free`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorDetail = typeof data.detail === 'object' ? data.detail.error || JSON.stringify(data.detail) : data.detail
        setError(errorDetail || 'Failed to change phone number')
        setLoading(false)
        return
      }

      // Reset form
      setFormData({
        area_code: ''
      })

      // Success - close modal and refresh
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 z-10 border-b border-blue-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Change Phone Number
                </h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Current: <span className="font-semibold">{currentPhoneNumber}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
              title="Close"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {!canChange ? (
          /* Restriction View - Main Content */
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
              {/* Large Icon */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                hasFetchError ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <svg className={`w-12 h-12 ${hasFetchError ? 'text-red-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {hasFetchError ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              
              {/* Main Message */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  {hasFetchError ? 'Unable to Verify Change Status' : 'Phone Number Change Restricted'}
                </h3>
                <p className="text-base text-gray-600 max-w-md">
                  {hasFetchError 
                    ? 'We encountered an error while checking your phone number change status. Please try again later or contact support if the issue persists.'
                    : 'You can only change your phone number once per month. Please wait until after the date below to make another change.'}
                </p>
              </div>

              {/* Next Available Date - Prominent */}
              {nextAvailableDate ? (
                <div className="w-full max-w-md">
                  <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Next Available Date
                    </p>
                    <p className="text-4xl font-bold text-blue-700 mb-2">
                      {nextAvailableDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-2xl font-semibold text-blue-600">
                      {nextAvailableDate.toLocaleDateString('en-US', { year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ) : !hasFetchError && (
                <div className="w-full max-w-md">
                  <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl">
                    <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Status
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      Unable to determine next available date
                    </p>
                  </div>
                </div>
              )}

              {/* Current Phone Number Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Current Phone Number</p>
                <p className="text-lg font-semibold text-gray-900">{currentPhoneNumber}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Form View */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-6">
              {/* Current Phone Number Display */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900">Current Phone Number</span>
                </div>
                <p className="text-base font-bold text-gray-900">{currentPhoneNumber}</p>
              </div>

              {/* Area Code */}
              <div>
                <label htmlFor="area_code" className="block text-sm font-semibold text-gray-900 mb-2">
                  New Area Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg font-medium">+1</span>
                  </div>
                  <input
                    id="area_code"
                    name="area_code"
                    type="text"
                    value={formData.area_code}
                    onChange={handleChange}
                    placeholder="415"
                    disabled={loading || !canChange}
                    maxLength={3}
                    className={`w-full pl-12 pr-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                      loading || !canChange
                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                        : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    } text-gray-900 placeholder:text-gray-400`}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  3-digit US area code. Creates a new number with this area code and deletes the old one.
                </p>
              </div>

              {/* Preview */}
              {formData.area_code.trim() && /^\d{3}$/.test(formData.area_code.trim()) && (
                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-blue-900">New Phone Number Preview</h4>
                  </div>
                  <div className="text-sm text-gray-800 font-medium bg-white/60 rounded px-3 py-2 border border-blue-200">
                    +1 ({formData.area_code.trim()}) XXX-XXXX
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Your current number ({currentPhoneNumber}) will be deleted
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <svg
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-red-800 flex-1">{error}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-5 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !canChange || !formData.area_code.trim() || !/^\d{3}$/.test(formData.area_code.trim())}
                className={`flex-1 px-5 py-3 text-sm font-semibold text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  loading || !canChange || !formData.area_code.trim() || !/^\d{3}$/.test(formData.area_code.trim())
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 shadow-md hover:shadow-lg focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Phone Number'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer for Restriction View */}
        {!canChange && (
          <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white px-6 pb-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-5 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
