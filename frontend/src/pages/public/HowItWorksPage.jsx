import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { DrawBall } from '../../components/draw/DrawBall';
import { 
  CheckCircle2, 
  Target, 
  Trophy, 
  Heart, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight,
  Clock,
  RotateCw,
  Upload
} from 'lucide-react';

export const HowItWorksPage = () => {
  const steps = [
    {
      num: '01',
      title: 'Join & Select Your Cause',
      desc: 'Subscribe to a monthly or discounted annual plan. Choose your preferred charity from our verified directory. A minimum of 10% of your membership fee is automatically directed to your chosen cause, with the option to voluntarily increase your contribution at any time.',
      icon: Heart,
      badge: 'Charity Commitment'
    },
    {
      num: '02',
      title: 'Record 5 Stableford Scores',
      desc: 'Play your regular rounds and record your official Stableford scores (1 to 45 points). Only one score is permitted per date. Your latest 5 scores form your immutable monthly prize-draw combination. When you post a 6th score, your oldest score automatically drops off.',
      icon: Target,
      badge: '1-45 Point Range'
    },
    {
      num: '03',
      title: 'Monthly Live Prize Draws',
      desc: 'Each month, the platform conducts a draw using either cryptographically secure random generation or algorithmic score-frequency weighting. Matches are checked across 5-number, 4-number, and 3-number tiers.',
      icon: Trophy,
      badge: '40% / 35% / 25% Splits'
    },
    {
      num: '04',
      title: 'Jackpots & Rollovers',
      desc: 'The Tier-1 5-number jackpot (40% of the pool) rolls over to the next month if unclaimed, creating substantial jackpot accumulations. Tiers 2 and 3 do not roll over and are split equally among verified winners in those tiers.',
      icon: RotateCw,
      badge: '5-Match Rollover'
    },
    {
      num: '05',
      title: 'Winner Proof Verification & Payout',
      desc: 'Winners upload a screenshot of their official scorecard or club handicap handicap record. Platform administrators verify the submitted proof, approve the result, and execute payout directly to the subscriber.',
      icon: ShieldCheck,
      badge: 'Audited Verification'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-8 sm:py-12">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="pine" size="sm">Operational Blueprint</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          How Digital Heroes Works
        </h1>
        <p className="text-base text-ink-muted leading-relaxed">
          A step-by-step breakdown of score tracking, monthly prize draw mechanics, rollover rules, and charitable distributions.
        </p>
      </div>

      {/* Step by Step Timeline */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <Card key={idx} className="p-8 space-y-4 hover:shadow-soft-lg transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sage-light">
                <div className="flex items-center gap-4">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-pine">
                    {step.num}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-ink">
                    {step.title}
                  </h3>
                </div>
                <Badge variant="default" size="sm">{step.badge}</Badge>
              </div>

              <div className="flex items-start gap-4 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-canvas flex items-center justify-center text-pine shrink-0 mt-1">
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Draw Simulation Example */}
      <div className="bg-ink text-canvas rounded-4xl p-8 sm:p-12 max-w-4xl mx-auto space-y-6 border border-pine/30">
        <div className="flex items-center gap-2 text-gold-light text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-4 h-4" />
          <span>Draw Match Example</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold">
          How Score Combinations Match
        </h3>
        <p className="text-xs text-sage/80 leading-relaxed">
          Suppose a subscriber's 5 recorded scores are: <strong>[38, 35, 41, 32, 36]</strong>.
        </p>

        <div className="bg-pine-deep/80 p-6 rounded-2xl border border-pine/40 space-y-4">
          <span className="text-[11px] uppercase font-bold text-sage block">Winning Numbers Drawn:</span>
          <div className="flex items-center gap-2.5">
            {[35, 38, 41, 32, 36].map((n, i) => (
              <DrawBall key={i} number={n} matched={true} size="md" />
            ))}
          </div>
          <div className="p-3 bg-white/10 rounded-xl text-xs text-emerald-300 font-medium">
            🎯 Result: <strong>5-Number Match (Tier 1 Jackpot Winner!)</strong> — Awarded 40% of the active prize pool + previous rollover balance.
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-8">
        <Link to="/pricing">
          <Button variant="primary" size="lg" className="gap-2">
            <span>Ready to Begin? View Membership Plans</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>

    </div>
  );
};
