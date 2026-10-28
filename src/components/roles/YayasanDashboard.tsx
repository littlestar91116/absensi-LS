import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { 
  Building2, 
  Printer, 
  Download, 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X,
  Calendar,
  Sparkles,
  Snowflake,
  ShieldCheck,
  Check,
  Clock,
  AlertTriangle,
  Lock,
  Layers,
  FileCheck
} from 'lucide-react';

interface YayasanDashboardProps {
  activeTab: string;
}

export const YayasanDashboard: React.FC<YayasanDashboardProps> = ({ activeTab }) => {
  const { 
    users, 
    students, 
    sessions, 
    attendances, 
    schedules, 
    scheduleProposals,
    viewPermissions,
    addUser, 
    updateUser, 
    deleteUser,
    toggleFreezeUser,
    updateRolePermission,
    approveScheduleProposal,
    rejectScheduleProposal
  } = useApp();

  // Report Filter State
  const [reportMonth, setReportMonth] = useState<number>(10);
  const [reportYear, setReportYear] = useState<number>(2026);
  const [reportType, setReportType] = useState<'siswa' | 'guru'>('siswa');

  // User Management State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [savedUserNotice, setSavedUserNotice] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
    isNew: boolean;
  } | null>(null);

  const [userFormData, setUserFormData] = useState<{
    name: string;
    role: UserRole;
    email: string;
    password?: string;
    phone: string;
    title: string;
    specialization: string;
    studentId?: string;
    status: 'active' | 'frozen';
  }>({
    name: '',
    role: 'guru',
    email: '',
    password: 'password123',
    phone: '0812-',
    title: 'Terapis Klinis',
    specialization: 'Sensori Integrasi (SI)',
    status: 'active'
  });

  // Freeze User Modal State
  const [freezeUserModalData, setFreezeUserModalData] = useState<{
    user: User;
    reason: string;
  } | null>(null);

  // Proposal Review Modal State
  const [rejectProposalModal, setRejectProposalModal] = useState<{
    proposalId: string;
    studentName: string;
    reason: string;
  } | null>(null);

  const teachers = users.filter(u => u.role === 'guru');

  // Month names in Indonesian
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Calculate Student Attendance Stats for the selected Month
  const studentStats = students.map((student) => {
    const monthPrefix = `${reportYear}-${String(reportMonth).padStart(2, '0')}`;
    const studentMonthSessions = sessions.filter(
      s => s.studentId === student.id && s.date.startsWith(monthPrefix)
    );
    const schedule = schedules.find(s => s.studentId === student.id);
    const durationHours = (schedule?.durationMinutes || 60) / 60;

    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpha = 0;

    studentMonthSessions.forEach(session => {
      const att = attendances.find(a => a.sessionId === session.id);
      if (att) {
        if (att.status === 'hadir') hadir++;
        else if (att.status === 'sakit') sakit++;
        else if (att.status === 'izin') izin++;
        else if (att.status === 'alpha') alpha++;
      }
    });

    const totalEvaluated = hadir + sakit + izin + alpha;
    const totalHours = hadir * durationHours;
    const attendancePercentage = totalEvaluated > 0 ? Math.round((hadir / totalEvaluated) * 100) : 0;

    return {
      student,
      totalSessions: studentMonthSessions.length,
      evaluatedSessions: totalEvaluated,
      hadir,
      sakit,
      izin,
      alpha,
      totalHours,
      attendancePercentage,
      status: student.status
    };
  });

  // Calculate Teacher Stats
  const teacherStats = teachers.map((teacher) => {
    const monthPrefix = `${reportYear}-${String(reportMonth).padStart(2, '0')}`;
    
    const primarySessions = sessions.filter(
      s => s.primaryTeacherId === teacher.id && s.date.startsWith(monthPrefix)
    );
    
    const substituteSessions = sessions.filter(
      s => s.substituteTeacherId === teacher.id && s.date.startsWith(monthPrefix)
    );

    const totalTaught = sessions.filter(
      s => (
        (s.primaryTeacherId === teacher.id && !s.isSubstituted) || 
        s.substituteTeacherId === teacher.id
      ) && 
      s.date.startsWith(monthPrefix) && 
      s.status === 'completed'
    ).length;

    const substitutedOutSessions = sessions.filter(
      s => s.primaryTeacherId === teacher.id && s.isSubstituted && s.date.startsWith(monthPrefix)
    ).length;

    const totalHours = Math.round(totalTaught * 1.2);

    return {
      teacher,
      primaryCount: primarySessions.length,
      substituteCount: substituteSessions.length,
      totalTaught,
      substitutedOutSessions,
      totalHours
    };
  });

  // Handle Export CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'siswa') {
      csvContent += "No,Nama Siswa,Program Terapi,Status Siswa,Total Sesi,Hadir,Sakit,Izin,Alpha,Total Jam Terapi,Persentase Kehadiran (%)\n";
      studentStats.forEach((row, index) => {
        csvContent += `${index + 1},"${row.student.name}","${row.student.therapyType}","${row.status}",${row.totalSessions},${row.hadir},${row.sakit},${row.izin},${row.alpha},${row.totalHours} Jam,${row.attendancePercentage}%\n`;
      });
    } else {
      csvContent += "No,Nama Guru Terapis,Spesialisasi,Sesi Utama,Sesi Pengganti (Limpahan),Total Sesi Terlaksana,Total Jam Mengajar,Status Izin Dialihkan\n";
      teacherStats.forEach((row, index) => {
        csvContent += `${index + 1},"${row.teacher.name}","${row.teacher.specialization || row.teacher.title}",${row.primaryCount},${row.substituteCount},${row.totalTaught},${row.totalHours} Jam,${row.substitutedOutSessions}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Absensi_${reportType.toUpperCase()}_${monthNames[reportMonth - 1]}_${reportYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle User Modal
  const handleOpenUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        name: user.name,
        role: user.role,
        email: user.email,
        password: user.password || 'password123',
        phone: user.phone || '0812-',
        title: user.title,
        specialization: user.specialization || '',
        studentId: user.studentId || (students[0]?.id || ''),
        status: user.status === 'frozen' ? 'frozen' : 'active'
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        name: '',
        role: 'guru',
        email: '',
        password: 'password123',
        phone: '0812-',
        title: 'Terapis Klinis',
        specialization: 'Sensori Integrasi (SI)',
        studentId: students[0]?.id || '',
        status: 'active'
      });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim()) {
      alert('Nama pengguna wajib diisi.');
      return;
    }

    const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-teal-600', 'bg-cyan-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    let savedResult: User;
    if (editingUser) {
      savedResult = updateUser({
        ...editingUser,
        ...userFormData,
        avatarColor: editingUser.avatarColor || randomColor
      });
    } else {
      savedResult = addUser({
        ...userFormData,
        avatarColor: randomColor
      });
    }

    setSavedUserNotice({
      name: savedResult.name,
      email: savedResult.email,
      password: savedResult.password || 'password123',
      role: savedResult.role,
      isNew: !editingUser
    });

    setIsUserModalOpen(false);
  };

  const handleConfirmFreezeUser = () => {
    if (!freezeUserModalData) return;
    toggleFreezeUser(freezeUserModalData.user.id, freezeUserModalData.reason);
    setFreezeUserModalData(null);
  };

  const pendingProposals = scheduleProposals.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">

      {/* BANNER: PERSETUJUAN PERUBAHAN JADWAL DARI KEPALA SEKOLAH */}
      {pendingProposals.length > 0 && activeTab !== 'laporan' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs animate-in fade-in">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Pengajuan Perubahan Jadwal Menunggu Persetujuan Yayasan ({pendingProposals.length})
                </h3>
                <p className="text-xs text-amber-800">
                  Kepala Sekolah mengajukan alokasi/perubahan jadwal baru yang memerlukan otorisasi resmi Super Admin / Yayasan
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
              Persetujuan Wajib
            </span>
          </div>

          <div className="space-y-3 mt-3">
            {pendingProposals.map((proposal) => {
              const student = students.find(s => s.id === proposal.studentId);
              const teacher = teachers.find(t => t.id === proposal.assignedTeacherId);

              return (
                <div key={proposal.id} className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{student?.name}</span>
                      <span className="text-slate-500">({student?.therapyType})</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                        Diajukan oleh: {proposal.proposedBy}
                      </span>
                    </div>

                    <div className="text-slate-700 flex flex-wrap gap-x-3 gap-y-1">
                      <span><strong>Guru Pengampu:</strong> {teacher?.name}</span>
                      <span>·</span>
                      <span><strong>Frekuensi:</strong> {proposal.weeklyFrequency}x / Minggu ({proposal.durationMinutes} Menit)</span>
                      <span>·</span>
                      <span><strong>Slot:</strong> {proposal.preferredDays.join(', ')} ({proposal.preferredTimeSlot})</span>
                    </div>

                    <p className="text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <strong>Alasan dari Kepala Sekolah:</strong> {proposal.changeReason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveScheduleProposal(proposal.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui Jadwal</span>
                    </button>
                    <button
                      onClick={() => setRejectProposalModal({
                        proposalId: proposal.id,
                        studentName: student?.name || 'Siswa',
                        reason: 'Jadwal bertabrakan dengan agenda kegiatan klinik atau kuota terapis penuh'
                      })}
                      className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 1: LAPORAN & CETAK ABSENSI BULANAN */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          
          {/* Controls Bar (Hidden during print) */}
          <div className="no-print bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600" />
                  Laporan & Cetak Absensi Bulanan (Yayasan)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rekapitulasi resmi absensi siswa & pengampu terapi siap cetak dokumen PDF dengan kop surat yayasan
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipe Rekapitulasi</label>
                <div className="flex rounded-lg p-0.5 bg-slate-100">
                  <button
                    onClick={() => setReportType('siswa')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      reportType === 'siswa' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Rekap Siswa
                  </button>
                  <button
                    onClick={() => setReportType('guru')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      reportType === 'guru' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Rekap Guru / Terapis
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pilih Bulan</label>
                <select
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                >
                  {monthNames.map((name, idx) => (
                    <option key={name} value={idx + 1}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pilih Tahun</label>
                <select
                  value={reportYear}
                  onChange={(e) => setReportYear(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                >
                  <option value={2026}>2026 (Tahun Berjalan)</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRINT-READY OFFICIAL REPORT DOCUMENT */}
          <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-10 shadow-sm print:p-0 print:border-none print:shadow-none print:rounded-none">
            
            {/* Kop Surat Yayasan Little Star Learning Center */}
            <div className="border-b-4 border-slate-900 pb-4 mb-6">
              <div className="flex items-center gap-5">
                <div className="h-20 w-auto shrink-0 flex items-center justify-center">
                  <img 
                    src="/assets/aistudio/Desain_tanpa_judul_20250712_130635_0000__1__c8a27306.png" 
                    alt="Logo Little Star"
                    className="h-20 w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-blue-900 uppercase">
                    YAYASAN LITTLE STAR LEARNING CENTER
                  </h1>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">
                    PUSAT LAYANAN TERAPI TUMBUH KEMBANG & PENDIDIKAN INKLUSI
                  </h2>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    SK Kemenkumham RI No. AHU-0014298.AH.01.04 | Izin Operasional Dinas Pendidikan & Kesehatan No. 421.9/108/DISDIK<br />
                    Layanan Terapi Wicara, Sensori Integrasi, Okupasi, Fisioterapi & Perilaku (ABA) | Email: info@littlestar.sch.id
                  </p>
                </div>
              </div>
            </div>

            {/* Document Title & Period */}
            <div className="text-center my-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 underline uppercase tracking-wider">
                {reportType === 'siswa' 
                  ? 'REKAPITULASI LAPORAN ABSENSI & MONITORING TERAPI SISWA'
                  : 'REKAPITULASI KEHADIRAN & BEBAN MENGAJAR TERAPIS / GURU'
                }
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1 font-mono">
                Periode: Bulan {monthNames[reportMonth - 1]} {reportYear}
              </p>
            </div>

            {/* REPORT TYPE: SISWA */}
            {reportType === 'siswa' && (
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-800 bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-3 border border-slate-300 text-center w-10">No</th>
                      <th className="py-2.5 px-3 border border-slate-300">Nama Siswa</th>
                      <th className="py-2.5 px-3 border border-slate-300">Program Terapi</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-center">Status</th>
                      <th className="py-2.5 px-2 border border-slate-300 text-center">Total Sesi</th>
                      <th className="py-2.5 px-2 border border-slate-300 text-center text-emerald-800">Hadir</th>
                      <th className="py-2.5 px-2 border border-slate-300 text-center text-blue-800">Sakit</th>
                      <th className="py-2.5 px-2 border border-slate-300 text-center text-amber-800">Izin</th>
                      <th className="py-2.5 px-2 border border-slate-300 text-center text-rose-800">Alpha</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-right">Jam Terapi</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-right">% Hadir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {studentStats.map((item, index) => (
                      <tr key={item.student.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                        <td className="py-2 px-3 border border-slate-300 text-center font-mono">{index + 1}</td>
                        <td className="py-2 px-3 border border-slate-300 font-semibold text-slate-900">
                          {item.student.name}
                        </td>
                        <td className="py-2 px-3 border border-slate-300">{item.student.therapyType}</td>
                        <td className="py-2 px-3 border border-slate-300 text-center">
                          <span className={`text-[10px] font-bold uppercase ${
                            item.status === 'active' ? 'text-emerald-700' : item.status === 'frozen' ? 'text-blue-700' : 'text-slate-500'
                          }`}>
                            {item.status === 'frozen' ? 'Dibekukan' : item.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 border border-slate-300 text-center font-mono tabular-nums">{item.totalSessions}</td>
                        <td className="py-2 px-2 border border-slate-300 text-center font-mono font-bold text-emerald-800 tabular-nums">{item.hadir}</td>
                        <td className="py-2 px-2 border border-slate-300 text-center font-mono tabular-nums">{item.sakit}</td>
                        <td className="py-2 px-2 border border-slate-300 text-center font-mono tabular-nums">{item.izin}</td>
                        <td className="py-2 px-2 border border-slate-300 text-center font-mono text-rose-700 tabular-nums">{item.alpha}</td>
                        <td className="py-2 px-3 border border-slate-300 text-right font-mono tabular-nums">{item.totalHours} Jam</td>
                        <td className="py-2 px-3 border border-slate-300 text-right font-mono font-bold tabular-nums">
                          {item.attendancePercentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-800 bg-slate-100 font-bold text-slate-900">
                      <td colSpan={4} className="py-2.5 px-3 border border-slate-300 text-center">
                        TOTAL AKUMULASI KLINIK
                      </td>
                      <td className="py-2.5 px-2 border border-slate-300 text-center font-mono tabular-nums">
                        {studentStats.reduce((acc, curr) => acc + curr.totalSessions, 0)}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-300 text-center font-mono text-emerald-800 tabular-nums">
                        {studentStats.reduce((acc, curr) => acc + curr.hadir, 0)}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-300 text-center font-mono tabular-nums">
                        {studentStats.reduce((acc, curr) => acc + curr.sakit, 0)}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-300 text-center font-mono tabular-nums">
                        {studentStats.reduce((acc, curr) => acc + curr.izin, 0)}
                      </td>
                      <td className="py-2.5 px-2 border border-slate-300 text-center font-mono text-rose-700 tabular-nums">
                        {studentStats.reduce((acc, curr) => acc + curr.alpha, 0)}
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 text-right font-mono tabular-nums">
                        {studentStats.reduce((acc, curr) => acc + curr.totalHours, 0)} Jam
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 text-right font-mono tabular-nums">
                        {Math.round(
                          (studentStats.reduce((acc, curr) => acc + curr.hadir, 0) /
                            (studentStats.reduce((acc, curr) => acc + curr.evaluatedSessions, 0) || 1)) * 100
                        )}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* REPORT TYPE: GURU */}
            {reportType === 'guru' && (
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y-2 border-slate-800 bg-slate-100 text-slate-800 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-3 border border-slate-300 text-center w-10">No</th>
                      <th className="py-2.5 px-3 border border-slate-300">Nama Guru / Terapis</th>
                      <th className="py-2.5 px-3 border border-slate-300">Spesialisasi Bidang</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-center">Sesi Terjadwal Utama</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-center text-amber-800">Sesi Sebagai Pengganti</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-center text-emerald-800">Total Sesi Diampu</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-center text-rose-800">Izin Terganti</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-right">Estimasi Jam Kerja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {teacherStats.map((item, index) => (
                      <tr key={item.teacher.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                        <td className="py-2 px-3 border border-slate-300 text-center font-mono">{index + 1}</td>
                        <td className="py-2 px-3 border border-slate-300 font-semibold text-slate-900">
                          {item.teacher.name}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-slate-700">
                          {item.teacher.specialization || item.teacher.title}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-center font-mono tabular-nums">{item.primaryCount} Sesi</td>
                        <td className="py-2 px-3 border border-slate-300 text-center font-mono font-bold text-amber-800 tabular-nums">
                          {item.substituteCount} Sesi
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-center font-mono font-bold text-emerald-800 tabular-nums">
                          {item.totalTaught} Sesi
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-center font-mono text-rose-700 tabular-nums">
                          {item.substitutedOutSessions} Sesi
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-right font-mono font-bold tabular-nums">
                          {item.totalHours} Jam
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-800 bg-slate-100 font-bold text-slate-900">
                      <td colSpan={3} className="py-2.5 px-3 border border-slate-300 text-center">
                        TOTAL AKUMULASI JAM TERAPIS
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 text-center font-mono tabular-nums">
                        {teacherStats.reduce((acc, curr) => acc + curr.primaryCount, 0)} Sesi
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-amber-800 tabular-nums">
                        {teacherStats.reduce((acc, curr) => acc + curr.substituteCount, 0)} Sesi
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-emerald-800 tabular-nums">
                        {teacherStats.reduce((acc, curr) => acc + curr.totalTaught, 0)} Sesi
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-rose-700 tabular-nums">
                        {teacherStats.reduce((acc, curr) => acc + curr.substitutedOutSessions, 0)} Sesi
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 text-right font-mono tabular-nums">
                        {teacherStats.reduce((acc, curr) => acc + curr.totalHours, 0)} Jam
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Official Signature Lines */}
            <div className="mt-12 pt-8 print:mt-16 print:pt-6 print:break-inside-avoid">
              <div className="flex justify-between items-start text-xs text-slate-800 px-6">
                
                {/* Kepala Sekolah Signature */}
                <div className="text-center w-64">
                  <p className="text-slate-600">Mengetahui & Memverifikasi,</p>
                  <p className="font-bold text-slate-900 mt-1">Kepala Sekolah & Koordinator Klinis</p>
                  <div className="h-24 flex items-center justify-center">
                    <span className="text-[11px] text-slate-400 italic">[Tanda Tangan & Cap Digital]</span>
                  </div>
                  <p className="font-bold text-slate-900 underline">Ahmad Fauzi, S.Pd, M.Ed</p>
                  <p className="text-[11px] text-slate-600 font-mono">NIPK: 19820412.201001.1.004</p>
                </div>

                {/* Yayasan Signature */}
                <div className="text-center w-64">
                  <p className="text-slate-600">Jakarta, 28 Oktober 2026</p>
                  <p className="font-bold text-slate-900 mt-1">Ketua Yayasan Little Star Learning Center</p>
                  <div className="h-24 flex items-center justify-center">
                    <span className="text-[11px] text-slate-400 italic">[Tanda Tangan & Cap Resmi Yayasan]</span>
                  </div>
                  <p className="font-bold text-slate-900 underline">Dr. Hj. Nurul Hidayati, M.Psi</p>
                  <p className="text-[11px] text-slate-600 font-mono">Ketua Pengurus Yayasan</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: MANAJEMEN USER & PEMBEKUAN AKUN (SUPER ADMIN ONLY) */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Manajemen Akun & Pembekuan Akses Pengguna
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola akun Kepala Sekolah, Guru, Murid. Super Admin berhak menambah, mengedit, menghapus, atau membekukan akun.
              </p>
            </div>

            <button
              onClick={() => handleOpenUserModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah User Baru</span>
            </button>
          </div>

          {/* Success Banner when User is Created or Edited */}
          {savedUserNotice && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs sm:text-sm text-emerald-900">
                    {savedUserNotice.isNew ? 'Akun Baru Berhasil Dibuat & Siap Digunakan!' : 'Perubahan Akun Berhasil Disimpan!'}
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Pengguna <strong>{savedUserNotice.name}</strong> sekarang dapat login langsung dengan kredensial berikut:
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="bg-white px-2.5 py-1 rounded border border-emerald-300 font-semibold text-slate-800">
                      Email / ID: <strong>{savedUserNotice.email}</strong>
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded border border-emerald-300 font-semibold text-slate-800">
                      Kata Sandi: <strong>{savedUserNotice.password}</strong>
                    </span>
                    <span className="bg-emerald-100 px-2 py-0.5 rounded font-sans font-semibold text-emerald-800 uppercase text-[10px]">
                      Peran: {savedUserNotice.role}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSavedUserNotice(null)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline self-start sm:self-center"
              >
                Tutup Notifikasi
              </button>
            </div>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nama Pengguna</th>
                  <th className="px-4 py-3">Peran / Role</th>
                  <th className="px-4 py-3">Email & Kata Sandi</th>
                  <th className="px-4 py-3">Status Akun</th>
                  <th className="px-4 py-3 text-right">Aksi & Kontrol Freeze</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => {
                  const isFrozen = user.status === 'frozen';
                  const isYayasan = user.role === 'yayasan';
                  const linkedStudent = user.studentId ? students.find(s => s.id === user.studentId) : null;

                  return (
                    <tr key={user.id} className={`hover:bg-slate-50 ${isFrozen ? 'bg-slate-100/50' : ''}`}>
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs ${user.avatarColor}`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <span className="text-[11px] text-slate-500">{user.title}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            user.role === 'yayasan'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : user.role === 'kepala_sekolah'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : user.role === 'guru'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          }`}>
                            {user.role.toUpperCase()}
                          </span>
                          {linkedStudent && (
                            <p className="text-[10px] text-cyan-800 font-medium mt-1">
                              Siswa: <strong>{linkedStudent.name}</strong>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono">
                        <p className="text-slate-800 text-[11px] font-medium">{user.email}</p>
                        <p className="text-[10px] text-slate-500">
                          Pass: <span className="font-semibold text-slate-700">{user.password || 'password123'}</span>
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        {isFrozen ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                              <Snowflake className="w-3 h-3 text-blue-600" />
                              Dibekukan (Freeze)
                            </span>
                            {user.freezeReason && (
                              <p className="text-[10px] text-slate-500 mt-0.5 max-w-xs line-clamp-1" title={user.freezeReason}>
                                {user.freezeReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktif
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Freeze / Unfreeze Toggle Button */}
                          {!isYayasan && (
                            <button
                              onClick={() => {
                                if (isFrozen) {
                                  toggleFreezeUser(user.id);
                                } else {
                                  setFreezeUserModalData({
                                    user,
                                    reason: 'Penangguhan akses oleh Super Admin / Yayasan'
                                  });
                                }
                              }}
                              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                                isFrozen
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                              }`}
                              title={isFrozen ? 'Aktifkan Kembali Akun' : 'Bekukan Akun (User tidak bisa login)'}
                            >
                              <Snowflake className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">
                                {isFrozen ? 'Buka Freeze' : 'Bekukan'}
                              </span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenUserModal(user)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                            title="Edit User"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {!isYayasan && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus akun ${user.name}? Pengguna ini tidak akan bisa login lagi.`)) {
                                  deleteUser(user.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg hover:bg-rose-50"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PENGATURAN HAK AKSES TAMPILAN WEBSITE (SUPER ADMIN ONLY) */}
      {activeTab === 'hak_akses' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Pengaturan Hak Akses Tampilan Website (Role View Access Matrix)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Otoritas eksklusif Super Admin: Tentukan modul, tab, dan fitur website mana saja yang diizinkan tampil untuk masing-masing peran
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Kontrol Otoritas Super Admin
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3 border-b border-slate-200">Modul / Fitur Tampilan Website</th>
                  <th className="px-4 py-3 border-b border-slate-200 text-center w-28 bg-indigo-50/50">
                    Yayasan (Super Admin)
                  </th>
                  <th className="px-4 py-3 border-b border-slate-200 text-center w-28">
                    Kepala Sekolah
                  </th>
                  <th className="px-4 py-3 border-b border-slate-200 text-center w-28">
                    Guru / Terapis
                  </th>
                  <th className="px-4 py-3 border-b border-slate-200 text-center w-28">
                    Murid / Wali
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {viewPermissions.map((perm) => (
                  <tr key={perm.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 text-xs">{perm.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{perm.description}</p>
                    </td>

                    {/* Yayasan (Always Locked Full Access) */}
                    <td className="px-4 py-3 text-center bg-indigo-50/30">
                      <span className="inline-flex items-center gap-1 font-bold text-indigo-700 text-xs">
                        <Check className="w-4 h-4 text-indigo-600" />
                        Penuh
                      </span>
                    </td>

                    {/* Kepala Sekolah */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={perm.allowedRoles.includes('kepala_sekolah')}
                        onChange={(e) => updateRolePermission(perm.id, 'kepala_sekolah', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                    </td>

                    {/* Guru */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={perm.allowedRoles.includes('guru')}
                        onChange={(e) => updateRolePermission(perm.id, 'guru', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                    </td>

                    {/* Murid */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={perm.allowedRoles.includes('murid')}
                        onChange={(e) => updateRolePermission(perm.id, 'murid', e.target.checked)}
                        className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>
              Perubahan matriks hak akses tersimpan otomatis dan langsung berlaku saat pengguna dari peran terkait membuka website.
            </span>
            <span className="font-semibold text-indigo-700">
              {viewPermissions.length} Modul Terkelola
            </span>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                {editingUser ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
              </h3>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    const autoUsername = newName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    setUserFormData(prev => ({
                      ...prev,
                      name: newName,
                      email: prev.email ? prev.email : (autoUsername ? `${autoUsername}@littlestar.sch.id` : '')
                    }));
                  }}
                  placeholder="Contoh: Kiky Amanda, S.Tr.Kes"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran / Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      let defaultTitle = userFormData.title;
                      if (!defaultTitle || defaultTitle === 'Terapis Klinis' || defaultTitle === 'Wali Murid' || defaultTitle === 'Kepala Sekolah & Koordinator Klinis' || defaultTitle === 'Pengurus Yayasan') {
                        if (newRole === 'guru') defaultTitle = 'Terapis Klinis';
                        else if (newRole === 'murid') defaultTitle = 'Wali Murid';
                        else if (newRole === 'kepala_sekolah') defaultTitle = 'Kepala Sekolah & Koordinator Klinis';
                        else if (newRole === 'yayasan') defaultTitle = 'Pengurus Yayasan';
                      }
                      setUserFormData({ 
                        ...userFormData, 
                        role: newRole,
                        title: defaultTitle,
                        studentId: newRole === 'murid' ? (userFormData.studentId || students[0]?.id) : userFormData.studentId
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                  >
                    <option value="guru">Guru / Terapis</option>
                    <option value="kepala_sekolah">Kepala Sekolah</option>
                    <option value="murid">Wali Murid</option>
                    <option value="yayasan">Yayasan (Super Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Akun *</label>
                  <select
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value as 'active' | 'frozen' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    <option value="active">Aktif (Dapat Login)</option>
                    <option value="frozen">Dibekukan / Freeze</option>
                  </select>
                </div>
              </div>

              {/* Murid / Wali Murid: Select Linked Student */}
              {userFormData.role === 'murid' && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1.5">
                  <label className="block font-bold text-cyan-900 text-xs">
                    Hubungkan dengan Data Siswa / Ananda *
                  </label>
                  <p className="text-[11px] text-cyan-800">
                    Akun ini otomatis menampilkan jadwal terapi, guru pengampu, dan evaluasi ananda yang dipilih.
                  </p>
                  <select
                    required
                    value={userFormData.studentId || ''}
                    onChange={(e) => setUserFormData({ ...userFormData, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-cyan-300 rounded-lg bg-white text-slate-800 font-medium"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.map((std) => (
                      <option key={std.id} value={std.id}>
                        {std.name} ({std.nickname}) · {std.therapyType}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jabatan Resmi *</label>
                <input
                  type="text"
                  required
                  value={userFormData.title}
                  onChange={(e) => setUserFormData({ ...userFormData, title: e.target.value })}
                  placeholder="Contoh: Terapis Sensori Integrasi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {userFormData.role === 'guru' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Spesialisasi Bidang Terapi</label>
                  <input
                    type="text"
                    value={userFormData.specialization}
                    onChange={(e) => setUserFormData({ ...userFormData, specialization: e.target.value })}
                    placeholder="Contoh: Sensori Integrasi (SI) / Terapi Wicara"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email / Username Login *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="nama@littlestar.sch.id"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Bisa dimasukkan dengan atau tanpa domain @littlestar.sch.id
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Login *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="password123"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Standar default: <code>password123</code>
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                <input
                  type="text"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  placeholder="0812-xxxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI PEMBEKUAN (FREEZE) AKUN PENGGUNA */}
      {freezeUserModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-blue-700 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Snowflake className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bekukan Akun Pengguna</h3>
                <p className="text-xs text-slate-500">{freezeUserModalData.user.name}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Akibat Pembekuan Akun:
                </p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Pengguna ini akan <strong>otomatis diblokir dan tidak dapat login ke sistem</strong> hingga Super Admin membuka kembali pembekuan statusnya.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan Pembekuan Akun *
                </label>
                <textarea
                  rows={3}
                  value={freezeUserModalData.reason}
                  onChange={(e) => setFreezeUserModalData({ ...freezeUserModalData, reason: e.target.value })}
                  placeholder="Misal: Cuti studi semester ganjil, penonaktifan sementara tugas klinis..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setFreezeUserModalData(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmFreezeUser}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                <span>Bekukan Akun Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TOLAK PENGAJUAN JADWAL */}
      {rejectProposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Tolak Pengajuan Perubahan Jadwal</h3>
            <p className="text-xs text-slate-500 mb-3">Siswa: {rejectProposalModal.studentName}</p>

            <div className="text-xs space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Penolakan untuk Kepala Sekolah *</label>
                <textarea
                  rows={3}
                  value={rejectProposalModal.reason}
                  onChange={(e) => setRejectProposalModal({ ...rejectProposalModal, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRejectProposalModal(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  rejectScheduleProposal(rejectProposalModal.proposalId, rejectProposalModal.reason);
                  setRejectProposalModal(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700"
              >
                Kirim Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
