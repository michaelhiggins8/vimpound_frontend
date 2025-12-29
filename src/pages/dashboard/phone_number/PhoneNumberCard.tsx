import { type ReactNode } from 'react'

interface PhoneNumberCardProps {
  title?: string
  description?: string
  children?: ReactNode
  headerAction?: ReactNode
}

export default function PhoneNumberCard({ title, description, children, headerAction }: PhoneNumberCardProps) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 md:p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] transition-shadow duration-300 mb-6">
      {(title || description || headerAction) && (
        <div className={`flex items-start justify-between gap-4 ${description ? 'mb-5' : 'mb-6'}`}>
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="text-xl md:text-2xl font-bold text-[#111827] m-0 mb-2 tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm md:text-base text-[#6b7280] m-0 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="ml-4 flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}
      {children && (
        <div className="flex flex-col gap-4 md:gap-5">
          {children}
        </div>
      )}
    </div>
  )
}
