import { Component } from 'react'
import { colors, radius, shadow, font, fontDisplay } from '../theme'

// Catches any unexpected error during rendering anywhere in the app tree
// and shows a recoverable screen instead of a permanent blank page.
// This is a safety net, not a substitute for fixing root causes — but it
// means a bad cached session, an unexpected null field, or any future
// bug of this shape degrades gracefully instead of taking the whole app
// down with no way back in for the user.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled error caught by ErrorBoundary:', error, info)
  }

  handleReset = () => {
    // Clear any locally-cached state that might be the cause, then
    // reload fresh. This mirrors what fixed the issue manually via
    // dev tools, but available to any user with one click.
    try {
      localStorage.clear()
    } catch (err) {
      // ignore — if localStorage itself is inaccessible, reload will
      // still help in most cases
    }
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.wrap}>
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.text}>
              This page hit an unexpected error. This is sometimes caused by outdated
              saved data in your browser. Resetting usually fixes it.
            </p>
            <button style={styles.btn} onClick={this.handleReset}>
              Reset &amp; Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg, padding: '1.5rem', fontFamily: font.family },
  card: { background: colors.surface, borderRadius: radius.lg, padding: '2.5rem', maxWidth: '420px', width: '100%', textAlign: 'center', border: `1px solid ${colors.border}`, boxShadow: shadow.md },
  icon: { fontSize: '2.8rem', marginBottom: '1rem' },
  title: { fontFamily: fontDisplay, color: colors.text, marginBottom: '0.75rem', fontSize: '1.3rem', fontWeight: 600 },
  text: { color: colors.textMuted, lineHeight: 1.7, marginBottom: '1.75rem', fontSize: '0.9rem' },
  btn: { background: colors.accent, color: 'white', border: 'none', padding: '0.85rem 2rem', borderRadius: radius.pill, cursor: 'pointer', fontWeight: 700, fontSize: '0.92rem' },
}

export default ErrorBoundary
