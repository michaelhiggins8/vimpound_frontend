import { useNavigate } from 'react-router-dom'
import { memo } from 'react'

function LandingPageFooter() {
  const navigate = useNavigate()

  const handleContactUs = () => {
    window.location.href = 'mailto:michaelhiggins8@gmail.com'
  }

  const handlePlatformLogin = () => {
    navigate('/signup')
  }

  const handleTerms = () => {
    navigate('/terms')
  }

  const handlePrivacyPolicy = () => {
    navigate('/privacy-policy')
  }

  return (
    <div className="w-full bg-black text-white min-h-screen flex flex-col relative overflow-hidden">
      {/* Subtle background accent for visual interest */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ willChange: 'transform' }}></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" style={{ willChange: 'transform' }}></div>

      {/* Main Content Section - Upper Left */}
      <div className="flex-1 flex items-center justify-start p-8 md:p-12 lg:p-16 lg:p-20 relative z-10">
        <div className="max-w-3xl">
          <h2 className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-white/80 font-medium tracking-wide uppercase">
            Take the next step
          </h2>
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-10 md:mb-12 text-white leading-tight tracking-tight">
            Give your staff a break.
          </h1>
          <button
            onClick={handlePlatformLogin}
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 md:px-10 md:py-5 rounded-xl font-semibold hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 text-base md:text-lg group"
          >
            <span>Begin</span>
            <svg 
              className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer Section - Bottom */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center sm:items-end p-8 md:p-12 lg:p-16 lg:p-20 relative z-10 border-t border-white/10">
        {/* Copyright - Bottom Left */}
        <div className="text-sm md:text-base text-white/60 mb-4 sm:mb-0 font-medium">
          2026 Vimpound AI
        </div>

        {/* Links - Bottom Right */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <button
            onClick={handleTerms}
            className="text-sm md:text-base text-white/80 hover:text-white transition-colors duration-200 font-medium relative group"
          >
            Terms
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            onClick={handlePrivacyPolicy}
            className="text-sm md:text-base text-white/80 hover:text-white transition-colors duration-200 font-medium relative group"
          >
            Privacy Policy
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            onClick={handleContactUs}
            className="text-sm md:text-base text-white/80 hover:text-white transition-colors duration-200 font-medium relative group"
          >
            Contact Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(LandingPageFooter)

