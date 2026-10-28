import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Building2, 
  GraduationCap, 
  UserCheck, 
  HeartHandshake, 
  ShieldCheck, 
  Menu, 
  X,
  Info,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, logout, hasPermission } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  if (!currentUser) return null;

  const roleLabels: Record<UserRole, { label: string; badge: string; icon: React.ReactNode; color: string }> = {
    yayasan: {
      label: 'Yayasan (Super Admin)',
      badge: 'Super Admin',
      icon: <Building2 className="w-3.5 h-3.5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
    },
    kepala_sekolah: {
      label: 'Kepala Sekolah',
      badge: 'Admin Operasional',
      icon: <GraduationCap className="w-3.5 h-3.5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    guru: {
      label: 'Guru / Terapis',
      badge: 'Tenaga Klinis',
      icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    },
    murid: {
      label: 'Murid / Wali Murid',
      badge: 'Read-Only',
      icon: <HeartHandshake className="w-3.5 h-3.5 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-200 text-cyan-700'
    }
  };

  // Base tabs per role paired with permission keys
  const roleTabsConfig: Record<UserRole, Array<{ id: string; label: string; permKey: string }>> = {
    yayasan: [
      { id: 'laporan', label: 'Laporan & Cetak Absensi', permKey: 'perm_laporan' },
      { id: 'users', label: 'Kelola Akun & Freeze', permKey: 'perm_users' },
      { id: 'hak_akses', label: 'Hak Akses Tampilan', permKey: 'perm_hak_akses' },
      { id: 'siswa', label: 'Data Siswa', permKey: 'perm_siswa' },
      { id: 'jadwal', label: 'Jadwal & Persetujuan', permKey: 'perm_jadwal' }
    ],
    kepala_sekolah: [
      { id: 'siswa', label: 'Data Siswa', permKey: 'perm_siswa' },
      { id: 'jadwal', label: 'Atur Jadwal (Izin Yayasan)', permKey: 'perm_jadwal' },
      { id: 'pengganti', label: 'Penugasan Pengganti', permKey: 'perm_pengganti' },
      { id: 'laporan', label: 'Rekap Absensi', permKey: 'perm_laporan' }
    ],
    guru: [
      { id: 'jadwal_mengajar', label: 'Jadwal Terapi', permKey: 'perm_jadwal_mengajar' },
      { id: 'absensi_input', label: 'Input Absensi & Catatan', permKey: 'perm_absensi_input' },
      { id: 'izin_guru', label: 'Pengajuan Izin Sesi', permKey: 'perm_izin_guru' },
      { id: 'riwayat_catatan', label: 'Riwayat Evaluasi', permKey: 'perm_absensi_input' }
    ],
    murid: [
      { id: 'wali_jadwal', label: 'Jadwal Terapi Anak', permKey: 'perm_wali_jadwal' },
      { id: 'wali_perkembangan', label: 'Catatan Perkembangan & PR', permKey: 'perm_wali_evaluasi' }
    ]
  };

  // Filter tabs dynamically based on Super Admin configured View Permissions
  const availableTabs = roleTabsConfig[currentUser.role]?.filter(
    tab => hasPermission(tab.permKey)
  ) || [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Zone with Official Little Star Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-auto flex items-center justify-center">
              <img 
                src="/assets/aistudio/Desain_tanpa_judul_20250712_130635_0000__1__c8a27306.png" 
                alt="Logo Little Star"
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-blue-900 leading-tight">
                  Little Star
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Learning Center
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                Sistem Penjadwalan & Absensi Terapi Siswa
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  currentTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Action Zone: Active Account Profile & Logout (No Quick Switch for Outsiders) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Super Admin Shortcut to View Permissions */}
            {currentUser.role === 'yayasan' && (
              <button
                onClick={() => setCurrentTab('hak_akses')}
                title="Kelola Matriks Hak Akses Website"
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-semibold transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Hak Akses Tampilan</span>
              </button>
            )}

            {/* Role Info Quick Button */}
            <button
              onClick={() => setShowRoleInfo(!showRoleInfo)}
              title="Informasi Hak Akses Role"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Authenticated User Badge & Profile */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs ${currentUser.avatarColor}`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {currentUser.name.split(',')[0]}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${roleLabels[currentUser.role].color}`}>
                    {roleLabels[currentUser.role].badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                  {currentUser.email}
                </div>
              </div>
            </div>

            {/* Direct Logout Button */}
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin keluar dari sistem Little Star Learning Center?')) {
                  logout();
                }
              }}
              title="Keluar dari Akun (Logout)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-1">
            <div className="px-3 py-1 text-xs font-semibold text-slate-500">
              Menu Navigasi ({roleLabels[currentUser.role].label})
            </div>
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-sm rounded-lg transition-colors ${
                  currentTab === tab.id
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-100 px-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun (Logout)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Access Information Modal */}
      {showRoleInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Hierarki & Hak Akses Little Star</h3>
              </div>
              <button 
                onClick={() => setShowRoleInfo(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <p className="font-semibold text-indigo-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  1. Yayasan (Super Admin)
                </p>
                <p className="mt-1 text-indigo-800">
                  Akses penuh. Mengatur hak akses tampilan website untuk setiap role, menambah/mengedit/menghapus/<strong>membekukan (freeze) akun</strong> pengguna, serta menyetujui perubahan jadwal murid & guru dari Kepala Sekolah.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                <p className="font-semibold text-blue-900 text-sm flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  2. Kepala Sekolah (Admin Operasional)
                </p>
                <p className="mt-1 text-blue-800">
                  Mengelola data siswa (aktif/freeze). <strong>Dapat merubah jadwal murid dan guru dengan persetujuan Super Admin / Yayasan</strong>. Menunjuk guru pengganti jika terapis izin.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <p className="font-semibold text-emerald-900 text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  3. Guru / Terapis
                </p>
                <p className="mt-1 text-emerald-800">
                  Melihat jadwal mengajar (termasuk badge kuning jika menjadi guru pengganti), input absensi & catatan klinis perkembangan anak, serta mengajukan izin sesi.
                </p>
              </div>

              <div className="p-3 bg-cyan-50/70 border border-cyan-100 rounded-xl">
                <p className="font-semibold text-cyan-900 text-sm flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-cyan-600" />
                  4. Murid / Wali Murid (Strict Read-Only)
                </p>
                <p className="mt-1 text-cyan-800">
                  Hanya bisa melihat jadwal terapi ananda dan riwayat evaluasi klinis serta PR stimulasi rumah tanpa hak merubah data.
                </p>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowRoleInfo(false)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg text-xs hover:bg-slate-800 transition-colors"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
