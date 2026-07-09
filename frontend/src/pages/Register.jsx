import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { saveAuth } from '../utils/auth'
import { colors, radius, shadow, font, fontDisplay } from '../theme'
const API = import.meta.env.VITE_API_URL

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    setError('')
    if (!username || !email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/auth/register`, { username, email, password, phone })
      saveAuth(res.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    }
    setLoading(false)
  }

  const getFieldHint = (field) => {
    if (field === 'username') {
      const len = username.length
      const valid = /^[a-zA-Z0-9_]+$/.test(username)
      if (!username) return null
      if (len < 3) return { msg: `${3 - len} more characters needed`, ok: false }
      if (!valid) return { msg: 'Letters, numbers and _ only', ok: false }
      return { msg: '✓ Looks good', ok: true }
    }
    if (field === 'password') {
      if (!password) return null
      if (password.length < 6) return { msg: `${6 - password.length} more characters needed`, ok: false }
      return { msg: '✓ Strong enough', ok: true }
    }
    return null
  }

  const usernameHint = getFieldHint('username')
  const passwordHint = getFieldHint('password')

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join the Evelyn Hone campus marketplace</p>
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Username</label>
          <input
            style={{...styles.input, borderColor: usernameHint ? (usernameHint.ok ? '#22C55E' : '#E5A5A5') : colors.border}}
            type="text"
            placeholder="e.g. tobi_ehc"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          {usernameHint && (
            <small style={{color: usernameHint.ok ? '#16803D' : '#C0392B', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block'}}>
              {usernameHint.msg}
            </small>
          )}
          <small style={styles.hint}>3-30 characters, letters, numbers and _ only</small>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <small style={styles.hint}>Must be a valid email address</small>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Phone Number</label>
          <input
            style={styles.input}
            type="tel"
            placeholder="e.g. 0775580799"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <small style={styles.hint}>So buyers can reach you about your listings</small>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            style={{...styles.input, borderColor: passwordHint ? (passwordHint.ok ? '#22C55E' : '#E5A5A5') : colors.border}}
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {passwordHint && (
            <small style={{color: passwordHint.ok ? '#16803D' : '#C0392B', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block'}}>
              {passwordHint.msg}
            </small>
          )}
          <small style={styles.hint}>Minimum 6 characters</small>
        </div>

        <button
          style={{...styles.btn, opacity: loading ? 0.7 : 1}}
          onClick={handleRegister}
          disabled={loading}
          className="btn-hover"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p style={styles.loginLink}>Already have an account? <Link to="/login" style={styles.linkA}>Login</Link></p>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: colors.bg, padding: '1.5rem', fontFamily: font.family },
  card: { background: colors.surface, padding: '2.25rem', borderRadius: radius.lg, width: '100%', maxWidth: '420px', border: `1px solid ${colors.border}`, boxShadow: shadow.md },
  title: { fontFamily: fontDisplay, textAlign: 'center', color: colors.text, marginBottom: '0.3rem', fontSize: '1.5rem', fontWeight: 600 },
  subtitle: { textAlign: 'center', color: colors.textMuted, marginBottom: '1.75rem', fontSize: '0.88rem' },
  errorBox: { background: '#FDF0F0', border: '1px solid #E5A5A5', color: '#C0392B', padding: '0.8rem', borderRadius: radius.sm, marginBottom: '1rem', fontSize: '0.9rem' },
  field: { marginBottom: '1.2rem' },
  label: { display: 'block', color: colors.text, fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.88rem' },
  input: { width: '100%', padding: '0.8rem 1rem', borderRadius: radius.sm, border: `1px solid ${colors.border}`, fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', color: colors.text, background: colors.bg, fontFamily: font.family, transition: 'border-color 0.2s' },
  hint: { color: colors.textFaint, fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' },
  btn: { width: '100%', padding: '0.9rem', background: colors.accent, color: 'white', border: 'none', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.5rem' },
  loginLink: { textAlign: 'center', marginTop: '1.25rem', color: colors.textMuted, fontSize: '0.88rem' },
  linkA: { color: colors.accent, fontWeight: 700, textDecoration: 'none' },
}

export default Register
