import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getUser } from '../utils/auth'
const API = import.meta.env.VITE_API_URL
function ListingDetail() {
  const [listing, setListing] = useState(null)
  const [ratings, setRatings] = useState({ average: 0, total: 0, ratings: [] })
  const [userRating, setUserRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hovered, setHovered] = useState(0)
  const [rated, setRated] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reported, setReported] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const user = getUser()
  useEffect(() => {
    fetchListing()
  }, [])
  const fetchListing = async () => {
    try {
      const res = await axios.get(`${API}/api/listings/${id}`)
      setListing(res.data)
      if (res.data) fetchRatings(res.data.sellerId)
    } catch (err) {
      console.error(err)
    }
  }
  const fetchRatings = async (sellerId) => {
    try {
      const res = await axios.get(`${API}/api/ratings/${sellerId}`)
      setRatings(res.data)
    } catch (err) {
      console.error(err)
    }
  }
  const submitRating = async () => {
    if (!user || !userRating) return
    try {
      await axios.post(`${API}/api/ratings/`, {
        stars: userRating,
        comment,
        rater_id: user.id,
        seller_id: listing.sellerId
      })
      setRated(true)
      fetchRatings(listing.sellerId)
    } catch (err) {
      console.error(err)
    }
  }
  const submitReport = async () => {
    if (!user || !reportReason) return
    try {
      await axios.post(`${API}/api/reports/`, {
        reason: reportReason,
        reporter_id: user.id,
        listing_id: listing.id
      })
      setReported(true)
      setShowReport(false)
    } catch (err) {
      console.error(err)
    }
  }
  const renderStars = (count, size = '1.2rem') => {
    return [1,2,3,4,5].map(i => (
      <span key={i} style={{color: i <= count ? '#f39c12' : '#ddd', fontSize: size}}>★</span>
    ))
  }
  if (!listing) return (
    <div style={styles.loading}>
      <div style={styles.loadingIcon}>⏳</div>
      <p>Loading listing...</p>
    </div>
  )
  return (
    <div style={styles.page}>
      <div style={styles.topRow}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back to Listings</button>
        {user && user.id !== listing.sellerId && (
          <button style={styles.reportBtn} onClick={() => setShowReport(!showReport)}>
            🚩 Report Listing
          </button>
        )}
      </div>
      {showReport && (
        <div style={styles.reportBox}>
          <h4 style={styles.reportTitle}>Report this listing</h4>
          <p style={styles.reportSubtitle}>Why are you reporting this listing?</p>
          <div style={styles.reasonGrid}>
            {['Scam or fraud', 'Inappropriate content', 'Wrong category', 'Already sold', 'Spam', 'Other'].map(r => (
              <button
                key={r}
                style={{...styles.reasonBtn, ...(reportReason === r ? styles.activeReasonBtn : {})}}
                onClick={() => setReportReason(r)}
              >{r}</button>
            ))}
          </div>
          <div style={styles.reportActions}>
            <button style={styles.cancelReportBtn} onClick={() => setShowReport(false)}>Cancel</button>
            <button style={styles.submitReportBtn} onClick={submitReport} disabled={!reportReason}>
              Submit Report
            </button>
          </div>
        </div>
      )}
      {reported && (
        <div style={styles.reportedMsg}>
          ✅ Thank you! Your report has been submitted and will be reviewed by our admin team.
        </div>
      )}
      <div style={styles.container}>
        <div style={styles.imageSection}>
          {listing.images && listing.images[0] ? (
            <img src={listing.images[0]} alt={listing.title} style={styles.image} />
          ) : (
            <div style={styles.noImage}>
              <span style={{fontSize:'3rem'}}>📷</span>
              <p>No Image Available</p>
            </div>
          )}
          {listing.status !== 'available' && (
            <div style={{...styles.statusOverlay, background: listing.status === 'sold' ? '#333' : '#f39c12'}}>
              {listing.status.toUpperCase()}
            </div>
          )}
        </div>
        <div style={styles.detailSection}>
          <div style={styles.badges}>
            <span style={styles.category}>{listing.category}</span>
            <span style={styles.listingType}>{listing.listingType}</span>
          </div>
          <h1 style={styles.title}>{listing.title}</h1>
          <p style={styles.price}>K{listing.price}</p>
          <div style={styles.divider} />
          <h3 style={styles.sectionLabel}>Description</h3>
          <p style={styles.description}>{listing.description}</p>
          <div style={styles.divider} />
          <div style={styles.sellerBox}>
            <div style={styles.sellerAvatar}>{listing.seller?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p style={styles.sellerLabel}>Seller</p>
              <div style={styles.sellerNameRow}>
                <p style={styles.sellerValue}>{listing.seller?.name}</p>
                {listing.seller?.verified && <span style={styles.verifiedBadge}>✓ Verified</span>}
              </div>
            </div>
            <div style={styles.sellerRating}>
              <div>{renderStars(Math.round(ratings.average))}</div>
              <small style={{color:'#888'}}>{ratings.average} ({ratings.total} reviews)</small>
            </div>
          </div>
          <div style={styles.divider} />
          <p style={styles.posted}>📅 Posted: {new Date(listing.createdAt).toLocaleDateString()}</p>
          {user && user.id !== listing.sellerId && listing.status === 'available' && (
            <button style={styles.contactBtn} onClick={() => navigate(`/messages?seller=${listing.sellerId}&listing=${listing.id}`)}>
              💬 Contact {listing.seller?.name}
            </button>
          )}
          {listing.status !== 'available' && (
            <div style={styles.unavailableMsg}>
              This item is marked as {listing.status}
            </div>
          )}
          {!user && (
            <button style={styles.contactBtn} onClick={() => navigate('/login')}>
              Login to Contact Seller
            </button>
          )}
        </div>
      </div>
      <div style={styles.ratingsSection}>
        <h3 style={styles.sectionLabel}>Reviews for {listing.seller?.name}</h3>
        {user && user.id !== listing.sellerId && !rated && (
          <div style={styles.rateBox}>
            <p style={styles.rateTitle}>Rate {listing.seller?.name}:</p>
            <div style={styles.stars}>
              {[1,2,3,4,5].map(i => (
                <span
                  key={i}
                  style={{color: i <= (hovered || userRating) ? '#f39c12' : '#ddd', fontSize:'2rem', cursor:'pointer'}}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setUserRating(i)}
                >★</span>
              ))}
            </div>
            <textarea
              style={styles.commentBox}
              placeholder="Leave a comment (optional)..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <button style={styles.submitRating} onClick={submitRating} disabled={!userRating}>
              Submit Rating
            </button>
          </div>
        )}
        {rated && <div style={styles.ratedMsg}>✅ Thanks for your rating!</div>}
        {ratings.ratings.length === 0 ? (
          <div style={styles.noRatings}>
            <span style={{fontSize:'2rem'}}>⭐</span>
            <p>No reviews yet for {listing.seller?.name}.</p>
          </div>
        ) : (
          <div style={styles.reviewList}>
            {ratings.ratings.map((r, i) => (
              <div key={i} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div>{renderStars(r.stars)}</div>
                  <small style={{color:'#888'}}>User #{r.rater_id}</small>
                </div>
                {r.comment && <p style={styles.reviewComment}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
const styles = {
  page: { padding:'2rem', maxWidth:'1100px', margin:'0 auto', fontFamily:'Arial, sans-serif' },
  loading: { textAlign:'center', padding:'5rem', color:'#888' },
  loadingIcon: { fontSize:'3rem', marginBottom:'1rem' },
  topRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  backBtn: { background:'none', border:'2px solid #1a1a2e', color:'#1a1a2e', padding:'0.5rem 1.2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  reportBtn: { background:'none', border:'2px solid #e94560', color:'#e94560', padding:'0.5rem 1.2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  reportBox: { background:'white', borderRadius:'12px', padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 4px 15px rgba(0,0,0,0.08)', border:'2px solid #e94560' },
  reportTitle: { color:'#1a1a2e', marginBottom:'0.3rem' },
  reportSubtitle: { color:'#888', fontSize:'0.9rem', marginBottom:'1rem' },
  reasonGrid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0.5rem', marginBottom:'1rem' },
  reasonBtn: { padding:'0.6rem', border:'2px solid #eee', borderRadius:'8px', cursor:'pointer', background:'white', color:'#555', fontSize:'0.85rem' },
  activeReasonBtn: { border:'2px solid #e94560', background:'#fff0f0', color:'#e94560' },
  reportActions: { display:'flex', gap:'1rem', justifyContent:'flex-end' },
  cancelReportBtn: { padding:'0.6rem 1.5rem', background:'white', border:'2px solid #ddd', borderRadius:'8px', cursor:'pointer', color:'#888' },
  submitReportBtn: { padding:'0.6rem 1.5rem', background:'#e94560', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  reportedMsg: { background:'#f0fff0', color:'#27ae60', padding:'1rem', borderRadius:'8px', marginBottom:'1.5rem', textAlign:'center', fontWeight:'bold' },
  container: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', background:'white', borderRadius:'12px', overflow:'hidden', boxShadow:'0 4px 15px rgba(0,0,0,0.08)', marginBottom:'2rem' },
  imageSection: { position:'relative', background:'#f5f5f5' },
  image: { width:'100%', height:'100%', objectFit:'cover', minHeight:'400px', display:'block' },
  noImage: { width:'100%', minHeight:'400px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#aaa' },
  statusOverlay: { position:'absolute', top:'1rem', left:'1rem', color:'white', padding:'0.4rem 1rem', borderRadius:'6px', fontWeight:'bold', fontSize:'1rem' },
  detailSection: { padding:'2rem' },
  badges: { display:'flex', gap:'0.5rem', marginBottom:'1rem' },
  category: { background:'#1a1a2e', color:'white', padding:'0.3rem 0.8rem', borderRadius:'20px', fontSize:'0.85rem' },
  listingType: { background:'#e94560', color:'white', padding:'0.3rem 0.8rem', borderRadius:'20px', fontSize:'0.85rem' },
  title: { color:'#1a1a2e', fontSize:'1.8rem', marginBottom:'0.5rem' },
  price: { color:'#e94560', fontSize:'2rem', fontWeight:'bold', marginBottom:'1rem' },
  divider: { height:'1px', background:'#eee', margin:'1rem 0' },
  sectionLabel: { color:'#1a1a2e', marginBottom:'0.5rem', fontSize:'1rem' },
  description: { color:'#666', lineHeight:'1.7' },
  sellerBox: { display:'flex', alignItems:'center', gap:'1rem' },
  sellerAvatar: { width:'44px', height:'44px', borderRadius:'50%', background:'#e94560', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'1.2rem' },
  sellerLabel: { color:'#888', fontSize:'0.8rem', margin:0 },
  sellerNameRow: { display:'flex', alignItems:'center', gap:'0.5rem' },
  sellerValue: { color:'#1a1a2e', fontWeight:'bold', margin:0 },
  verifiedBadge: { background:'#27ae60', color:'white', padding:'0.2rem 0.5rem', borderRadius:'20px', fontSize:'0.75rem', fontWeight:'bold' },
  sellerRating: { marginLeft:'auto', textAlign:'right' },
  posted: { color:'#888', fontSize:'0.85rem', marginBottom:'1rem' },
  contactBtn: { width:'100%', padding:'1rem', background:'#e94560', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem' },
  unavailableMsg: { textAlign:'center', padding:'1rem', background:'#f5f5f5', borderRadius:'8px', color:'#888', fontWeight:'bold' },
  ratingsSection: { background:'white', borderRadius:'12px', padding:'2rem', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  rateBox: { background:'#fafafa', borderRadius:'8px', padding:'1.5rem', marginBottom:'1.5rem', border:'1px solid #eee' },
  rateTitle: { color:'#1a1a2e', fontWeight:'bold', marginBottom:'0.5rem' },
  stars: { display:'flex', gap:'0.3rem', marginBottom:'1rem' },
  commentBox: { width:'100%', padding:'0.8rem', borderRadius:'8px', border:'2px solid #eee', fontSize:'0.95rem', boxSizing:'border-box', height:'80px', marginBottom:'1rem', background:'white', color:'#1a1a2e' },
  submitRating: { background:'#e94560', color:'white', border:'none', padding:'0.7rem 1.5rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' },
  ratedMsg: { background:'#f0fff0', color:'#27ae60', padding:'1rem', borderRadius:'8px', marginBottom:'1rem', textAlign:'center' },
  noRatings: { textAlign:'center', padding:'2rem', color:'#888' },
  reviewList: { display:'flex', flexDirection:'column', gap:'1rem' },
  reviewCard: { background:'#fafafa', borderRadius:'8px', padding:'1rem', border:'1px solid #eee' },
  reviewHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' },
  reviewComment: { color:'#666', margin:0, fontSize:'0.9rem' }
}
export default ListingDetail
