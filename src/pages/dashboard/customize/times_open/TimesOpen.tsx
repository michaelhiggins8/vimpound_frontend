import { useState } from 'react'
import DefualtTimeSelector from './DefualtTimeSelector.tsx'
import ExceptionDates from './exception_dates/ExceptionDates.tsx'

interface TimesOpenCardProps {
  title: string
  description?: string
  defaultHoursOfOperation?: string
  onUpdate?: () => void
}

export default function TimesOpenCard({ title, description, defaultHoursOfOperation = '', onUpdate }: TimesOpenCardProps) {
  const [isDefaultMode, setIsDefaultMode] = useState(true)

  return (
    <div className="bg-white border-2 border-[#3b82f6] rounded-xl p-8 shadow-lg mb-6 transition-shadow hover:shadow-xl">
      <div className={description ? 'mb-6' : 'mb-7'}>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-3xl font-bold text-[#1e40af] m-0 tracking-tight">
            {title}
          </h2>
          <span className="px-3 py-1 text-xs font-semibold text-white bg-[#3b82f6] rounded-full uppercase tracking-wide">
            edit
          </span>
        </div>
        {description && (
          <p className="text-base text-gray-700 m-0 leading-relaxed max-w-2xl font-medium">
            {description}
          </p>
        )}
      </div>
      
      {/* Mode Selector */}
      <div className="mb-8 inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => setIsDefaultMode(true)}
          className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            isDefaultMode
              ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Default Hours
        </button>
        <button
          type="button"
          onClick={() => setIsDefaultMode(false)}
          className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            !isDefaultMode
              ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Exception Dates
        </button>
        
      </div>
      <div className="flex flex-col gap-6">
        {isDefaultMode ? (
          <p className="text-sm text-gray-600 m-0 leading-relaxed max-w-2xl">
            Set your normal hours of operation (Monday - Sunday).
          </p>
        ) : (
          <p className="text-sm text-gray-600 m-0 leading-relaxed max-w-2xl">
            Set dates that dont match normal hours of operation (holidays, special events, etc.).
          </p>
        )}
      </div>
      

      <div className="flex flex-col gap-6">
        
        {isDefaultMode ? <DefualtTimeSelector initialHours={defaultHoursOfOperation} onUpdate={onUpdate} /> : <ExceptionDates />}
      </div>
    </div>
  )
}
