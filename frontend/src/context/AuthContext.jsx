import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dh_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('dh_token'));
  const [subscription, setSubscription] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('dh_token');
    if (!currentToken) {
      setUser(null);
      setSubscription(null);
      setSelectedCharity(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res && res.success && res.user) {
        setUser(res.user);
        setSubscription(res.subscription || null);
        setSelectedCharity(res.selectedCharity || null);
        localStorage.setItem('dh_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.warn('Could not refresh session:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.user) {
      localStorage.setItem('dh_token', res.token);
      localStorage.setItem('dh_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      // Background sync without blocking navigation
      refreshUser().catch(() => {});
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.user) {
      localStorage.setItem('dh_token', res.token);
      localStorage.setItem('dh_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      // Background sync without blocking navigation
      refreshUser().catch(() => {});
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('dh_token');
    localStorage.removeItem('dh_user');
    setToken(null);
    setUser(null);
    setSubscription(null);
    setSelectedCharity(null);
  };

  const updateCharityPreference = async (selected_charity_id, charity_contribution_percent) => {
    const res = await api.put('/auth/charity-preference', {
      selected_charity_id,
      charity_contribution_percent
    });
    if (res.success) {
      await refreshUser();
      return res.user;
    }
    throw new Error(res.message || 'Failed to update charity preference');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        subscription,
        selectedCharity,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isSubscriber: user?.role === 'subscriber' || user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser,
        updateCharityPreference
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
