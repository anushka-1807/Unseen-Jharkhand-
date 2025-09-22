import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const data = [
  {
    city: 'Ranchi',
    cuisines: ['Dhuska', 'Pittha', 'Handia'],
    markets: ['Upper Bazar', 'Firayalal Chowk'],
    dances: ['Chhau (nearby influence)', 'Jhumar'],
    arts: ['Sohrai & Khovar (nearby Hazaribagh)'],
    tribes: ['Munda', 'Oraon'],
    img: { local: '/images/city_ranchi.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Patratu_Valley_Road.jpg' }
  },
  {
    city: 'Jamshedpur',
    cuisines: ['Litti-esque snacks', 'Saag & Rice'],
    markets: ['Bistupur Market', 'Sakchi Market'],
    dances: ['Jhumar'],
    arts: ['Woodcraft'],
    tribes: ['Ho'],
    img: { local: '/images/city_jamshedpur.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Jubilee_Park_Jamshedpur.jpg' }
  },
  {
    city: 'Deoghar',
    cuisines: ['Pittha', 'Sweets (Pedas)'],
    markets: ['Tower Chowk Market'],
    dances: ['Folk Bhajans/Processions'],
    arts: ['Mural motifs'],
    tribes: ['Santhal'],
    img: { local: '/images/city_deoghar.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Baidyanath_Temple_Deoghar.jpg' }
  },
  {
    city: 'Hazaribagh',
    cuisines: ['Saag & Rice'],
    markets: ['Main Road Market'],
    dances: ['Jhumar'],
    arts: ['Sohrai & Khovar'],
    tribes: ['Santhal'],
    img: { local: '/images/city_hazaribagh.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Hazaribagh_lake.jpg' }
  },
  {
    city: 'Netarhat',
    cuisines: ['Simple Tribal Meals', 'Handia'],
    markets: ['Local Handicraft Stalls'],
    dances: ['Folk dance'],
    arts: ['Woodcraft'],
    tribes: ['Munda', 'Oraon'],
    img: { local: '/images/city_netarhat.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Netarhat_sunset_point.jpg' }
  },
  {
    city: 'Dhanbad',
    cuisines: ['Jharkhand Thali', 'Saag & Rice'],
    markets: ['Bank More Market'],
    dances: ['Jhumar'],
    arts: ['Metalwork'],
    tribes: ['Santhal'],
    img: { local: '/images/city_dhanbad.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Dhanbad_railway.jpg' }
  },
  {
    city: 'Bokaro',
    cuisines: ['Saag & Rice', 'Pittha'],
    markets: ['City Centre'],
    dances: ['Jhumar'],
    arts: ['Woodcraft'],
    tribes: ['Munda'],
    img: { local: '/images/city_bokaro.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Bokaro_Steel_City.jpg' }
  },
  {
    city: 'Ghatshila',
    cuisines: ['Fish Curry', 'Saag & Rice'],
    markets: ['Ghatshila Bazar'],
    dances: ['Folk dance'],
    arts: ['Terracotta'],
    tribes: ['Ho'],
    img: { local: '/images/city_ghatshila.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Ghatshila_hills.jpg' }
  },
  {
    city: 'Simdega',
    cuisines: ['Handia', 'Saag & Rice'],
    markets: ['Simdega Market'],
    dances: ['Folk dance'],
    arts: ['Woodcraft'],
    tribes: ['Oraon'],
    img: { local: '/images/city_simdega.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Simdega_landscape.jpg' }
  },
  {
    city: 'Gumla',
    cuisines: ['Dhuska', 'Saag & Rice'],
    markets: ['Gumla Main Market'],
    dances: ['Jhumar'],
    arts: ['Mural motifs'],
    tribes: ['Oraon'],
    img: { local: '/images/city_gumla.jpg', remote: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Gumla_town.jpg' }
  },
]

const allCities = Array.from(new Set(data.map(d => d.city)))
const allCuisines = Array.from(new Set(data.flatMap(d => d.cuisines)))
const allMarkets = Array.from(new Set(data.flatMap(d => d.markets)))
const allDances = Array.from(new Set(data.flatMap(d => d.dances)))
const allArts = Array.from(new Set(data.flatMap(d => d.arts)))
const allTribes = Array.from(new Set(data.flatMap(d => d.tribes)))

function Img({ local, remote, alt }) {
  return (
    <img
      src={local}
      alt={alt}
      onError={(e) => { if (e.currentTarget.src !== remote) e.currentTarget.src = remote }}
      style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' }}
    />
  )
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  // multi-select states
  const [cities, setCities] = useState([])
  const [cuisines, setCuisines] = useState([])
  const [markets, setMarkets] = useState([])
  const [dances, setDances] = useState([])
  const [arts, setArts] = useState([])
  const [tribes, setTribes] = useState([])
  const [query, setQuery] = useState('')

  // hydrate from URL
  useEffect(() => {
    const getArr = (key) => (searchParams.get(key)?.split(',').filter(Boolean)) || []
    setCities(getArr('cities'))
    setCuisines(getArr('cuisines'))
    setMarkets(getArr('markets'))
    setDances(getArr('dances'))
    setArts(getArr('arts'))
    setTribes(getArr('tribes'))
    setQuery(searchParams.get('q') || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // persist to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (cities.length) params.set('cities', cities.join(','))
    if (cuisines.length) params.set('cuisines', cuisines.join(','))
    if (markets.length) params.set('markets', markets.join(','))
    if (dances.length) params.set('dances', dances.join(','))
    if (arts.length) params.set('arts', arts.join(','))
    if (tribes.length) params.set('tribes', tribes.join(','))
    if (query) params.set('q', query)
    setSearchParams(params, { replace: true })
  }, [cities, cuisines, markets, dances, arts, tribes, query, setSearchParams])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matchText = (item) => {
      if (!q) return true
      const text = [
        item.city,
        ...item.cuisines,
        ...item.markets,
        ...item.dances,
        ...item.arts,
        ...item.tribes
      ].join(' ').toLowerCase()
      return text.includes(q)
    }
    const inOrEmpty = (arr, values) => values.length === 0 || values.some(v => arr.includes(v))
    const cityMatch = (item) => cities.length === 0 || cities.includes(item.city)
    return data.filter(item => (
      cityMatch(item) &&
      inOrEmpty(item.cuisines, cuisines) &&
      inOrEmpty(item.markets, markets) &&
      inOrEmpty(item.dances, dances) &&
      inOrEmpty(item.arts, arts) &&
      inOrEmpty(item.tribes, tribes) &&
      matchText(item)
    ))
  }, [cities, cuisines, markets, dances, arts, tribes, query])

  function MultiSelectChips({ label, options, values, onChange }) {
    const [input, setInput] = useState('')
    const inputLower = input.trim().toLowerCase()
    const filtered = options.filter(o => !values.includes(o) && o.toLowerCase().includes(inputLower))

    const addValue = (val) => {
      if (!val) return
      if (!values.includes(val)) onChange([...values, val])
      setInput('')
    }
    const removeValue = (val) => onChange(values.filter(v => v !== val))

    const onKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (inputLower) {
          const exact = options.find(o => o.toLowerCase() === inputLower)
          addValue(exact || filtered[0])
        }
      } else if (e.key === 'Backspace' && !input && values.length) {
        // remove last
        onChange(values.slice(0, -1))
      }
    }

    return (
      <label className="chip-field">
        <span>{label}</span>
        <div className="chip-input">
          <div className="chip-row">
            {values.map(v => (
              <button key={v} type="button" className="chip" onClick={() => removeValue(v)} title="Remove">
                {v} ✕
              </button>
            ))}
            <input
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`Add ${label.toLowerCase()}...`}
            />
          </div>
          {filtered.length > 0 && input && (
            <div className="chip-menu">
              {filtered.slice(0, 8).map(o => (
                <button key={o} type="button" onClick={()=>addValue(o)}>{o}</button>
              ))}
            </div>
          )}
        </div>
      </label>
    )
  }

  return (
    <main className="page container">
      <h2 className="section-title">Explore Jharkhand</h2>
      <p style={{marginTop:0}}>Browse cities with their famous cuisines, markets, folk dances, arts, cultures, and tribes. Use filters to refine.</p>

      <div className="filters" style={{display:'grid', gap:10, gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', margin:'14px 0 16px'}}>
        <label>
          <span>Search</span>
          <input type="text" placeholder="Search city, cuisine, market..." value={query} onChange={e=>setQuery(e.target.value)} />
        </label>

        <MultiSelectChips label="City" options={allCities} values={cities} onChange={setCities} />
        <MultiSelectChips label="Cuisine" options={allCuisines} values={cuisines} onChange={setCuisines} />
        <MultiSelectChips label="Market" options={allMarkets} values={markets} onChange={setMarkets} />
        <MultiSelectChips label="Folk Dance" options={allDances} values={dances} onChange={setDances} />
        <MultiSelectChips label="Art" options={allArts} values={arts} onChange={setArts} />
        <MultiSelectChips label="Tribe" options={allTribes} values={tribes} onChange={setTribes} />
      </div>

      <div className="home-grid">
        {results.map((r) => (
          <article key={r.city} className="card">
            <Img local={r.img.local} remote={r.img.remote} alt={r.city} />
            <div className="card-body">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <strong>{r.city}</strong>
                <span className="badge">{r.tribes[0] || 'Culture'}</span>
              </div>
              <div style={{display:'grid', gap:4, fontSize:'.95rem'}}>
                <div><em>Famous cuisines:</em> {r.cuisines.join(', ')}</div>
                <div><em>Local markets:</em> {r.markets.join(', ')}</div>
                <div><em>Folk dances:</em> {r.dances.join(', ')}</div>
                <div><em>Arts:</em> {r.arts.join(', ')}</div>
                <div><em>Tribes:</em> {r.tribes.join(', ')}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
      {results.length === 0 && (
        <div className="alert alert-error" style={{marginTop:12}}>No matches. Try relaxing filters.</div>
      )}
    </main>
  )
}
