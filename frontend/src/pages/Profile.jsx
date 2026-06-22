import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getUser, getAuthHeaders } from '../utils/auth'
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
    if (status === 'sold') return '#333'
    if (status === 'reserved') return '#f39c12'
    return '#27ae60'
  }
  if (!user) return null
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>MY PROFILE</h2>
      </div>
      <div style={styles.container}>
        <div style={styles.profileCard}>
          <div style={styles.avatarWrapper}>
            {profilePic ? (
              <img src={profilePic} alt="profile" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatar}>{user.name[0].toUpperCase()}</div>
            )}
          </div>
          <label style={styles.uploadBtn}>
            📷 Upload Profile Pic
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
              <span style={{...styles.detailValue, color: user.seller_approved ? '#27ae60' : '#f39c12'}}>
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
            <h3 style={styles.sellerCardTitle}>🏪 Become a Seller</h3>
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
                <button style={styles.submitIdBtn} onClick={submitStudentId} disabled={submitting || !studentId.trim()}>
                  {submitting ? 'Submitting...' : 'Submit Student ID'}
                </button>
                {submitMsg && <p style={styles.submitMsg}>{submitMsg}</p>}
              </>
            )}
          </div>
        )}
        <div style={styles.listingsSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>MY LISTINGS</h3>
            {user.seller_approved ? (
              <button style={styles.newBtn} onClick={() => navigate('/create-listing')}>+ New</button>
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
                      <button style={{...styles.statusBtn, background: listing.status === 'available' ? '#27ae60' : '#eee', color: listing.status === 'available' ? 'white' : '#666'}} onClick={() => updateStatus(listing.id, 'available')}>Available</button>
                      <button style={{...styles.statusBtn, background: listing.status === 'reserved' ? '#f39c12' : '#eee', color: listing.status === 'reserved' ? 'white' : '#666'}} onClick={() => updateStatus(listing.id, 'reserved')}>Reserved</button>
                      <button style={{...styles.statusBtn, background: listing.status === 'sold' ? '#333' : '#eee', color: listing.status === 'sold' ? 'white' : '#666'}} onClick={() => updateStatus(listing.id, 'sold')}>Sold</button>
                    </div>
                    <button style={styles.deleteBtn} onClick={() => deleteListing(listing.id)}>🗑 Delete</button>
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
  page: { fontFamily:'Arial, sans-serif', minHeight:'100vh', background:'#f0f0f0' },
  header: { background:'#e94560', padding:'1rem 1.5rem' },
  headerTitle: { color:'white', margin:0, fontSize:'1.1rem', letterSpacing:'2px' },
  container: { maxWidth:'1100px', margin:'1rem auto', padding:'0 1rem', display:'flex', flexDirection:'column', gap:'1rem' },
  profileCard: { background:'white', borderRadius:'12px', padding:'1.5rem', textAlign:'center', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  avatarWrapper: { marginBottom:'1rem' },
  avatarImg: { width:'100px', height:'100px', borderRadius:'50%', objectFit:'cover', border:'4px solid #e94560' },
  avatar: { width:'100px', height:'100px', borderRadius:'50%', background:'#e94560', color:'white', fontSize:'2.5rem', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', border:'4px solid #1a1a2e' },
  uploadBtn: { display:'inline-block', background:'#e94560', color:'white', padding:'0.6rem 1.2rem', borderRadius:'8px', cursor:'pointer', marginBottom:'1rem', fontSize:'0.85rem' },
  username: { color:'#1a1a2e', marginBottom:'0.5rem', fontSize:'1.3rem' },
  verifiedBadge: { background:'#27ae60', color:'white', padding:'0.2rem 0.8rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'bold', display:'inline-block', marginBottom:'1rem' },
  detailsBox: { textAlign:'left', borderTop:'2px solid #e94560', paddingTop:'1rem' },
  detailRow: { display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid #eee' },
  detailLabel: { color:'#888', fontSize:'0.85rem' },
  detailValue: { color:'#1a1a2e', fontWeight:'bold', fontSize:'0.85rem' },
  sellerCard: { background:'white', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  sellerCardTitle: { color:'#1a1a2e', marginBottom:'0.8rem', fontSize:'1rem' },
  sellerDesc: { color:'#888', fontSize:'0.85rem', marginBottom:'1rem', lineHeight:'1.5' },
  studentIdInput: { width:'100%', padding:'0.8rem', borderRadius:'8px', border:'2px solid #eee', fontSize:'0.9rem', boxSizing:'border-box', color:'#1a1a2e', marginBottom:'0.8rem' },
  submitIdBtn: { width:'100%', padding:'0.8rem', background:'#e94560', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  submitMsg: { color:'#27ae60', fontSize:'0.85rem', marginTop:'0.5rem', textAlign:'center' },
  pendingBox: { background:'#fff9e6', border:'1px solid #f39c12', borderRadius:'8px', padding:'1rem' },
  pendingText: { color:'#856404', fontSize:'0.85rem', margin:0 },
  listingsSection: { background:'white', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', borderBottom:'2px solid #e94560', paddingBottom:'0.5rem' },
  sectionTitle: { color:'#1a1a2e', margin:0, fontSize:'1rem', letterSpacing:'1px' },
  newBtn: { background:'#1a1a2e', color:'white', border:'none', padding:'0.5rem 1rem', borderRadius:'8px', cursor:'pointer', fontSize:'0.9rem' },
  notApprovedNote: { color:'#f39c12', fontSize:'0.85rem', fontWeight:'bold' },
  notApprovedBanner: { background:'#fff9e6', border:'1px solid #f39c12', borderRadius:'8px', padding:'1rem', marginBottom:'1rem', color:'#856404', fontSize:'0.85rem' },
  emptyState: { textAlign:'center', padding:'2rem' },
  emptyIcon: { fontSize:'2.5rem', marginBottom:'0.5rem' },
  emptyText: { color:'#888' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'1rem' },
  card: { background:'#f9f9f9', borderRadius:'12px', overflow:'hidden', border:'1px solid #eee' },
  cardImage: { width:'100%', aspectRatio:'16/9', objectFit:'cover' },
  cardBody: { padding:'0.8rem' },
  cardHeader: { display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.3rem' },
  category: { background:'#1a1a2e', color:'white', padding:'0.2rem 0.5rem', borderRadius:'20px', fontSize:'0.7rem' },
  statusBadge: { color:'white', padding:'0.2rem 0.5rem', borderRadius:'20px', fontSize:'0.7rem' },
  cardTitle: { color:'#1a1a2e', marginBottom:'0.3rem', fontSize:'0.9rem' },
  price: { color:'#e94560', fontWeight:'bold', marginBottom:'0.8rem', fontSize:'0.95rem' },
  statusBtns: { display:'flex', gap:'0.2rem', marginBottom:'0.5rem' },
  statusBtn: { flex:1, padding:'0.3rem', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.65rem', fontWeight:'bold' },
  deleteBtn: { width:'100%', padding:'0.5rem', background:'#fff0f0', color:'#e94560', border:'1px solid #e94560', borderRadius:'8px', cursor:'pointer', fontSize:'0.8rem' }
}
export default Profile
