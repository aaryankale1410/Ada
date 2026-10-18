'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InsightsModal({ open, onClose, data, loading, accent = 'teal' }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const accentColors = {
    teal: {
      gradient: 'linear-gradient(135deg, #7ec8b8, #7ab3e0)',
      glow: 'rgba(126, 200, 184, 0.25)',
      border: 'rgba(126, 200, 184, 0.25)',
      bg: 'rgba(126, 200, 184, 0.08)',
      text: '#7ec8b8',
      barFill: 'linear-gradient(90deg, #7ec8b8, #7ab3e0)',
    },
    lavender: {
      gradient: 'linear-gradient(135deg, #c3aed6, #e8587a)',
      glow: 'rgba(195, 174, 214, 0.25)',
      border: 'rgba(195, 174, 214, 0.25)',
      bg: 'rgba(195, 174, 214, 0.08)',
      text: '#c3aed6',
      barFill: 'linear-gradient(90deg, #c3aed6, #e8587a)',
    },
  };
  const colors = accentColors[accent];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const clean = dateStr.slice(0, 10);
    const [y, m, d] = clean.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatMonthLabel = (key) => {
    const [year, month] = key.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1);
    return d.toLocaleDateString('en-IN', { month: 'short' });
  };

  const groupByMonth = (dates) => {
    if (!dates) return [];
    const groups = {};
    dates.forEach((d) => {
      const key = d.substring(0, 7);
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return Object.entries(groups).map(([key, dates]) => {
      const [year, month] = key.split('-');
      const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      return { label, dates };
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="insights-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose}>
          <motion.div
            className="insights-modal"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.35, type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="insights-close" onClick={onClose} aria-label="Close">×</button>
            {loading || !data ? (
              <div className="insights-loading">
                <div className="loading-dots"><span /><span /><span /></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.85rem' }}>Crunching numbers...</p>
              </div>
            ) : (
              <>
                <div className="insights-hero">
                  <motion.div className="insights-hero-value" style={{ background: colors.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.1 }}>
                    {data.total_count}
                  </motion.div>
                  <div className="insights-hero-label">Total {data.label}</div>
                </div>
                <div className="insights-stat-grid">
                  {[
                    { val: data.this_month, label: 'This Month', delay: 0.15 },
                    { val: data.last_month, label: 'Last Month', delay: 0.2 },
                    { val: `${data.avg_gap_days}d`, label: 'Avg Gap', delay: 0.25 },
                    { val: `🔥 ${data.longest_streak}`, label: 'Best Streak', delay: 0.3 },
                  ].map(({ val, label, delay }) => (
                    <motion.div key={label} className="insights-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
                      <div className="insights-stat-value" style={{ color: colors.text }}>{val}</div>
                      <div className="insights-stat-label">{label}</div>
                    </motion.div>
                  ))}
                </div>
                <motion.div className="insights-fav-day" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                  <span className="insights-fav-day-label">Favorite Day</span>
                  <span className="insights-fav-day-pill" style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}>{data.favorite_day}</span>
                </motion.div>
                {data.monthly_breakdown && Object.keys(data.monthly_breakdown).length > 0 && (
                  <motion.div className="insights-chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <div className="insights-chart-title">Monthly Trend</div>
                    <div className="insights-bars">
                      {Object.entries(data.monthly_breakdown).map(([month, count]) => {
                        const maxCount = Math.max(...Object.values(data.monthly_breakdown), 1);
                        const heightPct = (count / maxCount) * 100;
                        return (
                          <div className="insights-bar-col" key={month}>
                            <div className="insights-bar-value">{count || ''}</div>
                            <div className="insights-bar-track">
                              <motion.div className="insights-bar-fill" style={{ background: colors.barFill }} initial={{ height: 0 }} animate={{ height: `${heightPct}%` }} transition={{ duration: 0.6, delay: 0.5 }} />
                            </div>
                            <div className="insights-bar-label">{formatMonthLabel(month)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
                {data.all_dates && data.all_dates.length > 0 && (
                  <motion.div className="insights-timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                    <div className="insights-chart-title">Timeline</div>
                    <div className="insights-timeline-scroll">
                      {groupByMonth(data.all_dates).map((group) => (
                        <div key={group.label} className="insights-timeline-group">
                          <div className="insights-timeline-month">{group.label}</div>
                          {group.dates.map((d) => (
                            <div key={d} className="insights-timeline-date" style={{ borderColor: colors.border }}>
                              <div className="insights-timeline-dot" style={{ background: colors.text }} />
                              {formatDate(d)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
