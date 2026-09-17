import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { Badge } from './Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  HeartHandshake, 
  Sparkles, 
  ShieldCheck, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard,
  Coins
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Charities', path: '/charities' },
    { name: 'Prize Draws', path: '/draws' },
    { name: 'Transparency', path: '/rules' },
    { name: 'Membership', path: '/pricing' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-canvas/85 backdrop-blur-md border-b border-sage/25 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-pine flex items-center justify-center text-canvas shadow-soft group-hover:scale-105 group-hover:shadow-pine-glow transition-all">
              <span className="font-serif font-bold text-xl tracking-tight text-gold-light">DH</span>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-ink block leading-none">
                DIGITAL <span className="font-editorial-italic font-normal text-pine">HEROES</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-gold-dark block mt-1">
                Golf • Draws • Impact
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-pine ${
                    isActive ? 'text-pine font-semibold border-b-2 border-pine pb-1' : 'text-ink-muted'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right CTA Area */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/donate">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-ink-muted hover:text-pine">
                <Coins className="w-4 h-4 text-gold" />
                <span>Direct Donate</span>
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <Link to="/admin">
                    <Button variant="pineDark" size="sm" className="gap-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-gold-light" />
                      <span>Admin Center</span>
                    </Button>
                  </Link>
                ) : null}

                <Link to="/dashboard">
                  <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </Button>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-ink-muted hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="shadow-soft">
                    Join as Hero
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-white border border-sage/30 text-ink hover:bg-sage-light transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-sage/30 px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-base font-medium py-2 transition-colors ${
                      isActive ? 'text-pine font-bold' : 'text-ink-muted'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <div className="pt-4 border-t border-sage-light flex flex-col gap-3">
                <Link to="/donate" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full justify-center gap-2">
                    <Coins className="w-4 h-4 text-gold" />
                    <span>Direct Philanthropic Donation</span>
                  </Button>
                </Link>

                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="pineDark" size="md" className="w-full justify-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-gold-light" />
                          <span>Admin Command Center</span>
                        </Button>
                      </Link>
                    )}
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="md" className="w-full justify-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Subscriber Dashboard</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="md" onClick={handleLogout} className="w-full justify-center text-rose-700">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="md" className="w-full justify-center">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="md" className="w-full justify-center">
                        Join Platform
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
