import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../../../../../lib/supabase'

interface TimeRange {
  start: string // Format: "HH:MM" (24-hour)
  end: string   // Format: "HH:MM" (24-hour)
}

interface ExceptionModalProps {
  isOpen: boolean
  onClose: () => void
  month: number
  day: number
  onSuccess?: () => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Convert 24-hour format to 12-hour format with AM/PM
function formatTime24To12(time24: string): { hour: number; minute: number; period: 'AM' | 'PM' } {
  const [hourStr, minuteStr] = time24.split(':')
  let hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)
  
  const period = hour >= 12 ? 'PM' : 'AM'
  if (hour === 0) hour = 12
  else if (hour > 12) hour -= 12
  
  return { hour, minute, period }
}

// Convert 12-hour format to 24-hour format
function formatTime12To24(hour: number, minute: number, period: 'AM' | 'PM'): string {
  let hour24 = hour
  if (period === 'PM' && hour !== 12) hour24 = hour + 12
  if (period === 'AM' && hour === 12) hour24 = 0
  
  return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

// Format time for display (e.g., "4:00 AM")
function formatTimeDisplay(time24: string): string {
  const { hour, minute, period } = formatTime24To12(time24)
  return `${hour}:${minute.toString().padStart(2, '0')} ${period}`
}

export default function ExceptionModal({ isOpen, onClose, month, day, onSuccess }: ExceptionModalProps) {
  const [isClosed, setIsClosed] = useState(false)
  const [ranges, setRanges] = useState<TimeRange[]>([{ start: '04:00', end: '19:00' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsClosed(false)
      setRanges([{ start: '04:00', end: '19:00' }])
      setError(null)
    }
  }, [isOpen])

  // Format hours to match the format used in DefualtTimeSelector
  const formatHoursForBackend = useCallback((ranges: TimeRange[], isClosed: boolean): string => {
    if (isClosed) {
      return 'Closed'
    }
    
    return ranges
      .map(range => `${formatTimeDisplay(range.start)} - ${formatTimeDisplay(range.end)}`)
      .join(', ')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        setError('You must be signed in to create exception dates')
        setLoading(false)
        return
      }

      const accessToken = session.access_token
      
      // Format date as "[month]/[day]" e.g., "12/05"
      const formattedDate = `${(month + 1).toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`
      
      // Format hours
      const formattedHours = formatHoursForBackend(ranges, isClosed)

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/orgs/exception-dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          date: formattedDate,
          hours: formattedHours
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to create exception date')
        setLoading(false)
        return
      }

      // Success - close modal and refresh the list
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

  const addTimeRange = useCallback(() => {
    setRanges(prev => [...prev, { start: '09:00', end: '17:00' }])
  }, [])

  const removeTimeRange = useCallback((rangeIndex: number) => {
    setRanges(prev => prev.filter((_, idx) => idx !== rangeIndex))
  }, [])

  const updateTimeRange = useCallback((
    rangeIndex: number,
    field: 'start' | 'end',
    time24: string
  ) => {
    setRanges(prev => prev.map((range, idx) =>
      idx === rangeIndex ? { ...range, [field]: time24 } : range
    ))
  }, [])

  const TimeInput = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: string
    onChange: (time24: string) => void
    label: string
  }) => {
    const { hour, minute, period } = formatTime24To12(value)
    const [localHour, setLocalHour] = useState(hour.toString())
    const [localMinute, setLocalMinute] = useState(minute.toString().padStart(2, '0'))
    const [localPeriod, setLocalPeriod] = useState(period)

    // Sync local state when external value changes
    useEffect(() => {
      const { hour: h, minute: m, period: p } = formatTime24To12(value)
      setLocalHour(h.toString())
      setLocalMinute(m.toString().padStart(2, '0'))
      setLocalPeriod(p)
    }, [value])

    const handleHourChange = (newHour: string) => {
      const numHour = parseInt(newHour, 10)
      if (isNaN(numHour) || numHour < 1 || numHour > 12) return
      setLocalHour(newHour)
      onChange(formatTime12To24(numHour, parseInt(localMinute, 10), localPeriod))
    }

    const handleMinuteChange = (newMinute: string) => {
      const numMinute = parseInt(newMinute, 10)
      if (isNaN(numMinute) || numMinute < 0 || numMinute > 59) return
      const padded = newMinute.padStart(2, '0')
      setLocalMinute(padded)
      onChange(formatTime12To24(parseInt(localHour, 10), numMinute, localPeriod))
    }

    const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
      setLocalPeriod(newPeriod)
      onChange(formatTime12To24(parseInt(localHour, 10), parseInt(localMinute, 10), newPeriod))
    }

    return (
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-900 whitespace-nowrap min-w-[60px]">{label}:</label>
        <div className="flex items-center gap-1.5 border-2 border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all duration-200">
          <input
            type="number"
            min="1"
            max="12"
            value={localHour}
            onChange={(e) => handleHourChange(e.target.value)}
            className="w-10 text-sm font-medium text-gray-900 outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-gray-500 font-medium">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={localMinute}
            onChange={(e) => handleMinuteChange(e.target.value)}
            className="w-10 text-sm font-medium text-gray-900 outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <select
            value={localPeriod}
            onChange={(e) => handlePeriodChange(e.target.value as 'AM' | 'PM')}
            className="text-sm font-medium text-gray-900 outline-none border-none bg-transparent cursor-pointer ml-1"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  const dateString = `${MONTHS[month]} ${day}`

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 z-10 border-b border-emerald-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Set Hours for {dateString}
              </h2>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Closed/Open Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
            <span className="text-sm font-semibold text-gray-900">Status:</span>
            <button
              type="button"
              onClick={() => setIsClosed(!isClosed)}
              disabled={loading}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isClosed
                  ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500'
              }`}
            >
              {isClosed ? 'Closed' : 'Open'}
            </button>
          </div>

          {!isClosed && (
            <div className="space-y-4">
              {ranges.map((range, rangeIndex) => (
                <div key={rangeIndex} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg p-5 space-y-4 hover:border-gray-300 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-600">{rangeIndex + 1}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">Time Range {rangeIndex + 1}</h4>
                  </div>
                  <div className="flex flex-col gap-3">
                    <TimeInput
                      value={range.start}
                      onChange={(time24) => updateTimeRange(rangeIndex, 'start', time24)}
                      label="Open"
                    />
                    <TimeInput
                      value={range.end}
                      onChange={(time24) => updateTimeRange(rangeIndex, 'end', time24)}
                      label="Close"
                    />
                  </div>
                  {ranges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeRange(rangeIndex)}
                      className="w-full px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Remove Range
                    </button>
                  )}
                  {rangeIndex < ranges.length - 1 && (
                    <div className="text-xs font-medium text-gray-500 text-center py-2">and</div>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addTimeRange}
                disabled={loading}
                className="w-full px-4 py-3 text-sm font-semibold text-emerald-600 border-2 border-emerald-300 rounded-lg hover:bg-emerald-50 hover:border-emerald-400 active:bg-emerald-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Time Range
              </button>
            </div>
          )}

          {isClosed && (
            <div className="text-center py-8 bg-red-50 border-2 border-red-200 rounded-lg">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-sm font-medium text-red-700">This date will be marked as closed</p>
            </div>
          )}

          {/* Preview */}
          <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <h4 className="text-sm font-semibold text-emerald-900">Preview</h4>
            </div>
            <div className="text-sm text-gray-800 font-medium bg-white/60 rounded px-3 py-2 border border-emerald-200">
              {isClosed ? (
                <span className="text-red-600">Closed</span>
              ) : (
                <span>
                  {ranges.map((range, idx) => (
                    <span key={idx}>
                      {formatTimeDisplay(range.start)} - {formatTimeDisplay(range.end)}
                      {idx < ranges.length - 1 && ', '}
                    </span>
                  ))}
                </span>
              )}
            </div>
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
              disabled={loading}
              className={`flex-1 px-5 py-3 text-sm font-semibold text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 shadow-md hover:shadow-lg focus:ring-emerald-500'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
