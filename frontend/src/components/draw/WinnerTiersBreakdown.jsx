import React from 'react';
import { Trophy, Award, Gift, RotateCw } from 'lucide-react';
import { Badge } from '../common/Badge';

export const WinnerTiersBreakdown = ({
  pool5Match = 0,
  pool4Match = 0,
  pool3Match = 0,
  rolloverAmount = 0,
  tier5WinnersCount = 0,
  tier4WinnersCount = 0,
  tier3WinnersCount = 0
}) => {
  const tiers = [
    {
      id: 'tier_5',
      name: 'Tier 1: 5-Number Match (Jackpot)',
      matchText: 'Match all 5 Stableford scores',
      percentage: '40% of Pool + Rollover',
      poolAmount: pool5Match,
      winnersCount: tier5WinnersCount,
      rollover: true,
      icon: Trophy,
      badge: 'Tier 1 Jackpot',
      badgeVariant: 'tier5',
      accentColor: 'from-amber-500/10 to-gold/10 border-gold/40'
    },
    {
      id: 'tier_4',
      name: 'Tier 2: 4-Number Match',
      matchText: 'Match 4 of 5 Stableford scores',
      percentage: '35% of Pool',
      poolAmount: pool4Match,
      winnersCount: tier4WinnersCount,
      rollover: false,
      icon: Award,
      badge: 'Tier 2 Winner',
      badgeVariant: 'tier4',
      accentColor: 'from-pine/10 to-pine/5 border-pine/30'
    },
    {
      id: 'tier_3',
      name: 'Tier 3: 3-Number Match',
      matchText: 'Match 3 of 5 Stableford scores',
      percentage: '25% of Pool',
      poolAmount: pool3Match,
      winnersCount: tier3WinnersCount,
      rollover: false,
      icon: Gift,
      badge: 'Tier 3 Winner',
      badgeVariant: 'tier3',
      accentColor: 'from-sage/10 to-sage/5 border-sage/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier) => {
        const Icon = tier.icon;
        const individualPrize = tier.winnersCount > 0 ? (tier.poolAmount / tier.winnersCount) : tier.poolAmount;

        return (
          <div
            key={tier.id}
            className={`rounded-3xl p-6 bg-gradient-to-br ${tier.accentColor} border shadow-soft flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-ink shadow-soft-sm">
                  <Icon className="w-5 h-5 text-gold-dark" />
                </div>
                <Badge variant={tier.badgeVariant} size="sm">
                  {tier.badge}
                </Badge>
              </div>

              <h4 className="font-serif text-lg font-bold text-ink leading-snug">
                {tier.name}
              </h4>
              <p className="text-xs text-ink-muted mt-1">{tier.matchText}</p>
              
              <div className="mt-5 pt-4 border-t border-sage/20">
                <span className="text-[11px] font-semibold text-ink-muted tracking-wider uppercase block">
                  Allocated Pool ({tier.percentage})
                </span>
                <span className="font-serif text-2xl font-bold text-ink block mt-1">
                  £{parseFloat(tier.poolAmount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-sage/20 flex items-center justify-between text-xs">
              <span className="text-ink-muted">
                {tier.winnersCount > 0 ? (
                  <strong className="text-emerald-700 font-semibold">{tier.winnersCount} Winner{tier.winnersCount > 1 ? 's' : ''} (£{individualPrize.toFixed(2)} ea)</strong>
                ) : (
                  <span>0 Claimants</span>
                )}
              </span>

              {tier.rollover && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                  <RotateCw className="w-3 h-3" />
                  <span>Jackpot Rolls Over</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
