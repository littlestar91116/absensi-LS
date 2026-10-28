import { User, Student, MonthlySchedule, Session, Attendance, TeacherLeaveRequest } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-yayasan',
    name: 'Dr. Hj. Nurul Hidayati, M.Psi',
    role: 'yayasan',
    email: 'nurul.hidayati@terapina.org',
    phone: '0811-2345-6789',
    title: 'Ketua Yayasan Pelita Inklusi',
    avatarColor: 'bg-indigo-600'
  },
  {
    id: 'usr-kepsek',
    name: 'Ahmad Fauzi, S.Pd, M.Ed',
    role: 'kepala_sekolah',
    email: 'ahmad.fauzi@terapina.org',
    phone: '0812-3456-7890',
    title: 'Kepala Sekolah & Koordinator Klinis',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'usr-guru-kiky',
    name: 'Kiky Amanda, S.Tr.Kes',
    role: 'guru',
    email: 'kiky.amanda@terapina.org',
    phone: '0813-4567-8901',
    title: 'Terapis Sensori Integrasi (SI)',
    specialization: 'Sensori Integrasi (SI)',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'usr-guru-bayu',
    name: 'Bayu Pratama, S.SiT',
    role: 'guru',
    email: 'bayu.pratama@terapina.org',
    phone: '0814-5678-9012',
    title: 'Terapis Wicara Senior',
    specialization: 'Terapi Wicara (TW)',
    avatarColor: 'bg-teal-600'
  },
  {
    id: 'usr-guru-ratih',
    name: 'Ratih Kusuma, A.Md.OT',
    role: 'guru',
    email: 'ratih.kusuma@terapina.org',
    phone: '0815-6789-0123',
    title: 'Terapis Okupasi (TO)',
    specialization: 'Terapi Okupasi (TO)',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'usr-guru-dimas',
    name: 'Dimas Anggara, S.Ft, Ftr',
    role: 'guru',
    email: 'dimas.anggara@terapina.org',
    phone: '0816-7890-1234',
    title: 'Fisioterapis Pediatrik',
    specialization: 'Fisioterapi Pediatrik',
    avatarColor: 'bg-purple-600'
  },
  {
    id: 'usr-murid-bintang',
    name: 'Bpk. Hendra Wijaya',
    role: 'murid',
    email: 'hendra.wijaya@gmail.com',
    phone: '0812-8899-1234',
    title: 'Wali Murid (Ananda Bintang)',
    studentId: 'std-001',
    avatarColor: 'bg-cyan-600'
  },
  {
    id: 'usr-murid-kenzo',
    name: 'Ibu Maya Putri, S.E.',
    role: 'murid',
    email: 'maya.putri@gmail.com',
    phone: '0813-7722-9900',
    title: 'Wali Murid (Ananda Kenzo)',
    studentId: 'std-002',
    avatarColor: 'bg-rose-600'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-001',
    name: 'Muhammad Bintang Pratama',
    nickname: 'Bintang',
    birthDate: '2021-07-15',
    age: '5 Tahun 3 Bulan',
    parentName: 'Bpk. Hendra Wijaya & Ibu Anita',
    parentPhone: '0812-8899-1234',
    therapyType: 'Sensori Integrasi (SI)',
    secondaryTherapyType: 'Terapi Okupasi (TO)',
    status: 'active',
    diagnosis: 'Sensory Processing Disorder (Tactile & Vestibular Defensive)',
    targetFocus: 'Meningkatkan modulasi sensori proprioseptif dan toleransi tekstur kasar',
    notes: 'Anak responsif terhadap musik instrumental lembut. Hindari lampu sorot langsung.',
    registrationDate: '2025-01-10'
  },
  {
    id: 'std-002',
    name: 'Kenzo Al-Fatih',
    nickname: 'Kenzo',
    birthDate: '2022-02-20',
    age: '4 Tahun 8 Bulan',
    parentName: 'Ibu Maya Putri',
    parentPhone: '0813-7722-9900',
    therapyType: 'Terapi Wicara (TW)',
    status: 'active',
    diagnosis: 'Expressive Speech Delay & Hambatan Oro-Motorik',
    targetFocus: 'Peningkatan kosakata 2-3 kata per kalimat dan kekuatan otot bibir/lidah',
    notes: 'Senang stimulasi visual bergambar binatang. Perlu jeda minum air hangat tiap 20 menit.',
    registrationDate: '2025-03-05'
  },
  {
    id: 'std-003',
    name: 'Nadhira Az-Zahra',
    nickname: 'Dhira',
    birthDate: '2020-09-12',
    age: '6 Tahun 1 Bulan',
    parentName: 'Ibu Siska Amelia',
    parentPhone: '0811-3456-7890',
    therapyType: 'Terapi Okupasi (TO)',
    status: 'active',
    diagnosis: 'Hambatan Koordinasi Bilateral & Visual Motor',
    targetFocus: 'Peningkatan genggaman pensil (tripod grasp) dan kemandirian memasang kancing baju',
    notes: 'Sangat kooperatif dengan pujian verbal positif.',
    registrationDate: '2025-02-14'
  },
  {
    id: 'std-004',
    name: 'Rayhan Danendra',
    nickname: 'Rayhan',
    birthDate: '2019-10-04',
    age: '7 Tahun 0 Bulan',
    parentName: 'Bpk. Gunawan Wibowo',
    parentPhone: '0815-6677-8899',
    therapyType: 'Terapi Perilaku (ABA)',
    secondaryTherapyType: 'Terapi Wicara (TW)',
    status: 'active',
    diagnosis: 'Autism Spectrum Condition (ASC) Level 1',
    targetFocus: 'Kepatuhan instruksi 2 tahap dan kontak mata terarah saat berinteraksi',
    notes: 'Memiliki kecemasan pada suara blender atau mesin vakum.',
    registrationDate: '2024-11-20'
  },
  {
    id: 'std-005',
    name: 'Clarissa Putri Maharani',
    nickname: 'Icha',
    birthDate: '2021-04-18',
    age: '5 Tahun 6 Bulan',
    parentName: 'Ibu Ratna Dewi',
    parentPhone: '0812-4455-6677',
    therapyType: 'Sensori Integrasi (SI)',
    status: 'frozen',
    freezeReason: 'Pemulihan medis pasca tonsilektomi & disarankan istirahat fisik 3-4 minggu (Konfirmasi Resmi Wali: 18 Okt 2026)',
    frozenAt: '2026-10-18',
    diagnosis: 'Sensory Modulation Dysfunction',
    targetFocus: 'Vestibular input dan integrasi refleks primitif',
    notes: 'Status dibekukan sementara. Slot waktu dan kuota terapis direservasi tanpa penagihan sesi.',
    registrationDate: '2025-04-01'
  },
  {
    id: 'std-006',
    name: 'Arka Fabian',
    nickname: 'Arka',
    birthDate: '2022-11-05',
    age: '3 Tahun 11 Bulan',
    parentName: 'Bpk. Denny Kusumo',
    parentPhone: '0818-9900-1122',
    therapyType: 'Fisioterapi Pediatrik',
    status: 'active',
    diagnosis: 'Mild Spastic Diplegia & Postural Instability',
    targetFocus: 'Peningkatan pola berjalan independen dan penguatan core muscles',
    notes: 'Gunakan ankle foot orthosis (AFO) pada sesi gym anak.',
    registrationDate: '2025-06-12'
  },
  {
    id: 'std-007',
    name: 'Fathir Rizky Ananda',
    nickname: 'Fathir',
    birthDate: '2018-08-25',
    age: '8 Tahun 2 Bulan',
    parentName: 'Ibu Diana Safitri',
    parentPhone: '0813-2233-4455',
    therapyType: 'Terapi Wicara (TW)',
    status: 'inactive',
    diagnosis: 'Speech Sound Disorder (Fonologis)',
    targetFocus: 'Program selesai per September 2026, dinyatakan lulus evaluasi mandiri',
    notes: 'Lulus terapi wicara. Riwayat arsip disimpan.',
    registrationDate: '2024-08-10'
  }
];

export const INITIAL_SCHEDULES: MonthlySchedule[] = [
  {
    id: 'sch-001',
    studentId: 'std-001',
    month: 10,
    year: 2026,
    weeklyFrequency: 2,
    durationMinutes: 60,
    assignedTeacherId: 'usr-guru-kiky',
    room: 'Ruang SI Sakura (Lantai 1)',
    preferredDays: ['Senin', 'Rabu'],
    preferredTimeSlot: '09:00 - 10:00',
    notes: 'Paket Terapi Intensif 2x seminggu'
  },
  {
    id: 'sch-002',
    studentId: 'std-002',
    month: 10,
    year: 2026,
    weeklyFrequency: 2,
    durationMinutes: 60,
    assignedTeacherId: 'usr-guru-bayu',
    room: 'Ruang Wicara Anggrek (Lantai 2)',
    preferredDays: ['Selasa', 'Kamis'],
    preferredTimeSlot: '10:30 - 11:30',
    notes: 'Terapi Wicara fokus oromotorik'
  },
  {
    id: 'sch-003',
    studentId: 'std-003',
    month: 10,
    year: 2026,
    weeklyFrequency: 3,
    durationMinutes: 90,
    assignedTeacherId: 'usr-guru-ratih',
    room: 'Ruang Okupasi Melati (Lantai 2)',
    preferredDays: ['Senin', 'Rabu', 'Jumat'],
    preferredTimeSlot: '13:00 - 14:30',
    notes: 'Okupasi & Pra-Akademik'
  },
  {
    id: 'sch-004',
    studentId: 'std-004',
    month: 10,
    year: 2026,
    weeklyFrequency: 3,
    durationMinutes: 120,
    assignedTeacherId: 'usr-guru-bayu',
    room: 'Ruang ABA Kenanga (Lantai 1)',
    preferredDays: ['Senin', 'Rabu', 'Jumat'],
    preferredTimeSlot: '08:30 - 10:30',
    notes: 'Program ABA Intensif'
  },
  {
    id: 'sch-006',
    studentId: 'std-006',
    month: 10,
    year: 2026,
    weeklyFrequency: 2,
    durationMinutes: 60,
    assignedTeacherId: 'usr-guru-dimas',
    room: 'Ruang Gym Pediatrik Cempaka',
    preferredDays: ['Selasa', 'Jumat'],
    preferredTimeSlot: '14:00 - 15:00',
    notes: 'Fisioterapi motorik kasar'
  }
];

export const INITIAL_SESSIONS: Session[] = [
  // Sesi Bintang (Senin & Rabu)
  {
    id: 'ses-001',
    scheduleId: 'sch-001',
    studentId: 'std-001',
    date: '2026-10-05',
    dayName: 'Senin',
    timeSlot: '09:00 - 10:00',
    room: 'Ruang SI Sakura (Lantai 1)',
    primaryTeacherId: 'usr-guru-kiky',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-002',
    scheduleId: 'sch-001',
    studentId: 'std-001',
    date: '2026-10-07',
    dayName: 'Rabu',
    timeSlot: '09:00 - 10:00',
    room: 'Ruang SI Sakura (Lantai 1)',
    primaryTeacherId: 'usr-guru-kiky',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-003',
    scheduleId: 'sch-001',
    studentId: 'std-001',
    date: '2026-10-12',
    dayName: 'Senin',
    timeSlot: '09:00 - 10:00',
    room: 'Ruang SI Sakura (Lantai 1)',
    primaryTeacherId: 'usr-guru-kiky',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-004',
    scheduleId: 'sch-001',
    studentId: 'std-001',
    date: '2026-10-14',
    dayName: 'Rabu',
    timeSlot: '09:00 - 10:00',
    room: 'Ruang SI Sakura (Lantai 1)',
    primaryTeacherId: 'usr-guru-kiky',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-005',
    scheduleId: 'sch-001',
    studentId: 'std-001',
    date: '2026-10-19',
    dayName: 'Senin',
    timeSlot: '09:00 - 10:00',
    room: 'Ruang SI Sakura (Lantai 1)',
    primaryTeacherId: 'usr-guru-kiky',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-006',
    scheduleId: 'sch-001',
    studentId: 'std-001',
    date: '2026-10-21',
    dayName: 'Rabu',
    timeSlot: '09:00 - 10:00',
    room: 'Ruang SI Sakura (Lantai 1)',
    primaryTeacherId: 'usr-guru-kiky',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-007',
    scheduleId: 'sch-001',
    studentId: 'std-001',
    date: '2026-10-26',
    dayName: 'Senin',
    timeSlot: '09:00 - 10:00',
    room: 'Ruang SI Sakura (Lantai 1)',
    primaryTeacherId: 'usr-guru-kiky',
    isSubstituted: false,
    status: 'completed'
  },
  // HARI INI: 2026-10-28 (Rabu) - Sesi Bintang dengan GURU PENGGANTI (Bu Ratih Kusuma) karena Bu Kiky izin workshop
  {
    id: 'ses-008',
    scheduleId: 'sch-001',
    studentId: 'std-001',
    date: '2026-10-28',
    dayName: 'Rabu',
    timeSlot: '09:00 - 10:00',
    room: 'Ruang SI Sakura (Lantai 1)',
    primaryTeacherId: 'usr-guru-kiky',
    substituteTeacherId: 'usr-guru-ratih',
    isSubstituted: true,
    substituteReason: 'Bu Kiky Amanda menghadiri Simposium Terapi Sensori Nasional (Disetujui Kepala Sekolah)',
    leaveRequestId: 'lvr-001',
    status: 'scheduled'
  },

  // Sesi Kenzo (Selasa & Kamis)
  {
    id: 'ses-101',
    scheduleId: 'sch-002',
    studentId: 'std-002',
    date: '2026-10-06',
    dayName: 'Selasa',
    timeSlot: '10:30 - 11:30',
    room: 'Ruang Wicara Anggrek (Lantai 2)',
    primaryTeacherId: 'usr-guru-bayu',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-102',
    scheduleId: 'sch-002',
    studentId: 'std-002',
    date: '2026-10-08',
    dayName: 'Kamis',
    timeSlot: '10:30 - 11:30',
    room: 'Ruang Wicara Anggrek (Lantai 2)',
    primaryTeacherId: 'usr-guru-bayu',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-103',
    scheduleId: 'sch-002',
    studentId: 'std-002',
    date: '2026-10-13',
    dayName: 'Selasa',
    timeSlot: '10:30 - 11:30',
    room: 'Ruang Wicara Anggrek (Lantai 2)',
    primaryTeacherId: 'usr-guru-bayu',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-104',
    scheduleId: 'sch-002',
    studentId: 'std-002',
    date: '2026-10-15',
    dayName: 'Kamis',
    timeSlot: '10:30 - 11:30',
    room: 'Ruang Wicara Anggrek (Lantai 2)',
    primaryTeacherId: 'usr-guru-bayu',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-105',
    scheduleId: 'sch-002',
    studentId: 'std-002',
    date: '2026-10-20',
    dayName: 'Selasa',
    timeSlot: '10:30 - 11:30',
    room: 'Ruang Wicara Anggrek (Lantai 2)',
    primaryTeacherId: 'usr-guru-bayu',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-106',
    scheduleId: 'sch-002',
    studentId: 'std-002',
    date: '2026-10-22',
    dayName: 'Kamis',
    timeSlot: '10:30 - 11:30',
    room: 'Ruang Wicara Anggrek (Lantai 2)',
    primaryTeacherId: 'usr-guru-bayu',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-107',
    scheduleId: 'sch-002',
    studentId: 'std-002',
    date: '2026-10-27',
    dayName: 'Selasa',
    timeSlot: '10:30 - 11:30',
    room: 'Ruang Wicara Anggrek (Lantai 2)',
    primaryTeacherId: 'usr-guru-bayu',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-108',
    scheduleId: 'sch-002',
    studentId: 'std-002',
    date: '2026-10-29',
    dayName: 'Kamis',
    timeSlot: '10:30 - 11:30',
    room: 'Ruang Wicara Anggrek (Lantai 2)',
    primaryTeacherId: 'usr-guru-bayu',
    isSubstituted: false,
    status: 'scheduled'
  },

  // Sesi Dhira (Senin, Rabu, Jumat)
  {
    id: 'ses-201',
    scheduleId: 'sch-003',
    studentId: 'std-003',
    date: '2026-10-26',
    dayName: 'Senin',
    timeSlot: '13:00 - 14:30',
    room: 'Ruang Okupasi Melati (Lantai 2)',
    primaryTeacherId: 'usr-guru-ratih',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-202',
    scheduleId: 'sch-003',
    studentId: 'std-003',
    date: '2026-10-28',
    dayName: 'Rabu',
    timeSlot: '13:00 - 14:30',
    room: 'Ruang Okupasi Melati (Lantai 2)',
    primaryTeacherId: 'usr-guru-ratih',
    isSubstituted: false,
    status: 'scheduled'
  },
  {
    id: 'ses-203',
    scheduleId: 'sch-003',
    studentId: 'std-003',
    date: '2026-10-30',
    dayName: 'Jumat',
    timeSlot: '13:00 - 14:30',
    room: 'Ruang Okupasi Melati (Lantai 2)',
    primaryTeacherId: 'usr-guru-ratih',
    isSubstituted: false,
    status: 'scheduled'
  },

  // Sesi Rayhan (Senin, Rabu, Jumat)
  {
    id: 'ses-301',
    scheduleId: 'sch-004',
    studentId: 'std-004',
    date: '2026-10-28',
    dayName: 'Rabu',
    timeSlot: '08:30 - 10:30',
    room: 'Ruang ABA Kenanga (Lantai 1)',
    primaryTeacherId: 'usr-guru-bayu',
    isSubstituted: false,
    status: 'scheduled'
  },

  // Sesi Arka (Selasa & Jumat)
  {
    id: 'ses-401',
    scheduleId: 'sch-006',
    studentId: 'std-006',
    date: '2026-10-27',
    dayName: 'Selasa',
    timeSlot: '14:00 - 15:00',
    room: 'Ruang Gym Pediatrik Cempaka',
    primaryTeacherId: 'usr-guru-dimas',
    isSubstituted: false,
    status: 'completed'
  },
  {
    id: 'ses-402',
    scheduleId: 'sch-006',
    studentId: 'std-006',
    date: '2026-10-30',
    dayName: 'Jumat',
    timeSlot: '14:00 - 15:00',
    room: 'Ruang Gym Pediatrik Cempaka',
    primaryTeacherId: 'usr-guru-dimas',
    isSubstituted: false,
    status: 'scheduled'
  }
];

export const INITIAL_ATTENDANCES: Attendance[] = [
  {
    id: 'att-001',
    sessionId: 'ses-001',
    studentId: 'std-001',
    teacherId: 'usr-guru-kiky',
    status: 'hadir',
    therapyNotes: 'Ananda Bintang antusias pada ayunan hammock dan trampolin. Regulasi vestibular membaik, durasi fokus bertahan hingga 18 menit saat menyusun balok.',
    homeworkNotes: 'Lanjutkan stimulasi sikat sensori (Wilbarger protocol) 2x sehari sebelum tidur.',
    cooperationRating: 4,
    timestamp: '2026-10-05 10:05'
  },
  {
    id: 'att-002',
    sessionId: 'ses-002',
    studentId: 'std-001',
    teacherId: 'usr-guru-kiky',
    status: 'hadir',
    therapyNotes: 'Eksplorasi bola berduri dan pasir kinetik. Sempat menolak tekstur lengket, namun setelah desensitisasi 10 menit mulai mau menyentuh dengan telapak tangan.',
    homeworkNotes: 'Bermain remas plastisin atau adonan tepung bersama bunda di rumah.',
    cooperationRating: 4,
    timestamp: '2026-10-07 10:02'
  },
  {
    id: 'att-003',
    sessionId: 'ses-003',
    studentId: 'std-001',
    teacherId: 'usr-guru-kiky',
    status: 'hadir',
    therapyNotes: 'Latihan rintangan motorik kasar (terowongan, balok titian, lompat ban). Keseimbangan dinamis meningkat signifikan.',
    homeworkNotes: 'Ajak berjalan di atas garis lurus di lantai rumah atau taman.',
    cooperationRating: 5,
    timestamp: '2026-10-12 10:00'
  },
  {
    id: 'att-004',
    sessionId: 'ses-004',
    studentId: 'std-001',
    teacherId: 'usr-guru-kiky',
    status: 'izin',
    therapyNotes: 'Wali murid mengonfirmasi izin karena ananda ada agenda vaksinasi dan cek tumbuh kembang rutin di RS Hermina.',
    homeworkNotes: 'Istirahat dan latihan peregangan santai di tempat tidur.',
    cooperationRating: 3,
    timestamp: '2026-10-14 08:30'
  },
  {
    id: 'att-005',
    sessionId: 'ses-005',
    studentId: 'std-001',
    teacherId: 'usr-guru-kiky',
    status: 'hadir',
    therapyNotes: 'Stimulasi proprioseptif dengan selimut pemberat (weighted blanket) dan kompresi sendi. Anak tampak lebih tenang dan minim tantrum.',
    homeworkNotes: 'Latihan dorong keranjang cucian atau bantal guling untuk deep pressure.',
    cooperationRating: 4,
    timestamp: '2026-10-19 10:05'
  },
  {
    id: 'att-006',
    sessionId: 'ses-006',
    studentId: 'std-001',
    teacherId: 'usr-guru-kiky',
    status: 'sakit',
    therapyNotes: 'Wali murid mengabari ananda demam dan batuk pilek sejak malam hari. Disarankan istirahat penuh.',
    homeworkNotes: 'Pemulihan fisik optimal, cukupi hidrasi.',
    cooperationRating: 3,
    timestamp: '2026-10-21 08:15'
  },
  {
    id: 'att-007',
    sessionId: 'ses-007',
    studentId: 'std-001',
    teacherId: 'usr-guru-kiky',
    status: 'hadir',
    therapyNotes: 'Kondisi ananda sudah bugar kembali. Mengikuti instruksi perosotan ke kolam bola dengan ceria. Kontak mata stabil.',
    homeworkNotes: 'Aktivitas motorik luar ruangan saat pagi hari.',
    cooperationRating: 5,
    timestamp: '2026-10-26 10:01'
  },

  // Attendances Kenzo
  {
    id: 'att-101',
    sessionId: 'ses-101',
    studentId: 'std-002',
    teacherId: 'usr-guru-bayu',
    status: 'hadir',
    therapyNotes: 'Latihan tiup peluit air dan sedotan spiral untuk kekuatan buccinator. Mengucapkan suku kata bilabial /ba/, /ma/, /pa/ dengan imitasi akurat.',
    homeworkNotes: 'Latihan meniup gelembung sabun bersama orang tua di teras.',
    cooperationRating: 4,
    timestamp: '2026-10-06 11:35'
  },
  {
    id: 'att-102',
    sessionId: 'ses-102',
    studentId: 'std-002',
    teacherId: 'usr-guru-bayu',
    status: 'hadir',
    therapyNotes: 'Flashcard hewan peliharaan. Kenzo mampu mengidentifikasi dan meniru bunyi kucing (meong) dan sapi (moo) secara spontan tanpa prompted.',
    homeworkNotes: 'Membaca buku cerita bergambar interaktif 10 menit sebelum tidur.',
    cooperationRating: 5,
    timestamp: '2026-10-08 11:32'
  },
  {
    id: 'att-103',
    sessionId: 'ses-103',
    studentId: 'std-002',
    teacherId: 'usr-guru-bayu',
    status: 'hadir',
    therapyNotes: 'Stimulasi sensori oral dengan getaran Z-Vibe pada lidah anterior. Menghasilkan kata tunggal: "Minta", "Mau", "Air".',
    homeworkNotes: 'Berikan sendok bertekstur saat makan puding atau bubur.',
    cooperationRating: 4,
    timestamp: '2026-10-13 11:30'
  },
  {
    id: 'att-104',
    sessionId: 'ses-104',
    studentId: 'std-002',
    teacherId: 'usr-guru-bayu',
    status: 'hadir',
    therapyNotes: 'Latihan ekspresi kebutuhan: menunjuk dan mengucapkan kata bantu "Buka" saat toples mainan tertutup.',
    homeworkNotes: 'Jangan langsung beri barang yang diinginkan; dorong anak menyebutkan kata permintaannya terlebih dahulu.',
    cooperationRating: 5,
    timestamp: '2026-10-15 11:35'
  },
  {
    id: 'att-105',
    sessionId: 'ses-105',
    studentId: 'std-002',
    teacherId: 'usr-guru-bayu',
    status: 'hadir',
    therapyNotes: 'Pengenalan konsep warna dasar (merah, biru, kuning) dikombinasikan dengan melompat di karpet warna.',
    homeworkNotes: 'Latihan memilih baju berdasarkan warna di rumah.',
    cooperationRating: 4,
    timestamp: '2026-10-20 11:31'
  },
  {
    id: 'att-106',
    sessionId: 'ses-106',
    studentId: 'std-002',
    teacherId: 'usr-guru-bayu',
    status: 'hadir',
    therapyNotes: 'Kombinasi 2 kata fungsional: "Mau roti", "Mobil jalan". Artikulasi vokal sudah jelas.',
    homeworkNotes: 'Latihan pengulangan kalimat pendek saat bermain mobil-mobilan.',
    cooperationRating: 5,
    timestamp: '2026-10-22 11:30'
  },
  {
    id: 'att-107',
    sessionId: 'ses-107',
    studentId: 'std-002',
    teacherId: 'usr-guru-bayu',
    status: 'hadir',
    therapyNotes: 'Evaluasi mingguan: Kemajuan ekspresif verbal mencapai 75% target bulan Oktober. Respon terhadap panggil nama langsung tanpa jeda.',
    homeworkNotes: 'Pertahankan dialog interaktif 2 arah.',
    cooperationRating: 5,
    timestamp: '2026-10-27 11:35'
  },

  // Attendances Dhira & Arka
  {
    id: 'att-201',
    sessionId: 'ses-201',
    studentId: 'std-003',
    teacherId: 'usr-guru-ratih',
    status: 'hadir',
    therapyNotes: 'Latihan meronce manik-manik kayu dan menggunting garis bergelombang. Hand-eye coordination semakin stabil.',
    homeworkNotes: 'Bermain pasak geometri atau puzzle kayu 24 potong.',
    cooperationRating: 4,
    timestamp: '2026-10-26 14:35'
  },
  {
    id: 'att-401',
    sessionId: 'ses-401',
    studentId: 'std-006',
    teacherId: 'usr-guru-dimas',
    status: 'hadir',
    therapyNotes: 'Stretching hamstring dan adductor bilateral. Latihan weight shifting di tilt board dengan support minimal.',
    homeworkNotes: 'Latihan berdiri satu kaki bersandar pada dinding 15 detik x 3 repetisi.',
    cooperationRating: 4,
    timestamp: '2026-10-27 15:05'
  }
];

export const INITIAL_LEAVE_REQUESTS: TeacherLeaveRequest[] = [
  {
    id: 'lvr-001',
    teacherId: 'usr-guru-kiky',
    sessionId: 'ses-008',
    sessionDate: '2026-10-28',
    reason: 'Menghadiri Simposium Nasional Perkembangan Sensori Motor Anak di Gedung Kemenkes RI',
    substituteTeacherId: 'usr-guru-ratih',
    status: 'approved',
    createdAt: '2026-10-25 14:20',
    reviewedAt: '2026-10-25 16:00',
    reviewedBy: 'Ahmad Fauzi, S.Pd (Kepala Sekolah)'
  },
  {
    id: 'lvr-002',
    teacherId: 'usr-guru-bayu',
    sessionId: 'ses-108',
    sessionDate: '2026-10-29',
    reason: 'Pemeriksaan kesehatan berkala dan tes audiometri klinis terjadwal',
    status: 'pending',
    createdAt: '2026-10-27 11:00'
  }
];
