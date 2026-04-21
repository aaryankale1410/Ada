import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getLastMet, updateLastMet, getMetInsights } from '../api';
import InsightsModal from './InsightsModal';

export default function LastMet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getLastMet();
      setData(res);
    } catch {
      setData(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleWeMetToday = async () => {
    setUpdating(true);
    try {
      const res = await updateLastMet();
      setData(res);
    } catch { /* ignore */ }
    setUpdating(false);
  };

  const handleOpenInsights = async () => {
    setInsightsOpen(true);
    setInsightsLoading(true);
    try {
      const res = await getMetInsights();
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
      <div className="card">
        <h2 className="section-title">
          <span className="emoji">📅</span> Last Time We Met
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
                background: data.days_since > 7 
                  ? 'linear-gradient(135deg, #ef6461, #e8587a)' 
                  : 'linear-gradient(135deg, #7ec8b8, #7ab3e0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {data.days_since}
            </motion.div>
            <span className="counter-label">days ago</span>
          </div>
        </div>

        <div className="date-display">
          <div className="date-label">Last Met On</div>
          <div className="date-value">{formatDate(data.last_met)}</div>
        </div>

        {/* Buttons */}
        <div className="text-center mt-md" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <button
            className="btn btn-primary"
            onClick={handleWeMetToday}
            disabled={updating}
          >
            {updating ? (
              <div className="loading-dots"><span></span><span></span><span></span></div>
            ) : (
              '🎉  We Met Today!'
            )}
          </button>
          <button className="btn-insights" onClick={handleOpenInsights}>
            📊 Insights
          </button>
        </div>

        {/* LLM Comment */}
        {data.llm_comment && (
          <div className="llm-bubble">
            <div className="llm-label">🎬 Bollywood Narrator Says</div>
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
        accent="teal"
      />
    </motion.div>
  );
}
