import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Messages() {
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const sellerId = params.get('seller')
  const listingId = params.get('listing')
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (user) fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`https://evelyn-hone-market-production.up.railway.app/api/messages/${user.user_id}`)
      setMessages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const sendMessage = async () => {
    if (!user || !content.trim()) return
    try {
      await axios.post('https://evelyn-hone-market-production.up.railway.app/api/messages/', {
        content,
        sender_id: user.user_id,
        receiver_id: parseInt(sellerId),
        listing_id: parseInt(listingId)
      })
      setContent('')
      fetchMessages()
    } catch (err) {
      console.error(err)
    }
  }

  if (!user) return (
    <div style={styles.notLoggedIn}>
      <div style={styles.emptyIcon}>🔒</div>
      <h3 style={styles.emptyTitle}>Please login to view messages</h3>
      <button style={styles.loginBtn} onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  )

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Messages</h2>
          <span style={styles.count}>{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
        </div>
        {sellerId && (
          <div style={styles.compose}>
            <h3 style={styles.composeTitle}>Send a Message</h3>
            <textarea
              style={styles.textarea}
              placeholder="Write your message to the seller..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <div style={styles.composeFooter}>
              <span style={styles.charCount}>{content.length} characters</span>
              <button style={styles.sendBtn} onClick={sendMessage}>Send Message ➤</button>
            </div>
          </div>
        )}
        <div style={styles.messageList}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💬</div>
              <h3 style={styles.emptyTitle}>No messages yet</h3>
              <p style={styles.emptyText}>Browse listings and contact a seller to start a conversation!</p>
              <button style={styles.browseBtn} onClick={() => navigate('/listings')}>Browse Listings</button>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} style={msg.sender_id === user.user_id ? styles.sent : styles.received}>
                <p style={styles.msgContent}>{msg.content}</p>
                <small style={styles.time}>
                  {msg.sender_id === user.user_id ? 'You' : 'Seller'} • {new Date(msg.created_at).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight:'100vh', background:'#f5f5f5', padding:'2rem', fontFamily:'Arial, sans-serif' },
  container: { maxWidth:'800px', margin:'0 auto' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  title: { color:'#1a1a2e', fontSize:'1.8rem', margin:0 },
  count: { background:'#e94560', color:'white', padding:'0.3rem 0.8rem', borderRadius:'20px', fontSize:'0.85rem' },
  compose: { background:'white', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  composeTitle: { color:'#1a1a2e', marginBottom:'1rem', fontSize:'1rem' },
  textarea: { width:'100%', padding:'1rem', borderRadius:'8px', border:'2px solid #eee', fontSize:'1rem', boxSizing:'border-box', height:'120px', resize:'vertical', outline:'none', background:'#fafafa' },
  composeFooter: { display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.8rem' },
  charCount: { color:'#aaa', fontSize:'0.85rem' },
  sendBtn: { background:'#e94560', color:'white', border:'none', padding:'0.7rem 1.5rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  messageList: { display:'flex', flexDirection:'column', gap:'1rem' },
  sent: { background:'#e94560', color:'white', padding:'1rem 1.2rem', borderRadius:'12px 12px 4px 12px', alignSelf:'flex-end', maxWidth:'70%', boxShadow:'0 2px 8px rgba(233,69,96,0.3)' },
  received: { background:'white', padding:'1rem 1.2rem', borderRadius:'12px 12px 12px 4px', alignSelf:'flex-start', maxWidth:'70%', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  msgContent: { margin:'0 0 0.4rem 0', lineHeight:'1.5' },
  time: { opacity:0.7, fontSize:'0.78rem' },
  emptyState: { textAlign:'center', padding:'4rem 2rem', background:'white', borderRadius:'12px', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  emptyIcon: { fontSize:'3.5rem', marginBottom:'1rem' },
  emptyTitle: { color:'#1a1a2e', fontSize:'1.3rem', marginBottom:'0.5rem' },
  emptyText: { color:'#888', marginBottom:'1.5rem' },
  browseBtn: { background:'#e94560', color:'white', border:'none', padding:'0.8rem 2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  notLoggedIn: { textAlign:'center', padding:'5rem 2rem' },
  loginBtn: { background:'#e94560', color:'white', border:'none', padding:'0.8rem 2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', marginTop:'1rem' }
}

export default Messages
