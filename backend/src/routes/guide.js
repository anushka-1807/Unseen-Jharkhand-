import { Router } from 'express'
import { db } from '../sqlite.js'

const router = Router()

// Create a new guide
router.post('/create', (req, res) => {
  const { name, email, phone, city, specialties = '', languages = '', pricePerDay = 1500, rating = 4.5, photo = null } = req.body || {}
  if (!name) return res.status(400).json({ message: 'name is required' })
  try {
    const stmt = db.prepare(`INSERT INTO guides (name, email, phone, city, specialties, languages, pricePerDay, rating, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const info = stmt.run(name, email, phone, city, String(specialties), String(languages), Number(pricePerDay), Number(rating), photo)
    const row = db.prepare('SELECT * FROM guides WHERE id = ?').get(info.lastInsertRowid)
    return res.status(201).json(row)
  } catch (e) {
    return res.status(400).json({ message: 'Unable to create guide', error: e.message })
  }
})

// ----- Mock endpoints for Guide Dashboard -----
// Profile
router.get('/profile', (req, res) => {
  const { email } = req.query
  // Try to source from guides table if present
  try {
    let row = null
    if (email) {
      row = db.prepare('SELECT * FROM guides WHERE email = ?').get(String(email))
    }
    const profile = row ? {
      name: row.name,
      email: row.email,
      phone: row.phone || '9990000000',
      address: `${row.city || 'Ranchi'}, Jharkhand`,
      languagesKnown: row.languages || 'Hindi,English',
      certificateId: 'JH-GUIDE-2025-001',
      experienceYears: 3
    } : {
      name: 'Demo Guide',
      email: email || 'guide@example.com',
      phone: '9990000000',
      address: 'Ranchi, Jharkhand',
      languagesKnown: 'Hindi,English',
      certificateId: 'JH-GUIDE-2025-001',
      experienceYears: 3
    }
    res.json(profile)
  } catch (e) {
    res.status(500).json({ message: 'profile fetch failed', error: e.message })
  }
})

// Earnings summary
router.get('/earnings', (req, res) => {
  res.json({ total: 125000, month: 8500, lastPayout: '2025-09-01' })
})

// Feedbacks list (mock)
router.get('/feedbacks', (req, res) => {
  res.json([
    { id: 1, user: 'Arun', rating: 5, comment: 'Fantastic tour around waterfalls!' },
    { id: 2, user: 'Meera', rating: 4, comment: 'Very knowledgeable about local culture.' },
  ])
})

// Availability Settings for Dashboard (GET/POST) - avoid conflict with availability check below
let __availability = { available: true, note: '' }
router.get('/availability-settings', (req, res) => {
  res.json(__availability)
})
router.post('/availability-settings', (req, res) => {
  const { available, note } = req.body || {}
  __availability = { available: Boolean(available), note: String(note || '') }
  res.json(__availability)
})

// Transactions (mock)
router.get('/transactions', (req, res) => {
  res.json([
    { id: 101, amount: 2500, method: 'UPI', ref: 'pay_001', date: new Date().toISOString() },
    { id: 102, amount: 1800, method: 'Card', ref: 'pay_002', date: new Date(Date.now()-86400000).toISOString() },
  ])
})

// Bank details (GET/POST, in-memory)
let __bank = { accountName: 'Demo Guide', accountNumber: '1234567890', ifsc: 'JH0000123', bankName: 'Demo Bank', branch: 'Ranchi', updatedAt: new Date().toISOString() }
router.get('/bank', (req, res) => {
  res.json(__bank)
})
router.post('/bank', (req, res) => {
  const { accountName, accountNumber, ifsc, bankName, branch } = req.body || {}
  __bank = {
    accountName: String(accountName || __bank.accountName || ''),
    accountNumber: String(accountNumber || __bank.accountNumber || ''),
    ifsc: String(ifsc || __bank.ifsc || ''),
    bankName: String(bankName || __bank.bankName || ''),
    branch: String(branch || __bank.branch || ''),
    updatedAt: new Date().toISOString(),
  }
  res.json(__bank)
})

// Replace all guides with a supplied list
// Body can be either an array of guide objects or { guides: [...] }
// Each guide: { name (required), email, phone, city, specialties, languages, pricePerDay, rating }
router.post('/replace-all', (req, res) => {
  const required = process.env.ADMIN_KEY
  if (required && req.headers['x-admin-key'] !== required) {
    return res.status(401).json({ message: 'unauthorized' })
  }
  const payload = Array.isArray(req.body) ? req.body : (req.body?.guides || [])
  if (!Array.isArray(payload) || payload.length === 0) {
    return res.status(400).json({ message: 'provide an array of guide objects' })
  }
  // Basic validation: names are required; cap at 1000 to avoid accidental overload
  const MAX = 1000
  const guides = payload.slice(0, MAX).map(g => ({
    name: String(g.name || '').trim(),
    email: g.email ? String(g.email) : null,
    phone: g.phone ? String(g.phone) : null,
    city: g.city ? String(g.city) : null,
    specialties: g.specialties != null ? String(g.specialties) : '',
    languages: g.languages != null ? String(g.languages) : '',
    pricePerDay: Number.isFinite(Number(g.pricePerDay)) ? Number(g.pricePerDay) : 1500,
    rating: Number.isFinite(Number(g.rating)) ? Number(g.rating) : 4.5,
    photo: g.photo ? String(g.photo) : null,
  }))
  if (guides.some(g => !g.name)) {
    return res.status(400).json({ message: 'every guide must have a name' })
  }

  try {
    const tx = db.transaction(() => {
      // delete related messages first, then guides
      const msgCount = db.prepare('SELECT COUNT(1) as c FROM messages WHERE guideId IN (SELECT id FROM guides)').get().c
      db.prepare('DELETE FROM messages WHERE guideId IN (SELECT id FROM guides)').run()
      const gCount = db.prepare('SELECT COUNT(1) as c FROM guides').get().c
      db.prepare('DELETE FROM guides').run()

      const insert = db.prepare(`INSERT INTO guides (name, email, phone, city, specialties, languages, pricePerDay, rating, photo) VALUES (@name, @email, @phone, @city, @specialties, @languages, @pricePerDay, @rating, @photo)`)
      for (const g of guides) insert.run(g)
      return { deletedGuides: gCount, deletedMessages: msgCount, inserted: guides.length }
    })
    const out = tx()
    res.status(201).json({ message: 'Replaced guides successfully', ...out })
  } catch (e) {
    res.status(500).json({ message: 'Failed to replace guides', error: e.message })
  }
})

// List/search guides
router.get('/list', (req, res) => {
  const { city, interests, languages, limit = 20 } = req.query
  let query = 'SELECT * FROM guides WHERE 1=1'
  const params = []
  if (city) { query += ' AND city = ?'; params.push(city) }
  if (interests) { // comma separated
    const arr = String(interests).split(',').map(s=>s.trim()).filter(Boolean)
    for (const _ of arr) { query += " AND specialties LIKE '%' || ? || '%'"; params.push(_) }
  }
  if (languages) {
    const arr = String(languages).split(',').map(s=>s.trim()).filter(Boolean)
    for (const _ of arr) { query += " AND languages LIKE '%' || ? || '%'"; params.push(_) }
  }
  query += ' ORDER BY rating DESC LIMIT ?'; params.push(Number(limit))
  const rows = db.prepare(query).all(...params)
  res.json(rows)
})

// Fetch a single guide by email (for dashboard/login mapping)
router.get('/me', (req, res) => {
  const { email } = req.query
  if (!email) return res.status(400).json({ message: 'email required' })
  try {
    const row = db.prepare('SELECT * FROM guides WHERE email = ?').get(email)
    if (!row) {
      // Return a mock guide row instead of 404 so the dashboard can render
      return res.json({
        id: 0,
        name: 'Demo Guide',
        email,
        phone: '9990000000',
        city: 'Ranchi',
        specialties: 'Nature,Waterfalls,Culture',
        languages: 'Hindi,English',
        pricePerDay: 1800,
        rating: 4.6,
        photo: null,
      })
    }
    return res.json(row)
  } catch (e) {
    res.status(500).json({ message: 'lookup failed', error: e.message })
  }
})

// Basic availability check (placeholder: always true for now)
router.get('/availability', (req, res) => {
  const { guideId, start, end } = req.query
  if (!guideId || !start || !end) return res.status(400).json({ available: false, reason: 'guideId, start, end required' })
  // TODO: intersect with real bookings to compute availability
  res.json({ available: true })
})

export default router

// Admin-only (if needed): seed many mock guides
router.post('/seed', (req, res) => {
  const { count = 200 } = req.body || {}
  const cities = ['Ranchi','Hazaribagh','Netarhat','Ghatshila','Jamshedpur','Gumla','Dhanbad','Bokaro','Deoghar','Simdega']
  const specialtiesAll = ['Nature','Waterfalls','Temples','Culture','Arts','Food','Treks','Wildlife']
  const langAll = ['Hindi','English','Bengali','Ho','Mundari','Santhali']

  const insert = db.prepare(`INSERT INTO guides (name, email, phone, city, specialties, languages, pricePerDay, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  const makeOne = (i) => {
    const city = cities[i % cities.length]
    const pick = (arr, min=2, max=3) => {
      const k = Math.min(arr.length, Math.floor(Math.random()*(max-min+1))+min)
      const shuffled = [...arr].sort(()=>Math.random()-0.5)
      return shuffled.slice(0,k).join(',')
    }
    const specs = pick(specialtiesAll, 2, 4)
    const langs = pick(langAll, 2, 3)
    const price = 1400 + Math.floor(Math.random()*800) // 1400-2199
    const rating = (4.0 + Math.random()*1.0).toFixed(1) // 4.0 - 5.0
    const num = Date.now() + i
    const name = `Guide ${i+1}`
    const email = `guide${num}@example.com`
    const phone = `9${(1000000000 + (num % 899999999)).toString().padStart(10,'0')}`.slice(0,10)
    return [name, email, phone, city, specs, langs, price, Number(rating)]
  }

  try {
    const txn = db.transaction((n) => {
      for (let i=0;i<n;i++) insert.run(...makeOne(i))
    })
    txn(Number(count))
    const total = db.prepare('SELECT COUNT(1) as c FROM guides').get().c
    res.status(201).json({ message: 'Seeded guides', added: Number(count), total })
  } catch (e) {
    res.status(500).json({ message: 'Seeding failed', error: e.message })
  }
})
