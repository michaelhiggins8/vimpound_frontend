import { useState, useEffect } from 'react'
import { supabase } from '../../../../../lib/supabase'
import CalendarModal from './CalendarModel'
import ExceptionModal from './ExceptionModal'
import EditExceptionModal from './EditExceptionModal'

interface ExceptionDate {
  id?: number // Database ID (optional for new entries)
  date: string
  hours: string
}

export default function ExceptionDates() {
  const [exceptionDates, setExceptionDates] = useState<ExceptionDate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingException, setEditingException] = useState<ExceptionDate | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  useEffect(() => {
    const fetchExceptionDates = async () => {
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
          setError('You must be signed in to view exception dates')
          setLoading(false)
          return
        }

        const accessToken = session.access_token

        // Make the fetch call to the backend
        const response = await fetch(`${backendUrl}/orgs/exception-dates`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.detail || 'Failed to fetch exception dates')
          setLoading(false)
          return
        }

        setExceptionDates(data.exception_dates || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchExceptionDates()
  }, [backendUrl])

  const handleDateSelect = (month: number, day: number) => {
    setSelectedMonth(month)
    setSelectedDay(day)
    setIsExceptionModalOpen(true)
  }

  const handleExceptionSuccess = () => {
    // Refetch exception dates after successful creation
    const fetchExceptionDates = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          setError(`Failed to get session: ${sessionError.message}`)
          setLoading(false)
          return
        }

        if (!session) {
          setError('You must be signed in to view exception dates')
          setLoading(false)
          return
        }

        const accessToken = session.access_token

        const response = await fetch(`${backendUrl}/orgs/exception-dates`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.detail || 'Failed to fetch exception dates')
          setLoading(false)
          return
        }

        setExceptionDates(data.exception_dates || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchExceptionDates()
  }

  const handleDelete = async (id: number) => {
    if (!id) {
      setError('Cannot delete: Missing ID')
      return
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this exception date?')) {
      return
    }

    setDeletingId(id)
    setError(null)

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        setDeletingId(null)
        return
      }

      if (!session) {
        setError('You must be signed in to delete exception dates')
        setDeletingId(null)
        return
      }

      const accessToken = session.access_token

      // Make the DELETE request to the backend
      const response = await fetch(`${backendUrl}/orgs/exception-dates`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id: id.toString() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to delete exception date')
        setDeletingId(null)
        return
      }

      // Remove the deleted entry from the list
      setExceptionDates(prev => prev.filter(ed => ed.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-gray-600 font-medium">Loading exception dates...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 shadow-sm">
        <div className="font-semibold text-red-900 mb-1">Error</div>
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm font-medium text-gray-700">
          {exceptionDates.length === 0 
            ? 'No exception dates configured'
            : `${exceptionDates.length} exception date${exceptionDates.length !== 1 ? 's' : ''} configured`
          }
        </div>
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          + Add Exception Date
        </button>
      </div>
      
      {exceptionDates.length > 0 && (
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exceptionDates.map((exceptionDate, index) => (
                <tr key={exceptionDate.id ?? index} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {exceptionDate.date}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 cursor-pointer hover:text-blue-600 hover:font-medium transition-all duration-150"
                    onClick={() => exceptionDate.id && setEditingException(exceptionDate)}
                    title="Click to edit hours"
                  >
                    {exceptionDate.hours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {exceptionDate.id && (
                      <button
                        onClick={() => handleDelete(exceptionDate.id!)}
                        disabled={deletingId === exceptionDate.id}
                        className={`px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-150 ${
                          deletingId === exceptionDate.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Delete exception date"
                      >
                        {deletingId === exceptionDate.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSelectDate={handleDateSelect}
      />
      
      {selectedMonth !== null && selectedDay !== null && (
        <ExceptionModal
          isOpen={isExceptionModalOpen}
          onClose={() => {
            setIsExceptionModalOpen(false)
            setSelectedMonth(null)
            setSelectedDay(null)
          }}
          month={selectedMonth}
          day={selectedDay}
          onSuccess={handleExceptionSuccess}
        />
      )}

      {editingException && editingException.id && (
        <EditExceptionModal
          isOpen={!!editingException}
          onClose={() => setEditingException(null)}
          exceptionId={editingException.id}
          date={editingException.date}
          currentHours={editingException.hours}
          onSuccess={handleExceptionSuccess}
        />
      )}
    </div>
  )
}
