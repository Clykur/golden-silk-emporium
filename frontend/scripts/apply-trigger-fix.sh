#!/bin/bash
# Apply all fixes via Supabase REST API using curl

SUPABASE_URL="https://xwxryhgfnkxrthaeybsr.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3eHJ5aGdmbmt4cnRoYWV5YnNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc0NTEwNywiZXhwIjoyMDk3MzIxMTA3fQ.cIjRYEZPcXisfDHREJfmyTNypZf-HTh_bjxHtP7CQrM"

echo "======================================================"
echo "  APPLYING TRIGGER FIX VIA SUPABASE SQL ENDPOINT"
echo "======================================================"

# The full SQL to drop and recreate the trigger function with proper NULLIF handling
SQL='
-- Step 1: Clean up existing empty/malformed phone strings to NULL
UPDATE public.profiles
SET phone = NULL
WHERE phone IS NOT NULL AND (TRIM(phone) = '"'"''"'"' OR LENGTH(TRIM(phone)) = 0);

-- Step 2: Drop and recreate the trigger function with NULLIF protection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_phone TEXT;
  v_email TEXT;
  v_role TEXT;
BEGIN
  -- Extract name with fallback chain
  v_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'"'"'name'"'"'), '"'"''"'"'),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'"'"'full_name'"'"'), '"'"''"'"'),
    NULLIF(TRIM(split_part(NEW.email, '"'"'@'"'"', 1)), '"'"''"'"'),
    '"'"''"'"'
  );

  -- Extract phone, convert empty string to NULL
  v_phone := NULLIF(TRIM(COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'"'"'phone'"'"'
  )), '"'"''"'"');

  -- Extract email, convert empty string to NULL
  v_email := NULLIF(TRIM(NEW.email), '"'"''"'"');

  -- Extract role
  v_role := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'"'"'role'"'"'), '"'"''"'"'),
    '"'"'customer'"'"'
  );

  -- Insert or update profile atomically
  INSERT INTO public.profiles (id, email, phone, name, role, created_at, updated_at)
  VALUES (NEW.id, v_email, v_phone, v_name, v_role, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET
    email     = EXCLUDED.email,
    phone     = EXCLUDED.phone,
    name      = EXCLUDED.name,
    role      = EXCLUDED.role,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but do NOT block user creation
  RAISE WARNING '"'"'handle_new_user trigger failed for user %: % %'"'"', NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 3: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;
'

echo ""
echo "Sending SQL via Supabase RPC..."
RESPONSE=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}")

echo "RPC response: $RESPONSE"
