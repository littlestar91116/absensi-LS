-- ==============================================================================
-- SISTEM MANAJEMEN PENJADWALAN & ABSENSI TERAPI SISWA - LITTLE STAR LEARNING CENTER
-- SUPABASE AUTH & PROFILES SCHEMA WITH STRICT RLS & SECURE ADMIN FUNCTIONS
-- ==============================================================================

-- 1. ENUM TYPES
CREATE TYPE public.app_role AS ENUM ('yayasan', 'kepala_sekolah', 'guru', 'murid');
CREATE TYPE public.account_status AS ENUM ('active', 'frozen', 'inactive');

-- 2. PUBLIC PROFILES TABLE
-- Penting: Tabel ini terikat langsung ke auth.users(id).
-- Tidak menyimpan kata sandi plaintext!
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'guru',
  email TEXT NOT NULL,
  phone TEXT DEFAULT '0812-xxxx',
  title TEXT DEFAULT 'Terapis Klinis',
  avatar_color TEXT DEFAULT 'bg-blue-600',
  status public.account_status NOT NULL DEFAULT 'active',
  freeze_reason TEXT,
  frozen_at TIMESTAMPTZ,
  student_id TEXT, -- Khusus role 'murid' untuk relasi ke anak
  specialization TEXT, -- Khusus guru/terapis
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index untuk pencarian cepat
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
-- Policy 1: Pengguna yang terotentikasi dapat membaca profilnya sendiri
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Semua staf terotentikasi dapat melihat direktori guru/staf untuk kebutuhan jadwal
CREATE POLICY "Staff can view active profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('yayasan', 'kepala_sekolah', 'guru')
    )
  );

-- Policy 3: Super Admin (Yayasan) memiliki akses baca dan tulis penuh ke semua profil
CREATE POLICY "Super Admin full access"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'yayasan'
    )
  );

-- Policy 4: Pengguna dapat mengupdate nomor kontak dan foto diri sendiri (bukan role atau status!)
CREATE POLICY "Users can update own contact info"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Mencegah user biasa memanipulasi role atau statusnya sendiri
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())
  );

-- 5. TRIGGER ON AUTH USER CREATION (Auto Profile Creation)
-- Menghubungkan pembuatan akun di auth.users dengan record di public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    status,
    phone,
    title,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'guru'::public.app_role),
    'active'::public.account_status,
    COALESCE(NEW.raw_user_meta_data->>'phone', '0812-xxxx'),
    COALESCE(NEW.raw_user_meta_data->>'title', 'Staf Pengajar'),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. SECURE RPC FOR SUPER ADMIN: CREATE USER WITH CREDENTIALS
-- Fungsi ini dijalankan dengan SECURITY DEFINER sehingga Super Admin dapat mendaftarkan
-- akun baru langsung ke auth.users tanpa logout dari sesi aktifnya
CREATE OR REPLACE FUNCTION public.admin_create_user(
  new_email TEXT,
  new_password TEXT,
  new_name TEXT,
  new_role public.app_role,
  new_phone TEXT DEFAULT '0812-xxxx',
  new_title TEXT DEFAULT 'Terapis Klinis',
  new_specialization TEXT DEFAULT NULL,
  new_student_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  calling_role public.app_role;
  created_user_id UUID;
  result JSONB;
BEGIN
  -- Validasi hak akses pemanggil: Harus Super Admin (yayasan)
  SELECT role INTO calling_role FROM public.profiles WHERE id = auth.uid();
  IF calling_role != 'yayasan' THEN
    RAISE EXCEPTION 'Akses Ditolak: Hanya Super Admin Yayasan yang berhak membuat akun pengguna baru.';
  END IF;

  -- Buat akun di auth.users menggunakan enkripsi crypt pgcrypto
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    LOWER(TRIM(new_email)),
    crypt(new_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('name', new_name, 'role', new_role),
    NOW(),
    NOW()
  )
  RETURNING id INTO created_user_id;

  -- Update / pastikan profil terhubung
  INSERT INTO public.profiles (
    id,
    name,
    role,
    email,
    phone,
    title,
    status,
    specialization,
    student_id,
    created_at,
    updated_at
  )
  VALUES (
    created_user_id,
    TRIM(new_name),
    new_role,
    LOWER(TRIM(new_email)),
    new_phone,
    new_title,
    'active',
    new_specialization,
    new_student_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    specialization = EXCLUDED.specialization,
    student_id = EXCLUDED.student_id,
    updated_at = NOW();

  result := jsonb_build_object(
    'success', true,
    'user_id', created_user_id,
    'email', LOWER(TRIM(new_email)),
    'role', new_role
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 7. SECURE RPC FOR SUPER ADMIN: FREEZE / UNFREEZE ACCOUNT
CREATE OR REPLACE FUNCTION public.admin_set_account_status(
  target_user_id UUID,
  new_status public.account_status,
  reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calling_role public.app_role;
BEGIN
  -- Validasi pemanggil adalah Super Admin Yayasan
  SELECT role INTO calling_role FROM public.profiles WHERE id = auth.uid();
  IF calling_role != 'yayasan' THEN
    RAISE EXCEPTION 'Akses Ditolak: Hanya Super Admin Yayasan yang berhak membekukan atau mengaktifkan akun.';
  END IF;

  UPDATE public.profiles
  SET 
    status = new_status,
    freeze_reason = CASE WHEN new_status = 'frozen' THEN reason ELSE NULL END,
    frozen_at = CASE WHEN new_status = 'frozen' THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = target_user_id;

  RETURN jsonb_build_object('success', true, 'status', new_status);
END;
$$;
