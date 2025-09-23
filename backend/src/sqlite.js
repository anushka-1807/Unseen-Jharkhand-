import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Allow overriding DB path for hosts with persistent disks (e.g., Render)
const envPath = process.env.SQLITE_PATH && String(process.env.SQLITE_PATH).trim()
const defaultPath = path.join(process.cwd(), 'data', 'app.db')
const dbPath = envPath || defaultPath
fs.mkdirSync(path.dirname(dbPath), { recursive: true })
export const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS guides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  city TEXT,
  specialties TEXT,
  languages TEXT,
  pricePerDay INTEGER DEFAULT 1500,
  rating REAL DEFAULT 4.5
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  city TEXT,
  startDate TEXT,
  endDate TEXT,
  groupSize INTEGER,
  budget TEXT,
  interests TEXT,
  languages TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hotels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'hotel', -- hotel | homestay
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  priceMin INTEGER,
  priceMax INTEGER,
  rating REAL,
  amenities TEXT, -- comma separated
  lat REAL,
  lng REAL
);

CREATE TABLE IF NOT EXISTS shops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shopId TEXT UNIQUE,
  name TEXT NOT NULL,
  shopNumber TEXT,
  licence TEXT,
  location TEXT,
  phone TEXT,
  password TEXT,
  ownerName TEXT,
  category TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guideId INTEGER NOT NULL,
  senderName TEXT,
  senderEmail TEXT,
  message TEXT NOT NULL,
  isFromGuide INTEGER DEFAULT 0,
  isRead INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (guideId) REFERENCES guides(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId TEXT,
  paymentId TEXT,
  type TEXT, -- 'guide' | 'hotel'
  reference TEXT, -- guideEmail or hotelName/id
  amount INTEGER,
  currency TEXT,
  status TEXT, -- created | paid | failed
  meta TEXT, -- JSON string of extra details
  createdAt TEXT DEFAULT (datetime('now'))
);
`)

// Lightweight migration to add missing columns on existing databases
try {
  const cols = db.prepare("PRAGMA table_info(messages)").all().map(c => c.name)
  if (!cols.includes('isFromGuide')) db.exec("ALTER TABLE messages ADD COLUMN isFromGuide INTEGER DEFAULT 0;")
  if (!cols.includes('isRead')) db.exec("ALTER TABLE messages ADD COLUMN isRead INTEGER DEFAULT 0;")
} catch (e) {
  console.warn('messages schema migration skipped:', e.message)
}

// Add missing 'photo' column on guides if needed
try {
  const gcols = db.prepare("PRAGMA table_info(guides)").all().map(c => c.name)
  if (!gcols.includes('photo')) {
    db.exec("ALTER TABLE guides ADD COLUMN photo TEXT;")
  }
} catch (e) {
  console.warn('guides schema migration skipped:', e.message)
}

// Add missing 'nearestAttraction' column on hotels if needed
try {
  const hcols = db.prepare("PRAGMA table_info(hotels)").all().map(c => c.name)
  if (!hcols.includes('nearestAttraction')) {
    db.exec("ALTER TABLE hotels ADD COLUMN nearestAttraction TEXT;")
  }
} catch (e) {
  console.warn('hotels schema migration skipped:', e.message)
}

export function seedGuidesIfEmpty() {
  const row = db.prepare('SELECT COUNT(1) as c FROM guides').get()
  if (row.c === 0) {
    const insert = db.prepare(`INSERT INTO guides (name, email, phone, city, specialties, languages, pricePerDay, rating) VALUES (@name, @email, @phone, @city, @specialties, @languages, @pricePerDay, @rating)`)    
    const initial = [
      { name: 'Aman Kumar', email: 'aman@example.com', phone: '9990001111', city: 'Ranchi', specialties: 'Nature,Waterfalls,Temples', languages: 'Hindi,English', pricePerDay: 1800, rating: 4.7 },
      { name: 'Priya Soren', email: 'priya@example.com', phone: '9990002222', city: 'Hazaribagh', specialties: 'Culture,Arts,Wildlife', languages: 'Hindi,Santhali', pricePerDay: 2000, rating: 4.8 },
      { name: 'Sanjay Munda', email: 'sanjay@example.com', phone: '9990003333', city: 'Netarhat', specialties: 'Treks,Nature', languages: 'Hindi,Mundari', pricePerDay: 1700, rating: 4.6 },
      { name: 'Ritika Ho', email: 'ritika@example.com', phone: '9990004444', city: 'Ghatshila', specialties: 'Nature,Food', languages: 'Hindi,Ho', pricePerDay: 1600, rating: 4.5 },
      { name: 'Arjun Das', email: 'arjun@example.com', phone: '9990005555', city: 'Jamshedpur', specialties: 'Food,Culture', languages: 'Hindi,Bengali,English', pricePerDay: 1500, rating: 4.4 },
      { name: 'Meera Oraon', email: 'meera@example.com', phone: '9990006666', city: 'Gumla', specialties: 'Culture,Temples,Treks', languages: 'Hindi,English', pricePerDay: 1750, rating: 4.7 },
      { name: 'Rohit Singh', email: 'rohit.dhanbad@example.com', phone: '9990007777', city: 'Dhanbad', specialties: 'Nature,Temples', languages: 'Hindi,English', pricePerDay: 1550, rating: 4.3 },
      { name: 'Kiran Bose', email: 'kiran.bokaro@example.com', phone: '9990008888', city: 'Bokaro', specialties: 'Culture,Food', languages: 'Hindi,Bengali', pricePerDay: 1500, rating: 4.2 },
      { name: 'Sita Pandey', email: 'sita.deoghar@example.com', phone: '9990009999', city: 'Deoghar', specialties: 'Temples,Culture,Food', languages: 'Hindi,English', pricePerDay: 1650, rating: 4.5 },
      { name: 'Laxmi Toppo', email: 'laxmi.simdega@example.com', phone: '9990010001', city: 'Simdega', specialties: 'Treks,Nature,Wildlife', languages: 'Hindi,English', pricePerDay: 1600, rating: 4.4 },
      { name: 'Dev Verma', email: 'dev.ranchi@example.com', phone: '9990010002', city: 'Ranchi', specialties: 'Waterfalls,Nature,Food', languages: 'Hindi,English', pricePerDay: 1850, rating: 4.6 },
      { name: 'Nisha Oraon', email: 'nisha.netarhat@example.com', phone: '9990010003', city: 'Netarhat', specialties: 'Treks,Nature,Wildlife', languages: 'Hindi,Mundari', pricePerDay: 1700, rating: 4.7 },
    ]
    const txn = db.transaction((rows) => {
      for (const r of rows) insert.run(r)
    })
    txn(initial)
  }
}

export function seedShopsIfEmpty() {
  const row = db.prepare('SELECT COUNT(1) as c FROM shops').get()
  if (row.c === 0) {
    const insert = db.prepare(`INSERT INTO shops (shopId, name, shopNumber, licence, location, phone, password, ownerName, category) VALUES (@shopId, @name, @shopNumber, @licence, @location, @phone, @password, @ownerName, @category)`)
    const initial = [
      { shopId: 'JH-SHOP-001', name: 'Sohrai Crafts', shopNumber: '12A', licence: 'LIC-2025-001', location: 'Ranchi', phone: '9991100001', ownerName: 'Aman Kumar', category: 'Handicrafts', password: 'Shop@123' },
      { shopId: 'JH-SHOP-002', name: 'Dokra Art House', shopNumber: '7B', licence: 'LIC-2025-002', location: 'Hazaribagh', phone: '9991100002', ownerName: 'Priya Soren', category: 'Metal Art', password: 'Shop@123' },
      { shopId: 'JH-SHOP-003', name: 'Bamboo Works', shopNumber: '18', licence: 'LIC-2025-003', location: 'Gumla', phone: '9991100003', ownerName: 'Rohit Singh', category: 'Bamboo', password: 'Shop@123' },
      { shopId: 'JH-SHOP-004', name: 'Tussar Weaves', shopNumber: 'C-22', licence: 'LIC-2025-004', location: 'Jamshedpur', phone: '9991100004', ownerName: 'Arjun Das', category: 'Textiles', password: 'Shop@123' },
      { shopId: 'JH-SHOP-005', name: 'Paitkar Gallery', shopNumber: '4/2', licence: 'LIC-2025-005', location: 'Ambadubi', phone: '9991100005', ownerName: 'Meera Oraon', category: 'Paintings', password: 'Shop@123' },
      { shopId: 'JH-SHOP-006', name: 'Sohrai Studio', shopNumber: '9', licence: 'LIC-2025-006', location: 'Hazaribagh', phone: '9991100006', ownerName: 'Nisha Oraon', category: 'Paintings', password: 'Shop@123' },
      { shopId: 'JH-SHOP-007', name: 'Tribal Taste', shopNumber: 'K-3', licence: 'LIC-2025-007', location: 'Ranchi', phone: '9991100007', ownerName: 'Dev Verma', category: 'Food', password: 'Shop@123' },
      { shopId: 'JH-SHOP-008', name: 'Stone & Wood', shopNumber: '21', licence: 'LIC-2025-008', location: 'Ghatshila', phone: '9991100008', ownerName: 'Ritika Ho', category: 'Wood/Stone', password: 'Shop@123' },
      { shopId: 'JH-SHOP-009', name: 'Handloom Hub', shopNumber: '5C', licence: 'LIC-2025-009', location: 'Bokaro', phone: '9991100009', ownerName: 'Kiran Bose', category: 'Textiles', password: 'Shop@123' },
      { shopId: 'JH-SHOP-010', name: 'Heritage Bazaar', shopNumber: 'A-10', licence: 'LIC-2025-010', location: 'Deoghar', phone: '9991100010', ownerName: 'Sita Pandey', category: 'Mixed', password: 'Shop@123' },
    ]
    const txn = db.transaction((rows) => { for (const r of rows) insert.run(r) })
    txn(initial)
  }
}

export function seedHotelsIfEmpty() {
  const row = db.prepare('SELECT COUNT(1) as c FROM hotels').get()
  if (row.c === 0) {
    const insert = db.prepare(`INSERT INTO hotels (name, type, city, address, phone, email, website, priceMin, priceMax, rating, amenities, lat, lng) VALUES (@name, @type, @city, @address, @phone, @email, @website, @priceMin, @priceMax, @rating, @amenities, @lat, @lng)`)
    const initial = [
      { name: 'Patratu Valley View Resort', type: 'hotel', city: 'Ranchi', address: 'Patratu Valley Rd', phone: '9991100001', email: 'pvvr@example.com', website: '', priceMin: 1800, priceMax: 3200, rating: 4.4, amenities: 'wifi,parking,restaurant', lat: 23.622, lng: 85.279 },
      { name: 'Netarhat Sunset Homestay', type: 'homestay', city: 'Netarhat', address: 'Near Sunset Point', phone: '9991100002', email: 'netarhat.home@example.com', website: '', priceMin: 1200, priceMax: 2200, rating: 4.6, amenities: 'wifi,parking,breakfast', lat: 23.480, lng: 84.264 },
      { name: 'Deoghar Temple Inn', type: 'hotel', city: 'Deoghar', address: 'Baidyanath Dham Rd', phone: '9991100003', email: 'deoghar.inn@example.com', website: '', priceMin: 1500, priceMax: 2600, rating: 4.3, amenities: 'wifi,ac,restaurant', lat: 24.492, lng: 86.703 },
      { name: 'Hazaribagh Lake Homestay', type: 'homestay', city: 'Hazaribagh', address: 'Near Hazaribagh Lake', phone: '9991100004', email: 'hzbh.home@example.com', website: '', priceMin: 1000, priceMax: 1800, rating: 4.2, amenities: 'breakfast,lake-view', lat: 23.996, lng: 85.361 },
      { name: 'Jamshedpur City Hotel', type: 'hotel', city: 'Jamshedpur', address: 'Bistupur', phone: '9991100005', email: 'jsr.city@example.com', website: '', priceMin: 2200, priceMax: 4200, rating: 4.1, amenities: 'wifi,parking,ac,restaurant', lat: 22.804, lng: 86.203 },
    ]
    const txn = db.transaction((rows) => { for (const r of rows) insert.run(r) })
    txn(initial)
  }
}
