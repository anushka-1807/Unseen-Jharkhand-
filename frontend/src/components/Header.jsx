import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

export default function Header() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const { t, lang, setLang } = useI18n()

  const isGuide = isAuthenticated && user?.role === 'guide'

  // Toggle header tint after scrolling
  useEffect(() => {
    const headerEl = document.querySelector('.site-header')
    if (!headerEl) return
    const onScroll = () => {
      if (window.scrollY > 8) headerEl.classList.add('scrolled')
      else headerEl.classList.remove('scrolled')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Theme toggle (dark/light)
  useEffect(() => {
    const root = document.documentElement
    const stored = localStorage.getItem('theme')
    let theme = stored
    if (!theme) {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      theme = prefersLight ? 'light' : 'dark'
    }
    root.setAttribute('data-theme', theme)
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    const current = root.getAttribute('data-theme') || 'dark'
    const next = current === 'light' ? 'dark' : 'light'
    root.setAttribute('data-theme', next)
    try { localStorage.setItem('theme', next) } catch {}
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to={isGuide ? '/guide' : '/'} className="brand">
          <span className="brand-mark" aria-hidden>⟡</span>
          Unseen Jharkhand
        </Link>
        <nav className="nav">
          {!isGuide && (
            <>
              <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">{t('home')}</Link>
              <Link className={`nav-link ${location.pathname === '/bookings' ? 'active' : ''}`} to="/bookings">{t('bookings')}</Link>
              <Link className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`} to="/about">{t('about')}</Link>
              {!isAuthenticated && (
                <Link className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`} to="/login">{t('login')}</Link>
              )}
            </>
          )}
          {isGuide && (
            <Link className={`nav-link ${location.pathname.startsWith('/guide') ? 'active' : ''}`} to="/guide">Dashboard</Link>
          )}
          {isAuthenticated && (
            <>
              {/* Show badge only for non-tourist roles */}
              {user?.role && user.role !== 'tourist' && (
                <span className="user-badge" title={user?.email || ''}>
                  {user.role === 'admin' ? 'Admin' : (user.role === 'guide' ? 'Guide' : user.role)}
                </span>
              )}
              <button
                className="nav-link"
                style={{background:'transparent', border:'none', cursor:'pointer'}}
                onClick={() => { logout(); navigate('/') }}
              >
                {t('logout')}
              </button>
            </>
          )}
          <button
            className="nav-link"
            style={{background:'transparent', cursor:'pointer'}}
            title="Toggle theme"
            onClick={toggleTheme}
            type="button"
          >
            🌓
          </button>
          <select aria-label="Language" className="nav-link" value={lang} onChange={(e) => setLang(e.target.value)} style={{padding:'6px 10px'}}>
            <option value="en">EN</option>
            <option value="hi">हिं</option>
            <option value="jh">JH</option>
          </select>
        </nav>
      </div>
    </header>
  )
}
