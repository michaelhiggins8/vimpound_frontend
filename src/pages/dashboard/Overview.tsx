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
              Run your phone AI agent in a few quick steps
            </p>
          </div>
          
          {/* Step 1: Customize Agent */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1e40af] mb-2 tracking-tight">
                Step 1: Customize Agent
              </h2>
              <p className="text-base text-gray-700 leading-relaxed font-medium">
                The General agent settings
              </p>
            </div>
            
            <div className="space-y-4 md:space-y-5">
              {/* Phone Number */}
              <Link 
                to="/dashboard/phone_number"
                className="block p-6 md:p-7 border border-[#e5e7eb] rounded-xl hover:border-[#10b981] hover:bg-gradient-to-br hover:from-[#f0fdf4] hover:to-[#ecfdf5] transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-white"
                aria-label="Navigate to Phone Number"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-[#111827] mb-2 group-hover:text-[#10b981] transition-colors duration-300">
                      Phone Number
                    </h3>
                    <p className="text-sm md:text-base text-[#6b7280] leading-relaxed">
                      Create and edit the phone number of your agent
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

              {/* Identity */}
              <Link 
                to="/dashboard/customize"
                className="block p-6 md:p-7 border border-[#e5e7eb] rounded-xl hover:border-[#10b981] hover:bg-gradient-to-br hover:from-[#f0fdf4] hover:to-[#ecfdf5] transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-white"
                aria-label="Navigate to Identity"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-[#111827] mb-2 group-hover:text-[#10b981] transition-colors duration-300">
                      Identity
                    </h3>
                    <p className="text-sm md:text-base text-[#6b7280] leading-relaxed">
                      Edit your agent and company identity, such as the name they'll use in calls and hours of operation
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

              {/* Retrieval */}
              <Link 
                to="/dashboard/retrieval"
                className="block p-6 md:p-7 border border-[#e5e7eb] rounded-xl hover:border-[#10b981] hover:bg-gradient-to-br hover:from-[#f0fdf4] hover:to-[#ecfdf5] transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-white"
                aria-label="Navigate to Retrieval"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-[#111827] mb-2 group-hover:text-[#10b981] transition-colors duration-300">
                      Retrieval
                    </h3>
                    <p className="text-sm md:text-base text-[#6b7280] leading-relaxed">
                      Tell your agent the facts that callers need to know to retrieve their vehicle
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

          {/* Step 2: Vehicle Management */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1e40af] mb-2 tracking-tight">
                Step 2: Vehicle Management
              </h2>
              <p className="text-base text-gray-700 leading-relaxed font-medium">
                Your live dashboards to run day to day operations
              </p>
            </div>
            
            <div className="space-y-4 md:space-y-5">
              {/* Tow Requests */}
              <Link 
                to="/dashboard/tow_requests"
                className="block p-6 md:p-7 border border-[#e5e7eb] rounded-xl hover:border-[#10b981] hover:bg-gradient-to-br hover:from-[#f0fdf4] hover:to-[#ecfdf5] transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-white"
                aria-label="Navigate to Tow Requests"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-[#111827] mb-2 group-hover:text-[#10b981] transition-colors duration-300">
                      Tow Requests
                    </h3>
                    <p className="text-sm md:text-base text-[#6b7280] leading-relaxed">
                      Get Realtime updates for your dispatchers to send tow trucks
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

              {/* Vehicle Panel */}
              <Link 
                to="/dashboard/vehicle_panel"
                className="block p-6 md:p-7 border border-[#e5e7eb] rounded-xl hover:border-[#10b981] hover:bg-gradient-to-br hover:from-[#f0fdf4] hover:to-[#ecfdf5] transition-all duration-300 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2 focus:ring-offset-white"
                aria-label="Navigate to Vehicle Panel"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-[#111827] mb-2 group-hover:text-[#10b981] transition-colors duration-300">
                      Vehicle Panel
                    </h3>
                    <p className="text-sm md:text-base text-[#6b7280] leading-relaxed">
                      Update your agent on each new vehicle in your lot so it can communicate this to callers
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
    </div>
  )
}
