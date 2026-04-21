import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// April 26, 2024, 9:00 PM IST (UTC+5:30)
const START_DATE = new Date('2024-04-26T21:00:00+05:30').getTime();

function calcTime() {
  const now = Date.now();
  let diff = Math.floor((now - START_DATE) / 1000);

  const years = Math.floor(diff / (365.25 * 24 * 3600));
  diff -= Math.floor(years * 365.25 * 24 * 3600);

  const months = Math.floor(diff / (30.44 * 24 * 3600));
  diff -= Math.floor(months * 30.44 * 24 * 3600);

  const days = Math.floor(diff / (24 * 3600));
  diff -= days * 24 * 3600;

  const hours = Math.floor(diff / 3600);
  diff -= hours * 3600;

  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;

  const totalDays = Math.floor((now - START_DATE) / (1000 * 60 * 60 * 24));

  return { years, months, days, hours, minutes, seconds, totalDays };
}

function AnimatedDigit({ value, label }) {
  return (
    <div className="counter-unit">
      <motion.div
        key={value}
        className="counter-value"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <span className="counter-label">{label}</span>
    </div>
  );
}

export default function TimeCounter() {
  const [time, setTime] = useState(calcTime());

  useEffect(() => {
    const interval = setInterval(() => setTime(calcTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate ring progress (seconds into current minute / 60)
  const circumference = 2 * Math.PI * 108;
  const progress = (time.seconds / 60) * circumference;

  return (
    <motion.div
      className="section"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="card">
        <h2 className="section-title">
          <span className="emoji">⏱️</span> Together Since
        </h2>

        {/* Circular ring with total days */}
        <div className="time-counter-ring">
          <svg viewBox="0 0 240 240">
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e8587a" />
                <stop offset="50%" stopColor="#ef6461" />
                <stop offset="100%" stopColor="#e8a87c" />
              </linearGradient>
            </defs>
            <circle className="ring-bg" cx="120" cy="120" r="108" />
            <circle
              className="ring-progress"
              cx="120"
              cy="120"
              r="108"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
            />
          </svg>
          <div className="time-counter-center">
            <motion.div
              className="days-count"
              key={time.totalDays}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {time.totalDays}
            </motion.div>
            <div className="days-label">days</div>
          </div>
        </div>

        {/* Detailed counters */}
        <div className="counter-grid full">
          <AnimatedDigit value={time.years} label="YRS" />
          <AnimatedDigit value={time.months} label="MOS" />
          <AnimatedDigit value={time.days} label="DAYS" />
          <AnimatedDigit value={time.hours} label="HRS" />
          <AnimatedDigit value={time.minutes} label="MIN" />
          <AnimatedDigit value={time.seconds} label="SEC" />
        </div>

        <div className="time-counter-since">
          Since April 26, 2024 — 9:00 PM 💕
        </div>
      </div>
    </motion.div>
  );
}
