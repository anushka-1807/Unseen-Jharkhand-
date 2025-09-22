import { Router } from 'express'
import { db } from '../sqlite.js'

const router = Router()

// List bookings (most recent first). Optional filter: ?email=...&limit=...
router.get('/', (req, res) => {
  const { email, limit } = req.query || {}
  try {
    if (email) {
      const lim = Number(limit) || 50
      const rows = db.prepare('SELECT * FROM bookings WHERE email = ? ORDER BY id DESC LIMIT ?').all(String(email), lim)
      return res.json(rows)
    }
    const rows = db.prepare('SELECT * FROM bookings ORDER BY id DESC').all()
    res.json(rows)
  } catch (e) {
    res.status(500).json({ message: 'Failed to list bookings', error: e.message })
  }
})

function daysBetween(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const ms = e - s
  if (!(ms >= 0)) return 0
  return Math.max(1, Math.ceil(ms / (24*60*60*1000)))
}

// Create a booking and suggest guides
router.post('/', (req, res) => {
  const {
    name, email, phone, city,
    startDate, endDate, groupSize = 1, budget = 'mid',
    interests = [], languages = []
  } = req.body || {}

  if (!name || !startDate || !endDate) return res.status(400).json({ message: 'name, startDate, endDate required' })

  const insert = db.prepare(`INSERT INTO bookings (name, email, phone, city, startDate, endDate, groupSize, budget, interests, languages)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const info = insert.run(
    name, email || '', phone || '', city || '', startDate, endDate,
    Number(groupSize)||1, String(budget||'mid'), String(interests), String(languages)
  )
  const saved = db.prepare('SELECT * FROM bookings WHERE id = ?').get(info.lastInsertRowid)

  // Guide suggestions
  const q = {
    city,
    interests: Array.isArray(interests) ? interests.join(',') : String(interests||''),
    languages: Array.isArray(languages) ? languages.join(',') : String(languages||'')
  }
  let query = 'SELECT * FROM guides WHERE 1=1'
  const params = []
  if (q.city) { query += ' AND city = ?'; params.push(q.city) }
  if (q.interests) {
    for (const s of q.interests.split(',').filter(Boolean)) { query += " AND specialties LIKE '%' || ? || '%'"; params.push(s) }
  }
  if (q.languages) {
    for (const s of q.languages.split(',').filter(Boolean)) { query += " AND languages LIKE '%' || ? || '%'"; params.push(s) }
  }
  query += ' ORDER BY rating DESC LIMIT 10'
  const guides = db.prepare(query).all(...params)

  // Calendar-aware estimation
  const days = daysBetween(startDate, endDate)
  const base = guides.length ? guides[0].pricePerDay : 1600
  const budgetFactor = budget === 'low' ? 0.9 : budget === 'high' ? 1.25 : 1.0
  const estimate = Math.round(base * days * budgetFactor)

  res.status(201).json({ booking: saved, guides, estimate, days })
})

export default router
