import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://evelyn-hone-market-production.up.railway.app'

function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'))
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) checkNotifications()
  }, [location])

  const checkNotifications = async () => {
    try {
      const res = await axios.get(`${API}/api/notifications/${user.user_id}`)
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
    <>
      {/* Top bar - desktop and branding */}
      <nav style={styles.topNav}>
        <Link to="/" style={styles.brand}>🏪 Evelyn Hone Market</Link>
        <div style={styles.desktopLinks}>
          <Link to="/listings" style={{...styles.dLink, ...(isActive('/listings') ? styles.activeDLink : {})}}>Browse</Link>
          {user ? (
            <>
              <Link to="/create-listing" style={{...styles.dLink, ...(isActive('/create-listing') ? styles.activeDLink : {})}}>Sell</Link>
              <Link to="/messages" style={{...styles.dLink, ...(isActive('/messages') ? styles.activeDLink : {})}}>Messages</Link>
              <Link to="/notifications" style={{...styles.dLink, ...(isActive('/notifications') ? styles.activeDLink : {}), position:'relative'}}>
                🔔 {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
              </Link>
              <Link to="/profile" style={{...styles.dLink, ...(isActive('/profile') ? styles.activeDLink : {})}}>
                <span style={styles.avatar}>{user.username[0].toUpperCase()}</span>
                {user.username}
              </Link>
              <button onClick={logout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.dLink}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Bottom tab bar - mobile only */}
      <div style={styles.bottomBar}>
        <Link to="/" style={{...styles.tabItem, ...(isActive('/') ? styles.activeTab : {})}}>
          <span style={styles.tabIcon}>🏠</span>
          <span style={styles.tabLabel}>Home</span>
        </Link>
        <Link to="/listings" style={{...styles.tabItem, ...(isActive('/listings') ? styles.activeTab : {})}}>
          <span style={styles.tabIcon}>🔍</span>
          <span style={styles.tabLabel}>Browse</span>
        </Link>
        {user && (
          <Link to="/create-listing" style={{...styles.tabItem, ...styles.sellTab}}>
            <span style={styles.sellIcon}>+</span>
            <span style={styles.tabLabel}>Sell</span>
          </Link>
        )}
        <Link to="/messages" style={{...styles.tabItem, ...(isActive('/messages') ? styles.activeTab : {})}}>
          <span style={styles.tabIcon}>💬</span>
          <span style={styles.tabLabel}>Messages</span>
        </Link>
        {user ? (
          <Link to="/profile" style={{...styles.tabItem, ...(isActive('/profile') ? styles.activeTab : {})}}>
            <span style={styles.tabAvatarWrapper}>
              <span style={styles.tabAvatar}>{user.username[0].toUpperCase()}</span>
              {unreadCount > 0 && <span style={styles.tabBadge}>{unreadCount}</span>}
            </span>
            <span style={styles.tabLabel}>Profile</span>
          </Link>
        ) : (
          <Link to="/login" style={{...styles.tabItem, ...(isActive('/login') ? styles.activeTab : {})}}>
            <span style={styles.tabIcon}>👤</span>
            <span style={styles.tabLabel}>Login</span>
          </Link>
        )}
      </div>
    </>
  )
}

const styles = {
  topNav: { backgroundColor:'#1a1a2e', color:'white', boxShadow:'0 2px 10px rgba(0,0,0,0.3)', position:'sticky', top:0, zIndex:100, fontFamily:'Arial, sans-serif', padding:'0.8rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' },
  brand: { color:'#e94560', textDecoration:'none', fontSize:'1.1rem', fontWeight:'bold' },
  desktopLinks: { display:'flex', gap:'0.5rem', alignItems:'center' },
  dLink: { color:'#ccc', textDecoration:'none', padding:'0.5rem 0.8rem', borderRadius:'6px', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.3rem' },
  activeDLink: { color:'white', background:'rgba(255,255,255,0.1)' },
  badge: { position:'absolute', top:'-2px', right:'-2px', background:'#e94560', color:'white', borderRadius:'50%', width:'16px', height:'16px', fontSize:'0.65rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold' },
  avatar: { display:'inline-flex', alignItems:'center', justifyContent:'center', width:'24px', height:'24px', borderRadius:'50%', background:'#e94560', color:'white', fontSize:'0.75rem', fontWeight:'bold' },
  logoutBtn: { background:'transparent', color:'#ccc', border:'1px solid #444', padding:'0.4rem 0.8rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem' },
  registerBtn: { background:'#e94560', color:'white', textDecoration:'none', padding:'0.5rem 1rem', borderRadius:'6px', fontSize:'0.9rem', fontWeight:'bold' },
  bottomBar: { position:'fixed', bottom:0, left:0, right:0, background:'#1a1a2e', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'0.5rem 0', zIndex:1000, boxShadow:'0 -2px 10px rgba(0,0,0,0.3)', borderTop:'1px solid rgba(255,255,255,0.1)' },
  tabItem: { display:'flex', flexDirection:'column', alignItems:'center', gap:'0.2rem', textDecoration:'none', color:'#888', padding:'0.3rem 0.8rem', borderRadius:'8px', minWidth:'60px' },
  activeTab: { color:'#e94560' },
  tabIcon: { fontSize:'1.3rem' },
  tabLabel: { fontSize:'0.65rem', fontWeight:'bold' },
  sellTab: { color:'white' },
  sellIcon: { width:'40px', height:'40px', background:'#e94560', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:'bold', color:'white', marginTop:'-15px', boxShadow:'0 4px 10px rgba(233,69,96,0.5)' },
  tabAvatarWrapper: { position:'relative' },
  tabAvatar: { width:'28px', height:'28px', borderRadius:'50%', background:'#e94560', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:'bold' },
  tabBadge: { position:'absolute', top:'-4px', right:'-4px', background:'#e94560', color:'white', borderRadius:'50%', width:'14px', height:'14px', fontSize:'0.6rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold' }
}

export default Navbar
