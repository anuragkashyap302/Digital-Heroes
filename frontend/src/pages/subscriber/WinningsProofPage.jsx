import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { 
  Trophy, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  FileCheck, 
  CreditCard 
} from 'lucide-react';

export const WinningsProofPage = () => {
  const notify = useNotification();
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingWinnerId, setUploadingWinnerId] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const fetchWinnings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/winners/my-winnings');
      setWinnings(res.winnings || []);
    } catch (err) {
      console.warn('Failed to load winnings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinnings();
  }, []);

  const handleFileUpload = async (winnerId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('proof', file);

    setUploadingWinnerId(winnerId);
    try {
      await api.post(`/winners/${winnerId}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notify.success('Scorecard proof uploaded! Under administrator review.');
      await fetchWinnings();
    } catch (err) {
      notify.error(err.message || 'Failed to upload proof.');
    } finally {
      setUploadingWinnerId(null);
    }
  };

  const getProofStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success" size="sm">Proof Verified</Badge>;
      case 'under_review':
        return <Badge variant="warning" size="sm">Under Admin Review</Badge>;
      case 'rejected':
        return <Badge variant="danger" size="sm">Proof Rejected</Badge>;
      default:
        return <Badge variant="gold" size="sm">Upload Required</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-ink">
          Winnings & Scorecard Verification
        </h2>
        <p className="text-xs text-ink-muted mt-1">
          Upload official scorecard proof to verify your winning draw entries and track payout disbursements.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching winning records..." />
      ) : winnings.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No Winning Draws Yet"
          description="Keep recording your Stableford scores to enter all upcoming monthly cash prize draws!"
        />
      ) : (
        <div className="space-y-6">
          {winnings.map((win) => {
            const draw = win.draws || {};
            const isVerified = win.proof_status === 'verified';
            const isPaid = win.payout_status === 'paid';
            const isUnderReview = win.proof_status === 'under_review';
            const isPendingUpload = win.proof_status === 'pending_upload';

            return (
              <Card key={win.id} className="p-8 space-y-6">
                
                {/* Header Title & Prize */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sage-light">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                      <Trophy className="w-6 h-6 text-gold-dark" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-serif text-2xl font-bold text-ink">
                          {draw.name || `Draw #${draw.draw_number}`}
                        </h3>
                        <Badge variant="tier5" size="sm">
                          {win.tier.replace('_', ' ').toUpperCase()} ({win.match_count}-Match)
                        </Badge>
                      </div>
                      <span className="text-xs text-ink-muted block mt-0.5">
                        Claim ID: <code className="text-pine font-mono text-[11px]">{win.id}</code>
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Prize Won</span>
                    <span className="font-serif text-3xl font-bold text-emerald-900">
                      £{parseFloat(win.prize_amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Status Pipelines Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Proof Verification Status */}
                  <div className="p-5 rounded-2xl bg-canvas/60 border border-sage/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink uppercase tracking-wider">Verification Status</span>
                      {getProofStatusBadge(win.proof_status)}
                    </div>
                    <p className="text-xs text-ink-muted">
                      {isVerified
                        ? 'Your scorecard proof has been reviewed and verified by an administrator.'
                        : isUnderReview
                        ? 'Your uploaded scorecard proof is currently under review by administrators.'
                        : win.proof_status === 'rejected'
                        ? `Rejected: ${win.admin_notes || 'Scorecard did not match recorded date/points.'}`
                        : 'Please upload a photo of your scorecard or club handicap handicap record.'}
                    </p>
                  </div>

                  {/* Payout Status */}
                  <div className="p-5 rounded-2xl bg-canvas/60 border border-sage/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink uppercase tracking-wider">Payout Disbursement</span>
                      <Badge variant={isPaid ? 'success' : 'warning'} size="sm">
                        {isPaid ? 'Paid & Disbursed' : 'Pending Verification / Processing'}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-muted">
                      {isPaid
                        ? `Remitted via Stripe. Ref: ${win.payout_reference || 'N/A'}`
                        : 'Payouts are executed immediately once proof verification is approved.'}
                    </p>
                  </div>

                </div>

                {/* Upload or View Proof Action Bar */}
                <div className="pt-4 border-t border-sage-light flex flex-wrap items-center justify-between gap-4">
                  
                  {win.signed_proof_url ? (
                    <div className="flex items-center gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPreviewImageUrl(win.signed_proof_url)}
                        className="gap-1.5 text-xs"
                      >
                        <Eye className="w-4 h-4 text-pine" />
                        <span>View Submitted Proof</span>
                      </Button>
                      <span className="text-xs text-ink-muted">
                        Submitted: {win.proof_submitted_at ? new Date(win.proof_submitted_at).toLocaleDateString('en-GB') : 'Recently'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-800">
                      <AlertCircle className="w-4 h-4" />
                      <span>Upload official scorecard photo/PDF to claim payout.</span>
                    </div>
                  )}

                  {/* Upload button */}
                  {!isVerified && !isPaid && (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(win.id, file);
                        }}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        loading={uploadingWinnerId === win.id}
                        className="gap-1.5 text-xs pointer-events-none"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{win.signed_proof_url ? 'Re-upload Proof' : 'Upload Scorecard Photo'}</span>
                      </Button>
                    </label>
                  )}

                </div>

              </Card>
            );
          })}
        </div>
      )}

      {/* Proof Lightbox Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl p-4 overflow-hidden shadow-soft-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-sage-light">
              <span className="text-xs font-bold text-ink uppercase">Scorecard Proof Lightbox</span>
              <button onClick={() => setPreviewImageUrl(null)} className="text-xs font-bold text-rose-700">Close (✕)</button>
            </div>
            <img src={previewImageUrl} alt="Scorecard Proof" className="max-h-[70vh] w-auto object-contain rounded-2xl mx-auto" />
          </div>
        </div>
      )}

    </div>
  );
};
