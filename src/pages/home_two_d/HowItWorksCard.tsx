import type { ReactNode } from 'react'

interface Step {
  number: number
  title: string
  description: string
  icon: ReactNode
}

function HowItWorksCard() {
  const steps: Step[] = [
    {
      number: 1,
      title: 'Make phone number',
      description: 'Create a phone number by giving us an area code that works best for you',
      icon: (
        <svg className="w-16 h-16 text-[#12A594]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    },
    {
      number: 2,
      title: 'Set Identity',
      description: 'Set the identity of your agent and company. Your agent will use these key attributes such as its name (e.g., John), your company hours and more',
      icon: (
        <svg className="w-16 h-16 text-[#12A594]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      number: 3,
      title: 'Set retrieval process',
      description: 'Teach your agent the process of retrieval',
      icon: (
        <svg className="w-16 h-16 text-[#12A594]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      number: 4,
      title: 'Add Vehicle',
      description: 'Add any vehicles that your agent will use to inform your customers if it is your lot',
      icon: (
        <svg className="w-16 h-16 text-[#12A594]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    }
  ]

  return (
    <div className="w-full py-20 px-5 bg-white">
      <div className="max-w-[1200px] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            How it Works
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Learn the quick process
          </p>
        </div>

        {/* Steps Section */}
        <div className="space-y-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Content Section - Left Side */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#12A594] text-white font-bold text-lg shadow-md">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Icon Section - Right Side */}
              <div className="flex-shrink-0 flex items-center justify-center w-32 h-32 rounded-2xl bg-gray-50 border-2 border-gray-100 shadow-inner">
                {step.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HowItWorksCard
