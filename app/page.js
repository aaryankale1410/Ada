'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GateScreen from '@/components/GateScreen';
import Carousel from '@/components/Carousel';
import TimeCounter from '@/components/TimeCounter';
import OpenWhen from '@/components/OpenWhen';
import PeriodTracker from '@/components/PeriodTracker';
import LastMet from '@/components/LastMet';
import LastSpecial from '@/components/LastSpecial';
import PlacesWishlist from '@/components/PlacesWishlist';

export default function HomePage() {
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
        <TimeCounter />
        <div className="section-divider" />
        <OpenWhen />
        <div className="section-divider" />
        <PeriodTracker />
        <div className="section-divider" />
        <LastMet />
        <div className="section-divider" />
        <LastSpecial />
        <div className="section-divider" />
        <PlacesWishlist />

        <footer className="footer">
          <div className="footer-heart">💕</div>
          <div className="footer-text">Made with love, for us</div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
