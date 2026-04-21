import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getFoodSuggestion, getFoodHistory, addFood } from '../api';

export default function FoodSuggester() {
  const [suggestion, setSuggestion] = useState('');
  const [history, setHistory] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await getFoodHistory();
      setHistory(res.history || []);
    } catch { /* ignore */ }
    setLoadingHistory(false);
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleSuggest = async () => {
    setLoadingSuggest(true);
    try {
      const res = await getFoodSuggestion();
      setSuggestion(res.suggestion);
    } catch {
      setSuggestion('Aaj pani puri khao aur duniya bhool jao! 🤤');
    }
    setLoadingSuggest(false);
  };

  const handleAddFood = async () => {
    if (!inputVal.trim()) return;
    setLoadingAdd(true);
    const items = inputVal.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      const res = await addFood(items);
      setHistory(res.history || []);
      setInputVal('');
    } catch { /* ignore */ }
    setLoadingAdd(false);
  };

  // Get unique food items from recent history for chips
  const recentFoods = [...new Set(history.slice(-10).flat())];

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
          <span className="emoji">🍕</span> What Should We Eat?
        </h2>

        {/* Suggest Button */}
        <div className="text-center">
          <button
            className="btn btn-primary"
            onClick={handleSuggest}
            disabled={loadingSuggest}
            style={{
              background: 'linear-gradient(135deg, #e8a87c, #ef6461)',
              boxShadow: '0 4px 20px rgba(232, 168, 124, 0.3)',
            }}
          >
            {loadingSuggest ? (
              <div className="loading-dots"><span></span><span></span><span></span></div>
            ) : (
              '🎲  Decide For Us!'
            )}
          </button>
        </div>

        {/* Suggestion */}
        {suggestion && (
          <motion.div
            className="llm-bubble mt-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(232, 168, 124, 0.1), rgba(126, 200, 184, 0.08))',
              borderColor: 'rgba(232, 168, 124, 0.2)',
            }}
          >
            <div className="llm-label" style={{ color: 'var(--gold)' }}>🍽️ Today's Menu</div>
            <div className="food-suggestion">{suggestion}</div>
          </motion.div>
        )}

        {/* Add Food Input */}
        <div className="mt-lg">
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
            What did you eat today?
          </label>
          <div className="food-input-row">
            <input
              className="input-field"
              type="text"
              placeholder="e.g. pani puri, momos"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFood()}
            />
            <button
              className="btn btn-secondary"
              onClick={handleAddFood}
              disabled={loadingAdd || !inputVal.trim()}
            >
              {loadingAdd ? '...' : '+ Add'}
            </button>
          </div>
        </div>

        {/* Food History Chips */}
        {recentFoods.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-lg)', marginBottom: 'var(--space-xs)' }}>
              Recent eats
            </div>
            <div className="chip-container">
              {recentFoods.map((food, i) => (
                <motion.span
                  key={food + i}
                  className="chip"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {food}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
