import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { API_BASE } from '../lib/apiBase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('guide')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const auth = useAuth()
  const { t } = useI18n()

  const [touched, setTouched] = useState({ email: false, password: false })
  const emailValid = /.+@.+\..+/.test(email)
  const passwordValid = password.length >= 7

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setTouched({ email: true, password: true })
    if (!emailValid || !passwordValid) return
    setLoading(true)
    // Mock admin fallback: allow admin demo without backend
    if (role === 'admin' && email.toLowerCase() === 'admin@demo.com' && password === 'Admin@123') {
      auth.login('admin-demo-token', { email, role: 'admin', name: 'Demo Admin' })
      navigate('/admin', { replace: true })
      setLoading(false)
      return
    }
    fetch(new URL('/api/auth/login', API_BASE), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    })
      .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d)))
      .then((data) => {
        auth.login(data.token, data.user)
        navigate(role === 'admin' ? '/admin' : '/guide')
      })
      .catch((err) => setError(err?.message || 'Login failed'))
      .finally(() => setLoading(false))
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <h2 style={{marginTop:0}}>{t('loginTitle')}</h2>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form className="auth-grid" onSubmit={handleSubmit}>
          <div role="group" aria-labelledby="login-role-group" style={{display:'flex', gap: '12px'}}>
            <span id="login-role-group" style={{alignSelf:'center'}}>{t('role')}</span>
            <label style={{display:'inline-flex', gap:'6px', alignItems:'center'}}>
              <input type="radio" name="role" value="guide" checked={role === 'guide'} onChange={() => setRole('guide')} />
              {t('guideLogin')}
            </label>
            <label style={{display:'inline-flex', gap:'6px', alignItems:'center'}}>
              <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} />
              {t('adminLogin')}
            </label>
          </div>
          <label>
            <span>{t('email')}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className={!emailValid && touched.email ? 'input-error' : ''}
            required
          />
          {!emailValid && touched.email && (
            <div className="field-error">{t('emailInvalid')}</div>
          )}
          </label>
          <label>
            <span>{t('password')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            className={!passwordValid && touched.password ? 'input-error' : ''}
            required
          />
          {!passwordValid && touched.password && (
            <div className="field-error">{t('passwordMin7')}</div>
          )}
          </label>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? t('pleaseWait') : t('login')}</button>
        </form>
        <div style={{marginTop: '14px'}}>
          {t('registerGuideLink')}? <Link to="/register-guide" className="nav-link" style={{padding:0}}>{t('registerGuideLink')}</Link>
          <div style={{marginTop:8, fontSize:'.9rem', opacity:.85}}>
            {t('adminDemoHint')}
          </div>
        </div>
      </div>
    </main>
  )
}
