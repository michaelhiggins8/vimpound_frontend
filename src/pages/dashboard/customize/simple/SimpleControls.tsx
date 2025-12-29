import AgentName from './AgentName.tsx'
import CompanyName from './CompanyName.tsx'
import DefaultAddress from './DefaultAddress.tsx'
import TimeZone from './TimeZone.tsx'

interface SimpleControlsCardProps {
  title: string
  description?: string
  agentName?: string
  companyName?: string
  defaultAddress?: string
  timeZone?: string
}

export default function SimpleControlsCard({ 
  title, 
  description,
  agentName = '',
  companyName = '',
  defaultAddress = '',
  timeZone = ''
}: SimpleControlsCardProps) {
  return (
    <div className="bg-white border-2 border-[#10b981] rounded-xl p-8 shadow-lg mb-6 transition-shadow hover:shadow-xl">
      <div className={description ? 'mb-6' : 'mb-7'}>
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
        <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square m-2">
          <AgentName initialValue={agentName} />
        </div>
        <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square m-2">
          <CompanyName initialValue={companyName} />
        </div>
        <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square m-2">
          <DefaultAddress initialValue={defaultAddress} />
        </div>
        <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 aspect-square m-2">
          <TimeZone initialValue={timeZone} />
        </div>
      </div>
    </div>
  )
}
