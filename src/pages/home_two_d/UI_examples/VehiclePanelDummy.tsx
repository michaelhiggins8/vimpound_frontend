import { useState, useMemo, memo } from 'react'

interface Vehicle {
  id: number
  created_at: string
  status: string
  make: string
  model: string
  year: number
  color: string
  vin_number: string
  plate_number: string
  owner_first_name: string
  owner_last_name: string
  location: string
}

interface VehiclePanelDummyProps {
  title?: string
  description?: string
  children?: React.ReactNode
  headerAction?: React.ReactNode
  compact?: boolean
}

// Generate fake vehicles data
const generateFakeVehicles = (count: number): Vehicle[] => {
  const makes = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'BMW', 'Tesla', 'Nissan', 'Jeep', 'Subaru', 'Dodge']
  const models = ['Civic', 'Camry', 'F-150', 'Silverado', '3 Series', 'Model 3', 'Altima', 'Wrangler', 'Outback', 'Ram 1500']
  const colors = ['Black', 'White', 'Silver', 'Red', 'Blue', 'Gray', 'Green', 'Brown', 'Gold', 'Orange']
  const statuses = ['Impounded', 'Released', 'Pending', 'In Transit']
  const locations = ['Lot A', 'Lot B', 'Lot C', 'Main Lot', 'Secondary Lot', 'Storage Area']
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica', 'William', 'Ashley']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']

  const vehicles: Vehicle[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(i / 2)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(10 + (i % 12), 30 + (i % 30), 0, 0)

    const make = makes[i % makes.length]
    const model = models[i % models.length]
    const year = 2015 + (i % 10)
    const color = colors[i % colors.length]

    // Generate VIN (17 characters)
    const vin = `1HGBH41JXMN${String(i).padStart(6, '0')}`
    
    // Generate plate number
    const plate = `${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 1) % 26))}${String(i % 10000).padStart(4, '0')}`

    vehicles.push({
      id: i + 1,
      created_at: date.toISOString(),
      status: statuses[i % statuses.length],
      make,
      model,
      year,
      color,
      vin_number: vin,
      plate_number: plate,
      owner_first_name: firstNames[i % firstNames.length],
      owner_last_name: lastNames[i % lastNames.length],
      location: locations[i % locations.length],
    })
  }

  return vehicles
}

function VehiclePanelDummy({ title, description, children, headerAction, compact = false }: VehiclePanelDummyProps) {
  // Memoize fake data generation to prevent regeneration on every render
  const initialData = useMemo(() => generateFakeVehicles(compact ? 3 : 10), [compact])
  const additionalData = useMemo(() => generateFakeVehicles(compact ? 3 : 10).map((vehicle, idx) => ({
    ...vehicle,
    id: 11 + idx,
  })), [compact])

  const [allVehicles, setAllVehicles] = useState<Vehicle[]>(initialData)
  const [hasMore, setHasMore] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isShowModalOpen, setIsShowModalOpen] = useState(false)
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null)
  const [sortColumn, setSortColumn] = useState<'vehicle' | 'identifier' | 'date' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showIdentifier, setShowIdentifier] = useState<'vin' | 'plate'>('plate')

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
  const handleSort = (column: 'vehicle' | 'identifier' | 'date') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Memoize sorted vehicles to prevent unnecessary re-sorting
  const sortedVehicles = useMemo(() => {
    if (!sortColumn) return allVehicles
    
    return [...allVehicles].sort((a, b) => {
      let comparison = 0
      switch (sortColumn) {
        case 'vehicle':
          const vehicleA = `${a.year} ${a.make} ${a.model} - ${a.color}`
          const vehicleB = `${b.year} ${b.make} ${b.model} - ${b.color}`
          comparison = vehicleA.localeCompare(vehicleB)
          break
        case 'identifier':
          const identifierA = showIdentifier === 'vin' ? a.vin_number : a.plate_number
          const identifierB = showIdentifier === 'vin' ? b.vin_number : b.plate_number
          comparison = identifierA.localeCompare(identifierB)
          break
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [allVehicles, sortColumn, sortDirection, showIdentifier])

  const handleLoadMore = () => {
    // Simulate loading more data
    setAllVehicles([...allVehicles, ...additionalData])
    setHasMore(false) // After loading once, hide the button
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
                Vehicles
              </div>
            )}
          </div>
          {headerAction && (
            <div className="ml-4 flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>

        {/* Toggle for VIN/Plate Number */}
        <div className={`${compact ? 'mb-3' : 'mb-4'} flex items-center gap-3`}>
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-[#6b7280]`}>Show:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowIdentifier('plate')}
              className={`${compact ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'} font-medium rounded-md transition-colors ${
                showIdentifier === 'plate'
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Plate Number
            </button>
            <button
              onClick={() => setShowIdentifier('vin')}
              className={`${compact ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'} font-medium rounded-md transition-colors ${
                showIdentifier === 'vin'
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              VIN
            </button>
          </div>
        </div>
        
        {sortedVehicles.length > 0 && (
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
                    onClick={() => handleSort('identifier')}
                  >
                    <div className="flex items-center gap-2">
                      <span>{showIdentifier === 'vin' ? 'VIN Number' : 'Plate Number'}</span>
                      {sortColumn === 'identifier' && (
                        <svg className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                      )}
                      {sortColumn !== 'identifier' && (
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
                {sortedVehicles.map((vehicle: Vehicle) => (
                  <tr
                    key={vehicle.id}
                    onClick={() => {
                      setSelectedVehicle(vehicle)
                      setIsShowModalOpen(true)
                    }}
                    onMouseEnter={() => setHoveredRowId(vehicle.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    className={`border-b border-[#e5e7eb] cursor-pointer transition-colors ${
                      hoveredRowId === vehicle.id ? 'bg-[#e0f2fe]' : 'bg-white hover:bg-[#f9fafb]'
                    }`}
                  >
                    <td className={compact ? 'py-2 px-2' : 'py-4 px-4'}>
                      <div className="flex items-center gap-2">
                        <svg className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-[#3b82f6] flex-shrink-0`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                        </svg>
                        <span className={`${compact ? 'text-xs' : 'text-sm'} text-[#111827] font-medium`}>
                          {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.color}
                        </span>
                      </div>
                    </td>
                    <td className={compact ? 'py-2 px-2' : 'py-4 px-4'}>
                      <span className={`${compact ? 'text-xs' : 'text-sm'} text-[#111827]`}>
                        {showIdentifier === 'vin' ? vehicle.vin_number : vehicle.plate_number}
                      </span>
                    </td>
                    <td className={compact ? 'py-2 px-2' : 'py-4 px-4'}>
                      <span className={`${compact ? 'text-xs' : 'text-sm'} text-[#111827]`}>
                        {formatDate(vehicle.created_at)}
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

        {hasMore && (
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
      {isShowModalOpen && selectedVehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              setIsShowModalOpen(false)
              setSelectedVehicle(null)
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
                    Vehicle Details
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsShowModalOpen(false)
                    setSelectedVehicle(null)
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
                {/* Owner */}
                <div>
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">Owner</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedVehicle.owner_first_name} {selectedVehicle.owner_last_name}
                  </p>
                </div>

                {/* Vehicle */}
                <div>
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">Vehicle</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} - {selectedVehicle.color}
                  </p>
                </div>

                {/* Plate Number */}
                <div>
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">Plate Number</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedVehicle.plate_number}
                  </p>
                </div>

                {/* VIN */}
                <div>
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">VIN</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedVehicle.vin_number}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">Status</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedVehicle.status}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">Location</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {selectedVehicle.location}
                  </p>
                </div>

                {/* Created At */}
                <div className="md:col-span-2">
                  <p className="text-xs text-[#6b7280] mb-1 font-semibold">Created At</p>
                  <p className="text-sm font-medium text-[#111827]">
                    {new Date(selectedVehicle.created_at).toLocaleDateString()}
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
                  setSelectedVehicle(null)
                }}
                className="px-5 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete Vehicle
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsShowModalOpen(false)
                  setSelectedVehicle(null)
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

export default memo(VehiclePanelDummy)
