import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { CharitiesPage } from '../pages/public/CharitiesPage';
import { CharityDetailPage } from '../pages/public/CharityDetailPage';
import { RulesDrawTransparencyPage } from '../pages/public/RulesDrawTransparencyPage';
import { DrawsArchivePage } from '../pages/public/DrawsArchivePage';
import { PricingPage } from '../pages/public/PricingPage';
import { StandaloneDonationPage } from '../pages/public/StandaloneDonationPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Subscriber Dashboard Pages
import { DashboardOverview } from '../pages/subscriber/DashboardOverview';
import { ScoresManagementPage } from '../pages/subscriber/ScoresManagementPage';
import { CharitySelectionPage } from '../pages/subscriber/CharitySelectionPage';
import { DrawHistoryPage } from '../pages/subscriber/DrawHistoryPage';
import { WinningsProofPage } from '../pages/subscriber/WinningsProofPage';
import { SubscriptionBillingPage } from '../pages/subscriber/SubscriptionBillingPage';

// Admin Command Center
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

export const AppRouter = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/charities" element={<CharitiesPage />} />
        <Route path="/charities/:slug" element={<CharityDetailPage />} />
        <Route path="/rules" element={<RulesDrawTransparencyPage />} />
        <Route path="/draws" element={<DrawsArchivePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/donate" element={<StandaloneDonationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Subscriber Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="scores" element={<ScoresManagementPage />} />
          <Route path="charity" element={<CharitySelectionPage />} />
          <Route path="draws" element={<DrawHistoryPage />} />
          <Route path="winnings" element={<WinningsProofPage />} />
          <Route path="billing" element={<SubscriptionBillingPage />} />
        </Route>

        {/* Admin Command Center */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
