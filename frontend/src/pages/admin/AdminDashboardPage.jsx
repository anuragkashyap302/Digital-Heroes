import React, { useState } from 'react';
import { UserManagementTab } from '../../components/admin/UserManagementTab';
import { DrawManagementTab } from '../../components/admin/DrawManagementTab';
import { CharityManagementTab } from '../../components/admin/CharityManagementTab';
import { WinnerManagementTab } from '../../components/admin/WinnerManagementTab';
import { ReportsAnalyticsTab } from '../../components/admin/ReportsAnalyticsTab';
import { Badge } from '../../components/common/Badge';
import { 
  Users, 
  Trophy, 
  Heart, 
  Award, 
  BarChart3, 
  ShieldCheck 
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('draws');

  const tabs = [
    { id: 'draws', label: 'Draw Engine Studio', icon: Trophy },
    { id: 'winners', label: 'Winner Verification', icon: Award },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'charities', label: 'Charity Management', icon: Heart },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-ink text-canvas rounded-3xl p-6 sm:p-8 border border-pine/30 shadow-soft-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-pine flex items-center justify-center font-bold text-gold-light text-xl shadow-soft">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                Administrator Command Center
              </h1>
              <Badge variant="gold" size="sm">Super Admin Privileges</Badge>
            </div>
            <p className="text-xs text-sage/80 mt-1">
              Server-verified administrative authorization active. All actions logged to immutable audit records.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-sage-light">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-pine text-canvas shadow-soft font-bold'
                  : 'bg-white text-ink-muted hover:text-ink hover:bg-canvas border border-sage/30'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gold-light' : 'text-ink-muted'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === 'draws' && <DrawManagementTab />}
        {activeTab === 'winners' && <WinnerManagementTab />}
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'charities' && <CharityManagementTab />}
        {activeTab === 'reports' && <ReportsAnalyticsTab />}
      </div>

    </div>
  );
};
