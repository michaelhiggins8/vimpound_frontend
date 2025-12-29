import { type ReactNode } from 'react'

interface VehicleCardProps {
  title?: string
  description?: string
  children?: ReactNode
  headerAction?: ReactNode
}

export default function VehicleCard({ title, description, children, headerAction }: VehicleCardProps) {
  return (
    <div className="bg-white border-2 border-[#10b981] rounded-xl p-8 shadow-lg mb-6 transition-shadow hover:shadow-xl">
      {(title || description || headerAction) && (
        <div className={`flex items-start justify-between ${description ? 'mb-6' : 'mb-7'}`}>
          <div className="flex-1 pr-4">
            {title && (
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-3xl font-bold text-[#111827] m-0 tracking-tight">
                  {title}
                </h2>
                <span className="px-3 py-1 text-xs font-semibold text-white bg-[#10b981] rounded-full uppercase tracking-wide">
                  edit
                </span>
              </div>
            )}
            {description && (
              <p className="text-base text-gray-700 m-0 leading-relaxed max-w-2xl font-medium">
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
        <div className="flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  )
}

