import { useI18n } from '../context/I18nContext'

export default function Arts() {
  const { t } = useI18n()
  const items = [
    {
      id: 'sohrai',
      state: 'Jharkhand', tag: 'Painting',
      title: 'Sohrai Painting',
      img: '/images/arts_sohrai.jpg',
      text: 'Wall art using natural colors, themes of animals, harvest, fertility.'
    },
    {
      id: 'kohbar',
      state: 'Jharkhand', tag: 'Painting',
      title: 'Kohbar Painting',
      img: '/images/arts_kohbar.jpg',
      text: 'Wedding ritual wall painting with lotus, fish, bamboo for prosperity.'
    },
    {
      id: 'paitkar',
      state: 'Jharkhand', tag: 'Painting',
      title: 'Paitkar Painting',
      img: '/images/arts_paitkar.jpg',
      text: 'Scroll painting by Chitrakar community depicting epics and folklore.'
    },
    {
      id: 'dokra',
      state: 'Jharkhand', tag: 'Metal Craft',
      title: 'Dokra Art',
      img: '/images/arts_dokra.jpg',
      text: 'Lost-wax technique to make tribal figurines, jewelry, and utensils.'
    },
    {
      id: 'tussar',
      state: 'Jharkhand', tag: 'Textile',
      title: 'Tussar Silk Weaving',
      img: '/images/arts_tussar.jpg',
      text: 'Handloom weaving for sarees and textiles with tribal motifs.'
    },
    {
      id: 'bamboo',
      state: 'Jharkhand', tag: 'Craft',
      title: 'Bamboo & Cane Craft',
      img: '/images/arts_bamboo.jpg',
      text: 'Basketry, mats, and daily-use items crafted from bamboo and cane.'
    },
    {
      id: 'wood_stone',
      state: 'Jharkhand', tag: 'Craft',
      title: 'Wood & Stone Carving',
      img: '/images/arts_wood_stone.jpg',
      text: 'Traditional idols, temple art, and decorative household pieces.'
    },
  ]

  const shops = [
    {
      id: 'ranchi-haat',
      name: 'Ranchi Haat (Urban Haat)',
      img: '/images/mkt_ranchi_haat.jpg',
      desc: 'A permanent bazaar for tribal artisans featuring Sohrai, Dokra, bamboo craft, and handlooms. Seasonal fairs with live demos.',
      rating: 4.6,
      phone: '+91 651-000-1234',
      href: 'https://maps.google.com/?q=Ranchi+Haat'
    },
    {
      id: 'regional-handloom',
      name: 'Jharkhand State Handloom & Handicrafts Emporium',
      img: '/images/mkt_state_emporium.jpg',
      desc: 'Government emporium known for Tussar silk sarees, stoles, and curated craft collections with fair pricing.',
      rating: 4.4,
      phone: '+91 651-000-5678',
      href: 'https://maps.google.com/?q=Jharkhand+State+Handloom+Emporium+Ranchi'
    },
    {
      id: 'paitkar-bazar',
      name: 'Amadubi Rural Art Village (Paitkar Hub)',
      img: '/images/mkt_amadubi.jpg',
      desc: 'Famous for Paitkar (scroll) paintings by Chitrakar families. Buy directly from artists and tour home galleries.',
      rating: 4.7,
      phone: '+91 658-000-4321',
      href: 'https://maps.google.com/?q=Amadubi+Rural+Tourism+Village'
    },
    {
      id: 'khunti-market',
      name: 'Khunti Weekly Market',
      img: '/images/mkt_khunti.jpg',
      desc: 'Weekly haat with bamboo/cane products, wooden utensils, and local ornaments; best to visit mornings.',
      rating: 4.2,
      phone: '+91 652-000-2480',
      href: 'https://maps.google.com/?q=Khunti+Market'
    },
    {
      id: 'dokra-pakaritanr',
      name: 'Dokra Craft Cluster, Pakaritanr',
      img: '/images/mkt_dokra.jpg',
      desc: 'Lost-wax metal craft collective producing figurines, lamps, and jewellery; custom orders accepted.',
      rating: 4.8,
      phone: '+91 659-000-7781',
      href: 'https://maps.google.com/?q=Pakaritanr+Dokra'
    },
    {
      id: 'jamshedpur-tussar',
      name: 'Tussar Weavers’ Cooperative, Jamshedpur',
      img: '/images/mkt_tussar.jpg',
      desc: 'Handloom unit selling authentic Tussar silk sarees, dupattas, and yardage with tribal motifs.',
      rating: 4.5,
      phone: '+91 657-000-8892',
      href: 'https://maps.google.com/?q=Tussar+Weavers+Cooperative+Jamshedpur'
    },
    {
      id: 'simdega-haat',
      name: 'Simdega Artisan Haat',
      img: '/images/mkt_simdega.jpg',
      desc: 'Community-run market for bamboo baskets, mats, and daily-use craft; great value and direct-from-maker.',
      rating: 4.1,
      phone: '+91 651-000-9913',
      href: 'https://maps.google.com/?q=Simdega+Haat'
    },
    {
      id: 'hazaribagh-art',
      name: 'Hazaribagh Rock Art & Crafts Street',
      img: '/images/mkt_hazaribagh.jpg',
      desc: 'Lane of shops selling Sohrai/Kohbar-inspired souvenirs, wall plates, and painted textiles.',
      rating: 4.3,
      phone: '+91 654-000-6674',
      href: 'https://maps.google.com/?q=Hazaribagh+Crafts'
    },
    {
      id: 'tribal-museum-shop',
      name: 'Tribal Museum Shop, Ranchi',
      img: '/images/mkt_museum.jpg',
      desc: 'Curated store inside the museum premises featuring certified authentic crafts with captions and provenance.',
      rating: 4.6,
      phone: '+91 651-000-3355',
      href: 'https://maps.google.com/?q=Tribal+Museum+Ranchi'
    },
    {
      id: 'netarhat-bazaar',
      name: 'Netarhat Artisan Bazaar',
      img: '/images/mkt_netarhat.jpg',
      desc: 'Seasonal hill bazaar offering Dokra curios, handwoven textiles, and wood/stone souvenirs near viewpoints.',
      rating: 4.4,
      phone: '+91 653-000-2468',
      href: 'https://maps.google.com/?q=Netarhat+Bazaar'
    }
  ]

  return (
    <main className="page container arts-page">
      <div className="container">
        <h2 className="section-title">{t('artsTitle')}</h2>
        <p className="mb-12">{t('artsIntro')}</p>

        <div className="home-grid">
          {items.map(it => (
            <article key={it.id} className="media-card">
              <div className="media-thumb">
                <img src={it.img} alt={it.title} onError={(e)=>{ e.currentTarget.src='/images/guide_fallback.jpg' }} />
              </div>
              <div className="media-body">
                <div className="media-meta"><span className="accent">{it.state}</span> • {it.tag}</div>
                <h3 className="media-title">{it.title}</h3>
                <p className="media-text">{it.text}</p>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-24">
          <h3 className="section-title">{t('marketplaceTitle')}</h3>
          <p className="mb-12">Discover authentic local shops and markets to buy these arts. Many are community-run—buying here supports artisans directly.</p>
          <div className="home-grid">
            {shops.map(s => (
              <article key={s.id} className="media-card">
                <div className="media-thumb">
                  <img src={s.img} alt={s.name} onError={(e)=>{ e.currentTarget.src='/images/guide_fallback.jpg' }} />
                </div>
                <div className="media-body">
                  <div className="media-meta"><span className="accent">Local Market</span> • Curated</div>
                  <h3 className="media-title">{s.name}</h3>
                  <ul className="list">
                    <li className="list-item">{s.desc}</li>
                    {typeof s.rating === 'number' && (
                      <li className="list-item">Rating: {s.rating.toFixed(1)}★</li>
                    )}
                    {s.phone && (
                      <li className="list-item">Contact: <a href={`tel:${s.phone.replace(/\s|-/g,'')}`}>{s.phone}</a></li>
                    )}
                    {s.href && (
                      <li className="list-item"><a className="btn nav-link" target="_blank" rel="noreferrer" href={s.href}>{t('viewLocationLink')}</a></li>
                    )}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
