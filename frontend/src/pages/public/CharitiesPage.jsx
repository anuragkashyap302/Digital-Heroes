import React, { useState, useEffect } from 'react';
import { CharityCard } from '../../components/charity/CharityCard';
import { CharityFilter } from '../../components/charity/CharityFilter';
import { DonationModal } from '../../components/charity/DonationModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Heart, Coins } from 'lucide-react';

export const CharitiesPage = () => {
  const { user, updateCharityPreference } = useAuth();
  const notify = useNotification();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedDonationCharity, setSelectedDonationCharity] = useState(null);

  const fetchCharities = async () => {
    setLoading(true);
    try {
      let url = `/charities?category=${encodeURIComponent(selectedCategory)}&featured=${featuredOnly}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await api.get(url);
      setCharities(res.charities || []);
    } catch (err) {
      console.warn('Could not load charities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharities();
  }, [selectedCategory, featuredOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCharities();
  };

  const handleSelectCause = async (charity) => {
    if (!user) {
      notify.info('Please sign in or register to set this cause as your monthly draw charity.');
      return;
    }

    try {
      await updateCharityPreference(charity.id, user.charity_contribution_percent || 10.0);
      notify.success(`${charity.name} is now selected as your primary draw cause.`);
    } catch (err) {
      notify.error(err.message || 'Failed to update charity selection.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8 sm:py-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="pine" size="sm">Charity Directory & Impact</Badge>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Verified Philanthropic Causes
        </h1>
        <p className="text-base text-ink-muted leading-relaxed">
          Explore our vetted directory of youth empowerment, environmental conservation, veteran welfare, and health research charities.
        </p>
      </div>

      {/* Filter Component */}
      <CharityFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        featuredOnly={featuredOnly}
        onFeaturedToggle={setFeaturedOnly}
      />

      {/* Directory Content */}
      {loading ? (
        <LoadingSpinner message="Searching verified causes..." />
      ) : charities.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No Matching Charities Found"
          description="Try broadening your search query or selecting 'All' categories."
          actionText="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setFeaturedOnly(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {charities.map((charity) => (
            <CharityCard
              key={charity.id}
              charity={charity}
              isSelected={user?.selected_charity_id === charity.id}
              onSelect={handleSelectCause}
              onDonateDirect={(c) => setSelectedDonationCharity(c)}
            />
          ))}
        </div>
      )}

      {/* Direct Donation Modal */}
      {selectedDonationCharity && (
        <DonationModal
          isOpen={!!selectedDonationCharity}
          onClose={() => setSelectedDonationCharity(null)}
          charity={selectedDonationCharity}
        />
      )}

    </div>
  );
};
