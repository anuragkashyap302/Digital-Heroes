import React, { useState } from 'react';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { Edit2, Trash2, Calendar, MapPin, FileText, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const ScoreHistoryTable = ({
  scores = [],
  onEditScore,
  onAddScore,
  onRefresh
}) => {
  const notify = useNotification();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (scoreId) => {
    if (!window.confirm('Are you sure you want to remove this Stableford score?')) return;

    setDeletingId(scoreId);
    try {
      await api.delete(`/scores/${scoreId}`);
      notify.success('Score deleted successfully.');
      onRefresh?.();
    } catch (err) {
      notify.error(err.message || 'Failed to delete score.');
    } finally {
      setDeletingId(null);
    }
  };

  if (scores.length === 0) {
    return (
      <EmptyState
        title="No Scores Recorded Yet"
        description="Enter your Stableford scores (1–45 points) from your recent golf rounds to generate your 5-ball monthly draw entry numbers."
        actionText="Record First Score"
        onAction={onAddScore}
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-sage/30 shadow-soft overflow-hidden">
      <div className="p-6 sm:p-8 pb-4 flex items-center justify-between border-b border-sage-light">
        <div>
          <h4 className="font-serif text-xl font-bold text-ink">
            Score History ({scores.length}/5 Retained)
          </h4>
          <p className="text-xs text-ink-muted mt-0.5">
            Strictly ordered from most recent round date.
          </p>
        </div>

        {scores.length < 5 && (
          <Button variant="primary" size="sm" onClick={onAddScore} className="gap-1 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Score</span>
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas/60 text-ink-muted text-xs uppercase tracking-wider font-semibold border-b border-sage-light">
            <tr>
              <th className="py-4 px-6">Score (Pts)</th>
              <th className="py-4 px-6">Played Date</th>
              <th className="py-4 px-6">Course / Club</th>
              <th className="py-4 px-6 hidden sm:table-cell">Notes</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-light">
            {scores.map((s, idx) => (
              <tr key={s.id} className="hover:bg-canvas/30 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-pine text-canvas font-serif font-bold text-base flex items-center justify-center shadow-soft-sm">
                      {s.score}
                    </span>
                    <span className="text-xs font-semibold text-pine-dark">
                      Ball #{idx + 1}
                    </span>
                  </div>
                </td>

                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-ink font-medium">
                    <Calendar className="w-4 h-4 text-ink-muted" />
                    <span>{new Date(s.played_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </td>

                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-ink-soft">
                    <MapPin className="w-4 h-4 text-sage-dark" />
                    <span>{s.course_name || 'Home Club'}</span>
                  </div>
                </td>

                <td className="py-4 px-6 text-ink-muted text-xs hidden sm:table-cell max-w-xs truncate">
                  {s.notes || '—'}
                </td>

                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditScore(s)}
                      className="p-2 rounded-xl text-ink-muted hover:text-pine hover:bg-pine/10 transition-colors"
                      title="Edit Score"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="p-2 rounded-xl text-ink-muted hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Delete Score"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
