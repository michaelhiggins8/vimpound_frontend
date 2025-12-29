import { useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import AddExtraCostModal from './AddExtraCostModal'
import AddMainCostModal from './AddMainCostModal'

interface CostCardProps {
  title: string
  description?: string
  costToReleaseShort?: string
  costToReleaseLong?: string
  onUpdate?: () => void
}

export default function CostCard({ title, description, costToReleaseShort = '', costToReleaseLong = '',  onUpdate }: CostCardProps) {
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddMainCostModalOpen, setIsAddMainCostModalOpen] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  const handleDelete = async (lineIndex: number) => {
    // Handle null, undefined, or empty string cases
    const currentCostToReleaseLong = costToReleaseLong || ''
    if (!currentCostToReleaseLong.trim()) {
      setError('No extra costs to delete')
      return
    }

    setLoading(prev => ({ ...prev, [lineIndex]: true }))
    setError(null)

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        setLoading(prev => ({ ...prev, [lineIndex]: false }))
        return
      }

      if (!session) {
        setError('You must be signed in to delete extra costs')
        setLoading(prev => ({ ...prev, [lineIndex]: false }))
        return
      }

      const accessToken = session.access_token

      // Split by newlines and find the exact line to remove
      const lines = currentCostToReleaseLong.split('\n')
      
      // Find the index of the line that matches (preserving exact format)
      let targetLineIndex = -1
      let bulletPointIndex = 0
      
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim()
        if (trimmed.startsWith('*')) {
          if (bulletPointIndex === lineIndex) {
            targetLineIndex = i
            break
          }
          bulletPointIndex++
        }
      }

      if (targetLineIndex === -1) {
        setError('Could not find the item to delete')
        setLoading(prev => ({ ...prev, [lineIndex]: false }))
        return
      }

      // Remove the line at targetLineIndex
      const updatedLines = lines.filter((_, index) => index !== targetLineIndex)
      
      // Check if there are any bullet points left after deletion
      const remainingBulletPoints = updatedLines.filter(line => line.trim().startsWith('*'))
      
      // If no bullet points remain, set to empty string
      // Otherwise, rejoin with newlines - preserving exact format
      const updatedCostToReleaseLong = remainingBulletPoints.length === 0 
        ? '' 
        : updatedLines.join('\n')

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/orgs/cost-to-release-long`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ cost_to_release_long: updatedCostToReleaseLong }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ detail: 'Failed to delete extra cost' }))
        
        // Handle Pydantic validation errors - extract message from error array
        let errorMessage = 'Failed to delete extra cost'
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
        setLoading(prev => ({ ...prev, [lineIndex]: false }))
        return
      }

      // Call the update callback to refresh parent data
      if (onUpdate) {
        try {
          onUpdate()
        } catch (updateError) {
          console.error('Error in onUpdate callback:', updateError)
          setError('Failed to refresh data after deletion')
        }
      }
    } catch (err) {
      console.error('Error deleting extra cost:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      // Always clear loading state, removing the specific index
      setLoading(prev => {
        const newState = { ...prev }
        delete newState[lineIndex]
        return newState
      })
    }
  }

  return (
    <div className="bg-white border-2 border-[#3b82f6] rounded-xl p-8 shadow-lg mb-6 transition-shadow hover:shadow-xl">
      {/* Header Section */}
      <div className={`${description ? 'mb-6' : 'mb-7'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl font-bold text-[#1e40af] m-0 tracking-tight">
                {title}
              </h2>
              <span className="px-3 py-1 text-xs font-semibold text-white bg-[#3b82f6] rounded-full uppercase tracking-wide">
                edit
              </span>
            </div>
            {description && (
              <p className="text-base text-gray-700 m-0 leading-relaxed max-w-2xl font-medium">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
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
      
      <div className="flex flex-col gap-6">
        {/* costToReleaseShort section */}
        {(() => {
          const bulletLines = costToReleaseShort
            ? costToReleaseShort.split('\n').filter(line => line.trim().startsWith('*'))
            : []
          
          return (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Main Costs</h3>
                  <p className="text-sm text-gray-500">Costs every one needs to know</p>
                </div>
                <button
                  onClick={() => setIsAddMainCostModalOpen(true)}
                  className="flex-shrink-0 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  title="Edit main costs"
                >
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
              </div>
              {bulletLines.length > 0 ? (
                <div className="grid gap-3">
                  {bulletLines.map((line, index) => {
                    const itemText = line.trim().replace(/^\*\s*/, '')
                    return (
                      <div
                        key={`short-${index}`}
                        className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex items-center gap-4"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors duration-200">
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-800 flex-1 leading-relaxed">
                          {itemText}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-500">
                    No main costs specified yet.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click "Edit" to add main costs
                  </p>
                </div>
              )}
            </div>
          )
        })()}
        
        {/* costToReleaseLong section */}
        {costToReleaseLong !== undefined && (() => {
          // Safely handle null, undefined, or empty string
          const safeCostToReleaseLong = costToReleaseLong ?? ''
          const bulletLines = (typeof safeCostToReleaseLong === 'string' ? safeCostToReleaseLong : '')
            .split('\n')
            .filter(line => line && line.trim().startsWith('*'))
          
          return (
            <div className="flex flex-col gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Extra Costs</h3>
                  <p className="text-sm text-gray-500">Additional potential costs</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex-shrink-0 px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  title="Add new extra cost"
                >
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
                  Add Cost
                </button>
              </div>
              {bulletLines.length > 0 ? (
                <div className="grid gap-3">
                  {bulletLines.map((line, index) => {
                    const itemText = line.trim().replace(/^\*\s*/, '')
                    const isLoading = loading[index] || false
                    return (
                      <div
                        key={`long-${index}`}
                        className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex items-center gap-4"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors duration-200">
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-800 flex-1 leading-relaxed">
                          {itemText}
                        </span>
                        <button
                          onClick={() => handleDelete(index)}
                          disabled={isLoading}
                          className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
                            isLoading
                              ? 'bg-gray-100 cursor-not-allowed opacity-50'
                              : 'bg-red-50 hover:bg-red-100 active:bg-red-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                          }`}
                          title="Delete extra cost"
                        >
                          {isLoading ? (
                            <svg
                              className="w-5 h-5 text-gray-400 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5 text-red-600"
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
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
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
                  <p className="text-sm font-medium text-gray-500">
                    No extra costs specified yet.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click "Add Cost" to get started
                  </p>
                </div>
              )}
            </div>
          )
        })()}
      </div>
      
      <AddExtraCostModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        costToReleaseLong={costToReleaseLong || ''}
        onSuccess={onUpdate}
      />
      
      <AddMainCostModal
        isOpen={isAddMainCostModalOpen}
        onClose={() => setIsAddMainCostModalOpen(false)}
        costToReleaseShort={costToReleaseShort || ''}
        onSuccess={onUpdate}
      />
    </div>
  )
}
