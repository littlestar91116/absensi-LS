import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Session, AttendanceStatus } from '../../types';
import { 
  Calendar, 
  CalendarCheck2, 
  UserCheck, 
  Clock, 
  FileEdit, 
  CheckCircle2, 
  Send, 
  UserX, 
  Sparkles, 
  Star, 
  X,
  History,
  Building,
  AlertCircle,
  Snowflake
} from 'lucide-react';

interface GuruDashboardProps {
  activeTab: string;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({ activeTab }) => {
  const { 
    currentUser, 
    sessions, 
    students, 
    attendances, 
    submitAttendance, 
    submitLeaveRequest,
    leaveRequests,
    addSession
  } = useApp();

  if (!currentUser) return null;

  // Modal Attendance State
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<Session | null>(null);
  const [attendanceForm, setAttendanceForm] = useState<{
    status: AttendanceStatus;
    therapyNotes: string;
    homeworkNotes: string;
    cooperationRating: number;
  }>({
    status: 'hadir',
    therapyNotes: '',
    homeworkNotes: '',
    cooperationRating: 5
  });

  // Modal Leave Request State
  const [selectedSessionForLeave, setSelectedSessionForLeave] = useState<Session | null>(null);
  const [leaveReason, setLeaveReason] = useState('');

  // Filter sessions that belong to the current teacher (either primary or substitute)
  const teacherSessions = sessions.filter(
    s => s.primaryTeacherId === currentUser.id || s.substituteTeacherId === currentUser.id
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Filter today's sessions (for demonstration: 2026-10-28)
  const todayDate = '2026-10-28';
  const todaySessions = teacherSessions.filter(s => s.date === todayDate);

  // Open Attendance Modal
  const handleOpenAttendanceModal = (session: Session) => {
    const existingAttendance = attendances.find(a => a.sessionId === session.id);
    setSelectedSessionForAttendance(session);
    if (existingAttendance) {
      setAttendanceForm({
        status: existingAttendance.status,
        therapyNotes: existingAttendance.therapyNotes,
        homeworkNotes: existingAttendance.homeworkNotes || '',
        cooperationRating: existingAttendance.cooperationRating || 5
      });
    } else {
      setAttendanceForm({
        status: 'hadir',
        therapyNotes: 'Anak sangat kooperatif, merespons instruksi terapis dengan baik dan target modulasi tercapai.',
        homeworkNotes: 'Latihan stimulasi ringan di rumah 10 menit setiap pagi bersama orang tua.',
        cooperationRating: 5
      });
    }
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionForAttendance) return;

    submitAttendance({
      sessionId: selectedSessionForAttendance.id,
      studentId: selectedSessionForAttendance.studentId,
      teacherId: currentUser.id,
      status: attendanceForm.status,
      therapyNotes: attendanceForm.therapyNotes,
      homeworkNotes: attendanceForm.homeworkNotes,
      cooperationRating: attendanceForm.cooperationRating
    });

    setSelectedSessionForAttendance(null);
  };

  // Open Leave Request Modal
  const handleOpenLeaveModal = (session: Session) => {
    setSelectedSessionForLeave(session);
    setLeaveReason('');
  };

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionForLeave || !leaveReason.trim()) return;

    submitLeaveRequest({
      teacherId: currentUser.id,
      sessionId: selectedSessionForLeave.id,
      sessionDate: selectedSessionForLeave.date,
      reason: leaveReason
    });

    alert('Permohonan izin sesi berhasil diajukan ke Kepala Sekolah untuk penunjukan guru pengganti.');
    setSelectedSessionForLeave(null);
  };

  return (
    <div className="space-y-6">

      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
            Little Star Learning Center
          </span>
          <h2 className="text-xl font-bold mt-0.5">{currentUser.name}</h2>
          <p className="text-xs text-emerald-100 flex items-center gap-2 mt-1">
            <span>{currentUser.title}</span>
            <span>·</span>
            <span>Spesialisasi: {currentUser.specialization || 'Terapis Klinis'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
          <div className="text-center px-3 border-r border-white/20">
            <span className="block text-xl font-bold font-mono">{teacherSessions.length}</span>
            <span className="text-[11px] text-emerald-100">Total Sesi</span>
          </div>
          <div className="text-center px-3">
            <span className="block text-xl font-bold font-mono">
              {teacherSessions.filter(s => s.substituteTeacherId === currentUser.id).length}
            </span>
            <span className="text-[11px] text-amber-200 font-semibold">Guru Pengganti</span>
          </div>
        </div>
      </div>

      {/* New Teacher Notice: If no sessions are assigned yet */}
      {teacherSessions.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900">
                Akun Terapis Anda Aktif & Siap Digunakan!
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Saat ini Kepala Sekolah belum mengalokasikan jadwal sesi murid untuk Anda. Anda dapat membuat 1 sesi latihan terapi hari ini untuk mencoba fitur input absensi, catatan evaluasi, dan pengajuan izin.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const activeStudent = students.find(s => s.status === 'active') || students[0];
              if (!activeStudent) {
                alert('Belum ada data siswa aktif.');
                return;
              }
              addSession({
                scheduleId: 'sch-new',
                studentId: activeStudent.id,
                date: '2026-10-28',
                dayName: 'Rabu',
                timeSlot: '09:00 - 10:00',
                room: 'Ruang SI Sakura (Lantai 1)',
                primaryTeacherId: currentUser.id,
                isSubstituted: false,
                status: 'scheduled'
              });
              alert(`Sesi uji coba berhasil dibuat dengan ananda ${activeStudent.name}! Anda sekarang dapat mengisi absensi dan catatan terapi.`);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs whitespace-nowrap self-start md:self-center transition-colors cursor-pointer"
          >
            ⚡ Buat 1 Sesi Terapi Uji Coba Hari Ini
          </button>
        </div>
      )}

      {/* TAB 1: JADWAL MENGAJAR */}
      {activeTab === 'jadwal_mengajar' && (
        <div className="space-y-6">
          
          {/* Today's Spotlight Sessions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                  Jadwal Terapi Hari Ini (Rabu, 28 Oktober 2026)
                </h3>
                <p className="text-xs text-slate-500">
                  Periksa kehadiran dan input catatan perkembangan anak langsung setelah sesi berlangsung
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {todaySessions.length} Sesi Terjadwal
              </span>
            </div>

            {todaySessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl">
                Tidak ada jadwal mengajar pada tanggal hari ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todaySessions.map((session) => {
                  const student = students.find(s => s.id === session.studentId);
                  const isSubstituteForThisSession = session.substituteTeacherId === currentUser.id;
                  const isPrimaryTeaching = session.primaryTeacherId === currentUser.id && !session.isSubstituted;
                  const hasAttendance = attendances.some(a => a.sessionId === session.id);
                  const attendanceRecord = attendances.find(a => a.sessionId === session.id);

                  return (
                    <div 
                      key={session.id}
                      className={`rounded-xl p-4 border transition-all ${
                        isSubstituteForThisSession 
                          ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300/40' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          {/* Distinct Badge for Substitute Teacher Assignment */}
                          {isSubstituteForThisSession && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-white shadow-2xs mb-1.5">
                              <Sparkles className="w-3 h-3" />
                              PENUGASAN SEBAGAI GURU PENGGANTI
                            </span>
                          )}

                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-base">{student?.name}</h4>
                            {student?.status === 'frozen' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                <Snowflake className="w-3 h-3 text-blue-600" />
                                DIBEKUKAN (FREEZE)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">
                            {student?.therapyType} · {student?.age}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded block">
                            {session.timeSlot}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {session.room}
                          </span>
                        </div>
                      </div>

                      {/* Diagnostic Target */}
                      <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80 my-2.5 text-xs">
                        <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wide">
                          Fokus Target Sesi:
                        </span>
                        <p className="text-slate-700 mt-0.5">{student?.targetFocus}</p>
                      </div>

                      {/* If substituted, explain why */}
                      {isSubstituteForThisSession && (
                        <p className="text-[11px] text-amber-900 bg-amber-100/70 p-2 rounded-lg border border-amber-200 mb-3">
                          <strong>Keterangan Limpahan:</strong> {session.substituteReason || 'Menggantikan guru utama yang sedang berhalangan.'}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          {hasAttendance ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Absensi Selesai ({attendanceRecord?.status.toUpperCase()})
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Belum diisi</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Leave button if primary teacher and hasn't passed */}
                          {session.primaryTeacherId === currentUser.id && !session.isSubstituted && !hasAttendance && (
                            <button
                              onClick={() => handleOpenLeaveModal(session)}
                              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Ajukan Izin untuk Sesi Ini"
                            >
                              Ajukan Izin
                            </button>
                          )}

                          {/* Attendance input button */}
                          <button
                            onClick={() => handleOpenAttendanceModal(session)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>{hasAttendance ? 'Ubah Absensi' : 'Input Absensi & Catatan'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* All Scheduled Sessions Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Semua Jadwal Sesi Terapi Bulan Ini
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Tanggal & Hari</th>
                    <th className="px-4 py-3">Jam & Ruangan</th>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Peran Anda</th>
                    <th className="px-4 py-3">Status Absensi</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teacherSessions.map((session) => {
                    const student = students.find(s => s.id === session.studentId);
                    const isSubstitute = session.substituteTeacherId === currentUser.id;
                    const isPrimary = session.primaryTeacherId === currentUser.id;
                    const attendance = attendances.find(a => a.sessionId === session.id);

                    return (
                      <tr 
                        key={session.id} 
                        className={`hover:bg-slate-50 ${isSubstitute ? 'bg-amber-50/30' : ''}`}
                      >
                        <td className="px-4 py-3 font-medium">
                          <p className="font-semibold text-slate-900">{session.date}</p>
                          <span className="text-[11px] text-slate-500">{session.dayName}</span>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-mono font-medium text-slate-800">{session.timeSlot}</p>
                          <span className="text-[11px] text-slate-500">{session.room}</span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-slate-900">{student?.name}</p>
                            {student?.status === 'frozen' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                                FREEZE
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">{student?.therapyType}</span>
                        </td>

                        <td className="px-4 py-3">
                          {isSubstitute ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Guru Pengganti
                            </span>
                          ) : (
                            <span className="text-slate-700 font-medium">
                              Guru Utama
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {attendance ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              attendance.status === 'hadir' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : attendance.status === 'sakit' 
                                ? 'bg-blue-100 text-blue-800'
                                : attendance.status === 'izin'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {attendance.status.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Belum diisi</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleOpenAttendanceModal(session)}
                            className="px-2.5 py-1 text-xs text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            {attendance ? 'Edit' : 'Absen'}
                          </button>
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

      {/* TAB 2: INPUT ABSENSI & CATATAN LANGSUNG */}
      {activeTab === 'absensi_input' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-emerald-600" />
              Pilih Sesi Terapi untuk Input Absensi & Catatan Perkembangan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada salah satu sesi di bawah untuk membuka form pengisian evaluasi klinis anak
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teacherSessions.map((session) => {
              const student = students.find(s => s.id === session.studentId);
              const attendance = attendances.find(a => a.sessionId === session.id);
              const isSub = session.substituteTeacherId === currentUser.id;

              return (
                <div
                  key={session.id}
                  onClick={() => handleOpenAttendanceModal(session)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all hover:shadow-xs ${
                    attendance 
                      ? 'bg-slate-50 border-slate-200' 
                      : 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900">{session.date} ({session.dayName})</span>
                    {isSub && (
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                        Pengganti
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">{student?.name}</p>
                  <p className="text-[11px] text-slate-500">{student?.therapyType} · {session.timeSlot}</p>

                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-600">
                      {attendance ? `Status: ${attendance.status.toUpperCase()}` : 'Belum diabsen'}
                    </span>
                    <span className="text-blue-600 font-semibold">
                      {attendance ? 'Perbarui →' : 'Isi Absen →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PENGAJUAN IZIN SESI */}
      {activeTab === 'izin_guru' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <UserX className="w-5 h-5 text-rose-600" />
              Pengajuan Izin Ketidakhadiran Terapis
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Jika Anda berhalangan hadir pada sesi terapi, ajukan izin ke Kepala Sekolah agar segera dialokasikan guru pengganti
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teacherSessions.filter(s => s.primaryTeacherId === currentUser.id && s.status === 'scheduled').map((s) => {
                const student = students.find(std => std.id === s.studentId);
                const isRequested = leaveRequests.some(r => r.sessionId === s.id);
                const reqData = leaveRequests.find(r => r.sessionId === s.id);

                return (
                  <div key={s.id} className="p-4 border rounded-xl bg-slate-50 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{s.date} · {s.timeSlot}</span>
                      {isRequested ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          reqData?.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : reqData?.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {reqData?.status.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Sesi Normal</span>
                      )}
                    </div>

                    <p className="font-semibold text-slate-800">{student?.name} ({student?.therapyType})</p>
                    <p className="text-slate-500">{s.room}</p>

                    {isRequested ? (
                      <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                        Alasan: {reqData?.reason}
                      </p>
                    ) : (
                      <button
                        onClick={() => handleOpenLeaveModal(s)}
                        className="mt-2 w-full py-1.5 px-3 bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold rounded-lg transition-colors text-center"
                      >
                        Ajukan Izin pada Sesi Ini
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RIWAYAT EVALUASI & CATATAN */}
      {activeTab === 'riwayat_catatan' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-indigo-600" />
            Riwayat Catatan Terapi yang Telah Diinput
          </h3>

          <div className="space-y-4">
            {attendances.filter(a => a.teacherId === currentUser.id).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada riwayat absensi yang diinput.</p>
            ) : (
              attendances.filter(a => a.teacherId === currentUser.id).map((att) => {
                const student = students.find(s => s.id === att.studentId);
                const session = sessions.find(s => s.id === att.sessionId);

                return (
                  <div key={att.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{student?.name}</span>
                        <span className="text-slate-500">({student?.therapyType})</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">{att.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-semibold">Status:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                        {att.status}
                      </span>
                      <span>·</span>
                      <span className="font-semibold">Kooperatif:</span>
                      <span className="text-amber-500 font-bold">★ {att.cooperationRating}/5</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="font-semibold text-slate-700 text-[11px]">Catatan Klinis Perkembangan:</p>
                      <p className="text-slate-600 mt-0.5">{att.therapyNotes}</p>
                    </div>

                    {att.homeworkNotes && (
                      <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200 text-blue-900">
                        <p className="font-semibold text-[11px]">Rekomendasi Stimulasi di Rumah (PR Wali Murid):</p>
                        <p className="mt-0.5">{att.homeworkNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL: INPUT ABSENSI & CATATAN TERAPI */}
      {selectedSessionForAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-emerald-600" />
                Form Absensi & Catatan Perkembangan Anak
              </h3>
              <button 
                onClick={() => setSelectedSessionForAttendance(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Session Details Header */}
            <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p>
                <strong>Siswa:</strong> {students.find(s => s.id === selectedSessionForAttendance.studentId)?.name}
              </p>
              <p>
                <strong>Tanggal & Jam:</strong> {selectedSessionForAttendance.date} ({selectedSessionForAttendance.timeSlot})
              </p>
              {selectedSessionForAttendance.substituteTeacherId === currentUser.id && (
                <p className="text-amber-700 font-semibold">
                  * Anda mengajar sesi ini sebagai Guru Pengganti
                </p>
              )}
            </div>

            <form onSubmit={handleSaveAttendance} className="mt-4 space-y-4 text-xs">
              
              {/* Attendance Status Checkbox/Segmented */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Status Kehadiran Siswa *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['hadir', 'sakit', 'izin', 'alpha'] as AttendanceStatus[]).map((st) => {
                    const isSelected = attendanceForm.status === st;
                    return (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setAttendanceForm({ ...attendanceForm, status: st })}
                        className={`py-2 px-3 rounded-lg text-center font-bold uppercase transition-all border ${
                          isSelected
                            ? st === 'hadir'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : st === 'sakit'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : st === 'izin'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cooperation Rating */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Skor Mood & Tingkat Kooperatif Anak (1 - 5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setAttendanceForm({ ...attendanceForm, cooperationRating: num })}
                      className={`p-2 rounded-lg border flex items-center justify-center gap-1 font-bold ${
                        attendanceForm.cooperationRating >= num
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${attendanceForm.cooperationRating >= num ? 'fill-amber-400' : ''}`} />
                      <span>{num}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Therapy Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Perkembangan Sesi Terapi Harian *
                </label>
                <textarea
                  rows={3}
                  required
                  value={attendanceForm.therapyNotes}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, therapyNotes: e.target.value })}
                  placeholder="Deskripsikan respon anak terhadap stimulasi, durasi fokus, peningkatan motorik/bicara..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Homework / Home Stimulation Recommendation */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rekomendasi Stimulasi di Rumah (PR Wali Murid)
                </label>
                <textarea
                  rows={2}
                  value={attendanceForm.homeworkNotes}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, homeworkNotes: e.target.value })}
                  placeholder="Latihan mandiri yang disarankan dilakukan orang tua di rumah untuk memperkuat hasil terapi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSessionForAttendance(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan & Kirim Absensi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AJUKAN IZIN KETIDAKHADIRAN */}
      {selectedSessionForLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-700 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <UserX className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Ajukan Izin Ketidakhadiran Sesi</h3>
                <p className="text-xs text-slate-500">
                  Tanggal {selectedSessionForLeave.date} ({selectedSessionForLeave.timeSlot})
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-3.5 text-xs">
              <p className="text-slate-600">
                Pengajuan ini akan diteruskan ke Kepala Sekolah untuk menunjuk guru pengganti yang sesuai agar murid tetap terlayani.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan Izin / Berhalangan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Misal: Sakit demam berdarah / Mengikuti pelatihan klinis kedokteran okupasi / Urusan keluarga mendesak..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSessionForLeave(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Kirim Permohonan Izin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
