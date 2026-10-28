/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Navbar } from './components/layout/Navbar';
import { OverviewKPI } from './components/dashboard/OverviewKPI';
import { KepalaSekolahDashboard } from './components/roles/KepalaSekolahDashboard';
import { GuruDashboard } from './components/roles/GuruDashboard';
import { MuridDashboard } from './components/roles/MuridDashboard';
import { YayasanDashboard } from './components/roles/YayasanDashboard';
import { ShieldCheck } from 'lucide-react';
import { User } from './types';

interface AuthenticatedDashboardProps {
  currentUser: User;
}

function AuthenticatedDashboard({ currentUser }: AuthenticatedDashboardProps) {
  const { hasPermission } = useApp();
  
  // Set initial tab based on role
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (currentUser.role === 'yayasan') return 'laporan';
    if (currentUser.role === 'guru') return 'jadwal_mengajar';
    if (currentUser.role === 'murid') return 'wali_jadwal';
    return 'siswa';
  });

  // Sync default tab if currentUser changes
  useEffect(() => {
    if (currentUser.role === 'yayasan') {
      setCurrentTab('laporan');
    } else if (currentUser.role === 'kepala_sekolah') {
      setCurrentTab('siswa');
    } else if (currentUser.role === 'guru') {
      setCurrentTab('jadwal_mengajar');
    } else if (currentUser.role === 'murid') {
      setCurrentTab('wali_jadwal');
    }
  }, [currentUser.id, currentUser.role]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar with Role Switcher & Logout */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Real-time KPI Summary (Visible on standard dashboard views, hidden when printing or if role doesn't have permission) */}
        {currentTab !== 'laporan' && hasPermission('perm_kpi') && <OverviewKPI />}

        {/* Dynamic Role Views */}
        {currentUser.role === 'yayasan' && (
          <div>
            {currentTab === 'laporan' || currentTab === 'users' || currentTab === 'hak_akses' ? (
              <YayasanDashboard activeTab={currentTab} />
            ) : (
              <KepalaSekolahDashboard activeTab={currentTab} />
            )}
          </div>
        )}

        {currentUser.role === 'kepala_sekolah' && (
          <div>
            {currentTab === 'laporan' ? (
              <YayasanDashboard activeTab={currentTab} />
            ) : (
              <KepalaSekolahDashboard activeTab={currentTab} />
            )}
          </div>
        )}

        {currentUser.role === 'guru' && (
          <GuruDashboard activeTab={currentTab} />
        )}

        {currentUser.role === 'murid' && (
          <MuridDashboard activeTab={currentTab} />
        )}

      </main>

      {/* Footer (Hidden during printing) */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/aistudio/Desain_tanpa_judul_20250712_130635_0000__1__c8a27306.png" 
              alt="Logo Little Star"
              className="h-6 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <span>
              <strong>Little Star Learning Center</strong> · Sistem Manajemen Penjadwalan & Absensi Terapi Siswa
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Hak Akses Akun & Otorisasi Bertingkat
            </span>
            <span>·</span>
            <span>Klinik Inklusi & Tumbuh Kembang</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MainApp() {
  const { currentUser } = useApp();

  // If not authenticated, render Login Screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Once authenticated, mount Dashboard with unconditional hooks
  return <AuthenticatedDashboard currentUser={currentUser} />;
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
