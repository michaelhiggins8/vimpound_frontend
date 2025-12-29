import FeatOfStrength from "./FeatOfStrength"
import HowItWorksCard from "./HowItWorksCard"
import LandingPageFooter from "./LandingPageFooter"

function NextSection() {
  return (
    <div className="w-full flex flex-col">
      <div className="min-h-screen w-full py-20 px-5 bg-white flex flex-col items-center justify-center">
        <div className="max-w-[1200px] w-full">
          
          <FeatOfStrength />
          <HowItWorksCard />
          {/* Add more components here as needed */}
         
          
        </div>
      </div>
      <LandingPageFooter />
    </div>
  )
}

export default NextSection
