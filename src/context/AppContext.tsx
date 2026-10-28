import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Student, 
  MonthlySchedule, 
  Session, 
  Attendance, 
  TeacherLeaveRequest 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_STUDENTS, 
  INITIAL_SCHEDULES, 
  INITIAL_SESSIONS, 
  INITIAL_ATTENDANCES, 
  INITIAL_LEAVE_REQUESTS 
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  users: User[];
  students: Student[];
  schedules: MonthlySchedule[];
  sessions: Session[];
  attendances: Attendance[];
  leaveRequests: TeacherLeaveRequest[];
  
  // Auth & Role
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole, specificUserId?: string) => void;
  
  // Student Management (Kepala Sekolah / Yayasan)
  addStudent: (studentData: Omit<Student, 'id' | 'registrationDate'>) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  toggleFreezeStudent: (studentId: string, reason?: string) => void;
  
  // Scheduling & Mapping (Kepala Sekolah)
  saveMonthlySchedule: (scheduleData: Omit<MonthlySchedule, 'id'> & { id?: string }) => void;
  generateSessionsForMonth: (schedule: MonthlySchedule) => void;
  deleteSchedule: (scheduleId: string) => void;
  
  // Substitute Management
  assignSubstitute: (sessionId: string, substituteTeacherId: string, reason: string) => void;
  approveLeaveRequest: (requestId: string, substituteTeacherId: string) => void;
  rejectLeaveRequest: (requestId: string) => void;
  
  // Teacher Actions
  submitLeaveRequest: (data: { teacherId: string; sessionId: string; sessionDate: string; reason: string }) => void;
  submitAttendance: (data: Omit<Attendance, 'id' | 'timestamp'>) => void;
  
  // User Management (Yayasan)
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (userData: User) => void;
  deleteUser: (userId: string) => void;

  // Utilities
  resetToDefaultData: () => void;
}

const STORAGE_KEY = 'terapina_v1_store';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
    if (saved) return JSON.parse(saved);
    // Default to Kepala Sekolah to showcase scheduling & student management
    return INITIAL_USERS.find(u => u.role === 'kepala_sekolah') || INITIAL_USERS[0];
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

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
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

  // Role Switcher
  const switchRole = (role: UserRole, specificUserId?: string) => {
    if (specificUserId) {
      const target = users.find(u => u.id === specificUserId);
      if (target) {
        setCurrentUser(target);
        return;
      }
    }
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
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
    // Remove related sessions/schedules
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

  // Schedule management
  const saveMonthlySchedule = (scheduleData: Omit<MonthlySchedule, 'id'> & { id?: string }) => {
    const scheduleId = scheduleData.id || `sch-${Date.now().toString().slice(-4)}`;
    const completeSchedule: MonthlySchedule = {
      ...scheduleData,
      id: scheduleId
    };

    setSchedules(prev => {
      const exists = prev.some(s => s.id === scheduleId);
      if (exists) {
        return prev.map(s => s.id === scheduleId ? completeSchedule : s);
      }
      return [...prev, completeSchedule];
    });

    // Generate sessions automatically
    generateSessionsForMonth(completeSchedule);
  };

  const generateSessionsForMonth = (schedule: MonthlySchedule) => {
    // Generate dates for preferred days in the given month and year
    const year = schedule.year;
    const month = schedule.month; // 1-indexed
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
        
        // Check if session already exists for this date and student
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
        reviewedBy: `${currentUser.name} (${currentUser.title})`
      };
    }));

    // Update session
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
        reviewedBy: `${currentUser.name} (${currentUser.title})`
      };
    }));
  };

  // Teacher actions
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

    // Mark session as completed
    setSessions(prev => prev.map(s => {
      if (s.id !== data.sessionId) return s;
      return {
        ...s,
        status: 'completed'
      };
    }));
  };

  // User Management
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now().toString().slice(-4)}`
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (userData: User) => {
    setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
    if (currentUser.id === userData.id) {
      setCurrentUser(userData);
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS.find(u => u.role === 'kepala_sekolah') || INITIAL_USERS[0]);
    setStudents(INITIAL_STUDENTS);
    setSchedules(INITIAL_SCHEDULES);
    setSessions(INITIAL_SESSIONS);
    setAttendances(INITIAL_ATTENDANCES);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
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
        setCurrentUser,
        switchRole,
        addStudent,
        updateStudent,
        deleteStudent,
        toggleFreezeStudent,
        saveMonthlySchedule,
        generateSessionsForMonth,
        deleteSchedule,
        assignSubstitute,
        approveLeaveRequest,
        rejectLeaveRequest,
        submitLeaveRequest,
        submitAttendance,
        addUser,
        updateUser,
        deleteUser,
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
