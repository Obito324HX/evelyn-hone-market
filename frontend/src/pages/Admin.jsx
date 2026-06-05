import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const ADMIN_KEY = 'evelyn-hone-admin-2026'
const headers = { 'X-Admin-Key': ADMIN_KEY }

function Admin() {
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [reports, setReports] = useState([])
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (loggedIn) {
      fetchStats()
      fetchUsers()
      fetchListings()
      fetchReports()
    }
  }, [loggedIn])

  const handleLogin = () => {
    if (password === 'admin2026') {
      setLoggedIn(true)
      setError('')
    } else {
      setError('Incorrect admin password!')
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/admin/stats', { headers })
      setStats(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/admin/users', { headers })
      setUsers(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchListings = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/admin/listings', { headers })
      setListings(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchReports = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/admin/reports', { headers })
      setReports(res.data)
    } catch (err) { console.error(err) }
  }

  const verifyUser = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/admin/users/${id}/verify`, {}, { headers })
      fetchUsers()
    } catch (err) { console.error(err) }
  }

  const approveSeller = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/admin/users/${id}/approve-seller`, {}, { headers })
      fetchUsers()
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await axios.delete(`http://127.0.0.1:5000/api/admin/users/${id}`, { headers })
      fetchUsers()
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing?')) return
    try {
      await axios.delete(`http://127.0.0.1:5000/api/admin/listings/${id}`, { headers })
      fetchListings()
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const dismissReport = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/admin/reports/${id}`, { headers })
      fetchReports()
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const deleteReportedListing = async (listingId, reportId) => {
    if (!window.confirm('Delete this listing and dismiss the report?')) return
    try {
      await axios.delete(`http://127.0.0.1:5000/api/admin/listings/${listingId}`, { headers })
      await axios.delete(`http://127.0.0.1:5000/api/admin/reports/${reportId}`, { headers })
      fetchReports()
      fetchListings()
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const pendingSellers = users.filter(u => u.student_id && !u.seller_approved)

  if (!loggedIn) return (
    <div style={styles.loginPage}>
      <div style={styles.loginCard}>
        <div style={styles.loginIcon}>🔐</div>
        <h2 style={styles.loginTitle}>Admin Panel</h2>
        <p style={styles.loginSubtitle}>Evelyn Hone Market</p>
        {error && <div style={styles.errorBox}>{error}</div>}
        <input
          style={styles.loginInput}
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <button style={styles.loginBtn} onClick={handleLogin}>Login as Admin</button>
        <button style={styles.backLink} onClick={() => navigate('/')}>← Back to Market</button>
      </div>
    </div>
  )

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>🛡 Admin</h2>
          <p style={styles.sidebarSubtitle}>Evelyn Hone Market</p>
        </div>
        {[
          { key:'stats', label:'📊 Dashboard' },
          { key:'sellers', label:`🏪 Seller Requests ${pendingSellers.length > 0 ? `(${pendingSellers.length})` : ''}` },
          { key:'users', label:'👥 Users' },
          { key:'listings', label:'📦 Listings' },
          { key:'reports', label:`🚩 Reports ${reports.length > 0 ? `(${reports.length})` : ''}` }
        ].map(t => (
          <button
            key={t.key}
            style={{...styles.sidebarBtn, ...(tab === t.key ? styles.activeSidebarBtn : {})}}
            onClick={() => setTab(t.key)}
          >{t.label}</button>
        ))}
        <button style={styles.logoutBtn} onClick={() => navigate('/')}>← Back to Market</button>
      </div>
      <div style={styles.content}>
        {tab === 'stats' && stats && (
          <div>
            <h2 style={styles.pageTitle}>Dashboard</h2>
            {pendingSellers.length > 0 && (
              <div style={styles.alertBanner}>
                ⚠️ {pendingSellers.length} seller request{pendingSellers.length > 1 ? 's' : ''} pending approval!
                <button style={styles.alertBtn} onClick={() => setTab('sellers')}>Review Now</button>
              </div>
            )}
            <div style={styles.statsGrid}>
              {[
                { icon:'👥', value: stats.total_users, label:'Total Users' },
                { icon:'📦', value: stats.total_listings, label:'Total Listings' },
                { icon:'💬', value: stats.total_messages, label:'Messages' },
                { icon:'🚩', value: stats.total_reports, label:'Reports' },
                { icon:'⏳', value: stats.pending_sellers, label:'Pending Sellers' },
                { icon:'✅', value: stats.available, label:'Available' },
                { icon:'🔒', value: stats.reserved, label:'Reserved' },
                { icon:'💰', value: stats.sold, label:'Sold' },
              ].map((s, i) => (
                <div key={i} style={styles.statCard}>
                  <div style={styles.statIcon}>{s.icon}</div>
                  <div style={styles.statNumber}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'sellers' && (
          <div>
            <h2 style={styles.pageTitle}>Seller Requests ({pendingSellers.length})</h2>
            {pendingSellers.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{fontSize:'3rem'}}>✅</div>
                <p>No pending seller requests!</p>
              </div>
            ) : (
              <div style={styles.sellerRequestsList}>
                {pendingSellers.map(u => (
                  <div key={u.id} style={styles.sellerRequestCard}>
                    <div style={styles.sellerRequestHeader}>
                      <div style={styles.sellerAvatar}>{u.username[0].toUpperCase()}</div>
                      <div>
                        <p style={styles.sellerName}>{u.username}</p>
                        <p style={styles.sellerEmail}>{u.email}</p>
                      </div>
                      <div style={styles.studentIdBadge}>
                        🎓 {u.student_id}
                      </div>
                    </div>
                    <div style={styles.sellerRequestActions}>
                      <button style={styles.approveBtn} onClick={() => approveSeller(u.id)}>
                        ✅ Approve Seller
                      </button>
                      <button style={styles.rejectBtn} onClick={() => deleteUser(u.id)}>
                        ❌ Reject & Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'users' && (
          <div>
            <h2 style={styles.pageTitle}>All Users ({users.length})</h2>
            <div style={styles.table}>
              <div style={{...styles.tableHeader, gridTemplateColumns:'0.3fr 0.8fr 1.2fr 0.8fr 0.8fr 0.8fr 1.2fr'}}>
                <span>ID</span><span>Username</span><span>Email</span>
                <span>Student ID</span><span>Verified</span><span>Seller</span><span>Actions</span>
              </div>
              {users.map(u => (
                <div key={u.id} style={{...styles.tableRow, gridTemplateColumns:'0.3fr 0.8fr 1.2fr 0.8fr 0.8fr 0.8fr 1.2fr'}}>
                  <span style={styles.tableCell}>#{u.id}</span>
                  <span style={styles.tableCell}>
                    {u.username}
                    {u.verified && <span style={styles.verifiedBadge}>✓</span>}
                  </span>
                  <span style={styles.tableCell}>{u.email}</span>
                  <span style={styles.tableCell}>{u.student_id || '—'}</span>
                  <span style={styles.tableCell}>
                    <span style={{...styles.statusDot, background: u.verified ? '#27ae60' : '#aaa'}}></span>
                    {u.verified ? 'Yes' : 'No'}
                  </span>
                  <span style={styles.tableCell}>
                    <span style={{...styles.statusDot, background: u.seller_approved ? '#27ae60' : u.student_id ? '#f39c12' : '#aaa'}}></span>
                    {u.seller_approved ? 'Approved' : u.student_id ? 'Pending' : 'No'}
                  </span>
                  <span style={styles.tableCell}>
                    <button style={{...styles.actionBtn, background: u.verified ? '#f39c12' : '#27ae60'}} onClick={() => verifyUser(u.id)}>
                      {u.verified ? 'Unverify' : 'Verify'}
                    </button>
                    {u.student_id && (
                      <button style={{...styles.actionBtn, background: u.seller_approved ? '#f39c12' : '#27ae60'}} onClick={() => approveSeller(u.id)}>
                        {u.seller_approved ? 'Revoke' : 'Approve'}
                      </button>
                    )}
                    <button style={{...styles.actionBtn, background:'#e94560'}} onClick={() => deleteUser(u.id)}>Del</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'listings' && (
          <div>
            <h2 style={styles.pageTitle}>Listings ({listings.length})</h2>
            <div style={styles.table}>
              <div style={{...styles.tableHeader, gridTemplateColumns:'0.5fr 1fr 0.8fr 1fr 0.8fr 0.5fr 0.8fr'}}>
                <span>ID</span><span>Title</span><span>Price</span>
                <span>Category</span><span>Status</span><span>Seller</span><span>Actions</span>
              </div>
              {listings.map(l => (
                <div key={l.id} style={{...styles.tableRow, gridTemplateColumns:'0.5fr 1fr 0.8fr 1fr 0.8fr 0.5fr 0.8fr'}}>
                  <span style={styles.tableCell}>#{l.id}</span>
                  <span style={styles.tableCell}>{l.title}</span>
                  <span style={styles.tableCell}>K{l.price}</span>
                  <span style={styles.tableCell}>{l.category}</span>
                  <span style={styles.tableCell}>
                    <span style={{...styles.statusPill, background: l.status === 'available' ? '#27ae60' : l.status === 'reserved' ? '#f39c12' : '#333'}}>
                      {l.status}
                    </span>
                  </span>
                  <span style={styles.tableCell}>#{l.seller_id}</span>
                  <span style={styles.tableCell}>
                    <button style={{...styles.actionBtn, background:'#e94560'}} onClick={() => deleteListing(l.id)}>Delete</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'reports' && (
          <div>
            <h2 style={styles.pageTitle}>Reports ({reports.length})</h2>
            {reports.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{fontSize:'3rem'}}>✅</div>
                <p>No reports at the moment. The marketplace is clean!</p>
              </div>
            ) : (
              <div style={styles.reportsList}>
                {reports.map(r => (
                  <div key={r.id} style={styles.reportCard}>
                    <div style={styles.reportCardHeader}>
                      <span style={styles.reportBadge}>🚩 Report #{r.id}</span>
                      <small style={{color:'#888'}}>{new Date(r.created_at).toLocaleDateString()}</small>
                    </div>
                    <div style={styles.reportDetails}>
                      <p style={styles.reportReason}><strong>Reason:</strong> {r.reason}</p>
                      <p style={styles.reportMeta}>Listing #{r.listing_id} reported by User #{r.reporter_id}</p>
                    </div>
                    <div style={styles.reportActions}>
                      <button style={styles.dismissBtn} onClick={() => dismissReport(r.id)}>Dismiss</button>
                      <button style={styles.deleteListingBtn} onClick={() => deleteReportedListing(r.listing_id, r.id)}>Delete Listing</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  loginPage: { minHeight:'100vh', background:'#1a1a2e', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Arial, sans-serif' },
  loginCard: { background:'white', borderRadius:'12px', padding:'2.5rem', width:'100%', maxWidth:'400px', textAlign:'center', boxShadow:'0 10px 30px rgba(0,0,0,0.3)' },
  loginIcon: { fontSize:'3rem', marginBottom:'1rem' },
  loginTitle: { color:'#1a1a2e', marginBottom:'0.3rem' },
  loginSubtitle: { color:'#888', marginBottom:'1.5rem', fontSize:'0.9rem' },
  errorBox: { background:'#fff0f0', border:'1px solid #e94560', color:'#e94560', padding:'0.8rem', borderRadius:'8px', marginBottom:'1rem' },
  loginInput: { width:'100%', padding:'0.9rem', borderRadius:'8px', border:'2px solid #eee', fontSize:'1rem', boxSizing:'border-box', marginBottom:'1rem', color:'#1a1a2e', outline:'none' },
  loginBtn: { width:'100%', padding:'0.9rem', background:'#e94560', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem', marginBottom:'1rem' },
  backLink: { background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:'0.9rem' },
  page: { display:'flex', minHeight:'100vh', fontFamily:'Arial, sans-serif' },
  sidebar: { width:'240px', background:'#1a1a2e', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'0.5rem' },
  sidebarHeader: { marginBottom:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'1rem' },
  sidebarTitle: { color:'white', margin:0, fontSize:'1.2rem' },
  sidebarSubtitle: { color:'#888', fontSize:'0.8rem', margin:0 },
  sidebarBtn: { background:'transparent', color:'#ccc', border:'none', padding:'0.8rem 1rem', borderRadius:'8px', cursor:'pointer', textAlign:'left', fontSize:'0.9rem' },
  activeSidebarBtn: { background:'rgba(233,69,96,0.2)', color:'#e94560' },
  logoutBtn: { background:'transparent', color:'#888', border:'1px solid #444', padding:'0.7rem', borderRadius:'8px', cursor:'pointer', marginTop:'auto', fontSize:'0.9rem' },
  content: { flex:1, padding:'2rem', background:'#f5f5f5', overflowY:'auto' },
  pageTitle: { color:'#1a1a2e', marginBottom:'1.5rem', fontSize:'1.5rem' },
  alertBanner: { background:'#fff9e6', border:'1px solid #f39c12', borderRadius:'8px', padding:'1rem', marginBottom:'1.5rem', color:'#856404', display:'flex', alignItems:'center', justifyContent:'space-between' },
  alertBtn: { background:'#f39c12', color:'white', border:'none', padding:'0.5rem 1rem', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'1rem' },
  statCard: { background:'white', borderRadius:'12px', padding:'1.5rem', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  statIcon: { fontSize:'2rem', marginBottom:'0.5rem' },
  statNumber: { fontSize:'2rem', fontWeight:'bold', color:'#e94560' },
  statLabel: { color:'#888', fontSize:'0.85rem', marginTop:'0.3rem' },
  sellerRequestsList: { display:'flex', flexDirection:'column', gap:'1rem' },
  sellerRequestCard: { background:'white', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  sellerRequestHeader: { display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' },
  sellerAvatar: { width:'44px', height:'44px', borderRadius:'50%', background:'#e94560', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'1.2rem', flexShrink:0 },
  sellerName: { color:'#1a1a2e', fontWeight:'bold', margin:0 },
  sellerEmail: { color:'#888', fontSize:'0.85rem', margin:0 },
  studentIdBadge: { marginLeft:'auto', background:'#f0f0f0', padding:'0.5rem 1rem', borderRadius:'8px', color:'#1a1a2e', fontWeight:'bold', fontSize:'0.9rem' },
  sellerRequestActions: { display:'flex', gap:'1rem' },
  approveBtn: { flex:1, padding:'0.8rem', background:'#27ae60', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  rejectBtn: { flex:1, padding:'0.8rem', background:'#e94560', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  table: { background:'white', borderRadius:'12px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  tableHeader: { display:'grid', gap:'0.5rem', padding:'1rem 1.5rem', background:'#1a1a2e', color:'white', fontSize:'0.82rem', fontWeight:'bold' },
  tableRow: { display:'grid', gap:'0.5rem', padding:'1rem 1.5rem', borderBottom:'1px solid #eee', alignItems:'center' },
  tableCell: { color:'#444', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:'0.3rem', flexWrap:'wrap' },
  verifiedBadge: { background:'#27ae60', color:'white', padding:'0.1rem 0.4rem', borderRadius:'10px', fontSize:'0.7rem' },
  statusDot: { width:'8px', height:'8px', borderRadius:'50%', display:'inline-block' },
  statusPill: { color:'white', padding:'0.2rem 0.6rem', borderRadius:'20px', fontSize:'0.75rem' },
  actionBtn: { color:'white', border:'none', padding:'0.3rem 0.5rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.75rem', marginRight:'0.2rem' },
  emptyState: { textAlign:'center', padding:'4rem', background:'white', borderRadius:'12px', color:'#888' },
  reportsList: { display:'flex', flexDirection:'column', gap:'1rem' },
  reportCard: { background:'white', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  reportCardHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' },
  reportBadge: { background:'#fff0f0', color:'#e94560', padding:'0.3rem 0.8rem', borderRadius:'20px', fontSize:'0.85rem', fontWeight:'bold' },
  reportDetails: { marginBottom:'1rem' },
  reportReason: { color:'#1a1a2e', marginBottom:'0.3rem' },
  reportMeta: { color:'#888', fontSize:'0.85rem' },
  reportActions: { display:'flex', gap:'1rem' },
  dismissBtn: { padding:'0.6rem 1.2rem', background:'#f5f5f5', color:'#555', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  deleteListingBtn: { padding:'0.6rem 1.2rem', background:'#e94560', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }
}

export default Admin
