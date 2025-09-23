import { useState } from 'react'
import { API_BASE } from '../lib/apiBase'

export default function Partner() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Login form
  const [shopIdLogin, setShopIdLogin] = useState('')
  const [passwordLogin, setPasswordLogin] = useState('')

  // Register form
  const [form, setForm] = useState({
    name: '',
    shopNumber: '',
    shopId: '',
    licence: '',
    location: '',
    phone: '',
    password: '',
    ownerName: '',
    category: ''
  })

  const submitLogin = async (e) => {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    try {
      const res = await fetch(new URL('/api/shops/login', API_BASE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shopIdLogin.trim(), password: passwordLogin })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Login failed')
      setMessage(`Welcome, ${data.shop?.ownerName || 'Partner'}!`)
    } catch (e1) {
      setError(e1.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const submitRegister = async (e) => {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    try {
      // Basic required check
      const reqd = ['name','shopNumber','shopId','licence','location','phone','password','ownerName','category']
      for (const k of reqd) {
        if (!String(form[k]||'').trim()) throw new Error('Please fill all fields')
      }
      const res = await fetch(new URL('/api/shops/register', API_BASE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Registration failed')
      setMessage('Registered successfully! You can now login with your Shop ID and password.')
      setForm({ name:'', shopNumber:'', shopId:'', licence:'', location:'', phone:'', password:'', ownerName:'', category:'' })
      setMode('login')
    } catch (e1) {
      setError(e1.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page container partner-page">
      <h2 className="section-title" style={{marginBottom: 4}}>Become a partner with us</h2>
      <p style={{textAlign:'center', opacity:.9, marginBottom: 16}}>Register your local shop or login to manage your profile.</p>

      <div className="auth-card" style={{margin:'0 auto', maxWidth: 720}}>
        <div style={{display:'flex', justifyContent:'center', marginBottom: 12}}>
          <div className="btn-group" role="tablist" aria-label="Partner auth toggle">
            <button className="btn btn-primary" type="button" aria-selected={mode==='login'} onClick={()=>setMode('login')}>Login</button>
            <button className="btn btn-primary btn-secondary" type="button" aria-selected={mode==='register'} onClick={()=>setMode('register')}>Register</button>
          </div>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {message && <div className="alert alert-success" role="status">{message}</div>}

        {mode === 'login' ? (
          <form className="auth-grid" onSubmit={submitLogin} style={{gap:12}}>
            <label>
              <span>Shop ID</span>
              <input value={shopIdLogin} onChange={e=>setShopIdLogin(e.target.value)} placeholder="e.g., JH-SHOP-001" required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" value={passwordLogin} onChange={e=>setPasswordLogin(e.target.value)} required minLength={7} />
            </label>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Please wait...' : 'Login'}</button>
          </form>
        ) : (
          <form className="auth-grid" onSubmit={submitRegister} style={{gap:12}}>
            <div className="auth-row two">
              <label>
                <span>Name of Shop</span>
                <input value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} required />
              </label>
              <label>
                <span>Shop Number</span>
                <input value={form.shopNumber} onChange={e=>setForm(f=>({...f, shopNumber:e.target.value}))} required />
              </label>
            </div>
            <div className="auth-row two">
              <label>
                <span>Shop ID</span>
                <input value={form.shopId} onChange={e=>setForm(f=>({...f, shopId:e.target.value}))} placeholder="e.g., JH-SHOP-011" required />
              </label>
              <label>
                <span>Licence</span>
                <input value={form.licence} onChange={e=>setForm(f=>({...f, licence:e.target.value}))} required />
              </label>
            </div>
            <div className="auth-row two">
              <label>
                <span>Location</span>
                <input value={form.location} onChange={e=>setForm(f=>({...f, location:e.target.value}))} required />
              </label>
              <label>
                <span>Phone Number</span>
                <input value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} required />
              </label>
            </div>
            <div className="auth-row two">
              <label>
                <span>Owner Name</span>
                <input value={form.ownerName} onChange={e=>setForm(f=>({...f, ownerName:e.target.value}))} required />
              </label>
              <label>
                <span>Category</span>
                <input value={form.category} onChange={e=>setForm(f=>({...f, category:e.target.value}))} placeholder="Handicrafts, Textiles, Food, ..." required />
              </label>
            </div>
            <label>
              <span>Password</span>
              <input type="password" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))} required minLength={7} />
            </label>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Please wait...' : 'Register Shop'}</button>
          </form>
        )}
      </div>
    </main>
  )
}
