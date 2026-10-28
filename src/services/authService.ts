import { User, UserRole, UserStatus } from '../types';
import { INITIAL_USERS } from '../data/mockData';

/**
 * Representation of internal Supabase auth.users credential entity.
 * In a real Supabase backend, this lives in the protected `auth` schema.
 * Public clients NEVER receive or query `passwordHash` or `auth.users` directly.
 */
export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string; // Simulated SHA-256 / salted hash
  role: UserRole;
  status: UserStatus;
  freezeReason?: string;
  frozenAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Public User Profile entity representing public.profiles table in Supabase.
 * Foreign key: profiles.id = auth.users.id
 * DOES NOT store password plaintext.
 */
export interface UserProfileRecord {
  id: string; // Foreign key matching auth.users.id
  userId: string; // Alias to auth.users.id
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  title: string;
  avatarColor: string;
  status: UserStatus;
  freezeReason?: string;
  frozenAt?: string;
  studentId?: string;
  specialization?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

const STORAGE_AUTH_USERS_KEY = 'littlestar_auth_users_v3';
const STORAGE_PROFILES_KEY = 'littlestar_profiles_v3';
const STORAGE_SESSION_KEY = 'littlestar_session_v3';

// Simple deterministic hash for password verification in local/client simulation
function hashPassword(password: string): string {
  let hash = 0;
  const str = `ls_salt_2025_${password.trim()}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Initialize storage with default institutional users
 * Strictly separated into auth.users and public.profiles
 */
function initializeStores(): { authUsers: AuthUserRecord[]; profiles: UserProfileRecord[] } {
  let authUsers: AuthUserRecord[] = [];
  let profiles: UserProfileRecord[] = [];

  const savedAuth = localStorage.getItem(STORAGE_AUTH_USERS_KEY);
  const savedProfiles = localStorage.getItem(STORAGE_PROFILES_KEY);

  if (savedAuth && savedProfiles) {
    try {
      authUsers = JSON.parse(savedAuth);
      profiles = JSON.parse(savedProfiles);
    } catch {
      authUsers = [];
      profiles = [];
    }
  }

  // Ensure default institutional users exist and are properly synchronized
  const now = new Date().toISOString();
  let changed = false;

  INITIAL_USERS.forEach((initUser) => {
    const existingAuth = authUsers.find(
      (a) => a.id === initUser.id || a.email.toLowerCase() === initUser.email.toLowerCase()
    );

    if (!existingAuth) {
      changed = true;
      const defaultPass = (initUser.password && initUser.password.trim()) || 'password123';
      const newAuth: AuthUserRecord = {
        id: initUser.id,
        email: initUser.email.toLowerCase().trim(),
        passwordHash: hashPassword(defaultPass),
        role: initUser.role,
        status: initUser.status || 'active',
        freezeReason: initUser.freezeReason,
        frozenAt: initUser.frozenAt,
        createdAt: now,
        updatedAt: now
      };
      authUsers.push(newAuth);
    }

    const existingProfile = profiles.find((p) => p.id === initUser.id);
    if (!existingProfile) {
      changed = true;
      const newProfile: UserProfileRecord = {
        id: initUser.id,
        userId: initUser.id,
        name: initUser.name,
        role: initUser.role,
        email: initUser.email.toLowerCase().trim(),
        phone: initUser.phone || '0812-xxxx',
        title: initUser.title,
        avatarColor: initUser.avatarColor || 'bg-blue-600',
        status: initUser.status || 'active',
        freezeReason: initUser.freezeReason,
        frozenAt: initUser.frozenAt,
        studentId: initUser.studentId,
        specialization: initUser.specialization,
        createdAt: now,
        updatedAt: now
      };
      profiles.push(newProfile);
    }
  });

  if (changed || !savedAuth || !savedProfiles) {
    localStorage.setItem(STORAGE_AUTH_USERS_KEY, JSON.stringify(authUsers));
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
  }

  return { authUsers, profiles };
}

// Convert internal Profile to front-end User model
function mapProfileToUser(profile: UserProfileRecord): User {
  return {
    id: profile.id,
    name: profile.name,
    role: profile.role,
    email: profile.email,
    phone: profile.phone,
    title: profile.title,
    avatarColor: profile.avatarColor,
    status: profile.status,
    freezeReason: profile.freezeReason,
    frozenAt: profile.frozenAt,
    studentId: profile.studentId,
    specialization: profile.specialization
  };
}

/**
 * Authentication Service (Mirroring Supabase Auth + public.profiles architecture)
 */
class AuthService {
  private authUsers: AuthUserRecord[] = [];
  private profiles: UserProfileRecord[] = [];

  constructor() {
    const { authUsers, profiles } = initializeStores();
    this.authUsers = authUsers;
    this.profiles = profiles;
  }

  private persist() {
    localStorage.setItem(STORAGE_AUTH_USERS_KEY, JSON.stringify(this.authUsers));
    localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(this.profiles));
  }

  /**
   * Login with email/username and password
   * Verifies credentials against auth.users, checks status, then loads public.profiles
   */
  public signIn(identifier: string, password?: string): { success: boolean; message?: string; user?: User } {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: 'Silakan masukkan email atau username Anda.' };
    }
    if (!password || !password.trim()) {
      return { success: false, message: 'Kata sandi wajib diisi.' };
    }

    const cleanInput = identifier.trim().toLowerCase();
    const inputWithoutDomain = cleanInput.split('@')[0];
    const targetHash = hashPassword(password.trim());

    // Step 1: Query auth.users credential store (Mirroring Supabase Auth internal lookup)
    const authAccount = this.authUsers.find((acc) => {
      const accEmail = acc.email.toLowerCase().trim();
      const accUsername = accEmail.split('@')[0];
      const accId = acc.id.toLowerCase().trim();

      return (
        accEmail === cleanInput ||
        accUsername === cleanInput ||
        accUsername === inputWithoutDomain ||
        accId === cleanInput ||
        (!cleanInput.includes('@') && accEmail === `${cleanInput}@littlestar.sch.id`) ||
        (cleanInput.includes('@') && !accEmail.includes('@') && `${accEmail}@littlestar.sch.id` === cleanInput)
      );
    });

    if (!authAccount) {
      return {
        success: false,
        message: `Akun "${identifier}" tidak terdaftar dalam sistem autentikasi Little Star. Hubungi Yayasan / Super Admin jika Anda belum memiliki akun.`
      };
    }

    // Step 2: Verify Password against auth.users passwordHash
    if (authAccount.passwordHash !== targetHash) {
      return {
        success: false,
        message: 'Kata sandi salah. Silakan periksa kembali huruf besar/kecil atau hubungi Super Admin untuk reset kata sandi.'
      };
    }

    // Step 3: Check Account Status (Strict enforcement: Frozen and Inactive users CANNOT log in)
    if (authAccount.status === 'frozen') {
      return {
        success: false,
        message: `Akses Akun DIBEKUKAN oleh Super Admin / Yayasan. Alasan: "${authAccount.freezeReason || 'Penangguhan akses administratif'}". Akun yang dibekukan tidak dapat masuk sistem.`
      };
    }

    if (authAccount.status === 'inactive') {
      return {
        success: false,
        message: 'Akun Anda dalam status Non-Aktif. Hubungi Administrator untuk pengaktifan.'
      };
    }

    // Step 4: Load corresponding profile from public.profiles
    const profile = this.profiles.find((p) => p.id === authAccount.id);
    if (!profile) {
      return {
        success: false,
        message: 'Inkonsistensi data: Akun autentikasi ditemukan namun profil pengguna tidak tersedia. Hubungi Administrator.'
      };
    }

    // Step 5: Generate and store active session
    const appUser = mapProfileToUser(profile);
    const session: AuthSession = {
      user: appUser,
      token: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));

    return {
      success: true,
      user: appUser
    };
  }

  /**
   * Recover Session on page load / reload
   * Re-validates the session against current auth.users status to prevent frozen users bypassing reload
   */
  public restoreSession(): User | null {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;

    try {
      const session: AuthSession = JSON.parse(raw);
      if (!session || !session.user || !session.user.id) {
        this.signOut();
        return null;
      }

      // Check if session has expired
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.signOut();
        return null;
      }

      // Re-verify against current auth.users state
      const authAccount = this.authUsers.find((a) => a.id === session.user.id);
      if (!authAccount) {
        this.signOut();
        return null;
      }

      // If user was frozen after login, immediately terminate session
      if (authAccount.status === 'frozen' || authAccount.status === 'inactive') {
        this.signOut();
        return null;
      }

      // Fetch fresh profile data
      const profile = this.profiles.find((p) => p.id === authAccount.id);
      if (!profile) {
        this.signOut();
        return null;
      }

      const freshUser = mapProfileToUser(profile);
      // Update saved session user object in case profile was edited
      session.user = freshUser;
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));

      return freshUser;
    } catch {
      this.signOut();
      return null;
    }
  }

  /**
   * Sign out and clear session completely
   */
  public signOut(): void {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }

  /**
   * Admin Create User (Atomic 2-step process: auth.users + public.profiles)
   * Super Admin only.
   */
  public adminCreateUser(params: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    status?: UserStatus;
    phone?: string;
    title?: string;
    specialization?: string;
    studentId?: string;
    avatarColor?: string;
  }): { success: boolean; message?: string; user?: User; plainPassword?: string } {
    const cleanName = (params.name || '').trim();
    if (!cleanName) {
      return { success: false, message: 'Nama pengguna wajib diisi.' };
    }

    const rawEmail = (params.email || '').trim().toLowerCase();
    const finalEmail = rawEmail.includes('@')
      ? rawEmail
      : rawEmail.length > 0
        ? `${rawEmail}@littlestar.sch.id`
        : `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@littlestar.sch.id`;

    // Check for duplicate email in auth.users
    const existingEmail = this.authUsers.find((a) => a.email.toLowerCase() === finalEmail.toLowerCase());
    if (existingEmail) {
      return {
        success: false,
        message: `Email "${finalEmail}" sudah terdaftar pada pengguna lain. Gunakan email yang berbeda.`
      };
    }

    const plainPassword = (params.password || '').trim() || 'password123';
    const newId = `usr-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const now = new Date().toISOString();

    // Step 1: Create auth.users entity
    const newAuthUser: AuthUserRecord = {
      id: newId,
      email: finalEmail,
      passwordHash: hashPassword(plainPassword),
      role: params.role,
      status: params.status || 'active',
      createdAt: now,
      updatedAt: now
    };

    // Step 2: Create public.profiles entity
    const newProfile: UserProfileRecord = {
      id: newId,
      userId: newId,
      name: cleanName,
      role: params.role,
      email: finalEmail,
      phone: (params.phone || '0812-xxxx').trim(),
      title: (
        params.title ||
        (params.role === 'guru'
          ? 'Terapis Klinis'
          : params.role === 'murid'
            ? 'Wali Murid'
            : params.role === 'kepala_sekolah'
              ? 'Kepala Sekolah'
              : 'Yayasan')
      ).trim(),
      specialization: params.specialization?.trim(),
      studentId: params.studentId,
      avatarColor: params.avatarColor || 'bg-blue-600',
      status: params.status || 'active',
      createdAt: now,
      updatedAt: now
    };

    try {
      // Transactional push
      this.authUsers.push(newAuthUser);
      this.profiles.push(newProfile);
      this.persist();

      const createdUser = mapProfileToUser(newProfile);
      return {
        success: true,
        user: createdUser,
        plainPassword
      };
    } catch (err: any) {
      // Rollback on failure
      this.authUsers = this.authUsers.filter((a) => a.id !== newId);
      this.profiles = this.profiles.filter((p) => p.id !== newId);
      this.persist();
      return {
        success: false,
        message: `Gagal membuat akun: ${err?.message || 'Terjadi kesalahan sistem'}`
      };
    }
  }

  /**
   * Admin Update User
   * Updates auth.users credentials (email, password, role, status)
   * and synchronizes public.profiles (name, phone, title, specialization, etc.)
   */
  public adminUpdateUser(params: {
    id: string;
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    status?: UserStatus;
    phone?: string;
    title?: string;
    specialization?: string;
    studentId?: string;
    avatarColor?: string;
    freezeReason?: string;
  }): { success: boolean; message?: string; user?: User } {
    const authIndex = this.authUsers.findIndex((a) => a.id === params.id);
    const profileIndex = this.profiles.findIndex((p) => p.id === params.id);

    if (authIndex === -1 || profileIndex === -1) {
      return { success: false, message: 'Pengguna tidak ditemukan dalam sistem autentikasi atau profil.' };
    }

    const now = new Date().toISOString();
    const currentAuth = this.authUsers[authIndex];
    const currentProfile = this.profiles[profileIndex];

    // Handle email change with duplicate check
    let updatedEmail = currentAuth.email;
    if (params.email && params.email.trim()) {
      const raw = params.email.trim().toLowerCase();
      const finalEmail = raw.includes('@') ? raw : `${raw}@littlestar.sch.id`;

      if (finalEmail !== currentAuth.email) {
        const isDuplicate = this.authUsers.some(
          (a) => a.id !== params.id && a.email.toLowerCase() === finalEmail.toLowerCase()
        );
        if (isDuplicate) {
          return {
            success: false,
            message: `Email "${finalEmail}" sudah digunakan oleh akun lain.`
          };
        }
        updatedEmail = finalEmail;
      }
    }

    // Handle password change
    let updatedPasswordHash = currentAuth.passwordHash;
    if (params.password && params.password.trim()) {
      updatedPasswordHash = hashPassword(params.password.trim());
    }

    // Update auth.users record
    const updatedAuth: AuthUserRecord = {
      ...currentAuth,
      email: updatedEmail,
      passwordHash: updatedPasswordHash,
      role: params.role || currentAuth.role,
      status: params.status || currentAuth.status,
      freezeReason: params.freezeReason !== undefined ? params.freezeReason : currentAuth.freezeReason,
      frozenAt:
        params.status === 'frozen'
          ? currentAuth.frozenAt || now.split('T')[0]
          : params.status === 'active'
            ? undefined
            : currentAuth.frozenAt,
      updatedAt: now
    };

    // Update public.profiles record
    const updatedProfile: UserProfileRecord = {
      ...currentProfile,
      name: params.name !== undefined ? params.name.trim() : currentProfile.name,
      email: updatedEmail,
      role: params.role || currentProfile.role,
      status: params.status || currentProfile.status,
      phone: params.phone !== undefined ? params.phone.trim() : currentProfile.phone,
      title: params.title !== undefined ? params.title.trim() : currentProfile.title,
      specialization:
        params.specialization !== undefined ? params.specialization.trim() : currentProfile.specialization,
      studentId: params.studentId !== undefined ? params.studentId : currentProfile.studentId,
      avatarColor: params.avatarColor || currentProfile.avatarColor,
      freezeReason: updatedAuth.freezeReason,
      frozenAt: updatedAuth.frozenAt,
      updatedAt: now
    };

    this.authUsers[authIndex] = updatedAuth;
    this.profiles[profileIndex] = updatedProfile;
    this.persist();

    // If the updated user is the currently logged in session and was frozen, invalidate session
    const currentSessionRaw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (currentSessionRaw) {
      try {
        const session: AuthSession = JSON.parse(currentSessionRaw);
        if (session.user.id === params.id) {
          if (updatedAuth.status === 'frozen' || updatedAuth.status === 'inactive') {
            this.signOut();
          } else {
            session.user = mapProfileToUser(updatedProfile);
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
          }
        }
      } catch {
        // Ignore json error
      }
    }

    return {
      success: true,
      user: mapProfileToUser(updatedProfile)
    };
  }

  /**
   * Admin Toggle Freeze Account
   */
  public adminToggleFreeze(userId: string, reason?: string): { success: boolean; user?: User } {
    const auth = this.authUsers.find((a) => a.id === userId);
    if (!auth) return { success: false };

    const isFrozen = auth.status === 'frozen';
    const newStatus: UserStatus = isFrozen ? 'active' : 'frozen';
    const freezeReason = isFrozen ? undefined : reason || 'Dibekukan oleh Super Admin / Yayasan';

    return this.adminUpdateUser({
      id: userId,
      status: newStatus,
      freezeReason
    });
  }

  /**
   * Admin Delete User (Deletes from both auth.users and public.profiles)
   */
  public adminDeleteUser(userId: string): boolean {
    const authExists = this.authUsers.some((a) => a.id === userId);
    if (!authExists) return false;

    this.authUsers = this.authUsers.filter((a) => a.id !== userId);
    this.profiles = this.profiles.filter((p) => p.id !== userId);
    this.persist();

    // Invalidate active session if deleted user was logged in
    const currentSessionRaw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (currentSessionRaw) {
      try {
        const session: AuthSession = JSON.parse(currentSessionRaw);
        if (session.user.id === userId) {
          this.signOut();
        }
      } catch {
        // ignore
      }
    }

    return true;
  }

  /**
   * Get all public profiles (Password hash is never included)
   */
  public getAllUsers(): User[] {
    return this.profiles.map(mapProfileToUser);
  }

  /**
   * Reset store to initial seed data (for debug/demo reset)
   */
  public resetToDefault(): void {
    localStorage.removeItem(STORAGE_AUTH_USERS_KEY);
    localStorage.removeItem(STORAGE_PROFILES_KEY);
    localStorage.removeItem(STORAGE_SESSION_KEY);
    const { profiles } = initializeStores();
    this.profiles = profiles;
    this.authUsers = JSON.parse(localStorage.getItem(STORAGE_AUTH_USERS_KEY) || '[]');
  }
}

export const authService = new AuthService();
