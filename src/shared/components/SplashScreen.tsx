'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Split the path into 3 sections.
  // We use extreme coordinates to simulate coming from the absolute edges of the screen.
  // Lasers travel to the new start/end points of the horizontal wings
  const leftLine = "M -1000 50 L 60 50";
  const rightLine = "M 1200 50 L 160 50"; // Drawn right-to-left
  // Pulse now includes a short horizontal line at the start and end
  const centerPulse = "M 60 50 L 85 50 L 100 20 L 115 80 L 135 50 L 160 50";

  useEffect(() => {
    // Extended hide sequence to accommodate the two-stage animation
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 600); // Wait for fade out to unmount
    }, 2800);

    return () => clearTimeout(hideTimer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0E14] overflow-hidden"
        >
          <div className="flex flex-col items-center">
            {/* Minimalist SVG Pulse Canvas */}
            <svg
              viewBox="0 0 200 100"
              className="w-40 sm:w-48 h-auto overflow-visible relative"
            >
              {/* Left Laser approaching from outside */}
              <motion.path
                d={leftLine}
                fill="none"
                stroke="#6366f1"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.6))',
                }}
                // pathLength 0.15 makes it a short segment.
                // pathOffset starts negative so it flies into view.
                initial={{ pathLength: 0.10, pathOffset: -0.1 }}
                animate={{ pathOffset: 1 }}
                transition={{ 
                  duration: 0.8, 
                  ease: "linear" // Linear speed looks more like a shooting laser
                }}
              />

              {/* Right Laser approaching from outside */}
              <motion.path
                d={rightLine}
                fill="none"
                stroke="#6366f1"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.6))',
                }}
                initial={{ pathLength: 0.10, pathOffset: -0.1 }}
                animate={{ pathOffset: 1 }}
                transition={{ 
                  duration: 0.8, 
                  ease: "linear"
                }}
              />

              {/* Center Pulse drawn only after the lasers hit the center */}
              <motion.path
                d={centerPulse}
                fill="none"
                stroke="#6366f1"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: 'drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.6))',
                }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ 
                  // Starts exactly at 0.75s right as the lasers' heads reach the center
                  pathLength: { delay: 0.75, duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] },
                  opacity: { delay: 0.75, duration: 0.1 }
                }}
              />
            </svg>
            
            {/* Text appears after the whole drawing is finished */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="mt-6 flex flex-col items-center"
            >
              <h1 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
                ApexMarket
              </h1>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
