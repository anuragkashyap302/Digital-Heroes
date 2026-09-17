import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PercentageSlider } from '../../components/charity/PercentageSlider';
import { CharityCard } from '../../components/charity/CharityCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { Heart, Sparkles, Check, Globe } from 'lucide-react';

export const CharitySelectionPage = () => {
  const { user, selectedCharity, updateCharityPreference } = useAuth();
  const notify = useNotification();
  const [allCharities, setAllCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await api.get('/charities');
        setAllCharities(res.charities || []);
      } catch (err) {
        console.warn('Could not load charities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCharities();
  }, []);

  const handleSavePercentage = async (newPercentage) => {
    setSaving(true);
    try {
      await updateCharityPreference(user?.selected_charity_id, newPercentage);
      notify.success(`Charity contribution rate updated to ${newPercentage}%.`);
    } catch (err) {
      notify.error(err.message || 'Failed to update contribution rate.');
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchCharity = async (charity) => {
    try {
      await updateCharityPreference(charity.id, user?.charity_contribution_percent || 10.0);
      notify.success(`Switched primary draw beneficiary to ${charity.name}.`);
    } catch (err) {
      notify.error(err.message || 'Failed to switch charity.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-ink">
          Charity & Philanthropic Allocation
        </h2>
        <p className="text-xs text-ink-muted mt-1">
          Manage your designated beneficiary cause and voluntary contribution percentage.
        </p>
      </div>

      {/* Interactive Percentage Slider Component */}
      <PercentageSlider
        currentPercentage={parseFloat(user?.charity_contribution_percent) || 10.0}
        monthlyFee={29.00}
        onSave={handleSavePercentage}
        loading={saving}
      />

      {/* Currently Selected Cause Card */}
      {selectedCharity && (
        <Card className="p-6 sm:p-8 space-y-4 border-2 border-pine/40 bg-pine/5">
          <div className="flex items-center justify-between">
            <Badge variant="pine" size="sm">Active Selected Beneficiary</Badge>
            <span className="text-xs font-semibold text-pine-dark">Receives {user?.charity_contribution_percent || 10}% of fee</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-sage/40 shrink-0">
              <img src={selectedCharity.logo_url} alt={selectedCharity.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-ink">{selectedCharity.name}</h3>
              <p className="text-xs text-ink-muted mt-1 line-clamp-2">{selectedCharity.tagline || selectedCharity.description}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Switch Beneficiary Directory */}
      <div className="space-y-4 pt-4">
        <h3 className="font-serif text-2xl font-bold text-ink">
          Switch Your Primary Cause
        </h3>
        <p className="text-xs text-ink-muted">
          Select any charity below to switch your membership allocation for upcoming billing cycles.
        </p>

        {loading ? (
          <LoadingSpinner message="Loading causes..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCharities.map((charity) => (
              <CharityCard
                key={charity.id}
                charity={charity}
                isSelected={user?.selected_charity_id === charity.id}
                onSelect={handleSwitchCharity}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
