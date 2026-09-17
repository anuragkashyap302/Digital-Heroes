import React from 'react';
import { motion } from 'framer-motion';

export const DrawBall = ({
  number,
  matched = false,
  size = 'md',
  animated = false,
  delay = 0
}) => {
  const sizeStyles = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg sm:text-xl font-bold',
    xl: 'w-20 h-20 text-2xl font-bold'
  };

  const matchedStyles = matched
    ? 'bg-gradient-to-br from-amber-400 via-gold to-amber-600 text-ink shadow-gold-glow border-2 border-amber-200'
    : 'bg-gradient-to-br from-pine-dark to-ink text-canvas border border-pine/40 shadow-soft';

  const animationProps = animated
    ? {
        initial: { scale: 0, rotate: -30, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        transition: { type: 'spring', damping: 12, stiffness: 200, delay }
      }
    : {};

  return (
    <motion.div
      {...animationProps}
      className={`relative inline-flex items-center justify-center rounded-full font-serif font-bold tracking-tight select-none shadow-md ${sizeStyles[size]} ${matchedStyles}`}
    >
      {/* Gloss reflection highlight */}
      <div className="absolute top-1.5 left-2 w-1/3 h-1/3 rounded-full bg-white/25 blur-[0.5px]" />
      <span className="relative z-10">{number}</span>
    </motion.div>
  );
};
