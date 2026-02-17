import { supabase } from '../config/supabase';
import { Vehicle, Customer, Agency, Worker, Inspection, Damage, Reservation, Maintenance, Expense, WorkerTransaction } from '../types';

// =====================================================
// VEHICLES OPERATIONS
// =====================================================

export const getVehicles = async (): Promise<Vehicle[]> => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
  const { data, error } = await supabase
    .from('vehicles')
    .insert([{
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      immatriculation: vehicle.immatriculation,
      color: vehicle.color,
      chassis_number: vehicle.chassisNumber,
      fuel_type: vehicle.fuelType,
      transmission: vehicle.transmission,
      seats: vehicle.seats,
      doors: vehicle.doors,
      daily_rate: vehicle.dailyRate,
      weekly_rate: vehicle.weeklyRate,
      monthly_rate: vehicle.monthlyRate,
      deposit: vehicle.deposit,
      status: vehicle.status,
      current_location: vehicle.currentLocation,
      mileage: vehicle.mileage,
      insurance_expiry: vehicle.insuranceExpiry,
      tech_control_date: vehicle.techControlDate,
      insurance_info: vehicle.insuranceInfo,
      main_image: vehicle.mainImage,
      secondary_images: vehicle.secondaryImages
    }])
    .select()
    .single();
  if (error) throw error;
  return formatVehicle(data);
};

export const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
  const updateData: any = {};
  
  if (updates.brand) updateData.brand = updates.brand;
  if (updates.model) updateData.model = updates.model;
  if (updates.year) updateData.year = updates.year;
  if (updates.immatriculation) updateData.immatriculation = updates.immatriculation;
  if (updates.color) updateData.color = updates.color;
  if (updates.chassisNumber) updateData.chassis_number = updates.chassisNumber;
  if (updates.fuelType) updateData.fuel_type = updates.fuelType;
  if (updates.transmission) updateData.transmission = updates.transmission;
  if (updates.seats) updateData.seats = updates.seats;
  if (updates.doors) updateData.doors = updates.doors;
  if (updates.dailyRate) updateData.daily_rate = updates.dailyRate;
  if (updates.weeklyRate) updateData.weekly_rate = updates.weeklyRate;
  if (updates.monthlyRate) updateData.monthly_rate = updates.monthlyRate;
  if (updates.deposit) updateData.deposit = updates.deposit;
  if (updates.status) updateData.status = updates.status;
  if (updates.currentLocation) updateData.current_location = updates.currentLocation;
  if (updates.mileage) updateData.mileage = updates.mileage;
  if (updates.insuranceExpiry) updateData.insurance_expiry = updates.insuranceExpiry;
  if (updates.techControlDate) updateData.tech_control_date = updates.techControlDate;
  if (updates.insuranceInfo) updateData.insurance_info = updates.insuranceInfo;
  if (updates.mainImage) updateData.main_image = updates.mainImage;
  if (updates.secondaryImages) updateData.secondary_images = updates.secondaryImages;

  const { data, error } = await supabase
    .from('vehicles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return formatVehicle(data);
};

export const deleteVehicle = async (id: string): Promise<void> => {
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw error;
};

// =====================================================
// CUSTOMERS OPERATIONS
// =====================================================

export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatCustomer) : [];
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .insert([{
      first_name: customer.firstName,
      last_name: customer.lastName,
      phone: customer.phone,
      email: customer.email,
      id_card_number: customer.idCardNumber,
      wilaya: customer.wilaya,
      address: customer.address,
      license_number: customer.licenseNumber,
      license_expiry: customer.licenseExpiry,
      profile_picture: customer.profilePicture,
      document_images: customer.documentImages,
      total_reservations: customer.totalReservations,
      total_spent: customer.totalSpent
    }])
    .select()
    .single();
  if (error) throw error;
  return formatCustomer(data);
};

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  const updateData: any = {};
  
  if (updates.firstName) updateData.first_name = updates.firstName;
  if (updates.lastName) updateData.last_name = updates.lastName;
  if (updates.phone) updateData.phone = updates.phone;
  if (updates.email) updateData.email = updates.email;
  if (updates.idCardNumber) updateData.id_card_number = updates.idCardNumber;
  if (updates.wilaya) updateData.wilaya = updates.wilaya;
  if (updates.address) updateData.address = updates.address;
  if (updates.licenseNumber) updateData.license_number = updates.licenseNumber;
  if (updates.licenseExpiry) updateData.license_expiry = updates.licenseExpiry;
  if (updates.profilePicture) updateData.profile_picture = updates.profilePicture;
  if (updates.documentImages) updateData.document_images = updates.documentImages;
  if (updates.totalReservations !== undefined) updateData.total_reservations = updates.totalReservations;
  if (updates.totalSpent !== undefined) updateData.total_spent = updates.totalSpent;

  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return formatCustomer(data);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
};

// =====================================================
// AGENCIES OPERATIONS
// =====================================================

export const getAgencies = async (): Promise<Agency[]> => {
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatAgency) : [];
};

export const createAgency = async (agency: Omit<Agency, 'id'>): Promise<Agency> => {
  const { data, error } = await supabase
    .from('agencies')
    .insert([{
      name: agency.name,
      address: agency.address,
      phone: agency.phone
    }])
    .select()
    .single();
  if (error) throw error;
  return formatAgency(data);
};

export const updateAgency = async (id: string, updates: Partial<Agency>): Promise<Agency> => {
  const updateData: any = {};
  
  if (updates.name) updateData.name = updates.name;
  if (updates.address) updateData.address = updates.address;
  if (updates.phone) updateData.phone = updates.phone;

  const { data, error } = await supabase
    .from('agencies')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return formatAgency(data);
};

export const deleteAgency = async (id: string): Promise<void> => {
  const { error } = await supabase.from('agencies').delete().eq('id', id);
  if (error) throw error;
};

// =====================================================
// WORKERS OPERATIONS
// =====================================================

export const getWorkers = async (): Promise<Worker[]> => {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  
  // Fetch transactions for each worker
  const workers = data || [];
  const workersWithTransactions = await Promise.all(
    workers.map(async (worker) => {
      const transactions = await getWorkerTransactions(worker.id);
      return formatWorker(worker, transactions);
    })
  );
  
  return workersWithTransactions;
};

export const createWorker = async (worker: Omit<Worker, 'id' | 'history'>): Promise<Worker> => {
  const { data, error } = await supabase
    .from('workers')
    .insert([{
      full_name: worker.fullName,
      birthday: worker.birthday,
      phone: worker.phone,
      email: worker.email,
      address: worker.address,
      id_card_number: worker.idCardNumber,
      photo: worker.photo,
      role: worker.role,
      username: worker.username,
      password: worker.password,
      payment_type: worker.paymentType,
      amount: worker.amount,
      absences: worker.absences,
      total_paid: worker.totalPaid
    }])
    .select()
    .single();
  if (error) throw error;
  return formatWorker(data, []);
};

export const updateWorker = async (id: string, updates: Partial<Worker>): Promise<Worker> => {
  const updateData: any = {};
  
  if (updates.fullName) updateData.full_name = updates.fullName;
  if (updates.birthday) updateData.birthday = updates.birthday;
  if (updates.phone) updateData.phone = updates.phone;
  if (updates.email) updateData.email = updates.email;
  if (updates.address) updateData.address = updates.address;
  if (updates.idCardNumber) updateData.id_card_number = updates.idCardNumber;
  if (updates.photo) updateData.photo = updates.photo;
  if (updates.role) updateData.role = updates.role;
  if (updates.username) updateData.username = updates.username;
  if (updates.password) updateData.password = updates.password;
  if (updates.paymentType) updateData.payment_type = updates.paymentType;
  if (updates.amount !== undefined) updateData.amount = updates.amount;
  if (updates.absences !== undefined) updateData.absences = updates.absences;
  if (updates.totalPaid !== undefined) updateData.total_paid = updates.totalPaid;

  const { data, error } = await supabase
    .from('workers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  
  const transactions = await getWorkerTransactions(id);
  return formatWorker(data, transactions);
};

export const deleteWorker = async (id: string): Promise<void> => {
  const { error } = await supabase.from('workers').delete().eq('id', id);
  if (error) throw error;
};

// =====================================================
// WORKER TRANSACTIONS
// =====================================================

export const getWorkerTransactions = async (workerId: string): Promise<WorkerTransaction[]> => {
  const { data, error } = await supabase
    .from('worker_transactions')
    .select('*')
    .eq('worker_id', workerId)
    .order('transaction_date', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatWorkerTransaction) : [];
};

export const createWorkerTransaction = async (transaction: Omit<WorkerTransaction, 'id'> & { workerId: string }): Promise<WorkerTransaction> => {
  const { data, error } = await supabase
    .from('worker_transactions')
    .insert([{
      worker_id: transaction.workerId,
      transaction_type: transaction.type,
      amount: transaction.amount,
      transaction_date: transaction.date,
      note: transaction.note
    }])
    .select()
    .single();
  if (error) throw error;
  return formatWorkerTransaction(data);
};

// =====================================================
// EXPENSES OPERATIONS
// =====================================================

export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatExpense) : [];
};

export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([{
      name: expense.name,
      cost: expense.cost,
      expense_date: expense.date
    }])
    .select()
    .single();
  if (error) throw error;
  return formatExpense(data);
};

export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense> => {
  const updateData: any = {};
  
  if (updates.name) updateData.name = updates.name;
  if (updates.cost) updateData.cost = updates.cost;
  if (updates.date) updateData.expense_date = updates.date;

  const { data, error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return formatExpense(data);
};

export const deleteExpense = async (id: string): Promise<void> => {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
};

// =====================================================
// RESERVATIONS OPERATIONS
// =====================================================

export const getReservations = async (): Promise<Reservation[]> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatReservation) : [];
};

export const createReservation = async (reservation: Omit<Reservation, 'id'>): Promise<Reservation> => {
  const { data, error } = await supabase
    .from('reservations')
    .insert([{
      reservation_number: reservation.reservationNumber,
      customer_id: reservation.customerId,
      vehicle_id: reservation.vehicleId,
      pickup_agency_id: reservation.pickupAgencyId,
      return_agency_id: reservation.returnAgencyId,
      driver_id: reservation.driverId,
      start_date: reservation.startDate,
      end_date: reservation.endDate,
      status: reservation.status,
      total_amount: reservation.totalAmount,
      paid_amount: reservation.paidAmount,
      caution_amount: reservation.cautionAmount,
      discount: reservation.discount,
      with_tva: reservation.withTVA
    }])
    .select()
    .single();
  if (error) throw error;
  return formatReservation(data);
};

export const updateReservation = async (id: string, updates: Partial<Reservation>): Promise<Reservation> => {
  const updateData: any = {};
  
  if (updates.status) updateData.status = updates.status;
  if (updates.paidAmount !== undefined) updateData.paid_amount = updates.paidAmount;
  if (updates.discount !== undefined) updateData.discount = updates.discount;

  const { data, error } = await supabase
    .from('reservations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return formatReservation(data);
};

// =====================================================
// INSPECTIONS OPERATIONS
// =====================================================

export const getInspections = async (): Promise<Inspection[]> => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatInspection) : [];
};

export const createInspection = async (inspection: Omit<Inspection, 'id'>): Promise<Inspection> => {
  const { data, error } = await supabase
    .from('inspections')
    .insert([{
      reservation_id: inspection.reservationId,
      inspection_type: inspection.type,
      inspection_date: inspection.date,
      mileage: inspection.mileage,
      fuel: inspection.fuel,
      security_lights: inspection.security.lights,
      security_tires: inspection.security.tires,
      security_brakes: inspection.security.brakes,
      security_wipers: inspection.security.wipers,
      security_mirrors: inspection.security.mirrors,
      security_belts: inspection.security.belts,
      security_horn: inspection.security.horn,
      equipment_spare_wheel: inspection.equipment.spareWheel,
      equipment_jack: inspection.equipment.jack,
      equipment_triangles: inspection.equipment.triangles,
      equipment_first_aid: inspection.equipment.firstAid,
      equipment_docs: inspection.equipment.docs,
      comfort_ac: inspection.comfort.ac,
      cleanliness_interior: inspection.cleanliness.interior,
      cleanliness_exterior: inspection.cleanliness.exterior,
      notes: inspection.notes,
      exterior_photos: inspection.exteriorPhotos,
      interior_photos: inspection.interiorPhotos,
      signature: inspection.signature
    }])
    .select()
    .single();
  if (error) throw error;
  return formatInspection(data);
};

// =====================================================
// DAMAGES OPERATIONS
// =====================================================

export const getDamages = async (): Promise<Damage[]> => {
  const { data, error } = await supabase
    .from('damages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatDamage) : [];
};

export const createDamage = async (damage: Omit<Damage, 'id'>): Promise<Damage> => {
  const { data, error } = await supabase
    .from('damages')
    .insert([{
      name: damage.name,
      description: damage.description,
      vehicle_id: damage.vehicleId,
      reservation_id: damage.reservationId,
      customer_id: damage.customerId,
      damage_date: damage.date,
      severity: damage.severity,
      position: damage.position,
      costs: damage.costs,
      status: damage.status,
      repair_date: damage.repairDate,
      photos: damage.photos
    }])
    .select()
    .single();
  if (error) throw error;
  return formatDamage(data);
};

export const updateDamage = async (id: string, updates: Partial<Damage>): Promise<Damage> => {
  const updateData: any = {};
  
  if (updates.status) updateData.status = updates.status;
  if (updates.repairDate) updateData.repair_date = updates.repairDate;
  if (updates.costs) updateData.costs = updates.costs;

  const { data, error } = await supabase
    .from('damages')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return formatDamage(data);
};

// =====================================================
// MAINTENANCES OPERATIONS
// =====================================================

export const getMaintenances = async (): Promise<Maintenance[]> => {
  const { data, error } = await supabase
    .from('maintenances')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ? data.map(formatMaintenance) : [];
};

export const createMaintenance = async (maintenance: Omit<Maintenance, 'id'>): Promise<Maintenance> => {
  const { data, error } = await supabase
    .from('maintenances')
    .insert([{
      vehicle_id: maintenance.vehicleId,
      type: maintenance.type,
      maintenance_date: maintenance.date,
      cost: maintenance.cost,
      description: maintenance.description,
      status: maintenance.status,
      notes: maintenance.notes
    }])
    .select()
    .single();
  if (error) throw error;
  return formatMaintenance(data);
};

export const updateMaintenance = async (id: string, updates: Partial<Maintenance>): Promise<Maintenance> => {
  const updateData: any = {};
  
  if (updates.status) updateData.status = updates.status;
  if (updates.cost) updateData.cost = updates.cost;
  if (updates.notes) updateData.notes = updates.notes;

  const { data, error } = await supabase
    .from('maintenances')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return formatMaintenance(data);
};

export const deleteMaintenance = async (id: string): Promise<void> => {
  const { error } = await supabase.from('maintenances').delete().eq('id', id);
  if (error) throw error;
};

// =====================================================
// FORMATTER FUNCTIONS (Convert snake_case to camelCase)
// =====================================================

function formatVehicle(data: any): Vehicle {
  return {
    id: data.id,
    brand: data.brand,
    model: data.model,
    year: data.year,
    immatriculation: data.immatriculation,
    color: data.color,
    chassisNumber: data.chassis_number,
    fuelType: data.fuel_type,
    transmission: data.transmission,
    seats: data.seats,
    doors: data.doors,
    dailyRate: data.daily_rate,
    weeklyRate: data.weekly_rate,
    monthlyRate: data.monthly_rate,
    deposit: data.deposit,
    status: data.status,
    currentLocation: data.current_location,
    mileage: data.mileage,
    insuranceExpiry: data.insurance_expiry,
    techControlDate: data.tech_control_date,
    insuranceInfo: data.insurance_info,
    mainImage: data.main_image,
    secondaryImages: data.secondary_images || []
  };
}

function formatCustomer(data: any): Customer {
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    phone: data.phone,
    email: data.email,
    idCardNumber: data.id_card_number,
    wilaya: data.wilaya,
    address: data.address,
    licenseNumber: data.license_number,
    licenseExpiry: data.license_expiry,
    profilePicture: data.profile_picture,
    documentImages: data.document_images || [],
    totalReservations: data.total_reservations,
    totalSpent: data.total_spent
  };
}

function formatAgency(data: any): Agency {
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    phone: data.phone
  };
}

function formatWorker(data: any, transactions: WorkerTransaction[]): Worker {
  return {
    id: data.id,
    fullName: data.full_name,
    birthday: data.birthday,
    phone: data.phone,
    email: data.email,
    address: data.address,
    idCardNumber: data.id_card_number,
    photo: data.photo,
    role: data.role,
    paymentType: data.payment_type,
    amount: data.amount,
    username: data.username,
    password: data.password,
    absences: data.absences,
    totalPaid: data.total_paid,
    history: transactions
  };
}

function formatWorkerTransaction(data: any): WorkerTransaction {
  return {
    id: data.id,
    type: data.transaction_type,
    amount: data.amount,
    date: data.transaction_date,
    note: data.note
  };
}

function formatExpense(data: any): Expense {
  return {
    id: data.id,
    name: data.name,
    cost: data.cost,
    date: data.expense_date
  };
}

function formatReservation(data: any): Reservation {
  return {
    id: data.id,
    reservationNumber: data.reservation_number,
    customerId: data.customer_id,
    vehicleId: data.vehicle_id,
    startDate: data.start_date,
    endDate: data.end_date,
    pickupAgencyId: data.pickup_agency_id,
    returnAgencyId: data.return_agency_id,
    driverId: data.driver_id,
    status: data.status,
    totalAmount: data.total_amount,
    paidAmount: data.paid_amount,
    cautionAmount: data.caution_amount,
    discount: data.discount,
    withTVA: data.with_tva,
    options: []
  };
}

function formatInspection(data: any): Inspection {
  return {
    id: data.id,
    reservationId: data.reservation_id,
    type: data.inspection_type,
    date: data.inspection_date,
    mileage: data.mileage,
    fuel: data.fuel,
    security: {
      lights: data.security_lights,
      tires: data.security_tires,
      brakes: data.security_brakes,
      wipers: data.security_wipers,
      mirrors: data.security_mirrors,
      belts: data.security_belts,
      horn: data.security_horn
    },
    equipment: {
      spareWheel: data.equipment_spare_wheel,
      jack: data.equipment_jack,
      triangles: data.equipment_triangles,
      firstAid: data.equipment_first_aid,
      docs: data.equipment_docs
    },
    comfort: {
      ac: data.comfort_ac
    },
    cleanliness: {
      interior: data.cleanliness_interior,
      exterior: data.cleanliness_exterior
    },
    notes: data.notes,
    exteriorPhotos: data.exterior_photos || [],
    interiorPhotos: data.interior_photos || [],
    signature: data.signature
  };
}

function formatDamage(data: any): Damage {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    vehicleId: data.vehicle_id,
    reservationId: data.reservation_id,
    customerId: data.customer_id,
    date: data.damage_date,
    severity: data.severity,
    position: data.position,
    costs: data.costs,
    status: data.status,
    repairDate: data.repair_date,
    photos: data.photos || []
  };
}

function formatMaintenance(data: any): Maintenance {
  return {
    id: data.id,
    vehicleId: data.vehicle_id,
    type: data.type,
    date: data.maintenance_date,
    cost: data.cost,
    description: data.description,
    status: data.status,
    notes: data.notes
  };
}
