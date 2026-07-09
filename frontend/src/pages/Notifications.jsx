import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getUser } from '../utils/auth'
import { colors, radius, shadow, font, fontDisplay } from '../theme'
const API = import.meta.env.VITE_API_URL

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = getUser()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/api/notifications/${user.id}`)
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const markRead = async (id) => {
    try {
      await axios.put(`${API}/api/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllRead = async () => {
    try {
      await axios.put(`${API}/api/notifications/${user.id}/read-all`)
      setNotifications(prev => prev.map(n => ({...n, read: true})))
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (!user) return null

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Notifications</h1>
            {unreadCount > 0 && (
              <span style={styles.unreadBadge}>{unreadCount} unread</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button style={styles.markAllBtn} onClick={markAllRead} className="btn-hover">
              Mark all as read
            </button>
          )}
        </div>
        {loading ? (
          <div style={styles.loading}>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔔</div>
            <h3 style={styles.emptyTitle}>No notifications yet</h3>
            <p style={styles.emptyText}>When someone messages you or interacts with your listings, you'll see it here.</p>
            <button style={styles.browseBtn} onClick={() => navigate('/listings')} className="btn-hover">Browse Listings</button>
          </div>
        ) : (
          <div style={styles.notifList}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{...styles.notifCard, ...(n.read ? styles.readCard : styles.unreadCard)}}
                onClick={() => { if (!n.read) markRead(n.id); navigate('/messages') }}
                className="card-hover"
              >
                <div style={styles.notifIcon}>
                  {n.content.includes('message') ? '💬' : '🔔'}
                </div>
                <div style={styles.notifBody}>
                  <p style={styles.notifContent}>{n.content}</p>
                  <small style={styles.notifTime}>
                    {new Date(n.created_at).toLocaleString()}
                  </small>
                </div>
                {!n.read && <div style={styles.unreadDot}></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: colors.bg, padding: '2rem 1.5rem', fontFamily: font.family },
  container: { maxWidth: '700px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  title: { fontFamily: fontDisplay, color: colors.text, fontSize: '1.7rem', margin: 0, marginBottom: '0.4rem', fontWeight: 600 },
  unreadBadge: { background: colors.accent, color: 'white', padding: '0.22rem 0.85rem', borderRadius: radius.pill, fontSize: '0.82rem', fontWeight: 700 },
  markAllBtn: { background: 'none', border: `1px solid ${colors.borderStrong}`, color: colors.text, padding: '0.5rem 1.1rem', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: font.family },
  loading: { textAlign: 'center', padding: '3rem', color: colors.textMuted },
  emptyState: { textAlign: 'center', padding: '4rem 2rem', background: colors.surface, borderRadius: radius.lg, border: `1px solid ${colors.border}` },
  emptyIcon: { fontSize: '3.5rem', marginBottom: '1rem' },
  emptyTitle: { fontFamily: fontDisplay, color: colors.text, fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 },
  emptyText: { color: colors.textMuted, marginBottom: '1.5rem', lineHeight: 1.65 },
  browseBtn: { background: colors.accent, color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700 },
  notifList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  notifCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem', borderRadius: radius.md, cursor: 'pointer' },
  unreadCard: { background: colors.surface, border: `1px solid ${colors.border}`, borderLeftWidth: '3px', borderLeftColor: colors.accent, borderLeftStyle: 'solid' },
  readCard: { background: colors.bg, border: `1px solid ${colors.border}`, borderLeftWidth: '3px', borderLeftColor: colors.border, borderLeftStyle: 'solid' },
  notifIcon: { fontSize: '1.4rem', flexShrink: 0 },
  notifBody: { flex: 1 },
  notifContent: { color: colors.text, margin: 0, marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.9rem' },
  notifTime: { color: colors.textFaint, fontSize: '0.8rem' },
  unreadDot: { width: '9px', height: '9px', borderRadius: '50%', background: colors.accent, flexShrink: 0 },
}

export default Notifications
