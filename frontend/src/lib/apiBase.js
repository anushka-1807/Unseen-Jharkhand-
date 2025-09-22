// Prefer same-origin when deployed behind a single domain (backend serves frontend)
// Use VITE_API_BASE to override in multi-origin dev (e.g., Vercel + Render)
const sameOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'http://localhost:5000'
export const API_BASE = import.meta.env.VITE_API_BASE || sameOrigin
