import { useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import AddItemNeeded from './AddItemNeeded'

interface ItemsNeededCardProps {
  title: string
  description?: string
  documentsNeeded?: string
  onUpdate?: () => void
}

export default function ItemsNeededCard({ title, description, documentsNeeded = '', onUpdate }: ItemsNeededCardProps) {
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  const handleDelete = async (lineIndex: number) => {
    // Handle null, undefined, or empty string cases
    const currentDocumentsNeeded = documentsNeeded || ''
    if (!currentDocumentsNeeded.trim()) {
      setError('No items to delete')
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
        setError('You must be signed in to delete items')
        setLoading(prev => ({ ...prev, [lineIndex]: false }))
        return
      }

      const accessToken = session.access_token

      // Split by newlines and find the exact line to remove
      const lines = currentDocumentsNeeded.split('\n')
      
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
      const updatedDocumentsNeeded = remainingBulletPoints.length === 0 
        ? '' 
        : updatedLines.join('\n')

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/orgs/documents-needed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ documents_needed: updatedDocumentsNeeded }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ detail: 'Failed to delete item' }))
        
        // Handle Pydantic validation errors - extract message from error array
        let errorMessage = 'Failed to delete item'
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
      console.error('Error deleting item:', err)
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

  // Get all bullet point lines with their original format
  const bulletLines = documentsNeeded
    .split('\n')
    .filter(line => line.trim().startsWith('*'))

  return (
    <div className="bg-white border-2 border-[#10b981] rounded-xl p-8 shadow-lg mb-6 transition-shadow hover:shadow-xl">
      <div className={description ? 'mb-6' : 'mb-7'}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl font-bold text-[#111827] m-0 tracking-tight">
                {title}
              </h2>
              <span className="px-3 py-1 text-xs font-semibold text-white bg-[#10b981] rounded-full uppercase tracking-wide">
                edit
              </span>
            </div>
            {description && (
              <p className="text-base text-gray-700 m-0 leading-relaxed max-w-2xl font-medium">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-shrink-0 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add new item"
            aria-label="Add new item"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add Item</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-800 text-sm flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600"
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
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}
        {bulletLines.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {bulletLines.map((line, index) => {
              const itemText = line.trim().replace(/^\*\s*/, '')
              const isLoading = loading[index] || false
              return (
                <div
                  key={index}
                  className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-base font-medium text-gray-800 flex-1 leading-relaxed">
                    {itemText}
                  </span>
                  <button
                    onClick={() => handleDelete(index)}
                    disabled={isLoading}
                    className={`flex-shrink-0 w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                      isLoading
                        ? 'bg-gray-100 cursor-not-allowed'
                        : 'bg-red-50 hover:bg-red-100 active:bg-red-200 cursor-pointer'
                    }`}
                    title={isLoading ? 'Deleting...' : 'Delete item'}
                    aria-label={isLoading ? 'Deleting item' : 'Delete item'}
                  >
                    {isLoading ? (
                      <svg
                        className="w-5 h-5 text-gray-400 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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
                        aria-hidden="true"
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
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-600 mb-1">
              No items added yet
            </p>
            <p className="text-xs text-gray-500 text-center max-w-sm">
              Click the "Add Item" button above to get started
            </p>
          </div>
        )}
      </div>
      
      <AddItemNeeded
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        documentsNeeded={documentsNeeded || ''}
        onSuccess={onUpdate}
      />
    </div>
  )
}
