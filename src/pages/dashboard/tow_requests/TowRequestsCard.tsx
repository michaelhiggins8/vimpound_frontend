import { type ReactNode, useEffect, useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import ShowTowRequestsModal from './ShowTowRequestsModal'

interface TowRequestsCardProps {
  title?: string
  description?: string
  children?: ReactNode
  headerAction?: ReactNode
}

interface TowRequest {
  id: string
  created_at: string
  location: string | null
  vehicle_description: string | null
  tow_reason: string | null
  caller_phone: string | null
  fuel_type: string | null
}

interface TowRequestsResponse {
  tow_requests: TowRequest[]
  next_cursor: string | null
  has_next_page: boolean
}

interface TowRequestsData {
  tow_requests: TowRequest[]
  next_cursor: string | null
  has_next_page: boolean
}

export default function TowRequestsCard({ title, description, children, headerAction }: TowRequestsCardProps) {
  const queryClient = useQueryClient()
  const [selectedTowRequest, setSelectedTowRequest] = useState<TowRequest | null>(null)
  const [isShowModalOpen, setIsShowModalOpen] = useState(false)
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<'vehicle' | 'location' | 'date' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  // Main query for initial fetch - uses cache, shows cached data first
  const { data: towRequestsData, isLoading: loading, error } = useQuery<TowRequestsData>({
    queryKey: ['towRequests', 'initial'],
    queryFn: async () => {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error(`Failed to get session: ${sessionError.message}`)
      }

      if (!session) {
        throw new Error('You must be signed in to view tow requests')
      }

      const accessToken = session.access_token

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/tow-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch tow requests')
      }

      return {
        tow_requests: data.tow_requests,
        next_cursor: data.next_cursor,
        has_next_page: data.has_next_page,
      }
    },
    staleTime: 0, // Always refetch on mount to get latest data
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  const towRequests = towRequestsData?.tow_requests ?? []
  const nextCursor = towRequestsData?.next_cursor ?? null
  const hasNextPage = towRequestsData?.has_next_page ?? false

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    
    // Reset time to midnight for accurate day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    const diffTime = today.getTime() - dateOnly.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
    }
    
    // Format as "Mon DD, YYYY" for older dates (e.g., "Apr 10, 2022")
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Handle column sorting
  const handleSort = (column: 'vehicle' | 'location' | 'date') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Sort tow requests
  const sortedTowRequests = [...towRequests].sort((a, b) => {
    if (!sortColumn) return 0
    
    let comparison = 0
    switch (sortColumn) {
      case 'vehicle':
        comparison = (a.vehicle_description || '').localeCompare(b.vehicle_description || '')
        break
      case 'location':
        comparison = (a.location || '').localeCompare(b.location || '')
        break
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  // Mutation for loading more entries (cursor-based pagination)
  const loadMoreMutation = useMutation({
    mutationFn: async (cursor: string) => {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error(`Failed to get session: ${sessionError.message}`)
      }

      if (!session) {
        throw new Error('You must be signed in to view tow requests')
      }

      const accessToken = session.access_token

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/tow-requests?cursor=${encodeURIComponent(cursor)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch tow requests')
      }

      return data as TowRequestsResponse
    },
    onSuccess: (data) => {
      // Append new results to the cached data
      queryClient.setQueryData<TowRequestsData>(['towRequests', 'initial'], (oldData) => {
        if (!oldData) {
          return {
            tow_requests: data.tow_requests,
            next_cursor: data.next_cursor,
            has_next_page: data.has_next_page,
          }
        }
        return {
          tow_requests: [...oldData.tow_requests, ...data.tow_requests],
          next_cursor: data.next_cursor,
          has_next_page: data.has_next_page,
        }
      })
    },
  })

  const handleLoadMore = () => {
    if (nextCursor && !loadMoreMutation.isPending) {
      loadMoreMutation.mutate(nextCursor)
    }
  }

  // Function to fetch a single tow request by ID
  const fetchSingleTowRequest = async (id: string) => {
    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('Failed to get session for fetching single tow request:', sessionError?.message)
        return
      }

      const accessToken = session.access_token

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/tow-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Failed to fetch single tow request:', data.detail || 'Unknown error')
        return
      }

      // Prepend the new/updated entry to the cached list (since it's a newly updated/added record)
      queryClient.setQueryData<TowRequestsData>(['towRequests', 'initial'], (oldData) => {
        if (!oldData) {
          // If no cached data exists, create new cache entry with just this item
          return {
            tow_requests: [data],
            next_cursor: null,
            has_next_page: false,
          }
        }
        
        // Check if the entry already exists to avoid duplicates
        const exists = oldData.tow_requests.some(req => req.id === data.id)
        if (exists) {
          // If it exists, remove it and prepend the updated version to the top
          return {
            ...oldData,
            tow_requests: [data, ...oldData.tow_requests.filter(req => req.id !== data.id)],
          }
        }
        // Otherwise, prepend the new entry
        return {
          ...oldData,
          tow_requests: [data, ...oldData.tow_requests],
        }
      })
    } catch (err) {
      console.error('Error fetching single tow request:', err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  // Persistent connection logic - DO NOT MODIFY
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
  
    // 1) Keep Realtime auth in sync with the current token
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const token = session?.access_token
      if (token) supabase.realtime.setAuth(token)
    })
  
    // 2) Set initial token + subscribe once
    const start = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (token) supabase.realtime.setAuth(token)
  
      channel = supabase
        .channel('debug-tow-requests')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'tow_requests' },
          (payload) => {
            //console.log('REALTIME EVENT:', payload)
            const { new: newRecord } = payload
            if (newRecord) {
              const { id } = newRecord
              console.log('ID:', id)
              // Fetch the updated/added record and prepend it to the list
              fetchSingleTowRequest(id)
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'tow_requests' },
          (payload) => {
            //console.log('REALTIME UPDATE EVENT:', payload)
            const { new: updatedRecord } = payload
            if (updatedRecord) {
              const { id } = updatedRecord
              console.log('UPDATED ID:', id)
              // Fetch the updated record and update it in the list
              fetchSingleTowRequest(id)
            }
          }
        )
        .subscribe((status) => {
          console.log('REALTIME STATUS:', status)
        })
    }
  
    start()
  
    return () => {
      // cleanup
      authListener?.subscription?.unsubscribe()
      if (channel) supabase.removeChannel(channel)
    }
  }, [])
  
  

  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-8 shadow-lg mb-6 transition-shadow hover:shadow-xl">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1 pr-4">
          {title ? (
            <>
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
            </>
          ) : (
            <div className="text-base text-[#6b7280] font-medium">
              Tow Requests
            </div>
          )}
        </div>
        {headerAction && (
          <div className="ml-4 flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>
      
      {loading && (
        <div className="mb-6 p-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-md">
          <p className="text-sm text-[#6b7280]">Loading tow requests...</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-[#fef2f2] border border-[#fecaca] rounded-md text-[#991b1b] text-sm">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </div>
      )}

      {!loading && towRequests.length > 0 && (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-[#e5e7eb]">
                <th 
                  className="text-left py-3 px-4 text-sm font-semibold text-[#6b7280] cursor-pointer hover:text-[#111827] transition-colors"
                  onClick={() => handleSort('vehicle')}
                >
                  <div className="flex items-center gap-2">
                    <span>Vehicle</span>
                    {sortColumn === 'vehicle' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                    {sortColumn !== 'vehicle' && (
                      <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-sm font-semibold text-[#6b7280] cursor-pointer hover:text-[#111827] transition-colors"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center gap-2">
                    <span>Location</span>
                    {sortColumn === 'location' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                    {sortColumn !== 'location' && (
                      <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-sm font-semibold text-[#6b7280] cursor-pointer hover:text-[#111827] transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    <span>Date</span>
                    {sortColumn === 'date' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                    {sortColumn !== 'date' && (
                      <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="w-12 py-3 px-4"></th>
              </tr>
            </thead>
            {/* Table Body */}
            <tbody>
              {sortedTowRequests.map((request: TowRequest) => (
                <tr
                  key={request.id}
                  onClick={() => {
                    setSelectedTowRequest(request)
                    setIsShowModalOpen(true)
                  }}
                  onMouseEnter={() => setHoveredRowId(request.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                  className={`border-b border-[#e5e7eb] cursor-pointer transition-colors ${
                    hoveredRowId === request.id ? 'bg-[#e0f2fe]' : 'bg-white hover:bg-[#f9fafb]'
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#3b82f6] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                      </svg>
                      <span className="text-sm text-[#111827] font-medium">
                        {request.vehicle_description || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-[#111827]">
                      {request.location || 'No location'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-[#111827]">
                      {formatDate(request.created_at)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Future: Add dropdown menu here
                      }}
                      className="p-1 rounded hover:bg-[#e5e7eb] transition-colors"
                      aria-label="More options"
                    >
                      <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && towRequests.length === 0 && !error && (
        <div className="mb-6 p-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-md">
          <p className="text-sm text-[#6b7280]">No tow requests found.</p>
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadMoreMutation.isPending}
            className="px-6 py-2 bg-[#10b981] text-white font-medium rounded-lg hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadMoreMutation.isPending ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {children && (
        <div className="flex flex-col gap-4">
          {children}
        </div>
      )}

      <ShowTowRequestsModal
        isOpen={isShowModalOpen}
        onClose={() => {
          setIsShowModalOpen(false)
          setSelectedTowRequest(null)
        }}
        towRequest={selectedTowRequest}
        onDelete={async (towRequestId: string) => {
          // Remove the tow request from the cached list
          queryClient.setQueryData<TowRequestsData>(['towRequests', 'initial'], (oldData) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              tow_requests: oldData.tow_requests.filter(tr => tr.id !== towRequestId),
            }
          })
        }}
      />
    </div>
  )
}

