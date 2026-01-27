import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

interface TimeRange {
  start: string // Format: "HH:MM" (24-hour)
  end: string   // Format: "HH:MM" (24-hour)
}

interface DayHours {
  isClosed: boolean
  ranges: TimeRange[]
}

type WeekSchedule = {
  [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: DayHours
}

const DAYS_OF_WEEK: Array<{ key: keyof WeekSchedule; label: string; shortLabel: string }> = [
  { key: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { key: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { key: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { key: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { key: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
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

// Parse time from display format (e.g., "4:00 AM") to 24-hour format
function parseTimeDisplay(timeDisplay: string): string {
  const trimmed = timeDisplay.trim()
  const match = trimmed.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return '00:00'
  
  let hour = parseInt(match[1], 10)
  const minute = parseInt(match[2], 10)
  const period = match[3].toUpperCase() as 'AM' | 'PM'
  
  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0
  
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

// Parse hours string from backend format to WeekSchedule
function parseHoursString(hoursString: string | null | undefined): WeekSchedule {
  const defaultSchedule: WeekSchedule = {} as WeekSchedule
  
  // Initialize all days with default hours
  DAYS_OF_WEEK.forEach(day => {
    defaultSchedule[day.key] = {
      isClosed: false,
      ranges: [{ start: '04:00', end: '19:00' }]
    }
  })
  
  if (!hoursString || !hoursString.trim()) {
    return defaultSchedule
  }
  
  // Parse each line
  const lines = hoursString.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('*')) continue
    
    // Extract day name and hours
    const match = trimmed.match(/^\*\s*(\w+):\s*(.+)$/i)
    if (!match) continue
    
    const dayLabel = match[1]
    const hoursPart = match[2].trim()
    
    // Find matching day
    const dayInfo = DAYS_OF_WEEK.find(d => d.label.toLowerCase() === dayLabel.toLowerCase())
    if (!dayInfo) continue
    
    // Check if closed
    if (hoursPart.toLowerCase() === 'closed') {
      defaultSchedule[dayInfo.key] = {
        isClosed: true,
        ranges: []
      }
      continue
    }
    
    // Parse time ranges (e.g., "4:00 AM - 7:00 PM, 6:00 PM - 8:00 PM")
    const ranges: TimeRange[] = []
    const rangeStrings = hoursPart.split(',')
    
    for (const rangeStr of rangeStrings) {
      const rangeMatch = rangeStr.trim().match(/(.+?)\s*-\s*(.+)/)
      if (rangeMatch) {
        const start = parseTimeDisplay(rangeMatch[1].trim())
        const end = parseTimeDisplay(rangeMatch[2].trim())
        ranges.push({ start, end })
      }
    }
    
    if (ranges.length > 0) {
      defaultSchedule[dayInfo.key] = {
        isClosed: false,
        ranges
      }
    }
  }
  
  return defaultSchedule
}

interface DefualtTimeSelectorProps {
  initialHours?: string
  onUpdate?: () => void
}

export default function DefualtTimeSelector({ initialHours = '', onUpdate }: DefualtTimeSelectorProps) {
  const [schedule, setSchedule] = useState<WeekSchedule>(() => {
    return parseHoursString(initialHours)
  })

  // Update schedule when initialHours changes
  useEffect(() => {
    if (initialHours) {
      setSchedule(parseHoursString(initialHours))
    }
  }, [initialHours])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  // Format schedule to match backend format (like final_form)
  const formatScheduleForBackend = useCallback((schedule: WeekSchedule): string => {
    return DAYS_OF_WEEK.map(day => {
      const daySchedule = schedule[day.key]
      if (daySchedule.isClosed) {
        return `* ${day.label}: Closed`
      }
      
      const rangesText = daySchedule.ranges
        .map(range => `${formatTimeDisplay(range.start)} - ${formatTimeDisplay(range.end)}`)
        .join(', ')
      
      return `* ${day.label}: ${rangesText}`
    }).join('\n')
  }, [])

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
        setError('You must be signed in to update business hours')
        setLoading(false)
        return
      }

      const accessToken = session.access_token
      const formattedHours = formatScheduleForBackend(schedule)

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/orgs/default-hours`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ default_hours_of_operation: formattedHours }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to update business hours')
        setLoading(false)
        return
      }

      setSuccess(data.message || 'Business hours updated successfully')
      onUpdate?.() // Invalidate and refetch the query cache
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateDaySchedule = useCallback((dayKey: keyof WeekSchedule, updater: (day: DayHours) => DayHours) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: updater(prev[dayKey])
    }))
  }, [])

  const toggleDayClosed = useCallback((dayKey: keyof WeekSchedule) => {
    updateDaySchedule(dayKey, (day) => ({
      ...day,
      isClosed: !day.isClosed
    }))
  }, [updateDaySchedule])

  const addTimeRange = useCallback((dayKey: keyof WeekSchedule) => {
    updateDaySchedule(dayKey, (day) => ({
      ...day,
      ranges: [...day.ranges, { start: '09:00', end: '17:00' }]
    }))
  }, [updateDaySchedule])

  const removeTimeRange = useCallback((dayKey: keyof WeekSchedule, rangeIndex: number) => {
    updateDaySchedule(dayKey, (day) => ({
      ...day,
      ranges: day.ranges.filter((_, idx) => idx !== rangeIndex)
    }))
  }, [updateDaySchedule])

  const updateTimeRange = useCallback((
    dayKey: keyof WeekSchedule,
    rangeIndex: number,
    field: 'start' | 'end',
    time24: string
  ) => {
    updateDaySchedule(dayKey, (day) => ({
      ...day,
      ranges: day.ranges.map((range, idx) =>
        idx === rangeIndex ? { ...range, [field]: time24 } : range
      )
    }))
  }, [updateDaySchedule])

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

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newHour = e.target.value
      // Allow empty string for typing
      if (newHour === '') {
        setLocalHour('')
        return
      }
      
      // Allow typing digits
      if (!/^\d+$/.test(newHour)) {
        return
      }
      
      const numHour = parseInt(newHour, 10)
      
      // Allow partial input while typing (e.g., "8" when typing "8" to replace "4")
      // But validate on blur or when complete
      setLocalHour(newHour)
      
      // Only update the actual time if it's a valid hour
      if (!isNaN(numHour) && numHour >= 1 && numHour <= 12) {
        const currentMinute = parseInt(localMinute, 10) || 0
        onChange(formatTime12To24(numHour, currentMinute, localPeriod))
      }
    }

    const handleHourBlur = () => {
      const numHour = parseInt(localHour, 10)
      // If invalid or empty, reset to current hour from value
      if (isNaN(numHour) || numHour < 1 || numHour > 12) {
        const { hour: h } = formatTime24To12(value)
        setLocalHour(h.toString())
      } else {
        // Ensure it's updated with the correct value
        const currentMinute = parseInt(localMinute, 10) || 0
        onChange(formatTime12To24(numHour, currentMinute, localPeriod))
      }
    }

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMinute = e.target.value
      // Allow empty string for typing
      if (newMinute === '') {
        setLocalMinute('')
        return
      }
      
      // Allow typing digits
      if (!/^\d+$/.test(newMinute)) {
        return
      }
      
      const numMinute = parseInt(newMinute, 10)
      
      // Allow partial input while typing
      setLocalMinute(newMinute)
      
      // Only update the actual time if it's a valid minute
      if (!isNaN(numMinute) && numMinute >= 0 && numMinute <= 59) {
        const currentHour = parseInt(localHour, 10) || 1
        onChange(formatTime12To24(currentHour, numMinute, localPeriod))
      }
    }

    const handleMinuteBlur = () => {
      const numMinute = parseInt(localMinute, 10)
      // If invalid or empty, reset to current minute from value
      if (isNaN(numMinute) || numMinute < 0 || numMinute > 59) {
        const { minute: m } = formatTime24To12(value)
        setLocalMinute(m.toString().padStart(2, '0'))
      } else {
        // Ensure it's padded and updated
        const padded = numMinute.toString().padStart(2, '0')
        setLocalMinute(padded)
        const currentHour = parseInt(localHour, 10) || 1
        onChange(formatTime12To24(currentHour, numMinute, localPeriod))
      }
    }

    const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
      setLocalPeriod(newPeriod)
      const currentHour = parseInt(localHour, 10) || 1
      const currentMinute = parseInt(localMinute, 10) || 0
      onChange(formatTime12To24(currentHour, currentMinute, newPeriod))
    }

    return (
      <div className="flex items-center gap-2 min-w-0">
        <label className="text-xs font-medium text-gray-700 whitespace-nowrap flex-shrink-0">{label}:</label>
        <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-2 py-1.5 bg-white shadow-sm hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all min-w-0">
          <input
            type="text"
            inputMode="numeric"
            value={localHour}
            onChange={handleHourChange}
            onBlur={handleHourBlur}
            className="w-8 text-sm font-medium text-gray-900 outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-shrink-0"
          />
          <span className="text-gray-500 font-medium flex-shrink-0">:</span>
          <input
            type="text"
            inputMode="numeric"
            value={localMinute}
            onChange={handleMinuteChange}
            onBlur={handleMinuteBlur}
            className="w-8 text-sm font-medium text-gray-900 outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-shrink-0"
          />
          <select
            value={localPeriod}
            onChange={(e) => handlePeriodChange(e.target.value as 'AM' | 'PM')}
            className="text-xs font-medium text-gray-900 outline-none border-none bg-transparent cursor-pointer flex-shrink-0 w-auto min-w-[45px]"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ scrollbarWidth: 'thin' }}>
        {DAYS_OF_WEEK.map((day) => {
          const daySchedule = schedule[day.key]
          
          return (
            <div
              key={day.key}
              className={`flex-shrink-0 w-[240px] min-w-[240px] border-2 rounded-xl p-5 transition-all duration-200 overflow-hidden ${
                daySchedule.isClosed
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-md shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-sm font-semibold tracking-tight ${
                  daySchedule.isClosed ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {day.label}
                </h3>
                <button
                  type="button"
                  onClick={() => toggleDayClosed(day.key)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    daySchedule.isClosed
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
                      : 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                  }`}
                >
                  {daySchedule.isClosed ? 'Closed' : 'Open'}
                </button>
              </div>

              {!daySchedule.isClosed && (
                <div className="space-y-4">
                  {daySchedule.ranges.map((range, rangeIndex) => (
                    <div key={rangeIndex} className="space-y-3">
                      <div className="flex flex-col gap-3">
                        <TimeInput
                          value={range.start}
                          onChange={(time24) => updateTimeRange(day.key, rangeIndex, 'start', time24)}
                          label="Open"
                        />
                        <TimeInput
                          value={range.end}
                          onChange={(time24) => updateTimeRange(day.key, rangeIndex, 'end', time24)}
                          label="Close"
                        />
                      </div>
                      {daySchedule.ranges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeRange(day.key, rangeIndex)}
                          className="w-full text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 py-1.5 rounded-md transition-colors"
                        >
                          Remove
                        </button>
                      )}
                      {rangeIndex < daySchedule.ranges.length - 1 && (
                        <div className="text-xs font-medium text-gray-500 text-center py-1.5">and</div>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => addTimeRange(day.key)}
                    className="w-full text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2 rounded-md transition-colors border border-blue-200 hover:border-blue-300"
                  >
                    + Add another time range
                  </button>
                </div>
              )}

              {daySchedule.isClosed && (
                <div className="text-xs font-medium text-gray-400 text-center py-3">
                  Closed
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Preview/Summary Section */}
      <div className="mt-2 p-5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 tracking-tight">Preview:</h4>
        <div className="space-y-2 text-sm text-gray-700">
          {DAYS_OF_WEEK.map((day) => {
            const daySchedule = schedule[day.key]
            if (daySchedule.isClosed) {
              return (
                <div key={day.key} className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 min-w-[100px]">{day.label}:</span>
                  <span className="text-gray-500">Closed</span>
                </div>
              )
            }
            
            const rangesText = daySchedule.ranges
              .map(range => `${formatTimeDisplay(range.start)} - ${formatTimeDisplay(range.end)}`)
              .join(', ')
            
            return (
              <div key={day.key} className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 min-w-[100px]">{day.label}:</span>
                <span className="text-gray-700">{rangesText}</span>
              </div>
            )
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all duration-200 shadow-sm ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 cursor-pointer hover:bg-blue-700 hover:shadow-md active:scale-[0.98]'
        }`}
      >
        {loading ? 'Saving...' : 'Save Business Hours'}
      </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800 text-sm shadow-sm">
          <div className="font-medium">Error:</div>
          <div className="mt-1">{error}</div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-800 text-sm shadow-sm">
          <div className="font-medium">Success:</div>
          <div className="mt-1">{success}</div>
        </div>
      )}
    </div>
  )
}
