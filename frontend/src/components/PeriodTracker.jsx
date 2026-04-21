import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getPeriod, updatePeriod } from '../api';

export default function PeriodTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getPeriod();
      setData(res);
    } catch {
      setData(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGotItToday = async () => {
    setUpdating(true);
    try {
      const res = await updatePeriod();
      setData(res);
    } catch { /* ignore */ }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="section">
        <div className="card">
          <div className="skeleton" style={{ width: '60%', height: '1.5rem', marginBottom: '1rem' }}></div>
          <div className="skeleton" style={{ width: '100%', height: '180px' }}></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const circumference = 2 * Math.PI * 78;
  const daysPassed = data.days_since;
  const cycleLength = data.cycle_length;
  const progress = Math.min(daysPassed / cycleLength, 1);
  const dashOffset = circumference - (progress * circumference);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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
          <span className="emoji">🩸</span> Period Tracker
        </h2>

        {/* Circular Progress */}
        <div className="circular-progress">
          <svg viewBox="0 0 180 180">
            <defs>
              <linearGradient id="periodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e8587a" />
                <stop offset="100%" stopColor="#ef6461" />
              </linearGradient>
            </defs>
            <circle className="progress-bg" cx="90" cy="90" r="78" />
            <circle
              className="progress-fill"
              cx="90"
              cy="90"
              r="78"
              stroke="url(#periodGradient)"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="progress-center">
            <div className="progress-value" style={{ color: 'var(--rose)' }}>
              {data.days_until > 0 ? data.days_until : '🔴'}
            </div>
            <div className="progress-label-small">
              {data.days_until > 0 ? 'days until next' : 'due now'}
            </div>
          </div>
        </div>

        {/* Date Info */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 'var(--space-lg)' }}>
          <div className="date-display">
            <div className="date-label">Last Period</div>
            <div className="date-value">{formatDate(data.last_period)}</div>
          </div>
          <div className="date-display">
            <div className="date-label">Next Expected</div>
            <div className="date-value">{formatDate(data.next_period)}</div>
          </div>
        </div>

        {/* Got It Today Button */}
        <div className="text-center mt-lg">
          <button
            className="btn btn-primary"
            onClick={handleGotItToday}
            disabled={updating}
          >
            {updating ? (
              <div className="loading-dots"><span></span><span></span><span></span></div>
            ) : (
              '🔴  Got It Today'
            )}
          </button>
        </div>

        {/* LLM Responses */}
        {data.llm && (
          <>
            <div className="llm-bubble for-her">
              <div className="llm-label">For Akshada 💕</div>
              {data.llm.for_her}
            </div>
            <div className="llm-bubble for-him">
              <div className="llm-label">For Aaryan 🛡️</div>
              {data.llm.for_him}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
