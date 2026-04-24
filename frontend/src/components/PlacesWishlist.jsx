import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlaces, addPlace, completePlace, deletePlace } from '../api';

export default function PlacesWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [placeInput, setPlaceInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('wishlist'); // 'wishlist' | 'history' | 'stats'
  const [showAddForm, setShowAddForm] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const applyData = (data) => {
    setWishlist(data.wishlist || []);
    setHistory(data.history || []);
    if (data.analytics) {
      data.analytics.total_pending = (data.wishlist || []).length;
    }
    setAnalytics(data.analytics || null);
  };

  const fetchData = useCallback(async () => {
    try {
      const data = await getPlaces();
      applyData(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!placeInput.trim()) return;
    setAdding(true);
    try {
      const data = await addPlace(placeInput.trim(), notesInput.trim());
      applyData(data);
      setPlaceInput('');
      setNotesInput('');
      setShowAddForm(false);
    } catch { /* ignore */ }
    setAdding(false);
  };

  const handleComplete = async (id) => {
    setProcessingId(id);
    try {
      const data = await completePlace(id);
      applyData(data);
    } catch { /* ignore */ }
    setProcessingId(null);
  };

  const handleDelete = async (id) => {
    setProcessingId(id);
    try {
      const data = await deletePlace(id);
      applyData(data);
    } catch { /* ignore */ }
    setProcessingId(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatMonthLabel = (key) => {
    const [year, month] = key.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1);
    return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
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
          <span className="emoji">📍</span> Places Wishlist
        </h2>

        {/* Tab Switcher */}
        <div className="places-tabs">
          <button
            className={`places-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            Wishlist{wishlist.length > 0 && <span className="places-tab-badge">{wishlist.length}</span>}
          </button>
          <button
            className={`places-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Visited{history.length > 0 && <span className="places-tab-badge">{history.length}</span>}
          </button>
          <button
            className={`places-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Stats
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="loading-dots"><span></span><span></span><span></span></div>
          </div>
        ) : (
          <>
            {/* ─── WISHLIST TAB ─── */}
            {activeTab === 'wishlist' && (
              <div className="places-panel">
                {/* Add Button / Form */}
                {!showAddForm ? (
                  <motion.button
                    className="places-add-trigger"
                    onClick={() => setShowAddForm(true)}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="places-add-icon">+</span>
                    <span>Add a place</span>
                  </motion.button>
                ) : (
                  <motion.div
                    className="places-add-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <input
                      className="input-field"
                      type="text"
                      placeholder="Place name…"
                      value={placeInput}
                      onChange={(e) => setPlaceInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      autoFocus
                    />
                    <input
                      className="input-field"
                      type="text"
                      placeholder="Notes (address, phone…)"
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      style={{ marginTop: '0.5rem' }}
                    />
                    <div className="places-add-actions">
                      <button className="btn btn-primary btn-sm" onClick={handleAdd} disabled={adding || !placeInput.trim()}>
                        {adding ? '...' : '✓ Add'}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setShowAddForm(false); setPlaceInput(''); setNotesInput(''); }}>
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Place List */}
                {wishlist.length === 0 ? (
                  <div className="places-empty">
                    <div className="places-empty-icon">🗺️</div>
                    <p>No places yet! Add your first destination.</p>
                  </div>
                ) : (
                  <div className="places-list">
                    <AnimatePresence>
                      {wishlist.map((item) => (
                        <motion.div
                          key={item.id}
                          className="places-row"
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="places-row-info">
                            <div className="places-row-name">{item.place}</div>
                            {item.notes && <div className="places-row-notes">{item.notes}</div>}
                          </div>
                          <div className="places-row-actions">
                            <button
                              className="places-btn-check"
                              onClick={() => handleComplete(item.id)}
                              disabled={processingId === item.id}
                              title="Mark visited"
                            >
                              ✓
                            </button>
                            <button
                              className="places-btn-delete"
                              onClick={() => handleDelete(item.id)}
                              disabled={processingId === item.id}
                              title="Delete"
                            >
                              ×
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* ─── HISTORY TAB ─── */}
            {activeTab === 'history' && (
              <div className="places-panel">
                {history.length === 0 ? (
                  <div className="places-empty">
                    <div className="places-empty-icon">🏁</div>
                    <p>No places visited yet. Start exploring!</p>
                  </div>
                ) : (
                  <div className="places-list">
                    {history.map((item, i) => (
                      <motion.div
                        key={item.id}
                        className="places-row places-row-completed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="places-row-info">
                          <div className="places-row-name">{item.place}</div>
                          {item.notes && <div className="places-row-notes">{item.notes}</div>}
                        </div>
                        <div className="places-row-date">
                          {formatDate(item.completed_at)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── STATS TAB ─── */}
            {activeTab === 'stats' && analytics && (
              <motion.div
                className="places-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="places-stats-grid">
                  <div className="places-stat-card">
                    <div className="places-stat-value" style={{ color: 'var(--mint)' }}>{analytics.total_visited}</div>
                    <div className="places-stat-label">Visited</div>
                  </div>
                  <div className="places-stat-card">
                    <div className="places-stat-value" style={{ color: 'var(--gold)' }}>{analytics.total_pending}</div>
                    <div className="places-stat-label">Pending</div>
                  </div>
                  <div className="places-stat-card">
                    <div className="places-stat-value" style={{ color: 'var(--sky)' }}>{analytics.this_month}</div>
                    <div className="places-stat-label">This Month</div>
                  </div>
                  <div className="places-stat-card">
                    <div className="places-stat-value" style={{ color: 'var(--lavender)' }}>
                      {analytics.total_visited + analytics.total_pending}
                    </div>
                    <div className="places-stat-label">All Time</div>
                  </div>
                </div>

                {/* Monthly Breakdown Bar Chart */}
                {analytics.monthly_breakdown && Object.keys(analytics.monthly_breakdown).length > 0 && (
                  <div className="places-chart">
                    <div className="places-chart-title">Monthly Visits</div>
                    <div className="insights-bars">
                      {Object.entries(analytics.monthly_breakdown).map(([month, count]) => {
                        const maxCount = Math.max(...Object.values(analytics.monthly_breakdown), 1);
                        const heightPct = (count / maxCount) * 100;
                        return (
                          <div className="insights-bar-col" key={month}>
                            <div className="insights-bar-value">{count || ''}</div>
                            <div className="insights-bar-track">
                              <motion.div
                                className="insights-bar-fill"
                                style={{ background: 'linear-gradient(180deg, var(--mint), var(--sky))' }}
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPct}%` }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                              />
                            </div>
                            <div className="insights-bar-label">{formatMonthLabel(month)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {analytics.total_visited === 0 && Object.keys(analytics.monthly_breakdown || {}).length === 0 && (
                  <div className="places-empty" style={{ marginTop: '1rem' }}>
                    <div className="places-empty-icon">📊</div>
                    <p>Visit some places to see your stats!</p>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
