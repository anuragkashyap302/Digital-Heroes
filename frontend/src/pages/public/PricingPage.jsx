import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Check, Sparkles, ShieldCheck, Heart, Trophy, ArrowRight } from 'lucide-react';

export const PricingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribingPriceId, setSubscribingPriceId] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const res = await api.get('/subscriptions/plans');
        setPlans(res.plans || []);
      } catch (err) {
        console.warn('Could not load plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      notify.info('Please sign in or create an account to start your subscription.');
      navigate(`/register?plan=${plan.planType || 'monthly'}`);
      return;
    }

    setSubscribingPriceId(plan.priceId);
    try {
      const res = await api.post('/subscriptions/checkout-session', {
        priceId: plan.priceId,
        planType: plan.planType || 'monthly'
      });

      if (res.url) {
        if (res.simulated) {
          notify.success('Simulated subscription activated! Redirecting to your dashboard.');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          window.location.href = res.url;
        }
      }
    } catch (err) {
      notify.error(err.message || 'Failed to initialize subscription checkout.');
    } finally {
      setSubscribingPriceId(null);
    }
  };

  const planFeatures = [
    '5-Score Stableford performance tracking & FIFO queue',
    'Automatic entry in all monthly cash prize draws',
    'Guaranteed min 10% auto-contribution to your selected charity',
    'Voluntary charity allocation increase slider (up to 100%)',
    'Audited 3-Tier cash prize pools (40% Tier-1 with Rollover)',
    'Verified scorecard proof verification & direct payout'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 py-8 sm:py-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="gold" size="sm">Membership Access</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Choose Your Digital Hero Tier
        </h1>
        <p className="text-base text-ink-muted leading-relaxed">
          Unlock monthly prize draws, track your Stableford performance, and fund impactful grassroots charities.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching dynamic subscription plans..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, idx) => {
            const isDiscounted = plan.planType === 'yearly_discounted' || plan.name?.toLowerCase().includes('discount');
            const isPopular = isDiscounted;

            return (
              <Card
                key={plan.priceId || idx}
                variant={isPopular ? 'goldBorder' : 'default'}
                className={`flex flex-col justify-between p-8 relative ${
                  isPopular ? 'bg-white shadow-soft-xl scale-100 lg:-translate-y-2' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge variant="gold" size="sm" className="shadow-soft font-bold">
                      {plan.badge || 'Best Value • 15% Off'}
                    </Badge>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-serif text-2xl font-bold text-ink">
                      {plan.name}
                    </h3>
                  </div>

                  <p className="text-xs text-ink-muted min-h-[36px] leading-relaxed">
                    {plan.description || 'Monthly prize draw entry, score tracking, and verified charity support.'}
                  </p>

                  <div className="my-6 pt-6 border-t border-sage-light flex items-baseline gap-2">
                    <span className="font-serif text-4xl sm:text-5xl font-bold text-ink">
                      £{parseFloat(plan.amount).toFixed(2)}
                    </span>
                    <span className="text-xs font-semibold text-ink-muted uppercase">
                      /{plan.interval === 'year' ? 'year' : 'month'}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 text-xs text-ink-soft mb-8">
                    {planFeatures.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-pine shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant={isPopular ? 'gold' : 'primary'}
                  size="lg"
                  loading={subscribingPriceId === plan.priceId}
                  onClick={() => handleSubscribe(plan)}
                  className="w-full justify-center gap-2"
                >
                  <span>Select {plan.name.split(' ')[0]} Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Security Guarantee Bar */}
      <div className="bg-canvas/80 rounded-3xl p-6 border border-sage/30 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted text-center sm:text-left">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-pine shrink-0" />
          <span>Secured via Stripe with 256-bit SSL encryption. Cancel or modify your plan anytime in one click.</span>
        </div>
      </div>

    </div>
  );
};
