-- Add UNIQUE constraint to email column in existing profiles table
-- Run this in Supabase SQL Editor

-- First, let's see if there are any duplicate emails that would prevent adding UNIQUE constraint
SELECT email, COUNT(*) as count 
FROM profiles 
WHERE email IS NOT NULL 
GROUP BY email 
HAVING COUNT(*) > 1;

-- If there are duplicates, you'll need to handle them first
-- For now, let's add the UNIQUE constraint (this will fail if duplicates exist)

-- Add UNIQUE constraint to email
ALTER TABLE profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Add index for email (for better performance)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Verify the constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
AND conname LIKE '%email%';
