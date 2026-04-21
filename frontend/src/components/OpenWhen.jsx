import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getOpenWhen } from '../api';

const CARDS = [
  {
    id: 'sad',
    emoji: '😢',
    title: 'When You\'re Sad',
    subtitle: 'Tap to feel a warm hug',
    className: 'sad',
  },
  {
    id: 'miss-me',
    emoji: '💭',
    title: 'When You Miss Me',
    subtitle: 'I\'m always with you',
    className: 'miss',
  },
  {
    id: 'cant-sleep',
    emoji: '🌙',
    title: 'When You Can\'t Sleep',
    subtitle: 'Let me tuck you in',
    className: 'sleep',
  },
];

function EnvelopeCard({ card }) {
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = useCallback(async () => {
    if (opened) {
      setOpened(false);
      // Reset message so next open gets fresh content
      setTimeout(() => setMessage(''), 500);
      return;
    }

    setOpened(true);
    setLoading(true);
    try {
      const data = await getOpenWhen(card.id);
      setMessage(data.message);
    } catch {
      setMessage('Tum mere liye duniya ki sabse khaas ho ❤️');
    }
    setLoading(false);
  }, [opened, card.id]);

  return (
    <div
      className={`envelope ${card.className} ${opened ? 'opened' : ''}`}
      onClick={handleToggle}
    >
      <div className="envelope-cover">
        <div className="envelope-icon">{card.emoji}</div>
        <div className="envelope-text">
          <h3>{card.title}</h3>
          <p>{card.subtitle}</p>
        </div>
        <span className="envelope-arrow">›</span>
      </div>
      <div className="envelope-content">
        {loading ? (
          <div className="text-center">
            <div className="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        ) : (
          <motion.div
            className="envelope-message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function OpenWhen() {
  return (
    <motion.div
      className="section"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="section-title">
        <span className="emoji">💌</span> Open When...
      </h2>
      <div className="open-when-grid">
        {CARDS.map((card) => (
          <EnvelopeCard key={card.id} card={card} />
        ))}
      </div>
    </motion.div>
  );
}
