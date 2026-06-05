import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Listings from './pages/Listings'
import CreateListing from './pages/CreateListing'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import ListingDetail from './pages/ListingDetail'
import Admin from './pages/Admin'
import Notifications from './pages/Notifications'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </>
        } />
      </Routes>
    </Router>
  )
}

export default App
