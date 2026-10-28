import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Student, 
  MonthlySchedule, 
  Session, 
  Attendance, 
  TeacherLeaveRequest,
  ScheduleChangeProposal,
  ViewPermission
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_STUDENTS, 
  INITIAL_SCHEDULES, 
  INITIAL_SESSIONS, 
  INITIAL_ATTENDANCES, 
  INITIAL_LEAVE_REQUESTS,
  INITIAL_SCHEDULE_PROPOSALS,
  INITIAL_VIEW_PERMISSIONS
} from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  students: Student[];
  schedules: MonthlySchedule[];
  sessions: Session[];
  attendances: Attendance[];
  leaveRequests: TeacherLeaveRequest[];
  scheduleProposals: ScheduleChangeProposal[];
  viewPermissions: ViewPermission[];
  
  // Auth
  login: (email: string, password?: string) => { success: boolean; message?: string };
  quickLogin: (user: User) => { success: boolean; message?: string };
  logout: () => void;
  
  // Super Admin: User Management & Freeze
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (userData: User) => void;
  deleteUser: (userId: string) => void;
  toggleFreezeUser: (userId: string, reason?: string) => void;

  // Super Admin: View Permissions Matrix
  updateRolePermission: (permissionId: string, role: UserRole, hasAccess: boolean) => void;
  hasPermission: (permissionId: string) => boolean;
  
  // Student Management (Kepala Sekolah / Yayasan)
  addStudent: (studentData: Omit<Student, 'id' | 'registrationDate'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  toggleFreezeStudent: (studentId: string, reason?: string) => void;
  
  // Scheduling & Approval Flow (Kepala Sekolah -> Super Admin / Yayasan)
  submitScheduleProposal: (data: {
    studentId: string;
    scheduleId?: string;
    month: number;
    year: number;
    weeklyFrequency: number;
    durationMinutes: number;
    assignedTeacherId: string;
    room: string;
    preferredDays: string[];
    preferredTimeSlot: string;
    changeReason: string;
  }) => void;
  approveScheduleProposal: (proposalId: string, reviewNote?: string) => void;
  rejectScheduleProposal: (proposalId: string, reviewNote: string) => void;
  deleteSchedule: (scheduleId: string) => void;
  
  // Substitute Management
  assignSubstitute: (sessionId: string, substituteTeacherId: string, reason: string) => void;
  approveLeaveRequest: (requestId: string, substituteTeacherId: string) => void;
  rejectLeaveRequest: (requestId: string) => void;
  
  // Teacher Actions
  submitLeaveRequest: (data: { teacherId: string; sessionId: string; sessionDate: string; reason: string }) => void;
  submitAttendance: (data: Omit<Attendance, 'id' | 'timestamp'>) => void;

  // Utilities
  resetToDefaultData: () => void;
}

const STORAGE_KEY = 'terapina_v2_store';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial users
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Current logged in user (null by default so initial view is Login Screen)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
    return saved ? JSON.parse(saved) : null;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [schedules, setSchedules] = useState<MonthlySchedule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_schedules`);
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendances`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCES;
  });

  const [leaveRequests, setLeaveRequests] = useState<TeacherLeaveRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_leaveRequests`);
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
  });

  const [scheduleProposals, setScheduleProposals] = useState<ScheduleChangeProposal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_scheduleProposals`);
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE_PROPOSALS;
  });

  const [viewPermissions, setViewPermissions] = useState<ViewPermission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_viewPermissions`);
    return saved ? JSON.parse(saved) : INITIAL_VIEW_PERMISSIONS;
  });

  // Persist state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_currentUser`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_schedules`, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendances`, JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_leaveRequests`, JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_scheduleProposals`, JSON.stringify(scheduleProposals));
  }, [scheduleProposals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_viewPermissions`, JSON.stringify(viewPermissions));
  }, [viewPermissions]);

  // Auth: Login with credentials
  const login = (email: string, password?: string): { success: boolean; message?: string } => {
    const query = email.trim().toLowerCase();
    const foundUser = users.find(
      u => u.email.toLowerCase() === query || 
           u.email.toLowerCase().split('@')[0] === query ||
           u.id.toLowerCase() === query ||
           u.name.toLowerCase() === query
    );

    if (!foundUser) {
      return { success: false, message: 'Email atau ID Pengguna tidak terdaftar dalam sistem.' };
    }

    // Check password if provided and user has one
    if (password && foundUser.password && foundUser.password !== password) {
      return { success: false, message: 'Kata sandi tidak sesuai.' };
    }

    // Check account status: Frozen accounts CANNOT log in!
    if (foundUser.status === 'frozen') {
      return { 
        success: false, 
        message: `Akun ini DIBEKUKAN oleh Super Admin / Yayasan. Alasan: "${foundUser.freezeReason || 'Penangguhan akses administratif'}". Hubungi Yayasan untuk pengaktifan kembali.` 
      };
    }

    if (foundUser.status === 'inactive') {
      return { success: false, message: 'Akun ini dalam status Non-Aktif.' };
    }

    setCurrentUser(foundUser);
    return { success: true };
  };

  // Quick 1-click login for demo/testing
  const quickLogin = (user: User): { success: boolean; message?: string } => {
    if (user.status === 'frozen') {
      return { 
        success: false, 
        message: `Akun ${user.name} saat ini DIBEKUKAN oleh Super Admin. Alasan: "${user.freezeReason || 'Penangguhan akses'}".` 
      };
    }
    setCurrentUser(user);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Super Admin: User Management & Freeze
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now().toString().slice(-4)}`,
      status: userData.status || 'active',
      password: userData.password || 'password123'
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userData: User) => {
    setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
    if (currentUser?.id === userData.id) {
      setCurrentUser(userData);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      logout();
    }
  };

  const toggleFreezeUser = (userId: string, reason?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const isCurrentlyFrozen = u.status === 'frozen';
      if (isCurrentlyFrozen) {
        return {
          ...u,
          status: 'active',
          freezeReason: undefined,
          frozenAt: undefined
        };
      } else {
        return {
          ...u,
          status: 'frozen',
          freezeReason: reason || 'Dibekukan oleh Super Admin / Yayasan',
          frozenAt: new Date().toISOString().split('T')[0]
        };
      }
    }));

    // If the currently logged in user gets frozen, log them out
    if (currentUser?.id === userId && currentUser.status !== 'frozen') {
      alert('Akun Anda baru saja dibekukan oleh Super Admin. Anda akan diarahkan ke halaman login.');
      logout();
    }
  };

  // Super Admin: Role View Permissions Matrix
  const updateRolePermission = (permissionId: string, role: UserRole, hasAccess: boolean) => {
    setViewPermissions(prev => prev.map(perm => {
      if (perm.id !== permissionId) return perm;
      const currentAllowed = perm.allowedRoles;
      let newAllowed: UserRole[];
      if (hasAccess) {
        newAllowed = currentAllowed.includes(role) ? currentAllowed : [...currentAllowed, role];
      } else {
        newAllowed = currentAllowed.filter(r => r !== role);
      }
      return { ...perm, allowedRoles: newAllowed };
    }));
  };

  const hasPermission = (permissionId: string): boolean => {
    if (!currentUser) return false;
    // Super admin (yayasan) always has full foundational access
    if (currentUser.role === 'yayasan') return true;

    const perm = viewPermissions.find(p => p.id === permissionId);
    if (!perm) return false;
    return perm.allowedRoles.includes(currentUser.role);
  };

  // Student CRUD
  const addStudent = (studentData: Omit<Student, 'id' | 'registrationDate'>) => {
    const newId = `std-${Date.now().toString().slice(-4)}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    setStudents(prev => [newStudent, ...prev]);
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setSchedules(prev => prev.filter(s => s.studentId !== studentId));
    setSessions(prev => prev.filter(s => s.studentId !== studentId));
  };

  const toggleFreezeStudent = (studentId: string, reason?: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const isCurrentlyFrozen = s.status === 'frozen';
      if (isCurrentlyFrozen) {
        return {
          ...s,
          status: 'active',
          freezeReason: undefined,
          frozenAt: undefined
        };
      } else {
        return {
          ...s,
          status: 'frozen',
          freezeReason: reason || 'Permintaan pembekuan sementara oleh orang tua / rekomendasi medis',
          frozenAt: new Date().toISOString().split('T')[0]
        };
      }
    }));
  };

  // Helper to generate sessions
  const generateSessionsForSchedule = (schedule: MonthlySchedule) => {
    const year = schedule.year;
    const month = schedule.month;
    const dayMap: { [key: string]: number } = {
      'Minggu': 0, 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6
    };

    const targetDayNumbers = schedule.preferredDays.map(d => dayMap[d]).filter(n => n !== undefined);
    const daysInMonth = new Date(year, month, 0).getDate();
    const newSessions: Session[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay();
      
      if (targetDayNumbers.includes(dayOfWeek)) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayName = Object.keys(dayMap).find(k => dayMap[k] === dayOfWeek) || 'Hari';
        
        const existingSession = sessions.find(s => s.studentId === schedule.studentId && s.date === dateStr);
        if (!existingSession) {
          const isPast = new Date(dateStr) < new Date('2026-10-28');
          newSessions.push({
            id: `ses-${schedule.studentId.slice(-3)}-${dateStr.replace(/-/g, '')}`,
            scheduleId: schedule.id,
            studentId: schedule.studentId,
            date: dateStr,
            dayName: dayName,
            timeSlot: schedule.preferredTimeSlot,
            room: schedule.room,
            primaryTeacherId: schedule.assignedTeacherId,
            isSubstituted: false,
            status: isPast ? 'completed' : 'scheduled'
          });
        }
      }
    }

    if (newSessions.length > 0) {
      setSessions(prev => [...prev, ...newSessions]);
    }
  };

  // Workflow: Kepala Sekolah Mengajukan Perubahan Jadwal -> Membutuhkan Persetujuan Yayasan
  const submitScheduleProposal = (data: {
    studentId: string;
    scheduleId?: string;
    month: number;
    year: number;
    weeklyFrequency: number;
    durationMinutes: number;
    assignedTeacherId: string;
    room: string;
    preferredDays: string[];
    preferredTimeSlot: string;
    changeReason: string;
  }) => {
    const newProposal: ScheduleChangeProposal = {
      id: `prop-${Date.now().toString().slice(-4)}`,
      scheduleId: data.scheduleId,
      studentId: data.studentId,
      month: data.month,
      year: data.year,
      weeklyFrequency: data.weeklyFrequency,
      durationMinutes: data.durationMinutes,
      assignedTeacherId: data.assignedTeacherId,
      room: data.room,
      preferredDays: data.preferredDays,
      preferredTimeSlot: data.preferredTimeSlot,
      changeReason: data.changeReason,
      proposedBy: currentUser?.name || 'Kepala Sekolah',
      proposedById: currentUser?.id || 'usr-kepsek',
      proposedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'pending'
    };

    setScheduleProposals(prev => [newProposal, ...prev]);
  };

  // Super Admin / Yayasan Menyetujui Perubahan Jadwal
  const approveScheduleProposal = (proposalId: string, reviewNote?: string) => {
    const targetProposal = scheduleProposals.find(p => p.id === proposalId);
    if (!targetProposal) return;

    // Apply change to schedules
    const targetScheduleId = targetProposal.scheduleId || `sch-${Date.now().toString().slice(-4)}`;
    const newSchedule: MonthlySchedule = {
      id: targetScheduleId,
      studentId: targetProposal.studentId,
      month: targetProposal.month,
      year: targetProposal.year,
      weeklyFrequency: targetProposal.weeklyFrequency,
      durationMinutes: targetProposal.durationMinutes,
      assignedTeacherId: targetProposal.assignedTeacherId,
      room: targetProposal.room,
      preferredDays: targetProposal.preferredDays,
      preferredTimeSlot: targetProposal.preferredTimeSlot,
      notes: targetProposal.changeReason
    };

    setSchedules(prev => {
      const exists = prev.some(s => s.id === targetScheduleId);
      if (exists) {
        return prev.map(s => s.id === targetScheduleId ? newSchedule : s);
      }
      return [...prev, newSchedule];
    });

    // Generate sessions automatically
    generateSessionsForSchedule(newSchedule);

    // Update proposal status
    setScheduleProposals(prev => prev.map(p => {
      if (p.id !== proposalId) return p;
      return {
        ...p,
        status: 'approved',
        reviewedBy: currentUser?.name || 'Super Admin / Yayasan',
        reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        reviewNote: reviewNote || 'Perubahan jadwal disetujui resmi oleh Yayasan.'
      };
    }));
  };

  // Super Admin / Yayasan Menolak Perubahan Jadwal
  const rejectScheduleProposal = (proposalId: string, reviewNote: string) => {
    setScheduleProposals(prev => prev.map(p => {
      if (p.id !== proposalId) return p;
      return {
        ...p,
        status: 'rejected',
        reviewedBy: currentUser?.name || 'Super Admin / Yayasan',
        reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        reviewNote
      };
    }));
  };

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
  };

  // Substitute teacher assignment
  const assignSubstitute = (sessionId: string, substituteTeacherId: string, reason: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        isSubstituted: true,
        substituteTeacherId,
        substituteReason: reason
      };
    }));
  };

  const approveLeaveRequest = (requestId: string, substituteTeacherId: string) => {
    const request = leaveRequests.find(r => r.id === requestId);
    if (!request) return;

    setLeaveRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: 'approved',
        substituteTeacherId,
        reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        reviewedBy: currentUser ? `${currentUser.name} (${currentUser.title})` : 'Kepala Sekolah'
      };
    }));

    if (request.sessionId) {
      assignSubstitute(request.sessionId, substituteTeacherId, `Izin Guru Utama: ${request.reason}`);
    }
  };

  const rejectLeaveRequest = (requestId: string) => {
    setLeaveRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: 'rejected',
        reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        reviewedBy: currentUser ? `${currentUser.name} (${currentUser.title})` : 'Kepala Sekolah'
      };
    }));
  };

  const submitLeaveRequest = (data: { teacherId: string; sessionId: string; sessionDate: string; reason: string }) => {
    const newRequest: TeacherLeaveRequest = {
      id: `lvr-${Date.now().toString().slice(-4)}`,
      teacherId: data.teacherId,
      sessionId: data.sessionId,
      sessionDate: data.sessionDate,
      reason: data.reason,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
  };

  const submitAttendance = (data: Omit<Attendance, 'id' | 'timestamp'>) => {
    const existingIndex = attendances.findIndex(a => a.sessionId === data.sessionId);
    const newRecord: Attendance = {
      ...data,
      id: existingIndex >= 0 ? attendances[existingIndex].id : `att-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    if (existingIndex >= 0) {
      setAttendances(prev => prev.map((a, idx) => idx === existingIndex ? newRecord : a));
    } else {
      setAttendances(prev => [newRecord, ...prev]);
    }

    setSessions(prev => prev.map(s => {
      if (s.id !== data.sessionId) return s;
      return {
        ...s,
        status: 'completed'
      };
    }));
  };

  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(null); // Return to login view
    setStudents(INITIAL_STUDENTS);
    setSchedules(INITIAL_SCHEDULES);
    setSessions(INITIAL_SESSIONS);
    setAttendances(INITIAL_ATTENDANCES);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setScheduleProposals(INITIAL_SCHEDULE_PROPOSALS);
    setViewPermissions(INITIAL_VIEW_PERMISSIONS);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        students,
        schedules,
        sessions,
        attendances,
        leaveRequests,
        scheduleProposals,
        viewPermissions,
        login,
        quickLogin,
        logout,
        addUser,
        updateUser,
        deleteUser,
        toggleFreezeUser,
        updateRolePermission,
        hasPermission,
        addStudent,
        updateStudent,
        deleteStudent,
        toggleFreezeStudent,
        submitScheduleProposal,
        approveScheduleProposal,
        rejectScheduleProposal,
        deleteSchedule,
        assignSubstitute,
        approveLeaveRequest,
        rejectLeaveRequest,
        submitLeaveRequest,
        submitAttendance,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
