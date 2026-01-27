import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import SideBar from '../SideBar'
import VehicleCard from './VehicleCard'
import AddVehicleModal from './AddVehicleModal'

export default function VehiclePanel() {
  const queryClient = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleAddVehicleSuccess = () => {
    // Refresh vehicles by invalidating the query
    queryClient.invalidateQueries({ queryKey: ['vehicles', 'initial'] })
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
        />

        <AddVehicleModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddVehicleSuccess}
        />
      </div>
    </div>
  )
}