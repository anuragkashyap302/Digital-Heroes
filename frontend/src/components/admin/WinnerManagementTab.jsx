import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Trophy, CheckCircle2, XCircle, Eye, DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react';

export const WinnerManagementTab = () => {
  const notify = useNotification();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [inspectingWinner, setInspectingWinner] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [payoutWinner, setPayoutWinner] = useState(null);
  const [payoutRef, setPayoutRef] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      let url = '/admin/winners?';
      if (selectedStatus) url += `status=${encodeURIComponent(selectedStatus)}&`;
      if (selectedTier) url += `tier=${encodeURIComponent(selectedTier)}&`;

      const res = await api.get(url);
      setWinners(res.winners || []);
    } catch (err) {
      notify.error('Failed to load winners list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, [selectedStatus, selectedTier]);

  const handleVerify = async (winnerId, newStatus) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/winners/${winnerId}/verify`, {
        proof_status: newStatus,
        admin_notes: verificationNotes || `Verified by administrator on ${new Date().toLocaleDateString('en-GB')}`
      });
      notify.success(`Scorecard proof marked as ${newStatus}.`);
      setInspectingWinner(null);
      setVerificationNotes('');
      await fetchWinners();
    } catch (err) {
      notify.error(err.message || 'Verification update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPayout = async (e) => {
    e.preventDefault();
    if (!payoutWinner) return;

    setActionLoading(true);
    try {
      await api.put(`/admin/winners/${payoutWinner.id}/payout`, {
        payout_status: 'paid',
        payout_reference: payoutRef || `STRIPE_TRX_${Date.now()}`
      });
      notify.success('Payout marked as paid and completed.');
      setPayoutWinner(null);
      setPayoutRef('');
      await fetchWinners();
    } catch (err) {
      notify.error(err.message || 'Payout update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-ink">
            Winner Verification & Payout Pipeline
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Audit submitted scorecard proofs, verify handicap scores, and disburse cash prize payouts.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {['', 'under_review', 'verified', 'pending_upload', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-pine text-canvas'
                  : 'bg-white text-ink-muted hover:text-ink border border-sage/30'
              }`}
            >
              {st ? st.replace('_', ' ') : 'All Statuses'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Retrieving winner verification records..." />
      ) : winners.length === 0 ? (
        <EmptyState title="No Winners Found" description="No winner claim records match your current filter." />
      ) : (
        <div className="bg-white rounded-3xl border border-sage/30 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas/60 text-ink-muted text-xs uppercase tracking-wider font-semibold border-b border-sage-light">
                <tr>
                  <th className="py-4 px-6">Winner / Subscriber</th>
                  <th className="py-4 px-6">Draw & Tier</th>
                  <th className="py-4 px-6">Prize Won</th>
                  <th className="py-4 px-6">Proof Status</th>
                  <th className="py-4 px-6">Payout Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-light">
                {winners.map((win) => {
                  const prof = win.profiles || {};
                  const draw = win.draws || {};
                  const isVerified = win.proof_status === 'verified';
                  const isPaid = win.payout_status === 'paid';

                  return (
                    <tr key={win.id} className="hover:bg-canvas/30 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <strong className="font-serif text-base text-ink block">{prof.full_name || 'Subscriber'}</strong>
                          <span className="text-xs text-ink-muted">{prof.email} • Hcap {prof.handicap || 18.0}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div>
                          <span className="text-xs font-bold text-ink block">Draw #{draw.draw_number || 101}</span>
                          <Badge variant="tier5" size="sm" className="mt-0.5">
                            {win.tier.replace('_', ' ').toUpperCase()} ({win.match_count}-Match)
                          </Badge>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-serif text-lg font-bold text-emerald-800">
                          £{parseFloat(win.prize_amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <Badge
                          variant={isVerified ? 'success' : (win.proof_status === 'under_review' ? 'warning' : (win.proof_status === 'rejected' ? 'danger' : 'gold'))}
                          size="sm"
                        >
                          {win.proof_status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant={isPaid ? 'success' : 'default'} size="sm">
                          {isPaid ? 'PAID' : 'PENDING'}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setInspectingWinner(win);
                              setVerificationNotes(win.admin_notes || '');
                            }}
                            className="text-xs py-1.5 px-3 gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-pine" />
                            <span>Audit Proof</span>
                          </Button>

                          {isVerified && !isPaid && (
                            <Button
                              variant="gold"
                              size="sm"
                              onClick={() => {
                                setPayoutWinner(win);
                                setPayoutRef(`DH-STRIPE-PAY-${Date.now()}`);
                              }}
                              className="text-xs py-1.5 px-3 gap-1 shadow-soft"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Disburse</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect & Verify Modal */}
      {inspectingWinner && (
        <Modal
          isOpen={!!inspectingWinner}
          onClose={() => setInspectingWinner(null)}
          title="Audit Winner Scorecard Proof"
          subtitle={`Claim verification for ${inspectingWinner.profiles?.full_name} (${inspectingWinner.tier.toUpperCase()} — £${inspectingWinner.prize_amount})`}
        >
          <div className="space-y-6">
            {/* Proof Image Box */}
            <div className="p-4 bg-canvas rounded-2xl border border-sage/40 text-center">
              {inspectingWinner.signed_proof_url ? (
                <div className="space-y-2">
                  <img
                    src={inspectingWinner.signed_proof_url}
                    alt="Scorecard Proof"
                    className="max-h-72 w-auto object-contain rounded-xl mx-auto shadow-soft"
                  />
                  <a
                    href={inspectingWinner.signed_proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-pine hover:underline inline-block mt-1"
                  >
                    Open Full Resolution in New Window ↗
                  </a>
                </div>
              ) : (
                <div className="py-8 text-xs text-ink-muted">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <span>No proof screenshot uploaded yet by subscriber.</span>
                </div>
              )}
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-semibold text-ink uppercase mb-1">
                Audit Feedback & Verification Notes
              </label>
              <textarea
                rows="2"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="e.g. Official scorecard dates match entered Stableford rounds..."
                className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-xs text-ink resize-none"
              />
            </div>

            {/* Verification Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-sage-light">
              <Button
                variant="danger"
                size="md"
                loading={actionLoading}
                onClick={() => handleVerify(inspectingWinner.id, 'rejected')}
                className="gap-1 text-xs"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Proof</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="md" onClick={() => setInspectingWinner(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={actionLoading}
                  onClick={() => handleVerify(inspectingWinner.id, 'verified')}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Verify Claim</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Payout Completion Modal */}
      {payoutWinner && (
        <Modal
          isOpen={!!payoutWinner}
          onClose={() => setPayoutWinner(null)}
          title="Confirm Payout Disbursement"
          subtitle={`Disbursing £${payoutWinner.prize_amount} to ${payoutWinner.profiles?.full_name}`}
        >
          <form onSubmit={handleMarkPayout} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase mb-1">
                Payment / Stripe Transfer Reference *
              </label>
              <input
                type="text"
                required
                value={payoutRef}
                onChange={(e) => setPayoutRef(e.target.value)}
                placeholder="e.g. STRIPE_TR_942817498"
                className="w-full px-4 py-3 rounded-2xl bg-canvas border border-sage/40 text-sm font-mono"
              />
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              💡 Marking this payout as paid will update the winner's dashboard and log the permanent audit reference.
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-sage-light">
              <Button variant="ghost" size="md" onClick={() => setPayoutWinner(null)}>Cancel</Button>
              <Button type="submit" variant="gold" size="md" loading={actionLoading} className="shadow-gold-glow">
                Complete Payout
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
