import { useI18n } from '../context/I18nContext'

export default function About() {
  const { t } = useI18n()
  const Img = ({ local, remote, alt }) => (
    <img
      src={local}
      alt={alt}
      onError={(e) => { if (e.currentTarget.src !== remote) e.currentTarget.src = remote }}
      style={{width:'100%', borderRadius:12, border:'1px solid rgba(255,255,255,0.12)'}}
    />
  )
  return (
    <main className="page container about-page">
      <h2>{t('aboutTitle')}</h2>
      <p>
        {t('artsIntro')}
      </p>

      <nav className="subnav" aria-label="About sections">
        <div className="subnav-links">
          <a href="#cuisines">{t('aboutNavCuisines')}</a>
          <a href="#tribes">{t('aboutNavTribes')}</a>
          <a href="#arts">{t('aboutNavArts')}</a>
          <a href="#places">{t('aboutNavPlaces')}</a>
        </div>
      </nav>

      <section id="cuisines" style={{marginTop: 28}}>
        <h3 className="section-title">{t('cuisinesTitle')}</h3>
        <p>{t('cuisinesIntro')}</p>
        <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))'}}>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/cuisine_dhuska.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/6/60/Dhuska_Jharkhand.jpg" alt="Dhuska" />
            <figcaption style={{marginTop:8}}><strong>Dhuska</strong>: Deep-fried rice-lentil pancakes, often served with ghugni or chutney.</figcaption>
          </figure>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/cuisine_pittha.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/9/9a/Pitha_Assam.jpg" alt="Pittha" />
            <figcaption style={{marginTop:8}}><strong>Pittha</strong>: Rice flour dumplings with savoury or sweet fillings, steamed or pan-fried.</figcaption>
          </figure>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/cuisine_saag.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/1/1c/Saag.jpg" alt="Saag" />
            <figcaption style={{marginTop:8}}><strong>Seasonal Saag</strong>: Fresh leafy greens cooked with minimal spices for a rustic flavour.</figcaption>
          </figure>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/cuisine_handia.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/5/5e/Clay_pots.jpg" alt="Handia" />
            <figcaption style={{marginTop:8}}><strong>Handia</strong>: Traditional fermented rice drink prepared by local communities.</figcaption>
          </figure>
        </div>
      </section>

      <section id="tribes" style={{marginTop: 28}}>
        <h3 className="section-title">{t('tribesTitle')}</h3>
        <p>{t('tribesIntro')}</p>
        <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))'}}>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/tribe_santhal.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/2/25/Santhal_dancers.jpg" alt="Santhal community" />
            <figcaption style={{marginTop:8}}><strong>Santhal</strong>: Known for their vibrant music and dance traditions, especially during harvest festivals.</figcaption>
          </figure>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/tribe_munda.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/9/9a/Munda_tribe.jpg" alt="Munda community" />
            <figcaption style={{marginTop:8}}><strong>Munda</strong>: A prominent tribe with rich oral histories, traditional governance, and folk arts.</figcaption>
          </figure>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/tribe_ho.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/7/79/Ho_tribe.jpg" alt="Ho community" />
            <figcaption style={{marginTop:8}}><strong>Ho</strong>: Renowned for martial dances, woodcraft, and strong community bonds.</figcaption>
          </figure>
        </div>
      </section>

      <section id="arts" style={{marginTop: 28}}>
        <h3 className="section-title">{t('artsCultureTitle')}</h3>
        <p>{t('artsCultureIntro')}</p>
        <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))'}}>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/art_sohrai.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/1/18/Sohrai_painting.jpg" alt="Sohrai painting" />
            <figcaption style={{marginTop:8}}><strong>Sohrai & Khovar</strong>: Traditional mural art made with natural pigments during festivals and weddings.</figcaption>
          </figure>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/art_woodcraft.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/3/37/Wood_carving.jpg" alt="Woodcraft" />
            <figcaption style={{marginTop:8}}><strong>Woodcraft & Metalwork</strong>: Hand-carved utilitarian objects and ritual pieces from local artisans.</figcaption>
          </figure>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/art_chhau.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/9/9b/Chhau_Dance.jpg" alt="Chhau dance" />
            <figcaption style={{marginTop:8}}><strong>Folk Dance & Music</strong>: Energetic forms like Chhau, accompanied by traditional percussion.</figcaption>
          </figure>
        </div>
      </section>

      <section id="places" style={{marginTop: 28}}>
        <h3 className="section-title">{t('placesTitle')}</h3>
        <p>{t('placesIntro')}</p>
        <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))'}}>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/place_hundru.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/9/93/Hundru_Falls.jpg" alt="Hundru Falls" />
            <figcaption style={{marginTop:8}}><strong>Hundru Falls</strong>: A spectacular cascade on the Subarnarekha River, best seen post-monsoon.</figcaption>
          </figure>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/place_patratu.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/5/5b/Patratu_Valley_Road.jpg" alt="Patratu Valley" />
            <figcaption style={{marginTop:8}}><strong>Patratu Valley</strong>: Winding roads, pine-clad hills, and serene lake views.</figcaption>
          </figure>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/place_betla.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/7/72/Betla_National_Park.jpg" alt="Betla National Park" />
            <figcaption style={{marginTop:8}}><strong>Betla National Park</strong>: Rich biodiversity and ancient forts within the Palamu Tiger Reserve.</figcaption>
          </figure>
          <figure className="list-item" style={{margin:0, padding:0, border:'none', background:'transparent'}}>
            <Img local="/images/place_parasnath.jpg" remote="https://upload.wikimedia.org/wikipedia/commons/b/b2/Parasnath_Hill_Shikharji.jpg" alt="Parasnath Hill" />
            <figcaption style={{marginTop:8}}><strong>Parasnath (Shikharji)</strong>: A revered Jain pilgrimage with panoramic hilltop views.</figcaption>
          </figure>
        </div>
      </section>
    </main>
  )
}
