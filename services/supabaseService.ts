import { supabase } from '../config/supabase';
import { Vehicle, Customer, Agency, Worker, Inspection, Damage, Reservation, Maintenance, Expense } from '../types';

// Vehicles
export const getVehicles = async (): Promise<Vehicle[]> => {
  const { data, error } = await supabase.from('vehicles').select('*');
  if (error) throw error;
  return data || [];
};

export const getVehicleById = async (id: string): Promise<Vehicle | null> => {
  const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
  const { data, error } = await supabase.from('vehicles').insert([vehicle]).select().single();
  if (error) throw error;
  return data;
};

export const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
  const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw error;
};

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) throw error;
  return data || [];
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  const { data, error } = await supabase.from('customers').insert([customer]).select().single();
  if (error) throw error;
  return data;
};

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
};

// Agencies
export const getAgencies = async (): Promise<Agency[]> => {
  const { data, error } = await supabase.from('agencies').select('*');
  if (error) throw error;
  return data || [];
};

export const getAgencyById = async (id: string): Promise<Agency | null> => {
  const { data, error } = await supabase.from('agencies').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createAgency = async (agency: Omit<Agency, 'id'>): Promise<Agency> => {
  const { data, error } = await supabase.from('agencies').insert([agency]).select().single();
  if (error) throw error;
  return data;
};

export const updateAgency = async (id: string, updates: Partial<Agency>): Promise<Agency> => {
  const { data, error } = await supabase.from('agencies').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteAgency = async (id: string): Promise<void> => {
  const { error } = await supabase.from('agencies').delete().eq('id', id);
  if (error) throw error;
};

// Workers
export const getWorkers = async (): Promise<Worker[]> => {
  const { data, error } = await supabase.from('workers').select('*');
  if (error) throw error;
  return data || [];
};

export const getWorkerById = async (id: string): Promise<Worker | null> => {
  const { data, error } = await supabase.from('workers').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createWorker = async (worker: Omit<Worker, 'id'>): Promise<Worker> => {
  const { data, error } = await supabase.from('workers').insert([worker]).select().single();
  if (error) throw error;
  return data;
};

export const updateWorker = async (id: string, updates: Partial<Worker>): Promise<Worker> => {
  const { data, error } = await supabase.from('workers').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteWorker = async (id: string): Promise<void> => {
  const { error } = await supabase.from('workers').delete().eq('id', id);
  if (error) throw error;
};

// Inspections
export const getInspections = async (): Promise<Inspection[]> => {
  const { data, error } = await supabase.from('inspections').select('*');
  if (error) throw error;
  return data || [];
};

export const getInspectionById = async (id: string): Promise<Inspection | null> => {
  const { data, error } = await supabase.from('inspections').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createInspection = async (inspection: Omit<Inspection, 'id'>): Promise<Inspection> => {
  const { data, error } = await supabase.from('inspections').insert([inspection]).select().single();
  if (error) throw error;
  return data;
};

export const updateInspection = async (id: string, updates: Partial<Inspection>): Promise<Inspection> => {
  const { data, error } = await supabase.from('inspections').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteInspection = async (id: string): Promise<void> => {
  const { error } = await supabase.from('inspections').delete().eq('id', id);
  if (error) throw error;
};

// Damages
export const getDamages = async (): Promise<Damage[]> => {
  const { data, error } = await supabase.from('damages').select('*');
  if (error) throw error;
  return data || [];
};

export const getDamageById = async (id: string): Promise<Damage | null> => {
  const { data, error } = await supabase.from('damages').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createDamage = async (damage: Omit<Damage, 'id'>): Promise<Damage> => {
  const { data, error } = await supabase.from('damages').insert([damage]).select().single();
  if (error) throw error;
  return data;
};

export const updateDamage = async (id: string, updates: Partial<Damage>): Promise<Damage> => {
  const { data, error } = await supabase.from('damages').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteDamage = async (id: string): Promise<void> => {
  const { error } = await supabase.from('damages').delete().eq('id', id);
  if (error) throw error;
};

// Reservations
export const getReservations = async (): Promise<Reservation[]> => {
  const { data, error } = await supabase.from('reservations').select('*');
  if (error) throw error;
  return data || [];
};

export const getReservationById = async (id: string): Promise<Reservation | null> => {
  const { data, error } = await supabase.from('reservations').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createReservation = async (reservation: Omit<Reservation, 'id'>): Promise<Reservation> => {
  const { data, error } = await supabase.from('reservations').insert([reservation]).select().single();
  if (error) throw error;
  return data;
};

export const updateReservation = async (id: string, updates: Partial<Reservation>): Promise<Reservation> => {
  const { data, error } = await supabase.from('reservations').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteReservation = async (id: string): Promise<void> => {
  const { error } = await supabase.from('reservations').delete().eq('id', id);
  if (error) throw error;
};

// Maintenance
export const getMaintenances = async (): Promise<Maintenance[]> => {
  const { data, error } = await supabase.from('maintenance').select('*');
  if (error) throw error;
  return data || [];
};

export const getMaintenanceById = async (id: string): Promise<Maintenance | null> => {
  const { data, error } = await supabase.from('maintenance').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createMaintenance = async (maintenance: Omit<Maintenance, 'id'>): Promise<Maintenance> => {
  const { data, error } = await supabase.from('maintenance').insert([maintenance]).select().single();
  if (error) throw error;
  return data;
};

export const updateMaintenance = async (id: string, updates: Partial<Maintenance>): Promise<Maintenance> => {
  const { data, error } = await supabase.from('maintenance').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteMaintenance = async (id: string): Promise<void> => {
  const { error } = await supabase.from('maintenance').delete().eq('id', id);
  if (error) throw error;
};

// Expenses
export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase.from('expenses').select('*');
  if (error) throw error;
  return data || [];
};

export const getExpenseById = async (id: string): Promise<Expense | null> => {
  const { data, error } = await supabase.from('expenses').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const { data, error } = await supabase.from('expenses').insert([expense]).select().single();
  if (error) throw error;
  return data;
};

export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense> => {
  const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
};
