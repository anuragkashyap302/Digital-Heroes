import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-xl gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-2xl gap-2",
    lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5 shadow-soft",
    xl: "px-9 py-4 text-lg rounded-3xl gap-3 shadow-soft-lg"
  };

  const variantStyles = {
    primary: "bg-pine text-canvas hover:bg-pine-dark focus:ring-pine/50 shadow-soft hover:shadow-pine-glow",
    pineDark: "bg-ink text-canvas hover:bg-ink-soft focus:ring-ink/50 shadow-soft",
    gold: "bg-gold text-ink font-semibold hover:bg-gold-light focus:ring-gold/50 shadow-soft hover:shadow-gold-glow",
    secondary: "bg-sage-light/70 text-ink hover:bg-sage-light focus:ring-sage/40 border border-sage/30",
    outline: "bg-transparent text-ink border border-ink/20 hover:border-ink hover:bg-ink/5 focus:ring-ink/30",
    outlineWhite: "bg-transparent text-canvas border border-canvas/40 hover:border-canvas hover:bg-canvas/10 focus:ring-canvas/30",
    ghost: "bg-transparent text-ink-muted hover:text-ink hover:bg-ink/5",
    danger: "bg-rose-700 text-white hover:bg-rose-800 focus:ring-rose-500/50"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
