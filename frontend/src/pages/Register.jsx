import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/api/auth/register', { username, email, password })
      navigate('/login')
    } catch (err) {
      setError('Registration failed. Try again.')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={styles.btn} onClick={handleRegister}>Register</button>
        <p style={styles.link}>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'80vh', background:'#f5f5f5' },
  card: { background:'white', padding:'2rem', borderRadius:'8px', width:'100%', maxWidth:'400px', boxShadow:'0 2px 10px rgba(0,0,0,0.1)' },
  title: { textAlign:'center', color:'#1a1a2e', marginBottom:'1.5rem' },
  input: { width:'100%', padding:'0.8rem', marginBottom:'1rem', borderRadius:'4px', border:'1px solid #ddd', boxSizing:'border-box' },
  btn: { width:'100%', padding:'0.8rem', background:'#e94560', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', fontWeight:'bold' },
  error: { color:'red', textAlign:'center' },
  link: { textAlign:'center', marginTop:'1rem' }
}

export default Register