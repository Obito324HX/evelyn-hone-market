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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
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
      <h3>Please login to view messages</h3>
      <button style={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
    </div>
  )

  const convoMessages = getConvoMessages()

  return (
    <div style={styles.page}>
      {!selectedConvo ? (
        <div style={styles.container}>
          <div style={styles.header}>
            <h2 style={styles.title}>Messages</h2>
          </div>
          {conversations.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💬</div>
              <h3 style={styles.emptyTitle}>No messages yet</h3>
              <p style={styles.emptyText}>Contact a seller from a listing to start chatting!</p>
              <button style={styles.browseBtn} onClick={() => navigate('/listings')}>Browse Listings</button>
            </div>
          ) : (
            <div style={styles.convoList}>
              {conversations.map((convo, i) => (
                <div key={i} style={styles.convoCard} onClick={() => setSelectedConvo(convo)}>
                  <div style={styles.convoAvatar}>{convo.other_id}</div>
                  <div style={styles.convoInfo}>
                    <p style={styles.convoName}>User #{convo.other_id}</p>
                    <p style={styles.convoLast}>{convo.lastMsg.content.substring(0, 40)}{convo.lastMsg.content.length > 40 ? '...' : ''}</p>
                  </div>
                  <small style={styles.convoTime}>{new Date(convo.lastMsg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={styles.chatPage}>
          <div style={styles.chatHeader}>
            <button style={styles.backBtn} onClick={() => setSelectedConvo(null)}>‹</button>
            <div style={styles.chatHeaderAvatar}>{selectedConvo.other_id}</div>
            <span style={styles.chatTitle}>User #{selectedConvo.other_id}</span>
          </div>
          <div style={styles.chatMessages}>
            {convoMessages.length === 0 ? (
              <div style={styles.noMsgs}><p>Send the first message!</p></div>
            ) : (
              convoMessages.map(msg => (
                <div key={msg.id} style={msg.sender_id === user.user_id ? styles.sentWrapper : styles.receivedWrapper}>
                  <div style={msg.sender_id === user.user_id ? styles.sentMsg : styles.receivedMsg}>
                    <p style={styles.msgContent}>{msg.content}</p>
                  </div>
                  <small style={styles.msgTime}>{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
                </div>
              ))
            )}
          </div>
          <div style={styles.chatInput}>
            <input
              style={styles.inputField}
              type="text"
              placeholder="Message..."
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button style={{...styles.sendBtn, opacity: content.trim() ? 1 : 0.5}} onClick={sendMessage}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight:'100vh', background:'#f5f5f5', fontFamily:'Arial, sans-serif' },
  container: { maxWidth:'700px', margin:'0 auto', padding:'1rem' },
  header: { marginBottom:'1rem' },
  title: { color:'#1a1a2e', fontSize:'1.5rem', margin:0 },
  convoList: { display:'flex', flexDirection:'column', gap:'0.2rem' },
  convoCard: { background:'white', padding:'0.9rem 1rem', display:'flex', alignItems:'center', gap:'0.9rem', cursor:'pointer', borderBottom:'1px solid #f0f0f0' },
  convoAvatar: { width:'48px', height:'48px', borderRadius:'50%', background:'#e94560', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'1rem', flexShrink:0 },
  convoInfo: { flex:1, minWidth:0 },
  convoName: { color:'#1a1a2e', fontWeight:'bold', margin:'0 0 0.2rem', fontSize:'0.95rem' },
  convoLast: { color:'#888', fontSize:'0.82rem', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  convoTime: { color:'#aaa', fontSize:'0.72rem', flexShrink:0 },
  chatPage: { display:'flex', flexDirection:'column', height:'100vh', background:'#f0f2f5' },
  chatHeader: { background:'white', padding:'0.7rem 1rem', display:'flex', alignItems:'center', gap:'0.8rem', boxShadow:'0 1px 4px rgba(0,0,0,0.1)', position:'sticky', top:0, zIndex:10 },
  backBtn: { background:'none', border:'none', color:'#e94560', fontSize:'1.8rem', cursor:'pointer', padding:'0', lineHeight:1 },
  chatHeaderAvatar: { width:'36px', height:'36px', borderRadius:'50%', background:'#e94560', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'0.9rem' },
  chatTitle: { color:'#1a1a2e', fontWeight:'bold', fontSize:'1rem' },
  chatMessages: { flex:1, padding:'1rem', display:'flex', flexDirection:'column', gap:'0.4rem', overflowY:'auto', paddingBottom:'80px' },
  noMsgs: { textAlign:'center', color:'#888', padding:'2rem', fontSize:'0.9rem' },
  sentWrapper: { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.1rem' },
  receivedWrapper: { display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'0.1rem' },
  sentMsg: { background:'#e94560', color:'white', padding:'0.6rem 0.9rem', borderRadius:'18px 18px 4px 18px', maxWidth:'75%' },
  receivedMsg: { background:'white', color:'#1a1a2e', padding:'0.6rem 0.9rem', borderRadius:'18px 18px 18px 4px', maxWidth:'75%', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' },
  msgContent: { margin:0, fontSize:'0.92rem', lineHeight:'1.4' },
  msgTime: { color:'#aaa', fontSize:'0.68rem', padding:'0 0.5rem' },
  chatInput: { position:'fixed', bottom:'65px', left:0, right:0, background:'white', padding:'0.6rem 0.8rem', display:'flex', gap:'0.6rem', alignItems:'center', boxShadow:'0 -1px 4px rgba(0,0,0,0.08)' },
  inputField: { flex:1, padding:'0.6rem 1rem', borderRadius:'20px', border:'1px solid #e0e0e0', fontSize:'0.95rem', color:'#1a1a2e', outline:'none', background:'#f5f5f5' },
  sendBtn: { width:'38px', height:'38px', borderRadius:'50%', background:'#e94560', color:'white', border:'none', cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  emptyState: { textAlign:'center', padding:'3rem 1rem' },
  emptyIcon: { fontSize:'3rem', marginBottom:'1rem' },
  emptyTitle: { color:'#1a1a2e', marginBottom:'0.5rem' },
  emptyText: { color:'#888', marginBottom:'1.5rem', fontSize:'0.9rem' },
  browseBtn: { background:'#e94560', color:'white', border:'none', padding:'0.8rem 2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  notLoggedIn: { textAlign:'center', padding:'5rem 1rem' },
  loginBtn: { background:'#e94560', color:'white', border:'none', padding:'0.8rem 2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', marginTop:'1rem' }
}

export default Messages
