import { Link } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden>⟡</span>
          <strong>Unseen Jharkhand</strong>
          <small style={{opacity:.8}}>{t('footerTagline')}</small>
        </div>

        <nav className="footer-links" aria-label="Useful links">
          <Link to="/">{t('home')}</Link>
          <Link to="/bookings">{t('bookings')}</Link>
          <Link to="/about">{t('about')}</Link>
          <Link to="/register-guide">{t('footerRegisterGuide')}</Link>
          <Link to="/guide">{t('footerGuideDashboard')}</Link>
          <Link to="/payments">{t('footerPayments')}</Link>
        </nav>

        <div className="footer-meta">
          <div className="socials" aria-label="Social links">
            <a href="#" aria-label="Twitter" title="Twitter">𝕏</a>
            <a href="#" aria-label="Instagram" title="Instagram">◎</a>
            <a href="#" aria-label="YouTube" title="YouTube">▶</a>
          </div>
          <div className="contact">
            <a href="mailto:hello@jharkhand-tribal.example">hello@jharkhand-tribal.example</a>
          </div>
          <div className="copy">© {new Date().getFullYear()} Unseen Jharkhand</div>
        </div>
      </div>
    </footer>
  )
}
