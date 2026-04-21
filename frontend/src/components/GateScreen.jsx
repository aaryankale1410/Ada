import { useState, useEffect, useRef } from 'react';

// ── Change this to whatever password you want ──
const ACCESS_CODE = 'akshadalovesaaryan';

export default function GateScreen({ onAccessGranted }) {
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState('boot'); // 'boot' → 'terminal' → 'denied' → 'granted'
  const [bootLines, setBootLines] = useState([]);
  const [shakeInput, setShakeInput] = useState(false);
  const [deniedFlash, setDeniedFlash] = useState(false);
  const [grantedProgress, setGrantedProgress] = useState(0);
  const inputRef = useRef(null);

  // Fake boot sequence
  const bootSequence = [
    { text: '> INITIALIZING SECURE CHANNEL v4.7.2...', delay: 0 },
    { text: '> LOADING ENCRYPTION MODULES ██████████ OK', delay: 400 },
    { text: '> ESTABLISHING UPLINK TO [REDACTED]...', delay: 800 },
    { text: '> SATELLITE HANDSHAKE .............. CONFIRMED', delay: 1300 },
    { text: '> VERIFYING CLEARANCE PROTOCOLS...', delay: 1900 },
    { text: '> DEFENSE NETWORK SYNC ██████████ OK', delay: 2300 },
    { text: '> BIOMETRIC FALLBACK: PASSWORD AUTH ENABLED', delay: 2800 },
    { text: '> AWAITING OPERATOR CREDENTIALS_', delay: 3400 },
  ];

  useEffect(() => {
    // Check session
    if (sessionStorage.getItem('gate_cleared') === 'true') {
      onAccessGranted();
      return;
    }

    // Boot animation
    bootSequence.forEach((line, i) => {
      setTimeout(() => {
        setBootLines((prev) => [...prev, line.text]);
        if (i === bootSequence.length - 1) {
          setTimeout(() => {
            setPhase('terminal');
            setTimeout(() => inputRef.current?.focus(), 200);
          }, 600);
        }
      }, line.delay);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.toLowerCase().trim() === ACCESS_CODE.toLowerCase()) {
      // GRANTED
      setPhase('granted');
      setGrantedProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setGrantedProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          sessionStorage.setItem('gate_cleared', 'true');
          setTimeout(() => onAccessGranted(), 300);
        }
      }, 25);
    } else {
      // DENIED
      setPhase('denied');
      setShakeInput(true);
      setDeniedFlash(true);
      setTimeout(() => setDeniedFlash(false), 600);
      setTimeout(() => {
        setShakeInput(false);
        setPhase('terminal');
        setPassword('');
        inputRef.current?.focus();
      }, 1500);
    }
  };

  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <div className={`gate-screen ${deniedFlash ? 'gate-denied-flash' : ''}`}>
      {/* Scanlines overlay */}
      <div className="gate-scanlines" />

      {/* Vignette */}
      <div className="gate-vignette" />

      {/* Floating particles */}
      <div className="gate-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="gate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Header bar */}
      <div className="gate-header">
        <div className="gate-header-left">
          <span className="gate-status-dot" />
          <span>SECURE CHANNEL ACTIVE</span>
        </div>
        <div className="gate-header-right">
          <span>{currentDate}</span>
          <span className="gate-divider">|</span>
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="gate-container">
        {/* Classification stamp */}
        <div className="gate-stamp">
          <div className="gate-stamp-border">
            <span>TOP SECRET</span>
          </div>
        </div>

        {/* Title with glitch */}
        <div className="gate-title-wrap">
          <h1 className="gate-title glitch" data-text="PROJECT ECLIPSE">
            PROJECT ECLIPSE
          </h1>
          <div className="gate-subtitle">
            DEPARTMENT OF DEFENSE • DIVISION ██ • CLEARANCE LEVEL OMEGA
          </div>
        </div>

        {/* Divider */}
        <div className="gate-line" />

        {/* Boot log */}
        <div className="gate-boot-log">
          {bootLines.map((line, i) => (
            <div key={i} className="gate-boot-line">
              {line}
            </div>
          ))}
        </div>

        {/* Terminal input */}
        {phase === 'terminal' && (
          <form className="gate-form" onSubmit={handleSubmit}>
            <div className="gate-input-label">
              <span className="gate-caret">&gt;</span> ENTER ACCESS CODE:
            </div>
            <div className={`gate-input-wrap ${shakeInput ? 'gate-shake' : ''}`}>
              <span className="gate-input-prefix">█</span>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="gate-input"
                autoComplete="off"
                spellCheck="false"
                placeholder="••••••••"
              />
              <button type="submit" className="gate-submit">
                AUTHENTICATE →
              </button>
            </div>
          </form>
        )}

        {/* ACCESS DENIED */}
        {phase === 'denied' && (
          <div className="gate-result gate-result-denied">
            <div className="gate-result-icon">✕</div>
            <div className="gate-result-text">ACCESS DENIED</div>
            <div className="gate-result-sub">INVALID CREDENTIALS — INCIDENT LOGGED</div>
          </div>
        )}

        {/* ACCESS GRANTED */}
        {phase === 'granted' && (
          <div className="gate-result gate-result-granted">
            <div className="gate-result-icon">✓</div>
            <div className="gate-result-text">CLEARANCE GRANTED</div>
            <div className="gate-result-sub">WELCOME, OPERATOR</div>
            <div className="gate-progress-bar">
              <div className="gate-progress-fill" style={{ width: `${grantedProgress}%` }} />
            </div>
            <div className="gate-progress-label">DECRYPTING CONTENT... {grantedProgress}%</div>
          </div>
        )}

        {/* Footer warning */}
        <div className="gate-warning">
          ⚠ UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE UNDER USC §1030.
          ALL ACTIVITIES ARE MONITORED AND RECORDED.
        </div>
      </div>

      {/* Corner decorations */}
      <div className="gate-corner gate-corner-tl" />
      <div className="gate-corner gate-corner-tr" />
      <div className="gate-corner gate-corner-bl" />
      <div className="gate-corner gate-corner-br" />
    </div>
  );
}
