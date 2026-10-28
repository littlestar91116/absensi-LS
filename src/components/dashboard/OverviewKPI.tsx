import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Snowflake, 
  CalendarCheck2, 
  UserRoundCheck, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const OverviewKPI: React.FC = () => {
  const { students, sessions, attendances, leaveRequests } = useApp();

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const frozenStudents = students.filter(s => s.status === 'frozen').length;
  const inactiveStudents = students.filter(s => s.status === 'inactive').length;

  const totalSessionsThisMonth = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length;

  // Total attendances count
  const presentCount = attendances.filter(a => a.status === 'hadir').length;
  const attendanceRate = attendances.length > 0 
    ? Math.round((presentCount / attendances.length) * 100) 
    : 0;

  // Substitute sessions count
  const substitutedSessionsCount = sessions.filter(s => s.isSubstituted).length;
  const pendingLeaveRequests = leaveRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-4 mb-6 no-print">
      {/* Top Banner with Alert if there are pending leave requests */}
      {pendingLeaveRequests > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold">
                Perhatian: Terdapat {pendingLeaveRequests} Pengajuan Izin Terapis Memerlukan Penugasan Pengganti
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Kepala Sekolah dapat menunjuk guru pengganti pada tab Penugasan Pengganti agar sesi anak tidak terlewatkan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Siswa Aktif & Status */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Data Siswa Terdaftar</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {activeStudents}
              </span>
              <span className="text-xs font-semibold text-emerald-600">
                Siswa Aktif
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-slate-600">
              <Snowflake className="w-3.5 h-3.5 text-blue-500" />
              <strong className="text-slate-700 tabular-nums">{frozenStudents}</strong> Dibekukan
            </span>
            <span className="tabular-nums">
              Total {totalStudents} anak
            </span>
          </div>
        </div>

        {/* Card 2: Sesi Terapi Bulan Ini */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Sesi Terapi (Oktober 2026)</span>
              <CalendarCheck2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {totalSessionsThisMonth}
              </span>
              <span className="text-xs text-slate-500">
                Total Pertemuan
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-emerald-600 font-medium tabular-nums">
              {completedSessions} Selesai
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-blue-600 font-medium tabular-nums">
              {scheduledSessions} Mendatang
            </span>
          </div>
        </div>

        {/* Card 3: Tingkat Kehadiran Anak */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Tingkat Kehadiran</span>
              <UserRoundCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {attendanceRate}%
              </span>
              <span className="text-xs font-medium text-emerald-600">
                ({presentCount} Sesi Hadir)
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="tabular-nums">
              {attendances.filter(a => a.status === 'sakit' || a.status === 'izin').length} Sakit/Izin
            </span>
            <span className="text-slate-400">·</span>
            <span className="tabular-nums text-rose-600 font-medium">
              {attendances.filter(a => a.status === 'alpha').length} Alpha
            </span>
          </div>
        </div>

        {/* Card 4: Penugasan Guru Pengganti */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Manajemen Guru Pengganti</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {substitutedSessionsCount}
              </span>
              <span className="text-xs text-amber-700 font-medium">
                Sesi Dialihkan
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {pendingLeaveRequests} Izin Menunggu
            </span>
            <span className="text-xs text-slate-400">
              Antisipasi Kosong
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
