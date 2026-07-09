import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { saveAuth } from '../utils/auth'
import { colors, radius, shadow, font, fontDisplay } from '../theme'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password })
      saveAuth(res.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin() }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Log in to your campus market account</p>
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
        <button style={styles.btn} onClick={handleLogin} className="btn-hover">Login</button>
        <p style={styles.link}>Don't have an account? <Link to="/register" style={styles.linkA}>Register</Link></p>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: colors.bg, padding: '1.5rem', fontFamily: font.family },
  card: { background: colors.surface, padding: '2.25rem', borderRadius: radius.lg, width: '100%', maxWidth: '400px', border: `1px solid ${colors.border}`, boxShadow: shadow.md },
  title: { fontFamily: fontDisplay, textAlign: 'center', color: colors.text, marginBottom: '0.4rem', fontSize: '1.5rem', fontWeight: 600 },
  subtitle: { textAlign: 'center', color: colors.textMuted, marginBottom: '1.75rem', fontSize: '0.88rem' },
  errorBox: { background: '#FDF0F0', border: '1px solid #E5A5A5', color: '#C0392B', padding: '0.75rem', borderRadius: radius.sm, marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' },
  input: { width: '100%', padding: '0.85rem 1rem', marginBottom: '1rem', borderRadius: radius.sm, border: `1px solid ${colors.border}`, boxSizing: 'border-box', fontSize: '0.92rem', color: colors.text, background: colors.bg, fontFamily: font.family, outline: 'none' },
  btn: { width: '100%', padding: '0.85rem', background: colors.accent, color: 'white', border: 'none', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' },
  link: { textAlign: 'center', marginTop: '1.25rem', color: colors.textMuted, fontSize: '0.88rem' },
  linkA: { color: colors.accent, fontWeight: 700, textDecoration: 'none' },
}

export default Login
