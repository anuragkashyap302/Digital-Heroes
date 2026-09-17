import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs font-semibold rounded-full",
    md: "px-3 py-1 text-xs font-medium rounded-full",
    lg: "px-4 py-1.5 text-sm font-medium rounded-full"
  };

  const variantStyles = {
    default: "bg-sage-light text-ink border border-sage/40",
    pine: "bg-pine/10 text-pine-dark border border-pine/30",
    gold: "bg-gold/15 text-gold-dark border border-gold/40 font-semibold",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    warning: "bg-amber-100 text-amber-900 border border-amber-300",
    danger: "bg-rose-100 text-rose-800 border border-rose-300",
    dark: "bg-ink text-canvas border border-ink/80",
    tier5: "bg-gradient-to-r from-amber-500/20 to-gold/30 text-amber-900 border border-gold/60 font-bold",
    tier4: "bg-pine/15 text-pine-dark border border-pine/40 font-semibold",
    tier3: "bg-sage/20 text-ink-soft border border-sage/50"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
