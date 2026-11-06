import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BuildersPage } from './pages/BuildersPage';
import { SitesWorkPage } from './pages/SitesWorkPage';
import { AttendancePage } from './pages/AttendancePage';
import { WorkersPage } from './pages/WorkersPage';
import { AdvancesPage } from './pages/AdvancesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';

function AppContent() {
  const { currentUser, activeTab, setActiveTab } = useApp();
  const [slipWorkerId, setSlipWorkerId] = useState(null);
  const [advanceWorkerId, setAdvanceWorkerId] = useState(null);

  if (!currentUser) {
    return <LoginPage />;
  }

  const handleOpenSlip = (workerId) => {
    setSlipWorkerId(workerId);
  };

  const handleOpenAdvance = (workerId) => {
    setAdvanceWorkerId(workerId);
    setActiveTab('advances');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'builders' && <BuildersPage />}
          {activeTab === 'sites' && <SitesWorkPage />}
          {activeTab === 'attendance' && <AttendancePage />}
          {activeTab === 'workers' && (
            <WorkersPage
              onOpenAdvanceModal={handleOpenAdvance}
              onOpenSlipModal={handleOpenSlip}
            />
          )}
          {activeTab === 'advances' && (
            <AdvancesPage preselectedWorkerId={advanceWorkerId} />
          )}
          {activeTab === 'reports' && (
            <ReportsPage onOpenSlipModal={handleOpenSlip} />
          )}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* 58mm / 80mm Thermal & A4 Receipt Print Modal */}
      {slipWorkerId && (
        <ThermalReceiptModal
          workerId={slipWorkerId}
          onClose={() => setSlipWorkerId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
