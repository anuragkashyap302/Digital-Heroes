import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Award, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-ink text-canvas border-t border-pine/30 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-pine/20">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pine flex items-center justify-center text-gold-light font-serif font-bold text-lg">
                DH
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-canvas">
                DIGITAL <span className="font-editorial-italic font-normal text-sage">HEROES</span>
              </span>
            </div>
            <p className="text-xs text-sage/80 leading-relaxed mb-6">
              A pioneering subscription platform connecting golf performance tracking, transparent algorithmic monthly prize draws, and verified charitable contributions.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-light bg-pine-deep/80 px-3 py-1.5 rounded-full border border-gold/30 w-fit">
              <Award className="w-3.5 h-3.5" />
              <span>100% Auditable Prize Pools</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h5 className="font-serif text-sm font-semibold tracking-wider text-canvas uppercase mb-4">
              Platform
            </h5>
            <ul className="space-y-2.5 text-xs text-sage/80">
              <li><Link to="/how-it-works" className="hover:text-gold-light transition-colors">How Stableford Draws Work</Link></li>
              <li><Link to="/draws" className="hover:text-gold-light transition-colors">Past Draw Results & Statistics</Link></li>
              <li><Link to="/rules" className="hover:text-gold-light transition-colors">Transparency & Draw Rules</Link></li>
              <li><Link to="/pricing" className="hover:text-gold-light transition-colors">Membership Pricing & Tiers</Link></li>
              <li><Link to="/donate" className="hover:text-gold-light transition-colors">Independent Direct Giving</Link></li>
            </ul>
          </div>

          {/* Col 3: Causes & Impact */}
          <div>
            <h5 className="font-serif text-sm font-semibold tracking-wider text-canvas uppercase mb-4">
              Charity & Impact
            </h5>
            <ul className="space-y-2.5 text-xs text-sage/80">
              <li><Link to="/charities" className="hover:text-gold-light transition-colors">Charity Directory</Link></li>
              <li><Link to="/charities/fairway-foundation-for-youth" className="hover:text-gold-light transition-colors">Youth Golf Scholarships</Link></li>
              <li><Link to="/charities/green-greens-conservation-trust" className="hover:text-gold-light transition-colors">Course Biodiversity Trust</Link></li>
              <li><Link to="/charities/veterans-on-course-project" className="hover:text-gold-light transition-colors">Veterans Rehabilitation</Link></li>
              <li><span className="text-gold-light/90">Minimum 10% Auto-Donation Guaranteed</span></li>
            </ul>
          </div>

          {/* Col 4: Trust & Verification */}
          <div>
            <h5 className="font-serif text-sm font-semibold tracking-wider text-canvas uppercase mb-4">
              Fair Play & Security
            </h5>
            <div className="bg-pine-deep/90 p-4 rounded-2xl border border-pine/40 space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-canvas/90 leading-tight">
                  Cryptographically secure RNG and Score-Frequency weighted simulation algorithms.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-canvas/90 leading-tight">
                  Stripe-verified transactions & direct philanthropic distributions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-sage/60 gap-4">
          <p>© {new Date().getFullYear()} DIGITAL HEROES. All rights reserved. Registered Golf Philanthropy Platform.</p>
          <div className="flex items-center gap-6">
            <Link to="/rules" className="hover:text-canvas transition-colors">Fairness Policy</Link>
            <Link to="/rules" className="hover:text-canvas transition-colors">Terms of Service</Link>
            <Link to="/rules" className="hover:text-canvas transition-colors">Privacy & RLS Security</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
