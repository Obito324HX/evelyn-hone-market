import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getUser } from '../utils/auth'
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
            <h2 style={styles.title}>Notifications</h2>
            {unreadCount > 0 && (
              <span style={styles.unreadBadge}>{unreadCount} unread</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button style={styles.markAllBtn} onClick={markAllRead}>
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
            <button style={styles.browseBtn} onClick={() => navigate('/listings')}>Browse Listings</button>
          </div>
        ) : (
          <div style={styles.notifList}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{...styles.notifCard, ...(n.read ? styles.readCard : styles.unreadCard)}}
                onClick={() => { if (!n.read) markRead(n.id); navigate('/messages') }}
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
  page: { minHeight:'100vh', background:'#f5f5f5', padding:'2rem', fontFamily:'Arial, sans-serif' },
  container: { maxWidth:'700px', margin:'0 auto' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' },
  title: { color:'#1a1a2e', fontSize:'1.8rem', margin:0, marginBottom:'0.3rem' },
  unreadBadge: { background:'#e94560', color:'white', padding:'0.2rem 0.8rem', borderRadius:'20px', fontSize:'0.85rem', fontWeight:'bold' },
  markAllBtn: { background:'none', border:'2px solid #1a1a2e', color:'#1a1a2e', padding:'0.5rem 1rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9rem' },
  loading: { textAlign:'center', padding:'3rem', color:'#888' },
  emptyState: { textAlign:'center', padding:'4rem 2rem', background:'white', borderRadius:'12px', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  emptyIcon: { fontSize:'4rem', marginBottom:'1rem' },
  emptyTitle: { color:'#1a1a2e', fontSize:'1.3rem', marginBottom:'0.5rem' },
  emptyText: { color:'#888', marginBottom:'1.5rem', lineHeight:'1.6' },
  browseBtn: { background:'#e94560', color:'white', border:'none', padding:'0.8rem 2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  notifList: { display:'flex', flexDirection:'column', gap:'0.8rem' },
  notifCard: { display:'flex', alignItems:'center', gap:'1rem', padding:'1.2rem', borderRadius:'12px', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', transition:'transform 0.1s' },
  unreadCard: { background:'white', borderLeft:'4px solid #e94560' },
  readCard: { background:'#fafafa', borderLeft:'4px solid #eee' },
  notifIcon: { fontSize:'1.5rem', flexShrink:0 },
  notifBody: { flex:1 },
  notifContent: { color:'#1a1a2e', margin:0, marginBottom:'0.3rem', fontWeight:'500' },
  notifTime: { color:'#888', fontSize:'0.82rem' },
  unreadDot: { width:'10px', height:'10px', borderRadius:'50%', background:'#e94560', flexShrink:0 }
}
export default Notifications
