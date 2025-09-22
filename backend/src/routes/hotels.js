import { Router } from 'express'
import { db } from '../sqlite.js'
import fs from 'fs'
import { parse } from 'csv-parse/sync'

const router = Router()

// Create a hotel/homestay
router.post('/create', (req, res) => {
  const {
    name, type = 'hotel', city = '', address = '', phone = '', email = '', website = '',
    priceMin = 0, priceMax = 0, rating = 0, amenities = '', lat = null, lng = null
  } = req.body || {}
  if (!name) return res.status(400).json({ message: 'name is required' })
  try {
    const stmt = db.prepare(`INSERT INTO hotels (name, type, city, address, phone, email, website, priceMin, priceMax, rating, amenities, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const info = stmt.run(name, type, city, address, phone, email, website, Number(priceMin)||0, Number(priceMax)||0, Number(rating)||0, String(amenities||''), lat==null? null : Number(lat), lng==null? null : Number(lng))
    const row = db.prepare('SELECT * FROM hotels WHERE id = ?').get(info.lastInsertRowid)
    res.status(201).json(row)
  } catch (e) {
    res.status(400).json({ message: 'Unable to create hotel', error: e.message })
  }
})

// Shared seeding logic
function seedManyHotels(count) {
  const cities = ['Ranchi','Hazaribagh','Netarhat','Ghatshila','Jamshedpur','Gumla','Dhanbad','Bokaro','Deoghar','Simdega']
  const types = ['hotel','homestay']
  const amenitiesPool = ['wifi','parking','restaurant','breakfast','ac','lake-view','pool']
  const pickAmenities = () => {
    const shuffled = [...amenitiesPool].sort(()=>Math.random()-0.5)
    const k = 2 + Math.floor(Math.random()*3)
    return shuffled.slice(0,k).join(',')
  }
  const stmt = db.prepare(`INSERT INTO hotels (name, type, city, address, phone, email, website, priceMin, priceMax, rating, amenities, lat, lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const makeOne = (i) => {
    const city = cities[i % cities.length]
    const type = types[i % types.length]
    const name = type === 'hotel' ? `${city} Heritage Hotel ${i+1}` : `${city} Cozy Homestay ${i+1}`
    const address = `Area ${1 + (i%20)}, ${city}`
    const phone = `9${(1000000000 + ((Date.now()+i) % 899999999)).toString().slice(0,9)}`
    const email = `stay${Date.now()+i}@example.com`
    const website = ''
    const base = type === 'hotel' ? 1500 : 900
    const priceMin = base + (i % 6) * 100
    const priceMax = priceMin + 800 + (i % 3) * 100
    const rating = Number((3.8 + Math.random()*1.2).toFixed(1))
    const amenities = pickAmenities()
    const lat = 23.6 + (Math.random()-0.5) * 1.2
    const lng = 85.3 + (Math.random()-0.5) * 1.2
    return [name, type, city, address, phone, email, website, priceMin, priceMax, rating, amenities, lat, lng]
  }
  const txn = db.transaction((n)=>{ for (let i=0;i<n;i++) stmt.run(...makeOne(i)) })
  txn(Number(count))
}

// Admin-only: generate mock hotels/homestays (POST)
router.post('/seed', (req, res) => {
  const { count = 150 } = req.body || {}
  try {
    seedManyHotels(Number(count))
    const total = db.prepare('SELECT COUNT(1) as c FROM hotels').get().c
    res.status(201).json({ message: 'Seeded hotels/homestays', added: Number(count), total })
  } catch (e) {
    res.status(500).json({ message: 'Seeding failed', error: e.message })
  }
})

// Convenience: GET seed for quick testing in the browser
router.get('/seed', (req, res) => {
  const count = Number(req.query.count || 150)
  try {
    seedManyHotels(count)
    const total = db.prepare('SELECT COUNT(1) as c FROM hotels').get().c
    res.status(201).json({ message: 'Seeded hotels/homestays', added: count, total })
  } catch (e) {
    res.status(500).json({ message: 'Seeding failed', error: e.message })
  }
})

// Reset hotels table (dangerous): clears all hotels and resets autoincrement
router.post('/reset', (req, res) => {
  try {
    const before = db.prepare('SELECT COUNT(1) as c FROM hotels').get().c
    db.exec('DELETE FROM hotels;')
    // Reset AUTOINCREMENT counter
    try { db.exec("DELETE FROM sqlite_sequence WHERE name='hotels';") } catch {}
    const after = db.prepare('SELECT COUNT(1) as c FROM hotels').get().c
    res.json({ message: 'Hotels table cleared', removed: before, remaining: after })
  } catch (e) {
    res.status(500).json({ message: 'Reset failed', error: e.message })
  }
})

// Convenience: GET /reset for browser testing
router.get('/reset', (req, res) => {
  try {
    const before = db.prepare('SELECT COUNT(1) as c FROM hotels').get().c
    db.exec('DELETE FROM hotels;')
    try { db.exec("DELETE FROM sqlite_sequence WHERE name='hotels';") } catch {}
    const after = db.prepare('SELECT COUNT(1) as c FROM hotels').get().c
    res.json({ message: 'Hotels table cleared', removed: before, remaining: after })
  } catch (e) {
    res.status(500).json({ message: 'Reset failed', error: e.message })
  }
})

// List/search hotels/homestays
router.get('/list', (req, res) => {
  const { city, type, min, max, amenities, q, limit = 50 } = req.query
  let query = 'SELECT * FROM hotels WHERE 1=1'
  const params = []
  if (city) { query += ' AND city = ?'; params.push(city) }
  if (type) { query += ' AND type = ?'; params.push(type) }
  if (min) { query += ' AND priceMin >= ?'; params.push(Number(min)) }
  if (max) { query += ' AND priceMax <= ?'; params.push(Number(max)) }
  if (amenities) {
    const arr = String(amenities).split(',').map(s=>s.trim()).filter(Boolean)
    for (const a of arr) { query += " AND amenities LIKE '%' || ? || '%'"; params.push(a) }
  }
  if (q) {
    query += " AND (name LIKE '%' || ? || '%' OR address LIKE '%' || ? || '%')"; params.push(q, q)
  }
  query += ' ORDER BY rating DESC, priceMin ASC LIMIT ?'; params.push(Number(limit))
  const rows = db.prepare(query).all(...params)
  res.json(rows)
})

// Replace all hotels with a supplied list (similar to guides replace-all)
// Body can be either an array or { hotels: [...] }
// Each: { name (required), type, city, address, phone, email, website, priceMin, priceMax, rating, amenities, lat, lng, nearestAttraction }
router.post('/replace-all', (req, res) => {
  const required = process.env.ADMIN_KEY
  if (required && req.headers['x-admin-key'] !== required) {
    return res.status(401).json({ message: 'unauthorized' })
  }
  const payload = Array.isArray(req.body) ? req.body : (req.body?.hotels || req.body?.rows || [])
  if (!Array.isArray(payload) || payload.length === 0) {
    return res.status(400).json({ message: 'provide an array of hotel objects' })
  }
  const MAX = 2000
  const hotels = payload.slice(0, MAX).map(h => ({
    name: String(h.name || '').trim(),
    type: (h.type ? String(h.type) : 'hotel'),
    city: h.city ? String(h.city) : '',
    address: h.address ? String(h.address) : '',
    phone: h.phone ? String(h.phone) : '',
    email: h.email ? String(h.email) : '',
    website: h.website ? String(h.website) : '',
    priceMin: Number.isFinite(Number(h.priceMin)) ? Number(h.priceMin) : 0,
    priceMax: Number.isFinite(Number(h.priceMax)) ? Number(h.priceMax) : 0,
    rating: Number.isFinite(Number(h.rating)) ? Number(h.rating) : 0,
    amenities: h.amenities != null ? String(h.amenities) : '',
    lat: (h.lat==null ? null : Number(h.lat)),
    lng: (h.lng==null ? null : Number(h.lng)),
    nearestAttraction: h.nearestAttraction ? String(h.nearestAttraction) : ''
  }))
  if (hotels.some(h => !h.name)) {
    return res.status(400).json({ message: 'every hotel must have a name' })
  }
  try {
    const tx = db.transaction(() => {
      const before = db.prepare('SELECT COUNT(1) as c FROM hotels').get().c
      db.prepare('DELETE FROM hotels').run()
      try { db.exec("DELETE FROM sqlite_sequence WHERE name='hotels';") } catch {}
      const insert = db.prepare(`INSERT INTO hotels (name, type, city, address, phone, email, website, priceMin, priceMax, rating, amenities, lat, lng, nearestAttraction)
        VALUES (@name, @type, @city, @address, @phone, @email, @website, @priceMin, @priceMax, @rating, @amenities, @lat, @lng, @nearestAttraction)`)
      for (const h of hotels) insert.run(h)
      const after = db.prepare('SELECT COUNT(1) as c FROM hotels').get().c
      return { deleted: before, inserted: after }
    })
    const out = tx()
    res.status(201).json({ message: 'Replaced hotels successfully', ...out })
  } catch (e) {
    res.status(500).json({ message: 'Failed to replace hotels', error: e.message })
  }
})

// Bulk import from JSON rows
// Body shape: { rows: [ { name, type, city, address, phone, email, website, priceMin, priceMax, rating, amenities, lat, lng }, ... ] }
router.post('/import', (req, res) => {
  const { rows } = req.body || {}
  if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ message: 'rows array required' })
  const stmt = db.prepare(`INSERT INTO hotels (name, type, city, address, phone, email, website, priceMin, priceMax, rating, amenities, lat, lng)
    VALUES (@name, @type, @city, @address, @phone, @email, @website, @priceMin, @priceMax, @rating, @amenities, @lat, @lng)`)
  try {
    const txn = db.transaction((items) => { for (const it of items) stmt.run({
      name: it.name,
      type: it.type || 'hotel',
      city: it.city || '',
      address: it.address || '',
      phone: it.phone || '',
      email: it.email || '',
      website: it.website || '',
      priceMin: Number(it.priceMin)||0,
      priceMax: Number(it.priceMax)||0,
      rating: Number(it.rating)||0,
      amenities: String(it.amenities||''),
      lat: (it.lat==null? null : Number(it.lat)),
      lng: (it.lng==null? null : Number(it.lng)),
    }) })
    txn(rows)
    const count = db.prepare('SELECT COUNT(1) as c FROM hotels').get().c
    res.status(201).json({ message: 'Imported', added: rows.length, total: count })
  } catch (e) {
    res.status(500).json({ message: 'Import failed', error: e.message })
  }
})

export default router

// Import from a local CSV file path on the server machine
// Body: { filePath: "C:/path/to/file.csv" }
router.post('/import-csv', (req, res) => {
  const { filePath } = req.body || {}
  if (!filePath) return res.status(400).json({ message: 'filePath is required' })
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true })

    // Expected headers in sample: Location,Name,Category,Latitude,Longitude,Address
    // Accept both lower/upper-case variations
    const mapRow = (r) => {
      const location = r.Location || r.location || ''
      const name = r.Name || r.name || ''
      const category = (r.Category || r.category || '').toLowerCase()
      const lat = Number(r.Latitude || r.latitude || '')
      const lng = Number(r.Longitude || r.longitude || '')
      const address = r.Address || r.address || ''
      return { location, name, category, lat: isFinite(lat) ? lat : null, lng: isFinite(lng) ? lng : null, address }
    }

    const HOTEL_TYPES = new Set(['hotel','guest_house','hostel','motel','homestay'])
    const mapped = records.map(mapRow).filter(x => x.name && HOTEL_TYPES.has(x.category))

    const stmt = db.prepare(`INSERT INTO hotels (name, type, city, address, phone, email, website, priceMin, priceMax, rating, amenities, lat, lng)
      VALUES (@name, @type, @city, @address, @phone, @email, @website, @priceMin, @priceMax, @rating, @amenities, @lat, @lng)`)
    const txn = db.transaction((rows) => {
      for (const r of rows) {
        stmt.run({
          name: r.name,
          type: r.category === 'homestay' ? 'homestay' : (r.category === 'guest_house' || r.category === 'hostel' ? 'homestay' : 'hotel'),
          city: r.location || '',
          address: r.address || '',
          phone: '',
          email: '',
          website: '',
          priceMin: 0,
          priceMax: 0,
          rating: 0,
          amenities: '',
          lat: r.lat,
          lng: r.lng,
        })
      }
    })
    txn(mapped)
    const added = mapped.length
    const total = db.prepare('SELECT COUNT(1) as c FROM hotels').get().c
    res.status(201).json({ message: 'CSV imported', added, total })
  } catch (e) {
    res.status(500).json({ message: 'Import failed', error: e.message })
  }
})
