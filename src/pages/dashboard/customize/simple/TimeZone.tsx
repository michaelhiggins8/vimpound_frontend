import React, { useState, useMemo, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

interface TimeZoneProps {
  initialValue?: string
}

export default function TimeZone({ initialValue = '' }: TimeZoneProps) {
  const [timeZone, setTimeZone] = useState(initialValue)

  useEffect(() => {
    setTimeZone(initialValue)
  }, [initialValue])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Get all available time zones
  const availableTimeZones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone').sort()
    } catch (e) {
      // Fallback for older browsers that don't support supportedValuesOf
      return [
        'America/Phoenix',
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'America/Anchorage',
        'America/Honolulu',
        'UTC',
      ]
    }
  }, [])

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        setLoading(false)
        return
      }

      if (!session) {
        setError('You must be signed in to change the time zone')
        setLoading(false)
        return
      }

      const accessToken = session.access_token

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/orgs/time-zone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ time_zone: timeZone.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to update time zone')
        setLoading(false)
        return
      }

      setSuccess(data.message || 'Time zone updated successfully')
      setTimeZone('') // Clear the input after successful update
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-[#111827] mb-3">
          Time Zone
        </h3>
        <p className="text-sm text-[#6b7280] leading-relaxed mb-6">
          Select the time zone for your organization to ensure accurate time-based operations.
        </p>

        <select
          id="time-zone"
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          disabled={loading}
          className={`w-full px-4 py-4 text-base border-2 border-[#d1d5db] rounded-lg outline-none transition-all duration-200 mb-6 ${
            loading ? 'bg-[#f3f4f6] cursor-not-allowed' : 'bg-white cursor-pointer'
          } text-[#111827] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20`}
        >
          <option value="">Select a time zone</option>
          {availableTimeZones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg 
              className="w-24 h-24 mx-auto text-[#3b82f6] opacity-20" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {(error || success) && (
          <div className="space-y-2">
            {error && (
              <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-[#991b1b] text-sm leading-relaxed">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg text-[#166534] text-sm leading-relaxed">
                {success}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !timeZone.trim()}
          className={`w-full px-4 py-3.5 text-base font-medium text-white rounded-lg transition-all duration-200 ${
            loading || !timeZone.trim()
              ? 'bg-[#9ca3af] cursor-not-allowed'
              : 'bg-[#3b82f6] cursor-pointer hover:bg-[#2563eb] active:scale-[0.98]'
          }`}
        >
          {loading ? 'Updating...' : 'Update Time Zone'}
        </button>
      </form>
    </div>
  )
}
