import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../lib/apiBase'

function useRazorpay() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existing) { setReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    s.onload = () => setReady(true)
    document.body.appendChild(s)
    return () => { s.remove() }
  }, [])
  return ready
}

export default function Payments() {
  const location = useLocation()
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search])
  const { user, isAuthenticated } = useAuth()
  const [type, setType] = useState(qs.get('type') || 'guide')
  const [reference, setReference] = useState(qs.get('ref') || '') // guide email or hotel name/id
  const [displayName, setDisplayName] = useState(qs.get('name') || '')
  const [amount, setAmount] = useState(qs.get('amount') || '') // in INR rupees for UI
  const [city, setCity] = useState(qs.get('city') || '')
  const [start, setStart] = useState(qs.get('start') || '')
  const [end, setEnd] = useState(qs.get('end') || '')
  const [payerEmail, setPayerEmail] = useState(user?.email || qs.get('email') || '')
  const [loading, setLoading] = useState(false)
  const ready = useRazorpay()

  const pay = async (e) => {
    e.preventDefault()
    if (!amount) return
    setLoading(true)
    try {
      // Create order from backend (convert to paise)
      const res = await fetch(new URL('/api/payments/create-order', API_BASE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(Number(amount) * 100), currency: 'INR', type, reference })
      })
      const data = await res.json()
      if (!res.ok) throw data

      // Always use mock verification path (Razorpay widget disabled)
      try {
        const verifyRes = await fetch(new URL('/api/payments/verify', API_BASE), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: 'pay_mock_' + Date.now(),
            razorpay_order_id: data.orderId,
            razorpay_signature: 'sig_mock',
            type,
            reference,
            amount: Math.round(Number(amount) * 100),
            meta: {
              name: displayName,
              payerEmail: payerEmail,
              city,
              start,
              end
            }
          })
        })
        const v = await verifyRes.json()
        if (!verifyRes.ok) throw v
        alert('Payment recorded (mock).')
        window.location.href = `/bookings?view=history&email=${encodeURIComponent(payerEmail)}`
        return
      } catch (err) {
        alert('Mock verification failed')
        return
      }

      const options = {
        key: data.keyId,
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        name: 'Jharkhand Tribal',
        description: `${type === 'hotel' ? 'Hotel/Homestay' : 'Guide'} Booking Payment (Test Mode)`,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(new URL('/api/payments/verify', API_BASE), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                type,
                reference,
                amount: Math.round(Number(amount) * 100),
                meta: {
                  name: displayName,
                  payerEmail: payerEmail,
                  city,
                  start,
                  end
                }
              })
            })
            const v = await verifyRes.json()
            if (!verifyRes.ok) throw v
            alert('Payment verified and recorded (test mode).')
            window.location.href = `/bookings?view=history&email=${encodeURIComponent(payerEmail)}`
          } catch (err) {
            alert('Verification failed')
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#b14a22'
        }
      }
      if (!ready) {
        alert('Payment library not loaded yet. Please try again in a moment.')
        return
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert(err?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page container">
      <h2>Test Payment (Mock)</h2>
      <form className="form" onSubmit={pay}>
        {!user?.email && (
          <label>
            <span>Your Email</span>
            <input type="email" value={payerEmail} onChange={(e)=>setPayerEmail(e.target.value)} required placeholder="you@example.com" />
          </label>
        )}
        <div className="auth-row two">
          <label>
            <span>Type</span>
            <select value={type} onChange={e=>setType(e.target.value)}>
              <option value="guide">Guide</option>
              <option value="hotel">Hotel/Homestay</option>
            </select>
          </label>
          <label>
            <span>{type === 'hotel' ? 'Hotel/Stay' : 'Guide'} Reference</span>
            <input value={reference} onChange={(e)=>setReference(e.target.value)} placeholder={type==='hotel' ? 'Hotel name or ID' : 'Guide email'} required />
          </label>
        </div>
        <label>
          <span>Display Name (optional)</span>
          <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Shown in payment description" />
        </label>
        <label>
          <span>Amount (INR)</span>
          <input type="number" min="1" step="1" value={amount} onChange={(e)=>setAmount(e.target.value)} required />
        </label>
        <button className="btn btn-primary" disabled={!ready || loading} type="submit">{loading ? 'Processing...' : 'Pay (Test)'}</button>
      </form>
      <p className="help-text">Use Razorpay test cards/UPI in sandbox. This records the transaction under the guide’s account.</p>
    </main>
  )
}
