import { Router } from 'express'
import multer from 'multer'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/login', (req, res) => {
  const { email, password = '', role = 'guide' } = req.body || {}
  if (!email) return res.status(400).json({ message: 'Email is required' })
  if (typeof password !== 'string' || password.length < 7) {
    return res.status(400).json({ message: 'Password must be at least 7 characters' })
  }
  // Mock token & role
  res.json({ token: 'mock-token', user: { email, role } })
})

// Mock in-memory guides registry
const guides = []
let guideId = 1

router.post('/register-guide', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'certificate', maxCount: 1 }]), (req, res) => {
  const { name, email, phone, address, preferredLocation, certificateId, languagesKnown, experienceYears = 0, password } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }
  if (String(password).length < 7) {
    return res.status(400).json({ message: 'Password must be at least 7 characters' })
  }
  const exists = guides.find(g => g.email === email)
  if (exists) return res.status(409).json({ message: 'Guide with this email already exists' })

  const photo = (req.files && req.files.photo && req.files.photo[0]) || null
  const cert = (req.files && req.files.certificate && req.files.certificate[0]) || null
  const photoInfo = photo ? { filename: photo.originalname, size: photo.size, mimetype: photo.mimetype } : null
  const certificateInfo = cert ? { filename: cert.originalname, size: cert.size, mimetype: cert.mimetype } : null

  const guide = { id: guideId++, name, email, phone, address, preferredLocation, certificateId, languagesKnown, experienceYears: Number(experienceYears) || 0, photo: photoInfo, certificate: certificateInfo }
  guides.push(guide)
  return res.status(201).json({ message: 'Registered successfully', guide })
})

export default router
