import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ScoreCardVisualizer } from '../../components/score/ScoreCardVisualizer';
import { ScoreEntryModal } from '../../components/score/ScoreEntryModal';
import { DrawCountdown } from '../../components/draw/DrawCountdown';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  Trophy, 
  Target, 
  Heart, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Award, 
  CreditCard,
  Plus
} from 'lucide-react';

export const DashboardOverview = () => {
  const { user, subscription, selectedCharity } = useAuth();
  const [scores, setScores] = useState([]);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [winnings, setWinnings] = useState([]);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [scoreRes, drawRes, winRes] = await Promise.all([
        api.get('/scores').catch(() => ({ scores: [] })),
        api.get('/draws/current').catch(() => ({ currentDraw: null })),
        api.get('/winners/my-winnings').catch(() => ({ winnings: [] }))
      ]);

      setScores(scoreRes.scores || []);
      setCurrentDraw(drawRes.currentDraw || null);
      setWinnings(winRes.winnings || []);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalWon = winnings.reduce((sum, w) => sum + parseFloat(w.prize_amount || 0), 0);
  const pendingProofCount = winnings.filter(w => w.proof_status === 'pending_upload').length;

  return (
    <div className="space-y-8">
      
      {/* Pending Proof Winner Trophy Alert Banner */}
      {pendingProofCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-gold to-amber-600 text-ink rounded-3xl p-6 shadow-gold-glow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-ink flex items-center justify-center font-bold shadow-soft">
              <Trophy className="w-6 h-6 text-gold-dark" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold leading-snug">
                Congratulations! You Won in the Recent Draw!
              </h3>
              <p className="text-xs font-medium text-ink-soft">
                You have {pendingProofCount} winning entry requiring scorecard proof upload to release payout.
              </p>
            </div>
          </div>

          <Link to="/dashboard/winnings">
            <Button variant="pineDark" size="md" className="shrink-0 gap-1.5 shadow-soft">
              <span>Upload Proof Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Score Queue KPI */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold uppercase tracking-wider">Score Queue</span>
            <Target className="w-4 h-4 text-pine" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-ink">
              {scores.length} / 5
            </span>
            <span className="text-xs font-semibold text-pine-dark">
              {scores.length === 5 ? 'Eligible for Draw' : `${5 - scores.length} round(s) needed`}
            </span>
          </div>
          <p className="text-[11px] text-ink-muted">
            Latest 5 Stableford scores automatically form your active draw numbers.
          </p>
        </Card>

        {/* Charity Impact KPI */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold uppercase tracking-wider">Charity Impact</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-rose-700">
              {user?.charity_contribution_percent || 10}%
            </span>
            <span className="text-xs font-semibold text-ink-soft truncate max-w-[120px]">
              {selectedCharity?.name || 'Selected Cause'}
            </span>
          </div>
          <p className="text-[11px] text-ink-muted">
            Min 10% auto-deducted from your subscription.
          </p>
        </Card>

        {/* Total Winnings KPI */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold uppercase tracking-wider">Total Winnings</span>
            <Award className="w-4 h-4 text-gold-dark" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-ink">
              £{totalWon.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-ink-soft">
              {winnings.length} winning tier(s)
            </span>
          </div>
          <p className="text-[11px] text-ink-muted">
            Verified payouts executed directly to your account.
          </p>
        </Card>

      </div>

      {/* 5-Ball Draw Combination Visualizer */}
      <ScoreCardVisualizer
        scores={scores}
        onAddScoreClick={() => setIsScoreModalOpen(true)}
      />

      {/* Next Upcoming Draw Countdown */}
      <DrawCountdown
        targetDate={currentDraw?.draw_date}
        drawName={currentDraw?.name || 'Upcoming Impact Prize Draw'}
      />

      {/* Score Entry Modal */}
      <ScoreEntryModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        onSuccess={fetchDashboardData}
      />

    </div>
  );
};
