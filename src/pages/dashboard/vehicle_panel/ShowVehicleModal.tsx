import { useState } from 'react'

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

interface ShowVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: Vehicle | null
  onDelete?: (vehicleId: number) => void
}

export default function ShowVehicleModal({ isOpen, onClose, vehicle, onDelete }: ShowVehicleModalProps) {
  const [deleting, setDeleting] = useState(false)

  if (!isOpen || !vehicle) return null
 
  const handleDelete = async () => {
    
    /* 
    if (!confirm('Are you sure you want to delete this vehicle?2')) {
      return
    }
    */
    setDeleting(true)
    try {
      if (onDelete) {
        await onDelete(vehicle.id)
        onClose()
      }
    } catch (err) {
      console.error('Error deleting vehicle:', err)
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
                Vehicle Details
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
            {/* Owner */}
            <div>
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Owner</p>
              <p className="text-sm font-medium text-[#111827]">
                {vehicle.owner_first_name} {vehicle.owner_last_name}
              </p>
            </div>

            {/* Vehicle */}
            <div>
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Vehicle</p>
              <p className="text-sm font-medium text-[#111827]">
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.color}
              </p>
            </div>

            {/* Plate Number */}
            <div>
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Plate Number</p>
              <p className="text-sm font-medium text-[#111827]">
                {vehicle.plate_number}
              </p>
            </div>

            {/* VIN */}
            <div>
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">VIN</p>
              <p className="text-sm font-medium text-[#111827]">
                {vehicle.vin_number}
              </p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Status</p>
              <p className="text-sm font-medium text-[#111827]">
                {vehicle.status}
              </p>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Location</p>
              <p className="text-sm font-medium text-[#111827]">
                {vehicle.location}
              </p>
            </div>

            {/* Created At */}
            <div className="md:col-span-2">
              <p className="text-xs text-[#6b7280] mb-1 font-semibold">Created At</p>
              <p className="text-sm font-medium text-[#111827]">
                {new Date(vehicle.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

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
                'Delete Vehicle'
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
