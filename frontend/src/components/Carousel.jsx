import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDE_GRADIENTS = [
  'linear-gradient(135deg, #e8587a, #d4728f, #1a1040)',
  'linear-gradient(135deg, #2d1b69, #e8587a, #ef6461)',
  'linear-gradient(135deg, #e8a87c, #d4728f, #4a1942)',
  'linear-gradient(135deg, #7ab3e0, #c3aed6, #e8587a)',
  'linear-gradient(135deg, #1a1040, #7ec8b8, #e8a87c)',
  'linear-gradient(135deg, #ef6461, #e8a87c, #c3aed6)',
  'linear-gradient(135deg, #4a1942, #e8587a, #7ab3e0)',
  'linear-gradient(135deg, #c3aed6, #2d1b69, #e8587a)',
  'linear-gradient(135deg, #7ec8b8, #e8a87c, #d4728f)',
  'linear-gradient(135deg, #e8587a, #4a1942, #7ab3e0)',
];

const SLIDE_ICONS = ['💕', '✨', '🌸', '💫', '🦋', '🌙', '💗', '🔥', '🌺', '💖'];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % 10);
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (idx) => {
    setCurrent(idx);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % 10);
    }, 3000);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo((current + 1) % 10);
      else goTo((current - 1 + 10) % 10);
    }
  };

  return (
    <div 
      className="carousel" 
      onTouchStart={handleTouchStart} 
      onTouchEnd={handleTouchEnd}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`carousel-slide ${i === current ? 'active' : ''}`}
        >
          <img
            className="slide-bg"
            src={`/images/${i + 1}.jpeg`}
            alt={`Memory ${i + 1}`}
          />
        </div>
      ))}

      <div className="carousel-overlay">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="carousel-names">
            Aaryan <span className="ampersand">&</span> Akshada
          </div>
          <div className="carousel-subtitle">Our Story</div>
        </motion.div>
      </div>

      <div className="carousel-dots">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
