import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getUser, getAuthHeaders } from '../utils/auth'
import { colors, radius, shadow, font, fontDisplay } from '../theme'
const API = import.meta.env.VITE_API_URL

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
  const user = getUser()

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
      const res = await axios.get(`${API}/api/messages/${user.id}`)
      setMessages(res.data)
      groupConversations(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const groupConversations = (msgs) => {
    const convos = {}
    msgs.forEach(msg => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
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
        receiver_id: selectedConvo.other_id,
        listing_id: selectedConvo.listing_id
      }, { headers: getAuthHeaders() })
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
      <h3 style={styles.notLoggedTitle}>Please login to view messages</h3>
      <button style={styles.loginBtn} onClick={() => navigate('/login')} className="btn-hover">Login</button>
    </div>
  )

  const convoMessages = getConvoMessages()

  return (
    <div style={styles.page}>
      {!selectedConvo ? (
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Messages</h1>
          </div>
          {conversations.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💬</div>
              <h3 style={styles.emptyTitle}>No messages yet</h3>
              <p style={styles.emptyText}>Contact a seller from a listing to start chatting!</p>
              <button style={styles.browseBtn} onClick={() => navigate('/listings')} className="btn-hover">Browse Listings</button>
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
                <div key={msg.id} style={msg.sender_id === user.id ? styles.sentWrapper : styles.receivedWrapper}>
                  <div style={msg.sender_id === user.id ? styles.sentMsg : styles.receivedMsg}>
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
  page: { minHeight: '100vh', background: colors.bg, fontFamily: font.family },
  container: { maxWidth: '700px', margin: '0 auto', padding: '1.5rem' },
  header: { marginBottom: '1.25rem' },
  title: { fontFamily: fontDisplay, color: colors.text, fontSize: '1.6rem', margin: 0, fontWeight: 600 },
  convoList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  convoCard: { background: colors.surface, padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer', borderRadius: radius.md, border: `1px solid ${colors.border}` },
  convoAvatar: { width: '46px', height: '46px', borderRadius: '50%', background: colors.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 },
  convoInfo: { flex: 1, minWidth: 0 },
  convoName: { color: colors.text, fontWeight: 700, margin: '0 0 0.2rem', fontSize: '0.92rem' },
  convoLast: { color: colors.textMuted, fontSize: '0.82rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  convoTime: { color: colors.textFaint, fontSize: '0.72rem', flexShrink: 0 },
  chatPage: { display: 'flex', flexDirection: 'column', height: '100vh', background: colors.bg },
  chatHeader: { background: colors.surface, padding: '0.8rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { background: 'none', border: 'none', color: colors.accent, fontSize: '1.7rem', cursor: 'pointer', padding: 0, lineHeight: 1 },
  chatHeaderAvatar: { width: '34px', height: '34px', borderRadius: '50%', background: colors.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.86rem' },
  chatTitle: { color: colors.text, fontWeight: 700, fontSize: '0.95rem' },
  chatMessages: { flex: 1, padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', paddingBottom: '100px' },
  noMsgs: { textAlign: 'center', color: colors.textMuted, padding: '2rem', fontSize: '0.9rem' },
  sentWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' },
  receivedWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' },
  sentMsg: { background: colors.accent, color: 'white', padding: '0.6rem 0.95rem', borderRadius: '18px 18px 4px 18px', maxWidth: '75%' },
  receivedMsg: { background: colors.surface, color: colors.text, padding: '0.6rem 0.95rem', borderRadius: '18px 18px 18px 4px', maxWidth: '75%', border: `1px solid ${colors.border}` },
  msgContent: { margin: 0, fontSize: '0.92rem', lineHeight: 1.45 },
  msgTime: { color: colors.textFaint, fontSize: '0.68rem', padding: '0 0.5rem' },
  chatInput: { position: 'fixed', bottom: '92px', left: 0, right: 0, background: colors.surface, padding: '0.7rem 0.9rem', display: 'flex', gap: '0.6rem', alignItems: 'center', borderTop: `1px solid ${colors.border}`, maxWidth: '700px', margin: '0 auto' },
  inputField: { flex: 1, padding: '0.65rem 1.05rem', borderRadius: radius.pill, border: `1px solid ${colors.border}`, fontSize: '0.92rem', color: colors.text, outline: 'none', background: colors.bg, fontFamily: font.family },
  sendBtn: { width: '38px', height: '38px', borderRadius: '50%', background: colors.accent, color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emptyState: { textAlign: 'center', padding: '3rem 1rem' },
  emptyIcon: { fontSize: '2.6rem', marginBottom: '1rem' },
  emptyTitle: { fontFamily: fontDisplay, color: colors.text, marginBottom: '0.5rem', fontSize: '1.15rem', fontWeight: 600 },
  emptyText: { color: colors.textMuted, marginBottom: '1.5rem', fontSize: '0.9rem' },
  browseBtn: { background: colors.accent, color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700 },
  notLoggedIn: { textAlign: 'center', padding: '5rem 1.5rem' },
  notLoggedTitle: { fontFamily: fontDisplay, color: colors.text, fontWeight: 600 },
  loginBtn: { background: colors.accent, color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700, marginTop: '1rem' },
}

export default Messages
