import { Router } from 'express'
import { db } from '../sqlite.js'

const router = Router()

// Create a mock order (no external calls). Returns a fake orderId and a keyId for test UI.
router.post('/create-order', (req, res) => {
  const { amount, currency = 'INR', type = 'guide', reference = '' } = req.body || {}
  const amt = Number(amount)
  if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'valid amount required' })
  const orderId = `order_${Date.now()}_${Math.floor(Math.random()*10000)}`
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key'
  try {
    const stmt = db.prepare(`INSERT INTO payments (orderId, paymentId, type, reference, amount, currency, status, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    stmt.run(orderId, null, String(type||'guide'), String(reference||''), amt, String(currency||'INR'), 'created', JSON.stringify({}))
    res.status(201).json({ orderId, keyId })
  } catch (e) {
    res.status(500).json({ message: 'failed to create order', error: e.message })
  }
})

// Verify a mock payment and mark as paid. In real life validate signature.
router.post('/verify', (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, type = 'guide', reference = '', meta = {} } = req.body || {}
  if (!razorpay_order_id) return res.status(400).json({ message: 'order id required' })
  try {
    const existing = db.prepare('SELECT * FROM payments WHERE orderId = ?').get(razorpay_order_id)
    if (!existing) return res.status(404).json({ message: 'order not found' })
    const upd = db.prepare(`UPDATE payments SET paymentId = ?, status = ?, type = ?, reference = ?, amount = COALESCE(?, amount), meta = ? WHERE orderId = ?`)
    upd.run(String(razorpay_payment_id||'pay_mock'), 'paid', String(type||existing.type||'guide'), String(reference||existing.reference||''), Number(amount)||existing.amount, JSON.stringify(meta||{}), razorpay_order_id)

    // Auto-create minimal booking row (Option A)
    // Expect meta to optionally include: payerEmail, name, city, start, end
    const m = meta || {}
    const name = String(m.name || reference || 'Payment Booking')
    const email = m.payerEmail ? String(m.payerEmail) : ''
    const city = m.city ? String(m.city) : ''
    const startDate = m.start ? String(m.start) : ''
    const endDate = m.end ? String(m.end) : ''
    // Insert only if we have at least an email or city to make the record meaningful
    let bookingId = null
    try {
      const ins = db.prepare(`INSERT INTO bookings (name, email, phone, city, startDate, endDate, groupSize, budget, interests, languages)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      const info = ins.run(name, email, '', city, startDate, endDate, 1, 'mid', '', '')
      bookingId = info.lastInsertRowid
    } catch (e) {
      // booking creation best-effort; continue
    }

    // Persist bookingId back into payment meta
    try {
      const mergedMeta = { ...(m||{}), bookingId }
      db.prepare('UPDATE payments SET meta = ? WHERE orderId = ?').run(JSON.stringify(mergedMeta), razorpay_order_id)
    } catch {}

    const saved = db.prepare('SELECT * FROM payments WHERE orderId = ?').get(razorpay_order_id)
    res.json({ message: 'Payment recorded (mock)', payment: saved, bookingId })
  } catch (e) {
    res.status(500).json({ message: 'verification failed', error: e.message })
  }
})

export default router
