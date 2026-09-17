import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { DrawBall } from '../../components/draw/DrawBall';
import { DrawCountdown } from '../../components/draw/DrawCountdown';
import { WinnerTiersBreakdown } from '../../components/draw/WinnerTiersBreakdown';
import { CharityCard } from '../../components/charity/CharityCard';
import { DonationModal } from '../../components/charity/DonationModal';
import { api } from '../../services/api';
import { 
  Trophy, 
  Heart, 
  Target, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Coins, 
  Users, 
  Award,
  ChevronRight
} from 'lucide-react';

export const HomePage = () => {
  const [currentDraw, setCurrentDraw] = useState(null);
  const [featuredCharities, setFeaturedCharities] = useState([]);
  const [selectedDonationCharity, setSelectedDonationCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [drawRes, charityRes] = await Promise.all([
          api.get('/draws/current').catch(() => null),
          api.get('/charities?featured=true').catch(() => null)
        ]);

        if (drawRes?.currentDraw) setCurrentDraw(drawRes.currentDraw);
        if (charityRes?.charities) setFeaturedCharities(charityRes.charities.slice(0, 3));
      } catch (err) {
        console.warn('Failed to load homepage feeds:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-24 sm:space-y-32">
      
      {/* 1. Hero Section */}
      <section className="relative pt-8 sm:pt-16 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Editorial Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-sage/40 shadow-soft-sm">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
                  The New Era of Golf Philanthropy
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-[1.08]">
                Play with Purpose. <br />
                <span className="font-editorial-italic font-normal text-pine">Win with Honor.</span> <br />
                Give with Heart.
              </h1>

              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl">
                Digital Heroes turns your regular Stableford golf scores into monthly cash prize-draw combinations while directly funding verified conservation, youth, and veteran charities.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/pricing">
                  <Button variant="primary" size="lg" className="shadow-soft hover:shadow-pine-glow">
                    <span>Join as a Digital Hero</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>

                <Link to="/how-it-works">
                  <Button variant="outline" size="lg">
                    How Draws Work
                  </Button>
                </Link>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-6 border-t border-sage/25 grid grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-serif text-lg font-bold text-ink block">10% Min</span>
                  <span className="text-ink-muted">To Chosen Charity</span>
                </div>
                <div className="space-y-1">
                  <span className="font-serif text-lg font-bold text-pine block">40 / 35 / 25%</span>
                  <span className="text-ink-muted">3-Tier Prize Pools</span>
                </div>
                <div className="space-y-1">
                  <span className="font-serif text-lg font-bold text-gold-dark block">Rollover</span>
                  <span className="text-ink-muted">5-Match Jackpot</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Draw Ball Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-white/85 backdrop-blur-md rounded-4xl p-8 border border-sage/40 shadow-soft-xl space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-sage-light">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pine block">
                      Active Draw Entry Model
                    </span>
                    <h4 className="font-serif text-xl font-bold text-ink">
                      Stableford Combination
                    </h4>
                  </div>
                  <Badge variant="gold" size="sm">
                    5-Ball Entry
                  </Badge>
                </div>

                <div className="flex items-center justify-center gap-2.5 py-4">
                  {[38, 35, 41, 32, 36].map((num, i) => (
                    <DrawBall key={i} number={num} size="md" animated={true} delay={i * 0.12} />
                  ))}
                </div>

                <p className="text-xs text-ink-muted text-center leading-relaxed">
                  Your 5 most recent golf rounds form your monthly lottery numbers. When you post a new round, your oldest score automatically drops.
                </p>

                <div className="bg-canvas p-4 rounded-2xl border border-sage/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                      <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-ink block">Fairway Foundation</span>
                      <span className="text-[11px] text-ink-muted">Allocated: 20% of subscription</span>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Verified</Badge>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. Next Live Draw Countdown & Prize Pool Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DrawCountdown
          targetDate={currentDraw?.draw_date}
          drawName={currentDraw?.name || 'Digital Heroes Monthly Impact Draw'}
        />
      </section>

      {/* 3. Value Proposition / 3 Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="pine" size="sm">The Core Ecosystem</Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            A Platform Built on Three Pillars
          </h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            Every subscription fuels golf performance tracking, transparent audited prize draws, and direct support for grassroots causes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <Card hoverEffect={true} className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-pine/10 text-pine flex items-center justify-center">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">1. Stableford Score Engine</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Input your official Stableford scores (1–45 points). The system automatically retains your 5 latest rounds in reverse chronological order, smoothly rolling forward as you play.
            </p>
          </Card>

          <Card hoverEffect={true} className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">2. Monthly Prize Draws</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Every month, 5 winning numbers are drawn via cryptographic randomness or score-frequency algorithms. 5-, 4-, and 3-number matches win tiered cash pools, with unclaimed Tier-1 jackpots rolling over.
            </p>
          </Card>

          <Card hoverEffect={true} className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-700 flex items-center justify-center">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">3. Direct Charity Support</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              At least 10% of your membership fee goes directly to your selected charity. You can voluntarily increase your percentage or contribute via independent donations at any time.
            </p>
          </Card>

        </div>
      </section>

      {/* 4. Prize Tier Transparency Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="gold" size="sm">Audited Prize Architecture</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-2">
              Transparent Prize Tier Splits
            </h2>
            <p className="text-xs text-ink-muted mt-1 max-w-xl">
              Strictly distributed per verified rules: 40% Tier-1 (Rollover Jackpot), 35% Tier-2, 25% Tier-3. Multiple winners in the same tier split equally.
            </p>
          </div>

          <Link to="/rules">
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-pine">
              <span>View Full Draw Rules</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <WinnerTiersBreakdown
          pool5Match={currentDraw?.pool_5_match || 7400}
          pool4Match={currentDraw?.pool_4_match || 6475}
          pool3Match={currentDraw?.pool_3_match || 4625}
          rolloverAmount={currentDraw?.rollover_from_previous || 0}
        />
      </section>

      {/* 5. Featured Causes Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="pine" size="sm">Grassroots Impact</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-2">
              Featured Charitable Causes
            </h2>
            <p className="text-xs text-ink-muted mt-1 max-w-xl">
              Choose the charity your membership directly champions, or support with an independent direct gift.
            </p>
          </div>

          <Link to="/charities">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <span>Browse All Causes</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCharities.map((charity) => (
            <CharityCard
              key={charity.id}
              charity={charity}
              onDonateDirect={(c) => setSelectedDonationCharity(c)}
            />
          ))}
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-ink rounded-4xl p-8 sm:p-16 text-canvas relative overflow-hidden border border-pine/30 shadow-soft-xl">
          <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-pine/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <Badge variant="gold" size="sm">Become a Member</Badge>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
              Ready to Play Your Rounds for a Cause?
            </h2>
            <p className="text-sm text-sage/80 leading-relaxed">
              Join hundreds of golfers turning their weekend Stableford scores into monthly draw entries and meaningful charitable support.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/register">
                <Button variant="gold" size="lg" className="shadow-gold-glow">
                  <span>Sign Up & Subscribe</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outlineWhite" size="lg">
                  View Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Donation Modal */}
      {selectedDonationCharity && (
        <DonationModal
          isOpen={!!selectedDonationCharity}
          onClose={() => setSelectedDonationCharity(null)}
          charity={selectedDonationCharity}
        />
      )}

    </div>
  );
};
