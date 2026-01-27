import SideBar from '../SideBar'
import TowRequestsCard from './TowRequestsCard'

export default function TowRequests() {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <SideBar />
      
      <div className="ml-[260px] flex-1 p-10 min-w-0 overflow-x-hidden">
        <h1 className="text-[32px] font-semibold text-[#111827] mb-5">
          Tow Requests
        </h1>
        <p className="text-base text-[#6b7280] leading-relaxed mb-8">
          Manage and view your tow requests here.
        </p>

        <TowRequestsCard>
          {/* Tow requests content will be added here */}
        </TowRequestsCard>
      </div>
    </div>
  )
}

