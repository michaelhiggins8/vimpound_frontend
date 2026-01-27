import type { ReactNode } from 'react'
import { memo } from 'react'
import TowRequestDummy from './UI_examples/TowRequestDummy'
import VehiclePanelDummy from './UI_examples/VehiclePanelDummy'

interface Step {
  title: string
  description: string
  icon: ReactNode
}

interface Section {
  title: string
  subtitle: string
  steps: Step[]
}

function HowItWorksCard() {
  const sections: Section[] = [
    {
      title: 'Step 1: Customize Agent',
      subtitle: 'General agent settings',
      steps: [
        {
          title: 'Phone Number',
          description: 'Create and edit the phone number of your agent',
          icon: (
            <svg className="w-16 h-16 text-[#12A594]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          )
        },
        {
          title: 'Identity',
          description: 'Edit your agent and company identity, such as the name they\'ll use in calls and hours of operation',
          icon: (
            <svg className="w-16 h-16 text-[#12A594]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        },
        {
          title: 'Retrieval',
          description: 'Tell your agent the facts that callers need to know to retrieve their vehicle',
          icon: (
            <svg className="w-16 h-16 text-[#12A594]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'Step 2: Vehicle Management',
      subtitle: 'Your live dashboards to run day to day operations',
      steps: [
        {
          title: 'Tow Requests',
          description: 'Get Realtime updates for your dispatchers to send tow trucks',
          icon: (
            <svg className="w-16 h-16 text-[#12A594]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        },
        {
          title: 'Vehicle Panel',
          description: 'Update your agent on each new vehicle in your lot so it can communicate this to callers',
          icon: (
            <svg className="w-16 h-16 text-[#12A594]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )
        }
      ]
    }
  ]

  return (
    <div className="w-full py-20 px-5 bg-white relative">
      {/* Enhanced foggy green background effects around HowItWorksCard */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ willChange: 'transform' }}>
        {/* Large central foggy green blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-green-300/25 rounded-full blur-3xl" style={{ willChange: 'transform' }}></div>
        {/* Left side foggy green blur */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-200/20 rounded-full blur-3xl" style={{ willChange: 'transform' }}></div>
        {/* Right side foggy green blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-300/20 rounded-full blur-3xl" style={{ willChange: 'transform' }}></div>
        {/* Horizontal foggy green gradient band */}
        <div className="absolute top-1/2 left-0 right-0 h-[400px] bg-gradient-to-r from-transparent via-green-200/15 to-transparent blur-3xl -translate-y-1/2" style={{ willChange: 'transform' }}></div>
      </div>
      
      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            How it Works
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Run your phone AI agent in a few quick steps
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-16">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Header */}
              <div className="mb-8 text-center md:text-left">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {section.subtitle}
                </p>
              </div>

              {/* Steps in Section */}
              {section.title === 'Step 2: Vehicle Management' ? (
                // Special horizontal layout for Step 2
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex flex-col">
                      <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        {/* Header with Icon and Title */}
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-xl bg-gray-50 border-2 border-gray-100 shadow-inner">
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">
                              {step.title}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Embedded Dummy Component */}
                        <div className="mt-4">
                          {step.title === 'Tow Requests' && (
                            <TowRequestDummy compact={true} />
                          )}
                          {step.title === 'Vehicle Panel' && (
                            <VehiclePanelDummy compact={true} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Horizontal layout for Step 1 (same style as Step 2)
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {section.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex flex-col">
                      <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        {/* Header with Icon and Title */}
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-xl bg-gray-50 border-2 border-gray-100 shadow-inner">
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">
                              {step.title}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(HowItWorksCard)
