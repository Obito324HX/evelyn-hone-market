import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://evelyn-hone-market-production.up.railway.app'

function Messages() {
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [conversations, setConversations] = useState([])
  const [selectedConvo, setSelectedConvo] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const sellerId = params.get('seller')
  const listingId = params.get('listing')
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (user) fetchMessages()
  }, [])

  useEffect(() => {
    if (sellerId) {
      setSelectedConvo({ other_id: parseInt(sellerId), listing_id: parseInt(listingId) })
    }
  }, [sellerId])

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/api/messages/${user.user_id}`)
      setMessages(res.data)
      groupConversations(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const groupConversations = (msgs) => {
    const convos = {}
    msgs.forEach(msg => {
      const otherId = msg.sender_id === user.user_id ? msg.receiver_id : msg.sender_id
      const key = `${otherId}_${msg.listing_id}`
      if (!convos[key]) {
        convos[key] = { other_id: otherId, listing_id: msg.listing_id, messages: [], lastMsg: msg }
      }
      convos[key].messages.push(msg)
      if (new Date(msg.created_at) > new Date(convos[key].lastMsg.created_at)) {
        convos[key].lastMsg = msg
      }
    })
    setConversations(Object.values(convos))
  }

  const sendMessage = async () => {
    if (!user || !content.trim() || !selectedConvo) return
    try {
      await axios.post(`${API}/api/messages/`, {
        content,
        sender_id: user.user_id,
        receiver_id: selectedConvo.other_id,
        listing_id: selectedConvo.listing_id
      })
      setContent('')
      fetchMessages()
    } catch (err) {
      console.error(err)
    }
  }

  const getConvoMessages = () => {
    if (!selectedConvo) return []
    return messages.filter(m =>
      m.listing_id === selectedConvo.listing_id &&
      (m.sender_id === selectedConvo.other_id || m.receiver_id === selectedConvo.other_id)
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }

  if (!user) return (
    <div style={styles.notLoggedIn}>
      <div style={styles.emptyIcon}>🔒</div>
      <h3 style={styles.emptyTitle}>Please login to view messages</h3>
      <button style={styles.loginBtn} onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  )

  const convoMessages = getConvoMessages()

  return (
    <div style={styles.page}>
      {!selectedConvo ? (
        <div style={styles.container}>
          <div style={styles.header}>
            <h2 style={styles.title}>Messages</h2>
            <span style={styles.count}>{messages.length} total</span>
          </div>
          {conversations.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💬</div>
              <h3 style={styles.emptyTitle}>No messages yet</h3>
              <p style={styles.emptyText}>Browse listings and contact a seller to start a conversation!</p>
              <button style={styles.browseBtn} onClick={() => navigate('/listings')}>Browse Listings</button>
            </div>
          ) : (
            <div style={styles.convoList}>
              {conversations.map((convo, i) => (
                <div key={i} style={styles.convoCard} onClick={() => setSelectedConvo(convo)}>
                  <div style={styles.convoAvatar}>{convo.other_id}</div>
                  <div style={styles.convoInfo}>
                    <p style={styles.convoName}>User #{convo.other_id}</p>
                    <p style={styles.convoLast}>{convo.lastMsg.content.substring(0, 50)}...</p>
                    <small style={styles.convoTime}>{new Date(convo.lastMsg.created_at).toLocaleString()}</small>
                  </div>
                  <span style={styles.convoArrow}>›</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={styles.chatPage}>
          <div style={styles.chatHeader}>
            <button style={styles.backBtn} onClick={() => setSelectedConvo(null)}>← Back</button>
            <span style={styles.chatTitle}>User #{selectedConvo.other_id}</span>
          </div>
          <div style={styles.chatMessages}>
            {convoMessages.length === 0 ? (
              <div style={styles.noMsgs}>
                <p>No messages yet. Send the first one!</p>
              </div>
            ) : (
              convoMessages.map(msg => (
                <div key={msg.id} style={msg.sender_id === user.user_id ? styles.sentMsg : styles.receivedMsg}>
                  <p style={styles.msgContent}>{msg.content}</p>
                  <small style={styles.msgTime}>{new Date(msg.created_at).toLocaleTimeString()}</small>
                </div>
              ))
            )}
          </div>
          <div style={styles.chatInput}>
            <textarea
              style={styles.textarea}
              placeholder="Type a message..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={2}
            />
            <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight:'100vh', background:'#f5f5f5', fontFamily:'Arial, sans-serif' },
  container: { maxWidth:'700px', margin:'0 auto', padding:'1.5rem' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  title: { color:'#1a1a2e', fontSize:'1.5rem', margin:0 },
  count: { background:'#e94560', color:'white', padding:'0.3rem 0.8rem', borderRadius:'20px', fontSize:'0.85rem' },
  convoList: { display:'flex', flexDirection:'column', gap:'0.8rem' },
  convoCard: { background:'white', borderRadius:'12px', padding:'1rem', display:'flex', alignItems:'center', gap:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', cursor:'pointer' },
  convoAvatar: { width:'44px', height:'44px', borderRadius:'50%', background:'#e94560', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', flexShrink:0 },
  convoInfo: { flex:1 },
  convoName: { color:'#1a1a2e', fontWeight:'bold', margin:'0 0 0.3rem' },
  convoLast: { color:'#888', fontSize:'0.85rem', margin:'0 0 0.2rem' },
  convoTime: { color:'#aaa', fontSize:'0.75rem' },
  convoArrow: { color:'#888', fontSize:'1.5rem' },
  chatPage: { display:'flex', flexDirection:'column', height:'100vh' },
  chatHeader: { background:'#1a1a2e', padding:'1rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem', position:'sticky', top:0 },
  backBtn: { background:'none', border:'none', color:'white', fontSize:'1rem', cursor:'pointer', padding:'0.3rem' },
  chatTitle: { color:'white', fontWeight:'bold' },
  chatMessages: { flex:1, padding:'1rem', display:'flex', flexDirection:'column', gap:'0.8rem', overflowY:'auto', paddingBottom:'100px' },
  noMsgs: { textAlign:'center', color:'#888', padding:'2rem' },
  sentMsg: { background:'#e94560', color:'white', padding:'0.8rem 1rem', borderRadius:'12px 12px 4px 12px', alignSelf:'flex-end', maxWidth:'75%' },
  receivedMsg: { background:'white', padding:'0.8rem 1rem', borderRadius:'12px 12px 12px 4px', alignSelf:'flex-start', maxWidth:'75%', boxShadow:'0 2px 5px rgba(0,0,0,0.08)' },
  msgContent: { margin:'0 0 0.3rem', lineHeight:'1.4' },
  msgTime: { opacity:0.7, fontSize:'0.72rem' },
  chatInput: { position:'fixed', bottom:'70px', left:0, right:0, background:'white', padding:'0.8rem 1rem', display:'flex', gap:'0.8rem', boxShadow:'0 -2px 8px rgba(0,0,0,0.1)', alignItems:'flex-end' },
  textarea: { flex:1, padding:'0.7rem', borderRadius:'8px', border:'2px solid #eee', fontSize:'0.95rem', resize:'none', color:'#1a1a2e', outline:'none' },
  sendBtn: { background:'#e94560', color:'white', border:'none', padding:'0.7rem 1.2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', whiteSpace:'nowrap' },
  emptyState: { textAlign:'center', padding:'3rem 1rem', background:'white', borderRadius:'12px', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  emptyIcon: { fontSize:'3.5rem', marginBottom:'1rem' },
  emptyTitle: { color:'#1a1a2e', fontSize:'1.2rem', marginBottom:'0.5rem' },
  emptyText: { color:'#888', marginBottom:'1.5rem', lineHeight:'1.6' },
  browseBtn: { background:'#e94560', color:'white', border:'none', padding:'0.8rem 2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  notLoggedIn: { textAlign:'center', padding:'5rem 1rem' },
  loginBtn: { background:'#e94560', color:'white', border:'none', padding:'0.8rem 2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', marginTop:'1rem' }
}

export default Messages
