# Supabase Integration Guide

## Overview
This guide explains how the DriveFlow application is now fully connected to Supabase for real-time data management.

---

## Architecture

### Data Flow
```
Components/Pages
    ↓
Data Service (dataService.ts)
    ↓
Supabase Client
    ↓
Supabase Database
```

---

## Key Services & Functions

### 1. **dataService.ts** - Main Data Layer
Located at: `services/dataService.ts`

All CRUD operations go through this service. It handles:
- Converting between TypeScript interfaces and database tables
- Managing API calls to Supabase
- Formatting responses (snake_case ↔ camelCase conversion)

### 2. **supabase.ts** - Supabase Client
Located at: `config/supabase.ts`

Initializes the Supabase client with your project credentials:
```typescript
import { supabase } from '../config/supabase';
```

---

## Updated Pages Using Real Database

### ✅ VehiclesPage
**File:** `pages/VehiclesPage.tsx`

**Operations:**
- Load all vehicles: `dataService.getVehicles()`
- Create vehicle: `dataService.createVehicle()`
- Update vehicle: `dataService.updateVehicle()`
- Delete vehicle: `dataService.deleteVehicle()`

**Data Flow:**
```
VehiclesPage → dataService.getVehicles() → Supabase DB
```

### ✅ CustomersPage
**File:** `pages/CustomersPage.tsx`

**Operations:**
- Load all customers: `dataService.getCustomers()`
- Create customer: `dataService.createCustomer()`
- Update customer: `dataService.updateCustomer()`
- Delete customer: `dataService.deleteCustomer()`

### ✅ AgenciesPage
**File:** `pages/AgenciesPage.tsx`

**Operations:**
- Load all agencies: `dataService.getAgencies()`
- Create agency: `dataService.createAgency()`
- Update agency: `dataService.updateAgency()`
- Delete agency: `dataService.deleteAgency()`

### ✅ WorkersPage
**File:** `pages/WorkersPage.tsx`

**Operations:**
- Load all workers: `dataService.getWorkers()`
- Create worker: `dataService.createWorker()`
- Update worker: `dataService.updateWorker()`
- Delete worker: `dataService.deleteWorker()`
- Add transaction: `dataService.createWorkerTransaction()`
- Get worker transactions: `dataService.getWorkerTransactions()`

### ✅ ExpensesPage
**File:** `pages/ExpensesPage.tsx`

**Operations:**
- Load all expenses: `dataService.getExpenses()`
- Create expense: `dataService.createExpense()`
- Update expense: `dataService.updateExpense()`
- Delete expense: `dataService.deleteExpense()`

### ✅ OperationsPage
**File:** `pages/OperationsPage.tsx`

**Operations:**
- Load inspections: `dataService.getInspections()`
- Create inspection: `dataService.createInspection()`
- Load damages: `dataService.getDamages()`
- Create damage: `dataService.createDamage()`
- Update damage: `dataService.updateDamage()`

---

## Usage Examples

### Example 1: Loading Vehicles
```typescript
import * as dataService from '../services/dataService';
import { useEffect, useState } from 'react';

function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        const data = await dataService.getVehicles();
        setVehicles(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  return (
    <>
      {loading && <p>Loading...</p>}
      {vehicles.map(v => <div key={v.id}>{v.brand} {v.model}</div>)}
    </>
  );
}
```

### Example 2: Creating a Customer
```typescript
const newCustomer = await dataService.createCustomer({
  firstName: 'Ahmed',
  lastName: 'Belkacem',
  phone: '0550123456',
  email: 'ahmed@example.com',
  idCardNumber: '1234567890',
  wilaya: '16 - Alger',
  address: '123 Rue Test',
  licenseNumber: 'L-2023-1234',
  licenseExpiry: '2028-10-15',
  totalReservations: 0,
  totalSpent: 0
});
```

### Example 3: Updating a Vehicle Status
```typescript
const updated = await dataService.updateVehicle(vehicleId, {
  status: 'loué',
  currentLocation: 'Oran Marina',
  mileage: 50000
});
```

### Example 4: Adding Worker Transaction
```typescript
await dataService.createWorkerTransaction({
  workerId: worker.id,
  type: 'payment',
  amount: 80000,
  date: '2024-02-16',
  note: 'Salaire Janvier'
});
```

---

## Data Formatting

The service automatically converts between:
- **Database format** (snake_case): `first_name`, `id_card_number`
- **TypeScript format** (camelCase): `firstName`, `idCardNumber`

This happens in formatter functions like:
- `formatVehicle()`
- `formatCustomer()`
- `formatWorker()`
- `formatInspection()`
- `formatDamage()`

---

## Error Handling

All service functions throw errors that should be caught:

```typescript
try {
  const vehicles = await dataService.getVehicles();
} catch (error) {
  console.error('Error loading vehicles:', error);
  // Show error to user
}
```

Pages already implement error state:
```typescript
const [error, setError] = useState<string | null>(null);

try {
  setError(null);
  // perform operation
} catch (err) {
  setError('Error message');
}
```

---

## Loading States

All pages implement loading indicators:

```typescript
const [isLoading, setIsLoading] = useState(false);

// Show loading spinner
{isLoading && <div>Loading...</div>}
```

---

## Remaining Integration Tasks

### Pages Still Using Mock Data (Need Updates):
- [ ] BillingPage
- [ ] DashboardPage
- [ ] ReportsPage
- [ ] AIAnalysisPage
- [ ] PersonalizationPage
- [ ] ConfigPage
- [ ] PlannerPage
- [ ] DriverPlannerPage
- [ ] WorkerPaymentsPage

### Services Still Needed:
- [ ] Reservation management (create, update, list)
- [ ] Reservation options management
- [ ] Location logs management
- [ ] Maintenance management
- [ ] Rental options management
- [ ] Template management

### To Add These:
1. Extend `dataService.ts` with missing operations
2. Update remaining pages to use new services
3. Implement reservation booking flow
4. Add search and filtering capabilities

---

## Database Structure Reference

### Vehicles Table
- Stores: `vehicles`
- Key fields: id, brand, model, status, dailyRate, mileage

### Customers Table
- Stores: `customers`
- Key fields: id, firstName, lastName, phone, licenseExpiry, totalSpent

### Workers Table
- Stores: `workers`
- Key fields: id, fullName, username, password, role, amount, totalPaid

### Agencies Table
- Stores: `agencies`
- Key fields: id, name, address, phone

### Expenses Table
- Stores: `expenses`
- Key fields: id, name, cost, date

### Inspections Table
- Stores: `inspections`
- Key fields: id, reservationId, type, mileage, fuel, (all security/equipment/comfort checks)

### Damages Table
- Stores: `damages`
- Key fields: id, name, vehicleId, reservationId, severity, costs, status

### Reservations Table
- Stores: `reservations`
- Key fields: id, reservationNumber, customerId, vehicleId, status, totalAmount

### Worker Transactions Table
- Stores: `worker_transactions`
- Key fields: id, workerId, type (payment/advance/absence), amount, date

---

## Performance Notes

### Indexes Created for Speed
- `idx_worker_transactions_worker_id` - Fast worker transaction lookups
- `idx_maintenance_vehicle_id` - Fast vehicle maintenance lookups
- `idx_reservations_customer_id` - Fast customer reservation lookups
- `idx_reservations_vehicle_id` - Fast vehicle reservation lookups
- `idx_reservations_status` - Fast reservation status filtering
- `idx_inspections_reservation_id` - Fast inspection lookups
- `idx_damages_vehicle_id` - Fast damage lookups

### Queries Optimized
- All list operations use `.order('created_at', { ascending: false })`
- Foreign key joins handled automatically by Supabase

---

## Testing the Integration

### Manual Testing Steps:
1. ✅ Load application
2. ✅ Navigate to VehiclesPage → Should load from Supabase
3. ✅ Create a new vehicle → Check Supabase table for new entry
4. ✅ Update vehicle → Verify changes in database
5. ✅ Delete vehicle → Confirm removal
6. ✅ Repeat for Customers, Agencies, Workers, Expenses

### Expected Outcomes:
- ✓ Data loads from Supabase database
- ✓ Create/Update/Delete operations persist to database
- ✓ No more mock data usage
- ✓ Real-time data consistency
- ✓ Error handling displays proper messages

---

## Troubleshooting

### Issue: "No rows returned"
**Cause:** Table is empty or query has wrong filter
**Solution:** Check Supabase dashboard → Table contains data

### Issue: "Permissions denied"
**Cause:** RLS (Row Level Security) policies blocking access
**Solution:** Modify RLS policies in Supabase:
```sql
CREATE POLICY "Enable read access for all users" ON table_name FOR SELECT USING (true);
```

### Issue: "Field not found"
**Cause:** Database column name mismatch
**Solution:** Verify formatter functions match exact column names from database

---

## Next Steps

1. **Test all updated pages** with real database
2. **Update remaining pages** (BillingPage, DashboardPage, etc.)
3. **Implement missing operations** (reservations, maintenance, etc.)
4. **Add search & filtering** across all pages
5. **Implement real authentication** using workers table
6. **Add image uploads** to Supabase Storage for photos
7. **Set up Row Level Security** for proper access control
8. **Add real-time subscriptions** for live updates

---

## Support References

- **Supabase Docs:** https://supabase.com/docs
- **TypeScript Types:** `types.ts`
- **SQL Schema:** `SUPABASE_SETUP.sql`
- **Database Documentation:** `DATABASE_SCHEMA.md`

---
