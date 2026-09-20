import React, { useState, useEffect } from 'react';
import { ScoreCardVisualizer } from '../../components/score/ScoreCardVisualizer';
import { ScoreHistoryTable } from '../../components/score/ScoreHistoryTable';
import { ScoreEntryModal } from '../../components/score/ScoreEntryModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { Info } from 'lucide-react';

export const ScoresManagementPage = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState(null);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/scores');
      setScores(res.scores || []);
    } catch (err) {
      console.warn('Error loading scores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleEdit = (score) => {
    setEditingScore(score);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingScore(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-ink">
            Stableford Scores Management
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Record, edit, and inspect your 5 retained Stableford golf scores forming your active monthly draw numbers.
          </p>
        </div>

        <Badge variant="success" size="md" className="shrink-0 self-start sm:self-center py-1.5 px-3.5 gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Score Entry Unrestricted</span>
        </Badge>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching your Stableford scores..." />
      ) : (
        <>
          {/* Visualizer Component */}
          <ScoreCardVisualizer
            scores={scores}
            onAddScoreClick={handleAddNew}
          />

          {/* History Table Component */}
          <ScoreHistoryTable
            scores={scores}
            onEditScore={handleEdit}
            onAddScore={handleAddNew}
            onRefresh={fetchScores}
          />
        </>
      )}

      {/* Rules Notice */}
      <Card variant="ivory" className="p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-pine shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-ink-muted leading-relaxed">
            <h4 className="font-serif font-bold text-ink text-sm">Stableford Score Queue Guidelines</h4>
            <p>
              • <strong>Score Range:</strong> Points must be between 1 and 45.
            </p>
            <p>
              • <strong>One Score Per Date:</strong> Only one round can be recorded per calendar date. If you played 36 holes, edit or choose your best Stableford round for that date.
            </p>
            <p>
              • <strong>FIFO Automatic Eviction:</strong> Digital Heroes retains exactly your 5 most recent scores. When you input a 6th round, your oldest round is automatically replaced.
            </p>
          </div>
        </div>
      </Card>

      {/* Entry / Edit Modal */}
      <ScoreEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialScore={editingScore}
        onSuccess={fetchScores}
      />

    </div>
  );
};
