import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getLastSpecial, updateLastSpecial, getSpecialInsights } from '../api';
import InsightsModal from './InsightsModal';

export default function LastSpecial() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getLastSpecial();
      setData(res);
    } catch {
      setData(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const res = await updateLastSpecial();
      setData(res);
    } catch { /* ignore */ }
    setUpdating(false);
  };

  const handleOpenInsights = async () => {
    setInsightsOpen(true);
    setInsightsLoading(true);
    try {
      const res = await getSpecialInsights();
      setInsights(res);
    } catch {
      setInsights(null);
    }
    setInsightsLoading(false);
  };

  if (loading) {
    return (
      <div className="section">
        <div className="card">
          <div className="skeleton" style={{ width: '60%', height: '1.5rem', marginBottom: '1rem' }}></div>
          <div className="skeleton" style={{ width: '100%', height: '120px' }}></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

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
      <div className="card" style={{ 
        background: 'linear-gradient(145deg, rgba(75, 25, 66, 0.3), rgba(20, 17, 35, 0.7))',
      }}>
        <h2 className="section-title">
          <span className="emoji">🌙</span> Last Special Night
        </h2>

        {/* Counter */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: 'var(--space-lg) 0' }}>
          <div className="counter-unit">
            <motion.div
              className="counter-value large"
              key={data.days_since}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
              style={{
                background: 'linear-gradient(135deg, #c3aed6, #e8587a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {data.days_since}
            </motion.div>
            <span className="counter-label">nights ago</span>
          </div>
        </div>

        <div className="date-display">
          <div className="date-label">Last Time</div>
          <div className="date-value">{formatDate(data.last_special)}</div>
        </div>

        {/* Buttons */}
        <div className="text-center mt-md" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <button
            className="btn btn-primary"
            onClick={handleUpdate}
            disabled={updating}
            style={{
              background: 'linear-gradient(135deg, #c3aed6, #7a5ba0)',
              boxShadow: '0 4px 20px rgba(195, 174, 214, 0.3)',
            }}
          >
            {updating ? (
              <div className="loading-dots"><span></span><span></span><span></span></div>
            ) : (
              '✨  Tonight Was Special'
            )}
          </button>
          <button className="btn-insights" onClick={handleOpenInsights}>
            📊 Insights
          </button>
        </div>

        {/* LLM Comment */}
        {data.llm_comment && (
          <div className="llm-bubble" style={{
            background: 'linear-gradient(135deg, rgba(195, 174, 214, 0.1), rgba(122, 91, 160, 0.08))',
            borderColor: 'rgba(195, 174, 214, 0.2)',
          }}>
            <div className="llm-label" style={{ color: 'var(--lavender-light)' }}>😏</div>
            {data.llm_comment}
          </div>
        )}
      </div>

      {/* Insights Modal */}
      <InsightsModal
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        data={insights}
        loading={insightsLoading}
        accent="lavender"
      />
    </motion.div>
  );
}
