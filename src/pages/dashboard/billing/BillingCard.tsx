import { type ReactNode, useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Subscribed from './Subscribed'
import NotSubscribed from './NotSubscribed'

interface BillingCardProps {
  title?: string
  description?: string
  children?: ReactNode
  headerAction?: ReactNode
}

export default function BillingCard({ title, description, children, headerAction }: BillingCardProps) {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not set in .env')
  }

  useEffect(() => {
    const checkSubscription = async () => {
      //setIsSubscribed(true)
      //setLoading(false)
      //return
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
          setError('You must be signed in to check subscription status')
          setLoading(false)
          return
        }

        const accessToken = session.access_token

        // Call the backend to check subscription status
        const response = await fetch(`${backendUrl}/check-subscription`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.detail || 'Failed to check subscription status')
          setLoading(false)
          return
        }

        // Set subscription status based on the 'allowed' field
        setIsSubscribed(data.allowed === true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()
  }, [])

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
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <p className="text-sm text-gray-600">Loading subscription status...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-4">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      ) : isSubscribed === true ? (
        <Subscribed />
      ) : isSubscribed === false ? (
        <NotSubscribed />
      ) : null}
      {children && (
        <div className="flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  )
}
