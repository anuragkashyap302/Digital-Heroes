import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ShieldCheck, UserCheck, Key, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      notify.success(`Welcome back, ${user.full_name || 'Hero'}!`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      notify.error(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setLoading(true);
    try {
      const user = await login(demoEmail, 'Password123!');
      notify.success(`Logged in as demo ${user.role}: ${user.full_name}`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      notify.error(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-pine text-canvas flex items-center justify-center font-serif font-bold text-xl mx-auto shadow-soft">
          DH
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink">
          Sign In to Digital Heroes
        </h1>
        <p className="text-xs text-ink-muted">
          Access your golf scores, draw entries, and charity allocations.
        </p>
      </div>

      <Card className="p-8 shadow-soft-lg space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. hero@digitalheroes.io"
              className="w-full px-4 py-3 rounded-2xl bg-canvas border border-sage/40 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-canvas border border-sage/40 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine focus:bg-white"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full justify-center mt-2">
            Sign In
          </Button>
        </form>

        <div className="pt-4 border-t border-sage-light text-center text-xs text-ink-muted">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-pine hover:underline">
            Register as a Hero
          </Link>
        </div>

        {/* Quick Demo Accounts Helper */}
        <div className="pt-4 border-t border-sage-light space-y-3">
          <div className="text-center">
            <span className="text-[11px] font-bold text-ink uppercase tracking-wider block">
              ⚡ 1-Click Fast Login (Instant Testing)
            </span>
            <p className="text-[10px] text-ink-muted mt-0.5">Click either role below to test the platform instantly:</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('admin@digitalheroes.io')}
              className="flex items-start gap-2.5 p-2.5 rounded-xl border border-pine/30 bg-pine text-canvas hover:bg-pine-dark transition-all text-left group shadow-sm disabled:opacity-50"
            >
              <div className="w-7 h-7 rounded-lg bg-gold/20 text-gold flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-canvas flex items-center gap-1">
                  Admin Portal
                  <span className="text-[9px] bg-gold/30 text-gold-light px-1.5 py-0.2 rounded font-sans font-semibold">Admin</span>
                </div>
                <div className="text-[10px] text-canvas-muted">Draw Engine & Payouts</div>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('alexander@meridian.com')}
              className="flex items-start gap-2.5 p-2.5 rounded-xl border border-sage/60 bg-white hover:bg-canvas transition-all text-left group shadow-sm disabled:opacity-50"
            >
              <div className="w-7 h-7 rounded-lg bg-pine/10 text-pine flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-ink flex items-center gap-1">
                  Subscriber
                  <span className="text-[9px] bg-pine/10 text-pine px-1.5 py-0.2 rounded font-sans font-semibold">Player</span>
                </div>
                <div className="text-[10px] text-ink-muted">Scores & Prize Claims</div>
              </div>
            </button>
          </div>
        </div>
      </Card>

    </div>
  );
};
