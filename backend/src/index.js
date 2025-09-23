import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import authRouter from './routes/auth.js'
import bookingsRouter from './routes/bookings.js'
import guideRouter from './routes/guide.js'
import aiRouter from './routes/ai.js'
import { db, seedGuidesIfEmpty, seedHotelsIfEmpty, seedShopsIfEmpty } from './sqlite.js'
import paymentsRouter from './routes/payments.js'
import hotelsRouter from './routes/hotels.js'
import messagesRouter from './routes/messages.js'
import itineraryRouter from './routes/itinerary.js'
import shopsRouter from './routes/shops.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: ORIGIN }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/guide', guideRouter)
app.use('/api/hotels', hotelsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/itinerary', itineraryRouter)
app.use('/api/ai', aiRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/shops', shopsRouter)

// --- Static hosting for frontend build ---
// Resolve path to frontend/dist (frontend is sibling of backend)
const __dirname = path.resolve()
const frontendDist = path.resolve(__dirname, '..', 'frontend', 'dist')
app.use(express.static(frontendDist))

// SPA fallback: for any non-API route, return index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(path.join(frontendDist, 'index.html'))
})

app.listen(PORT, () => {
  try { seedGuidesIfEmpty() } catch (e) { console.error('Seeding guides failed:', e) }
  try { seedHotelsIfEmpty() } catch (e) { console.error('Seeding hotels failed:', e) }
  try { seedShopsIfEmpty() } catch (e) { console.error('Seeding shops failed:', e) }
  console.log(`Backend listening on http://localhost:${PORT}`)
})
