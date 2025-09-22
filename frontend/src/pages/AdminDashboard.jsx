import { useMemo } from 'react'
import { useI18n } from '../context/I18nContext'

function Stat({ label, value, sub }) {
  return (
    <div className="card" style={{padding:16}}>
      <div style={{fontSize:'.9rem', opacity:.8}}>{label}</div>
      <div style={{fontSize:'1.6rem', fontWeight:900}}>{value}</div>
      {sub && <div style={{opacity:.85}}>{sub}</div>}
    </div>
  )
}

function Bar({ data = [] }) {
  // simple inline bar graph
  const max = Math.max(...data.map(d=>d.value), 1)
  return (
    <div className="card" style={{padding:16, display:'grid', gap:10}}>
      {data.map(d => (
        <div key={d.label} style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:8}}>
          <div style={{background:'rgba(177,74,34,0.2)', borderRadius:8, overflow:'hidden'}}>
            <div style={{width: `${(d.value/max)*100}%`, height:12, background:'linear-gradient(90deg, var(--primary), var(--primary-dark))'}} />
          </div>
          <span style={{minWidth:40, textAlign:'right'}}>{d.value}</span>
        </div>
      ))}
    </div>
  )
}

function Reviews({ items=[] }) {
  return (
    <div className="card" style={{padding:16, display:'grid', gap:8}}>
      {items.map((r,i)=>(
        <div key={i} style={{borderBottom:'1px solid rgba(0,0,0,0.1)', paddingBottom:8}}>
          <div style={{fontWeight:700}}>{r.name} • {r.rating}★</div>
          <div>{r.text}</div>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const { t } = useI18n()
  // Mock datasets
  const touristFunnel = useMemo(()=>[
    { label:'Site Visits', value: 1280 },
    { label:'Trip Planner Used', value: 640 },
    { label:'Bookings Started', value: 380 },
    { label:'Payments Success', value: 292 },
  ], [])

  const touristReviews = useMemo(()=>[
    { name:'Amit', rating:4.5, text:'Great experience booking local guides and stays.' },
    { name:'Neha', rating:4.2, text:'Smooth process and authentic suggestions.' },
    { name:'Ravi', rating:4.8, text:'Loved the curated itineraries—very helpful!' },
  ], [])

  const topGuides = useMemo(()=>[
    { name:'Suresh Kumar', city:'Ranchi', rating:4.9, feedback:'Knowledgeable and punctual.' },
    { name:'Anita Devi', city:'Hazaribagh', rating:4.8, feedback:'Great storyteller and very friendly.' },
    { name:'Rahul Verma', city:'Netarhat', rating:4.7, feedback:'Knows hidden gems and safe treks.' },
  ], [])

  const marketSales = useMemo(()=>[
    { label:'Jan', value: 320 }, { label:'Feb', value: 410 }, { label:'Mar', value: 380 }, { label:'Apr', value: 520 }, { label:'May', value: 610 }, { label:'Jun', value: 590 },
  ], [])
  const marketRatings = useMemo(()=>[
    { label:'Avg Rating', value: 4.4 }, { label:'5★ %', value: 62 }, { label:'4★ %', value: 26 }, { label:'3★ %', value: 9 },
  ], [])
  const sellers = useMemo(()=>({ count: 128, earnings: '₹12.6L' }), [])

  return (
    <main className="page container admin-dashboard">
      <h2 className="section-title">{t('adminDashboardTitle')}</h2>

      {/* TOURIST SECTION */}
      <section className="mt-24">
        <h3 className="section-title">{t('adminTouristInfo')}</h3>
        <div className="home-grid">
          <Stat label={t('adminConversion')} value="22.8%" sub="Bookings / Site visits" />
          <Stat label={t('adminActiveUsers')} value="1,280" sub="Last 30 days" />
          <Stat label={t('adminAvgRating')} value="4.4★" sub="Past 90 days" />
        </div>
        <div className="home-grid" style={{marginTop:12}}>
          <Bar data={touristFunnel} />
          <Reviews items={touristReviews} />
        </div>
      </section>

      {/* GUIDES SECTION */}
      <section className="mt-24">
        <h3 className="section-title">{t('adminGuidesInfo')}</h3>
        <div className="home-grid">
          {topGuides.map((g,i)=> (
            <div key={i} className="card" style={{padding:16}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <strong>{g.name}</strong>
                <span className="badge">{g.rating.toFixed(1)}★</span>
              </div>
              <div style={{opacity:.9}}>{g.city}</div>
              <div style={{marginTop:8}}>{g.feedback}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARKETPLACE SECTION */}
      <section className="mt-24">
        <h3 className="section-title">{t('adminMarketDetails')}</h3>
        <div className="home-grid">
          <Bar data={marketSales} />
          <div className="card" style={{padding:16}}>
            <div style={{fontWeight:800, marginBottom:8}}>{t('adminRatingsSnapshot')}</div>
            {marketRatings.map((r,i)=> (
              <div key={i} style={{display:'grid', gridTemplateColumns:'auto 1fr auto', gap:8, alignItems:'center', margin:'4px 0'}}>
                <div style={{opacity:.85}}>{r.label}</div>
                <div style={{height:8, background:'rgba(177,74,34,0.2)', borderRadius:6, overflow:'hidden'}}>
                  <div style={{width:`${Math.min(r.value,100)}%`, height:'100%', background:'linear-gradient(90deg, var(--primary), var(--primary-dark))'}} />
                </div>
                <div>{r.value}</div>
              </div>
            ))}
            <div style={{marginTop:12}}>Sellers: <strong>{sellers.count}</strong> • Earnings: <strong>{sellers.earnings}</strong></div>
          </div>
        </div>
      </section>
    </main>
  )
}
