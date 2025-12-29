import { useState, useEffect } from 'react'
import SideBar from '../SideBar'
import PhoneNumberCard from './PhoneNumberCard'
import PhoneNumberDisplay from './PhoneNumberDisplay'
import NoPhoneNumberDisplay from './NoPhoneNumberDisplay'
import NotSubedPhoneCard from './NotSubedPhoneCard'
import PhoneNumberModal from './PhoneNumberModal'
import NoPhoneNumberModal from './NoPhoneNumberModal'
import { supabase } from '../../../lib/supabase'

export default function PhoneNumber() {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  const checkSubscription = async () => {
    setSubscriptionLoading(true)
    setError(null)

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        setSubscriptionLoading(false)
        return
      }

      if (!session) {
        setError('You must be signed in to check subscription')
        setSubscriptionLoading(false)
        return
      }

      const accessToken = session.access_token

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/check-subscription`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to check subscription')
        setSubscriptionLoading(false)
        return
      }

      // Set subscription status based on the 'allowed' field
      setIsSubscribed(data.allowed || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setSubscriptionLoading(false)
    }
  }

  const fetchPhoneNumber = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get the access token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(`Failed to get session: ${sessionError.message}`)
        setLoading(false)
        return
      }

      if (!session) {
        setError('You must be signed in to view phone number')
        setLoading(false)
        return
      }

      const accessToken = session.access_token

      // Make the fetch call to the backend
      const response = await fetch(`${backendUrl}/phone-number`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to fetch phone number')
        setLoading(false)
        return
      }

      // Set phone number (can be null)
      setPhoneNumber(data.phone_number || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initialize = async () => {
      // First check subscription status
      await checkSubscription()
    }
    initialize()
  }, [backendUrl])

  useEffect(() => {
    // Only fetch phone number if user is subscribed
    if (isSubscribed === true && !subscriptionLoading) {
      fetchPhoneNumber()
    } else if (isSubscribed === false) {
      // If not subscribed, set loading to false so we can show the NotSubedPhoneCard
      setLoading(false)
    }
  }, [isSubscribed, subscriptionLoading])

  const handleModalSuccess = () => {
    // Refresh the phone number after successful create/update
    fetchPhoneNumber()
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <SideBar />
      
      <div className="ml-[260px] flex-1 p-10 min-w-0 overflow-x-hidden">
        <h1 className="text-[32px] font-semibold text-[#111827] mb-5">
          Phone Number
        </h1>
        <p className="text-base text-[#6b7280] leading-relaxed mb-6">
          Manage your phone number settings here.
        </p>
        
        {subscriptionLoading && (
          <PhoneNumberCard>
            <p className="text-base text-[#6b7280]">Loading...</p>
          </PhoneNumberCard>
        )}
        {!subscriptionLoading && error && isSubscribed === null && (
          <PhoneNumberCard>
            <p className="text-base text-red-600">Error: {error}</p>
          </PhoneNumberCard>
        )}
        {!subscriptionLoading && !error && isSubscribed === false && (
          <NotSubedPhoneCard />
        )}
        {!subscriptionLoading && !error && isSubscribed === true && (
          <PhoneNumberCard>
            {loading && (
              <p className="text-base text-[#6b7280]">Loading...</p>
            )}
            {error && (
              <p className="text-base text-red-600">Error: {error}</p>
            )}
            {!loading && !error && phoneNumber && (
              <PhoneNumberDisplay 
                phoneNumber={phoneNumber} 
                onEditClick={() => setIsChangeModalOpen(true)}
              />
            )}
            {!loading && !error && !phoneNumber && (
              <NoPhoneNumberDisplay 
                onCreateClick={() => setIsCreateModalOpen(true)}
              />
            )}
          </PhoneNumberCard>
        )}
      </div>

      {/* Modals */}
      {phoneNumber && (
        <PhoneNumberModal
          isOpen={isChangeModalOpen}
          onClose={() => setIsChangeModalOpen(false)}
          onSuccess={handleModalSuccess}
          currentPhoneNumber={phoneNumber}
        />
      )}
      
      <NoPhoneNumberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
