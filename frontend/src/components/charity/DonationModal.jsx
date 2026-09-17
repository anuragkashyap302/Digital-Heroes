import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Heart, Coins, CheckCircle2 } from 'lucide-react';

export const DonationModal = ({
  isOpen,
  onClose,
  charity = null
}) => {
  const notify = useNotification();
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const presets = [25, 50, 100, 250];

  const handleDonate = async (e) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

    if (isNaN(finalAmount) || finalAmount <= 0) {
      notify.error('Please specify a valid donation amount.');
      return;
    }

    if (!charity?.id) {
      notify.error('Please select a target charity.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/charities/${charity.id}/donate`, {
        amount: finalAmount,
        donorName: donorName || 'Philanthropic Supporter',
        donorEmail: donorEmail || 'supporter@digitalheroes.io'
      });

      if (res.url && !res.simulated) {
        window.location.href = res.url;
        return;
      }

      setSuccessData({
        amount: finalAmount,
        charityName: charity.name,
        donorName: donorName || 'Philanthropic Supporter'
      });
      notify.success(`Thank you! Your direct donation of £${finalAmount.toFixed(2)} was recorded.`);
    } catch (err) {
      notify.error(err.message || 'Failed to process donation.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSuccessData(null);
    setCustomAmount('');
    setSelectedAmount(50);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={successData ? "Donation Received" : `Direct Gift: ${charity?.name || 'Charity Impact'}`}
      subtitle={
        successData
          ? "Your generosity directly empowers transformative community initiatives."
          : "100% of independent donations flow directly to the designated cause with zero gameplay involvement."
      }
    >
      {successData ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="font-serif text-2xl font-bold text-ink">
            Thank You, {successData.donorName}!
          </h4>
          <p className="text-sm text-ink-muted max-w-sm mx-auto">
            Your generous gift of <strong className="text-pine font-bold">£{successData.amount.toFixed(2)}</strong> has been recorded for <strong>{successData.charityName}</strong>.
          </p>
          <div className="pt-4">
            <Button variant="primary" size="md" onClick={resetAndClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleDonate} className="space-y-6">
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Select Donation Amount
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {presets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-3 rounded-2xl text-sm font-serif font-bold transition-all ${
                    selectedAmount === amt && !customAmount
                      ? 'bg-pine text-canvas shadow-soft'
                      : 'bg-canvas text-ink hover:bg-sage-light border border-sage/40'
                  }`}
                >
                  £{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Or Enter Custom Amount (£ GBP)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-lg font-bold text-ink-muted">
                £
              </span>
              <input
                type="number"
                min="5"
                step="1"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(0);
                }}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-canvas border border-sage/40 text-ink font-serif text-lg font-bold focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white"
              />
            </div>
          </div>

          {/* Donor Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Eleanor Rigby"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Email for Tax Receipt (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. eleanor@meridian.com"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-sage-light flex items-center justify-end gap-3">
            <Button variant="ghost" size="md" onClick={resetAndClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="md" loading={loading} className="gap-2">
              <Coins className="w-4 h-4" />
              <span>Donate £{(customAmount ? parseFloat(customAmount) || 0 : selectedAmount).toFixed(2)}</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
