# Supabase Database Schema Documentation

## Overview
This document describes the complete database schema for the DriveFlow Auto Rental Management System. The schema is designed to manage vehicles, customers, reservations, staff, and all related operations.

---

## Table Structure

### 1. **agencies** - Rental Agency Branches
Stores information about rental agency locations.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Agency name |
| address | TEXT | NOT NULL | Physical address |
| phone | VARCHAR(20) | | Contact phone number |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

---

### 2. **customers** - Rental Customers
Stores customer information and rental history.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| first_name | VARCHAR(255) | NOT NULL | Customer first name |
| last_name | VARCHAR(255) | NOT NULL | Customer last name |
| phone | VARCHAR(20) | NOT NULL | Phone number |
| email | VARCHAR(255) | | Email address |
| id_card_number | VARCHAR(50) | UNIQUE NOT NULL | National ID card number |
| wilaya | VARCHAR(100) | NOT NULL | Algerian province/state |
| address | TEXT | NOT NULL | Physical address |
| license_number | VARCHAR(50) | UNIQUE NOT NULL | Driver's license number |
| license_expiry | DATE | NOT NULL | License expiration date |
| profile_picture | VARCHAR(500) | | URL to profile photo |
| document_images | TEXT[] | DEFAULT '{}' | Array of document image URLs |
| total_reservations | INTEGER | DEFAULT 0 | Count of all reservations |
| total_spent | DECIMAL(12,2) | DEFAULT 0 | Total amount spent on rentals |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

---

### 3. **vehicles** - Fleet Inventory
Stores vehicle information and rental rates.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| brand | VARCHAR(100) | NOT NULL | Car brand/manufacturer |
| model | VARCHAR(100) | NOT NULL | Car model |
| year | INTEGER | NOT NULL | Model year |
| immatriculation | VARCHAR(50) | UNIQUE NOT NULL | License plate number |
| color | VARCHAR(100) | | Vehicle color |
| chassis_number | VARCHAR(50) | UNIQUE NOT NULL | Vehicle VIN/chassis number |
| fuel_type | VARCHAR(50) | IN ('essence','diesel','gpl') | Fuel type |
| transmission | VARCHAR(50) | IN ('manuelle','automatique') | Manual or automatic |
| seats | INTEGER | NOT NULL | Number of seats |
| doors | INTEGER | NOT NULL | Number of doors |
| daily_rate | DECIMAL(10,2) | NOT NULL | Daily rental rate |
| weekly_rate | DECIMAL(10,2) | NOT NULL | Weekly rental rate |
| monthly_rate | DECIMAL(10,2) | NOT NULL | Monthly rental rate |
| deposit | DECIMAL(10,2) | NOT NULL | Required deposit amount |
| status | VARCHAR(50) | IN ('disponible','loué','maintenance') | Current status |
| current_location | VARCHAR(255) | | Current agency location |
| mileage | INTEGER | DEFAULT 0 | Current odometer reading |
| insurance_expiry | DATE | | Insurance policy expiration |
| tech_control_date | DATE | | Technical inspection date |
| insurance_info | TEXT | | Insurance provider info |
| main_image | VARCHAR(500) | | Primary vehicle image URL |
| secondary_images | TEXT[] | DEFAULT '{}' | Array of additional image URLs |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

---

### 4. **workers** - Staff Members
Stores employee information with authentication credentials.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| full_name | VARCHAR(255) | NOT NULL | Full name |
| birthday | DATE | NOT NULL | Date of birth |
| phone | VARCHAR(20) | NOT NULL | Phone number |
| email | VARCHAR(255) | | Email address |
| address | TEXT | NOT NULL | Residential address |
| id_card_number | VARCHAR(50) | UNIQUE NOT NULL | National ID card number |
| photo | VARCHAR(500) | | Profile photo URL |
| role | VARCHAR(50) | IN ('admin','worker','driver') | User role |
| username | VARCHAR(100) | UNIQUE NOT NULL | Login username |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| payment_type | VARCHAR(50) | IN ('day','month') | Salary payment frequency |
| amount | DECIMAL(10,2) | NOT NULL | Salary amount per period |
| absences | INTEGER | DEFAULT 0 | Number of absence days |
| total_paid | DECIMAL(12,2) | DEFAULT 0 | Total amount paid to date |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

---

### 5. **worker_transactions** - Payment History
Stores payment, advance, and absence records for workers.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| worker_id | UUID | FK → workers.id | Reference to worker |
| transaction_type | VARCHAR(50) | IN ('payment','advance','absence') | Transaction type |
| amount | DECIMAL(10,2) | NOT NULL | Transaction amount |
| transaction_date | DATE | NOT NULL | Date of transaction |
| note | TEXT | | Additional notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |

**Index:** `idx_worker_transactions_worker_id` (worker_id)

---

### 6. **expenses** - Operating Expenses
Stores company expense records.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Expense description |
| cost | DECIMAL(12,2) | NOT NULL | Expense amount |
| expense_date | DATE | NOT NULL | Date of expense |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

---

### 7. **maintenance** - Vehicle Maintenance
Stores maintenance and service records.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| vehicle_id | UUID | FK → vehicles.id | Reference to vehicle |
| maintenance_type | VARCHAR(50) | IN ('vidange','assurance','ct','other') | Type of maintenance |
| name | VARCHAR(255) | NOT NULL | Service name |
| cost | DECIMAL(10,2) | NOT NULL | Service cost |
| maintenance_date | DATE | NOT NULL | Service date |
| expiry_date | DATE | | When service expires (e.g., insurance) |
| note | TEXT | | Additional notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Index:** `idx_maintenance_vehicle_id` (vehicle_id)

---

### 8. **rental_options** - Rental Add-ons
Stores available rental options and extras.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Option name |
| price | DECIMAL(10,2) | NOT NULL | Option price |
| category | VARCHAR(50) | IN ('decoration','equipment','insurance','service') | Option category |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

---

### 9. **reservations** - Rental Reservations
Stores all rental reservation records.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| reservation_number | VARCHAR(50) | UNIQUE NOT NULL | Booking reference number |
| customer_id | UUID | FK → customers.id | Reference to customer |
| vehicle_id | UUID | FK → vehicles.id | Reference to vehicle |
| pickup_agency_id | UUID | FK → agencies.id | Pickup location |
| return_agency_id | UUID | FK → agencies.id | Return location |
| driver_id | UUID | FK → workers.id (optional) | Assigned driver |
| start_date | TIMESTAMP | NOT NULL | Rental start date/time |
| end_date | TIMESTAMP | NOT NULL | Rental end date/time |
| status | VARCHAR(50) | IN ('terminer','annuler','confermer','en cours','en attente') | Booking status |
| total_amount | DECIMAL(12,2) | NOT NULL | Total rental cost |
| paid_amount | DECIMAL(12,2) | DEFAULT 0 | Amount already paid |
| caution_amount | DECIMAL(12,2) | NOT NULL | Deposit/caution amount |
| discount | DECIMAL(12,2) | DEFAULT 0 | Discount applied |
| with_tva | BOOLEAN | DEFAULT FALSE | VAT included flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Indexes:**
- `idx_reservations_customer_id` (customer_id)
- `idx_reservations_vehicle_id` (vehicle_id)
- `idx_reservations_status` (status)

---

### 10. **reservation_options** - Reservation Add-ons (Many-to-Many)
Links reservations with their selected options.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| reservation_id | UUID | FK → reservations.id | Reference to reservation |
| rental_option_id | UUID | FK → rental_options.id | Reference to option |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |

**Indexes:**
- `idx_reservation_options_reservation_id` (reservation_id)
- `idx_reservation_options_rental_option_id` (rental_option_id)

---

### 11. **location_logs** - Activation/Termination Logs
Stores mileage and fuel readings at rental start/end.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| reservation_id | UUID | FK → reservations.id | Reference to reservation |
| log_type | VARCHAR(50) | IN ('activation','termination') | Log type |
| mileage | INTEGER | NOT NULL | Odometer reading |
| fuel | VARCHAR(50) | IN ('plein','1/2','1/4','1/8','vide') | Fuel level |
| location | VARCHAR(255) | NOT NULL | Location of log |
| log_date | TIMESTAMP | NOT NULL | Date/time of log |
| notes | TEXT | | Additional notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |

**Index:** `idx_location_logs_reservation_id` (reservation_id)

---

### 12. **inspections** - Vehicle Inspections
Stores pre-rental and post-rental inspection records.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| reservation_id | UUID | FK → reservations.id | Reference to reservation |
| inspection_type | VARCHAR(50) | IN ('depart','retour') | Departure or return inspection |
| inspection_date | TIMESTAMP | NOT NULL | Inspection date/time |
| mileage | INTEGER | NOT NULL | Vehicle mileage |
| fuel | VARCHAR(50) | | Fuel level |
| security_lights | BOOLEAN | DEFAULT TRUE | Lights working |
| security_tires | BOOLEAN | DEFAULT TRUE | Tires condition |
| security_brakes | BOOLEAN | DEFAULT TRUE | Brakes working |
| security_wipers | BOOLEAN | DEFAULT TRUE | Wipers working |
| security_mirrors | BOOLEAN | DEFAULT TRUE | Mirrors intact |
| security_belts | BOOLEAN | DEFAULT TRUE | Seat belts working |
| security_horn | BOOLEAN | DEFAULT TRUE | Horn working |
| equipment_spare_wheel | BOOLEAN | DEFAULT TRUE | Spare wheel present |
| equipment_jack | BOOLEAN | DEFAULT TRUE | Jack present |
| equipment_triangles | BOOLEAN | DEFAULT TRUE | Warning triangles present |
| equipment_first_aid | BOOLEAN | DEFAULT TRUE | First aid kit present |
| equipment_docs | BOOLEAN | DEFAULT TRUE | Documents present |
| comfort_ac | BOOLEAN | DEFAULT TRUE | A/C working |
| cleanliness_interior | BOOLEAN | DEFAULT TRUE | Interior clean |
| cleanliness_exterior | BOOLEAN | DEFAULT TRUE | Exterior clean |
| notes | TEXT | | Inspector notes |
| exterior_photos | TEXT[] | DEFAULT '{}' | Exterior photo URLs |
| interior_photos | TEXT[] | DEFAULT '{}' | Interior photo URLs |
| signature | VARCHAR(500) | | Digital signature URL |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Index:** `idx_inspections_reservation_id` (reservation_id)

---

### 13. **damages** - Vehicle Damage Reports
Stores damage reports for vehicles during rentals.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| name | VARCHAR(255) | NOT NULL | Damage title |
| description | TEXT | | Detailed description |
| vehicle_id | UUID | FK → vehicles.id | Reference to vehicle |
| reservation_id | UUID | FK → reservations.id | Reference to reservation |
| customer_id | UUID | FK → customers.id | Reference to customer |
| damage_date | DATE | NOT NULL | Date damage was reported |
| severity | VARCHAR(50) | IN ('leger','moyen','grave') | Damage severity level |
| position | VARCHAR(255) | | Location on vehicle |
| costs | DECIMAL(12,2) | NOT NULL | Repair cost |
| status | VARCHAR(50) | IN ('en attente','réparé') | Repair status |
| repair_date | DATE | | Date damage was repaired |
| photos | TEXT[] | DEFAULT '{}' | Damage photo URLs |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Indexes:**
- `idx_damages_vehicle_id` (vehicle_id)
- `idx_damages_reservation_id` (reservation_id)
- `idx_damages_customer_id` (customer_id)

---

### 14. **users** - Authentication Users
Optional authentication table for user management.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| username | VARCHAR(100) | UNIQUE NOT NULL | Login username |
| email | VARCHAR(255) | UNIQUE | Email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| role | VARCHAR(50) | IN ('admin','worker','driver') | User role |
| worker_id | UUID | FK → workers.id | Reference to worker record |
| is_active | BOOLEAN | DEFAULT TRUE | Account active flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

**Indexes:**
- `idx_users_username` (username)
- `idx_users_worker_id` (worker_id)

---

### 15. **templates** - Billing Templates
Stores invoice and contract templates.

| Column | Type | Constraints | Description |
|--------|------|-----------|---|
| id | UUID | PRIMARY KEY | Unique identifier |
| template_name | VARCHAR(255) | NOT NULL | Template name |
| category | VARCHAR(100) | IN ('invoice','contract','other') | Template category |
| canvas_width | INTEGER | DEFAULT 595 | Canvas width (pixels) |
| canvas_height | INTEGER | DEFAULT 842 | Canvas height (pixels) |
| elements | JSONB | DEFAULT '[]' | Template elements JSON |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update date |

---

## Database Views

### 1. **reservation_details**
Combines reservations with customer, vehicle, and agency information.
```sql
SELECT * FROM reservation_details;
```

### 2. **vehicle_maintenance_schedule**
Shows all vehicles with their maintenance history.
```sql
SELECT * FROM vehicle_maintenance_schedule;
```

### 3. **worker_payment_summary**
Aggregates worker payment information and transaction counts.
```sql
SELECT * FROM worker_payment_summary;
```

---

## Relationships & Foreign Keys

```
agencies
└── Reservations (pickup_agency_id, return_agency_id)

customers
├── Reservations (customer_id)
└── Damages (customer_id)

vehicles
├── Reservations (vehicle_id)
├── Maintenance (vehicle_id)
├── Inspections (via reservations)
└── Damages (vehicle_id)

workers
├── Reservations (driver_id)
├── Worker_transactions (worker_id)
└── Users (worker_id)

reservations
├── Inspections (reservation_id)
├── Location_logs (reservation_id)
├── Reservation_options (reservation_id)
└── Damages (reservation_id)

rental_options
└── Reservation_options (rental_option_id)
```

---

## Row Level Security (RLS)

RLS policies are enabled for all tables with default public read access. Modify these policies in Supabase based on your authentication method.

---

## Instructions for Setup

1. **Copy the SQL code** from `SUPABASE_SETUP.sql`
2. **Log in to your Supabase project** at https://app.supabase.com
3. **Go to SQL Editor**
4. **Create a new query** and paste the entire SQL code
5. **Execute** - The entire schema will be created with sample data

---

## Sample Data Included

- **3 Agencies**
- **2 Customers**
- **2 Vehicles**
- **2 Workers** (Admin and Driver)
- **2 Expenses**
- **5 Rental Options**

---

## Notes

- All IDs use PostgreSQL UUID type for security and scalability
- Timestamps automatically set to current time
- Foreign keys use CASCADE for deletion safety
- All currency fields use DECIMAL(12,2) for accuracy
- Arrays store image URLs as TEXT[] for flexibility
- JSONB used for template elements for flexibility
- Indexes created on frequently queried columns for performance

---
