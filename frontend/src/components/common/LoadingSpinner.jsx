import React from 'react';

export const LoadingSpinner = ({
  message = 'Loading data...',
  fullScreen = false,
  size = 'md'
}) => {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-4 text-center">
      <div className={`relative ${sizeMap[size]} border-sage/30 border-t-pine rounded-full animate-spin`} />
      {message && (
        <p className="text-sm font-medium text-ink-muted animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};
