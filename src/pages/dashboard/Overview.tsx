import { Link } from 'react-router-dom'
import SideBar from './SideBar.tsx'

export default function Overview() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f9fafb] via-white to-[#f3f4f6]">
      <SideBar />
      
      <div className="ml-[260px] flex-1 p-8 md:p-10 lg:p-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-3 tracking-tight">
            Overview
          </h1>
          <div className="h-1 w-16 bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full"></div>
        </div>
        
        <div className="bg-white border-2 border-[#3b82f6] rounded-xl p-8 md:p-10 shadow-lg mb-6 transition-shadow hover:shadow-xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl font-bold text-[#1e40af] m-0 tracking-tight">
                Welcome!
              </h2>
              <span className="px-3 py-1 text-xs font-semibold text-white bg-[#3b82f6] rounded-full uppercase tracking-wide">
                edit
              </span>
            </div>
            <p className="text-base text-gray-700 m-0 leading-relaxed max-w-2xl font-medium">
              Build your phone agent in a few quick steps
            </p>
          </div>
          
          <div className="space-y-4 md:space-y-5">
            {/* Step 1: Create Phone Number */}
            <Link 
              to="/dashboard/phone_number"
              className="block p-6 md:p-7 border border-[#e5e7eb] rounded-xl hover:border-[#10b981] hover:bg-gradient-to-br hover:from-[#f0fdf4] hover:to-[#ecfdf5] transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-white"
              aria-label="Navigate to Create Your Phone Number"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white flex items-center justify-center font-bold text-base md:text-lg shadow-lg shadow-[#10b981]/25 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[#10b981]/30 transition-all duration-300">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-[#111827] mb-2 group-hover:text-[#10b981] transition-colors duration-300">
                    Create Your Phone Number
                  </h3>
                  <p className="text-sm md:text-base text-[#6b7280] leading-relaxed">
                    This is the number that people will use to check on their vehicle.
                  </p>
                </div>
                <svg 
                  className="w-6 h-6 text-[#9ca3af] group-hover:text-[#10b981] transition-all duration-300 flex-shrink-0 mt-1 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Step 2: Build Agent Identity */}
            <Link 
              to="/dashboard/customize"
              className="block p-6 md:p-7 border border-[#e5e7eb] rounded-xl hover:border-[#10b981] hover:bg-gradient-to-br hover:from-[#f0fdf4] hover:to-[#ecfdf5] transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-white"
              aria-label="Navigate to Build Your Agent and Company Identity"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white flex items-center justify-center font-bold text-base md:text-lg shadow-lg shadow-[#10b981]/25 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[#10b981]/30 transition-all duration-300">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-[#111827] mb-2 group-hover:text-[#10b981] transition-colors duration-300">
                    Build Your Agent and Company Identity
                  </h3>
                  <p className="text-sm md:text-base text-[#6b7280] leading-relaxed">
                    Tell your agent some quick facts and when you are open.
                  </p>
                </div>
                <svg 
                  className="w-6 h-6 text-[#9ca3af] group-hover:text-[#10b981] transition-all duration-300 flex-shrink-0 mt-1 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Step 3: Explain Retrieval Process */}
            <Link 
              to="/dashboard/retrieval"
              className="block p-6 md:p-7 border border-[#e5e7eb] rounded-xl hover:border-[#10b981] hover:bg-gradient-to-br hover:from-[#f0fdf4] hover:to-[#ecfdf5] transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-white"
              aria-label="Navigate to Explain the Retrieval Process"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white flex items-center justify-center font-bold text-base md:text-lg shadow-lg shadow-[#10b981]/25 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[#10b981]/30 transition-all duration-300">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-[#111827] mb-2 group-hover:text-[#10b981] transition-colors duration-300">
                    Explain the Retrieval Process
                  </h3>
                  <p className="text-sm md:text-base text-[#6b7280] leading-relaxed">
                    Tell your agent what items and documents people will need and how much they will be paying to release their vehicles.
                  </p>
                </div>
                <svg 
                  className="w-6 h-6 text-[#9ca3af] group-hover:text-[#10b981] transition-all duration-300 flex-shrink-0 mt-1 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {/* Step 4: Add Vehicles */}
            <Link 
              to="/dashboard/vehicle_panel"
              className="block p-6 md:p-7 border border-[#e5e7eb] rounded-xl hover:border-[#10b981] hover:bg-gradient-to-br hover:from-[#f0fdf4] hover:to-[#ecfdf5] transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-white"
              aria-label="Navigate to Add Vehicles"
            >
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white flex items-center justify-center font-bold text-base md:text-lg shadow-lg shadow-[#10b981]/25 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[#10b981]/30 transition-all duration-300">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-[#111827] mb-2 group-hover:text-[#10b981] transition-colors duration-300">
                    Add Vehicles
                  </h3>
                  <p className="text-sm md:text-base text-[#6b7280] leading-relaxed">
                    This is the database your agent will use to see if a caller's vehicle is in your lot. Be sure to update it regularly.
                  </p>
                </div>
                <svg 
                  className="w-6 h-6 text-[#9ca3af] group-hover:text-[#10b981] transition-all duration-300 flex-shrink-0 mt-1 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
