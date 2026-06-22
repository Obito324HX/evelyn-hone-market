import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { getUser, logout as clearAuth } from '../utils/auth'
const API = import.meta.env.VITE_API_URL
function Navbar() {
  const user = getUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  useEffect(() => {
    if (user) checkNotifications()
  }, [location])
  const checkNotifications = async () => {
    try {
      const res = await axios.get(`${API}/api/notifications/${user.id}`)
      setUnreadCount(res.data.filter(n => !n.read).length)
    } catch (err) {
      console.error(err)
    }
  }
  const logout = () => {
    clearAuth()
    navigate('/login')
  }
  const isActive = (path) => location.pathname === path
  return (
    <>
      {/* Top bar */}
      <nav style={styles.topNav}>
        <Link to="/" style={styles.brand}>🏪 EHM</Link>
        <div style={styles.topRight}>
          {user ? (
            <>
              <span style={styles.username}>{user.name}</span>
              <button onClick={logout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.loginLink}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Register</Link>
            </>
          )}
        </div>
      </nav>
      {/* Bottom tab bar */}
      <nav style={styles.bottomBar}>
        <Link to="/" style={{...styles.tab, ...(isActive('/') ? styles.activeTab : {})}}>
          <span style={styles.tabIcon}>🏠</span>
          <span style={styles.tabLabel}>Home</span>
        </Link>
        <Link to="/listings" style={{...styles.tab, ...(isActive('/listings') ? styles.activeTab : {})}}>
          <span style={styles.tabIcon}>🔍</span>
          <span style={styles.tabLabel}>Browse</span>
        </Link>
        <Link to="/create-listing" style={styles.sellTab}>
          <span style={styles.sellCircle}>+</span>
          <span style={{...styles.tabLabel, color: isActive('/create-listing') ? '#e94560' : '#888'}}>Sell</span>
        </Link>
        <Link to="/messages" style={{...styles.tab, ...(isActive('/messages') ? styles.activeTab : {})}}>
          <span style={styles.tabIcon}>💬</span>
          <span style={styles.tabLabel}>Chat</span>
        </Link>
        <Link to={user ? '/profile' : '/login'} style={{...styles.tab, ...((isActive('/profile') || isActive('/login')) ? styles.activeTab : {})}}>
          <span style={styles.tabIconWrapper}>
            {user ? (
              <span style={styles.tabAvatar}>{user.name[0].toUpperCase()}</span>
            ) : (
              <span style={styles.tabIcon}>👤</span>
            )}
            {unreadCount > 0 && <span style={styles.tabBadge}>{unreadCount}</span>}
          </span>
          <span style={styles.tabLabel}>{user ? user.name.substring(0,6) : 'Login'}</span>
        </Link>
      </nav>
    </>
  )
}
const styles = {
  topNav: {
    backgroundColor:'#1a1a2e',
    padding:'0.7rem 1rem',
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    position:'sticky',
    top:0,
    zIndex:100,
    boxShadow:'0 2px 8px rgba(0,0,0,0.3)'
  },
  brand: { color:'#e94560', textDecoration:'none', fontSize:'1.1rem', fontWeight:'bold', whiteSpace:'nowrap' },
  topRight: { display:'flex', alignItems:'center', gap:'0.5rem' },
  username: { color:'#ccc', fontSize:'0.85rem' },
  loginLink: { color:'#ccc', textDecoration:'none', fontSize:'0.85rem' },
  logoutBtn: { background:'transparent', color:'#ccc', border:'1px solid #444', padding:'0.3rem 0.7rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.8rem' },
  registerBtn: { background:'#e94560', color:'white', textDecoration:'none', padding:'0.3rem 0.7rem', borderRadius:'6px', fontSize:'0.85rem', fontWeight:'bold' },
  bottomBar: {
    position:'fixed',
    bottom:0,
    left:0,
    right:0,
    background:'#1a1a2e',
    display:'flex',
    justifyContent:'space-around',
    alignItems:'flex-end',
    padding:'0.4rem 0 0.6rem',
    zIndex:1000,
    boxShadow:'0 -2px 10px rgba(0,0,0,0.4)',
    borderTop:'1px solid rgba(255,255,255,0.08)'
  },
  tab: {
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    gap:'0.15rem',
    textDecoration:'none',
    color:'#666',
    flex:1,
    paddingTop:'0.3rem'
  },
  activeTab: { color:'#e94560' },
  tabIcon: { fontSize:'1.3rem', lineHeight:1 },
  tabLabel: { fontSize:'0.6rem', fontWeight:'bold', color:'inherit' },
  sellTab: {
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    gap:'0.15rem',
    textDecoration:'none',
    flex:1,
    paddingBottom:'0.2rem'
  },
  sellCircle: {
    width:'44px',
    height:'44px',
    background:'#e94560',
    borderRadius:'50%',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    fontSize:'1.6rem',
    fontWeight:'bold',
    color:'white',
    marginTop:'-16px',
    boxShadow:'0 4px 12px rgba(233,69,96,0.6)',
    lineHeight:1
  },
  tabIconWrapper: { position:'relative', display:'flex', alignItems:'center', justifyContent:'center' },
  tabAvatar: {
    width:'28px',
    height:'28px',
    borderRadius:'50%',
    background:'#e94560',
    color:'white',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    fontSize:'0.8rem',
    fontWeight:'bold'
  },
  tabBadge: {
    position:'absolute',
    top:'-4px',
    right:'-6px',
    background:'#ff4444',
    color:'white',
    borderRadius:'50%',
    width:'14px',
    height:'14px',
    fontSize:'0.55rem',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    fontWeight:'bold'
  }
}
export default Navbar
