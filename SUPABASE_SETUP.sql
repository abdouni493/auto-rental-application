-- DriveFlow Auto Rental Management System
-- Supabase SQL Setup
-- Run this entire script in your Supabase SQL Editor

-- =====================================================
-- 1. AGENCIES TABLE
-- =====================================================
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  id_card_number VARCHAR(50) UNIQUE NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  profile_picture VARCHAR(500),
  document_images TEXT[] DEFAULT '{}',
  total_reservations INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. VEHICLES TABLE
-- =====================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  immatriculation VARCHAR(50) UNIQUE NOT NULL,
  color VARCHAR(100),
  chassis_number VARCHAR(50) UNIQUE NOT NULL,
  fuel_type VARCHAR(50) NOT NULL CHECK (fuel_type IN ('essence', 'diesel', 'gpl')),
  transmission VARCHAR(50) NOT NULL CHECK (transmission IN ('manuelle', 'automatique')),
  seats INTEGER NOT NULL,
  doors INTEGER NOT NULL,
  daily_rate DECIMAL(10, 2) NOT NULL,
  weekly_rate DECIMAL(10, 2) NOT NULL,
  monthly_rate DECIMAL(10, 2) NOT NULL,
  deposit DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'loué', 'maintenance')),
  current_location VARCHAR(255),
  mileage INTEGER DEFAULT 0,
  insurance_expiry DATE,
  tech_control_date DATE,
  insurance_info TEXT,
  main_image VARCHAR(500),
  secondary_images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. WORKERS TABLE (includes login credentials)
-- =====================================================
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  birthday DATE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  id_card_number VARCHAR(50) UNIQUE NOT NULL,
  photo VARCHAR(500),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'worker', 'driver')),
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('day', 'month')),
  amount DECIMAL(10, 2) NOT NULL,
  absences INTEGER DEFAULT 0,
  total_paid DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. WORKER TRANSACTIONS TABLE (Payment history, advances, absences)
-- =====================================================
CREATE TABLE worker_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('payment', 'advance', 'absence')),
  amount DECIMAL(10, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_worker_transactions_worker_id ON worker_transactions(worker_id);

-- =====================================================
-- 6. EXPENSES TABLE
-- =====================================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  cost DECIMAL(12, 2) NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. MAINTENANCE TABLE
-- =====================================================
CREATE TABLE maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('vidange', 'assurance', 'ct', 'other')),
  name VARCHAR(255) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  maintenance_date DATE NOT NULL,
  expiry_date DATE,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_maintenance_vehicle_id ON maintenance(vehicle_id);

-- =====================================================
-- 8. RENTAL OPTIONS TABLE
-- =====================================================
CREATE TABLE rental_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('decoration', 'equipment', 'insurance', 'service')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 9. RESERVATIONS TABLE
-- =====================================================
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  pickup_agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT,
  return_agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE RESTRICT,
  driver_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'en attente' CHECK (status IN ('terminer', 'annuler', 'confermer', 'en cours', 'en attente')),
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  caution_amount DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(12, 2) DEFAULT 0,
  with_tva BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX idx_reservations_vehicle_id ON reservations(vehicle_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- =====================================================
-- 10. RESERVATION OPTIONS (Join table for many-to-many)
-- =====================================================
CREATE TABLE reservation_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  rental_option_id UUID NOT NULL REFERENCES rental_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reservation_options_reservation_id ON reservation_options(reservation_id);
CREATE INDEX idx_reservation_options_rental_option_id ON reservation_options(rental_option_id);

-- =====================================================
-- 11. LOCATION LOGS TABLE (Activation and termination logs)
-- =====================================================
CREATE TABLE location_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  log_type VARCHAR(50) NOT NULL CHECK (log_type IN ('activation', 'termination')),
  mileage INTEGER NOT NULL,
  fuel VARCHAR(50) NOT NULL CHECK (fuel IN ('plein', '1/2', '1/4', '1/8', 'vide')),
  location VARCHAR(255) NOT NULL,
  log_date TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_location_logs_reservation_id ON location_logs(reservation_id);

-- =====================================================
-- 12. INSPECTIONS TABLE
-- =====================================================
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  inspection_type VARCHAR(50) NOT NULL CHECK (inspection_type IN ('depart', 'retour')),
  inspection_date TIMESTAMP NOT NULL,
  mileage INTEGER NOT NULL,
  fuel VARCHAR(50),
  
  -- Security checks (JSON object)
  security_lights BOOLEAN DEFAULT TRUE,
  security_tires BOOLEAN DEFAULT TRUE,
  security_brakes BOOLEAN DEFAULT TRUE,
  security_wipers BOOLEAN DEFAULT TRUE,
  security_mirrors BOOLEAN DEFAULT TRUE,
  security_belts BOOLEAN DEFAULT TRUE,
  security_horn BOOLEAN DEFAULT TRUE,
  
  -- Equipment checks (JSON object)
  equipment_spare_wheel BOOLEAN DEFAULT TRUE,
  equipment_jack BOOLEAN DEFAULT TRUE,
  equipment_triangles BOOLEAN DEFAULT TRUE,
  equipment_first_aid BOOLEAN DEFAULT TRUE,
  equipment_docs BOOLEAN DEFAULT TRUE,
  
  -- Comfort checks
  comfort_ac BOOLEAN DEFAULT TRUE,
  
  -- Cleanliness checks
  cleanliness_interior BOOLEAN DEFAULT TRUE,
  cleanliness_exterior BOOLEAN DEFAULT TRUE,
  
  notes TEXT,
  exterior_photos TEXT[] DEFAULT '{}',
  interior_photos TEXT[] DEFAULT '{}',
  signature VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inspections_reservation_id ON inspections(reservation_id);

-- =====================================================
-- 13. DAMAGES TABLE
-- =====================================================
CREATE TABLE damages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  damage_date DATE NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('leger', 'moyen', 'grave')),
  position VARCHAR(255),
  costs DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'en attente' CHECK (status IN ('en attente', 'réparé')),
  repair_date DATE,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_damages_vehicle_id ON damages(vehicle_id);
CREATE INDEX idx_damages_reservation_id ON damages(reservation_id);
CREATE INDEX idx_damages_customer_id ON damages(customer_id);

-- =====================================================
-- 14. USERS TABLE (For authentication - optional)
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'worker', 'driver')),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_worker_id ON users(worker_id);

-- =====================================================
-- 15. TEMPLATES TABLE (For billing templates)
-- =====================================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('invoice', 'contract', 'other')),
  canvas_width INTEGER DEFAULT 595,
  canvas_height INTEGER DEFAULT 842,
  elements JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample agencies
INSERT INTO agencies (name, address, phone) VALUES
  ('DriveFlow Alger Centre', '12 Rue Didouche Mourad, Alger', '021 55 66 77'),
  ('DriveFlow Oran Marina', 'Quai de la Marine, Oran', '041 22 33 44'),
  ('DriveFlow Constantine Rocher', 'Cité Bellevue, Constantine', '031 99 88 77');

-- Insert sample customers
INSERT INTO customers (first_name, last_name, phone, email, id_card_number, wilaya, address, license_number, license_expiry, profile_picture, total_reservations, total_spent) VALUES
  ('Ahmed', 'Belkacem', '0550 12 34 56', 'ahmed.bel@gmail.com', '1234567890', '16 - Alger', '12 Rue Didouche Mourad', 'L-2023-9988', '2028-10-15', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', 12, 450000),
  ('Yassine', 'Hamidi', '0661 44 55 66', 'y.hamidi@outlook.fr', '0987654321', '31 - Oran', 'Cité Akid Lotfi', 'L-2021-4433', '2026-05-20', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', 5, 125000);

-- Insert sample vehicles
INSERT INTO vehicles (brand, model, year, immatriculation, color, chassis_number, fuel_type, transmission, seats, doors, daily_rate, weekly_rate, monthly_rate, deposit, status, current_location, mileage, insurance_expiry, tech_control_date, insurance_info, main_image) VALUES
  ('Volkswagen', 'Golf 8 R-Line', 2023, '12345-A-6', 'Bleu Lapiz', 'VWZ123456789', 'diesel', 'automatique', 5, 5, 80, 500, 1800, 1000, 'disponible', 'Alger Centre', 15400, NOW() + INTERVAL '1 month', '2026-06-15', 'Allianz - Full Kasko', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800'),
  ('BMW', 'Serie 4 Gran Coupé', 2022, '98765-B-7', 'Noir Saphir', 'BMW987654321', 'essence', 'automatique', 5, 4, 120, 750, 2800, 2000, 'disponible', 'Oran Marina', 42000, NOW() + INTERVAL '1 month', NOW(), 'AXA - Premium Plus', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800');

-- Insert sample workers
INSERT INTO workers (full_name, birthday, phone, email, address, id_card_number, photo, role, username, password, payment_type, amount, absences, total_paid) VALUES
  ('Yacine Brahimi', '1990-05-15', '0555 11 22 33', 'yacine@driveflow.dz', 'Hydra, Alger', '123456789', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', 'admin', 'admin', 'hashed_password_here', 'month', 80000, 2, 240000),
  ('Sofiane Feghouli', '1992-12-10', '0666 44 55 66', 'sofiane@driveflow.dz', 'El Biar, Alger', '987654321', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', 'driver', 'driver', 'hashed_password_here', 'day', 3500, 0, 105000);

-- Insert sample expenses
INSERT INTO expenses (name, cost, expense_date) VALUES
  ('Loyer Bureau Janvier', 45000, '2024-01-05'),
  ('Facture Electricité', 12000, '2024-02-10');

-- Insert sample rental options
INSERT INTO rental_options (name, price, category) VALUES
  ('GPS Navigation', 1500, 'equipment'),
  ('Child Seat', 2500, 'equipment'),
  ('Full Insurance', 5000, 'insurance'),
  ('Premium Cleaning', 3000, 'service'),
  ('Airport Delivery', 2000, 'service');

-- =====================================================
-- VIEWS FOR EASIER DATA RETRIEVAL
-- =====================================================

-- View for reservation details with customer and vehicle info
CREATE OR REPLACE VIEW reservation_details AS
SELECT 
  r.id,
  r.reservation_number,
  r.start_date,
  r.end_date,
  r.status,
  r.total_amount,
  r.paid_amount,
  r.caution_amount,
  c.first_name || ' ' || c.last_name AS customer_name,
  c.phone AS customer_phone,
  v.brand || ' ' || v.model AS vehicle_name,
  v.immatriculation,
  a1.name AS pickup_agency,
  a2.name AS return_agency,
  w.full_name AS driver_name
FROM reservations r
LEFT JOIN customers c ON r.customer_id = c.id
LEFT JOIN vehicles v ON r.vehicle_id = v.id
LEFT JOIN agencies a1 ON r.pickup_agency_id = a1.id
LEFT JOIN agencies a2 ON r.return_agency_id = a2.id
LEFT JOIN workers w ON r.driver_id = w.id;

-- View for vehicle maintenance schedule
CREATE OR REPLACE VIEW vehicle_maintenance_schedule AS
SELECT 
  v.id,
  v.brand || ' ' || v.model AS vehicle_name,
  v.immatriculation,
  m.maintenance_type,
  m.name,
  m.maintenance_date,
  m.expiry_date,
  m.cost,
  m.note
FROM vehicles v
LEFT JOIN maintenance m ON v.id = m.vehicle_id
ORDER BY m.expiry_date;

-- View for worker payment summary
CREATE OR REPLACE VIEW worker_payment_summary AS
SELECT 
  w.id,
  w.full_name,
  w.role,
  w.payment_type,
  w.amount,
  w.total_paid,
  w.absences,
  COUNT(wt.id) AS total_transactions
FROM workers w
LEFT JOIN worker_transactions wt ON w.id = wt.worker_id
GROUP BY w.id, w.full_name, w.role, w.payment_type, w.amount, w.total_paid, w.absences;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (Optional but recommended)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE damages ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for public access (modify as needed)
CREATE POLICY "Enable read access for all users" ON agencies FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON workers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON rental_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON reservations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON inspections FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON damages FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON templates FOR SELECT USING (true);

-- =====================================================
-- END OF SETUP SCRIPT
-- =====================================================
-- Total Tables Created: 15
-- Sample Data Inserted: Yes
-- Views Created: 3
-- RLS Enabled: Yes
-- =====================================================
