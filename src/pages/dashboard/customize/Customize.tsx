import { useQuery, useQueryClient } from '@tanstack/react-query'
import SideBar from '../SideBar.js'
import SimpleControlsCard from './simple/SimpleControls.tsx'
import TimesOpenCard from './times_open/TimesOpen.tsx'
import { supabase } from '../../../lib/supabase'

interface OrgContent {
  default_hours_of_operation: string | null
  agent_name: string | null
  company_name: string | null
  default_address: string | null
  time_zone: string | null
}

export default function Customize() {
  const queryClient = useQueryClient()
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  const { data: orgContent, error } = useQuery<OrgContent>({
    queryKey: ['orgContent'],
    refetchOnMount: 'always',
    queryFn: async () => {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error(`Failed to get session: ${sessionError.message}`)
      }

      if (!session) {
        throw new Error('You must be signed in to view organization content')
      }

      const accessToken = session.access_token

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/orgs/content`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch organization content')
      }

      return data
    },
  })

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <SideBar />
      
      <div className="ml-[260px] flex-1 p-10 min-w-0 overflow-x-hidden">
        <h1 className="text-[32px] font-semibold text-[#111827] mb-5">
          Customize
        </h1>
        <p className="text-base text-[#6b7280] leading-relaxed mb-8">
          Configure your settings and preferences below.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-[#fef2f2] border border-[#fecaca] rounded-md text-[#991b1b] text-sm">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </div>
        )}
        
        <SimpleControlsCard 
          title="Basic Identity"
          description="Edit core facts about you agent and business"
          agentName={orgContent?.agent_name || ''}
          companyName={orgContent?.company_name || ''}
          defaultAddress={orgContent?.default_address || ''}
          timeZone={orgContent?.time_zone || ''}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['orgContent'] })
          }}
        />

        <TimesOpenCard 
          title="Times Open"
          description="Configure your business hours and availability"
          defaultHoursOfOperation={orgContent?.default_hours_of_operation || ''}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['orgContent'] })
          }}
        />
      </div>
    </div>
  )
}
