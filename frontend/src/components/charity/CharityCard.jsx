import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Heart, Calendar, ArrowRight, Check } from 'lucide-react';

export const CharityCard = ({
  charity,
  isSelected = false,
  onSelect,
  onDonateDirect
}) => {
  const eventsCount = Array.isArray(charity.upcoming_events) ? charity.upcoming_events.length : 0;

  return (
    <div className={`rounded-3xl overflow-hidden bg-white border transition-all duration-300 flex flex-col justify-between shadow-soft hover:shadow-soft-lg group ${
      isSelected ? 'ring-2 ring-pine border-pine bg-pine/5' : 'border-sage/30'
    }`}>
      <div>
        {/* Banner with Logo Overlay */}
        <div className="relative h-44 w-full bg-sage-light overflow-hidden">
          <img
            src={charity.banner_url || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80'}
            alt={charity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />

          {/* Featured Badge */}
          {charity.is_featured && (
            <div className="absolute top-3 right-3">
              <Badge variant="gold" size="sm">
                Featured Cause
              </Badge>
            </div>
          )}

          {/* Logo */}
          <div className="absolute -bottom-5 left-6 w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-soft bg-white">
            <img
              src={charity.logo_url || 'https://images.unsplash.com/photo-1593111774642-a164b58e7784?auto=format&fit=crop&w=200&q=80'}
              alt={charity.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content Details */}
        <div className="pt-8 px-6 pb-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-pine uppercase tracking-wider">
              {charity.category}
            </span>
            {eventsCount > 0 && (
              <span className="text-[11px] font-medium text-ink-muted flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gold-dark" />
                <span>{eventsCount} Event{eventsCount > 1 ? 's' : ''}</span>
              </span>
            )}
          </div>

          <Link to={`/charities/${charity.slug}`}>
            <h4 className="font-serif text-xl font-bold text-ink hover:text-pine transition-colors leading-snug">
              {charity.name}
            </h4>
          </Link>

          <p className="text-xs text-ink-muted mt-2 line-clamp-2 leading-relaxed">
            {charity.tagline || charity.description}
          </p>

          {/* Total Raised Stat */}
          <div className="mt-4 pt-3 border-t border-sage-light flex items-center justify-between">
            <span className="text-xs text-ink-muted">Total Impact Generated:</span>
            <span className="font-serif text-base font-bold text-ink">
              £{parseFloat(charity.total_raised || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 pb-6 pt-2 border-t border-sage-light flex items-center gap-2">
        {onSelect && (
          <Button
            variant={isSelected ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onSelect(charity)}
            className="flex-1 justify-center text-xs gap-1.5"
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5 text-pine" />
                <span>Selected Cause</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5" />
                <span>Select for Draw</span>
              </>
            )}
          </Button>
        )}

        {onDonateDirect ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDonateDirect(charity)}
            className="text-xs px-3"
            title="Make a direct independent donation"
          >
            Direct Give
          </Button>
        ) : (
          <Link to={`/charities/${charity.slug}`}>
            <Button variant="ghost" size="sm" className="p-2 text-ink-muted hover:text-pine">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
