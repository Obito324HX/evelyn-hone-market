import { Link } from 'react-router-dom'

function Home() {
  const categories = [
    { name: 'Electronics', icon: '💻' },
    { name: 'Textbooks', icon: '📚' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Food', icon: '🍱' },
    { name: 'Services', icon: '🔧' },
    { name: 'Other', icon: '📦' }
  ]

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
        <div style={styles.stat}>🛍 Campus Only</div>
        <div style={styles.stat}>💬 Direct Messaging</div>
        <div style={styles.stat}>⭐ Seller Ratings</div>
        <div style={styles.stat}>🔒 Safe & Trusted</div>
      </div>
      <div style={styles.categories}>
        <h2 style={styles.catTitle}>Browse by Category</h2>
        <div style={styles.catGrid}>
          {categories.map(cat => (
            <Link to={`/listings?category=${cat.name}`} key={cat.name} style={styles.catCard}>
              <span style={styles.catIcon}>{cat.icon}</span>
              <span style={styles.catName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
      <div style={styles.howItWorks}>
        <h2 style={styles.catTitle}>How It Works</h2>
        <div style={styles.stepsGrid}>
          <div style={styles.step}>
            <div style={styles.stepIcon}>1</div>
            <h3 style={styles.stepTitle}>Create Account</h3>
            <p style={styles.stepText}>Sign up with your details to join the campus marketplace</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepIcon}>2</div>
            <h3 style={styles.stepTitle}>Post or Browse</h3>
            <p style={styles.stepText}>List items you want to sell or browse what others are offering</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepIcon}>3</div>
            <h3 style={styles.stepTitle}>Connect & Deal</h3>
            <p style={styles.stepText}>Message the seller, agree on a price and meet on campus</p>
          </div>
        </div>
      </div>
      <div style={styles.footer}>
        <p style={styles.footerText}>🌱 Promoting sustainability and reducing waste on campus</p>
        <p style={styles.footerSub}>Evelyn Hone College © 2026</p>
      </div>
    </div>
  )
}

const styles = {
  container: { fontFamily:'Arial, sans-serif' },
  hero: { background:'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', color:'white', padding:'4rem 1.5rem', textAlign:'center' },
  heroContent: { maxWidth:'600px', margin:'0 auto' },
  title: { fontSize:'clamp(1.5rem, 5vw, 2.5rem)', marginBottom:'1rem', color:'#e94560', lineHeight:'1.2' },
  subtitle: { fontSize:'clamp(0.9rem, 3vw, 1.2rem)', marginBottom:'2rem', color:'#ccc', lineHeight:'1.6' },
  buttons: { display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' },
  primaryBtn: { background:'#e94560', color:'white', padding:'0.8rem 1.5rem', borderRadius:'8px', textDecoration:'none', fontWeight:'bold', fontSize:'clamp(0.85rem, 2.5vw, 1rem)' },
  secondaryBtn: { background:'transparent', color:'white', padding:'0.8rem 1.5rem', borderRadius:'8px', textDecoration:'none', border:'2px solid white', fontSize:'clamp(0.85rem, 2.5vw, 1rem)' },
  statsBar: { background:'#e94560', color:'white', padding:'1rem', display:'flex', justifyContent:'center', gap:'1.5rem', flexWrap:'wrap', fontSize:'clamp(0.75rem, 2vw, 0.9rem)' },
  stat: { fontWeight:'bold' },
  categories: { padding:'3rem 1.5rem', textAlign:'center', maxWidth:'900px', margin:'0 auto' },
  catTitle: { fontSize:'clamp(1.2rem, 4vw, 1.8rem)', marginBottom:'2rem', color:'#1a1a2e' },
  catGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:'1rem' },
  catCard: { background:'#1a1a2e', color:'white', padding:'1.2rem 0.8rem', borderRadius:'12px', textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem', transition:'transform 0.2s' },
  catIcon: { fontSize:'2rem' },
  catName: { fontSize:'0.85rem', fontWeight:'bold' },
  howItWorks: { padding:'3rem 1.5rem', background:'#f9f9f9', textAlign:'center' },
  stepsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'2rem', maxWidth:'900px', margin:'0 auto' },
  step: { background:'white', padding:'2rem 1.5rem', borderRadius:'12px', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  stepIcon: { width:'50px', height:'50px', borderRadius:'50%', background:'#e94560', color:'white', fontSize:'1.5rem', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' },
  stepTitle: { color:'#1a1a2e', marginBottom:'0.5rem', fontSize:'1rem' },
  stepText: { color:'#888', fontSize:'0.85rem', lineHeight:'1.6' },
  footer: { background:'#1a1a2e', color:'white', padding:'2rem', textAlign:'center' },
  footerText: { color:'#ccc', marginBottom:'0.5rem' },
  footerSub: { color:'#666', fontSize:'0.85rem' }
}

export default Home
