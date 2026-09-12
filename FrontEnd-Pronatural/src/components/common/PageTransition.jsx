import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Transición Cinemática Real con Framer Motion
 * Utiliza AnimatePresence mode="wait" para garantizar:
 * 1. La página saliente se desvanece y asciende (Exit).
 * 2. La nueva página entra desde 45px abajo y se enfoca desde blur(8px) (Enter).
 */
export default function PageTransition({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 45, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -25, filter: 'blur(6px)' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
