import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = Router()

router.post('/chat', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return res.status(500).json({ message: 'GEMINI_API_KEY missing on server' })

    const { messages = [] } = req.body || {}
    // Keep last 12 messages max
    const safeMessages = Array.isArray(messages) ? messages.slice(-12) : []

    const genAI = new GoogleGenerativeAI(apiKey)
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    const model = genAI.getGenerativeModel({ model: modelName })

    // Build a single prompt with a system preamble for simplicity
    const system = 'You are a helpful travel assistant for a Jharkhand tourism app. Be concise and friendly.'
    const convo = safeMessages
      .map(m => `${m.role?.toUpperCase() || 'USER'}: ${String(m.content || '').trim()}`)
      .join('\n\n')
    const input = `${system}\n\n${convo}`.trim()

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: input }]}],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300
      }
    })
    const content = result?.response?.text()?.trim() || 'Sorry, I could not generate a response.'
    res.json({ content })
  } catch (e) {
    console.error('Chat error:', e)
    // Normalize Gemini SDK errors
    const msg = (typeof e?.message === 'string') ? e.message : 'Chat error'
    res.status(500).json({ message: msg })
  }
})

export default router

// Simple health check (non-secret)
router.get('/health', (req, res) => {
  const keyPresent = Boolean(process.env.GEMINI_API_KEY)
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  res.json({ ok: true, keyPresent, model })
})

