import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Listings() {
  const [listings, setListings] = useState([])
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [condition, setCondition] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchListings()
  }, [category])

  const fetchListings = async () => {
    try {
      const url = category
        ? `http://127.0.0.1:5000/api/listings/?category=${category}`
        : 'http://127.0.0.1:5000/api/listings/'
      const res = await axios.get(url)
      setListings(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setCondition('')
    setSortBy('newest')
    setCategory('')
  }

  let filtered = listings.filter(l => {
    const matchesSearch = !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.seller_username.toLowerCase().includes(search.toLowerCase())
    const matchesMin = !minPrice || l.price >= parseFloat(minPrice)
    const matchesMax = !maxPrice || l.price <= parseFloat(maxPrice)
    const matchesCondition = !condition || l.listing_type === condition
    return matchesSearch && matchesMin && matchesMax && matchesCondition
  })

  if (sortBy === 'newest') filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  if (sortBy === 'oldest') filtered = [...filtered].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  if (sortBy === 'price_low') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sortBy === 'price_high') filtered = [...filtered].sort((a, b) => b.price - a.price)

  const toggleFavorite = (id) => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
    const updated = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]
    localStorage.setItem('favorites', JSON.stringify(updated))
    setListings([...listings])
  }

  const isFavorite = (id) => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]')
    return favs.includes(id)
  }

  const activeFiltersCount = [search, minPrice, maxPrice, condition, category].filter(Boolean).length

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Campus Listings</h2>
        <div style={styles.searchRow}>
          <input
            style={styles.search}
            type="text"
            placeholder="Search listings, sellers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            style={{...styles.filterToggle, background: showFilters ? '#e94560' : '#1a1a2e'}}
            onClick={() => setShowFilters(!showFilters)}
          >
            🔧 Filters {activeFiltersCount > 0 && <span style={styles.filterCount}>{activeFiltersCount}</span>}
          </button>
        </div>
        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filterRow}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Category</label>
                <select style={styles.filterInput} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Textbooks">Textbooks</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Food">Food</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Type</label>
                <select style={styles.filterInput} value={condition} onChange={e => setCondition(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Sort By</label>
                <select style={styles.filterInput} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
            <div style={styles.filterRow}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Min Price (K)</label>
                <input style={styles.filterInput} type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Max Price (K)</label>
                <input style={styles.filterInput} type="number" placeholder="Any" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>&nbsp;</label>
                <button style={styles.clearBtn} onClick={clearFilters}>Clear All Filters</button>
              </div>
            </div>
          </div>
        )}
        <p style={styles.resultCount}>
          {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
          {activeFiltersCount > 0 && <span style={styles.activeFiltersNote}> (filters active)</span>}
        </p>
      </div>
      <div style={styles.grid}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3 style={styles.emptyTitle}>No listings found</h3>
            <p style={styles.emptyText}>Try adjusting your search or filters</p>
            <button style={styles.clearFiltersBtn} onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          filtered.map(listing => (
            <div key={listing.id} style={styles.card}>
              <div style={styles.imageWrapper}>
                {listing.image ? (
                  <img src={listing.image} alt={listing.title} style={styles.image} />
                ) : (
                  <div style={styles.noImage}>📷 No Image</div>
                )}
                <button
                  style={{...styles.favBtn, color: isFavorite(listing.id) ? '#e94560' : '#ccc'}}
                  onClick={() => toggleFavorite(listing.id)}
                >♥</button>
                {listing.status === 'sold' && <div style={styles.soldBadge}>SOLD</div>}
                {listing.status === 'reserved' && <div style={styles.reservedBadge}>RESERVED</div>}
              </div>
              <div style={styles.cardBody}>
                <div style={styles.cardTop}>
                  <span style={styles.category}>{listing.category}</span>
                  <span style={styles.listingType}>{listing.listing_type}</span>
                </div>
                <h3 style={styles.cardTitle}>{listing.title}</h3>
                <p style={styles.cardDesc}>{listing.description.substring(0, 80)}...</p>
                <p style={styles.price}>K{listing.price}</p>
                <div style={styles.sellerRow}>
                  <div style={styles.sellerAvatar}>{listing.seller_username[0].toUpperCase()}</div>
                  <span style={styles.sellerName}>{listing.seller_username}</span>
                  {listing.seller_verified && <span style={styles.verifiedBadge}>✓</span>}
                </div>
                <div style={styles.btnRow}>
                  <button
                    style={styles.viewBtn}
                    onMouseEnter={e => e.target.style.background='#e94560'}
                    onMouseLeave={e => e.target.style.background='#1a1a2e'}
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  >View</button>
                  <button
                    style={styles.contactBtn}
                    onClick={() => navigate(`/messages?seller=${listing.seller_id}&listing=${listing.id}`)}
                  >Contact</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { padding:'1.5rem', maxWidth:'1200px', margin:'0 auto', fontFamily:'Arial, sans-serif' },
  header: { marginBottom:'1.5rem' },
  title: { color:'#1a1a2e', fontSize:'clamp(1.3rem, 4vw, 1.8rem)', marginBottom:'1rem' },
  searchRow: { display:'flex', gap:'0.8rem', marginBottom:'0.8rem' },
  search: { flex:1, padding:'0.8rem 1rem', borderRadius:'8px', border:'2px solid #eee', fontSize:'1rem', outline:'none', color:'#1a1a2e' },
  filterToggle: { padding:'0.8rem 1.2rem', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'0.5rem' },
  filterCount: { background:'white', color:'#e94560', borderRadius:'50%', width:'20px', height:'20px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:'bold' },
  filtersPanel: { background:'white', borderRadius:'12px', padding:'1.5rem', marginBottom:'1rem', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  filterRow: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'1rem', marginBottom:'1rem' },
  filterGroup: { display:'flex', flexDirection:'column', gap:'0.4rem' },
  filterLabel: { color:'#888', fontSize:'0.82rem', fontWeight:'bold' },
  filterInput: { padding:'0.6rem 0.8rem', borderRadius:'8px', border:'2px solid #eee', fontSize:'0.9rem', color:'#1a1a2e', background:'white' },
  clearBtn: { padding:'0.6rem 1rem', background:'#f5f5f5', color:'#555', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9rem' },
  resultCount: { color:'#888', fontSize:'0.88rem' },
  activeFiltersNote: { color:'#e94560', fontWeight:'bold' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'1.5rem' },
  card: { background:'white', borderRadius:'12px', overflow:'hidden', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  imageWrapper: { position:'relative' },
  image: { width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block' },
  noImage: { width:'100%', aspectRatio:'16/9', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa' },
  favBtn: { position:'absolute', top:'10px', right:'10px', background:'white', border:'none', borderRadius:'50%', width:'32px', height:'32px', fontSize:'1.1rem', cursor:'pointer', boxShadow:'0 2px 5px rgba(0,0,0,0.2)' },
  soldBadge: { position:'absolute', top:'10px', left:'10px', background:'#333', color:'white', padding:'0.2rem 0.6rem', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold' },
  reservedBadge: { position:'absolute', top:'10px', left:'10px', background:'#f39c12', color:'white', padding:'0.2rem 0.6rem', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold' },
  cardBody: { padding:'1.2rem' },
  cardTop: { display:'flex', gap:'0.5rem', marginBottom:'0.8rem' },
  category: { background:'#1a1a2e', color:'white', padding:'0.2rem 0.6rem', borderRadius:'20px', fontSize:'0.75rem' },
  listingType: { background:'#e94560', color:'white', padding:'0.2rem 0.6rem', borderRadius:'20px', fontSize:'0.75rem' },
  cardTitle: { color:'#1a1a2e', marginBottom:'0.5rem', fontSize:'1.05rem' },
  cardDesc: { color:'#888', marginBottom:'0.8rem', fontSize:'0.88rem', lineHeight:'1.5' },
  price: { color:'#e94560', fontWeight:'bold', fontSize:'1.3rem', marginBottom:'0.8rem' },
  sellerRow: { display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' },
  sellerAvatar: { width:'28px', height:'28px', borderRadius:'50%', background:'#1a1a2e', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:'bold' },
  sellerName: { color:'#555', fontSize:'0.88rem' },
  verifiedBadge: { background:'#27ae60', color:'white', padding:'0.1rem 0.4rem', borderRadius:'10px', fontSize:'0.7rem', fontWeight:'bold' },
  btnRow: { display:'flex', gap:'0.5rem' },
  viewBtn: { flex:1, padding:'0.7rem', background:'#1a1a2e', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9rem', transition:'background 0.2s' },
  contactBtn: { flex:1, padding:'0.7rem', background:'#e94560', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'0.9rem' },
  emptyState: { gridColumn:'1/-1', textAlign:'center', padding:'4rem 2rem' },
  emptyIcon: { fontSize:'3rem', marginBottom:'1rem' },
  emptyTitle: { color:'#1a1a2e', fontSize:'1.3rem', marginBottom:'0.5rem' },
  emptyText: { color:'#888', marginBottom:'1.5rem' },
  clearFiltersBtn: { background:'#e94560', color:'white', border:'none', padding:'0.8rem 2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }
}

export default Listings
