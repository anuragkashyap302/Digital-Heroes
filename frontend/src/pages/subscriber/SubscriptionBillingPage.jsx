import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { CreditCard, Calendar, ShieldCheck, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

export const SubscriptionBillingPage = () => {
  const { subscription, refreshUser } = useAuth();
  const notify = useNotification();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const handleOpenPortal = async () => {
    setLoadingPortal(true);
    try {
      const res = await api.post('/subscriptions/portal');
      if (res.url) {
        if (res.simulated) {
          notify.info('Simulated Stripe Billing Portal opened.');
        } else {
          window.location.href = res.url;
        }
      }
    } catch (err) {
      notify.error(err.message || 'Failed to open billing portal.');
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleCancelSub = async () => {
    if (!window.confirm('Are you sure you want to cancel renewal at the end of the current billing cycle?')) return;

    setCanceling(true);
    try {
      const res = await api.post('/subscriptions/cancel');
      notify.success(res.message || 'Subscription cancellation scheduled.');
      await refreshUser();
    } catch (err) {
      notify.error(err.message || 'Cancellation failed.');
    } finally {
      setCanceling(false);
    }
  };

  const isSubActive = subscription?.status === 'active';
  const isCancelScheduled = subscription?.cancel_at_period_end;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-ink">
          Membership & Billing
        </h2>
        <p className="text-xs text-ink-muted mt-1">
          Manage your subscription tier, billing intervals, payment methods, and renewal dates.
        </p>
      </div>

      {/* Main Subscription Card */}
      <Card className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sage-light">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-serif text-2xl font-bold text-ink capitalize">
                {subscription?.plan_type ? subscription.plan_type.replace('_', ' ') : 'Hero Monthly'} Plan
              </h3>
              <Badge variant={isSubActive ? 'success' : 'danger'} size="sm">
                {subscription?.status?.toUpperCase() || 'ACTIVE'}
              </Badge>
            </div>
            <span className="text-xs text-ink-muted block mt-1">
              Stripe ID: <code className="text-pine font-mono text-[11px]">{subscription?.stripe_subscription_id || 'sub_demo'}</code>
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-ink-muted block">Next Renewal Date</span>
            <span className="font-serif text-xl font-bold text-ink">
              {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Next Cycle'}
            </span>
          </div>
        </div>

        {/* Status Notice */}
        {isCancelScheduled ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Cancellation Scheduled:</strong> Your subscription will remain active until {new Date(subscription.current_period_end).toLocaleDateString('en-GB')}. After this date, you will no longer be entered into monthly draws.
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong>Active Hero Membership:</strong> Automatically renewing on schedule. Your 5 scores are permanently eligible for monthly prize draws.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-sage-light flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="outline"
            size="md"
            loading={loadingPortal}
            onClick={handleOpenPortal}
            className="gap-2 text-xs"
          >
            <CreditCard className="w-4 h-4" />
            <span>Manage Payment Methods (Stripe Portal)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Button>

          {!isCancelScheduled && isSubActive && (
            <Button
              variant="ghost"
              size="sm"
              loading={canceling}
              onClick={handleCancelSub}
              className="text-xs text-rose-700 hover:bg-rose-50"
            >
              Cancel Renewal at Period End
            </Button>
          )}
        </div>
      </Card>

    </div>
  );
};
