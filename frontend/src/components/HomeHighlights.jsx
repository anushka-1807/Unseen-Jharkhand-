export default function HomeHighlights() {
  const CardImg = ({ local, remote, alt }) => (
    <img
      src={local}
      alt={alt}
      onError={(e) => { if (e.currentTarget.src !== remote) e.currentTarget.src = remote }}
    />
  )

  const items = [
    {
      title: 'Waterfalls & Valleys',
      badge: 'Nature',
      text: 'Discover Hundru, Dassam, Jonha, and the scenic Patratu Valley.',
      local: '/images/hl_nature.jpg',
      remote: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Hundru_Falls.jpg',
      to: '/about#places'
    },
    {
      title: 'Arts & Culture',
      badge: 'Culture',
      text: 'Sohrai & Khovar murals, Chhau dance, and exquisite woodcraft.',
      local: '/images/hl_culture.jpg',
      remote: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Sohrai_painting.jpg',
      to: '/about#arts'
    },
    {
      title: 'Local Cuisines',
      badge: 'Cuisine',
      text: 'Taste Dhuska, Pittha, seasonal Saag, and traditional Handia.',
      local: '/images/hl_cuisine.jpg',
      remote: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Dhuska_Jharkhand.jpg',
      to: '/about#cuisines'
    },
    {
      title: 'Book a Guide',
      badge: 'Experience',
      text: 'Travel with verified local experts for safe and memorable trips.',
      local: '/images/hl_guides.jpg',
      remote: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Patratu_Valley_Road.jpg',
      to: '/bookings'
    }
  ]

  return (
    <section id="discover" className="home-highlights container">
      <h3 className="section-title">Highlights</h3>
      <div className="home-grid">
        {items.map((it, idx) => (
          <a key={idx} className="card" href={it.to}>
            <CardImg local={it.local} remote={it.remote} alt={it.title} />
            <div className="card-body">
              <span className="badge">{it.badge}</span>
              <strong>{it.title}</strong>
              <p style={{margin:0, opacity:.9}}>{it.text}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
