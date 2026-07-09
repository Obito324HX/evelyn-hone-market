import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getUser, getAuthHeaders } from '../utils/auth'
import { colors, radius, shadow, font, fontDisplay } from '../theme'
const API = import.meta.env.VITE_API_URL

function Profile() {
  const [listings, setListings] = useState([])
  const [profilePic, setProfilePic] = useState(null)
  const [studentId, setStudentId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')
  const navigate = useNavigate()
  const [user, setUser] = useState(getUser())

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchMyListings()
    const saved = localStorage.getItem('profilePic_' + user.id)
    if (saved) setProfilePic(saved)
  }, [])

  const fetchMyListings = async () => {
    try {
      const res = await axios.get(`${API}/api/listings/?sellerId=${user.id}`)
      setListings(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const deleteListing = async (id) => {
    try {
      await axios.delete(`${API}/api/listings/${id}`, { headers: getAuthHeaders() })
      fetchMyListings()
    } catch (err) {
      console.error(err)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/listings/${id}/status`, { status }, { headers: getAuthHeaders() })
      fetchMyListings()
    } catch (err) {
      console.error(err)
    }
  }

  const handlePicUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePic(reader.result)
      localStorage.setItem('profilePic_' + user.id, reader.result)
    }
    reader.readAsDataURL(file)
  }

  const submitStudentId = async () => {
    if (!studentId.trim()) return
    setSubmitting(true)
    try {
      await axios.post(`${API}/api/auth/submit-student-id`, {
        user_id: user.id,
        student_id: studentId
      })
      const updated = { ...user, student_id: studentId }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      setSubmitMsg('✅ Student ID submitted! Awaiting admin approval.')
    } catch (err) {
      setSubmitMsg('❌ Failed to submit. Try again.')
    }
    setSubmitting(false)
  }

  const getStatusColor = (status) => {
    if (status === 'sold') return colors.ink
    if (status === 'reserved') return '#D97706'
    return '#22C55E'
  }

  if (!user) return null

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>My Profile</h1>
      </div>
      <div style={styles.container}>
        <div style={styles.profileCard}>
          <div style={styles.avatarWrapper}>
            {profilePic ? (
              <img src={profilePic} alt="profile" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatar}>{user.name?.[0]?.toUpperCase() || '?'}</div>
            )}
          </div>
          <label style={styles.uploadBtn} className="btn-hover">
            Upload Profile Pic
            <input type="file" accept="image/*" onChange={handlePicUpload} style={{display:'none'}} />
          </label>
          <h2 style={styles.username}>{user.name}</h2>
          {user.verified && <span style={styles.verifiedBadge}>✓ Verified</span>}
          <div style={styles.detailsBox}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>User ID</span>
              <span style={styles.detailValue}>#{user.id}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Institution</span>
              <span style={styles.detailValue}>Evelyn Hone College</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Seller Status</span>
              <span style={{...styles.detailValue, color: user.seller_approved ? '#16803D' : '#D97706'}}>
                {user.seller_approved ? '✅ Approved' : user.student_id ? '⏳ Pending' : '❌ Not Applied'}
              </span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Total Listings</span>
              <span style={styles.detailValue}>{listings.length}</span>
            </div>
          </div>
        </div>

        {!user.seller_approved && (
          <div style={styles.sellerCard}>
            <h3 style={styles.sellerCardTitle}>Become a Seller</h3>
            {user.student_id ? (
              <div style={styles.pendingBox}>
                <p style={styles.pendingText}>⏳ Your student ID <strong>{user.student_id}</strong> has been submitted and is awaiting admin approval.</p>
              </div>
            ) : (
              <>
                <p style={styles.sellerDesc}>Submit your student ID to get approved as a seller.</p>
                <input
                  style={styles.studentIdInput}
                  type="text"
                  placeholder="Enter your Student ID (e.g. 2023/EHC/001)"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                />
                <button style={styles.submitIdBtn} onClick={submitStudentId} disabled={submitting || !studentId.trim()} className="btn-hover">
                  {submitting ? 'Submitting...' : 'Submit Student ID'}
                </button>
                {submitMsg && <p style={styles.submitMsg}>{submitMsg}</p>}
              </>
            )}
          </div>
        )}

        <div style={styles.listingsSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>My Listings</h3>
            {user.seller_approved ? (
              <button style={styles.newBtn} onClick={() => navigate('/create-listing')} className="btn-hover">+ New</button>
            ) : (
              <span style={styles.notApprovedNote}>Get approved to sell</span>
            )}
          </div>
          {!user.seller_approved && (
            <div style={styles.notApprovedBanner}>
              🔒 Submit your student ID above to start selling.
            </div>
          )}
          {listings.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📦</div>
              <p style={styles.emptyText}>No listings yet.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {listings.map(listing => (
                <div key={listing.id} style={styles.card}>
                  {listing.images && listing.images[0] && <img src={listing.images[0]} alt={listing.title} style={styles.cardImage} />}
                  <div style={styles.cardBody}>
                    <div style={styles.cardHeader}>
                      <span style={styles.category}>{listing.category}</span>
                      <span style={{...styles.statusBadge, background: getStatusColor(listing.status)}}>
                        {listing.status}
                      </span>
                    </div>
                    <h4 style={styles.cardTitle}>{listing.title}</h4>
                    <p style={styles.price}>K{listing.price}</p>
                    <div style={styles.statusBtns}>
                      <button style={{...styles.statusBtn, background: listing.status === 'available' ? '#22C55E' : colors.bg, color: listing.status === 'available' ? 'white' : colors.textMuted}} onClick={() => updateStatus(listing.id, 'available')}>Available</button>
                      <button style={{...styles.statusBtn, background: listing.status === 'reserved' ? '#D97706' : colors.bg, color: listing.status === 'reserved' ? 'white' : colors.textMuted}} onClick={() => updateStatus(listing.id, 'reserved')}>Reserved</button>
                      <button style={{...styles.statusBtn, background: listing.status === 'sold' ? colors.ink : colors.bg, color: listing.status === 'sold' ? 'white' : colors.textMuted}} onClick={() => updateStatus(listing.id, 'sold')}>Sold</button>
                    </div>
                    <button style={styles.deleteBtn} onClick={() => deleteListing(listing.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { fontFamily: font.family, minHeight: '100vh', background: colors.bg },
  header: { padding: '1.75rem 1.5rem 0.5rem', maxWidth: '1100px', margin: '0 auto' },
  headerTitle: { fontFamily: fontDisplay, color: colors.text, margin: 0, fontSize: '1.6rem', fontWeight: 600 },
  container: { maxWidth: '1100px', margin: '0.5rem auto', padding: '0 1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  profileCard: { background: colors.surface, borderRadius: radius.lg, padding: '1.75rem', textAlign: 'center', border: `1px solid ${colors.border}` },
  avatarWrapper: { marginBottom: '1rem' },
  avatarImg: { width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${colors.accent}` },
  avatar: { width: '96px', height: '96px', borderRadius: '50%', background: colors.accent, color: 'white', fontSize: '2.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 700 },
  uploadBtn: { display: 'inline-block', background: colors.ink, color: 'white', padding: '0.55rem 1.2rem', borderRadius: radius.pill, cursor: 'pointer', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 600 },
  username: { fontFamily: fontDisplay, color: colors.text, marginBottom: '0.5rem', fontSize: '1.3rem', fontWeight: 600 },
  verifiedBadge: { background: colors.successBg, color: '#16803D', padding: '0.25rem 0.85rem', borderRadius: radius.pill, fontSize: '0.78rem', fontWeight: 700, display: 'inline-block', marginBottom: '1rem' },
  detailsBox: { textAlign: 'left', borderTop: `1px solid ${colors.border}`, paddingTop: '1rem' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: `1px solid ${colors.border}` },
  detailLabel: { color: colors.textFaint, fontSize: '0.83rem' },
  detailValue: { color: colors.text, fontWeight: 700, fontSize: '0.83rem' },
  sellerCard: { background: colors.surface, borderRadius: radius.lg, padding: '1.75rem', border: `1px solid ${colors.border}` },
  sellerCardTitle: { fontFamily: fontDisplay, color: colors.text, marginBottom: '0.8rem', fontSize: '1.15rem', fontWeight: 600 },
  sellerDesc: { color: colors.textMuted, fontSize: '0.86rem', marginBottom: '1rem', lineHeight: 1.6 },
  studentIdInput: { width: '100%', padding: '0.8rem', borderRadius: radius.sm, border: `1px solid ${colors.border}`, fontSize: '0.9rem', boxSizing: 'border-box', color: colors.text, marginBottom: '0.8rem', fontFamily: font.family, background: colors.bg },
  submitIdBtn: { width: '100%', padding: '0.8rem', background: colors.accent, color: 'white', border: 'none', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700 },
  submitMsg: { color: '#16803D', fontSize: '0.85rem', marginTop: '0.6rem', textAlign: 'center' },
  pendingBox: { background: '#FEF6E7', border: '1px solid #F0C36D', borderRadius: radius.sm, padding: '1rem' },
  pendingText: { color: '#8A6417', fontSize: '0.85rem', margin: 0 },
  listingsSection: { background: colors.surface, borderRadius: radius.lg, padding: '1.75rem', border: `1px solid ${colors.border}` },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', paddingBottom: '0.9rem', borderBottom: `1px solid ${colors.border}` },
  sectionTitle: { fontFamily: fontDisplay, color: colors.text, margin: 0, fontSize: '1.15rem', fontWeight: 600 },
  newBtn: { background: colors.ink, color: 'white', border: 'none', padding: '0.5rem 1.1rem', borderRadius: radius.pill, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 },
  notApprovedNote: { color: '#D97706', fontSize: '0.83rem', fontWeight: 700 },
  notApprovedBanner: { background: '#FEF6E7', border: '1px solid #F0C36D', borderRadius: radius.sm, padding: '1rem', marginBottom: '1rem', color: '#8A6417', fontSize: '0.85rem' },
  emptyState: { textAlign: 'center', padding: '2rem' },
  emptyIcon: { fontSize: '2.3rem', marginBottom: '0.5rem' },
  emptyText: { color: colors.textMuted },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' },
  card: { background: colors.bg, borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${colors.border}` },
  cardImage: { width: '100%', aspectRatio: '16/9', objectFit: 'cover' },
  cardBody: { padding: '0.85rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.55rem', flexWrap: 'wrap', gap: '0.3rem' },
  category: { background: colors.accentPale, color: colors.accentDark, padding: '0.22rem 0.55rem', borderRadius: radius.pill, fontSize: '0.68rem', fontWeight: 700 },
  statusBadge: { color: 'white', padding: '0.22rem 0.55rem', borderRadius: radius.pill, fontSize: '0.68rem', fontWeight: 700 },
  cardTitle: { color: colors.text, marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 700 },
  price: { fontFamily: fontDisplay, color: colors.accent, fontWeight: 700, marginBottom: '0.8rem', fontSize: '1rem' },
  statusBtns: { display: 'flex', gap: '0.25rem', marginBottom: '0.55rem' },
  statusBtn: { flex: 1, padding: '0.35rem', border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '0.63rem', fontWeight: 700, fontFamily: font.family },
  deleteBtn: { width: '100%', padding: '0.5rem', background: '#FDF0F0', color: '#C0392B', border: '1px solid #E5A5A5', borderRadius: radius.sm, cursor: 'pointer', fontSize: '0.8rem', fontFamily: font.family },
}

export default Profile
