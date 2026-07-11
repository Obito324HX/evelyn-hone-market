import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { colors, radius, shadow, font, fontDisplay } from '../theme'
const API = import.meta.env.VITE_API_URL

function Home() {
  const [trending, setTrending] = useState([])
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrending()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/categories/`)
      setCategories(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTrending = async () => {
    try {
      const res = await axios.get(`${API}/api/listings/`)
      const available = res.data.filter(l => l.status === 'available')
      const shuffled = available.sort(() => 0.5 - Math.random()).slice(0, 5)
      setTrending(shuffled)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={styles.container}>
      {/* HERO — editorial two-column, not a full-bleed gradient banner */}
      <div style={styles.hero} className="ehm-hero-grid">
        <div style={styles.heroLeft}>
          <div style={styles.heroEyebrow}>Evelyn Hone College · Campus Only</div>
          <h1 style={styles.heroTitle}>
            Buy, sell, and <em style={styles.heroEm}>trade.</em> Without leaving campus.
          </h1>
          <p style={styles.heroDesc}>
            The marketplace built for Evelyn Hone students. Textbooks, electronics, services,
            and more, from people you actually go to school with.
          </p>
          <div style={styles.heroActions}>
            <Link to="/listings" style={styles.primaryBtn} className="btn-hover">Browse Listings</Link>
            <Link to="/register" style={styles.ghostBtn} className="btn-hover">Join Now</Link>
          </div>
          <div style={styles.trustRow}>
            <span>🎓 Campus Only</span>
            <span>⭐ Seller Ratings</span>
            <span>🔒 Safe &amp; Trusted</span>
          </div>
        </div>

        <div style={styles.heroRight} className="ehm-hero-right">
          <div style={styles.bentoGrid}>
            <div style={{...styles.bentoTile, ...styles.bentoBig}}>
              <span style={styles.bentoEmoji}>📚</span>
              <span style={styles.bentoLabel}>Textbooks</span>
            </div>
            <div style={styles.bentoTile}>
              <span style={styles.bentoEmoji}>💻</span>
              <span style={styles.bentoLabel}>Electronics</span>
            </div>
            <div style={styles.bentoTile}>
              <span style={styles.bentoEmoji}>👕</span>
              <span style={styles.bentoLabel}>Clothing</span>
            </div>
            <div style={styles.bentoTile}>
              <span style={styles.bentoEmoji}>🔧</span>
              <span style={styles.bentoLabel}>Services</span>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY CHIPS — horizontal scroll instead of a grid */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Browse by Category</h2>
        <div style={styles.chipRow} className="scroll-x">
          {categories.map(cat => (
            <Link to={`/listings?category=${cat.name}`} key={cat.id} style={styles.chip} className="chip-hover">
              <span style={styles.chipIcon}>{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* TRENDING — asymmetric bento layout, not uniform cards */}
      {trending.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Trending Now</h2>
            <Link to="/listings" style={styles.seeAll} className="link-hover">See all →</Link>
          </div>
          <div style={styles.trendGrid} className="ehm-trend-grid">
            {trending.map((listing, i) => (
              <div
                key={listing.id}
                style={{...styles.trendCard, ...(i === 0 ? styles.trendCardBig : {})}}
                className={`card-hover ${i === 0 ? 'ehm-trend-big' : ''}`}
                onClick={() => navigate(`/listings/${listing.id}`)}
              >
                {listing.images && listing.images[0] ? (
                  <img src={listing.images[0]} alt={listing.title} style={{...styles.trendImg, aspectRatio: i === 0 ? '16/11' : '4/3'}} />
                ) : (
                  <div style={{...styles.trendNoImg, aspectRatio: i === 0 ? '16/11' : '4/3'}}>📷</div>
                )}
                <div style={styles.trendBody}>
                  <p style={styles.trendTitle}>{listing.title}</p>
                  <p style={styles.trendPrice}>K{listing.price}</p>
                  <div style={styles.trendSeller}>
                    <span style={styles.sellerDot}>{listing.sellerUsername?.[0]?.toUpperCase()}</span>
                    <span style={styles.sellerName}>{listing.sellerUsername}</span>
                    {listing.sellerVerified && <span style={styles.vBadge}>✓ Verified</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOW IT WORKS */}
      <div style={styles.howSection}>
        <h2 style={{...styles.sectionTitle, textAlign: 'center'}}>How It Works</h2>
        <div style={styles.stepsGrid}>
          {[
            { num: '01', title: 'Create an account', text: 'Sign up with your student details to join the market' },
            { num: '02', title: 'Post or browse', text: 'List something to sell or browse what others are offering' },
            { num: '03', title: 'Connect & meet', text: 'Message the seller directly and arrange to meet on campus' },
          ].map((step, i) => (
            <div key={i} style={styles.step}>
              <div style={styles.stepNum}>{step.num}</div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepText}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>🌱 Promoting sustainability and reducing waste on campus</p>
        <p style={styles.footerSub}>Evelyn Hone Campus Market © 2026</p>
      </div>
    </div>
  )
}

const styles = {
  container: { fontFamily: font.family },

  hero: {
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    gap: '3rem',
    alignItems: 'center',
    padding: '3.5rem 1.5rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  heroEyebrow: {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: colors.accent,
    marginBottom: '1rem',
  },
  heroTitle: {
    fontFamily: fontDisplay,
    fontSize: 'clamp(1.9rem, 4.2vw, 2.9rem)',
    fontWeight: 600,
    lineHeight: 1.12,
    color: colors.text,
    marginBottom: '1.25rem',
    letterSpacing: '-0.01em',
  },
  heroEm: { fontStyle: 'italic', color: colors.accent, fontWeight: 500 },
  heroDesc: {
    fontSize: '1rem',
    color: colors.textMuted,
    lineHeight: 1.75,
    marginBottom: '1.75rem',
    maxWidth: '440px',
  },
  heroActions: { display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.75rem' },
  primaryBtn: {
    background: colors.ink,
    color: 'white',
    padding: '0.85rem 1.7rem',
    borderRadius: radius.pill,
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.88rem',
  },
  ghostBtn: {
    background: 'transparent',
    color: colors.text,
    padding: '0.85rem 1.7rem',
    borderRadius: radius.pill,
    textDecoration: 'none',
    border: `1px solid ${colors.borderStrong}`,
    fontSize: '0.88rem',
    fontWeight: 600,
  },
  trustRow: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem', color: colors.textFaint, fontWeight: 600 },

  heroRight: {},
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridAutoRows: '110px',
    gap: '0.85rem',
  },
  bentoTile: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: shadow.sm,
  },
  bentoBig: { gridColumn: 'span 2', gridRow: 'span 1', flexDirection: 'row', gap: '0.75rem' },
  bentoAccent: { background: colors.accentPale, borderColor: colors.accent },
  bentoEmoji: { fontSize: '1.9rem' },
  bentoLabel: { fontSize: '0.85rem', fontWeight: 700, color: colors.text },

  section: { padding: '2.75rem 1.5rem', maxWidth: '1100px', margin: '0 auto' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  sectionTitle: {
    fontFamily: fontDisplay,
    fontSize: 'clamp(1.3rem, 3.2vw, 1.7rem)',
    color: colors.text,
    marginBottom: '1.5rem',
    fontWeight: 600,
  },
  seeAll: { color: colors.accent, textDecoration: 'none', fontSize: '0.86rem', fontWeight: 700 },

  chipRow: { display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.4rem' },
  chip: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.pill,
    padding: '0.6rem 1.1rem',
    textDecoration: 'none',
    color: colors.text,
    fontSize: '0.85rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  chipIcon: { fontSize: '1rem' },

  trendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  trendCard: {
    background: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
  },
  trendCardBig: { gridColumn: 'span 2', gridRow: 'span 2' },
  trendImg: { width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' },
  trendNoImg: { width: '100%', aspectRatio: '4/3', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' },
  trendBody: { padding: '0.95rem' },
  trendTitle: { color: colors.text, fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  trendPrice: { color: colors.accent, fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.55rem', fontFamily: fontDisplay },
  trendSeller: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  sellerDot: { width: '20px', height: '20px', borderRadius: '50%', background: colors.ink, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.63rem', fontWeight: 700 },
  sellerName: { color: colors.textFaint, fontSize: '0.75rem' },
  vBadge: { background: colors.successBg, color: '#16803D', padding: '0.12rem 0.45rem', borderRadius: radius.pill, fontSize: '0.62rem', fontWeight: 700 },

  howSection: { padding: '3.5rem 1.5rem', background: colors.surface, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` },
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' },
  step: { textAlign: 'center', padding: '0 1rem' },
  stepNum: { fontFamily: fontDisplay, fontSize: '1.5rem', fontWeight: 700, color: colors.accent, marginBottom: '0.75rem' },
  stepTitle: { color: colors.text, marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 700 },
  stepText: { color: colors.textMuted, fontSize: '0.85rem', lineHeight: 1.7 },

  footer: { padding: '2.5rem 1.5rem', textAlign: 'center' },
  footerText: { color: colors.textMuted, marginBottom: '0.5rem', fontSize: '0.85rem' },
  footerSub: { color: colors.textFaint, fontSize: '0.76rem' },
}

export default Home
