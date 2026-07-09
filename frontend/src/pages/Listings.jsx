import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { colors, radius, shadow, font, fontDisplay } from '../theme'
const API = import.meta.env.VITE_API_URL

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
        ? `${API}/api/listings/?category=${category}`
        : `${API}/api/listings/`
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
      l.sellerUsername.toLowerCase().includes(search.toLowerCase())
    const matchesMin = !minPrice || l.price >= parseFloat(minPrice)
    const matchesMax = !maxPrice || l.price <= parseFloat(maxPrice)
    const matchesCondition = !condition || l.listingType === condition
    return matchesSearch && matchesMin && matchesMax && matchesCondition
  })
  if (sortBy === 'newest') filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (sortBy === 'oldest') filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
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
        <h1 style={styles.title}>Campus Listings</h1>
        <div style={styles.searchRow}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              style={styles.search}
              type="text"
              placeholder="Search listings, sellers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            style={{...styles.filterToggle, ...(showFilters ? styles.filterToggleActive : {})}}
            onClick={() => setShowFilters(!showFilters)}
            className="btn-hover"
          >
            Filters {activeFiltersCount > 0 && <span style={styles.filterCount}>{activeFiltersCount}</span>}
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
          {activeFiltersCount > 0 && <span style={styles.activeFiltersNote}> · filters active</span>}
        </p>
      </div>

      <div style={styles.grid}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⌕</div>
            <h3 style={styles.emptyTitle}>No listings found</h3>
            <p style={styles.emptyText}>Try adjusting your search or filters</p>
            <button style={styles.clearFiltersBtn} onClick={clearFilters} className="btn-hover">Clear Filters</button>
          </div>
        ) : (
          filtered.map(listing => (
            <div key={listing.id} style={styles.card} className="card-hover">
              <div style={styles.imageWrapper}>
                {listing.images && listing.images[0] ? (
                  <img src={listing.images[0]} alt={listing.title} style={styles.image} />
                ) : (
                  <div style={styles.noImage}>📷 No Image</div>
                )}
                <button
                  style={{...styles.favBtn, color: isFavorite(listing.id) ? colors.accent : '#CFC9D6'}}
                  onClick={() => toggleFavorite(listing.id)}
                >♥</button>
                {listing.status === 'sold' && <div style={styles.soldBadge}>SOLD</div>}
                {listing.status === 'reserved' && <div style={styles.reservedBadge}>RESERVED</div>}
              </div>
              <div style={styles.cardBody}>
                <div style={styles.cardTop}>
                  <span style={styles.category}>{listing.category}</span>
                  <span style={styles.listingType}>{listing.listingType}</span>
                </div>
                <h3 style={styles.cardTitle}>{listing.title}</h3>
                <p style={styles.cardDesc}>{listing.description.substring(0, 80)}...</p>
                <p style={styles.price}>K{listing.price}</p>
                <div style={styles.sellerRow}>
                  <div style={styles.sellerAvatar}>{listing.sellerUsername[0].toUpperCase()}</div>
                  <span style={styles.sellerName}>{listing.sellerUsername}</span>
                  {listing.sellerVerified && <span style={styles.verifiedBadge}>✓</span>}
                </div>
                <div style={styles.btnRow}>
                  <button
                    style={styles.viewBtn}
                    className="btn-hover"
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  >View</button>
                  <button
                    style={styles.contactBtn}
                    className="btn-hover"
                    onClick={() => navigate(`/messages?seller=${listing.sellerId}&listing=${listing.id}`)}
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
  page: { padding: '1.75rem 1.5rem 2.5rem', maxWidth: '1200px', margin: '0 auto', fontFamily: font.family },
  header: { marginBottom: '1.75rem' },
  title: { fontFamily: fontDisplay, color: colors.text, fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '1.25rem', fontWeight: 600 },
  searchRow: { display: 'flex', gap: '0.75rem', marginBottom: '0.9rem' },
  searchWrap: { flex: 1, display: 'flex', alignItems: 'center', gap: '0.6rem', background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radius.pill, padding: '0.75rem 1.1rem' },
  searchIcon: { color: colors.textFaint },
  search: { flex: 1, border: 'none', outline: 'none', fontSize: '0.92rem', color: colors.text, background: 'transparent', fontFamily: font.family },
  filterToggle: { padding: '0.75rem 1.3rem', color: colors.text, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' },
  filterToggleActive: { background: colors.ink, color: 'white', borderColor: colors.ink },
  filterCount: { background: colors.accent, color: 'white', borderRadius: '50%', width: '19px', height: '19px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700 },
  filtersPanel: { background: colors.surface, borderRadius: radius.lg, padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${colors.border}`, boxShadow: shadow.sm },
  filterRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  filterLabel: { color: colors.textMuted, fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' },
  filterInput: { padding: '0.65rem 0.8rem', borderRadius: radius.sm, border: `1px solid ${colors.border}`, fontSize: '0.88rem', color: colors.text, background: colors.bg, fontFamily: font.family },
  clearBtn: { padding: '0.65rem 1rem', background: colors.bg, color: colors.textMuted, border: `1px solid ${colors.border}`, borderRadius: radius.sm, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' },
  resultCount: { color: colors.textFaint, fontSize: '0.85rem' },
  activeFiltersNote: { color: colors.accent, fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' },
  card: { background: colors.surface, borderRadius: radius.lg, overflow: 'hidden', border: `1px solid ${colors.border}` },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' },
  noImage: { width: '100%', aspectRatio: '16/9', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textFaint },
  favBtn: { position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '34px', height: '34px', fontSize: '1.1rem', cursor: 'pointer', boxShadow: shadow.sm },
  soldBadge: { position: 'absolute', top: '10px', left: '10px', background: colors.ink, color: 'white', padding: '0.25rem 0.65rem', borderRadius: radius.sm, fontSize: '0.7rem', fontWeight: 700 },
  reservedBadge: { position: 'absolute', top: '10px', left: '10px', background: '#D97706', color: 'white', padding: '0.25rem 0.65rem', borderRadius: radius.sm, fontSize: '0.7rem', fontWeight: 700 },
  cardBody: { padding: '1.2rem' },
  cardTop: { display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' },
  category: { background: colors.accentPale, color: colors.accentDark, padding: '0.22rem 0.65rem', borderRadius: radius.pill, fontSize: '0.72rem', fontWeight: 700 },
  listingType: { background: colors.bg, color: colors.textMuted, padding: '0.22rem 0.65rem', borderRadius: radius.pill, fontSize: '0.72rem', fontWeight: 700, border: `1px solid ${colors.border}` },
  cardTitle: { color: colors.text, marginBottom: '0.45rem', fontSize: '1.02rem', fontWeight: 700 },
  cardDesc: { color: colors.textMuted, marginBottom: '0.8rem', fontSize: '0.85rem', lineHeight: 1.55 },
  price: { fontFamily: fontDisplay, color: colors.accent, fontWeight: 700, fontSize: '1.35rem', marginBottom: '0.8rem' },
  sellerRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
  sellerAvatar: { width: '26px', height: '26px', borderRadius: '50%', background: colors.ink, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 },
  sellerName: { color: colors.textMuted, fontSize: '0.85rem' },
  verifiedBadge: { background: colors.successBg, color: '#16803D', padding: '0.1rem 0.4rem', borderRadius: radius.pill, fontSize: '0.66rem', fontWeight: 700 },
  btnRow: { display: 'flex', gap: '0.5rem' },
  viewBtn: { flex: 1, padding: '0.7rem', background: colors.ink, color: 'white', border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' },
  contactBtn: { flex: 1, padding: '0.7rem', background: colors.accent, color: 'white', border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' },
  emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '1rem', color: colors.textFaint },
  emptyTitle: { fontFamily: fontDisplay, color: colors.text, fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 600 },
  emptyText: { color: colors.textMuted, marginBottom: '1.5rem' },
  clearFiltersBtn: { background: colors.accent, color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700 },
}

export default Listings
