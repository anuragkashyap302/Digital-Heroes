import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  variant = 'default',
  onClick,
  ...props
}) => {
  const variantStyles = {
    default: "bg-white/80 backdrop-blur-md border border-sage/30 shadow-soft",
    flat: "bg-white border border-sage/20",
    ivory: "bg-[#ECE8DD] border border-sage/40 shadow-soft",
    dark: "bg-ink text-canvas border border-pine/30 shadow-soft-lg",
    glass: "glass-panel shadow-soft-lg",
    goldBorder: "bg-white/90 border-2 border-gold/40 shadow-gold-glow"
  };

  const Component = hoverEffect ? motion.div : 'div';
  const hoverProps = hoverEffect
    ? {
        whileHover: { y: -4, transition: { duration: 0.2 } },
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 }
      }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`rounded-3xl p-6 sm:p-8 transition-all ${variantStyles[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
};
