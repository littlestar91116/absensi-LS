import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Building2, 
  GraduationCap, 
  UserCheck, 
  HeartHandshake, 
  ChevronDown, 
  RotateCcw, 
  ShieldCheck, 
  Menu, 
  X,
  Sparkles,
  Info
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, users, switchRole, resetToDefaultData } = useApp();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  const roleLabels: Record<UserRole, { label: string; badge: string; icon: React.ReactNode; color: string }> = {
    yayasan: {
      label: 'Yayasan (Super Admin)',
      badge: 'Super Admin',
      icon: <Building2 className="w-4 h-4 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
    },
    kepala_sekolah: {
      label: 'Kepala Sekolah',
      badge: 'Admin Operasional',
      icon: <GraduationCap className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    guru: {
      label: 'Guru / Terapis',
      badge: 'Tenaga Klinis',
      icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    },
    murid: {
      label: 'Murid / Wali Murid',
      badge: 'Read-Only',
      icon: <HeartHandshake className="w-4 h-4 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-200 text-cyan-700'
    }
  };

  const roleTabs: Record<UserRole, Array<{ id: string; label: string }>> = {
    yayasan: [
      { id: 'laporan', label: 'Laporan & Cetak Absensi' },
      { id: 'users', label: 'Manajemen Akun' },
      { id: 'siswa', label: 'Data Siswa' },
      { id: 'jadwal', label: 'Jadwal & Terapis' }
    ],
    kepala_sekolah: [
      { id: 'siswa', label: 'Data Siswa' },
      { id: 'jadwal', label: 'Atur Jadwal Bulanan' },
      { id: 'pengganti', label: 'Penugasan Pengganti' },
      { id: 'laporan', label: 'Rekap Absensi' }
    ],
    guru: [
      { id: 'jadwal_mengajar', label: 'Jadwal Terapi' },
      { id: 'absensi_input', label: 'Input Absensi & Catatan' },
      { id: 'izin_guru', label: 'Pengajuan Izin Sesi' },
      { id: 'riwayat_catatan', label: 'Riwayat Evaluasi' }
    ],
    murid: [
      { id: 'wali_jadwal', label: 'Jadwal Terapi Anak' },
      { id: 'wali_perkembangan', label: 'Catatan Perkembangan & PR' }
    ]
  };

  const handleRoleSelect = (user: typeof users[0]) => {
    switchRole(user.role, user.id);
    setRoleDropdownOpen(false);
    // Set default tab for the chosen role
    const defaultTab = roleTabs[user.role][0]?.id;
    if (defaultTab) {
      setCurrentTab(defaultTab);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">TERAPINA</span>
                <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Klinik Inklusi
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-500">
                Sistem Manajemen Penjadwalan & Absensi Terapi Siswa
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {roleTabs[currentUser.role]?.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  currentTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Action Zone: Quick Role Switcher & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Role Info Quick Button */}
            <button
              onClick={() => setShowRoleInfo(!showRoleInfo)}
              title="Informasi Hak Akses Role"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset data simulasi ke data awal contoh? Data baru yang Anda ubah akan kembali ke default.')) {
                  resetToDefaultData();
                }
              }}
              title="Reset Data Simulasi"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>

            {/* Interactive Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50 hover:bg-white hover:border-blue-400 text-left transition-all shadow-xs"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs ${currentUser.avatarColor}`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                      {currentUser.name.split(',')[0]}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${roleLabels[currentUser.role].color}`}>
                      {roleLabels[currentUser.role].badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    {currentUser.title}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {roleDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setRoleDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Beralih Pengguna & Hak Akses
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Pilih peran untuk menguji alur kerja sistem
                      </p>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-1">
                      {users.map((user) => {
                        const isCurrent = user.id === currentUser.id;
                        const roleMeta = roleLabels[user.role];
                        return (
                          <button
                            key={user.id}
                            onClick={() => handleRoleSelect(user)}
                            className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition-colors ${
                              isCurrent 
                                ? 'bg-blue-50 border border-blue-200' 
                                : 'hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-md shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5 ${user.avatarColor}`}>
                              {user.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-xs font-semibold truncate ${isCurrent ? 'text-blue-900' : 'text-slate-800'}`}>
                                  {user.name}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded shrink-0">
                                    Aktif
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {roleMeta.icon}
                                <span className="text-[11px] text-slate-500 truncate">
                                  {user.title}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 px-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Hak Akses Terisolasi
                      </span>
                      <span>4 Tingkat Role</span>
                    </div>
                  </div>
                </>
              )}
            </div>

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
            <div className="px-3 py-1 text-xs font-medium text-slate-400">
              Menu Navigasi ({roleLabels[currentUser.role].label})
            </div>
            {roleTabs[currentUser.role]?.map((tab) => (
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
                <h3 className="font-bold text-slate-900 text-base">Hierarki Hak Akses 4 Role</h3>
              </div>
              <button 
                onClick={() => setShowRoleInfo(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <p className="font-semibold text-indigo-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  1. Yayasan (Super Admin)
                </p>
                <p className="mt-1 text-indigo-800">
                  Akses penuh ke seluruh sistem, manajemen akun pengguna (Kepala Sekolah, Guru, Murid), serta modul resmi <strong>Laporan & Cetak Absensi Bulanan</strong> dengan format PDF/Print kop surat yayasan.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                <p className="font-semibold text-blue-900 text-sm flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  2. Kepala Sekolah (Admin Operasional)
                </p>
                <p className="mt-1 text-blue-800">
                  Manajemen data siswa (termasuk status <strong>Dibekukan/Freeze</strong> yang tidak masuk jadwal), pembagian jadwal bulanan (durasi jam & frekuensi), serta manajemen <strong>Guru Pengganti</strong> saat terapis berhalangan.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <p className="font-semibold text-emerald-900 text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  3. Guru / Terapis
                </p>
                <p className="mt-1 text-emerald-800">
                  Melihat jadwal mengajar (termasuk badge kuning jika menjadi Guru Pengganti), form input absensi & catatan perkembangan anak harian, serta form pengajuan izin ke Kepala Sekolah.
                </p>
              </div>

              <div className="p-3 bg-cyan-50/70 border border-cyan-100 rounded-xl">
                <p className="font-semibold text-cyan-900 text-sm flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-cyan-600" />
                  4. Murid / Wali Murid (Strict Read-Only)
                </p>
                <p className="mt-1 text-cyan-800">
                  Hanya bisa melihat kalender & jadwal terapi aktif milik ananda (termasuk terapis pengampu/pengganti), serta membaca riwayat evaluasi dan latihan stimulasi di rumah tanpa izin mengedit data.
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
