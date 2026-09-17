import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { Heart, Sparkles, User, Mail, Lock, Award } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handicap, setHandicap] = useState(14.0);
  const [charities, setCharities] = useState([]);
  const [selectedCharityId, setSelectedCharityId] = useState('');
  const [charityPercent, setCharityPercent] = useState(15.0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await api.get('/charities');
        setCharities(res.charities || []);
        if (res.charities?.length > 0) {
          setSelectedCharityId(res.charities[0].id);
        }
      } catch (err) {
        console.warn('Could not load charities for registration:', err);
      }
    };
    fetchCharities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(charityPercent) < 10.0) {
      notify.error('Charity contribution percentage must be at least 10%.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        full_name: fullName,
        email,
        password,
        handicap: parseFloat(handicap) || 18.0,
        selected_charity_id: selectedCharityId,
        charity_contribution_percent: parseFloat(charityPercent)
      });

      notify.success(`Welcome to Digital Heroes, ${user.full_name}!`);
      navigate('/dashboard');
    } catch (err) {
      notify.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-8">
      
      <div className="text-center space-y-2">
        <Badge variant="gold" size="sm">Hero Membership</Badge>
        <h1 className="font-serif text-3xl font-bold text-ink">
          Join Digital Heroes
        </h1>
        <p className="text-xs text-ink-muted">
          Turn your Stableford scores into monthly draws while supporting verified charities.
        </p>
      </div>

      <Card className="p-8 shadow-soft-lg space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jordan Spieth"
              className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jordan@heroes.com"
              className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Password (min 6 characters) *
            </label>
            <input
              type="password"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Current Golf Handicap (Index)
            </label>
            <input
              type="number"
              step="0.1"
              min="-10"
              max="54"
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
              placeholder="e.g. 14.5"
              className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white"
            />
          </div>

          {/* Charity Selection */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Primary Charity Beneficiary *
            </label>
            <select
              value={selectedCharityId}
              onChange={(e) => setSelectedCharityId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-canvas border border-sage/40 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white"
            >
              {charities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* Charity Contribution Percentage Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-ink mb-1.5">
              <span>Charity Contribution Rate *</span>
              <span className="text-pine font-bold">{charityPercent}% (Min 10%)</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={charityPercent}
              onChange={(e) => setCharityPercent(parseFloat(e.target.value))}
              className="w-full h-2 bg-sage-light rounded-lg appearance-none cursor-pointer accent-pine"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full justify-center mt-2">
            Create Account & Enter Platform
          </Button>
        </form>

        <div className="pt-4 border-t border-sage-light text-center text-xs text-ink-muted">
          <span>Already a member? </span>
          <Link to="/login" className="font-bold text-pine hover:underline">
            Sign In Here
          </Link>
        </div>
      </Card>

    </div>
  );
};
