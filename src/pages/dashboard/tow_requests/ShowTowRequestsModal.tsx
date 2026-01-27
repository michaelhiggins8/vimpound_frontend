import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface TowRequest {
  id: string
  created_at: string
  location: string | null
  vehicle_description: string | null
  tow_reason: string | null
  caller_phone: string | null
  fuel_type: string | null
}

interface ShowTowRequestsModalProps {
  isOpen: boolean
  onClose: () => void
  towRequest: TowRequest | null
  onDelete?: (towRequestId: string) => void
}

export default function ShowTowRequestsModal({ isOpen, onClose, towRequest, onDelete }: ShowTowRequestsModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  if (!isOpen || !towRequest) return null
 
  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    
    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error(`Failed to get session: ${sessionError.message}`)
      }

      if (!session) {
        throw new Error('You must be signed in to delete a tow request')
      }

      const accessToken = session.access_token

      // Make the DELETE request to the backend
      const response = await fetch(`${backendUrl}/tow-request`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: towRequest.id
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete tow request')
      }

      // Call the onDelete callback if provided (for parent component updates)
      if (onDelete) {
        await onDelete(towRequest.id)
      }
      
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      console.error('Error deleting tow request:', errorMessage)
      setError(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Tow Request Details
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={deleting}
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div>
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Location</p>
              <p className="text-sm font-medium text-[#111827]">
                {towRequest.location || 'N/A'}
              </p>
            </div>

            {/* Vehicle */}
            <div>
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Vehicle</p>
              <p className="text-sm font-medium text-[#111827]">
                {towRequest.vehicle_description || 'N/A'}
              </p>
            </div>

            {/* Tow Reason */}
            <div>
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Tow Reason</p>
              <p className="text-sm font-medium text-[#111827]">
                {towRequest.tow_reason || 'N/A'}
              </p>
            </div>

            {/* Caller Phone */}
            <div>
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Caller Phone</p>
              <p className="text-sm font-medium text-[#111827]">
                {towRequest.caller_phone || 'N/A'}
              </p>
            </div>

            {/* Fuel Type */}
            <div>
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Fuel Type</p>
              <p className="text-sm font-medium text-[#111827]">
                {towRequest.fuel_type || 'N/A'}
              </p>
            </div>

            {/* Created At */}
            <div className="md:col-span-2">
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Created At</p>
              <p className="text-sm font-medium text-[#111827]">
                {towRequest.created_at ? new Date(towRequest.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 pt-4 pb-6 px-6 border-t border-gray-200">
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-5 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Delete Tow Request'
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-5 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
