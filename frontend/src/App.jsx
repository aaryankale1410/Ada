import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GateScreen from './components/GateScreen';
import Carousel from './components/Carousel';
import TimeCounter from './components/TimeCounter';
import OpenWhen from './components/OpenWhen';
import PeriodTracker from './components/PeriodTracker';
import LastMet from './components/LastMet';
import LastSpecial from './components/LastSpecial';
import FoodSuggester from './components/FoodSuggester';
import PlacesWishlist from './components/PlacesWishlist';

export default function App() {
  const [accessGranted, setAccessGranted] = useState(false);

  if (!accessGranted) {
    return <GateScreen onAccessGranted={() => setAccessGranted(true)} />;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="app"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Hero — Carousel */}
        <motion.div
          className="section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Carousel />
        </motion.div>

        <div className="section-divider" />

        {/* Time Counter */}
        <TimeCounter />

        <div className="section-divider" />

        {/* Open When */}
        <OpenWhen />

        <div className="section-divider" />

        {/* Period Tracker */}
        <PeriodTracker />

        <div className="section-divider" />

        {/* Last Met */}
        <LastMet />

        <div className="section-divider" />

        {/* Last Special Night */}
        <LastSpecial />

        <div className="section-divider" />

        {/* Places Wishlist */}
        <PlacesWishlist />

        <div className="section-divider" />

        {/* Food Suggester */}
        <FoodSuggester />

        {/* Footer */}
        <footer className="footer">
          <div className="footer-heart">💕</div>
          <div className="footer-text">Made with love, for us</div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
