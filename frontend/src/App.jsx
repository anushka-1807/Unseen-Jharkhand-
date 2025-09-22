import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Discover from './components/Discover'
import About from './pages/About'
import Login from './pages/Login'
import Bookings from './pages/Bookings'
import RegisterGuide from './pages/RegisterGuide'
import GuideDashboard from './pages/GuideDashboard'
import Payments from './pages/Payments'
import TourBuddy from './pages/TourBuddy'
import Saved from './pages/Saved'
import Arts from './pages/Arts'
import Folks from './pages/Folks'
import TouristAuth from './pages/TouristAuth'
import AdminDashboard from './pages/AdminDashboard'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import ChatbotWidget from './components/ChatbotWidget'
import Footer from './components/Footer'
import Explore from './pages/Explore'

function Home() {
  return (
    <>
      <Hero />
      <div className="arts-bg" style={{marginTop: 0}}>
        <div className="container">
          <Discover />
        </div>
      </div>
    </>
  )
}

function ProtectedAdmin() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location?.pathname || '/admin', as: 'admin' }} replace />
  }
  return <AdminDashboard />
}

export default function App() {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Global guard: if logged in as guide, force them to /guide only
  useEffect(() => {
    if (isAuthenticated && user?.role === 'guide') {
      if (!location.pathname.startsWith('/guide')) {
        navigate('/guide', { replace: true })
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate])

  return (
    <div className="app-root tribal-bg">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/tourist" element={<TouristAuth />} />
        <Route path="/bookings" element={<ProtectedBookings />} />
        <Route path="/tour-buddy" element={<TourBuddy />} />
        <Route path="/arts" element={<Arts />} />
        <Route path="/folks" element={<Folks />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/register-guide" element={<RegisterGuide />} />
        <Route path="/guide" element={<GuideDashboard />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/admin" element={<ProtectedAdmin />} />
      </Routes>
      <ChatbotWidget />
      <Footer />
    </div>
  )
}

function ProtectedBookings() {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  if (!isAuthenticated || (user && user.role !== 'tourist' && user.role !== 'admin' && user.role !== 'guide')) {
    return <Navigate to="/auth/tourist" state={{ from: location?.pathname || '/bookings' }} replace />
  }
  return <Bookings />
}
