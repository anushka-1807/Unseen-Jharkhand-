import { useI18n } from '../context/I18nContext'

export default function Folks() {
  const { t } = useI18n()
  const months = [
    { id: 'jan', month: 'January', intro: 'New harvest and thanksgiving rituals mark the start of the year across plateau villages.', items: [
      { id:'maghe', title:'Maghe Festival', img:'/images/folks_maghe.jpg', text:'Harvest thanksgiving with communal feasts and prayers.', loc:'Gumla' },
      { id:'teej_prep', title:'Teej Preparations', img:'/images/folks_teej.jpg', text:'Women prepare songs and swings for the coming monsoon season.', loc:'Ranchi' },
    ]},
    { id: 'feb', month: 'February', intro: 'Spring approaches: artisan fairs pop up, and villages hold small dance gatherings.', items: [
      { id:'sukarat', title:'Sukarat', img:'/images/folks_sukarat.jpg', text:'Welcoming spring with folk dance, music and community meals.', loc:'Khunti' },
      { id:'artisan_mela', title:'Artisan Melas', img:'/images/folks_mela.jpg', text:'Local markets showcasing masks, bamboo craft and textiles.', loc:'Hazaribagh' },
    ]},
    { id: 'mar', month: 'March', intro: 'The forest blooms; communities celebrate nature and the revered Sal tree.', items: [
      { id:'sarhul', title:'Sarhul', img:'/images/folks_sarhul.jpg', text:'Processions, drum beats and offerings to the Sal tree spirit.', loc:'Ranchi' },
      { id:'phagu', title:'Phagu', img:'/images/folks_phagu.jpg', text:'Colour festivities with folk songs and playful rituals.', loc:'Jamshedpur' },
    ]},
    { id: 'apr', month: 'April', intro: 'Flower festivals and village fairs define the early summer mood.', items: [
      { id:'baha', title:'Baha / Baso', img:'/images/folks_baha.jpg', text:'Flower festival with community dances led by elders.', loc:'Simdega' },
      { id:'haat', title:'Village Haat Fairs', img:'/images/folks_haat.jpg', text:'Weekly markets double as cultural spaces for music and craft.', loc:'Latehar' },
    ]},
    { id: 'may', month: 'May', intro: 'Cultural troupes begin rehearsals for the big Karma season.', items: [
      { id:'karma_prep', title:'Karma Rehearsals', img:'/images/folks_karma.jpg', text:'Youth practice dance formations and songs through the month.', loc:'Gumla' },
      { id:'mask_making', title:'Mask Making', img:'/images/folks_mask.jpg', text:'Crafting masks and props used in folk performances.', loc:'Dumka' },
    ]},
    { id: 'jun', month: 'June', intro: 'Monsoon rites and health prayers are observed in many communities.', items: [
      { id:'jitia_prep', title:'Jitia & Health Rites', img:'/images/folks_jitia.jpg', text:'Fasts and prayers by mothers for family well-being.', loc:'Bokaro' },
      { id:'rain_invocation', title:'Rain Invocation', img:'/images/folks_rain.jpg', text:'Songs and rituals seeking timely rainfall.', loc:'Chaibasa' },
    ]},
    { id: 'jul', month: 'July', intro: 'Households ready pigments and walls for Sohrai/Kohbar murals.', items: [
      { id:'sohrai_prep', title:'Sohrai Preparation', img:'/images/folks_sohrai.jpg', text:'Natural pigments are mixed; motifs sketched on walls.', loc:'Hazaribagh' },
      { id:'kohbar_prep', title:'Kohbar Motif Planning', img:'/images/folks_kohbar.jpg', text:'Wedding motifs like lotus and fish are outlined.', loc:'Hazaribagh' },
    ]},
    { id: 'aug', month: 'August', intro: 'The iconic Karma festival arrives with night-long music and dance.', items: [
      { id:'karma', title:'Karma', img:'/images/folks_karma2.jpg', text:'Devotion to the Karma tree with circular dance and drums.', loc:'Gumla' },
      { id:'janthar', title:'Janthar Gatherings', img:'/images/folks_janthar.jpg', text:'Village assemblies with storytelling and food.', loc:'Khunti' },
    ]},
    { id: 'sep', month: 'September', intro: 'Fairs, swings and monsoon greenery set a festive tone.', items: [
      { id:'jhulan', title:'Jhulan', img:'/images/folks_jhulan.jpg', text:'Swing festival celebrated by youth with songs.', loc:'Deoghar' },
      { id:'green_fair', title:'Green Fairs', img:'/images/folks_greenfair.jpg', text:'Nature fairs showcasing herbs and forest produce.', loc:'Ranchi' },
    ]},
    { id: 'oct', month: 'October', intro: 'After harvest, walls come alive with Sohrai paintings.', items: [
      { id:'sohrai', title:'Sohrai', img:'/images/folks_sohrai2.jpg', text:'Mural art in earthy hues; homes glow with patterns.', loc:'Hazaribagh' },
      { id:'harvest_fest', title:'Harvest Thanks', img:'/images/folks_harvest.jpg', text:'Offerings to deities and community feasts.', loc:'Ranchi' },
    ]},
    { id: 'nov', month: 'November', intro: 'Bandna celebrates bonds between humans and cattle.', items: [
      { id:'bandna', title:'Bandna', img:'/images/folks_bandna.jpg', text:'Cattle are decorated; courtyards cleaned and painted.', loc:'Dhanbad' },
      { id:'mask_dance', title:'Mask Dance', img:'/images/folks_maskdance.jpg', text:'Folk troupes perform masked dances at village squares.', loc:'Chaibasa' },
    ]},
    { id: 'dec', month: 'December', intro: 'Winter fairs and clan meets round off the cultural calendar.', items: [
      { id:'paus_parab', title:'Paus Parab', img:'/images/folks_paus.jpg', text:'Bonfires, fairs and reunions in the winter chill.', loc:'Ranchi' },
      { id:'year_farewell', title:'Year-end Fairs', img:'/images/folks_yearend.jpg', text:'Handicraft markets and music nights.', loc:'Netarhat' },
    ]},
  ]

  return (
    <main className="page container arts-bg folks-page">
      <h2 className="section-title">{t('folksTitle')}</h2>
      <p className="mb-12">{t('folksIntro')}</p>

      {months.map(m => (
        <section key={m.id} className="mt-24">
          <h3 className="section-title">{m.month}</h3>
          {m.intro && <p className="mb-12">{m.intro}</p>}
          <div className="home-grid">
            {m.items.map(it => (
              <article key={it.id} className="media-card">
                <div className="media-thumb">
                  <img src={it.img} alt={it.title} onError={(e)=>{ e.currentTarget.src='/images/guide_fallback.jpg' }} />
                </div>
                <div className="media-body">
                  <div className="media-meta"><span className="accent">Jharkhand</span> • Festival</div>
                  <h3 className="media-title">{it.title}</h3>
                  <p className="media-text">{it.text}</p>
                  {it.loc && (
                    <div className="mt-8">
                      <a className="btn nav-link" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(it.title + ' ' + it.loc + ' Jharkhand')}`}>
                        {t('viewOnMap')} ({it.loc})
                      </a>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
