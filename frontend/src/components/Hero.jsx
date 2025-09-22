import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../context/I18nContext'

export default function Hero() {
  const { t } = useI18n()
  const sources = [
    '/videos/jharkhand-heritage-2.mp4',
    '/videos/jharkhand-heritage-1.mp4',

  ]

  const vidARef = useRef(null)
  const vidBRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [useA, setUseA] = useState(true)
  const indexRef = useRef(0)

  // Initialize and handle crossfade on ended
  useEffect(() => {
    const a = vidARef.current
    const b = vidBRef.current
    if (!a || !b) return

    // Prepare first video
    a.src = sources[0]
    a.load()
    a.play().catch(() => {})
    a.classList.add('visible')

    const onEndedA = () => {
      const next = (indexRef.current + 1) % sources.length
      b.src = sources[next]
      b.load()
      b.play().catch(() => {})
      // crossfade
      a.classList.remove('visible')
      b.classList.add('visible')
      setIndex(next)
      indexRef.current = next
      setUseA(false)
    }

    const onEndedB = () => {
      const next = (indexRef.current + 1) % sources.length
      a.src = sources[next]
      a.load()
      a.play().catch(() => {})
      // crossfade
      b.classList.remove('visible')
      a.classList.add('visible')
      setIndex(next)
      indexRef.current = next
      setUseA(true)
    }

    a.addEventListener('ended', onEndedA)
    b.addEventListener('ended', onEndedB)
    return () => {
      a.removeEventListener('ended', onEndedA)
      b.removeEventListener('ended', onEndedB)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <section className="hero">
        {/* Two-layer video crossfade */}
        <video
          ref={vidARef}
          className="hero-video"
          muted
          playsInline
          poster="/poster.jpg"
          autoPlay
        />
        <video
          ref={vidBRef}
          className="hero-video"
          muted
          playsInline
          poster="/poster.jpg"
          autoPlay
        />
        {/* Floating right-side Tour Buddy button with icon */}
        <Link to="/tour-buddy" className="tour-buddy-btn" aria-label={t('tourBuddy')}>
          <span className="tb-icon" aria-hidden>🧭</span>
          {t('tourBuddy')}
        </Link>
        <div className="hero-overlay" />
        <div className="hero-content container">
          <h1 className="hero-title">{t('exploreTitle')}</h1>
          <p className="hero-subtitle">Celebrating the spirit, rhythm, and colors of Jharkhand's tribal heritage.</p>
          <div className="hero-cta">
            <div className="btn-group" onMouseLeave={() => setMenuOpen(false)}>
              <a href="#discover" className="btn btn-primary">Explore Us</a>
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                className="btn btn-secondary"
                onClick={() => setMenuOpen(v => !v)}
                onBlur={() => setTimeout(()=>setMenuOpen(false), 120)}
                title="More ways to explore"
              >
                ▾
              </button>
              {menuOpen && (
                <div className="dropdown">
                  <a href="/about#cuisines">Cuisines</a>
                  <a href="/about#arts">Arts & Culture</a>
                  <a href="/about#tribes">Tribes</a>
                  <a href="/about#places">Famous Places</a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="tribal-border top" aria-hidden />
        <div className="tribal-border bottom" aria-hidden />
      </section>
      {/* Highlights removed; keep anchor target so the CTA still scrolls */}
      <div id="discover" style={{height: 1}} aria-hidden />
    </>
  )
}
