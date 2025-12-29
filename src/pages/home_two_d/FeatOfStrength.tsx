import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Vapi from '@vapi-ai/web'

interface OrgContent {
  id: string
  default_hours_of_operation: string | null
  agent_name: string | null
  company_name: string | null
  documents_needed: string | null
  cost_to_release_short: string | null
  cost_to_release_long: string | null
  default_address: string | null
  time_zone: string | null
}

export default function FeatOfStrength() {
  const navigate = useNavigate()
  const [vapi, setVapi] = useState<Vapi | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([])
  const [error, setError] = useState<string | null>(null)
  const [orgContent, setOrgContent] = useState<OrgContent | null>(null)
  const vapiRef = useRef<Vapi | null>(null)

  // Get API key and assistant ID from environment variables
  const apiKey = import.meta.env.VITE_VAPI_PUBLIC_API_KEY
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  // Get phone number from environment variable or URL params (for landing page)
  // You can also get it from URL: const urlParams = new URLSearchParams(window.location.search); const phoneNumber = urlParams.get('phone')
  const phoneNumber = import.meta.env.VITE_LANDING_PAGE_PHONE_NUMBER

  // Fetch organization content by phone number (public endpoint)
  const fetchOrgContent = async () => {
    if (!backendUrl) {
      console.warn('VITE_BACKEND_URL is not set, skipping org data fetch')
      return
    }

    if (!phoneNumber) {
      console.warn('VITE_LANDING_PAGE_PHONE_NUMBER is not set, proceeding without org data')
      return
    }

    try {
      // Make the fetch call to the public endpoint (no auth required)
      const response = await fetch(`${backendUrl}/orgs/content/by-phone?phone_number=${encodeURIComponent(phoneNumber)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.warn('Failed to fetch organization content')
        return
      }

      const data = await response.json()
      setOrgContent(data)
    } catch (err) {
      console.warn('Error fetching organization content:', err)
    }
  }

  useEffect(() => {
    if (!apiKey) {
      setError('VITE_VAPI_PUBLIC_API_KEY is not set in environment variables')
      return
    }

    if (!assistantId) {
      setError('VITE_VAPI_ASSISTANT_ID is not set in environment variables')
      return
    }

    // Fetch organization data
    fetchOrgContent()

    // Initialize Vapi instance
    const vapiInstance = new Vapi(apiKey)
    vapiRef.current = vapiInstance
    setVapi(vapiInstance)

    // Event listeners
    vapiInstance.on('call-start', () => {
      console.log('Call started')
      setIsConnected(true)
      setIsLoading(false)
      setError(null)
    })

    vapiInstance.on('call-end', () => {
      console.log('Call ended')
      setIsConnected(false)
      setIsSpeaking(false)
      setIsLoading(false)
    })

    vapiInstance.on('speech-start', () => {
      console.log('Assistant started speaking')
      setIsSpeaking(true)
    })

    vapiInstance.on('speech-end', () => {
      console.log('Assistant stopped speaking')
      setIsSpeaking(false)
    })

    vapiInstance.on('message', (message: any) => {
      if (message.type === 'transcript') {
        setTranscript(prev => [...prev, {
          role: message.role,
          text: message.transcript
        }])
      }
    })

    vapiInstance.on('error', (error: any) => {
      console.error('Vapi error:', error)
      setIsLoading(false)
      setError(error.message || 'An error occurred with the voice agent')
    })

    // Cleanup on unmount
    return () => {
      if (vapiInstance) {
        vapiInstance.stop()
      }
    }
  }, [apiKey, assistantId])

  const startCall = () => {
    if (vapi && assistantId) {
      setIsLoading(true)
      setError(null)
      try {
        // Prepare variable values from org content (same as backend webhook)
        const variableValues: Record<string, string | null> = {}
        
        if (orgContent) {
          variableValues.agent_name = orgContent.agent_name
          variableValues.company_name = orgContent.company_name
          variableValues.default_hours_of_operation = orgContent.default_hours_of_operation
          variableValues.documents_needed = orgContent.documents_needed
          variableValues.cost_to_release_short = orgContent.cost_to_release_short
          variableValues.org_id = orgContent.id
          variableValues.default_address = orgContent.default_address
          variableValues.time_zone = orgContent.time_zone
        }

        // Start call with variable values if we have org data
        if (Object.keys(variableValues).length > 0) {
          vapi.start(assistantId, {
            variableValues: variableValues
          })
        } else {
          // Start without variable values if no org data available
          vapi.start(assistantId)
        }
      } catch (err) {
        setIsLoading(false)
        setError(err instanceof Error ? err.message : 'Failed to start call')
      }
    }
  }

  const endCall = () => {
    if (vapi) {
      try {
        vapi.stop()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to end call')
      }
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden">
      {/* Subtle Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#12A594]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#12A594]/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header Section - Improved Visual Hierarchy */}
      <div className="relative w-full max-w-4xl mb-8 sm:mb-10 md:mb-12 z-10">
        <div className="flex items-center justify-center mb-4">
          <div className="h-1 w-16 bg-gradient-to-r from-transparent via-[#12A594] to-transparent rounded-full"></div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 text-center font-bold tracking-tight">
          <span className="bg-gradient-to-r from-gray-900 via-[#12A594] to-gray-900 bg-clip-text text-transparent">
            Welcome to Vimpound
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-xl leading-relaxed sm:leading-[1.75] text-center text-gray-700 max-w-3xl mx-auto px-2 relative">
          <span className="relative z-10">Vimpound is your phone AI voice agent that handles pick up calls for Impound lots. You get a real phone number your customers can call have real conversations with. No more phone trees. No more staff getting yelled at by angry customers.</span>
        </p>
      </div>

      {/* Voice Agent Section */}
      <div className="relative w-full max-w-2xl z-10">
        {/* Error Message - Dismissible with Better Styling */}
        {error && (
          <div 
            role="alert"
            aria-live="polite"
            className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-red-50 to-red-50/50 border-l-4 border-red-500 rounded-lg text-red-800 shadow-md shadow-red-500/10 animate-[fadeIn_0.3s_ease-in-out] relative overflow-hidden
              before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-red-500 before:to-red-600"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <svg 
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm sm:text-base font-medium leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                aria-label="Dismiss error message"
                className="flex-shrink-0 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded p-1 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Voice Control Buttons - Enhanced with Better States */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={isConnected ? endCall : startCall}
            disabled={!vapi || !assistantId || isLoading}
            aria-label={isConnected ? 'End voice call' : 'Start voice agent'}
            aria-busy={isLoading}
            className={`
              w-full sm:w-auto rounded-full font-semibold 
              transition-all duration-300 ease-in-out relative overflow-hidden
              ${isConnected 
                ? 'px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg shadow-red-500/30' 
                : 'px-7 sm:px-10 py-4 sm:py-5 text-base sm:text-lg bg-gradient-to-r from-[#12A594] to-[#0f8a7a] hover:from-[#0f8a7a] hover:to-[#0d7567] active:from-[#0d7567] active:to-[#0b6255] text-white focus:ring-2 focus:ring-[#12A594] focus:ring-offset-2 shadow-xl shadow-[#12A594]/40'
              }
              ${(!vapi || !assistantId || isLoading) 
                ? 'opacity-50 cursor-not-allowed transform-none shadow-md' 
                : 'cursor-pointer hover:shadow-2xl active:shadow-lg transform hover:scale-105 active:scale-100'
              }
              ${!isConnected && !isLoading && vapi && assistantId ? 'animate-[subtlePulse_3s_ease-in-out_infinite]' : ''}
              disabled:pointer-events-none
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
            `}
          >
            {isConnected ? (
              <span className="flex items-center justify-center gap-2.5">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse" aria-hidden="true"></span>
                <span>End Call</span>
              </span>
            ) : isLoading ? (
              <span className="flex items-center justify-center gap-2.5">
                <svg 
                  className="animate-spin h-5 w-5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Connecting...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2.5">
                <svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>Talk to Vimpound</span>
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/signup')}
            aria-label="Navigate to sign up page"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-semibold 
              transition-all duration-300 ease-in-out relative overflow-hidden
              bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 text-white 
              shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 active:shadow-md 
              transform hover:scale-105 active:scale-100 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              cursor-pointer
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
            "
          >
            Sign Up
          </button>
        </div>

        {/* Status Indicators - Enhanced Visual Design */}
        {isConnected && (
          <div 
            className="mb-6 sm:mb-8 flex items-center justify-center gap-3 sm:gap-4 
              bg-gradient-to-br from-white to-gray-50/50 rounded-lg px-4 sm:px-6 py-3 sm:py-4 
              shadow-md border border-gray-200/60 backdrop-blur-sm
              animate-[fadeIn_0.3s_ease-in-out] relative overflow-hidden
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-[#12A594]/5 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000
            "
            role="status"
            aria-live="polite"
            aria-label={isSpeaking ? 'Assistant is speaking' : 'Listening for user input'}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 relative z-10">
              <div className="relative">
                <div 
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-300 relative z-10 ${
                    isSpeaking 
                      ? 'bg-gradient-to-br from-green-400 to-green-600 animate-pulse shadow-lg shadow-green-500/50' 
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}
                  aria-hidden="true"
                >
                  {isSpeaking && (
                    <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>
                  )}
                </div>
              </div>
              <span className="text-sm sm:text-base text-gray-700 font-medium">
                {isSpeaking ? 'Assistant is speaking...' : 'Listening...'}
              </span>
            </div>
          </div>
        )}

        {/* Transcript Display - Enhanced Message Bubbles */}
        {transcript.length > 0 && (
          <div 
            className="mt-6 sm:mt-8 bg-gradient-to-br from-white to-gray-50/30 rounded-xl p-4 sm:p-6 
              shadow-xl border border-gray-200/60 backdrop-blur-sm
              max-h-[28rem] sm:max-h-96 overflow-y-auto
              animate-[fadeIn_0.5s_ease-in-out] relative
              [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gradient-to-b from-gray-300 to-gray-400 [&::-webkit-scrollbar-track]:bg-gray-100 
              hover:[&::-webkit-scrollbar-thumb]:bg-gradient-to-b hover:[&::-webkit-scrollbar-thumb]:from-gray-400 hover:[&::-webkit-scrollbar-thumb]:to-gray-500
              before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#12A594] before:via-blue-500 before:to-[#12A594] before:rounded-t-xl"
            style={{ scrollbarWidth: 'thin' }}
            role="log"
            aria-label="Conversation transcript"
            aria-live="polite"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-5 pb-3 border-b border-gray-200/60 relative">
              <div className="absolute bottom-0 left-0 h-0.5 w-20 bg-gradient-to-r from-[#12A594] to-transparent"></div>
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Conversation Transcript
              </h3>
              <span className="text-xs sm:text-sm text-gray-500 font-medium px-2 py-1 rounded-full bg-gray-100/50">
                {transcript.length} {transcript.length === 1 ? 'message' : 'messages'}
              </span>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {transcript.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 sm:p-4 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.01] relative overflow-hidden group ${
                    item.role === 'assistant' 
                      ? 'bg-gradient-to-br from-blue-50 via-blue-50/80 to-blue-100/50 text-blue-900 border border-blue-200/60 ml-0 sm:ml-4 shadow-sm' 
                      : 'bg-gradient-to-br from-gray-50 via-gray-50/80 to-gray-100/50 text-gray-900 border border-gray-200/60 mr-0 sm:mr-4 shadow-sm'
                  }`}
                  role="article"
                  aria-label={`${item.role} message`}
                >
                  {/* Subtle shimmer effect on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full ${
                    item.role === 'assistant' ? 'from-blue-100/0' : 'from-gray-100/0'
                  }`}></div>
                  
                  <div className="flex items-start gap-2 sm:gap-3 relative z-10">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-transform duration-200 group-hover:scale-110 ${
                      item.role === 'assistant'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
                    }`}>
                      {item.role === 'assistant' ? 'AI' : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs sm:text-sm uppercase tracking-wide mb-1.5 text-gray-600">
                        {item.role === 'assistant' ? 'Assistant' : 'User'}
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed break-words">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
