import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'https://evelyn-hone-market-production.up.railway.app'

function CreateListing() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [listingType, setListingType] = useState('product')
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/categories/`)
      setCategories(res.data)
      if (res.data.length > 0) setCategory(res.data[0].name)
    } catch (err) {
      console.error(err)
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  if (!user.seller_approved) {
    return (
      <div style={styles.blockedPage}>
        <div style={styles.blockedCard}>
          <div style={styles.blockedIcon}>🔒</div>
          <h2 style={styles.blockedTitle}>Seller Approval Required</h2>
          <p style={styles.blockedText}>
            To post listings you need to be approved as a seller first.
            Submit your student ID on your profile to get started.
          </p>
          <div style={styles.steps}>
            {['Go to your Profile', 'Submit your Student ID', 'Wait for admin approval', 'Start selling!'].map((s, i) => (
              <div key={i} style={styles.step}>
                <span style={styles.stepNum}>{i+1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
          {user.student_id ? (
            <div style={styles.pendingBox}>⏳ Your student ID <strong>{user.student_id}</strong> is pending approval.</div>
          ) : (
            <button style={styles.profileBtn} onClick={() => navigate('/profile')}>Go to Profile to Apply</button>
          )}
        </div>
      </div>
    )
  }

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result])
        setPreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setError('')
    if (!title || !price) { setError('Title and price are required.'); return }
    setLoading(true)
    try {
      await axios.post(`${API}/api/listings/`, {
        title, description, price: parseFloat(price),
        category, listing_type: listingType,
        image: images[0] || null,
        user_id: user.user_id
      })
      navigate('/listings')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing. Try again.')
    }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.formHeader}>
          <h2 style={styles.title}>Create a Listing</h2>
          <p style={styles.subtitle}>Fill in the details to post your item or service</p>
        </div>
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}
        <div style={styles.section}>
          <label style={styles.label}>Title *</label>
          <input style={styles.input} type="text" placeholder="What are you selling?" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div style={styles.section}>
          <label style={styles.label}>Description</label>
          <textarea style={styles.textarea} placeholder="Describe your item in detail..." value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div style={styles.row}>
          <div style={{flex:1}}>
            <label style={styles.label}>Price (K) *</label>
            <input style={styles.input} type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>Category</label>
            <select style={styles.input} value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={styles.label}>Type</label>
            <select style={styles.input} value={listingType} onChange={e => setListingType(e.target.value)}>
              <option value="product">Product</option>
              <option value="service">Service</option>
            </select>
          </div>
        </div>
        <div style={styles.section}>
          <label style={styles.label}>Images</label>
          <label style={styles.imageUpload}>
            <span style={styles.uploadIcon}>📷</span>
            <span>Click to upload images</span>
            <input type="file" accept="image/*" multiple onChange={handleImages} style={{display:'none'}} />
          </label>
          {previews.length > 0 && (
            <div style={styles.previewGrid}>
              {previews.map((src, i) => (
                <div key={i} style={styles.previewWrapper}>
                  <img src={src} alt="preview" style={styles.preview} />
                  <button style={styles.removeBtn} onClick={() => removeImage(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={styles.btnRow}>
          <button style={styles.cancelBtn} onClick={() => navigate('/listings')}>Cancel</button>
          <button style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Posting...' : 'Post Listing'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight:'100vh', background:'#f5f5f5', padding:'1.5rem', fontFamily:'Arial, sans-serif' },
  container: { maxWidth:'700px', margin:'0 auto', background:'white', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  formHeader: { marginBottom:'1.5rem', borderBottom:'2px solid #f0f0f0', paddingBottom:'1rem' },
  title: { color:'#1a1a2e', fontSize:'1.4rem', marginBottom:'0.3rem' },
  subtitle: { color:'#888', fontSize:'0.88rem' },
  errorBox: { background:'#fff0f0', border:'1px solid #e94560', color:'#c0392b', padding:'0.8rem', borderRadius:'8px', marginBottom:'1rem', fontSize:'0.9rem' },
  section: { marginBottom:'1.2rem' },
  row: { display:'flex', gap:'0.8rem', marginBottom:'1.2rem', flexWrap:'wrap' },
  label: { display:'block', color:'#1a1a2e', fontWeight:'bold', marginBottom:'0.4rem', fontSize:'0.88rem' },
  input: { width:'100%', padding:'0.8rem', borderRadius:'8px', border:'2px solid #eee', fontSize:'0.95rem', boxSizing:'border-box', outline:'none', color:'#1a1a2e', background:'#fafafa' },
  textarea: { width:'100%', padding:'0.8rem', borderRadius:'8px', border:'2px solid #eee', fontSize:'0.95rem', boxSizing:'border-box', height:'100px', outline:'none', background:'#fafafa', resize:'vertical', color:'#1a1a2e' },
  imageUpload: { display:'flex', alignItems:'center', gap:'0.8rem', padding:'1.2rem', border:'2px dashed #ddd', borderRadius:'8px', cursor:'pointer', color:'#888', justifyContent:'center' },
  uploadIcon: { fontSize:'1.5rem' },
  previewGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(90px, 1fr))', gap:'0.5rem', marginTop:'0.8rem' },
  previewWrapper: { position:'relative' },
  preview: { width:'100%', aspectRatio:'1', objectFit:'cover', borderRadius:'8px' },
  removeBtn: { position:'absolute', top:'4px', right:'4px', background:'#e94560', color:'white', border:'none', borderRadius:'50%', width:'20px', height:'20px', cursor:'pointer', fontSize:'0.7rem' },
  btnRow: { display:'flex', gap:'1rem', marginTop:'1.5rem' },
  cancelBtn: { flex:1, padding:'0.9rem', background:'white', color:'#1a1a2e', border:'2px solid #1a1a2e', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'0.95rem' },
  submitBtn: { flex:2, padding:'0.9rem', background:'#e94560', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'0.95rem' },
  blockedPage: { minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', background:'#f5f5f5' },
  blockedCard: { background:'white', borderRadius:'12px', padding:'2rem', maxWidth:'500px', width:'100%', textAlign:'center', boxShadow:'0 4px 15px rgba(0,0,0,0.08)' },
  blockedIcon: { fontSize:'3rem', marginBottom:'1rem' },
  blockedTitle: { color:'#1a1a2e', marginBottom:'1rem' },
  blockedText: { color:'#666', lineHeight:'1.6', marginBottom:'1.5rem', fontSize:'0.9rem' },
  steps: { display:'flex', flexDirection:'column', gap:'0.8rem', marginBottom:'1.5rem', textAlign:'left' },
  step: { display:'flex', alignItems:'center', gap:'1rem', color:'#555', fontSize:'0.9rem' },
  stepNum: { width:'28px', height:'28px', borderRadius:'50%', background:'#e94560', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', flexShrink:0 },
  pendingBox: { background:'#fff9e6', border:'1px solid #f39c12', borderRadius:'8px', padding:'1rem', color:'#856404', fontSize:'0.9rem' },
  profileBtn: { background:'#e94560', color:'white', border:'none', padding:'0.9rem 2rem', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem' }
}

export default CreateListing
