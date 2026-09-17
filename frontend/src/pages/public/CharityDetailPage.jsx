import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DonationModal } from '../../components/charity/DonationModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Heart, 
  Globe, 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  Coins, 
  Check, 
  Sparkles,
  Share2
} from 'lucide-react';

export const CharityDetailPage = () => {
  const { slug } = useParams();
  const { user, updateCharityPreference } = useAuth();
  const notify = useNotification();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  useEffect(() => {
    const fetchCharity = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/charities/${slug}`);
        setCharity(res.charity);
      } catch (err) {
        notify.error('Charity details could not be found.');
      } finally {
        setLoading(false);
      }
    };
    fetchCharity();
  }, [slug]);

  const handleSelectCause = async () => {
    if (!user) {
      notify.info('Please sign in or register to select this cause.');
      return;
    }
    try {
      await updateCharityPreference(charity.id, user.charity_contribution_percent || 10.0);
      notify.success(`${charity.name} is now your active monthly draw charity!`);
    } catch (err) {
      notify.error(err.message || 'Failed to select charity.');
    }
  };

  if (loading) return <LoadingSpinner fullScreen={true} message="Loading charity profile..." />;
  if (!charity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-ink">Cause Not Found</h2>
        <p className="text-sm text-ink-muted">The requested charitable cause does not exist or has been updated.</p>
        <Link to="/charities"><Button variant="primary">Return to Causes Directory</Button></Link>
      </div>
    );
  }

  const isSelected = user?.selected_charity_id === charity.id;
  const events = Array.isArray(charity.upcoming_events) ? charity.upcoming_events : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8 sm:py-12">
      
      {/* Back Link */}
      <Link to="/charities" className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-pine transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Charities</span>
      </Link>

      {/* Hero Banner Card */}
      <div className="rounded-4xl overflow-hidden bg-white border border-sage/30 shadow-soft-lg">
        <div className="relative h-64 sm:h-80 w-full bg-sage-light">
          <img
            src={charity.banner_url || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80'}
            alt={charity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />

          {charity.is_featured && (
            <div className="absolute top-6 right-6">
              <Badge variant="gold" size="md">Featured Champion Cause</Badge>
            </div>
          )}

          {/* Logo & Headline Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-canvas">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-4 border-white shadow-soft-lg bg-white shrink-0">
                <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-bold text-gold-light uppercase tracking-wider block">
                  {charity.category}
                </span>
                <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  {charity.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={isSelected ? 'secondary' : 'primary'}
                size="md"
                onClick={handleSelectCause}
                className="gap-2"
              >
                {isSelected ? (
                  <>
                    <Check className="w-4 h-4 text-pine" />
                    <span>Selected for Draw</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>Select for Monthly Draw</span>
                  </>
                )}
              </Button>

              <Button
                variant="gold"
                size="md"
                onClick={() => setDonationModalOpen(true)}
                className="gap-2 shadow-gold-glow"
              >
                <Coins className="w-4 h-4" />
                <span>Direct Give</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="p-6 sm:p-8 bg-canvas/60 border-t border-sage-light grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div>
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">Total Raised Through Platform</span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-pine block mt-1">
              £{parseFloat(charity.total_raised || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">Official Website</span>
            <a
              href={charity.website_url || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-pine hover:text-pine-dark mt-2"
            >
              <span>Visit Organization</span>
              <Globe className="w-3.5 h-3.5" />
            </a>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">Charity Status</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mt-1.5">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Verified 501(c)(3) / Registered Trust</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Mission & Story */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="p-8 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-ink">
              About the Mission
            </h3>
            <p className="text-sm sm:text-base text-ink leading-relaxed whitespace-pre-line">
              {charity.description}
            </p>
          </Card>

          {/* Upcoming Events */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-ink">
              Upcoming Fundraising & Community Events
            </h3>

            {events.length === 0 ? (
              <Card className="p-6 text-center text-xs text-ink-muted">
                No active calendar events posted for this charity at this time.
              </Card>
            ) : (
              <div className="space-y-4">
                {events.map((ev, i) => (
                  <Card key={i} className="p-6 space-y-2 hover:shadow-soft transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-serif text-lg font-bold text-ink">
                        {ev.title}
                      </h4>
                      <span className="text-xs font-semibold text-pine bg-pine/10 px-3 py-1 rounded-full w-fit">
                        {ev.date}
                      </span>
                    </div>

                    <p className="text-xs text-ink-muted leading-relaxed">
                      {ev.description}
                    </p>

                    {ev.location && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-soft pt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                        <span>{ev.location}</span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Direct Giving Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card variant="ivory" className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <Badge variant="gold" size="sm">Direct Philanthropy</Badge>
              <h4 className="font-serif text-xl font-bold text-ink">
                Support {charity.name} Directly
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Want to make a standalone contribution independent of the monthly prize draw? 100% of direct gifts are remitted to the charity.
              </p>
            </div>

            <Button
              variant="gold"
              size="lg"
              onClick={() => setDonationModalOpen(true)}
              className="w-full justify-center gap-2 shadow-gold-glow"
            >
              <Coins className="w-4 h-4" />
              <span>Make a Direct Gift</span>
            </Button>
          </Card>
        </div>

      </div>

      {/* Direct Donation Modal */}
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        charity={charity}
      />

    </div>
  );
};
