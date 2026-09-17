import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { DrawBall } from '../../components/draw/DrawBall';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { api } from '../../services/api';
import { Trophy, Calendar, CheckCircle2, Award } from 'lucide-react';

export const DrawHistoryPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const res = await api.get('/draws/user/my-entries');
        setEntries(res.entries || []);
      } catch (err) {
        console.warn('Failed to load draw entries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-ink">
          My Draw Entries & Match History
        </h2>
        <p className="text-xs text-ink-muted mt-1">
          Review your official 5-ball snapshot combinations and matched numbers in each monthly draw.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching your draw history..." />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No Draw Entries Recorded Yet"
          description="Your 5 Stableford scores are automatically captured when an administrator executes a monthly draw."
        />
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => {
            const entryNumbers = Array.isArray(entry.entry_numbers) ? entry.entry_numbers : [];
            const matchedNumbers = Array.isArray(entry.matched_numbers) ? entry.matched_numbers : [];
            const matchedSet = new Set(matchedNumbers);
            const draw = entry.draw || {};
            const winningNumbers = Array.isArray(draw.winning_numbers) ? draw.winning_numbers : [];
            const isWinner = entry.tier_won && entry.tier_won !== 'none';

            return (
              <Card key={entry.id} className="p-8 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sage-light">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-2xl font-bold text-ink">
                        {draw.name || `Draw #${draw.draw_number || 101}`}
                      </h3>
                      {isWinner ? (
                        <Badge variant="tier5" size="sm" className="gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-700" />
                          <span>Winner: {entry.tier_won.replace('_', ' ').toUpperCase()}</span>
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">
                          {entry.matched_count || 0} Matches
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-ink-muted flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{draw.draw_date ? new Date(draw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Monthly Draw'}</span>
                    </span>
                  </div>

                  {isWinner && (
                    <div className="text-left sm:text-right bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Prize Awarded</span>
                      <span className="font-serif text-2xl font-bold text-emerald-900">
                        £{parseFloat(entry.prize_amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Entry vs Winning Numbers Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-canvas/60 p-6 rounded-3xl border border-sage/30">
                  
                  {/* Your 5-Score Snapshot */}
                  <div>
                    <span className="text-xs font-bold text-ink uppercase tracking-wider block mb-3">
                      Your 5-Ball Entry Snapshot:
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {entryNumbers.map((num, i) => (
                        <DrawBall
                          key={i}
                          number={num}
                          matched={matchedSet.has(num)}
                          size="md"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Winning Drawn Numbers */}
                  <div>
                    <span className="text-xs font-bold text-pine uppercase tracking-wider block mb-3">
                      Official Winning Numbers:
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {winningNumbers.map((num, i) => (
                        <DrawBall
                          key={i}
                          number={num}
                          matched={matchedSet.has(num)}
                          size="md"
                        />
                      ))}
                    </div>
                  </div>

                </div>

                {/* Immutable Notice */}
                <div className="flex items-center justify-between text-xs text-ink-muted pt-2">
                  <span>🔒 Snapshot is permanently immutable and tamper-proof.</span>
                  <span>Matched {entry.matched_count || 0} of 5 numbers</span>
                </div>

              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};
