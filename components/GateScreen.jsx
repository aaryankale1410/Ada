'use client';

import { useState, useEffect, useRef } from 'react';

const ACCESS_CODE = 'akshadalovesaaryan';

const PARTICLES = [
  { left: '12%', top: '23%', delay: '0.5s', duration: '4.2s' },
  { left: '85%', top: '15%', delay: '1.2s', duration: '5.1s' },
  { left: '42%', top: '78%', delay: '2.0s', duration: '3.8s' },
  { left: '67%', top: '34%', delay: '0.8s', duration: '6.0s' },
  { left: '25%', top: '60%', delay: '2.5s', duration: '4.5s' },
  { left: '90%', top: '80%', delay: '1.5s', duration: '3.5s' },
  { left: '5%', top: '45%', delay: '3.0s', duration: '5.5s' },
  { left: '75%', top: '65%', delay: '0.2s', duration: '4.8s' },
  { left: '33%', top: '10%', delay: '1.8s', duration: '6.2s' },
  { left: '55%', top: '90%', delay: '2.2s', duration: '3.9s' },
  { left: '18%', top: '85%', delay: '0.7s', duration: '5.0s' },
  { left: '80%', top: '40%', delay: '1.1s', duration: '4.1s' },
  { left: '60%', top: '20%', delay: '2.8s', duration: '5.8s' },
  { left: '48%', top: '50%', delay: '0.4s', duration: '3.6s' },
  { left: '95%', top: '25%', delay: '1.9s', duration: '4.9s' },
  { left: '8%', top: '70%', delay: '2.4s', duration: '6.1s' },
  { left: '38%', top: '95%', delay: '0.9s', duration: '3.7s' },
  { left: '70%', top: '85%', delay: '1.6s', duration: '5.3s' },
  { left: '22%', top: '35%', delay: '2.7s', duration: '4.4s' },
  { left: '88%', top: '5%', delay: '0.3s', duration: '5.7s' },
];

export default function GateScreen({ onAccessGranted }) {
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState('boot');
  const [bootLines, setBootLines] = useState([]);
  const [shakeInput, setShakeInput] = useState(false);
  const [deniedFlash, setDeniedFlash] = useState(false);
  const [grantedProgress, setGrantedProgress] = useState(0);
  const inputRef = useRef(null);

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
    if (sessionStorage.getItem('gate_cleared') === 'true') {
      onAccessGranted();
      return;
    }
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

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`gate-screen ${deniedFlash ? 'gate-denied-flash' : ''}`}>
      <div className="gate-scanlines" />
      <div className="gate-vignette" />
      <div className="gate-particles">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="gate-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>
      <div className="gate-header">
        <div className="gate-header-left">
          <span className="gate-status-dot" />
          <span>SECURE CHANNEL ACTIVE</span>
        </div>
        <div className="gate-header-right">
          <span>{currentDate || '00/00/0000'}</span>
          <span className="gate-divider">|</span>
          <span>{currentTime || '00:00:00'}</span>
        </div>
      </div>
      <div className="gate-container">
        <div className="gate-stamp">
          <div className="gate-stamp-border"><span>TOP SECRET</span></div>
        </div>
        <div className="gate-title-wrap">
          <h1 className="gate-title glitch" data-text="PROJECT ECLIPSE">PROJECT ECLIPSE</h1>
          <div className="gate-subtitle">DEPARTMENT OF DEFENSE • DIVISION ██ • CLEARANCE LEVEL OMEGA</div>
        </div>
        <div className="gate-line" />
        <div className="gate-boot-log">
          {bootLines.map((line, i) => (
            <div key={i} className="gate-boot-line">{line}</div>
          ))}
        </div>
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
              <button type="submit" className="gate-submit">AUTHENTICATE →</button>
            </div>
          </form>
        )}
        {phase === 'denied' && (
          <div className="gate-result gate-result-denied">
            <div className="gate-result-icon">✕</div>
            <div className="gate-result-text">ACCESS DENIED</div>
            <div className="gate-result-sub">INVALID CREDENTIALS — INCIDENT LOGGED</div>
          </div>
        )}
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
        <div className="gate-warning">
          ⚠ UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE UNDER USC §1030.
          ALL ACTIVITIES ARE MONITORED AND RECORDED.
        </div>
      </div>
      <div className="gate-corner gate-corner-tl" />
      <div className="gate-corner gate-corner-tr" />
      <div className="gate-corner gate-corner-bl" />
      <div className="gate-corner gate-corner-br" />
    </div>
  );
}
