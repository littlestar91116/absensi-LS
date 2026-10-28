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
import { ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';
import { User, UserRole } from './types';

interface AuthenticatedDashboardProps {
  currentUser: User;
}

const ALLOWED_TABS_BY_ROLE: Record<UserRole, string[]> = {
  yayasan: ['laporan', 'users', 'hak_akses', 'siswa', 'jadwal'],
  kepala_sekolah: ['siswa', 'jadwal', 'pengganti', 'laporan'],
  guru: ['jadwal_mengajar', 'absensi_input', 'izin_guru', 'riwayat_catatan'],
  murid: ['wali_jadwal', 'wali_perkembangan']
};

const DEFAULT_TAB_BY_ROLE: Record<UserRole, string> = {
  yayasan: 'laporan',
  kepala_sekolah: 'siswa',
  guru: 'jadwal_mengajar',
  murid: 'wali_jadwal'
};

function AuthenticatedDashboard({ currentUser }: AuthenticatedDashboardProps) {
  const { hasPermission } = useApp();
  
  // Set initial tab based on role
  const [currentTab, setCurrentTab] = useState<string>(() => {
    return DEFAULT_TAB_BY_ROLE[currentUser.role] || 'siswa';
  });

  // Sync default tab if currentUser changes
  useEffect(() => {
    setCurrentTab(DEFAULT_TAB_BY_ROLE[currentUser.role] || 'siswa');
  }, [currentUser.id, currentUser.role]);

  // Check role authorization for the current active tab
  const isAuthorizedTab = ALLOWED_TABS_BY_ROLE[currentUser.role]?.includes(currentTab);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar with Role Switcher & Logout */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Real-time KPI Summary (Visible on standard dashboard views, hidden when printing or if role doesn't have permission) */}
        {isAuthorizedTab && currentTab !== 'laporan' && hasPermission('perm_kpi') && <OverviewKPI />}

        {/* Unauthorized Access Fallback (Scenario 11 Guard) */}
        {!isAuthorizedTab ? (
          <div className="max-w-xl mx-auto my-12 bg-white border border-rose-200 rounded-2xl p-8 shadow-xl text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <span className="inline-block px-3 py-1 bg-rose-50 text-rose-700 text-xs font-mono font-bold rounded-full mb-3 border border-rose-200">
              HTTP 403 · AKSES DITOLAK
            </span>
            <h2 className="text-xl font-black text-slate-900 mb-2">
              Tidak Memiliki Izin Otorisasi
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Akun Anda dengan peran <strong>{currentUser.title}</strong> (<code>{currentUser.role}</code>) tidak diberikan wewenang untuk membuka modul <strong>"{currentTab}"</strong>. Little Star Learning Center menerapkan sistem kontrol akses berbasis peran (RBAC) yang ketat demi menjaga kerahasiaan data siswa dan rekam medis.
            </p>
            <button
              onClick={() => setCurrentTab(DEFAULT_TAB_BY_ROLE[currentUser.role])}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda Resmi ({DEFAULT_TAB_BY_ROLE[currentUser.role]})</span>
            </button>
          </div>
        ) : (
          /* Authorized Dynamic Role Views */
          <div>
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
          </div>
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
