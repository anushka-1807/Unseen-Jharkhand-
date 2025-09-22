import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../context/I18nContext'

const categories = [
  { key: 'places',  title: 'Tourist Places',        text: 'Waterfalls, valleys, viewpoints, and heritage sites.', href: '/about#places',  img: '/images/hl_nature.jpg'   },
  { key: 'arts',    title: 'Arts',                  text: 'Sohrai & Khovar murals, woodcraft, and folk art.',   href: '/arts',    img: '/images/hl_art.jpg'  },
  { key: 'culture', title: 'Folks & Culture',       text: 'Chhau dance, music, fairs, and festivals.',          href: '/folks',    img: '/images/hl_culture.jpg'  },
  { key: 'cuisine', title: 'Local Cuisine',         text: 'Dhuska, Pittha, Saag, Handia and more.',             href: '/about#cuisines',img: '/images/hl_cuisine.jpg'  },
  { key: 'attire',  title: 'Clothing & Ornaments',  text: 'Traditional attire, weaving, and local ornaments.',  href: '/about#attire',    img: '/images/hl_guides.jpg'   },
  { key: 'tribes',  title: 'Local Tribes',          text: 'Santhal, Ho, Munda, Oraon and many others.',         href: '/about#tribes',  img: '/images/hl_tribes.jpg'   },
]

export default function Discover() {
  const { t } = useI18n()
  const [idx, setIdx] = useState(0)
  const [hovered, setHovered] = useState(null)
  const viewportRef = useRef(null)
  const [viewportW, setViewportW] = useState(0)
  const gap = 16
  const [paused, setPaused] = useState(false)

  // Update viewport width on resize
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setViewportW(e.contentRect.width)
      }
    })
    ro.observe(el)
    setViewportW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const visibleCount = useMemo(() => {
    if (viewportW < 600) return 1
    if (viewportW < 900) return 2
    return 3
  }, [viewportW])

  const cardW = useMemo(() => {
    // compute card width based on visibleCount and viewport width
    const totalGap = gap * (visibleCount - 1)
    const w = Math.floor((viewportW - totalGap) / visibleCount)
    return Math.max(280, Math.min(480, w))
  }, [viewportW, visibleCount])

  const maxIdx = useMemo(() => Math.max(0, categories.length - visibleCount), [visibleCount])

  // Clamp index if visible count changes
  useEffect(() => {
    setIdx(i => Math.min(i, maxIdx))
  }, [maxIdx])

  // Autoplay with looping, pause on hover
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => {
      setIdx(i => (i >= maxIdx ? 0 : i + 1))
    }, 4000)
    return () => clearInterval(t)
  }, [paused, maxIdx])

  const trackStyle = useMemo(() => ({
    display: 'flex',
    gap: `${gap}px`,
    transform: `translateX(-${idx * (cardW + gap)}px)`,
    transition: 'transform .25s ease',
    willChange: 'transform',
    padding: '6px 0', // allow shadow bleed
  }), [idx, cardW])

  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(maxIdx, i + 1))
  const goto = (i) => setIdx(Math.max(0, Math.min(maxIdx, i)))

  return (
    <section id="discover" className="container" style={{padding: '48px 0 72px'}}>
      <div style={{textAlign:'center', marginBottom: 10}}>
        <h3 className="section-title" style={{marginBottom:8, textAlign:'center'}}>{t('discoverTitle')}</h3>
        <div className="discover-controls" style={{display:'flex', gap:8, justifyContent:'center'}}>
          <button className="btn nav-link" onClick={prev} disabled={idx<=0}>◀</button>
          <button className="btn nav-link" onClick={next} disabled={idx>=maxIdx}>▶</button>
        </div>
        <div className="discover-dots" style={{display:'flex', gap:6, justifyContent:'center', marginTop:10}}>
          {Array.from({length: maxIdx + 1}).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i+1}`}
              className={`dot ${i===idx?'active':''}`}
              onClick={()=>goto(i)}
            />
          ))}
        </div>
      </div>
      <div style={{position:'relative'}}>
        <div ref={viewportRef} style={{overflow:'hidden'}} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>{ setPaused(false); setHovered(null) }}>
          <div style={trackStyle}>
            {categories.map((c, i) => {
              const centerIndex = idx + Math.floor(visibleCount / 2)
              const activeIndex = hovered ?? centerIndex
              const isHovered = activeIndex === i
              const isRight = activeIndex != null && i > activeIndex
              const isLeft = activeIndex != null && i < activeIndex
              const isCenter = i === centerIndex
              // Base transform for center mode
              let transform = isCenter ? 'scale(1.10)' : 'none'
              if (isHovered) {
                transform = 'translateY(-14px) scale(1.24)'
              } else if (!isHovered && hovered != null) {
                transform = isRight ? 'translateX(18px)' : isLeft ? 'translateX(-8px)' : transform
              }
              const zIndex = isHovered ? 3 : isCenter ? 2 : 1
              const shadow = isHovered ? '0 30px 80px rgba(0,0,0,0.55)' : isCenter ? '0 14px 32px rgba(0,0,0,0.38)' : ''
              const imgH = Math.round(cardW * 0.7)
              return (
                <a
                  key={c.key}
                  href={c.href}
                  className="card discover-card"
                  style={{
                    width: cardW,
                    flex: `0 0 ${cardW}px`,
                    cursor:'pointer',
                    transition: 'transform .2s ease, box-shadow .2s ease',
                    transform,
                    zIndex,
                    boxShadow: shadow,
                    overflow: 'hidden',
                    borderRadius: 28,
                  }}
                  onMouseEnter={()=>setHovered(i)}
                >
                  <img
                    src={c.img}
                    alt={c.title}
                    style={{ width: '100%', height: imgH, objectFit: 'cover', display:'block', borderRadius: '28px 28px 0 0' }}
                    onError={(e)=>{ e.currentTarget.src = '/images/guide_fallback.jpg' }}
                  />
                  <div className="discover-body">
                    <div className="discover-meta"><span className="state">Jharkhand</span> <span className="sep">|</span> <span className="cat">{c.title}</span></div>
                    <h4 className="discover-title">{c.text}</h4>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
