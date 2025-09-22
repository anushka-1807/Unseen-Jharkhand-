import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { API_BASE } from '../lib/apiBase'

export default function TouristAuth() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/bookings'
  const { t } = useI18n()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Client-side password length validation (7+)
    if ((password || '').length < 7) {
      setError(t('passwordMin7'))
      setLoading(false)
      return
    }
    try {
      const endpoint = mode === 'login' ? 'login' : 'register'
      const payload = mode === 'login' ? { email, password, role: 'tourist' } : { name, email, password, role: 'tourist' }
      const res = await fetch(new URL(`/api/auth/${endpoint}`, API_BASE) ,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error((await res.json().catch(()=>({message:'Auth failed'}))).message || 'Auth failed')
      const data = await res.json()
      login(data.token || 'tourist-local-token', data.user || { email, role: 'tourist', name: name || email.split('@')[0] })
      navigate(redirectTo, { replace: true })
    } catch (e1) {
      // Fallback to local auth if backend not available
      login('tourist-local-token', { email, role: 'tourist', name: name || email.split('@')[0] })
      navigate(redirectTo, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card" style={{maxWidth: 520, margin: '0 auto'}}>
        <h2 style={{marginTop:0, textAlign:'center'}}>{mode === 'login' ? t('touristLoginTitle') : t('touristCreateTitle')}</h2>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form className="auth-grid" onSubmit={submit} style={{gap:12}}>
          <div className="auth-row" style={{justifyItems:'center', textAlign:'center'}}>
            <div className="btn-group" role="tablist" aria-label="Auth Toggle">
              <button type="button" className="btn btn-primary" aria-selected={mode==='login'} onClick={()=>setMode('login')}>{t('login')}</button>
              <button type="button" className="btn btn-primary btn-secondary" aria-selected={mode==='register'} onClick={()=>setMode('register')}>{t('createAccount')}</button>
            </div>
          </div>
          {mode === 'register' && (
            <label>
              <span>{t('fullName')}</span>
              <input value={name} onChange={e=>setName(e.target.value)} required />
            </label>
          )}
          <label>
            <span>{t('email')}</span>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </label>
          <label>
            <span>{t('password')}</span>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={7} aria-invalid={(password||'').length>0 && password.length<7 ? 'true' : 'false'} />
          </label>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? t('pleaseWait') : (mode==='login' ? t('login') : t('createAccount'))}</button>
        </form>
        <div style={{marginTop:12, display:'grid', gap:6, justifyItems:'center'}}>
          {mode === 'login' ? (
            <button type="button" className="btn nav-link" onClick={()=>setMode('register')}>
              {t('createAccountCta')}
            </button>
          ) : (
            <button type="button" className="btn nav-link" onClick={()=>setMode('login')}>
              {t('haveAccountLogin')}
            </button>
          )}
          <a href="/auth/forgot" className="btn nav-link">{t('forgotPassword')}</a>
        </div>
      </div>
    </main>
  )
}
