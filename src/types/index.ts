export type UserRole = 'yayasan' | 'kepala_sekolah' | 'guru' | 'murid';

export type UserStatus = 'active' | 'frozen' | 'inactive';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  phone: string;
  title: string;
  avatarColor: string;
  status: UserStatus;
  freezeReason?: string;
  frozenAt?: string;
  studentId?: string; // Khusus role 'murid' untuk menghubungkan ke profil anak
  specialization?: string; // Khusus role 'guru'
}

export type TherapyType = 
  | 'Sensori Integrasi (SI)'
  | 'Terapi Wicara (TW)'
  | 'Terapi Okupasi (TO)'
  | 'Fisioterapi Pediatrik'
  | 'Terapi Perilaku (ABA)';

export type StudentStatus = 'active' | 'frozen' | 'inactive';

export interface Student {
  id: string;
  name: string;
  nickname: string;
  birthDate: string;
  age: string;
  parentName: string;
  parentPhone: string;
  therapyType: TherapyType;
  secondaryTherapyType?: TherapyType;
  status: StudentStatus;
  freezeReason?: string;
  frozenAt?: string;
  notes: string;
  diagnosis: string;
  registrationDate: string;
  targetFocus: string;
}

export interface MonthlySchedule {
  id: string;
  studentId: string;
  month: number; // 1 - 12
  year: number;
  weeklyFrequency: number; // 1, 2, atau 3
  durationMinutes: number; // 60, 90, atau 120
  assignedTeacherId: string;
  room: string;
  preferredDays: string[];
  preferredTimeSlot: string;
  notes?: string;
}

// Pengajuan Perubahan Jadwal oleh Kepala Sekolah yang membutuhkan persetujuan Super Admin / Yayasan
export interface ScheduleChangeProposal {
  id: string;
  scheduleId?: string; // Jika revisi jadwal eksisting
  studentId: string;
  month: number;
  year: number;
  weeklyFrequency: number;
  durationMinutes: number;
  assignedTeacherId: string;
  room: string;
  preferredDays: string[];
  preferredTimeSlot: string;
  changeReason: string; // Alasan perubahan jadwal dari Kepala Sekolah
  proposedBy: string; // Nama Kepala Sekolah
  proposedById: string;
  proposedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string; // Nama Super Admin / Yayasan
  reviewedAt?: string;
  reviewNote?: string;
}

export interface Session {
  id: string;
  scheduleId?: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  dayName: string;
  timeSlot: string;
  room: string;
  primaryTeacherId: string;
  substituteTeacherId?: string;
  isSubstituted: boolean;
  substituteReason?: string;
  leaveRequestId?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export type AttendanceStatus = 'hadir' | 'sakit' | 'izin' | 'alpha';

export interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  teacherId: string; // Guru yang mengabsen (bisa guru pengganti)
  status: AttendanceStatus;
  therapyNotes: string; // Catatan perkembangan sesi
  homeworkNotes?: string; // Latihan stimulasi di rumah
  cooperationRating: number; // 1 (kurang kooperatif) - 5 (sangat antusias)
  timestamp: string;
}

export interface TeacherLeaveRequest {
  id: string;
  teacherId: string;
  sessionId: string;
  sessionDate: string;
  reason: string;
  substituteTeacherId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Pengaturan Hak Akses Tampilan Website (Hanya Dikelola Super Admin / Yayasan)
export interface ViewPermission {
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'operational' | 'clinical' | 'administrative';
  allowedRoles: UserRole[]; // Role mana saja yang diberi izin membuka fitur/tab ini
}
