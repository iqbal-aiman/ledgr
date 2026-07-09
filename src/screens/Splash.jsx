import { useEffect, useState } from 'react'
import './Splash.css'

function Splash({ onDone }) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 400)
    const t2 = setTimeout(() => setStage(2), 900)
    const t3 = setTimeout(() => setStage(3), 2000)
    const t4 = setTimeout(() => onDone(), 2500)
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4)
    }
  }, [])

  return (
    <div className={`splash ${stage === 3 ? 'splash-out' : ''}`}>
      <div className="splash-circle-1" />
      <div className="splash-circle-2" />

      <div className={`splash-logo ${stage >= 0 ? 'logo-in' : ''}`}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <text x="8" y="40" fontFamily="Georgia, serif" fontSize="40" fontWeight="700" fill="#C9A15A">L</text>
          <line x1="8" y1="20" x2="38" y2="20" stroke="rgba(201,161,90,0.4)" strokeWidth="1.5" />
          <line x1="8" y1="28" x2="38" y2="28" stroke="rgba(201,161,90,0.4)" strokeWidth="1.5" />
          <line x1="8" y1="36" x2="38" y2="36" stroke="rgba(201,161,90,0.4)" strokeWidth="1.5" />
        </svg>
      </div>

      <div className={`splash-name ${stage >= 1 ? 'text-in' : ''}`}>ledgr</div>

      <div className={`splash-tagline ${stage >= 2 ? 'tagline-in' : ''}`}>
        Your shop. Your records.
      </div>

      <div className={`splash-bottom ${stage >= 2 ? 'tagline-in' : ''}`}>
        <div className="splash-dot" />
        <span>Offline. Secure. Always ready.</span>
        <div className="splash-dot" />
      </div>
    </div>
  )
}

export default Splash