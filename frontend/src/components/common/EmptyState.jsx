import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'There is currently no data to display.',
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-10 sm:p-14 text-center rounded-3xl bg-white/60 border border-dashed border-sage/40 ${className}`}>
      {Icon && (
        <div className="w-16 h-16 mb-4 rounded-2xl bg-canvas flex items-center justify-center text-pine">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h4 className="font-serif text-xl sm:text-2xl font-bold text-ink mb-2">
        {title}
      </h4>
      <p className="text-sm text-ink-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
