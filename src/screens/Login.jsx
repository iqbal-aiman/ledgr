import { useState } from 'react'
import { checkPassword, changePassword } from '../database'
import './Login.css'

const RECOVERY_KEY = 'LEDGR-2847'

function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [recoveryKey, setRecoveryKey] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [recoveryMsg, setRecoveryMsg] = useState('')

  const handleSubmit = async () => {
    const correct = await checkPassword(password)
    if (correct) {
      onLogin()
    } else {
      setError('Incorrect password. Try again.')
      setShake(true)
      setPassword('')
      setTimeout(() => setShake(false), 500)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const handleRecovery = async () => {
    if (recoveryKey.trim().toUpperCase() !== RECOVERY_KEY) {
      setRecoveryMsg('Invalid recovery key. Try again.')
      return
    }
    if (newPassword.length < 6) {
      setRecoveryMsg('Password must be at least 6 characters.')
      return
    }
    await changePassword(newPassword)
    setRecoveryMsg('Password reset successfully!')
    setTimeout(() => {
      setShowForgot(false)
      setRecoveryKey('')
      setNewPassword('')
      setRecoveryMsg('')
    }, 1500)
  }

  const EyeIcon = ({ crossed }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="#948B76" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {crossed ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20
                   C7 20 2.73 16.39 1 12
                   a10.07 10.07 0 0 1 2.06-3.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4
                   c5 0 9.27 3.61 11 8
                   a10.12 10.12 0 0 1-1.17 2.06" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  )

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="hero-glow" />
        <div className="login-logo">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
            stroke="#C9A15A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2h12a1 1 0 0 1 1 1v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21V3a1 1 0 0 1 1-1z" />
            <line x1="8" y1="7" x2="16" y2="7" />
            <line x1="8" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h1>ledgr</h1>
        <p>Your shop. Your records.</p>
      </div>

      {!showForgot ? (
        <div className="login-body">
          <h2>Welcome Back</h2>
          <p>Enter your password to open the app</p>

          <div className={`input-group ${shake ? 'shake' : ''}`}>
            <label>PASSWORD</label>
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                onKeyDown={handleKey}
                autoFocus
              />
              <button className="eye-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} type="button">
                <EyeIcon crossed={showPassword} />
              </button>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn-primary pressable" onClick={handleSubmit}>
            Open Ledgr
          </button>

          <p className="forgot-link" onClick={() => { setShowForgot(true); setError('') }}>
            Forgot password?
          </p>
        </div>
      ) : (
        <div className="login-body">
          <h2>Reset Password</h2>
          <p>Enter your recovery key to set a new password</p>

          <div className="input-group">
            <label>RECOVERY KEY</label>
            <input
              className="solo-input"
              type="text"
              placeholder="e.g. LEDGR-2847"
              value={recoveryKey}
              onChange={e => setRecoveryKey(e.target.value.toUpperCase())}
            />
          </div>

          <div className="input-group">
            <label>NEW PASSWORD</label>
            <div className="password-wrap">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <button className="eye-btn" onClick={() => setShowNewPassword(!showNewPassword)} tabIndex={-1} type="button">
                <EyeIcon crossed={showNewPassword} />
              </button>
            </div>
          </div>

          {recoveryMsg && (
            <div className={`error-msg ${recoveryMsg.includes('success') ? 'success-msg' : ''}`}>
              {recoveryMsg}
            </div>
          )}

          <button className="btn-primary pressable" onClick={handleRecovery}>
            Reset Password
          </button>

          <p className="forgot-link" onClick={() => {
            setShowForgot(false); setRecoveryMsg(''); setRecoveryKey(''); setNewPassword('')
          }}>
            ← Back to login
          </p>

          <div className="recovery-hint">
            <p>Your recovery key is</p>
            <p className="recovery-key-text">LEDGR-2847</p>
            <p>Save this somewhere safe!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login