import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { DonationModal } from '../../components/charity/DonationModal';
import { api } from '../../services/api';
import { Heart, Coins, ShieldCheck, CheckCircle2, Sparkles, Building2 } from 'lucide-react';

export const StandaloneDonationPage = () => {
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await api.get('/charities');
        setCharities(res.charities || []);
        if (res.charities?.length > 0) setSelectedCharity(res.charities[0]);
      } catch (err) {
        console.warn('Failed to load charities for donation page:', err);
      }
    };
    fetchCharities();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8 sm:py-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <Badge variant="gold" size="sm">Direct Giving Portal</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Independent Charitable Giving
        </h1>
        <p className="text-base text-ink-muted leading-relaxed">
          Support any of our vetted partner charities with a standalone tax-deductible gift. 100% of your contribution flows directly to the cause, independent of platform gameplay or prize draws.
        </p>
      </div>

      {/* Main Form Card */}
      <Card className="p-8 sm:p-10 space-y-8 shadow-soft-lg">
        <div>
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-3">
            1. Select Beneficiary Charity
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {charities.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCharity(c)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedCharity?.id === c.id
                    ? 'border-pine bg-pine/5 ring-2 ring-pine/30 shadow-soft-sm'
                    : 'border-sage/40 bg-canvas/40 hover:bg-canvas'
                }`}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0 border border-sage/30">
                  <img src={c.logo_url} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-sm font-bold text-ink truncate">{c.name}</h4>
                  <span className="text-[11px] text-ink-muted">{c.category}</span>
                </div>
                {selectedCharity?.id === c.id && (
                  <CheckCircle2 className="w-5 h-5 text-pine shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-sage-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-ink-muted block">Selected Cause:</span>
            <span className="font-serif text-lg font-bold text-ink">
              {selectedCharity?.name || 'Please select a charity'}
            </span>
          </div>

          <Button
            variant="gold"
            size="lg"
            disabled={!selectedCharity}
            onClick={() => setModalOpen(true)}
            className="gap-2 shadow-gold-glow"
          >
            <Coins className="w-5 h-5" />
            <span>Proceed to Give</span>
          </Button>
        </div>
      </Card>

      {/* Donation Modal */}
      {selectedCharity && (
        <DonationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          charity={selectedCharity}
        />
      )}

    </div>
  );
};
