import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import SideBar from '../SideBar'
import VehicleCard from './VehicleCard'
import AddVehicleModal from './AddVehicleModal'
import ShowVehicleModal from './ShowVehicleModal'

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

export default function VehiclePanel() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [showIdentifier, setShowIdentifier] = useState<'vin' | 'plate'>('plate')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isShowModalOpen, setIsShowModalOpen] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  const fetchVehicles = async (page: number) => {
    try {
      setLoading(true)
      setError(null)

      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        setLoading(false)
        return
      }

      if (!session) {
        setError('You must be signed in to view vehicles')
        setLoading(false)
        return
      }

      const accessToken = session.access_token

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/vehicles?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to fetch vehicles')
        setLoading(false)
        return
      }

      // If this is the first page, replace vehicles; otherwise append
      if (page === 0) {
        setVehicles(data.vehicles)
      } else {
        setVehicles(prev => [...prev, ...data.vehicles])
      }

      // Check if there are more pages (if count is less than page_size, we've reached the end)
      setHasMore(data.count === 10)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles(0)
  }, [])

  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchVehicles(nextPage)
  }

  const handleAddVehicleSuccess = () => {
    // Reset to first page and refresh vehicles
    setCurrentPage(0)
    fetchVehicles(0)
  }

  const handleDeleteVehicle = async (vehicleId: number) => {
    
    /* 
    if (!confirm('Are you sure you want to delete this vehicle?1')) {
      return
    }
    */
    setError(null)

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        return
      }

      if (!session) {
        setError('You must be signed in to delete a vehicle')
        return
      }

      const accessToken = session.access_token

      // Make the DELETE request to the backend
      const response = await fetch(`${backendUrl}/vehicles`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: String(vehicleId)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to delete vehicle')
        return
      }

      // Remove the vehicle from the list
      setVehicles(prev => prev.filter(v => v.id !== vehicleId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <SideBar />
      
      <div className="ml-[260px] flex-1 p-10 min-w-0 overflow-x-hidden">
        <h1 className="text-[32px] font-semibold text-[#111827] mb-5">
          Vehicle Panel
        </h1>
        <p className="text-base text-[#6b7280] leading-relaxed mb-8">
          Manage and view your vehicle information here.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <VehicleCard
          headerAction={
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] rounded-md hover:bg-[#2563eb] transition-colors flex items-center gap-2"
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
              Add Vehicle
            </button>
          }
        >
          {/* Toggle for VIN/Plate Number */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-medium text-[#6b7280]">Show:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowIdentifier('plate')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  showIdentifier === 'plate'
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Plate Number
              </button>
              <button
                onClick={() => setShowIdentifier('vin')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  showIdentifier === 'vin'
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                VIN
              </button>
            </div>
          </div>
          {vehicles.length === 0 && !loading && !error && (
            <p className="text-[#6b7280] text-center py-8">
              No vehicles found.
            </p>
          )}

          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => {
                setSelectedVehicle(vehicle)
                setIsShowModalOpen(true)
              }}
              className="border-2 border-[#3b82f6] rounded-lg p-4 hover:shadow-lg hover:shadow-[#3b82f6]/20 transition-all cursor-pointer bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#111827] mb-1">
                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.color}
                  </p>
                  <p className="text-xs text-[#6b7280]">
                    {showIdentifier === 'vin' ? 'VIN' : 'Plate Number'}: <span className="font-medium text-[#111827]">
                      {showIdentifier === 'vin' ? vehicle.vin_number : vehicle.plate_number}
                    </span>
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-[#6b7280] flex-shrink-0 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}

          {loading && vehicles.length === 0 && (
            <p className="text-[#6b7280] text-center py-8">
              Loading vehicles...
            </p>
          )}

          {hasMore && vehicles.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2 bg-[#111827] text-white rounded-lg hover:bg-[#1f2937] disabled:bg-[#9ca3af] disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}

          {!hasMore && vehicles.length > 0 && (
            <p className="text-[#6b7280] text-center py-4 mt-4">
              All vehicles loaded.
            </p>
          )}
        </VehicleCard>

        <AddVehicleModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddVehicleSuccess}
        />

        <ShowVehicleModal
          isOpen={isShowModalOpen}
          onClose={() => {
            setIsShowModalOpen(false)
            setSelectedVehicle(null)
          }}
          vehicle={selectedVehicle}
          onDelete={handleDeleteVehicle}
        />
      </div>
    </div>
  )
}