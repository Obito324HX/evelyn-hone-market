import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (user) checkNotifications()
    setMenuOpen(false)
  }, [location])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const checkNotifications = async () => {
    try {
      const res = await axios.get(`https://evelyn-hone-market-production.up.railway.app/api/notifications/${user.user_id}`)
      setUnreadCount(res.data.filter(n => !n.read).length)
    } catch (err) {
      console.error(err)
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav} ref={menuRef}>
      <div style={styles.navTop}>
        <Link to="/" style={styles.brand} onClick={() => setMenuOpen(false)}>
          🏪 Evelyn Hone Market
        </Link>
        <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      {menuOpen && (
        <div style={styles.dropdown}>
          <Link to="/listings" style={{...styles.dropLink, ...(isActive('/listings') ? styles.activeLink : {})}} onClick={() => setMenuOpen(false)}>
            Browse
          </Link>
          {user ? (
            <>
              <Link to="/create-listing" style={{...styles.dropLink, ...(isActive('/create-listing') ? styles.activeLink : {})}} onClick={() => setMenuOpen(false)}>
                Sell
              </Link>
              <Link to="/messages" style={{...styles.dropLink, ...(isActive('/messages') ? styles.activeLink : {})}} onClick={() => setMenuOpen(false)}>
                Messages
              </Link>
              <Link to="/notifications" style={{...styles.dropLink, ...(isActive('/notifications') ? styles.activeLink : {})}} onClick={() => setMenuOpen(false)}>
                🔔 Notifications {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
              </Link>
              <Link to="/profile" style={{...styles.dropLink, ...(isActive('/profile') ? styles.activeLink : {})}} onClick={() => setMenuOpen(false)}>
                <span style={styles.avatar}>{user.username[0].toUpperCase()}</span>
                {user.username}
              </Link>
              <button onClick={logout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.dropLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={{...styles.dropLink, ...styles.registerLink}} onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: { backgroundColor:'#1a1a2e', color:'white', boxShadow:'0 2px 10px rgba(0,0,0,0.3)', position:'sticky', top:0, zIndex:1000, fontFamily:'Arial, sans-serif' },
  navTop: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.5rem' },
  brand: { color:'#e94560', textDecoration:'none', fontSize:'1.1rem', fontWeight:'bold' },
  hamburger: { background:'none', border:'none', color:'white', fontSize:'1.5rem', cursor:'pointer', padding:'0.3rem', minWidth:'44px', minHeight:'44px' },
  dropdown: { display:'flex', flexDirection:'column', background:'#1a1a2e', borderTop:'1px solid rgba(255,255,255,0.1)', padding:'0.5rem 0' },
  dropLink: { color:'#ccc', textDecoration:'none', padding:'0.9rem 1.5rem', fontSize:'1rem', display:'flex', alignItems:'center', gap:'0.5rem', borderBottom:'1px solid rgba(255,255,255,0.05)' },
  activeLink: { color:'white', background:'rgba(255,255,255,0.1)' },
  badge: { background:'#e94560', color:'white', borderRadius:'50%', width:'20px', height:'20px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:'bold' },
  avatar: { display:'inline-flex', alignItems:'center', justifyContent:'center', width:'28px', height:'28px', borderRadius:'50%', background:'#e94560', color:'white', fontSize:'0.85rem', fontWeight:'bold' },
  logoutBtn: { background:'transparent', color:'#ccc', border:'none', padding:'0.9rem 1.5rem', cursor:'pointer', fontSize:'1rem', textAlign:'left', borderTop:'1px solid rgba(255,255,255,0.1)' },
  registerLink: { color:'#e94560', fontWeight:'bold' }
}

export default Navbar
