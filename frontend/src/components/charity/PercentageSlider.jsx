import React, { useState } from 'react';
import { Heart, Sparkles, Check, Info } from 'lucide-react';
import { Button } from '../common/Button';

export const PercentageSlider = ({
  currentPercentage = 10.0,
  monthlyFee = 29.00,
  onSave,
  loading = false
}) => {
  const [percentage, setPercentage] = useState(currentPercentage);
  const minAllowed = 10.0;
  const maxAllowed = 100.0;

  const monthlyDonation = (monthlyFee * (percentage / 100)).toFixed(2);
  const isModified = Math.abs(percentage - currentPercentage) > 0.01;

  const presets = [10, 15, 25, 50, 100];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage/30 shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-sage-light">
        <div>
          <h4 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-100" />
            <span>Charity Contribution Allocation</span>
          </h4>
          <p className="text-xs text-ink-muted mt-1">
            Minimum 10% of your membership fee is automatically dedicated to your selected charity. You may voluntarily increase this at any time.
          </p>
        </div>

        <div className="text-right sm:text-right bg-canvas/80 px-4 py-2 rounded-2xl border border-sage/30 self-start sm:self-auto">
          <span className="text-[10px] uppercase font-bold text-pine block">Monthly Impact</span>
          <span className="font-serif text-2xl font-bold text-ink">£{monthlyDonation}</span>
          <span className="text-[10px] text-ink-muted block">({percentage}% of £{monthlyFee.toFixed(2)})</span>
        </div>
      </div>

      {/* Slider Control */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between text-xs font-semibold text-ink">
          <span>Minimum Required (10%)</span>
          <span className="font-serif text-xl text-pine font-bold">{percentage}%</span>
          <span>Full Philanthropy (100%)</span>
        </div>

        <input
          type="range"
          min={minAllowed}
          max={maxAllowed}
          step="1"
          value={percentage}
          onChange={(e) => setPercentage(parseFloat(e.target.value))}
          className="w-full h-3 bg-sage-light rounded-lg appearance-none cursor-pointer accent-pine"
        />

        {/* Preset Quick Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-xs text-ink-muted mr-2">Quick Presets:</span>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPercentage(p)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                percentage === p
                  ? 'bg-pine text-canvas font-bold shadow-soft'
                  : 'bg-canvas text-ink hover:bg-sage-light border border-sage/30'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      {/* Save Action */}
      <div className="pt-4 border-t border-sage-light flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Info className="w-4 h-4 text-pine shrink-0" />
          <span>Updates take effect immediately on your active subscription.</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={!isModified || loading}
          loading={loading}
          onClick={() => onSave?.(percentage)}
          className="gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Save Allocation</span>
        </Button>
      </div>
    </div>
  );
};
