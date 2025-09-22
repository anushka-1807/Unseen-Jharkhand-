import { Router } from 'express'
import { db } from '../sqlite.js'

const router = Router()

// POST /api/itinerary/suggest
// Body: { city, startDate, endDate, interests:[], languages:[], groupSize, budget }
router.post('/suggest', (req, res) => {
  try {
    const {
      city = '', startDate = '', endDate = '', interests = [], languages = [],
      groupSize = 2, budget = 'mid'
    } = req.body || {}

    if (!startDate || !endDate) return res.status(400).json({ message: 'startDate and endDate required' })

    const sd = new Date(startDate)
    const ed = new Date(endDate)
    if (isNaN(sd) || isNaN(ed) || ed < sd) return res.status(400).json({ message: 'invalid date range' })

    const days = Math.max(1, Math.ceil((ed - sd) / (1000*60*60*24)) + 1)

    // Fetch top guides and hotels for the city and preferences
    const topGuides = db.prepare(`
      SELECT * FROM guides
      WHERE 1=1
      ${city ? ' AND city = @city' : ''}
      ${Array.isArray(interests) && interests.length ? interests.map((_ ,i)=>` AND specialties LIKE '%' || @i${i} || '%'`).join('') : ''}
      ${Array.isArray(languages) && languages.length ? languages.map((_ ,i)=>` AND languages LIKE '%' || @l${i} || '%'`).join('') : ''}
      ORDER BY rating DESC, pricePerDay ASC
      LIMIT 5
    `).all({
      city,
      ...Object.fromEntries((interests||[]).map((v,i)=>[`i${i}`, String(v)])),
      ...Object.fromEntries((languages||[]).map((v,i)=>[`l${i}`, String(v)])),
    })

    const topHotels = db.prepare(`
      SELECT * FROM hotels
      WHERE 1=1
      ${city ? ' AND city = @city' : ''}
      ORDER BY rating DESC, priceMin ASC
      LIMIT 5
    `).all({ city })

    // Simple attractions catalog by city/interest
    const catalog = getAttractionsCatalog()
    const pool = [
      ...(catalog[city] || []),
      ...(interests||[]).flatMap(k => (catalog[`interest:${String(k).toLowerCase()}`] || []))
    ]

    const uniq = []
    const seen = new Set()
    for (const p of pool) { if (!seen.has(p.title)) { uniq.push(p); seen.add(p.title) } }
    if (uniq.length === 0) uniq.push({ title: 'Local Markets & Street Food', desc: 'Explore local markets and taste regional snacks.' })

    const plan = []
    for (let d=0; d<days; d++) {
      const item = uniq[d % uniq.length]
      plan.push({
        day: d+1,
        date: new Date(sd.getTime() + d*24*60*60*1000).toISOString().slice(0,10),
        title: item.title,
        description: item.desc,
        lat: typeof item.lat === 'number' ? item.lat : undefined,
        lng: typeof item.lng === 'number' ? item.lng : undefined,
        suggestions: {
          morning: item.morning || 'Meet your guide, start with a heritage walk and local breakfast.',
          afternoon: item.afternoon || 'Visit a key attraction tied to your interests.',
          evening: item.evening || 'Relax at a scenic spot and dine at a recommended place.'
        }
      })
    }

    // Rough estimate: guide price x days, scaled by budget
    const baseGuide = topGuides[0]?.pricePerDay || 1600
    const budgetMultiplier = budget === 'low' ? 0.9 : budget === 'mid' ? 1.0 : 1.25
    const estimate = Math.round(baseGuide * days * budgetMultiplier)

    res.json({
      city,
      days,
      plan,
      estimate,
      guides: topGuides,
      stays: topHotels,
    })
  } catch (e) {
    console.error('itinerary error:', e)
    res.status(500).json({ message: 'Failed to build itinerary' })
  }
})

function getAttractionsCatalog() {
  // Minimal curated suggestions. Can be expanded or sourced from DB later.
  return {
    Ranchi: [
      { title: 'Dassam & Jonha Falls', desc: 'Waterfall day trip from Ranchi with nature walks.', lat: 23.283, lng: 85.511 },
      { title: 'Rock Garden & Kanke Dam', desc: 'Sunset views and relaxing evening by the water.', lat: 23.410, lng: 85.321 },
      { title: 'Jagannath Temple & Pahari Mandir', desc: 'Temple visits with city viewpoints.', lat: 23.330, lng: 85.307 },
    ],
    Netarhat: [
      { title: 'Sunrise at Netarhat Hills', desc: 'Trek to viewpoints and forest walks.', lat: 23.473, lng: 84.268 },
      { title: 'Koel View Point & Pine Forest', desc: 'Scenic day with picnic lunch.', lat: 23.472, lng: 84.234 },
    ],
    'interest:nature': [
      { title: 'Forest Nature Trail', desc: 'Easy forest trail with local guide commentary.', lat: 23.60, lng: 85.28 },
    ],
    'interest:waterfalls': [
      { title: 'Waterfall Hop', desc: 'Cover two scenic waterfalls and nearby villages.', lat: 23.30, lng: 85.51 },
    ],
    'interest:culture': [
      { title: 'Tribal Culture Walk', desc: 'Museum visit and local artisan workshops.', lat: 23.36, lng: 85.33 },
    ],
    'interest:food': [
      { title: 'Taste of Jharkhand', desc: 'Curated local dishes, sweets, and street food.', lat: 23.36, lng: 85.34 },
    ],
    'interest:treks': [
      { title: 'Hill Trek & Viewpoints', desc: 'Half-day trek with panoramic views.', lat: 23.47, lng: 84.27 },
    ],
    'interest:wildlife': [
      { title: 'Wildlife Sanctuary Visit', desc: 'Guided day exploring local fauna and flora.', lat: 23.99, lng: 85.35 },
    ],
    'interest:temples': [
      { title: 'Temple Circuit', desc: 'Visit notable temples and spiritual sites.', lat: 24.49, lng: 86.70 },
    ],
  }
}

export default router
