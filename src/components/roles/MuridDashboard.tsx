import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HeartHandshake, 
  Calendar, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  Home, 
  Star, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  Activity,
  AlertCircle
} from 'lucide-react';

interface MuridDashboardProps {
  activeTab: string;
}

export const MuridDashboard: React.FC<MuridDashboardProps> = ({ activeTab }) => {
  const { currentUser, students, sessions, attendances, users } = useApp();

  if (!currentUser) return null;

  // Find linked student for this parent
  const parentStudent = students.find(s => s.id === currentUser.studentId) || students[0];
  const [selectedStudentId, setSelectedStudentId] = useState<string>(parentStudent ? parentStudent.id : '');

  const activeStudent = students.find(s => s.id === selectedStudentId) || parentStudent;
  const isFrozen = activeStudent.status === 'frozen';

  // Filter student sessions & attendances
  const studentSessions = sessions
    .filter(s => s.studentId === activeStudent.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const studentAttendances = attendances
    .filter(a => a.studentId === activeStudent.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const teachers = users.filter(u => u.role === 'guru');

  // Today session check (2026-10-28)
  const todaySession = studentSessions.find(s => s.date === '2026-10-28');
  const todayPrimaryTeacher = teachers.find(t => t.id === todaySession?.primaryTeacherId);
  const todaySubstituteTeacher = teachers.find(t => t.id === todaySession?.substituteTeacherId);

  return (
    <div className="space-y-6">

      {/* Read-Only Notice Bar */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 text-cyan-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0 text-cyan-700">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-cyan-950">
              Portal Wali Murid & Ananda (Strict Read-Only)
            </p>
            <p className="text-[11px] text-cyan-800">
              Akses khusus untuk memantau jadwal terapi, guru pengampu, serta evaluasi perkembangan ananda secara transparan.
            </p>
          </div>
        </div>

        {/* Switch child selector for testing preview */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-cyan-800 font-medium">Pilih Siswa:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-2.5 py-1 text-xs border border-cyan-300 rounded-lg bg-white text-cyan-900 focus:outline-hidden"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.nickname})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Child Profile Snapshot Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-xs">
              {activeStudent.nickname.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{activeStudent.name}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {activeStudent.nickname}
                </span>
                {isFrozen && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Status: Dibekukan (Freeze)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Usia: {activeStudent.age} · Terapi: <strong className="text-slate-700">{activeStudent.therapyType}</strong>
                {activeStudent.secondaryTherapyType ? ` & ${activeStudent.secondaryTherapyType}` : ''}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p><strong>Diagnosa Klinis:</strong> {activeStudent.diagnosis}</p>
            <p><strong>Fokus Terapi Saat Ini:</strong> {activeStudent.targetFocus}</p>
          </div>
        </div>

        {/* Frozen Alert for Parents */}
        {isFrozen && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Informasi Status Cuti / Freeze:</p>
              <p className="mt-0.5 text-blue-800">
                {activeStudent.freezeReason || 'Status sesi ananda sedang dibekukan sementara. Kuota jadwal tetap disimpan dan tidak ada penagihan sesi.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TODAY'S THERAPY HIGHLIGHT */}
      {todaySession && (
        <div className={`rounded-2xl p-5 border shadow-xs ${
          todaySession.isSubstituted 
            ? 'bg-amber-50/60 border-amber-300' 
            : 'bg-emerald-50/50 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Sesi Terapi Hari Ini (Rabu, 28 Oktober 2026)
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
              {todaySession.timeSlot}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500">Ruangan Terapi:</p>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">{todaySession.room}</p>
            </div>

            <div>
              <p className="text-slate-500">Terapis Pengampu:</p>
              {todaySession.isSubstituted ? (
                <div>
                  <p className="font-bold text-amber-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    {todaySubstituteTeacher?.name || 'Guru Pengganti'}
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                      Guru Pengganti
                    </span>
                  </p>
                  <p className="text-[11px] text-amber-800 mt-1">
                    * {todaySession.substituteReason || 'Guru utama berhalangan hadir dan telah digantikan terapis pengganti yang kompeten.'}
                  </p>
                </div>
              ) : (
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {todayPrimaryTeacher?.name} ({todayPrimaryTeacher?.title})
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: JADWAL BULANAN ANANDA */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Jadwal Terapi Ananda (Bulan Ini)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tanggal & Hari</th>
                <th className="px-4 py-3">Jam & Ruangan</th>
                <th className="px-4 py-3">Terapis Pengampu</th>
                <th className="px-4 py-3">Catatan Terapis</th>
                <th className="px-4 py-3 text-right">Status Sesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {studentSessions.map((session) => {
                const primaryTeacher = teachers.find(t => t.id === session.primaryTeacherId);
                const substituteTeacher = teachers.find(t => t.id === session.substituteTeacherId);
                const attendance = attendances.find(a => a.sessionId === session.id);

                return (
                  <tr key={session.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">
                      <p className="font-semibold text-slate-900">{session.date}</p>
                      <span className="text-[11px] text-slate-500">{session.dayName}</span>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-mono font-medium text-slate-800">{session.timeSlot}</p>
                      <span className="text-[11px] text-slate-500">{session.room}</span>
                    </td>

                    <td className="px-4 py-3">
                      {session.isSubstituted ? (
                        <div>
                          <p className="font-bold text-amber-900">
                            {substituteTeacher?.name}
                          </p>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.2 rounded border border-amber-200">
                            Pengganti Sementara
                          </span>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-800">{primaryTeacher?.name}</p>
                          <span className="text-[11px] text-slate-500">{primaryTeacher?.title}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 max-w-xs text-slate-600">
                      {attendance ? (
                        <p className="line-clamp-2 text-[11px]">{attendance.therapyNotes}</p>
                      ) : (
                        <span className="text-slate-400 italic">Menunggu sesi terlaksana</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
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
                        <span className="text-slate-400 text-[11px]">Terjadwal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: RIWAYAT EVALUASI & REKOMENDASI LATIHAN DI RUMAH (PR) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Riwayat Evaluasi Perkembangan & Latihan Mandiri di Rumah (PR Wali Murid)
        </h3>

        <div className="space-y-4">
          {studentAttendances.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada evaluasi klinis yang tercatat.</p>
          ) : (
            studentAttendances.map((att) => {
              const teacher = teachers.find(t => t.id === att.teacherId);
              const session = sessions.find(s => s.id === att.sessionId);

              return (
                <div key={att.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Sesi Tanggal: {session?.date} ({session?.dayName})
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {att.status}
                      </span>
                    </div>

                    <div className="text-slate-500 text-[11px] flex items-center gap-2">
                      <span>Terapis: <strong>{teacher?.name}</strong></span>
                      <span>·</span>
                      <span className="text-amber-500 font-bold">Respon: ★ {att.cooperationRating}/5</span>
                    </div>
                  </div>

                  {/* Therapy clinical notes */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-800 text-xs flex items-center gap-1.5 mb-1">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      Observasi & Kemajuan Terapi Hari Ini:
                    </p>
                    <p className="text-slate-600 text-xs leading-relaxed">{att.therapyNotes}</p>
                  </div>

                  {/* Homework */}
                  {att.homeworkNotes && (
                    <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-200 text-indigo-950">
                      <p className="font-semibold text-xs flex items-center gap-1.5 text-indigo-900 mb-1">
                        <Home className="w-3.5 h-3.5 text-indigo-600" />
                        Rekomendasi Stimulasi di Rumah (PR Wali Murid):
                      </p>
                      <p className="text-indigo-800 text-xs leading-relaxed">{att.homeworkNotes}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
