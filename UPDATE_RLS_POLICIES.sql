-- =====================================================
-- UPDATE RLS POLICIES FOR AUTO-REGISTRATION
-- =====================================================
-- Run this script in your Supabase SQL Editor to update RLS policies
-- This allows the auto-registration feature to work correctly

-- Drop existing policies on workers table
DROP POLICY IF EXISTS "Enable read access for all users" ON workers;
DROP POLICY IF EXISTS "Enable write access for public auto-registration" ON workers;
DROP POLICY IF EXISTS "Enable update access for all users" ON workers;

-- Create new policies for workers table
CREATE POLICY "Enable read access for all users" ON workers FOR SELECT USING (true);
CREATE POLICY "Enable write access for public auto-registration" ON workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON workers FOR UPDATE USING (true) WITH CHECK (true);

-- Drop and recreate policies for other tables to allow writes
DROP POLICY IF EXISTS "Enable read access for all users" ON rental_options;
CREATE POLICY "Enable read access for all users" ON rental_options FOR SELECT USING (true);
CREATE POLICY "Enable write access for rental options" ON rental_options FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON reservations;
CREATE POLICY "Enable read access for all users" ON reservations FOR SELECT USING (true);
CREATE POLICY "Enable write access for reservations" ON reservations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON inspections;
CREATE POLICY "Enable read access for all users" ON inspections FOR SELECT USING (true);
CREATE POLICY "Enable write access for inspections" ON inspections FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON damages;
CREATE POLICY "Enable read access for all users" ON damages FOR SELECT USING (true);
CREATE POLICY "Enable write access for damages" ON damages FOR INSERT WITH CHECK (true);

-- Add policies for other write operations
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON agencies;
CREATE POLICY "Enable read access for all users" ON agencies FOR SELECT USING (true);
CREATE POLICY "Enable write access for agencies" ON agencies FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for agencies" ON agencies FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable write access for customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for customers" ON customers FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON vehicles;
CREATE POLICY "Enable read access for all users" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Enable write access for vehicles" ON vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for vehicles" ON vehicles FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON expenses;
CREATE POLICY "Enable read access for all users" ON expenses FOR SELECT USING (true);
CREATE POLICY "Enable write access for expenses" ON expenses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON maintenance;
CREATE POLICY "Enable read access for all users" ON maintenance FOR SELECT USING (true);
CREATE POLICY "Enable write access for maintenance" ON maintenance FOR INSERT WITH CHECK (true);

-- Add write policies for worker_transactions
ALTER TABLE worker_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON worker_transactions;
CREATE POLICY "Enable read access for worker_transactions" ON worker_transactions FOR SELECT USING (true);
CREATE POLICY "Enable write access for worker_transactions" ON worker_transactions FOR INSERT WITH CHECK (true);

-- =====================================================
-- Complete! RLS policies updated for auto-registration
-- =====================================================
