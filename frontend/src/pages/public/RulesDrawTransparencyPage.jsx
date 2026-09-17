import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { WinnerTiersBreakdown } from '../../components/draw/WinnerTiersBreakdown';
import { ShieldCheck, Lock, CheckCircle2, RotateCw, FileText, Scale } from 'lucide-react';

export const RulesDrawTransparencyPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 py-8 sm:py-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="gold" size="sm">Auditability & Governance</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Draw Rules & Transparency
        </h1>
        <p className="text-base text-ink-muted leading-relaxed">
          Full mathematical disclosure on our 3-tier prize pool allocations, random vs algorithmic draw engines, score verification standards, and Row Level Security.
        </p>
      </div>

      {/* 1. Prize Tiers Breakdown */}
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink">
            1. Official Prize Allocation Formula
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Every monthly draw divides the active prize pool into three strict tiers:
          </p>
        </div>

        <WinnerTiersBreakdown
          pool5Match={10000}
          pool4Match={8750}
          pool3Match={6250}
          rolloverAmount={0}
        />
      </div>

      {/* 2. Core Operational Rules Grid */}
      <div className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-ink">
          2. Platform Operating Rules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-pine font-bold text-base">
              <RotateCw className="w-5 h-5" />
              <span>Rollover Mechanics</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              If no subscriber achieves a 5-number match in a given monthly draw, the entire 40% Tier-1 prize pool automatically rolls over and augments the Tier-1 pool of the subsequent month. Tiers 2 and 3 do not roll over.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-pine font-bold text-base">
              <Scale className="w-5 h-5" />
              <span>Equal Split Distribution</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              When multiple subscribers win within the same prize tier (e.g. two 4-number matches), the total prize pool allocated for that tier is divided equally among all verified winning entries.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-pine font-bold text-base">
              <CheckCircle2 className="w-5 h-5" />
              <span>Score Recording & FIFO Queue</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Scores must be valid Stableford numbers between 1 and 45 points. Only one score per date is permitted. Exactly 5 scores are retained; adding a 6th round drops the oldest recorded score automatically.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-pine font-bold text-base">
              <ShieldCheck className="w-5 h-5" />
              <span>Immutable Snapshot & Winner Proof</span>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              At draw execution time, a subscriber's 5 scores are captured as an immutable snapshot array. Winning claimants upload official scorecard proofs to private storage for administrative review prior to payout.
            </p>
          </Card>

        </div>
      </div>

      {/* 3. Draw Engine Algorithms */}
      <Card variant="dark" className="p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-2 text-gold-light text-xs font-bold uppercase tracking-wider">
          <Lock className="w-4 h-4" />
          <span>Algorithmic Integrity</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold">
          Dual-Mode Draw Engine
        </h3>
        <div className="space-y-4 text-xs text-sage/80 leading-relaxed">
          <p>
            Digital Heroes supports two distinct draw strategies, configured server-side by administrators prior to simulation and publishing:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-canvas">Random Lottery Mode:</strong> Generates 5 unique integers between 1 and 45 using Node.js cryptographically secure pseudo-random number generator (<code className="text-gold-light">crypto.randomInt</code>).
            </li>
            <li>
              <strong className="text-canvas">Algorithmic Weighted Frequency Mode:</strong> Analyzes the empirical distribution of all scores recorded by active subscribers for the month, computing weighted probabilities to favor performance clusters while maintaining provable mathematical fairness.
            </li>
          </ul>
        </div>
      </Card>

    </div>
  );
};
