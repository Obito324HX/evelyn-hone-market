import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getUser } from '../utils/auth'
import { colors, radius, shadow, font, fontDisplay } from '../theme'
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

  const renderStars = (count, size = '1.15rem') => {
    return [1,2,3,4,5].map(i => (
      <span key={i} style={{color: i <= count ? '#F5A623' : colors.border, fontSize: size}}>★</span>
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
        <button style={styles.backBtn} onClick={() => navigate(-1)} className="btn-hover">← Back to Listings</button>
        {user && user.id !== listing.sellerId && (
          <button style={styles.reportBtn} onClick={() => setShowReport(!showReport)} className="btn-hover">
            Report Listing
          </button>
        )}
      </div>

      {showReport && (
        <div style={styles.reportBox}>
          <h4 style={styles.reportTitle}>Report this listing</h4>
          <p style={styles.reportSubtitle}>Why are you reporting this listing?</p>
          <div style={styles.reasonGrid} className="ehm-reason-grid">
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

      <div style={styles.container} className="ehm-detail-container">
        <div style={styles.imageSection}>
          {listing.images && listing.images[0] ? (
            <img src={listing.images[0]} alt={listing.title} style={styles.image} className="ehm-detail-image" />
          ) : (
            <div style={styles.noImage} className="ehm-detail-image">
              <span style={{fontSize:'3rem'}}>📷</span>
              <p>No Image Available</p>
            </div>
          )}
          {listing.status !== 'available' && (
            <div style={{...styles.statusOverlay, background: listing.status === 'sold' ? colors.ink : '#D97706'}}>
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
              <small style={{color: colors.textFaint}}>{ratings.average} ({ratings.total} reviews)</small>
            </div>
          </div>
          <div style={styles.divider} />
          <p style={styles.posted}>Posted: {new Date(listing.createdAt).toLocaleDateString()}</p>
          {user && user.id !== listing.sellerId && listing.status === 'available' && (
            <button style={styles.contactBtn} className="btn-hover" onClick={() => navigate(`/messages?seller=${listing.sellerId}&listing=${listing.id}`)}>
              Contact {listing.seller?.name}
            </button>
          )}
          {listing.status !== 'available' && (
            <div style={styles.unavailableMsg}>
              This item is marked as {listing.status}
            </div>
          )}
          {!user && (
            <button style={styles.contactBtn} className="btn-hover" onClick={() => navigate('/login')}>
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
                  style={{color: i <= (hovered || userRating) ? '#F5A623' : colors.border, fontSize:'1.9rem', cursor:'pointer'}}
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
            <button style={styles.submitRating} onClick={submitRating} disabled={!userRating} className="btn-hover">
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
                  <small style={{color: colors.textFaint}}>User #{r.rater_id}</small>
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
  page: { padding: '2rem 1.5rem 2.5rem', maxWidth: '1100px', margin: '0 auto', fontFamily: font.family },
  loading: { textAlign: 'center', padding: '5rem', color: colors.textMuted },
  loadingIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' },
  backBtn: { background: 'transparent', border: `1px solid ${colors.borderStrong}`, color: colors.text, padding: '0.6rem 1.3rem', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  reportBtn: { background: 'transparent', border: `1px solid #E5A5A5`, color: '#C0392B', padding: '0.6rem 1.3rem', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  reportBox: { background: colors.surface, borderRadius: radius.lg, padding: '1.5rem', marginBottom: '1.5rem', border: `1px solid #E5A5A5`, boxShadow: shadow.sm },
  reportTitle: { fontFamily: fontDisplay, color: colors.text, marginBottom: '0.3rem', fontSize: '1.1rem', fontWeight: 600 },
  reportSubtitle: { color: colors.textMuted, fontSize: '0.88rem', marginBottom: '1rem' },
  reasonGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' },
  reasonBtn: { padding: '0.6rem', border: `1px solid ${colors.border}`, borderRadius: radius.sm, cursor: 'pointer', background: colors.bg, color: colors.textMuted, fontSize: '0.82rem', fontFamily: font.family },
  activeReasonBtn: { border: `1px solid #C0392B`, background: '#FDF0F0', color: '#C0392B' },
  reportActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end' },
  cancelReportBtn: { padding: '0.6rem 1.5rem', background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: radius.sm, cursor: 'pointer', color: colors.textMuted, fontFamily: font.family },
  submitReportBtn: { padding: '0.6rem 1.5rem', background: '#C0392B', color: 'white', border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontWeight: 700, fontFamily: font.family },
  reportedMsg: { background: colors.successBg, color: '#16803D', padding: '1rem', borderRadius: radius.sm, marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 },
  container: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', background: colors.surface, borderRadius: radius.lg, overflow: 'hidden', border: `1px solid ${colors.border}`, marginBottom: '2rem' },
  imageSection: { position: 'relative', background: colors.bg },
  image: { width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px', display: 'block' },
  noImage: { width: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.textFaint },
  statusOverlay: { position: 'absolute', top: '1rem', left: '1rem', color: 'white', padding: '0.4rem 1rem', borderRadius: radius.sm, fontWeight: 700, fontSize: '0.9rem' },
  detailSection: { padding: '2rem' },
  badges: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  category: { background: colors.accentPale, color: colors.accentDark, padding: '0.3rem 0.8rem', borderRadius: radius.pill, fontSize: '0.78rem', fontWeight: 700 },
  listingType: { background: colors.bg, color: colors.textMuted, padding: '0.3rem 0.8rem', borderRadius: radius.pill, fontSize: '0.78rem', fontWeight: 700, border: `1px solid ${colors.border}` },
  title: { fontFamily: fontDisplay, color: colors.text, fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 600 },
  price: { fontFamily: fontDisplay, color: colors.accent, fontSize: '1.9rem', fontWeight: 700, marginBottom: '1rem' },
  divider: { height: '1px', background: colors.border, margin: '1.2rem 0' },
  sectionLabel: { fontFamily: fontDisplay, color: colors.text, marginBottom: '0.5rem', fontSize: '1.05rem', fontWeight: 600 },
  description: { color: colors.textMuted, lineHeight: 1.75 },
  sellerBox: { display: 'flex', alignItems: 'center', gap: '1rem' },
  sellerAvatar: { width: '42px', height: '42px', borderRadius: '50%', background: colors.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' },
  sellerLabel: { color: colors.textFaint, fontSize: '0.78rem', margin: 0 },
  sellerNameRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  sellerValue: { color: colors.text, fontWeight: 700, margin: 0 },
  verifiedBadge: { background: colors.successBg, color: '#16803D', padding: '0.2rem 0.5rem', borderRadius: radius.pill, fontSize: '0.72rem', fontWeight: 700 },
  sellerRating: { marginLeft: 'auto', textAlign: 'right' },
  posted: { color: colors.textFaint, fontSize: '0.85rem', marginBottom: '1rem' },
  contactBtn: { width: '100%', padding: '1rem', background: colors.accent, color: 'white', border: 'none', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' },
  unavailableMsg: { textAlign: 'center', padding: '1rem', background: colors.bg, borderRadius: radius.sm, color: colors.textMuted, fontWeight: 600 },
  ratingsSection: { background: colors.surface, borderRadius: radius.lg, padding: '2rem', border: `1px solid ${colors.border}` },
  rateBox: { background: colors.bg, borderRadius: radius.md, padding: '1.5rem', marginBottom: '1.5rem', border: `1px solid ${colors.border}` },
  rateTitle: { color: colors.text, fontWeight: 700, marginBottom: '0.5rem' },
  stars: { display: 'flex', gap: '0.3rem', marginBottom: '1rem' },
  commentBox: { width: '100%', padding: '0.8rem', borderRadius: radius.sm, border: `1px solid ${colors.border}`, fontSize: '0.92rem', boxSizing: 'border-box', height: '80px', marginBottom: '1rem', background: colors.surface, color: colors.text, fontFamily: font.family },
  submitRating: { background: colors.accent, color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700 },
  ratedMsg: { background: colors.successBg, color: '#16803D', padding: '1rem', borderRadius: radius.sm, marginBottom: '1rem', textAlign: 'center' },
  noRatings: { textAlign: 'center', padding: '2rem', color: colors.textMuted },
  reviewList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  reviewCard: { background: colors.bg, borderRadius: radius.sm, padding: '1rem', border: `1px solid ${colors.border}` },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  reviewComment: { color: colors.textMuted, margin: 0, fontSize: '0.9rem' },
}

export default ListingDetail
