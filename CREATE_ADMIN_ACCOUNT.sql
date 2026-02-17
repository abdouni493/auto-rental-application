-- =====================================================
-- CREATE ADMIN ACCOUNT
-- =====================================================
-- Run this script in your Supabase SQL Editor to create admin account
-- Login credentials:
-- Email/Username: admin@admin.com
-- Password: admin123

INSERT INTO workers (
  full_name,
  birthday,
  phone,
  email,
  address,
  id_card_number,
  role,
  username,
  password,
  payment_type,
  amount
) VALUES (
  'Administrator',
  '2000-01-01',
  '0000000000',
  'admin@admin.com',
  'System Administrator',
  'ADMIN_MASTER_001',
  'admin',
  'admin@admin.com',
  'admin123',
  'month',
  0
);

-- Verify the account was created (optional - run this to check)
SELECT id, full_name, username, email, role, created_at FROM workers WHERE username = 'admin@admin.com';
