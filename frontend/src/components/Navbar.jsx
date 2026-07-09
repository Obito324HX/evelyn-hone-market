import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { getUser, logout as clearAuth } from '../utils/auth'
import { colors, radius, shadow, font, fontDisplay } from '../theme'
const API = import.meta.env.VITE_API_URL

function Navbar() {
  const user = getUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

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

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarInner}>
          <Link to="/" style={styles.brand} className="link-hover">
            <span style={styles.brandWord}>EHM</span>
          </Link>

          <form onSubmit={handleSearch} style={styles.searchForm}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="Search the campus market..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </form>

          <div style={styles.topRight}>
            {user ? (
              <>
                <Link to="/profile" style={styles.avatarLink} className="link-hover">
                  <span style={styles.avatar}>{user.name?.[0]?.toUpperCase() || '?'}</span>
                </Link>
                <button onClick={logout} style={styles.logoutBtn} className="btn-hover">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.loginLink} className="link-hover">Log in</Link>
                <Link to="/register" style={styles.registerBtn} className="btn-hover">Join</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating bottom nav */}
      <nav style={styles.floatWrap}>
        <div style={styles.floatBar}>
          <Link to="/" style={styles.navItem} className="nav-item">
            <span style={{...styles.navIcon, opacity: isActive('/') ? 1 : 0.4}}>⌂</span>
          </Link>
          <Link to="/listings" style={styles.navItem} className="nav-item">
            <span style={{...styles.navIcon, opacity: isActive('/listings') ? 1 : 0.4}}>⌕</span>
          </Link>
          <Link to="/create-listing" style={styles.sellBtn} className="nav-item">
            <span style={styles.sellPlus}>+</span>
          </Link>
          <Link to="/messages" style={styles.navItem} className="nav-item">
            <span style={{...styles.navIcon, opacity: isActive('/messages') ? 1 : 0.4}}>✉</span>
          </Link>
          <Link to={user ? '/profile' : '/login'} style={styles.navItem} className="nav-item">
            <span style={styles.navIconWrap}>
              <span style={{...styles.navIcon, opacity: (isActive('/profile')||isActive('/login')) ? 1 : 0.4}}>☰</span>
              {unreadCount > 0 && <span style={styles.navBadge}>{unreadCount}</span>}
            </span>
          </Link>
        </div>
      </nav>
    </>
  )
}

const styles = {
  topBar: {
    fontFamily: font.family,
    background: 'rgba(251,250,248,0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${colors.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '0.85rem 1.25rem',
  },
  topBarInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  brand: { textDecoration: 'none', flexShrink: 0 },
  brandWord: {
    fontFamily: fontDisplay,
    fontSize: '1.3rem',
    fontWeight: 700,
    color: colors.ink,
    letterSpacing: '-0.01em',
  },
  searchForm: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.pill,
    padding: '0.5rem 1rem',
    maxWidth: '420px',
  },
  searchIcon: { color: colors.textFaint, fontSize: '0.95rem' },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '0.85rem',
    color: colors.text,
    width: '100%',
    fontFamily: font.family,
  },
  topRight: { display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 },
  avatarLink: { textDecoration: 'none' },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: colors.accent, color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8rem', fontWeight: 700,
  },
  logoutBtn: {
    background: 'transparent',
    color: colors.textMuted,
    border: `1px solid ${colors.border}`,
    padding: '0.4rem 0.85rem',
    borderRadius: radius.pill,
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 600,
  },
  loginLink: { color: colors.textMuted, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 },
  registerBtn: {
    background: colors.ink,
    color: 'white',
    textDecoration: 'none',
    padding: '0.45rem 1.1rem',
    borderRadius: radius.pill,
    fontSize: '0.82rem',
    fontWeight: 700,
  },
  floatWrap: {
    position: 'fixed',
    bottom: '18px',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  floatBar: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'rgba(28,22,38,0.94)',
    backdropFilter: 'blur(14px)',
    borderRadius: radius.pill,
    padding: '0.5rem 0.6rem',
    boxShadow: '0 16px 40px rgba(28,22,38,0.28)',
  },
  navItem: {
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    borderRadius: '50%',
  },
  navIcon: { fontSize: '1.25rem', color: 'white', lineHeight: 1 },
  navIconWrap: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navBadge: {
    position: 'absolute', top: '-4px', right: '-6px',
    background: colors.accent, color: 'white',
    borderRadius: '50%', width: '15px', height: '15px',
    fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, border: '2px solid #1C1626',
  },
  sellBtn: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentDark})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    boxShadow: `0 6px 18px ${colors.accentGlow}`,
    margin: '0 0.15rem',
  },
  sellPlus: { fontSize: '1.6rem', color: 'white', fontWeight: 400, lineHeight: 1 },
}

export default Navbar
