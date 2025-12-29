import { NavLink } from 'react-router-dom'
import logoImage from '../../assets/logo.png'

// ===== CONFIGURATION - Edit these values to customize =====
const CONFIG = {
  // User info
  userEmail: "       Welcome to Vimpound",
  orgSuffix: "",
  
  // Branding
  brandLogo: 'V',
  brandName: 'Vimpound',
  logoColor: '#10b981',
}

// ===== NAVIGATION ITEMS - Easy to add/remove sections and items =====
const NAVIGATION = [
  // Standalone item (no section header)
  { to: "/dashboard/overview", label: "Overview", icon: "home" },
  
  // BUILD Section
  {
    section: "Customize",
    items: [{ to: "/dashboard/phone_number", label: "Phone Number", icon: "phone" },
      { to: "/dashboard/customize", label: "Identity", icon: "person" },
      { to: "/dashboard/retrieval", label: "Retrieval", icon: "users" },
      
    ],
  },
  
  // Vehicle Management Section
  {
    section: "Vehicle Management",
    items: [
      { to: "/dashboard/vehicle_panel", label: "Vehicle Panel", icon: "key" },

    ],
  },
  
  // OBSERVE Section
  {
    section: "Billing",
    items: [
      { to: "/dashboard/billing", label: "Billing", icon: "grid" }
    ],
  },
]

// ===== ICONS =====
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2L3 7V18H8V12H12V18H17V7L10 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M10 12C5.58172 12 2 14.6863 2 18V20H18V18C18 14.6863 14.4183 12 10 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 6C13 7.65685 11.6569 9 10 9C8.34315 9 7 7.65685 7 6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M3 18C3 14.6863 5.68629 12 9 12H11C14.3137 12 17 14.6863 17 18V20H3V18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M15 6C15 7.10457 14.1046 8 13 8C11.8954 8 11 7.10457 11 6C11 4.89543 11.8954 4 13 4C14.1046 4 15 4.89543 15 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M17 18C17 15.7909 15.2091 14 13 14C10.7909 14 9 15.7909 9 18V20H17V18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const WrenchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 2.5L17.5 5.5L12.5 10.5L9.5 11.5L10.5 8.5L15.5 3.5L14.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M8 12L3 17C2.44772 17.5523 2.44772 18.4477 3 19C3.55228 19.5523 4.44772 19.5523 5 19L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 2C3 1.44772 3.44772 1 4 1H6C6.55228 1 7 1.44772 7 2V3C7 6.31371 9.68629 9 13 9H14C14.5523 9 15 9.44772 15 10V12C15 12.5523 14.5523 13 14 13H12.5C11.1193 13 9.74214 13.2146 8.4443 13.6361C7.14646 14.0576 5.94127 14.6801 4.87868 15.4785L3 17V14C3 13.4477 2.55228 13 2 13H1C0.447715 13 0 12.5523 0 12V10C0 9.44772 0.447715 9 1 9H3V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const WaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10C2 10 4 6 7 6C10 6 10 10 13 10C16 10 18 6 18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M2 14C2 14 4 10 7 10C10 10 10 14 13 14C16 14 18 10 18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 7C15 9.20914 13.2091 11 11 11C10.4477 11 9.9299 10.8771 9.47214 10.6586L6 14.1307V18H2V14.1307L5.34141 10.7893C5.12286 10.3316 5 9.81378 5 9.26144C5 7.0523 6.79086 5.26144 9 5.26144C11.2091 5.26144 13 7.0523 13 9.26144C13.5523 9.26144 14.0701 9.38433 14.5279 9.60288L17.8693 6.26144H22V2.26144H17.8693L14.5279 5.60288C14.0701 5.38433 13.5523 5.26144 13 5.26144C10.7909 5.26144 9 7.0523 9 9.26144C9 9.81378 9.12286 10.3316 9.34141 10.7893L6 14.1307V18H2V14.1307L5.34141 10.7893C5.12286 10.3316 5 9.81378 5 9.26144C5 7.0523 6.79086 5.26144 9 5.26144C11.2091 5.26144 13 7.0523 13 9.26144Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="11" cy="9" r="1.5" fill="currentColor"/>
  </svg>
)

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="10" r="1.5" fill="currentColor"/>
    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
  </svg>
)

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4L16 10L6 16V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 10C1 10 4 4 10 4C16 4 19 10 19 10C19 10 16 16 10 16C4 16 1 10 1 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <rect x="12" y="2" width="6" height="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <rect x="2" y="12" width="6" height="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <rect x="12" y="12" width="6" height="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 5H18M2 10H18M2 15H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2H18V14H6L2 18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2H14V18H4V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M7 6H13M7 10H13M7 14H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
)

const iconMap = {
  home: HomeIcon,
  person: PersonIcon,
  users: UsersIcon,
  wrench: WrenchIcon,
  phone: PhoneIcon,
  wave: WaveIcon,
  key: KeyIcon,
  more: MoreIcon,
  play: PlayIcon,
  eye: EyeIcon,
  grid: GridIcon,
  list: ListIcon,
  chat: ChatIcon,
  document: DocumentIcon,
}

// ===== COMPONENTS =====
const NavItem = ({ to, icon: iconName, children, badge }: { to: string; icon: string; children: React.ReactNode; badge?: string }) => {
  const Icon = iconMap[iconName as keyof typeof iconMap]
  
  if (!Icon) {
    console.warn(`Icon "${iconName}" not found`)
    return null
  }
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg no-underline text-sm transition-all duration-200 mb-1 ${
          isActive
            ? 'text-white bg-[#10b981] font-semibold shadow-sm'
            : 'text-[#374151] bg-transparent font-normal hover:bg-[#f9fafb] hover:text-[#111827]'
        }`
      }
    >
      <span className={`flex items-center transition-opacity duration-200 ${iconName ? 'opacity-90' : 'opacity-70'}`}>
        <Icon />
      </span>
      <span className="flex-1 leading-5">{children}</span>
      {badge && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f97316] text-white font-semibold uppercase tracking-wide shadow-sm">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] mt-1">
    {children}
  </div>
)

// ===== MAIN COMPONENT =====
export default function SideBar() {
  const userDisplayText = `${CONFIG.userEmail}${CONFIG.orgSuffix}`

  return (
    <div className="w-[260px] h-screen bg-white border-r border-[#e5e7eb] flex flex-col fixed left-0 top-0 overflow-y-auto overflow-x-hidden shadow-sm">
      {/* Top Section - Branding */}
      <div className="p-6 pb-5 border-b border-[#e5e7eb] bg-gradient-to-b from-white to-[#fafbfc]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-lg shadow-md overflow-hidden">
            <img 
              src={logoImage}
              alt={CONFIG.brandName}
              className="w-full h-full object-cover scale-150 transition-transform duration-200 hover:scale-[1.6]"
            />
          </div>
          <span className="text-xl font-bold text-[#111827] tracking-tight">
            {CONFIG.brandName}
          </span>
        </div>
        
        <div className="text-sm text-[#6b7280] mb-4 font-medium">
          {userDisplayText}
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 py-3 overflow-y-auto">
        {NAVIGATION.map((item, index) => {
          // Standalone item (no section)
          if (item.to) {
            return (
              <div key={index} className="px-3">
                <NavItem to={item.to} icon={item.icon} badge={(item as any).badge}>
                  {item.label}
                </NavItem>
              </div>
            )
          }
          
          // Section with items
          if (item.section && item.items) {
            return (
              <div key={index}>
                <SectionHeader>{item.section}</SectionHeader>
                <div className="px-3">
                  {item.items.map((navItem, navIndex) => (
                    <NavItem
                      key={navIndex}
                      to={navItem.to}
                      icon={navItem.icon}
                      badge={(navItem as any).badge}
                    >
                      {navItem.label}
                    </NavItem>
                  ))}
                </div>
              </div>
            )
          }
          
          return null
        })}
      </div>
    </div>
  )
}
