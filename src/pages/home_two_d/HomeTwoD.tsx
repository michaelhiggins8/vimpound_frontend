import { lazy, Suspense } from 'react'
import FeatOfStrength from "./FeatOfStrength"
import HowItWorksCard from "./HowItWorksCard"

// Lazy load footer since it's at the bottom
const LandingPageFooter = lazy(() => import("./LandingPageFooter"))

function NextSection() {
  return (
    <div className="w-full flex flex-col relative">
      {/* Foggy Green Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ willChange: 'transform' }}>
        {/* Top left foggy green blur */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-green-200/20 rounded-full blur-3xl" style={{ willChange: 'transform' }}></div>
        {/* Top right foggy green blur */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-green-300/15 rounded-full blur-3xl" style={{ willChange: 'transform' }}></div>
        {/* Middle left foggy green blur */}
        <div className="absolute top-1/3 left-0 w-[700px] h-[400px] bg-green-200/25 rounded-full blur-3xl" style={{ willChange: 'transform' }}></div>
        {/* Middle right foggy green blur */}
        <div className="absolute top-1/2 right-0 w-[600px] h-[500px] bg-green-300/20 rounded-full blur-3xl" style={{ willChange: 'transform' }}></div>
        {/* Bottom left foggy green blur */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[600px] bg-green-200/20 rounded-full blur-3xl" style={{ willChange: 'transform' }}></div>
        {/* Bottom right foggy green blur */}
        <div className="absolute bottom-20 right-0 w-[550px] h-[550px] bg-green-300/15 rounded-full blur-3xl" style={{ willChange: 'transform' }}></div>
        {/* Horizontal foggy green band for HowItWorksCard area */}
        <div className="absolute top-[40%] left-0 right-0 h-[600px] bg-gradient-to-r from-green-200/10 via-green-300/20 to-green-200/10 blur-3xl" style={{ willChange: 'transform' }}></div>
      </div>
      
      <div className="min-h-screen w-full py-20 px-5 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center relative z-10">
        <div className="max-w-[1200px] w-full">
          
          <FeatOfStrength />
          <HowItWorksCard />
          {/* Add more components here as needed */}
          
          
        </div>
      </div>
      <Suspense fallback={<div className="w-full bg-black text-white min-h-screen flex items-center justify-center">Loading...</div>}>
        <LandingPageFooter />
      </Suspense>
    </div>
  )
}

export default NextSection
