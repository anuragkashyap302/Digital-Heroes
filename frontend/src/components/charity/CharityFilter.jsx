import React from 'react';
import { Search, Sparkles } from 'lucide-react';

export const CharityFilter = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  featuredOnly,
  onFeaturedToggle
}) => {
  const categories = [
    'All',
    'Youth & Education',
    'Environmental Protection',
    'Veterans & Mental Health',
    'Medical & Health Research'
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-sage/30 shadow-soft mb-8 space-y-5">
      {/* Search & Featured Toggle Row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search causes by name, keywords, or focus..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-canvas border border-sage/40 text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white transition-all"
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-ink bg-canvas px-4 py-3 rounded-2xl border border-sage/30 hover:bg-sage-light transition-colors self-start sm:self-auto">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => onFeaturedToggle(e.target.checked)}
            className="w-4 h-4 text-pine rounded focus:ring-pine"
          />
          <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
          <span>Featured Causes Only</span>
        </label>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-pine text-canvas font-semibold shadow-soft'
                : 'bg-canvas text-ink-muted hover:text-ink hover:bg-sage-light'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};
