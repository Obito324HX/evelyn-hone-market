import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user) checkNotifications()
    setMenuOpen(false)
  }, [location])

  const checkNotifications = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/notifications/${user.user_id}`)
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
    <nav style={styles.nav}>
      <div style={styles.navTop}>
        <Link to="/" style={styles.brand}>
          🏪 Evelyn Hone Market
        </Link>
        <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      <div style={{...styles.links, ...(menuOpen ? styles.linksOpen : {})}}>
        <Link to="/listings" style={{...styles.link, ...(isActive('/listings') ? styles.activeLink : {})}} onClick={() => setMenuOpen(false)}>
          Browse
        </Link>
        {user ? (
          <>
            <Link to="/create-listing" style={{...styles.link, ...(isActive('/create-listing') ? styles.activeLink : {})}} onClick={() => setMenuOpen(false)}>
              Sell
            </Link>
            <Link to="/messages" style={{...styles.link, ...(isActive('/messages') ? styles.activeLink : {})}} onClick={() => setMenuOpen(false)}>
              Messages
            </Link>
            <Link to="/notifications" style={{...styles.link, ...(isActive('/notifications') ? styles.activeLink : {}), position:'relative'}} onClick={() => setMenuOpen(false)}>
              🔔
              {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            </Link>
            <Link to="/profile" style={{...styles.link, ...(isActive('/profile') ? styles.activeLink : {})}} onClick={() => setMenuOpen(false)}>
              <span style={styles.avatar}>{user.username[0].toUpperCase()}</span>
              {user.username}
            </Link>
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link} onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" style={styles.registerBtn} onClick={() => setMenuOpen(false)}>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: { backgroundColor:'#1a1a2e', color:'white', boxShadow:'0 2px 10px rgba(0,0,0,0.3)', position:'sticky', top:0, zIndex:100, fontFamily:'Arial, sans-serif' },
  navTop: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.5rem' },
  brand: { color:'#e94560', textDecoration:'none', fontSize:'1.2rem', fontWeight:'bold' },
  hamburger: { background:'none', border:'none', color:'white', fontSize:'1.5rem', cursor:'pointer', padding:'0.3rem' },
  links: { display:'flex', gap:'0.5rem', alignItems:'center', padding:'0 1.5rem 0.8rem', flexWrap:'wrap' },
  linksOpen: { display:'flex', flexDirection:'column', padding:'1rem 1.5rem', borderTop:'1px solid rgba(255,255,255,0.1)', gap:'0.3rem' },
  link: { color:'#ccc', textDecoration:'none', padding:'0.6rem 0.8rem', borderRadius:'6px', fontSize:'0.95rem', display:'flex', alignItems:'center', gap:'0.3rem' },
  activeLink: { color:'white', background:'rgba(255,255,255,0.1)' },
  badge: { position:'absolute', top:'-2px', right:'-2px', background:'#e94560', color:'white', borderRadius:'50%', width:'18px', height:'18px', fontSize:'0.7rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold' },
  avatar: { display:'inline-flex', alignItems:'center', justifyContent:'center', width:'24px', height:'24px', borderRadius:'50%', background:'#e94560', color:'white', fontSize:'0.75rem', fontWeight:'bold' },
  logoutBtn: { background:'transparent', color:'#ccc', border:'1px solid #444', padding:'0.5rem 1rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' },
  registerBtn: { background:'#e94560', color:'white', textDecoration:'none', padding:'0.5rem 1rem', borderRadius:'6px', fontSize:'0.95rem', fontWeight:'bold' }
}

export default Navbar
