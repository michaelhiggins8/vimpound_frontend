import SideBar from '../SideBar.tsx'
import BillingCard from './BillingCard.tsx'

export default function Billing() {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <SideBar />
      
      <div className="ml-[260px] flex-1 p-10 min-w-0 overflow-x-hidden">
        <h1 className="text-[32px] font-semibold text-[#111827] mb-5">
          Billing
        </h1>
        <p className="text-base text-[#6b7280] leading-relaxed mb-6">
          Manage your billing information and payment methods.
        </p>
        
        <BillingCard />
      </div>
    </div>
  )
}
