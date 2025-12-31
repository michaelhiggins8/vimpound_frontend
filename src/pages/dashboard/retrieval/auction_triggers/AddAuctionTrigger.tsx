import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

interface AddAuctionTriggerProps {
  isOpen: boolean
  onClose: () => void
  auctionTriggers: string
  onSuccess?: () => void
}

export default function AddAuctionTrigger({ isOpen, onClose, auctionTriggers, onSuccess }: AddAuctionTriggerProps) {
  const [triggerText, setTriggerText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTriggerText('')
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!triggerText.trim()) {
      setError('Trigger text cannot be empty')
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
        setError('You must be signed in to add auction triggers')
        setLoading(false)
        return
      }

      const accessToken = session.access_token

      // Prepare the new bullet point line
      const newBulletPoint = `* ${triggerText.trim()}`
      
      // Build the updated auctionTriggers string, preserving exact format
      let updatedAuctionTriggers: string
      
      if (!auctionTriggers || auctionTriggers.trim() === '') {
        // If empty, just add the new bullet point
        updatedAuctionTriggers = newBulletPoint
      } else {
        // Split by newlines to preserve exact format
        const lines = auctionTriggers.split('\n')
        
        // Find the last non-empty line to determine where to add
        let lastNonEmptyIndex = -1
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].trim() !== '') {
            lastNonEmptyIndex = i
            break
          }
        }
        
        if (lastNonEmptyIndex === -1) {
          // All lines are empty, just use the new bullet point
          updatedAuctionTriggers = newBulletPoint
        } else {
          // Add the new bullet point after the last non-empty line
          // Preserve all existing lines exactly as they are, including any trailing empty lines
          const updatedLines = [...lines]
          
          // Insert the new bullet point right after the last non-empty line
          // This preserves any trailing newlines that exist after the last non-empty line
          updatedLines.splice(lastNonEmptyIndex + 1, 0, newBulletPoint)
          updatedAuctionTriggers = updatedLines.join('\n')
        }
      }

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/orgs/auction-triggers`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ auction_triggers: updatedAuctionTriggers }),
      })

      const data = await response.json().catch(() => ({ detail: 'Failed to add auction trigger' }))

      if (!response.ok) {
        // Handle Pydantic validation errors - extract message from error array
        let errorMessage = 'Failed to add auction trigger'
        if (data.detail) {
          if (Array.isArray(data.detail) && data.detail.length > 0) {
            // Pydantic validation error format
            errorMessage = data.detail[0].msg || data.detail[0].message || errorMessage
          } else if (typeof data.detail === 'string') {
            // Simple string error
            errorMessage = data.detail
          } else if (data.detail.message) {
            // Error object with message property
            errorMessage = data.detail.message
          }
        }
        
        setError(errorMessage)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 z-10 border-b border-blue-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Add New Auction Trigger
                </h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Add an auction trigger to your list
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label htmlFor="trigger-text" className="block text-sm font-semibold text-gray-900 mb-2">
              Trigger Text
            </label>
            <input
              id="trigger-text"
              type="text"
              value={triggerText}
              onChange={(e) => setTriggerText(e.target.value)}
              placeholder="e.g., Vehicle impounded for 30+ days, Unpaid storage fees"
              disabled={loading}
              className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                loading 
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                  : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              } text-gray-900 placeholder:text-gray-400`}
              autoFocus
              aria-describedby="trigger-text-help"
            />
            <p id="trigger-text-help" className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              The trigger will be added as a bullet point to your auction triggers list.
            </p>
          </div>

          {/* Preview */}
          {triggerText.trim() && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h4 className="text-sm font-semibold text-blue-900">Preview</h4>
              </div>
              <div className="text-sm text-gray-800 font-medium bg-white/60 rounded px-3 py-2 border border-blue-200">
                * {triggerText.trim()}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
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
              disabled={loading || !triggerText.trim()}
              className={`flex-1 px-5 py-3 text-sm font-semibold text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading || !triggerText.trim()
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
                  Adding...
                </span>
              ) : (
                'Add Trigger'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

