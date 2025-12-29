import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

interface AddMainCostModalProps {
  isOpen: boolean
  onClose: () => void
  costToReleaseShort: string
  onSuccess?: () => void
}

interface CostRow {
  price: string
  reason: string
  customReason: string
}

const DEFAULT_REASONS = [
  'per day that the vehicle is in the lot',
  'towing fee',
  'custom'
]

export default function AddMainCostModal({ isOpen, onClose, costToReleaseShort, onSuccess }: AddMainCostModalProps) {
  const [rows, setRows] = useState<CostRow[]>([
    { price: '', reason: 'per day that the vehicle is in the lot', customReason: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  // Parse existing costToReleaseShort and populate form
  useEffect(() => {
    if (isOpen && costToReleaseShort) {
      const bulletLines = costToReleaseShort
        .split('\n')
        .filter(line => line.trim().startsWith('*'))
      
      const parsedRows: CostRow[] = []
      
      for (const line of bulletLines.slice(0, 3)) {
        const text = line.trim().replace(/^\*\s*/, '')
        
        // Try to parse: "100 dollars per day" or "50 dollars tow fee" etc.
        // Match pattern: number + "dollars" + reason
        const match = text.match(/^(\d+(?:\.\d+)?)\s*dollars?\s*(.+)$/i)
        
        if (match) {
          const price = match[1]
          const reasonText = match[2].trim().toLowerCase()
          
          // Check if it matches default reasons
          let reason = 'custom'
          let customReason = ''
          
          // Normalize the reason text for matching
          const normalizedReason = reasonText.toLowerCase().trim()
          
          if (normalizedReason === 'per day' || normalizedReason.includes('per day')) {
            reason = 'per day that the vehicle is in the lot'
          } else if (normalizedReason === 'tow fee' || normalizedReason === 'towing fee' || normalizedReason.includes('tow')) {
            reason = 'towing fee'
          } else {
            reason = 'custom'
            customReason = match[2].trim()
          }
          
          parsedRows.push({ price, reason, customReason })
        } else {
          // If parsing fails, treat as custom
          parsedRows.push({ price: '', reason: 'custom', customReason: text })
        }
      }
      
      // Ensure at least 1 row
      if (parsedRows.length === 0) {
        parsedRows.push({ 
          price: '', 
          reason: 'per day that the vehicle is in the lot', 
          customReason: '' 
        })
      }
      
      setRows(parsedRows)
    } else if (isOpen) {
      // Reset to defaults if no existing data
      setRows([
        { price: '', reason: 'per day that the vehicle is in the lot', customReason: '' }
      ])
    }
    setError(null)
  }, [isOpen, costToReleaseShort])

  const handleAddRow = () => {
    if (rows.length < 3) {
      setRows([...rows, { price: '', reason: 'custom', customReason: '' }])
    }
  }

  const handleRemoveRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index))
    }
  }

  const handleRowChange = (index: number, field: keyof CostRow, value: string) => {
    const updatedRows = [...rows]
    updatedRows[index] = { ...updatedRows[index], [field]: value }
    
    // If reason changes to non-custom, clear customReason
    if (field === 'reason' && value !== 'custom') {
      updatedRows[index].customReason = ''
    }
    
    setRows(updatedRows)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row.price.trim()) {
        setError(`Price is required for row ${i + 1}`)
        return
      }
      
      if (row.reason === 'custom' && !row.customReason.trim()) {
        setError(`Custom reason is required for row ${i + 1}`)
        return
      }
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
        setError('You must be signed in to update main costs')
        setLoading(false)
        return
      }

      const accessToken = session.access_token

      // Build the markdown bullet point list
      const bulletPoints = rows.map(row => {
        let reasonText = ''
        if (row.reason === 'custom') {
          reasonText = row.customReason.trim()
        } else if (row.reason === 'per day that the vehicle is in the lot') {
          reasonText = 'per day'
        } else if (row.reason === 'towing fee') {
          reasonText = 'tow fee'
        } else {
          reasonText = row.reason
        }
        return `* ${row.price.trim()} dollars ${reasonText}`
      })

      const costToReleaseShortValue = bulletPoints.join('\n')

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/orgs/cost-to-release-short`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ cost_to_release_short: costToReleaseShortValue }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to update main costs')
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
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 flex flex-col">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Edit Main Costs
              </h2>
          
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
              title="Close"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-5">
            {rows.map((row, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all duration-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Cost Item {index + 1}</h3>
                </div>
                <div className="flex gap-4 items-start">
                  {/* Price Input */}
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Price
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={row.price}
                        onChange={(e) => handleRowChange(index, 'price', e.target.value)}
                        placeholder="e.g., 100"
                        disabled={loading}
                        className={`w-full pl-7 pr-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                          loading 
                            ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        } text-gray-900 placeholder:text-gray-400`}
                      />
                    </div>
                  </div>

                  {/* Reason Dropdown */}
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Reason
                    </label>
                    <select
                      value={row.reason}
                      onChange={(e) => handleRowChange(index, 'reason', e.target.value)}
                      disabled={loading}
                      className={`w-full px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                        loading 
                          ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                          : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } text-gray-900`}
                    >
                      {DEFAULT_REASONS.map(reason => (
                        <option key={reason} value={reason}>
                          {reason === 'custom' ? 'Custom...' : reason}
                        </option>
                      ))}
                    </select>
                    
                    {/* Custom Reason Input */}
                    {row.reason === 'custom' && (
                      <input
                        type="text"
                        value={row.customReason}
                        onChange={(e) => handleRowChange(index, 'customReason', e.target.value)}
                        placeholder="Enter custom reason"
                        disabled={loading}
                        className={`w-full mt-3 px-4 py-3 text-sm border-2 rounded-lg outline-none transition-all duration-200 ${
                          loading 
                            ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        } text-gray-900 placeholder:text-gray-400`}
                      />
                    )}
                  </div>

                  {/* Remove Button (only show if more than 1 row) */}
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      disabled={loading}
                      className="mt-8 p-2.5 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Remove row"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          {rows.length < 3 && (
            <button
              type="button"
              onClick={handleAddRow}
              disabled={loading}
              className="w-full px-5 py-3 text-sm font-semibold text-blue-600 border-2 border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 active:bg-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="w-5 h-5"
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
              Add One More Cost Item
            </button>
          )}

          {/* Preview */}
          {rows.some(r => r.price.trim() && (r.reason !== 'custom' || r.customReason.trim())) && (
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <h4 className="text-sm font-semibold text-blue-900">Preview</h4>
              </div>
              <div className="text-sm text-gray-800 space-y-2">
                {rows
                  .filter(r => r.price.trim() && (r.reason !== 'custom' || r.customReason.trim()))
                  .map((row, index) => {
                    const reasonText = row.reason === 'custom' ? row.customReason.trim() : row.reason
                    return (
                      <div key={index} className="font-medium bg-white/60 rounded px-3 py-2 border border-blue-200">
                        * {row.price.trim()} dollars {reasonText}
                      </div>
                    )
                  })}
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
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 shadow-md hover:shadow-lg focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

