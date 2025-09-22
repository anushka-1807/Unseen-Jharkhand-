import { useState } from 'react'
import { useI18n } from '../context/I18nContext'
import { API_BASE } from '../lib/apiBase'

export default function RegisterGuide() {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [certificateId, setCertificateId] = useState('')
  const [languagesKnown, setLanguagesKnown] = useState('') // comma-separated
  const [experienceYears, setExperienceYears] = useState('')
  const [password, setPassword] = useState('')
  const [photo, setPhoto] = useState(null)
  const [certificateFile, setCertificateFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const form = new FormData()
      form.append('name', name)
      form.append('email', email)
      form.append('phone', phone)
      form.append('address', address)
      form.append('preferredLocation', preferredLocation)
      form.append('certificateId', certificateId)
      form.append('languagesKnown', languagesKnown)
      form.append('experienceYears', String(Number(experienceYears) || 0))
      form.append('password', password)
      if (photo) form.append('photo', photo)
      if (certificateFile) form.append('certificate', certificateFile)

      const res = await fetch(new URL('/api/auth/register-guide', API_BASE), {
        method: 'POST',
        body: form
      })
      const data = await res.json()
      if (!res.ok) throw data
      setMessage(t('registrationSuccess'))
      setName('')
      setEmail('')
      setPhone('')
      setAddress('')
      setPreferredLocation('')
      setCertificateId('')
      setLanguagesKnown('')
      setExperienceYears('')
      setPassword('')
      setPhoto(null)
      setCertificateFile(null)
    } catch (err) {
      setError(err?.message || t('registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <h2 style={{marginTop:0}}>{t('registerGuideTitle')}</h2>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {message && <div className="alert alert-success" role="status">{message}</div>}
        <form className="auth-grid" onSubmit={handleSubmit}>
          <div className="auth-row two">
            <label>
              <span>{t('name')}</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              <span>{t('email')}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
          </div>
          <div className="auth-row two">
            <label>
              <span>{t('phone')}</span>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label>
              <span>{t('yearsExp')}</span>
              <input type="number" min="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="0" />
            </label>
          </div>
          <label>
            <span>{t('address')}</span>
            <textarea rows="3" value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label>
            <span>{t('preferredLocation')}</span>
            <input type="text" value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)} />
          </label>
          <div className="auth-row two">
            <label>
              <span>{t('certificateId')}</span>
              <input type="text" value={certificateId} onChange={(e) => setCertificateId(e.target.value)} />
            </label>
            <label>
              <span>{t('languagesKnown')}</span>
              <input type="text" placeholder={t('languagesKnownPlaceholder')} value={languagesKnown} onChange={(e) => setLanguagesKnown(e.target.value)} />
            </label>
          </div>
          <div className="auth-row two">
            <label>
              <span>{t('password')}</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <label>
              <span>{t('uploadPhoto')}</span>
              <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
            </label>
          </div>
          <label>
            <span>{t('uploadCertificate')}</span>
            <input type="file" accept="application/pdf,image/*" onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} />
          </label>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? t('submitting') : t('submit')}</button>
        </form>
      </div>
    </main>
  )
}
