import { useState, useEffect } from 'react'
import SideBar from '../SideBar'
import ItemsNeededCard from './items_needed/ItemsNeeded'
import CostCard from './cost/Cost'
import AuctionTriggersCard from './auction_triggers/AuctionTriggersCard'
import { supabase } from '../../../lib/supabase'

interface OrgContent {
  documents_needed: string | null
  cost_to_release_short: string | null
  cost_to_release_long: string | null
  auction_triggers?: string | null
}

export default function Retrieval() {
  const [orgContent, setOrgContent] = useState<OrgContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  const fetchOrgContent = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        setLoading(false)
        return
      }

      if (!session) {
        setError('You must be signed in to view organization content')
        setLoading(false)
        return
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
        setError(data.detail || 'Failed to fetch organization content')
        setLoading(false)
        return
      }

      setOrgContent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrgContent()
  }, [])

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <SideBar />
      
      <div className="ml-[260px] flex-1 p-10 min-w-0 overflow-x-hidden">
        <h1 className="text-[32px] font-semibold text-[#111827] mb-5">
          Retrieval
        </h1>
        <p className="text-base text-[#6b7280] leading-relaxed mb-8">
          Manage your retrieval settings and configurations here.
        </p>

        {loading && (
          <div className="mb-6 p-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-md">
            <p className="text-sm text-[#6b7280]">Loading organization content...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-[#fef2f2] border border-[#fecaca] rounded-md text-[#991b1b] text-sm">
            {error}
          </div>
        )}

        <ItemsNeededCard 
          title="Items Needed"
          description="Documents and items need to release vehicle."
          documentsNeeded={orgContent?.documents_needed || ''}
          onUpdate={fetchOrgContent}
        />

        <CostCard 
          title="Cost"
          description="Tell your agent the costs to always mention and costs that very depending on the situation."
          costToReleaseShort={orgContent?.cost_to_release_short || ''}
          costToReleaseLong={orgContent?.cost_to_release_long || ''}
          onUpdate={fetchOrgContent}
        />

        <AuctionTriggersCard 
          title="Auction Triggers"
          description="The conditions callers need to know that will cause a vehicle to go to auction (for example not picked up after 30 days)"         auctionTriggers={orgContent?.auction_triggers || ''}
          onUpdate={fetchOrgContent}
        />
      </div>
    </div>
  )
}
