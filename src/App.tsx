import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Overview from './pages/dashboard/Overview' 
import Customize from './pages/dashboard/customize/Customize'
import VehiclePanel from './pages/dashboard/vehicle_panel/VehiclePanel'
import PhoneNumber from './pages/dashboard/phone_number/PhoneNumber'
import Retrieval from './pages/dashboard/retrieval/Retrieval'
import Billing from './pages/dashboard/billing/Billing'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="dashboard/overview" element={<Overview />} />
      <Route path="dashboard/customize" element={<Customize />} />
      <Route path="dashboard/vehicle_panel" element={<VehiclePanel />} />
      <Route path="dashboard/phone_number" element={<PhoneNumber />} />
      <Route path="dashboard/retrieval" element={<Retrieval />} />
      <Route path="dashboard/billing" element={<Billing />} />
    </Routes>
  )
}

export default App
