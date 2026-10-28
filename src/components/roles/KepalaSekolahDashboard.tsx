import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, TherapyType, StudentStatus, MonthlySchedule } from '../../types';
import { 
  Users, 
  UserPlus, 
  Edit3, 
  Trash2, 
  Snowflake, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  X,
  ArrowRight,
  ShieldAlert,
  CalendarDays
} from 'lucide-react';

interface KepalaSekolahDashboardProps {
  activeTab: string;
}

export const KepalaSekolahDashboard: React.FC<KepalaSekolahDashboardProps> = ({ activeTab }) => {
  const { 
    students, 
    users, 
    schedules, 
    sessions, 
    leaveRequests,
    addStudent, 
    updateStudent, 
    deleteStudent, 
    toggleFreezeStudent,
    saveMonthlySchedule,
    deleteSchedule,
    approveLeaveRequest,
    rejectLeaveRequest,
    assignSubstitute
  } = useApp();

  // Search & Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [filterTherapy, setFilterTherapy] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Student Form Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    nickname: '',
    birthDate: '',
    age: '',
    parentName: '',
    parentPhone: '',
    therapyType: 'Sensori Integrasi (SI)' as TherapyType,
    secondaryTherapyType: '' as string,
    status: 'active' as StudentStatus,
    diagnosis: '',
    targetFocus: '',
    notes: ''
  });

  // Freeze Confirmation Modal State
  const [freezeModalData, setFreezeModalData] = useState<{ student: Student; reason: string } | null>(null);

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState<{
    id?: string;
    studentId: string;
    month: number;
    year: number;
    weeklyFrequency: number;
    durationMinutes: number;
    assignedTeacherId: string;
    room: string;
    preferredDays: string[];
    preferredTimeSlot: string;
    notes?: string;
  }>({
    studentId: '',
    month: 10,
    year: 2026,
    weeklyFrequency: 2,
    durationMinutes: 60,
    assignedTeacherId: '',
    room: 'Ruang SI Sakura (Lantai 1)',
    preferredDays: ['Senin', 'Rabu'],
    preferredTimeSlot: '09:00 - 10:00',
    notes: ''
  });

  // Substitute Assignment Modal State
  const [substituteModalData, setSubstituteModalData] = useState<{
    requestId?: string;
    sessionId?: string;
    teacherName: string;
    studentName: string;
    date: string;
    timeSlot: string;
    reason: string;
    selectedSubstituteId: string;
  } | null>(null);

  const therapyTypesList: TherapyType[] = [
    'Sensori Integrasi (SI)',
    'Terapi Wicara (TW)',
    'Terapi Okupasi (TO)',
    'Fisioterapi Pediatrik',
    'Terapi Perilaku (ABA)'
  ];

  const teachers = users.filter(u => u.role === 'guru');

  // Filtered Students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.nickname.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.parentName.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesTherapy = filterTherapy === 'all' || student.therapyType === filterTherapy;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesTherapy && matchesStatus;
  });

  // Handle open Student Modal
  const handleOpenStudentModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setStudentFormData({
        name: student.name,
        nickname: student.nickname,
        birthDate: student.birthDate,
        age: student.age,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        therapyType: student.therapyType,
        secondaryTherapyType: student.secondaryTherapyType || '',
        status: student.status,
        diagnosis: student.diagnosis,
        targetFocus: student.targetFocus,
        notes: student.notes
      });
    } else {
      setEditingStudent(null);
      setStudentFormData({
        name: '',
        nickname: '',
        birthDate: '2021-01-01',
        age: '5 Tahun',
        parentName: '',
        parentPhone: '0812-',
        therapyType: 'Sensori Integrasi (SI)',
        secondaryTherapyType: '',
        status: 'active',
        diagnosis: '',
        targetFocus: '',
        notes: ''
      });
    }
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormData.name.trim()) return;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        ...studentFormData,
        secondaryTherapyType: (studentFormData.secondaryTherapyType as TherapyType) || undefined
      });
    } else {
      addStudent({
        ...studentFormData,
        secondaryTherapyType: (studentFormData.secondaryTherapyType as TherapyType) || undefined
      });
    }
    setIsStudentModalOpen(false);
  };

  const handleConfirmFreeze = () => {
    if (!freezeModalData) return;
    toggleFreezeStudent(freezeModalData.student.id, freezeModalData.reason);
    setFreezeModalData(null);
  };

  // Open Schedule Modal
  const handleOpenScheduleModal = (existingSchedule?: MonthlySchedule) => {
    if (existingSchedule) {
      setScheduleFormData({
        id: existingSchedule.id,
        studentId: existingSchedule.studentId,
        month: existingSchedule.month,
        year: existingSchedule.year,
        weeklyFrequency: existingSchedule.weeklyFrequency,
        durationMinutes: existingSchedule.durationMinutes,
        assignedTeacherId: existingSchedule.assignedTeacherId,
        room: existingSchedule.room,
        preferredDays: existingSchedule.preferredDays,
        preferredTimeSlot: existingSchedule.preferredTimeSlot,
        notes: existingSchedule.notes || ''
      });
    } else {
      // Find first active student without schedule or default to first active
      const firstActiveStudent = students.find(s => s.status === 'active');
      setScheduleFormData({
        studentId: firstActiveStudent ? firstActiveStudent.id : '',
        month: 10,
        year: 2026,
        weeklyFrequency: 2,
        durationMinutes: 60,
        assignedTeacherId: teachers[0]?.id || '',
        room: 'Ruang SI Sakura (Lantai 1)',
        preferredDays: ['Senin', 'Rabu'],
        preferredTimeSlot: '09:00 - 10:00',
        notes: ''
      });
    }
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleFormData.studentId || !scheduleFormData.assignedTeacherId) {
      alert('Mohon pilih siswa dan guru pengampu.');
      return;
    }

    // Verify if selected student is frozen
    const targetStudent = students.find(s => s.id === scheduleFormData.studentId);
    if (targetStudent?.status === 'frozen') {
      alert(`Peringatan: Siswa ${targetStudent.name} sedang dalam status "Dibekukan (Freeze)". Harap unfreeze terlebih dahulu sebelum menetapkan jadwal aktif.`);
      return;
    }

    saveMonthlySchedule(scheduleFormData);
    setIsScheduleModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* TAB 1: DATA SISWA */}
      {activeTab === 'siswa' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Header & Action Controls */}
          <div className="p-4 sm:p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Manajemen Data Siswa Terapi
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola profil siswa, status aktif/freeze, dan penyesuaian program klinis
                </p>
              </div>
              
              <button
                onClick={() => handleOpenStudentModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Siswa Baru</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa atau orang tua..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <select
                  value={filterTherapy}
                  onChange={(e) => setFilterTherapy(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white"
                >
                  <option value="all">Semua Program Terapi</option>
                  {therapyTypesList.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white"
                >
                  <option value="all">Semua Status Siswa</option>
                  <option value="active">Aktif ({students.filter(s => s.status === 'active').length})</option>
                  <option value="frozen">Dibekukan / Freeze ({students.filter(s => s.status === 'frozen').length})</option>
                  <option value="inactive">Non-Aktif ({students.filter(s => s.status === 'inactive').length})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nama Siswa & Panggilan</th>
                  <th className="px-4 py-3">Usia & Diagnosa</th>
                  <th className="px-4 py-3">Jenis Terapi</th>
                  <th className="px-4 py-3">Orang Tua / Kontak</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi & Kontrol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      Tidak ada data siswa yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const isFrozen = student.status === 'frozen';
                    const isActive = student.status === 'active';

                    return (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isFrozen ? 'bg-slate-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isFrozen ? 'bg-slate-300 text-slate-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {student.nickname.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{student.name}</p>
                              <p className="text-[11px] text-slate-500">Panggilan: {student.nickname}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-slate-800 font-medium">{student.age}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]" title={student.diagnosis}>
                            {student.diagnosis}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-700 block">
                            {student.therapyType}
                          </span>
                          {student.secondaryTherapyType && (
                            <span className="text-[10px] text-slate-500 block">
                              + {student.secondaryTherapyType}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-slate-800 font-medium">{student.parentName}</p>
                          <p className="text-[11px] text-slate-500 tabular-nums">{student.parentPhone}</p>
                        </td>

                        <td className="px-4 py-3">
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Aktif
                            </span>
                          )}
                          {isFrozen && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                <Snowflake className="w-3 h-3 text-blue-500" />
                                Dibekukan (Freeze)
                              </span>
                              {student.freezeReason && (
                                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 max-w-[160px]" title={student.freezeReason}>
                                  {student.freezeReason}
                                </p>
                              )}
                            </div>
                          )}
                          {student.status === 'inactive' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              Non-Aktif
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Freeze/Unfreeze Toggle Button */}
                            <button
                              onClick={() => {
                                if (isFrozen) {
                                  toggleFreezeStudent(student.id);
                                } else {
                                  setFreezeModalData({
                                    student,
                                    reason: 'Pemulihan pasca sakit / izin cuti sementara atas persetujuan orang tua'
                                  });
                                }
                              }}
                              title={isFrozen ? 'Buka Pembekuan (Unfreeze)' : 'Bekukan Status (Freeze - Siswa tidak masuk antrean jadwal)'}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isFrozen 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-700'
                              }`}
                            >
                              <Snowflake className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenStudentModal(student)}
                              title="Edit Data Siswa"
                              className="p-1.5 text-slate-600 hover:text-blue-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus data siswa ${student.name}? Semua sesi dan riwayat jadwal terkait akan ikut terhapus.`)) {
                                  deleteStudent(student.id);
                                }
                              }}
                              title="Hapus Siswa"
                              className="p-1.5 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              Menampilkan {filteredStudents.length} dari {students.length} total siswa terdaftar
            </span>
            <span className="flex items-center gap-1.5 text-blue-700 font-medium">
              <Snowflake className="w-3.5 h-3.5" />
              Siswa dengan status Dibekukan (Freeze) otomatis tidak dialokasikan pada penjadwalan
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: ATUR JADWAL BULANAN & MAPPING GURU */}
      {activeTab === 'jadwal' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Pembagian & Input Jadwal Siswa Bulanan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atur frekuensi mingguan (1x, 2x, 3x), durasi sesi (1 jam, 1.5 jam, 2 jam), dan guru pengampu
                </p>
              </div>

              <button
                onClick={() => handleOpenScheduleModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Atur Jadwal Baru</span>
              </button>
            </div>

            {/* List of active schedules */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Siswa & Terapi</th>
                    <th className="px-4 py-3">Guru Pengampu Utama</th>
                    <th className="px-4 py-3">Frekuensi & Durasi</th>
                    <th className="px-4 py-3">Hari & Jam Sesi</th>
                    <th className="px-4 py-3">Ruangan</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {schedules.map((sch) => {
                    const student = students.find(s => s.id === sch.studentId);
                    const teacher = teachers.find(t => t.id === sch.assignedTeacherId);
                    const isFrozen = student?.status === 'frozen';

                    return (
                      <tr key={sch.id} className={`hover:bg-slate-50 ${isFrozen ? 'bg-amber-50/40' : ''}`}>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <p className="font-semibold text-slate-900">{student?.name || 'Siswa'}</p>
                          <span className="text-[11px] text-slate-500">{student?.therapyType}</span>
                          {isFrozen && (
                            <span className="block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded w-max">
                              Siswa Sedang Dibekukan (Freeze)
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{teacher?.name || 'Belum Ditunjuk'}</p>
                          <p className="text-[11px] text-slate-500">{teacher?.title}</p>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {sch.weeklyFrequency}x / Minggu
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1 font-mono">
                            Durasi: {sch.durationMinutes} Menit ({sch.durationMinutes === 60 ? '1 Jam' : sch.durationMinutes === 90 ? '1.5 Jam' : '2 Jam'})
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 mb-1">
                            {sch.preferredDays.map(d => (
                              <span key={d} className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                                {d}
                              </span>
                            ))}
                          </div>
                          <span className="text-[11px] font-mono text-slate-600 block">
                            {sch.preferredTimeSlot}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {sch.room}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenScheduleModal(sch)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                              title="Edit Jadwal"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Hapus jadwal bulanan ini?')) {
                                  deleteSchedule(sch.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg hover:bg-rose-50"
                              title="Hapus Jadwal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENUGASAN GURU PENGGANTI (SUBSTITUTE) */}
      {activeTab === 'pengganti' && (
        <div className="space-y-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600" />
                  Manajemen Guru Pengganti (Substitute Teacher)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tunjuk guru pengganti sementara jika guru utama berhalangan atau mengajukan izin agar sesi terapi anak tetap berjalan
                </p>
              </div>
            </div>

            {/* Section 1: Pending Leave Requests */}
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Daftar Permohonan Izin Guru Menunggu Tindakan ({leaveRequests.filter(r => r.status === 'pending').length})
              </h3>

              {leaveRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs">
                  Tidak ada permohonan izin guru yang berstatus pending saat ini. Semua sesi tertangani dengan baik.
                </div>
              ) : (
                <div className="space-y-3">
                  {leaveRequests.filter(r => r.status === 'pending').map((req) => {
                    const teacher = teachers.find(t => t.id === req.teacherId);
                    const session = sessions.find(s => s.id === req.sessionId);
                    const student = students.find(s => s.id === session?.studentId);

                    return (
                      <div 
                        key={req.id} 
                        className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {teacher?.name} ({teacher?.title})
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                              Menunggu Persetujuan
                            </span>
                          </div>

                          <div className="text-xs text-slate-700">
                            <strong>Tanggal Sesi:</strong> {req.sessionDate} · <strong>Siswa:</strong> {student?.name || 'Siswa Terkait'} ({session?.timeSlot || 'Jam Sesi'})
                          </div>

                          <p className="text-xs text-amber-900 bg-white/70 p-2 rounded-lg border border-amber-200">
                            <span className="font-semibold">Alasan Izin:</span> {req.reason}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setSubstituteModalData({
                                requestId: req.id,
                                sessionId: req.sessionId,
                                teacherName: teacher?.name || 'Guru Utama',
                                studentName: student?.name || 'Siswa',
                                date: req.sessionDate,
                                timeSlot: session?.timeSlot || '',
                                reason: req.reason,
                                selectedSubstituteId: teachers.find(t => t.id !== req.teacherId)?.id || ''
                              });
                            }}
                            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Pilih Guru Pengganti</span>
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm('Tolak permohonan izin ini?')) {
                                rejectLeaveRequest(req.id);
                              }
                            }}
                            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium transition-colors"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Active Substituted Sessions */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Riwayat Sesi yang Telah Dialihkan ke Guru Pengganti
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Tanggal & Sesi</th>
                      <th className="px-4 py-3">Siswa</th>
                      <th className="px-4 py-3">Guru Utama (Izin)</th>
                      <th className="px-4 py-3">Guru Pengganti Ditugaskan</th>
                      <th className="px-4 py-3">Keterangan / Alasan</th>
                      <th className="px-4 py-3 text-right">Status Sesi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sessions.filter(s => s.isSubstituted).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400">
                          Belum ada sesi yang dialihkan ke guru pengganti.
                        </td>
                      </tr>
                    ) : (
                      sessions.filter(s => s.isSubstituted).map((session) => {
                        const student = students.find(st => st.id === session.studentId);
                        const primaryTeacher = teachers.find(t => t.id === session.primaryTeacherId);
                        const substituteTeacher = teachers.find(t => t.id === session.substituteTeacherId);

                        return (
                          <tr key={session.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium">
                              <p className="font-semibold text-slate-900">{session.date}</p>
                              <span className="text-[11px] font-mono text-slate-500">{session.timeSlot}</span>
                            </td>

                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {student?.name}
                              <span className="block text-[11px] font-normal text-slate-500">{student?.therapyType}</span>
                            </td>

                            <td className="px-4 py-3 text-slate-600">
                              <span className="line-through text-slate-400 block">{primaryTeacher?.name}</span>
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                                Berhalangan
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {substituteTeacher?.name || 'Terapis Pengganti'}
                              </span>
                              <p className="text-[10px] text-slate-500 mt-0.5">{substituteTeacher?.title}</p>
                            </td>

                            <td className="px-4 py-3 text-slate-600 max-w-xs">
                              <p className="line-clamp-2 text-[11px]">{session.substituteReason || 'Pengalihan terapis sementara'}</p>
                            </td>

                            <td className="px-4 py-3 text-right">
                              {session.status === 'completed' ? (
                                <span className="text-xs font-semibold text-emerald-600">Selesai & Diabsen</span>
                              ) : (
                                <span className="text-xs font-semibold text-blue-600">Menunggu Pelaksanaan</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT SISWA */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {editingStudent ? 'Edit Data Siswa Terapi' : 'Tambah Siswa Baru'}
              </h3>
              <button 
                onClick={() => setIsStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    value={studentFormData.name}
                    onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                    placeholder="Contoh: Muhammad Bintang Pratama"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Panggilan *</label>
                  <input
                    type="text"
                    required
                    value={studentFormData.nickname}
                    onChange={(e) => setStudentFormData({ ...studentFormData, nickname: e.target.value })}
                    placeholder="Contoh: Bintang"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={studentFormData.birthDate}
                    onChange={(e) => setStudentFormData({ ...studentFormData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usia Saat Ini</label>
                  <input
                    type="text"
                    value={studentFormData.age}
                    onChange={(e) => setStudentFormData({ ...studentFormData, age: e.target.value })}
                    placeholder="Contoh: 5 Tahun 3 Bulan"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Program Terapi Utama *</label>
                  <select
                    value={studentFormData.therapyType}
                    onChange={(e) => setStudentFormData({ ...studentFormData, therapyType: e.target.value as TherapyType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {therapyTypesList.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Terapi Tambahan (Opsional)</label>
                  <select
                    value={studentFormData.secondaryTherapyType}
                    onChange={(e) => setStudentFormData({ ...studentFormData, secondaryTherapyType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Tidak Ada</option>
                    {therapyTypesList.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali *</label>
                  <input
                    type="text"
                    required
                    value={studentFormData.parentName}
                    onChange={(e) => setStudentFormData({ ...studentFormData, parentName: e.target.value })}
                    placeholder="Bpk / Ibu..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / Telepon *</label>
                  <input
                    type="text"
                    required
                    value={studentFormData.parentPhone}
                    onChange={(e) => setStudentFormData({ ...studentFormData, parentPhone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Diagnosa / Observasi Awal</label>
                <input
                  type="text"
                  value={studentFormData.diagnosis}
                  onChange={(e) => setStudentFormData({ ...studentFormData, diagnosis: e.target.value })}
                  placeholder="Contoh: Sensory Processing Disorder, Speech Delay, dll."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Fokus Terapi</label>
                <input
                  type="text"
                  value={studentFormData.targetFocus}
                  onChange={(e) => setStudentFormData({ ...studentFormData, targetFocus: e.target.value })}
                  placeholder="Contoh: Modulasi sensori proprioseptif dan toleransi tekstur"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Khusus Siswa</label>
                <textarea
                  rows={2}
                  value={studentFormData.notes}
                  onChange={(e) => setStudentFormData({ ...studentFormData, notes: e.target.value })}
                  placeholder="Catatan kebiasaan, pemicu sensory overload, musik kesukaan, dll."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Daftarkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI PEMBEKUAN (FREEZE) SISWA */}
      {freezeModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-blue-700 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Snowflake className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Konfirmasi Pembekuan Status Siswa</h3>
                <p className="text-xs text-slate-500">{freezeModalData.student.name}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Dampak Status "Dibekukan":
                </p>
                <p className="mt-1 text-[11px]">
                  Siswa ini otomatis <strong>tidak akan masuk ke dalam antrean penjadwalan sesi terapi</strong> dan tidak ditagih sesi sampai status diaktifkan kembali.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan Pembekuan (Surat Dokter / Cuti Wali Murid) *
                </label>
                <textarea
                  rows={3}
                  value={freezeModalData.reason}
                  onChange={(e) => setFreezeModalData({ ...freezeModalData, reason: e.target.value })}
                  placeholder="Misal: Pemulihan rawat inap pasca sakit, cuti ke luar kota selama 1 bulan, dll."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setFreezeModalData(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmFreeze}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>Bekukan Siswa Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INPUT JADWAL SISWA BULANAN */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                Form Alokasi Jadwal & Guru Pengampu
              </h3>
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="mt-4 space-y-3.5 text-xs">
              
              {/* Select Student */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa *</label>
                <select
                  required
                  value={scheduleFormData.studentId}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => (
                    <option 
                      key={s.id} 
                      value={s.id}
                      disabled={s.status === 'frozen'}
                    >
                      {s.name} ({s.therapyType}) {s.status === 'frozen' ? '— [DIBEKUKAN / TIDAK BISA DIJADWALKAN]' : ''}
                    </option>
                  ))}
                </select>
                {students.find(s => s.id === scheduleFormData.studentId)?.status === 'frozen' && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                    Perhatian: Siswa ini berstatus dibekukan (freeze). Tidak dapat dijadwalkan sesi aktif.
                  </p>
                )}
              </div>

              {/* Select Teacher */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Guru Pengampu Utama (Terapis) *</label>
                <select
                  required
                  value={scheduleFormData.assignedTeacherId}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, assignedTeacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">-- Pilih Guru / Terapis --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} — Spesialisasi: {t.specialization || t.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weekly Frequency & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frekuensi Mingguan *</label>
                  <select
                    value={scheduleFormData.weeklyFrequency}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, weeklyFrequency: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value={1}>1x Sesi per Minggu</option>
                    <option value={2}>2x Sesi per Minggu</option>
                    <option value={3}>3x Sesi per Minggu (Intensif)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durasi Sesi Pertemuan *</label>
                  <select
                    value={scheduleFormData.durationMinutes}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value={60}>1 Jam (60 Menit)</option>
                    <option value={90}>1.5 Jam (90 Menit)</option>
                    <option value={120}>2 Jam (120 Menit)</option>
                  </select>
                </div>
              </div>

              {/* Preferred Days */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Pilih Hari Pertemuan</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => {
                    const isSelected = scheduleFormData.preferredDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          if (isSelected) {
                            setScheduleFormData({
                              ...scheduleFormData,
                              preferredDays: scheduleFormData.preferredDays.filter(d => d !== day)
                            });
                          } else {
                            setScheduleFormData({
                              ...scheduleFormData,
                              preferredDays: [...scheduleFormData.preferredDays, day]
                            });
                          }
                        }}
                        className={`py-1.5 px-2 rounded-lg text-center font-medium transition-colors border ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Slot Jam Sesi</label>
                  <input
                    type="text"
                    value={scheduleFormData.preferredTimeSlot}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, preferredTimeSlot: e.target.value })}
                    placeholder="Contoh: 09:00 - 10:00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ruangan Terapi</label>
                  <select
                    value={scheduleFormData.room}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, room: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Ruang SI Sakura (Lantai 1)">Ruang SI Sakura (Lantai 1)</option>
                    <option value="Ruang Wicara Anggrek (Lantai 2)">Ruang Wicara Anggrek (Lantai 2)</option>
                    <option value="Ruang Okupasi Melati (Lantai 2)">Ruang Okupasi Melati (Lantai 2)</option>
                    <option value="Ruang Gym Pediatrik Cempaka">Ruang Gym Pediatrik Cempaka</option>
                    <option value="Ruang ABA Kenanga (Lantai 1)">Ruang ABA Kenanga (Lantai 1)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Simpan & Terbitkan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PILIH GURU PENGGANTI (SUBSTITUTE MODAL) */}
      {substituteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-amber-700 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Tunjuk Guru Pengganti</h3>
                <p className="text-xs text-slate-500">Sesi {substituteModalData.date} ({substituteModalData.timeSlot})</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-200">
                <p><strong>Siswa:</strong> {substituteModalData.studentName}</p>
                <p><strong>Guru Utama yang Izin:</strong> {substituteModalData.teacherName}</p>
                <p className="text-slate-500"><strong>Alasan:</strong> {substituteModalData.reason}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Guru / Terapis Pengganti *
                </label>
                <select
                  value={substituteModalData.selectedSubstituteId}
                  onChange={(e) => setSubstituteModalData({
                    ...substituteModalData,
                    selectedSubstituteId: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialization || t.title})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Guru pengganti akan otomatis menerima notifikasi jadwal dan badge khusus "Guru Pengganti" di dashboard.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSubstituteModalData(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (substituteModalData.requestId) {
                    approveLeaveRequest(substituteModalData.requestId, substituteModalData.selectedSubstituteId);
                  } else if (substituteModalData.sessionId) {
                    assignSubstitute(substituteModalData.sessionId, substituteModalData.selectedSubstituteId, substituteModalData.reason);
                  }
                  setSubstituteModalData(null);
                }}
                className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg text-xs hover:bg-amber-700 transition-colors"
              >
                Tetapkan Pengganti & Setujui
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
