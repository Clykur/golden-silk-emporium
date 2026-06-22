-- ============================================================
-- MAAYA COUTURE — SUPABASE AUTH & PROFILES ALIGNMENT MIGRATION
-- ============================================================

-- Convert existing empty strings to NULL to avoid unique constraint failures on email and phone
UPDATE public.profiles 
SET 
  phone = NULLIF(TRIM(phone), ''),
  email = NULLIF(TRIM(email), '');

-- 1. Ensure safe defaults and constraints on the public.profiles table
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'customer',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN name SET DEFAULT '';

-- Drop constraints if they exist to prevent errors, then re-add
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_email_key UNIQUE (email);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_key;
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_phone_key UNIQUE (phone);

-- 2. Create the robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_phone TEXT;
  user_email TEXT;
  user_role TEXT;
BEGIN
  -- Extract name: metadata name -> metadata full_name -> email prefix -> phone -> default ''
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    NEW.phone,
    ''
  );

  -- Extract and normalize phone, convert empty strings to NULL
  user_phone := NULLIF(TRIM(COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone')), '');

  -- Extract and normalize email, convert empty strings to NULL
  user_email := NULLIF(TRIM(NEW.email), '');

  -- Extract role, default to 'customer'
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'customer'
  );

  -- Insert profile, or update on conflict (to avoid synchronization issues)
  INSERT INTO public.profiles (id, email, phone, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    user_email,
    user_phone,
    user_name,
    user_role,
    COALESCE(NEW.created_at, NOW()),
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Set proper permissions for the trigger function
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- 4. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
