import { Router } from 'express'
import { db } from '../sqlite.js'

const router = Router()

// List shops (basic)
router.get('/list', (req, res) => {
  try {
    const { q, city, category, limit = 50 } = req.query
    let base = 'SELECT id, shopId, name, shopNumber, licence, location, phone, ownerName, category, createdAt FROM shops WHERE 1=1'
    const params = []
    if (q) {
      base += ` AND (LOWER(name) LIKE ? OR LOWER(ownerName) LIKE ? OR LOWER(shopId) LIKE ?)`
      const s = `%${String(q).toLowerCase()}%`
      params.push(s, s, s)
    }
    if (city) { base += ' AND LOWER(location) = ?'; params.push(String(city).toLowerCase()) }
    if (category) { base += ' AND LOWER(category) = ?'; params.push(String(category).toLowerCase()) }
    base += ' ORDER BY createdAt DESC LIMIT ?'; params.push(Number(limit))
    const rows = db.prepare(base).all(...params)
    res.json(rows)
  } catch (e) {
    res.status(500).json({ message: 'Failed to list shops', error: e.message })
  }
})

// Register a shop
router.post('/register', (req, res) => {
  try {
    const { name, shopNumber, shopId, licence, location, phone, password, ownerName, category } = req.body || {}
    if (!name || !shopNumber || !shopId || !licence || !location || !phone || !password || !ownerName || !category) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    const exists = db.prepare('SELECT id FROM shops WHERE shopId = ?').get(shopId)
    if (exists) return res.status(409).json({ message: 'Shop ID already exists' })
    const stmt = db.prepare(`INSERT INTO shops (shopId, name, shopNumber, licence, location, phone, password, ownerName, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    const info = stmt.run(shopId, name, shopNumber, licence, location, phone, String(password), ownerName, category)
    const row = db.prepare('SELECT id, shopId, name, shopNumber, licence, location, phone, ownerName, category, createdAt FROM shops WHERE id = ?').get(info.lastInsertRowid)
    return res.status(201).json({ message: 'Registered successfully', shop: row })
  } catch (e) {
    res.status(500).json({ message: 'Registration failed', error: e.message })
  }
})

// Login a shop
router.post('/login', (req, res) => {
  try {
    const { shopId, password } = req.body || {}
    if (!shopId || !password) return res.status(400).json({ message: 'shopId and password required' })
    const row = db.prepare('SELECT * FROM shops WHERE shopId = ?').get(String(shopId))
    if (!row || String(row.password) !== String(password)) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const out = { id: row.id, shopId: row.shopId, name: row.name, shopNumber: row.shopNumber, licence: row.licence, location: row.location, phone: row.phone, ownerName: row.ownerName, category: row.category, createdAt: row.createdAt }
    res.json({ token: 'shop-mock-token', shop: out })
  } catch (e) {
    res.status(500).json({ message: 'Login failed', error: e.message })
  }
})

export default router
