import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { colors, radius, shadow, font, fontDisplay } from '../theme'

const API = import.meta.env.VITE_API_URL
const ADMIN_KEY = 'evelyn-hone-admin-2026'
const headers = { 'X-Admin-Key': ADMIN_KEY }

function Admin() {
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [reports, setReports] = useState([])
  const [categories, setCategories] = useState([])
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('📦')
  const [catMsg, setCatMsg] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('admin_accounts')
    return saved ? JSON.parse(saved) : [{ username: 'Admin', password: 'admin2026' }]
  })
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminPass, setNewAdminPass] = useState('')
  const [adminMsg, setAdminMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (loggedIn) {
      fetchStats()
      fetchUsers()
      fetchListings()
      fetchReports()
      fetchCategories()
    }
  }, [loggedIn])

  const handleLogin = () => {
    const found = admins.find(a => a.password === password)
    if (found) { setLoggedIn(true); setError('') }
    else setError('Incorrect admin password!')
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/stats`, { headers })
      setStats(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/users`, { headers })
      setUsers(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/listings`, { headers })
      setListings(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/reports`, { headers })
      setReports(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/categories/`)
      setCategories(res.data)
    } catch (err) { console.error(err) }
  }

  const addCategory = async () => {
    if (!newCatName.trim()) { setCatMsg('❌ Name is required'); return }
    try {
      await axios.post(`${API}/api/categories/`, { name: newCatName.trim(), icon: newCatIcon })
      setCatMsg(`✅ "${newCatName}" added!`)
      setNewCatName('')
      setNewCatIcon('📦')
      fetchCategories()
    } catch (err) {
      setCatMsg(`❌ ${err.response?.data?.error || 'Failed to add category'}`)
    }
  }

  const deleteCategory = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? Existing listings with this category won't be affected.`)) return
    try {
      await axios.delete(`${API}/api/categories/${id}`)
      setCatMsg(`✅ "${name}" deleted!`)
      fetchCategories()
    } catch (err) { console.error(err) }
  }

  const verifyUser = async (id) => {
    try {
      await axios.put(`${API}/api/admin/users/${id}/verify`, {}, { headers })
      fetchUsers()
    } catch (err) { console.error(err) }
  }

  const approveSeller = async (id) => {
    try {
      await axios.put(`${API}/api/admin/users/${id}/approve-seller`, {}, { headers })
      fetchUsers()
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await axios.delete(`${API}/api/admin/users/${id}`, { headers })
      fetchUsers()
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing?')) return
    try {
      await axios.delete(`${API}/api/admin/listings/${id}`, { headers })
      fetchListings()
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const dismissReport = async (id) => {
    try {
      await axios.delete(`${API}/api/admin/reports/${id}`, { headers })
      fetchReports()
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const deleteReportedListing = async (listingId, reportId) => {
    if (!window.confirm('Delete this listing and dismiss the report?')) return
    try {
      await axios.delete(`${API}/api/admin/listings/${listingId}`, { headers })
      await axios.delete(`${API}/api/admin/reports/${reportId}`, { headers })
      fetchReports()
      fetchListings()
      fetchStats()
    } catch (err) { console.error(err) }
  }

  const changePassword = () => {
    if (!newPassword || newPassword !== confirmPassword) { setPasswordMsg('❌ Passwords do not match!'); return }
    const updated = admins.map((a, i) => i === 0 ? { ...a, password: newPassword } : a)
    setAdmins(updated)
    localStorage.setItem('admin_accounts', JSON.stringify(updated))
    setPasswordMsg('✅ Password changed!')
    setNewPassword('')
    setConfirmPassword('')
  }

  const addAdmin = () => {
    if (!newAdminName || !newAdminPass) { setAdminMsg('❌ Fill in both fields!'); return }
    const updated = [...admins, { username: newAdminName, password: newAdminPass }]
    setAdmins(updated)
    localStorage.setItem('admin_accounts', JSON.stringify(updated))
    setAdminMsg(`✅ Admin "${newAdminName}" added!`)
    setNewAdminName('')
    setNewAdminPass('')
  }

  const removeAdmin = (index) => {
    if (index === 0) { setAdminMsg('❌ Cannot remove main admin!'); return }
    const updated = admins.filter((_, i) => i !== index)
    setAdmins(updated)
    localStorage.setItem('admin_accounts', JSON.stringify(updated))
    setAdminMsg('✅ Admin removed!')
  }

  const pendingSellers = users.filter(u => u.student_id && !u.seller_approved)

  const tabs = [
    { key:'stats', label:'📊 Dashboard' },
    { key:'sellers', label:`🏪 Sellers ${pendingSellers.length > 0 ? `(${pendingSellers.length})` : ''}` },
    { key:'users', label:'👥 Users' },
    { key:'listings', label:'📦 Listings' },
    { key:'categories', label:'🗂 Categories' },
    { key:'reports', label:`🚩 Reports ${reports.length > 0 ? `(${reports.length})` : ''}` },
    { key:'settings', label:'⚙️ Settings' }
  ]

  const commonIcons = ['📦','💻','📚','👕','🍱','🔧','🏠','🚗','💄','⚽','🎵','📱','🛋','📷','💡','🧴','👟','🎒']

  if (!loggedIn) return (
    <div style={styles.loginPage}>
      <div style={styles.loginCard}>
        <div style={styles.loginIcon}>🔐</div>
        <h2 style={styles.loginTitle}>Admin Panel</h2>
        <p style={styles.loginSubtitle}>Evelyn Hone Market</p>
        {error && <div style={styles.errorBox}>{error}</div>}
        <input style={styles.loginInput} type="password" placeholder="Enter admin password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <button style={styles.loginBtn} onClick={handleLogin} className="btn-hover">Login as Admin</button>
        <button style={styles.backLink} onClick={() => navigate('/')}>← Back to Market</button>
      </div>
    </div>
  )

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <button style={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <span style={styles.topBarTitle}>🛡 Admin Panel</span>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Market</button>
      </div>
      {sidebarOpen && (
        <div style={styles.sidebar}>
          {tabs.map(t => (
            <button key={t.key} style={{...styles.sidebarBtn, ...(tab === t.key ? styles.activeSidebarBtn : {})}}
              onClick={() => { setTab(t.key); setSidebarOpen(false) }}>
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div style={styles.content}>
        {tab === 'stats' && stats && (
          <div>
            <h2 style={styles.pageTitle}>Dashboard</h2>
            {pendingSellers.length > 0 && (
              <div style={styles.alertBanner}>
                ⚠️ {pendingSellers.length} seller request{pendingSellers.length > 1 ? 's' : ''} pending!
                <button style={styles.alertBtn} onClick={() => setTab('sellers')}>Review</button>
              </div>
            )}
            <div style={styles.statsGrid}>
              {[
                { icon:'👥', value: stats.total_users, label:'Users' },
                { icon:'📦', value: stats.total_listings, label:'Listings' },
                { icon:'💬', value: stats.total_messages, label:'Messages' },
                { icon:'🚩', value: stats.total_reports, label:'Reports' },
                { icon:'⏳', value: stats.pending_sellers, label:'Pending' },
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
              <div style={styles.emptyState}><div style={{fontSize:'3rem'}}>✅</div><p>No pending requests!</p></div>
            ) : (
              <div style={styles.cardList}>
                {pendingSellers.map(u => (
                  <div key={u.id} style={styles.sellerCard}>
                    <div style={styles.sellerInfo}>
                      <div style={styles.sellerAvatar}>{u.username[0].toUpperCase()}</div>
                      <div>
                        <p style={styles.sellerName}>{u.username}</p>
                        <p style={styles.sellerEmail}>{u.email}</p>
                        <p style={styles.studentId}>🎓 {u.student_id}</p>
                      </div>
                    </div>
                    <div style={styles.sellerActions}>
                      <button style={styles.approveBtn} onClick={() => approveSeller(u.id)}>✅ Approve</button>
                      <button style={styles.rejectBtn} onClick={() => deleteUser(u.id)}>❌ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'users' && (
          <div>
            <h2 style={styles.pageTitle}>Users ({users.length})</h2>
            <div style={styles.cardList}>
              {users.map(u => (
                <div key={u.id} style={styles.userCard}>
                  <div style={styles.userInfo}>
                    <div style={styles.userAvatar}>{u.username[0].toUpperCase()}</div>
                    <div>
                      <p style={styles.userName}>{u.username} {u.verified && <span style={styles.vBadge}>✓</span>}</p>
                      <p style={styles.userEmail}>{u.email}</p>
                      <p style={styles.userMeta}>ID: {u.student_id || '—'} | Seller: {u.seller_approved ? '✅' : u.student_id ? '⏳' : '❌'}</p>
                    </div>
                  </div>
                  <div style={styles.userActions}>
                    <button style={{...styles.smallBtn, background: u.verified ? '#D97706' : '#22C55E'}} onClick={() => verifyUser(u.id)}>
                      {u.verified ? 'Unverify' : 'Verify'}
                    </button>
                    {u.student_id && (
                      <button style={{...styles.smallBtn, background: u.seller_approved ? '#D97706' : '#22C55E'}} onClick={() => approveSeller(u.id)}>
                        {u.seller_approved ? 'Revoke' : 'Approve'}
                      </button>
                    )}
                    <button style={{...styles.smallBtn, background: colors.accent}} onClick={() => deleteUser(u.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'listings' && (
          <div>
            <h2 style={styles.pageTitle}>Listings ({listings.length})</h2>
            <div style={styles.cardList}>
              {listings.map(l => (
                <div key={l.id} style={styles.listingCard}>
                  <div>
                    <p style={styles.listingTitle}>{l.title}</p>
                    <p style={styles.listingMeta}>K{l.price} | {l.category} | Seller #{l.seller_id}</p>
                    <span style={{...styles.statusPill, background: l.status === 'available' ? '#22C55E' : l.status === 'reserved' ? '#D97706' : colors.ink}}>
                      {l.status}
                    </span>
                  </div>
                  <button style={{...styles.smallBtn, background: colors.accent}} onClick={() => deleteListing(l.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'categories' && (
          <div>
            <h2 style={styles.pageTitle}>🗂 Category Management</h2>
            <div style={styles.settingsCard}>
              <h3 style={styles.settingsTitle}>Add New Category</h3>
              <div>
                <input
                  style={styles.settingsInput}
                  type="text"
                  placeholder="Category name (e.g. Accommodation)"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                />
                <div style={styles.iconPicker}>
                  <p style={styles.iconLabel}>Pick an icon:</p>
                  <div style={styles.iconGrid}>
                    {commonIcons.map(icon => (
                      <button
                        key={icon}
                        style={{...styles.iconBtn, ...(newCatIcon === icon ? styles.activeIconBtn : {})}}
                        onClick={() => setNewCatIcon(icon)}
                      >{icon}</button>
                    ))}
                  </div>
                  <p style={styles.selectedIcon}>Selected: <span style={{fontSize:'1.5rem'}}>{newCatIcon}</span></p>
                </div>
                <button style={styles.settingsBtn} onClick={addCategory} className="btn-hover">Add Category</button>
                {catMsg && <p style={styles.settingsMsg}>{catMsg}</p>}
              </div>
            </div>
            <div style={styles.settingsCard}>
              <h3 style={styles.settingsTitle}>Current Categories ({categories.length})</h3>
              <div style={styles.catList}>
                {categories.map(cat => (
                  <div key={cat.id} style={styles.catRow}>
                    <span style={styles.catIcon2}>{cat.icon}</span>
                    <span style={styles.catName2}>{cat.name}</span>
                    <button style={{...styles.smallBtn, background: colors.accent}} onClick={() => deleteCategory(cat.id, cat.name)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'reports' && (
          <div>
            <h2 style={styles.pageTitle}>Reports ({reports.length})</h2>
            {reports.length === 0 ? (
              <div style={styles.emptyState}><div style={{fontSize:'3rem'}}>✅</div><p>No reports!</p></div>
            ) : (
              <div style={styles.cardList}>
                {reports.map(r => (
                  <div key={r.id} style={styles.reportCard}>
                    <p style={styles.reportReason}><strong>{r.reason}</strong></p>
                    <p style={styles.reportMeta}>Listing #{r.listing_id} by User #{r.reporter_id}</p>
                    <p style={styles.reportDate}>{new Date(r.created_at).toLocaleDateString()}</p>
                    <div style={styles.reportActions}>
                      <button style={styles.dismissBtn} onClick={() => dismissReport(r.id)}>Dismiss</button>
                      <button style={{...styles.smallBtn, background: colors.accent}} onClick={() => deleteReportedListing(r.listing_id, r.id)}>Delete Listing</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'settings' && (
          <div>
            <h2 style={styles.pageTitle}>⚙️ Settings</h2>
            <div style={styles.settingsCard}>
              <h3 style={styles.settingsTitle}>🔑 Change Password</h3>
              <input style={styles.settingsInput} type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <input style={styles.settingsInput} type="password" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              <button style={styles.settingsBtn} onClick={changePassword} className="btn-hover">Update Password</button>
              {passwordMsg && <p style={styles.settingsMsg}>{passwordMsg}</p>}
            </div>
            <div style={styles.settingsCard}>
              <h3 style={styles.settingsTitle}>👥 Admin Accounts</h3>
              {admins.map((a, i) => (
                <div key={i} style={styles.adminRow}>
                  <span style={styles.adminName}>👤 {a.username}</span>
                  {i > 0 ? <button style={{...styles.smallBtn, background: colors.accent}} onClick={() => removeAdmin(i)}>Remove</button>
                  : <span style={styles.mainAdminBadge}>Main Admin</span>}
                </div>
              ))}
              <div style={styles.addAdminForm}>
                <h4 style={styles.addAdminTitle}>Add New Admin</h4>
                <input style={styles.settingsInput} type="text" placeholder="Admin name" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} />
                <input style={styles.settingsInput} type="password" placeholder="Admin password" value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} />
                <button style={styles.settingsBtn} onClick={addAdmin} className="btn-hover">Add Admin</button>
                {adminMsg && <p style={styles.settingsMsg}>{adminMsg}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  loginPage: { minHeight: '100vh', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.family, padding: '1.5rem' },
  loginCard: { background: colors.surface, borderRadius: radius.lg, padding: '2.25rem', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' },
  loginIcon: { fontSize: '2.8rem', marginBottom: '1rem' },
  loginTitle: { fontFamily: fontDisplay, color: colors.text, marginBottom: '0.3rem', fontWeight: 600 },
  loginSubtitle: { color: colors.textMuted, marginBottom: '1.5rem', fontSize: '0.9rem' },
  errorBox: { background: '#FDF0F0', border: '1px solid #E5A5A5', color: '#C0392B', padding: '0.8rem', borderRadius: radius.sm, marginBottom: '1rem' },
  loginInput: { width: '100%', padding: '0.9rem', borderRadius: radius.sm, border: `1px solid ${colors.border}`, fontSize: '1rem', boxSizing: 'border-box', marginBottom: '1rem', color: colors.text, outline: 'none', fontFamily: font.family },
  loginBtn: { width: '100%', padding: '0.9rem', background: colors.accent, color: 'white', border: 'none', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' },
  backLink: { background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', fontSize: '0.9rem' },
  page: { fontFamily: font.family, minHeight: '100vh', background: colors.bg },
  topBar: { background: colors.ink, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  menuBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer', minWidth: '44px', minHeight: '44px' },
  topBarTitle: { fontFamily: fontDisplay, color: 'white', fontWeight: 600, fontSize: '1rem' },
  backBtn: { background: 'transparent', color: '#CFC9D6', border: '1px solid rgba(255,255,255,0.16)', padding: '0.4rem 0.9rem', borderRadius: radius.pill, cursor: 'pointer', fontSize: '0.82rem' },
  sidebar: { background: colors.ink, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  sidebarBtn: { background: 'transparent', color: '#CFC9D6', border: 'none', padding: '0.9rem 1rem', borderRadius: radius.sm, cursor: 'pointer', textAlign: 'left', fontSize: '0.92rem', fontFamily: font.family },
  activeSidebarBtn: { background: colors.accentGlow, color: colors.accent },
  content: { padding: '1.5rem' },
  pageTitle: { fontFamily: fontDisplay, color: colors.text, marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: 600 },
  alertBanner: { background: '#FEF6E7', border: '1px solid #F0C36D', borderRadius: radius.sm, padding: '1rem', marginBottom: '1.5rem', color: '#8A6417', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' },
  alertBtn: { background: '#D97706', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: radius.sm, cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
  statCard: { background: colors.surface, borderRadius: radius.md, padding: '1.2rem', textAlign: 'center', border: `1px solid ${colors.border}` },
  statIcon: { fontSize: '1.7rem', marginBottom: '0.3rem' },
  statNumber: { fontFamily: fontDisplay, fontSize: '1.7rem', fontWeight: 700, color: colors.accent },
  statLabel: { color: colors.textFaint, fontSize: '0.8rem', marginTop: '0.2rem' },
  cardList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  sellerCard: { background: colors.surface, borderRadius: radius.md, padding: '1.2rem', border: `1px solid ${colors.border}` },
  sellerInfo: { display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' },
  sellerAvatar: { width: '44px', height: '44px', borderRadius: '50%', background: colors.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.15rem', flexShrink: 0 },
  sellerName: { color: colors.text, fontWeight: 700, margin: '0 0 0.2rem' },
  sellerEmail: { color: colors.textMuted, fontSize: '0.85rem', margin: '0 0 0.2rem' },
  studentId: { color: colors.text, fontSize: '0.85rem', margin: 0 },
  sellerActions: { display: 'flex', gap: '0.8rem' },
  approveBtn: { flex: 1, padding: '0.7rem', background: '#22C55E', color: 'white', border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontWeight: 700, fontFamily: font.family },
  rejectBtn: { flex: 1, padding: '0.7rem', background: colors.accent, color: 'white', border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontWeight: 700, fontFamily: font.family },
  userCard: { background: colors.surface, borderRadius: radius.md, padding: '1.2rem', border: `1px solid ${colors.border}` },
  userInfo: { display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' },
  userAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: colors.ink, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 },
  userName: { color: colors.text, fontWeight: 700, margin: '0 0 0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  userEmail: { color: colors.textMuted, fontSize: '0.85rem', margin: '0 0 0.2rem' },
  userMeta: { color: colors.textMuted, fontSize: '0.8rem', margin: 0 },
  vBadge: { background: '#22C55E', color: 'white', padding: '0.1rem 0.45rem', borderRadius: radius.pill, fontSize: '0.7rem' },
  userActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  smallBtn: { color: 'white', border: 'none', padding: '0.4rem 0.85rem', borderRadius: radius.sm, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, fontFamily: font.family },
  listingCard: { background: colors.surface, borderRadius: radius.md, padding: '1.2rem', border: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  listingTitle: { color: colors.text, fontWeight: 700, margin: '0 0 0.3rem' },
  listingMeta: { color: colors.textMuted, fontSize: '0.85rem', margin: '0 0 0.5rem' },
  statusPill: { color: 'white', padding: '0.2rem 0.65rem', borderRadius: radius.pill, fontSize: '0.75rem' },
  reportCard: { background: colors.surface, borderRadius: radius.md, padding: '1.2rem', border: `1px solid ${colors.border}` },
  reportReason: { color: colors.text, margin: '0 0 0.3rem' },
  reportMeta: { color: colors.textMuted, fontSize: '0.85rem', margin: '0 0 0.2rem' },
  reportDate: { color: colors.textFaint, fontSize: '0.8rem', margin: '0 0 1rem' },
  reportActions: { display: 'flex', gap: '0.8rem' },
  dismissBtn: { padding: '0.5rem 1rem', background: colors.bg, color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: radius.sm, cursor: 'pointer', fontWeight: 700, fontFamily: font.family },
  emptyState: { textAlign: 'center', padding: '3rem', background: colors.surface, borderRadius: radius.md, color: colors.textMuted, border: `1px solid ${colors.border}` },
  settingsCard: { background: colors.surface, borderRadius: radius.md, padding: '1.5rem', border: `1px solid ${colors.border}`, marginBottom: '1rem' },
  settingsTitle: { fontFamily: fontDisplay, color: colors.text, marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 600 },
  settingsInput: { width: '100%', padding: '0.8rem', borderRadius: radius.sm, border: `1px solid ${colors.border}`, fontSize: '0.95rem', boxSizing: 'border-box', color: colors.text, marginBottom: '0.8rem', fontFamily: font.family, background: colors.bg },
  settingsBtn: { width: '100%', padding: '0.8rem', background: colors.accent, color: 'white', border: 'none', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700 },
  settingsMsg: { color: '#16803D', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' },
  adminRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: `1px solid ${colors.border}` },
  adminName: { color: colors.text, fontSize: '0.95rem' },
  mainAdminBadge: { background: colors.accent, color: 'white', padding: '0.2rem 0.65rem', borderRadius: radius.pill, fontSize: '0.75rem' },
  addAdminForm: { marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${colors.border}` },
  addAdminTitle: { color: colors.text, marginBottom: '0.8rem', fontSize: '0.95rem', fontWeight: 700 },
  iconPicker: { marginBottom: '1rem' },
  iconLabel: { color: colors.textMuted, fontSize: '0.85rem', marginBottom: '0.5rem' },
  iconGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem', marginBottom: '0.5rem' },
  iconBtn: { padding: '0.4rem', border: `1px solid ${colors.border}`, borderRadius: radius.sm, cursor: 'pointer', background: colors.surface, fontSize: '1.2rem' },
  activeIconBtn: { border: `1px solid ${colors.accent}`, background: colors.accentPale },
  selectedIcon: { color: colors.textMuted, fontSize: '0.85rem' },
  catList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  catRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.7rem', background: colors.bg, borderRadius: radius.sm },
  catIcon2: { fontSize: '1.4rem' },
  catName2: { flex: 1, color: colors.text, fontWeight: 700 },
}

export default Admin
