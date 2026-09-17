import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Target, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-canvas border border-sage/40 text-pine flex items-center justify-center mx-auto shadow-soft">
        <Target className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-pine block">
        Error 404 • Out of Bounds
      </span>

      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink">
        Page Not Found
      </h1>

      <p className="text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
        The fairway ends here. The page you are looking for has moved or does not exist on Digital Heroes.
      </p>

      <div className="pt-4 flex items-center justify-center gap-4">
        <Link to="/">
          <Button variant="primary" size="md" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Clubhouse (Home)</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};
