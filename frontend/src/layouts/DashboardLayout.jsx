import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { 
  LayoutDashboard, 
  Target, 
  Heart, 
  Trophy, 
  Award, 
  CreditCard, 
  LogOut, 
  User, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, subscription, selectedCharity, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'My 5-Score Queue', path: '/dashboard/scores', icon: Target },
    { name: 'Charity Allocation', path: '/dashboard/charity', icon: Heart },
    { name: 'Draw History', path: '/dashboard/draws', icon: Trophy },
    { name: 'Winnings & Verification', path: '/dashboard/winnings', icon: Award },
    { name: 'Membership & Billing', path: '/dashboard/billing', icon: CreditCard }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isSubActive = subscription?.status !== 'canceled' && subscription?.status !== 'lapsed';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      
      {/* Top Banner Status Bar */}
      <div className="bg-white rounded-3xl p-6 border border-sage/30 shadow-soft mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-pine text-canvas flex items-center justify-center font-serif font-bold text-xl shadow-soft">
            {user?.full_name?.charAt(0) || 'H'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-ink">
                {user?.full_name || 'Subscriber'}
              </h1>
              <Badge variant={user?.role === 'admin' ? 'dark' : 'pine'} size="sm">
                {user?.role === 'admin' ? 'Administrator' : 'Subscriber Hero'}
              </Badge>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Handicap: <strong className="text-pine-dark">{user?.handicap || 18.0}</strong> • Charity: <strong className="text-pine-dark">{selectedCharity?.name || 'Selected Cause'}</strong> ({user?.charity_contribution_percent || 10}%)
            </p>
          </div>
        </div>

        {/* Subscription Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-ink-muted block">Subscription Status</span>
            <span className="text-xs font-bold text-ink">
              {isSubActive ? 'Active Hero Membership' : 'Subscription Lapsed'}
            </span>
          </div>
          <Badge variant={isSubActive ? 'success' : 'danger'} size="md">
            {isSubActive ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-sage/30 shadow-soft space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-pine text-canvas shadow-soft'
                        : 'text-ink-muted hover:text-ink hover:bg-canvas'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </NavLink>
              );
            })}

            {isAdmin && (
              <div className="pt-2 border-t border-sage-light mt-2">
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-gold-dark" />
                  <span>Admin Command Center</span>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors shadow-soft"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Page Main View */}
        <main className="lg:col-span-9 space-y-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
};
