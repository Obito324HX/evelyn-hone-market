import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
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
      const shuffled = available.sort(() => 0.5 - Math.random()).slice(0, 4)
      setTrending(shuffled)
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>Evelyn Hone Campus Market</h1>
          <p style={styles.subtitle}>Buy, sell and offer services within the campus community</p>
          <div style={styles.buttons}>
            <Link to="/listings" style={styles.primaryBtn}>Browse Listings</Link>
            <Link to="/register" style={styles.secondaryBtn}>Join Now</Link>
          </div>
        </div>
      </div>
      <div style={styles.statsBar}>
        <div style={styles.stat}>🏫 Campus Only</div>
        <div style={styles.stat}>💬 Direct Messaging</div>
        <div style={styles.stat}>⭐ Seller Ratings</div>
        <div style={styles.stat}>🔒 Safe & Trusted</div>
      </div>
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Browse by Category</h2>
        <div style={styles.catGrid}>
          {categories.map(cat => (
            <Link to={`/listings?category=${cat.name}`} key={cat.id} style={styles.catCard}>
              <span style={styles.catIcon}>{cat.icon}</span>
              <span style={styles.catName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
      {trending.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🔥 Trending Now</h2>
            <Link to="/listings" style={styles.seeAll}>See all →</Link>
          </div>
          <div style={styles.trendingGrid}>
            {trending.map(listing => (
              <div key={listing.id} style={styles.trendingCard} onClick={() => navigate(`/listings/${listing.id}`)}>
                {listing.images && listing.images[0] ? (
                  <img src={listing.images[0]} alt={listing.title} style={styles.trendingImg} />
                ) : (
                  <div style={styles.trendingNoImg}>📷</div>
                )}
                <div style={styles.trendingBody}>
                  <p style={styles.trendingTitle}>{listing.title}</p>
                  <p style={styles.trendingPrice}>K{listing.price}</p>
                  <div style={styles.trendingSeller}>
                    <span style={styles.sellerDot}>{listing.sellerUsername?.[0]?.toUpperCase()}</span>
                    <span style={styles.sellerName}>{listing.sellerUsername}</span>
                    {listing.sellerVerified && <span style={styles.vBadge}>✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={styles.howSection}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.stepsGrid}>
          {[
            { num:'1', title:'Create Account', text:'Sign up to join the campus marketplace' },
            { num:'2', title:'Post or Browse', text:'List items or browse what others are offering' },
            { num:'3', title:'Connect & Deal', text:'Message the seller and meet on campus' }
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
        <p style={styles.footerSub}>Evelyn Hone College Market © 2026</p>
      </div>
    </div>
  )
}
const styles = {
  container: { fontFamily:'Arial, sans-serif' },
  hero: { background:'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', color:'white', padding:'3rem 1.5rem', textAlign:'center' },
  heroContent: { maxWidth:'600px', margin:'0 auto' },
  title: { fontSize:'clamp(1.4rem, 5vw, 2.5rem)', marginBottom:'1rem', color:'#e94560', lineHeight:'1.2' },
  subtitle: { fontSize:'clamp(0.9rem, 3vw, 1.1rem)', marginBottom:'2rem', color:'#ccc', lineHeight:'1.6' },
  buttons: { display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' },
  primaryBtn: { background:'#e94560', color:'white', padding:'0.8rem 1.5rem', borderRadius:'8px', textDecoration:'none', fontWeight:'bold', fontSize:'0.95rem' },
  secondaryBtn: { background:'transparent', color:'white', padding:'0.8rem 1.5rem', borderRadius:'8px', textDecoration:'none', border:'2px solid white', fontSize:'0.95rem' },
  statsBar: { background:'#e94560', color:'white', padding:'0.8rem 1rem', display:'flex', justifyContent:'center', gap:'1rem', flexWrap:'wrap', fontSize:'0.8rem', fontWeight:'bold' },
  stat: {},
  section: { padding:'2rem 1.5rem', maxWidth:'900px', margin:'0 auto' },
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  sectionTitle: { fontSize:'clamp(1.1rem, 4vw, 1.6rem)', color:'#1a1a2e', marginBottom:'1.5rem' },
  seeAll: { color:'#e94560', textDecoration:'none', fontSize:'0.9rem', fontWeight:'bold' },
  catGrid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'0.8rem' },
  catCard: { background:'#1a1a2e', color:'white', padding:'1rem 0.5rem', borderRadius:'12px', textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' },
  catIcon: { fontSize:'1.8rem' },
  catName: { fontSize:'0.8rem', fontWeight:'bold', textAlign:'center' },
  trendingGrid: { display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1rem' },
  trendingCard: { background:'white', borderRadius:'12px', overflow:'hidden', boxShadow:'0 4px 15px rgba(0,0,0,0.08)', cursor:'pointer' },
  trendingImg: { width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block' },
  trendingNoImg: { width:'100%', aspectRatio:'16/9', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem' },
  trendingBody: { padding:'0.8rem' },
  trendingTitle: { color:'#1a1a2e', fontWeight:'bold', fontSize:'0.9rem', marginBottom:'0.3rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  trendingPrice: { color:'#e94560', fontWeight:'bold', fontSize:'1rem', marginBottom:'0.5rem' },
  trendingSeller: { display:'flex', alignItems:'center', gap:'0.4rem' },
  sellerDot: { width:'20px', height:'20px', borderRadius:'50%', background:'#1a1a2e', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:'bold' },
  sellerName: { color:'#888', fontSize:'0.75rem' },
  vBadge: { background:'#27ae60', color:'white', padding:'0.1rem 0.3rem', borderRadius:'10px', fontSize:'0.65rem' },
  howSection: { padding:'2rem 1.5rem', background:'#f9f9f9', textAlign:'center' },
  stepsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1.5rem', maxWidth:'900px', margin:'0 auto' },
  step: { background:'white', padding:'1.5rem', borderRadius:'12px', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  stepNum: { width:'44px', height:'44px', borderRadius:'50%', background:'#e94560', color:'white', fontSize:'1.3rem', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' },
  stepTitle: { color:'#1a1a2e', marginBottom:'0.5rem', fontSize:'0.95rem' },
  stepText: { color:'#888', fontSize:'0.82rem', lineHeight:'1.6' },
  footer: { background:'#1a1a2e', color:'white', padding:'1.5rem', textAlign:'center' },
  footerText: { color:'#ccc', marginBottom:'0.5rem', fontSize:'0.9rem' },
  footerSub: { color:'#666', fontSize:'0.8rem' }
}
export default Home
