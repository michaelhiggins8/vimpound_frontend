import { useState, useMemo, memo } from 'react'

interface TowRequest {
  id: string
  created_at: string
  location: string | null
  vehicle_description: string | null
  tow_reason: string | null
  caller_phone: string | null
  fuel_type: string | null
}

interface TowRequestDummyProps {
  title?: string
  description?: string
  children?: React.ReactNode
  headerAction?: React.ReactNode
  compact?: boolean
}

// Generate fake tow requests data
const generateFakeTowRequests = (count: number): TowRequest[] => {
  const vehicles = [
    '2019 Honda Civic',
    '2020 Toyota Camry',
    '2018 Ford F-150',
    '2021 Chevrolet Silverado',
    '2017 BMW 3 Series',
    '2022 Tesla Model 3',
    '2019 Nissan Altima',
    '2020 Jeep Wrangler',
    '2018 Subaru Outback',
    '2021 Ford Mustang',
    '2019 Dodge Ram 1500',
    '2020 Hyundai Elantra',
    '2018 Mazda CX-5',
    '2021 Volkswagen Jetta',
    '2017 Audi A4',
  ]

  const locations = [
    '123 Main St, Downtown',
    '456 Oak Avenue, Midtown',
    '789 Pine Road, Uptown',
    '321 Elm Street, Central',
    '654 Maple Drive, Northside',
    '987 Cedar Lane, Southside',
    '147 Birch Boulevard, Eastside',
    '258 Spruce Court, Westside',
    '369 Willow Way, Riverside',
    '741 Ash Street, Parkview',
  ]

  const towReasons = [
    'Engine failure',
    'Flat tire',
    'Battery dead',
    'Accident',
    'Out of gas',
    'Transmission issue',
    'Overheating',
    'Locked out',
  ]

  const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid']

  const phones = [
    '(555) 123-4567',
    '(555) 234-5678',
    '(555) 345-6789',
    '(555) 456-7890',
    '(555) 567-8901',
  ]

  const requests: TowRequest[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(i / 2)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(10 + (i % 12), 30 + (i % 30), 0, 0)

    requests.push({
      id: `dummy-${i + 1}`,
      created_at: date.toISOString(),
      location: locations[i % locations.length],
      vehicle_description: vehicles[i % vehicles.length],
      tow_reason: towReasons[i % towReasons.length],
      caller_phone: phones[i % phones.length],
      fuel_type: fuelTypes[i % fuelTypes.length],
    })
  }

  return requests
}

function TowRequestDummy({ title, description, children, headerAction, compact = false }: TowRequestDummyProps) {
  // Memoize fake data generation to prevent regeneration on every render
  const initialData = useMemo(() => generateFakeTowRequests(compact ? 3 : 10), [compact])
  const additionalData = useMemo(() => generateFakeTowRequests(compact ? 3 : 10).map((req, idx) => ({
    ...req,
    id: `dummy-${11 + idx}`,
  })), [compact])

  const [allTowRequests, setAllTowRequests] = useState<TowRequest[]>(initialData)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [selectedTowRequest, setSelectedTowRequest] = useState<TowRequest | null>(null)
  const [isShowModalOpen, setIsShowModalOpen] = useState(false)
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<'vehicle' | 'location' | 'date' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

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

  // Memoize sorted tow requests to prevent unnecessary re-sorting
  const sortedTowRequests = useMemo(() => {
    if (!sortColumn) return allTowRequests
    
    return [...allTowRequests].sort((a, b) => {
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
  }, [allTowRequests, sortColumn, sortDirection])

  const handleLoadMore = () => {
    // Simulate loading more data
    setAllTowRequests([...allTowRequests, ...additionalData])
    setHasNextPage(false) // After loading once, hide the button
  }

  return (
    <>
      <div className={`bg-white border border-[#e5e7eb] rounded-xl ${compact ? 'p-4 mb-4' : 'p-8 mb-6'} shadow-lg transition-shadow hover:shadow-xl`}>
        <div className={`flex items-start justify-between ${compact ? 'mb-4' : 'mb-8'}`}>
          <div className="flex-1 pr-4">
            {title ? (
              <>
                <div className={`flex items-center gap-3 ${compact ? 'mb-2' : 'mb-3'}`}>
                  <h2 className={`${compact ? 'text-xl' : 'text-3xl'} font-bold text-[#111827] m-0 tracking-tight`}>
                    {title}
                  </h2>
                  <span className={`${compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} font-semibold text-white bg-[#10b981] rounded-full uppercase tracking-wide`}>
                    edit
                  </span>
                </div>
                {description && (
                  <p className={`${compact ? 'text-sm' : 'text-base'} text-gray-700 m-0 leading-relaxed max-w-2xl font-medium`}>
                    {description}
                  </p>
                )}
              </>
            ) : (
              <div className={`${compact ? 'text-sm' : 'text-base'} text-[#6b7280] font-medium`}>
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
        
        {sortedTowRequests.length > 0 && (
          <div className={`${compact ? 'mb-4' : 'mb-6'} overflow-x-auto`}>
            <table className="w-full border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th 
                    className={`text-left ${compact ? 'py-2 px-2 text-xs' : 'py-3 px-4 text-sm'} font-semibold text-[#6b7280] cursor-pointer hover:text-[#111827] transition-colors`}
                    onClick={() => handleSort('vehicle')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Vehicle</span>
                      {sortColumn === 'vehicle' && (
                        <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                      )}
                      {sortColumn !== 'vehicle' && (
                        <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} opacity-50`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className={`text-left ${compact ? 'py-2 px-2 text-xs' : 'py-3 px-4 text-sm'} font-semibold text-[#6b7280] cursor-pointer hover:text-[#111827] transition-colors`}
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Location</span>
                      {sortColumn === 'location' && (
                        <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                      )}
                      {sortColumn !== 'location' && (
                        <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} opacity-50`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className={`text-left ${compact ? 'py-2 px-2 text-xs' : 'py-3 px-4 text-sm'} font-semibold text-[#6b7280] cursor-pointer hover:text-[#111827] transition-colors`}
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      <span>Date</span>
                      {sortColumn === 'date' && (
                        <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                      )}
                      {sortColumn !== 'date' && (
                        <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} opacity-50`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className={`${compact ? 'w-8 py-2 px-2' : 'w-12 py-3 px-4'}`}></th>
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
                    <td className={compact ? 'py-2 px-2' : 'py-4 px-4'}>
                      <div className="flex items-center gap-2">
                        <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-[#3b82f6] flex-shrink-0`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                        <span className={`${compact ? 'text-xs' : 'text-sm'} text-[#111827] font-medium`}>
                          {request.vehicle_description || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className={compact ? 'py-2 px-2' : 'py-4 px-4'}>
                      <span className={`${compact ? 'text-xs' : 'text-sm'} text-[#111827]`}>
                        {request.location || 'No location'}
                      </span>
                    </td>
                    <td className={compact ? 'py-2 px-2' : 'py-4 px-4'}>
                      <span className={`${compact ? 'text-xs' : 'text-sm'} text-[#111827]`}>
                        {formatDate(request.created_at)}
                      </span>
                    </td>
                    <td className={compact ? 'py-2 px-2' : 'py-4 px-4'}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Future: Add dropdown menu here
                        }}
                        className="p-1 rounded hover:bg-[#e5e7eb] transition-colors"
                        aria-label="More options"
                      >
                        <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-[#6b7280]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {hasNextPage && (
          <div className="flex justify-center">
            <button
              onClick={handleLoadMore}
              className={`${compact ? 'px-4 py-1.5 text-xs' : 'px-6 py-2 text-sm'} bg-[#10b981] text-white font-medium rounded-lg hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              Load more
            </button>
          </div>
        )}

        {children && (
          <div className="flex flex-col gap-4">
            {children}
          </div>
        )}
      </div>

      {/* Modal - Display Only */}
      {isShowModalOpen && selectedTowRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              setIsShowModalOpen(false)
              setSelectedTowRequest(null)
            }}
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
                  onClick={() => {
                    setIsShowModalOpen(false)
                    setSelectedTowRequest(null)
                  }}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
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
                    {selectedTowRequest.location || 'N/A'}
                  </p>
                </div>

                {/* Vehicle */}
                <div>
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">Vehicle</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedTowRequest.vehicle_description || 'N/A'}
                  </p>
                </div>

                {/* Tow Reason */}
                <div>
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">Tow Reason</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedTowRequest.tow_reason || 'N/A'}
                  </p>
                </div>

                {/* Caller Phone */}
                <div>
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">Caller Phone</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedTowRequest.caller_phone || 'N/A'}
                  </p>
                </div>

                {/* Fuel Type */}
                <div>
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">Fuel Type</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedTowRequest.fuel_type || 'N/A'}
                  </p>
                </div>

                {/* Created At */}
                <div className="md:col-span-2">
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">Created At</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedTowRequest.created_at ? new Date(selectedTowRequest.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 pb-6 px-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsShowModalOpen(false)
                  setSelectedTowRequest(null)
                }}
                className="px-5 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete Tow Request
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsShowModalOpen(false)
                  setSelectedTowRequest(null)
                }}
                className="flex-1 px-5 py-3 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default memo(TowRequestDummy)
