import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { DrawBall } from '../../components/draw/DrawBall';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { api } from '../../services/api';
import { Trophy, Calendar, Users, Award, RotateCw } from 'lucide-react';

export const DrawsArchivePage = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchive = async () => {
      setLoading(true);
      try {
        const res = await api.get('/draws/archive');
        setDraws(res.draws || []);
      } catch (err) {
        console.warn('Failed to load draw archives:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArchive();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8 sm:py-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="pine" size="sm">Historical Audit Log</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Past Draw Archives
        </h1>
        <p className="text-base text-ink-muted leading-relaxed">
          Review previous published monthly draws, official winning numbers drawn, eligible player counts, and charity distributions.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving draw archives..." />
      ) : draws.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No Published Draws in Archive"
          description="Previous draw records will appear here as soon as they are completed and published."
        />
      ) : (
        <div className="space-y-8">
          {draws.map((draw) => {
            const numbers = Array.isArray(draw.winning_numbers) ? draw.winning_numbers : [];
            const isRolloverOut = parseFloat(draw.rollover_to_next || 0) > 0;

            return (
              <Card key={draw.id} className="p-8 space-y-6">
                
                {/* Title & Date Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-sage-light">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-2xl font-bold text-ink">
                        Draw #{draw.draw_number} — {draw.name}
                      </span>
                      <Badge variant={draw.mode === 'random_lottery' ? 'pine' : 'gold'} size="sm">
                        {draw.mode === 'random_lottery' ? 'Random Lottery' : 'Score Weighted'}
                      </Badge>
                    </div>
                    <span className="text-xs text-ink-muted flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Conducted on: {new Date(draw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-pine block">Total Awarded Pool</span>
                    <span className="font-serif text-2xl font-bold text-ink">
                      £{parseFloat(draw.prize_pool_total || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Winning Numbers Presentation */}
                <div className="bg-canvas/80 p-6 rounded-3xl border border-sage/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-ink block mb-3">
                      Official Winning Numbers:
                    </span>
                    <div className="flex items-center gap-3">
                      {numbers.map((n, i) => (
                        <DrawBall key={i} number={n} matched={true} size="md" />
                      ))}
                    </div>
                  </div>

                  {isRolloverOut && (
                    <div className="flex items-center gap-2 bg-amber-100/90 text-amber-900 border border-amber-300 px-4 py-2.5 rounded-2xl text-xs font-semibold">
                      <RotateCw className="w-4 h-4" />
                      <span>£{parseFloat(draw.rollover_to_next).toLocaleString('en-GB', { minimumFractionDigits: 2 })} Rolled Over to Next Month</span>
                    </div>
                  )}
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-2xl border border-sage/20 space-y-1">
                    <span className="text-ink-muted">Eligible Players:</span>
                    <strong className="text-sm font-bold text-ink block">{draw.total_subscribers_eligible || '—'}</strong>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-sage/20 space-y-1">
                    <span className="text-ink-muted">Tier 1 (5-Match):</span>
                    <strong className="text-sm font-bold text-pine block">£{parseFloat(draw.pool_5_match || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</strong>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-sage/20 space-y-1">
                    <span className="text-ink-muted">Tier 2 (4-Match):</span>
                    <strong className="text-sm font-bold text-ink block">£{parseFloat(draw.pool_4_match || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</strong>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-sage/20 space-y-1">
                    <span className="text-ink-muted">Charity Generated:</span>
                    <strong className="text-sm font-bold text-rose-700 block">£{parseFloat(draw.charity_distribution_total || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>

              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};
