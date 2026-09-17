import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const ScoreEntryModal = ({
  isOpen,
  onClose,
  initialScore = null,
  onSuccess
}) => {
  const notify = useNotification();
  const [score, setScore] = useState('');
  const [playedAt, setPlayedAt] = useState('');
  const [courseName, setCourseName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialScore) {
      setScore(initialScore.score || '');
      setPlayedAt(initialScore.played_at ? initialScore.played_at.split('T')[0] : '');
      setCourseName(initialScore.course_name || '');
      setNotes(initialScore.notes || '');
    } else {
      setScore('');
      setPlayedAt(new Date().toISOString().split('T')[0]);
      setCourseName('');
      setNotes('');
    }
    setValidationError('');
  }, [initialScore, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const parsedScore = parseInt(score, 10);
    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
      setValidationError('Stableford score must be a whole number between 1 and 45.');
      return;
    }

    if (!playedAt) {
      setValidationError('Please select the date the round was played.');
      return;
    }

    setLoading(true);
    try {
      if (initialScore?.id) {
        // Edit existing score
        await api.put(`/scores/${initialScore.id}`, {
          score: parsedScore,
          played_at: playedAt,
          course_name: courseName || 'Home Club',
          notes
        });
        notify.success('Stableford score updated successfully.');
      } else {
        // Add new score (triggers backend transactional FIFO 5-score retention)
        await api.post('/scores', {
          score: parsedScore,
          played_at: playedAt,
          course_name: courseName || 'Home Club',
          notes
        });
        notify.success('Stableford score recorded into your draw combination.');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Failed to save score. Please try again.');
      notify.error(err.message || 'Error saving score.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialScore ? 'Edit Stableford Score' : 'Record Stableford Score'}
      subtitle="Scores must be between 1 and 45 points. One score permitted per date. Your latest 5 scores form your monthly draw numbers."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {validationError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Score Input */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Stableford Points (1 - 45) *
            </label>
            <input
              type="number"
              min="1"
              max="45"
              required
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 36"
              className="w-full px-4 py-3 rounded-2xl bg-canvas border border-sage/40 text-ink font-serif text-xl font-bold focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white transition-all"
            />
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Date Played *
            </label>
            <input
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-canvas border border-sage/40 text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Course Name */}
        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
            Golf Course / Club Name
          </label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="e.g. St Andrews Links, Wentworth West, or Home Club"
            className="w-full px-4 py-3 rounded-2xl bg-canvas border border-sage/40 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white transition-all"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
            Round Notes (Optional)
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. 3 birdies on back 9, windy conditions..."
            className="w-full px-4 py-3 rounded-2xl bg-canvas border border-sage/40 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white transition-all resize-none"
          />
        </div>

        {/* Notice on 5-score queue */}
        <div className="p-3.5 rounded-2xl bg-sage-light/60 border border-sage/30 text-[11px] text-ink-muted leading-relaxed">
          💡 <strong>FIFO Rule:</strong> Only your 5 most recent Stableford scores are retained. When you record a 6th score, your oldest round is automatically replaced.
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-sage-light">
          <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={loading}>
            {initialScore ? 'Save Changes' : 'Record Score'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
