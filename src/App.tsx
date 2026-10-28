/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { OverviewKPI } from './components/dashboard/OverviewKPI';
import { KepalaSekolahDashboard } from './components/roles/KepalaSekolahDashboard';
import { GuruDashboard } from './components/roles/GuruDashboard';
import { MuridDashboard } from './components/roles/MuridDashboard';
import { YayasanDashboard } from './components/roles/YayasanDashboard';
import { Sparkles, ShieldCheck } from 'lucide-react';

function DashboardContent() {
  const { currentUser } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('siswa');

  // Sync default tab if currentUser role changes and current tab is not applicable
  React.useEffect(() => {
    if (currentUser.role === 'yayasan') {
      if (!['laporan', 'users', 'siswa', 'jadwal'].includes(currentTab)) {
        setCurrentTab('laporan');
      }
    } else if (currentUser.role === 'kepala_sekolah') {
      if (!['siswa', 'jadwal', 'pengganti', 'laporan'].includes(currentTab)) {
        setCurrentTab('siswa');
      }
    } else if (currentUser.role === 'guru') {
      if (!['jadwal_mengajar', 'absensi_input', 'izin_guru', 'riwayat_catatan'].includes(currentTab)) {
        setCurrentTab('jadwal_mengajar');
      }
    } else if (currentUser.role === 'murid') {
      if (!['wali_jadwal', 'wali_perkembangan'].includes(currentTab)) {
        setCurrentTab('wali_jadwal');
      }
    }
  }, [currentUser.role]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar with Role Switcher */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Real-time KPI Summary (Visible on standard dashboard views, hidden when printing) */}
        {currentTab !== 'laporan' && <OverviewKPI />}

        {/* Dynamic Role Views */}
        {currentUser.role === 'yayasan' && (
          <div>
            {currentTab === 'laporan' || currentTab === 'users' ? (
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
            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              T
            </div>
            <span>
              <strong>TERAPINA</strong> · Sistem Manajemen Penjadwalan & Absensi Terapi Siswa
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Hierarki Hak Akses Ketat (4 Role)
            </span>
            <span>·</span>
            <span>Klinik Inklusi & Tumbuh Kembang</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
