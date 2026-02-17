// =====================================================
// ADDITIONAL SERVICE FUNCTIONS TO ADD TO dataService.ts
// =====================================================
// INSTRUCTIONS: Copy these functions into your existing dataService.ts file
// Replace the imports below with your actual project imports
// These are meant to be merged into dataService.ts, not used as a standalone file

import { supabase } from './config/supabase';
import type { Reservation, RentalOption, Maintenance, LocationLog } from './types';

export const getReservationsByCustomer = async (customerId: string): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('customer_id', customerId)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatReservation) : [];
};

export const getReservationsByVehicle = async (vehicleId: string): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatReservation) : [];
};

export const getReservationsByStatus = async (status: string): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('status', status)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatReservation) : [];
};

export const getReservationById = async (id: string): Promise<Reservation | null> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data ? formatReservation(data) : null;
};

// =====================================================
// RENTAL OPTIONS OPERATIONS
// =====================================================

export const getRentalOptions = async (): Promise<RentalOption[]> => {
  const { data, error } = await supabase
    .from('rental_options')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatRentalOption) : [];
};

export const getRentalOptionsByCategory = async (category: string): Promise<RentalOption[]> => {
  const { data, error } = await supabase
    .from('rental_options')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatRentalOption) : [];
};

export const createRentalOption = async (option: Omit<RentalOption, 'id'>): Promise<RentalOption> => {
  const { data, error } = await supabase
    .from('rental_options')
    .insert([{
      name: option.name,
      price: option.price,
      category: option.category
    }])
    .select()
    .single();
  if (error) throw error;
  return formatRentalOption(data);
};

export const updateRentalOption = async (id: string, updates: Partial<RentalOption>): Promise<RentalOption> => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.price) updateData.price = updates.price;
  if (updates.category) updateData.category = updates.category;

  const { data, error } = await supabase
    .from('rental_options')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return formatRentalOption(data);
};

export const deleteRentalOption = async (id: string): Promise<void> => {
  const { error } = await supabase.from('rental_options').delete().eq('id', id);
  if (error) throw error;
};

// =====================================================
// MAINTENANCE EXTENDED OPERATIONS
// =====================================================

export const getMaintenanceByVehicle = async (vehicleId: string): Promise<Maintenance[]> => {
  const { data, error } = await supabase
    .from('maintenance')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('maintenance_date', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatMaintenance) : [];
};

export const getMaintenanceExpiring = async (days: number = 30): Promise<Maintenance[]> => {
  const today = new Date();
  const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from('maintenance')
    .select('*')
    .lte('expiry_date', futureDate.toISOString().split('T')[0])
    .gte('expiry_date', today.toISOString().split('T')[0]);
  if (error) throw error;
  return data ? data.map(formatMaintenance) : [];
};

export const createMaintenance = async (maintenance: Omit<Maintenance, 'id'>): Promise<Maintenance> => {
  const { data, error } = await supabase
    .from('maintenance')
    .insert([{
      vehicle_id: maintenance.vehicleId,
      maintenance_type: maintenance.type,
      name: maintenance.name,
      cost: maintenance.cost,
      maintenance_date: maintenance.date,
      expiry_date: maintenance.expiryDate,
      note: maintenance.note
    }])
    .select()
    .single();
  if (error) throw error;
  return formatMaintenance(data);
};

export const updateMaintenance = async (id: string, updates: Partial<Maintenance>): Promise<Maintenance> => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.cost) updateData.cost = updates.cost;
  if (updates.date) updateData.maintenance_date = updates.date;
  if (updates.expiryDate) updateData.expiry_date = updates.expiryDate;
  if (updates.note) updateData.note = updates.note;

  const { data, error } = await supabase
    .from('maintenance')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return formatMaintenance(data);
};

export const deleteMaintenance = async (id: string): Promise<void> => {
  const { error } = await supabase.from('maintenance').delete().eq('id', id);
  if (error) throw error;
};

// =====================================================
// LOCATION LOGS OPERATIONS
// =====================================================

export const getLocationLogs = async (reservationId: string): Promise<LocationLog[]> => {
  const { data, error } = await supabase
    .from('location_logs')
    .select('*')
    .eq('reservation_id', reservationId)
    .order('log_date', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatLocationLog) : [];
};

export const createLocationLog = async (log: Omit<LocationLog, 'id'> & { reservationId: string, logType: 'activation' | 'termination' }): Promise<LocationLog> => {
  const { data, error } = await supabase
    .from('location_logs')
    .insert([{
      reservation_id: log.reservationId,
      log_type: log.logType,
      mileage: log.mileage,
      fuel: log.fuel,
      location: log.location,
      log_date: log.date,
      notes: log.notes
    }])
    .select()
    .single();
  if (error) throw error;
  return formatLocationLog(data);
};

// =====================================================
// TEMPLATES OPERATIONS
// =====================================================

export const getTemplates = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getTemplatesByCategory = async (category: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createTemplate = async (template: any): Promise<any> => {
  const { data, error } = await supabase
    .from('templates')
    .insert([{
      template_name: template.name,
      category: template.category,
      canvas_width: template.canvasWidth,
      canvas_height: template.canvasHeight,
      elements: template.elements
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTemplate = async (id: string, updates: any): Promise<any> => {
  const updateData: any = {};
  if (updates.name) updateData.template_name = updates.name;
  if (updates.category) updateData.category = updates.category;
  if (updates.elements) updateData.elements = updates.elements;
  if (updates.canvasWidth) updateData.canvas_width = updates.canvasWidth;
  if (updates.canvasHeight) updateData.canvas_height = updates.canvasHeight;

  const { data, error } = await supabase
    .from('templates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase.from('templates').delete().eq('id', id);
  if (error) throw error;
};

// =====================================================
// ANALYTICS QUERIES
// =====================================================

export const getRevenueStats = async (): Promise<{
  totalRevenue: number;
  totalReservations: number;
  averageReservationValue: number;
}> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('total_amount');
  if (error) throw error;

  const reservations = data || [];
  const totalRevenue = reservations.reduce((sum, r) => sum + (r.total_amount || 0), 0);
  
  return {
    totalRevenue,
    totalReservations: reservations.length,
    averageReservationValue: reservations.length > 0 ? totalRevenue / reservations.length : 0
  };
};

export const getExpenseStats = async (): Promise<{
  totalExpenses: number;
  totalMaintenance: number;
  totalOperatingCosts: number;
}> => {
  const { data: expensesData, error: expError } = await supabase
    .from('expenses')
    .select('cost');
  
  const { data: maintenanceData, error: mainError } = await supabase
    .from('maintenance')
    .select('cost');

  if (expError || mainError) throw expError || mainError;

  const expenses = expensesData || [];
  const maintenance = maintenanceData || [];

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.cost || 0), 0);
  const totalMaintenance = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);

  return {
    totalExpenses,
    totalMaintenance,
    totalOperatingCosts: totalExpenses + totalMaintenance
  };
};

export const getVehicleUtilization = async (): Promise<{
  available: number;
  rented: number;
  maintenance: number;
}> => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('status');
  if (error) throw error;

  const vehicles = data || [];
  
  return {
    available: vehicles.filter(v => v.status === 'disponible').length,
    rented: vehicles.filter(v => v.status === 'loué').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length
  };
};

// =====================================================
// ADDITIONAL FORMATTERS
// =====================================================

function formatReservation(data: any): Reservation {
  return {
    id: data.id,
    reservationNumber: data.reservation_number,
    customerId: data.customer_id,
    vehicleId: data.vehicle_id,
    driverId: data.driver_id || null,
    pickupAgencyId: data.pickup_agency_id,
    returnAgencyId: data.return_agency_id,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
    totalAmount: data.total_amount || 0,
    paidAmount: data.paid_amount || 0,
    cautionAmount: data.caution_amount || 0,
    discount: data.discount || 0,
    withTVA: data.with_tva || false,
    options: data.options || [],
    activationLog: data.activation_log ? JSON.parse(data.activation_log) : null,
    terminationLog: data.termination_log ? JSON.parse(data.termination_log) : null
  };
}

function formatRentalOption(data: any): RentalOption {
  return {
    id: data.id,
    name: data.name,
    price: data.price,
    category: data.category
  };
}

function formatMaintenance(data: any): Maintenance {
  return {
    id: data.id,
    vehicleId: data.vehicle_id,
    type: data.maintenance_type,
    name: data.name,
    cost: data.cost,
    date: data.maintenance_date,
    expiryDate: data.expiry_date,
    note: data.note
  };
}

function formatLocationLog(data: any): LocationLog {
  return {
    mileage: data.mileage,
    fuel: data.fuel,
    location: data.location,
    date: data.log_date,
    notes: data.notes
  };
}

// =====================================================
// HOW TO USE THIS FILE
// =====================================================
// 1. Open your services/dataService.ts file
// 2. Copy all the functions from this file (from getReservationsByCustomer to getVehicleUtilization)
// 3. Paste them into dataService.ts before the final export statements
// 4. Update the imports at the top of dataService.ts to include Maintenance and LocationLog if not already there
// 5. Add these function names to your existing export statements
// 6. Delete this file (EXTENDED_SERVICES.ts) - it's just a reference
