import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { api } from '../../services/api';
import { 
  Users, 
  CreditCard, 
  Trophy, 
  Heart, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export const ReportsAnalyticsTab = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/reports');
        setReportData(res);
      } catch (err) {
        console.warn('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating financial aggregates and KPI reports..." />;

  const metrics = reportData?.metrics || {};
  const drawPerformance = reportData?.drawPerformance || [];
  const charityBreakdown = reportData?.charityBreakdown || [];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-ink">
          Executive Reports & Analytics
        </h2>
        <p className="text-xs text-ink-muted mt-0.5">
          Real-time aggregated platform metrics, subscription revenues, prize pool disbursements, and charity impact.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Users */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-pine" />
          </div>
          <span className="font-serif text-3xl font-bold text-ink block">
            {metrics.totalUsers || 0}
          </span>
          <span className="text-xs text-ink-muted block">Platform community members</span>
        </Card>

        {/* Active Subscribers */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold uppercase tracking-wider">Active Subscribers</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-emerald-800">
              {metrics.activeSubscribers || 0}
            </span>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
          <span className="text-xs text-ink-muted block">Monthly recurring members</span>
        </Card>

        {/* Total Prize Pool Awarded */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold uppercase tracking-wider">Total Prizes Awarded</span>
            <Trophy className="w-4 h-4 text-gold-dark" />
          </div>
          <span className="font-serif text-3xl font-bold text-ink block">
            £{parseFloat(metrics.totalPrizePoolAwarded || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-ink-muted block">Across {metrics.publishedDrawsCount || 0} published draws</span>
        </Card>

        {/* Total Charity Raised */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold uppercase tracking-wider">Total Charity Impact</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <span className="font-serif text-3xl font-bold text-rose-700 block">
            £{parseFloat(metrics.totalCharityRaised || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-ink-muted block">Subscription + Direct Giving</span>
        </Card>

      </div>

      {/* Historical Draw Performance Table */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-ink">
          Monthly Draw Financial Breakdown
        </h3>

        <div className="bg-white rounded-3xl border border-sage/30 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas/60 text-ink-muted text-xs uppercase tracking-wider font-semibold border-b border-sage-light">
                <tr>
                  <th className="py-4 px-6">Draw</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Strategy Mode</th>
                  <th className="py-4 px-6">Subscribers</th>
                  <th className="py-4 px-6">Prize Pool</th>
                  <th className="py-4 px-6">Charity Total</th>
                  <th className="py-4 px-6">Rollover to Next</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-light">
                {drawPerformance.map((dp, i) => (
                  <tr key={i} className="hover:bg-canvas/30 transition-colors">
                    <td className="py-4 px-6 font-serif font-bold text-ink">#{dp.drawNumber} — {dp.name}</td>
                    <td className="py-4 px-6 text-xs text-ink-muted">{new Date(dp.date).toLocaleDateString('en-GB')}</td>
                    <td className="py-4 px-6"><Badge variant="pine" size="sm">{dp.mode}</Badge></td>
                    <td className="py-4 px-6 font-semibold">{dp.eligibleSubscribers}</td>
                    <td className="py-4 px-6 font-serif font-bold text-pine">£{parseFloat(dp.prizePool || 0).toFixed(2)}</td>
                    <td className="py-4 px-6 font-semibold text-rose-700">£{parseFloat(dp.charityDistributed || 0).toFixed(2)}</td>
                    <td className="py-4 px-6 font-semibold text-amber-800">£{parseFloat(dp.rolloverToNext || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charity Funds Raised Distribution */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-ink">
          Charitable Beneficiary Allocations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {charityBreakdown.map((cb) => (
            <Card key={cb.id} className="p-6 space-y-2">
              <span className="text-[11px] font-bold text-pine uppercase tracking-wider block">{cb.category}</span>
              <h4 className="font-serif text-base font-bold text-ink truncate">{cb.name}</h4>
              <div className="pt-2 border-t border-sage-light flex items-baseline justify-between">
                <span className="text-xs text-ink-muted">Total Remitted:</span>
                <span className="font-serif text-lg font-bold text-ink">
                  £{parseFloat(cb.totalRaised || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
};
