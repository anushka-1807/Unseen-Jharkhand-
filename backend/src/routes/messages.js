import { Router } from 'express'
import { db } from '../sqlite.js'

const router = Router()

// Send a message to a guide
router.post('/send', (req, res) => {
  const { guideId, senderName = '', senderEmail = '', message } = req.body || {}
  if (!guideId || !message) return res.status(400).json({ message: 'guideId and message are required' })
  try {
    const stmt = db.prepare(`INSERT INTO messages (guideId, senderName, senderEmail, message, isFromGuide, isRead) VALUES (?, ?, ?, ?, 0, 0)`)
    const info = stmt.run(Number(guideId), String(senderName||''), String(senderEmail||''), String(message))
    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid)
    res.status(201).json(row)
  } catch (e) {
    res.status(400).json({ message: 'Unable to send message', error: e.message })
  }
})

// Get thread for a guide (most recent first)
router.get('/thread', (req, res) => {
  const guideId = Number(req.query.guideId)
  const limit = Number(req.query.limit || 50)
  if (!guideId) return res.status(400).json({ message: 'guideId required' })
  try {
    const rows = db.prepare(`SELECT * FROM messages WHERE guideId = ? ORDER BY datetime(createdAt) DESC LIMIT ?`).all(guideId, limit)
    res.json(rows)
  } catch (e) {
    res.status(500).json({ message: 'Unable to fetch thread', error: e.message })
  }
})

// Guide replies to a visitor
router.post('/reply', (req, res) => {
  const { guideId, message } = req.body || {}
  if (!guideId || !message) return res.status(400).json({ message: 'guideId and message are required' })
  try {
    const stmt = db.prepare(`INSERT INTO messages (guideId, senderName, senderEmail, message, isFromGuide, isRead) VALUES (?, ?, ?, ?, 1, 0)`)
    const info = stmt.run(Number(guideId), 'Guide', '', String(message))
    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid)
    res.status(201).json(row)
  } catch (e) {
    res.status(400).json({ message: 'Unable to send reply', error: e.message })
  }
})

// Mark messages as read for a guide (all visitor messages or specific ids)
router.post('/mark-read', (req, res) => {
  const { guideId, ids } = req.body || {}
  if (!guideId) return res.status(400).json({ message: 'guideId required' })
  try {
    if (Array.isArray(ids) && ids.length > 0) {
      const placeholders = ids.map(()=>'?').join(',')
      const stmt = db.prepare(`UPDATE messages SET isRead = 1 WHERE guideId = ? AND id IN (${placeholders})`)
      stmt.run(guideId, ...ids)
    } else {
      db.prepare(`UPDATE messages SET isRead = 1 WHERE guideId = ? AND isFromGuide = 0`).run(guideId)
    }
    const unread = db.prepare(`SELECT COUNT(1) as c FROM messages WHERE guideId = ? AND isFromGuide = 0 AND isRead = 0`).get(guideId).c
    res.json({ message: 'Marked as read', unread })
  } catch (e) {
    res.status(400).json({ message: 'Unable to mark as read', error: e.message })
  }
})

// Guide inbox: latest N messages, with unread count
router.get('/inbox', (req, res) => {
  const guideId = Number(req.query.guideId)
  const limit = Number(req.query.limit || 50)
  if (!guideId) return res.status(400).json({ message: 'guideId required' })
  try {
    const rows = db.prepare(`SELECT * FROM messages WHERE guideId = ? ORDER BY datetime(createdAt) DESC LIMIT ?`).all(guideId, limit)
    const unread = db.prepare(`SELECT COUNT(1) as c FROM messages WHERE guideId = ? AND isFromGuide = 0 AND isRead = 0`).get(guideId).c
    res.json({ unread, items: rows })
  } catch (e) {
    res.status(500).json({ message: 'Unable to fetch inbox', error: e.message })
  }
})

export default router
