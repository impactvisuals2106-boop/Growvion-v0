'use client'

import { useState, FormEvent } from 'react'

interface AdminLoginProps {
  onLogin: () => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // MOCK PIN: '1907'
    if (pin === '1907') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('adminLoggedIn', 'true')
      }
      onLogin()
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 3000)
    }
  }

  return (
    <div className="container admin-login-container" id="loginScreen">
      <div className="login-box">
        <h2 style={{ marginBottom: '1rem' }}>Owner Access</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Enter your PIN to view dashboard
        </p>
        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              id="pinInput"
              placeholder="Enter PIN (1907)"
              style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem' }}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="submit-btn"
            style={{ background: 'var(--accent-primary)', color: 'white' }}
          >
            Login
          </button>
        </form>
        {error && (
          <p id="loginError" style={{ color: '#ff4757', marginTop: '1rem' }}>
            Incorrect PIN
          </p>
        )}
      </div>
    </div>
  )
}




