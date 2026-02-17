
import React, { useState, useMemo } from 'react';
import { Language, Reservation, ReservationStatus, Customer, Vehicle, RentalOption, Worker, LocationLog } from '../types';
// Fixed: Added ALGERIAN_WILAYAS to imports from constants
import { MOCK_RESERVATIONS, MOCK_VEHICLES, MOCK_AGENCIES, MOCK_WORKERS, ALGERIAN_WILAYAS } from '../constants';
import GradientButton from '../components/GradientButton';

interface PlannerPageProps { 
  lang: Language; 
  customers: Customer[];
  onAddCustomer: (c: Customer) => void;
}

type ActionModal = 'details' | 'pay' | 'activate' | 'terminate' | 'delete' | 'add-option' | 'template-select' | 'print-view' | null;

// Template definition reused for generation
interface InvoiceElement {
  id: string; type: string; label: string; content: string; x: number; y: number; width: number; height: number; fontSize: number;
  color: string; backgroundColor: string; fontFamily: string; fontWeight: string; textAlign: 'left' | 'center' | 'right';
  borderRadius: number; padding: number; borderWidth: number; borderColor: string; lineHeight: number; opacity: number;
  letterSpacing: number; zIndex: number;
}

interface InvoiceTemplate {
  id: string; name: string; category: 'invoice' | 'devis' | 'contract'; elements: InvoiceElement[]; canvasWidth: number; canvasHeight: number;
}

const ModalBase: React.FC<{ title: string, children?: React.ReactNode, onClose: () => void, maxWidth?: string }> = ({ title, children, onClose, maxWidth = "max-w-4xl" }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
    <div className={`bg-white w-full ${maxWidth} rounded-[3.5rem] shadow-2xl animate-scale-in p-10 overflow-y-auto max-h-[95vh] border border-white/20`}>
      <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-6">
        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{title}</h2>
        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-xl">✕</button>
      </div>
      {children}
    </div>
  </div>
);

const PlannerPage: React.FC<PlannerPageProps> = ({ lang, customers, onAddCustomer }) => {
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | 'all'>('all');
  
  // Modal & Edit State
  const [activeModal, setActiveModal] = useState<ActionModal>(null);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);
  const [tempOptionCat, setTempOptionCat] = useState<RentalOption['category'] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);
  const [newClientData, setNewClientData] = useState<Partial<Customer>>({
    wilaya: '16 - Alger',
    documentImages: [],
    profilePicture: ''
  });

  const [formData, setFormData] = useState<Partial<Reservation> & {
    startTime: string; endTime: string; differentReturn: boolean;
    tempOptions: RentalOption[]; isWithDriver: boolean; paid: number;
    discount: number; withTva: boolean;
  }>({
    startTime: '10:00', endTime: '10:00', differentReturn: false, tempOptions: [],
    isWithDriver: false, paid: 0, discount: 0, withTva: false, status: 'confermer',
    cautionAmount: 0
  });

  // Activation & Termination States
  const [logData, setLogData] = useState<Partial<LocationLog>>({ fuel: 'plein', location: '' });
  const [termData, setTermData] = useState({
    mileage: 0, fuel: 'plein' as LocationLog['fuel'], date: new Date().toISOString().slice(0, 16),
    location: '', notes: '', extraKmCost: 0, extraFuelCost: 0, withTva: false
  });
  
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const isRtl = lang === 'ar';
  // Fixed: Added missing translation keys (steps, diffReturn, etc.) used in component JSX
  const t = {
    fr: {
      title: 'Planificateur',
      newRes: 'Nouvelle Réservation',
      steps: ['Dates & Agences', 'Véhicule', 'Client', 'Services', 'Paiement'],
      labels: {
        activate: 'Activer Location', pay: 'Régler Dette',
        printDevis: 'Imprimer Devis', printContrat: 'Imprimer Contrat',
        confirmPay: 'Confirmer le versement', deleteConfirm: 'Voulez-vous supprimer ce dossier ?',
        selectTemplate: 'Choisir un modèle de design',
        diffReturn: 'Agence de retour différente',
        searchClient: 'Rechercher un client...',
        newClient: 'Créer un nouveau client',
        withDriver: 'Avec Chauffeur',
        caution: 'Montant de la Caution',
        tva: 'Appliquer TVA (19%)',
        discount: 'Remise Exceptionnelle',
        paid: 'Acompte versé',
        confirm: 'Confirmer la Réservation'
      },
      status: { all: 'Tous', confermer: 'Confirmé', 'en cours': 'En Cours', terminer: 'Terminé', annuler: 'Annulé', 'en attente': 'En Attente' }
    },
    ar: {
      title: 'المخطط',
      newRes: 'حجز جديد',
      steps: ['التواريخ والوكالات', 'المركبة', 'الزبون', 'الخدمات', 'الدفع'],
      labels: {
        activate: 'تفعيل الإيجار', pay: 'تسوية الدين',
        printDevis: 'طباعة عرض سعر', printContrat: 'طباعة العقد',
        confirmPay: 'تأكيد الدفع', deleteConfirm: 'هل تريد حذف هذا الملف؟',
        selectTemplate: 'اختر نموذج التصميم',
        diffReturn: 'وكالة عودة مختلفة',
        searchClient: 'بحث عن زبون...',
        newClient: 'إنشاء زبون جديد',
        withDriver: 'مع سائق',
        caution: 'مبلغ الضمان',
        tva: 'تطبيق الضريبة (19%)',
        discount: 'خصم استثنائي',
        paid: 'المبلغ المدفوع',
        confirm: 'تأكيد الحجز'
      },
      status: { all: 'الكل', confermer: 'مؤكد', 'en cours': 'قيد التنفيذ', terminer: 'منتهي', annuler: 'ملغي', 'en attente': 'في الانتظار' }
    }
  }[lang];

  // Mock Templates from Personalization Studio
  const AVAILABLE_TEMPLATES: InvoiceTemplate[] = [
    {
      id: 'tpl-inv-1',
      name: 'Facture Pro Blue',
      category: 'invoice',
      canvasWidth: 595,
      canvasHeight: 842,
      elements: [
        { id: '1', type: 'static', label: 'Titre', content: 'FACTURE', x: 350, y: 40, width: 200, height: 40, fontSize: 32, fontWeight: '900', textAlign: 'right', color: '#1e293b', backgroundColor: 'transparent', fontFamily: 'Inter', borderRadius: 0, padding: 5, borderWidth: 0, borderColor: '', lineHeight: 1.2, opacity: 1, letterSpacing: -1, zIndex: 10 },
        { id: '2', type: 'variable', label: 'Client', content: 'Client: {{client_name}}\nTél: {{client_phone}}', x: 40, y: 160, width: 300, height: 60, fontSize: 12, fontWeight: '700', textAlign: 'left', color: '#1e293b', backgroundColor: '#f8fafc', fontFamily: 'Inter', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#e2e8f0', lineHeight: 1.5, opacity: 1, letterSpacing: 0, zIndex: 10 },
        { id: '3', type: 'variable', label: 'Total', content: 'TOTAL TTC: {{total_amount}} DZ', x: 300, y: 700, width: 250, height: 60, fontSize: 18, fontWeight: '900', textAlign: 'right', color: '#2563eb', backgroundColor: '#eff6ff', fontFamily: 'Inter', borderRadius: 20, padding: 15, borderWidth: 2, borderColor: '#dbeafe', lineHeight: 1.2, opacity: 1, letterSpacing: 0, zIndex: 10 },
      ]
    },
    {
      id: 'tpl-cont-1',
      name: 'Contrat Premium Gold',
      category: 'contract',
      canvasWidth: 595,
      canvasHeight: 842,
      elements: [
        { id: 'c1', type: 'static', label: 'Titre', content: 'CONTRAT DE LOCATION', x: 40, y: 40, width: 515, height: 50, fontSize: 24, fontWeight: '900', textAlign: 'center', color: '#1e293b', backgroundColor: '#f8fafc', fontFamily: 'Inter', borderRadius: 15, padding: 10, borderWidth: 0, borderColor: '', lineHeight: 1.2, opacity: 1, letterSpacing: 1, zIndex: 10 },
        { id: 'c2', type: 'variable', label: 'Data', content: 'Dossier N°: {{res_number}}\nDate: {{current_date}}\nVéhicule: {{vehicle_name}}\nImmatriculation: {{vehicle_plate}}', x: 40, y: 110, width: 515, height: 100, fontSize: 10, fontWeight: '500', textAlign: 'left', color: '#64748b', backgroundColor: 'transparent', fontFamily: 'Inter', borderRadius: 0, padding: 0, borderWidth: 0, borderColor: '', lineHeight: 1.8, opacity: 1, letterSpacing: 0, zIndex: 10 },
      ]
    }
  ];

  // Helpers
  const getVehicle = (id: string) => MOCK_VEHICLES.find(v => v.id === id);
  const getCustomer = (id: string) => customers.find(c => c.id === id);
  
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 1;
    const s = new Date(start); const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    const d = Math.ceil(diff / (1000 * 3600 * 24));
    return d > 0 ? d : 1;
  };

  const invoice = useMemo(() => {
    const v = getVehicle(formData.vehicleId || '');
    const days = calculateDays(formData.startDate || '', formData.endDate || '');
    const baseTotal = (v?.dailyRate || 0) * days;
    const optionsTotal = formData.tempOptions.reduce((acc, o) => acc + o.price, 0);
    const subtotal = baseTotal + optionsTotal - formData.discount;
    const finalTotal = formData.withTva ? subtotal * 1.19 : subtotal;
    const rest = finalTotal - formData.paid;
    return { days, baseTotal, optionsTotal, subtotal, finalTotal, rest };
  }, [formData]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const c = getCustomer(res.customerId);
      const q = searchQuery.toLowerCase();
      const matchSearch = res.reservationNumber.toLowerCase().includes(q) || 
                          `${c?.firstName} ${c?.lastName}`.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || res.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [reservations, searchQuery, filterStatus, customers]);

  const handleSaveRes = () => {
    const resData: Reservation = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      reservationNumber: editingId ? (reservations.find(r => r.id === editingId)?.reservationNumber || '') : `RES-${Date.now().toString().slice(-4)}`,
      customerId: formData.customerId!,
      vehicleId: formData.vehicleId!,
      startDate: `${formData.startDate}T${formData.startTime}`,
      endDate: `${formData.endDate}T${formData.endTime}`,
      pickupAgencyId: formData.pickupAgencyId!,
      returnAgencyId: formData.differentReturn ? formData.returnAgencyId! : formData.pickupAgencyId!,
      driverId: formData.isWithDriver ? formData.driverId : undefined,
      status: formData.status as ReservationStatus,
      totalAmount: invoice.finalTotal,
      paidAmount: formData.paid,
      cautionAmount: formData.cautionAmount || 0,
      discount: formData.discount,
      withTVA: formData.withTva,
      options: formData.tempOptions,
      activationLog: reservations.find(r => r.id === editingId)?.activationLog
    };

    if (editingId) {
      setReservations(reservations.map(r => r.id === editingId ? resData : r));
    } else {
      setReservations([resData, ...reservations]);
    }
    resetForm();
  };

  const resetForm = () => {
    setIsCreating(false); setStep(1); setEditingId(null);
    setFormData({
      startTime: '10:00', endTime: '10:00', differentReturn: false, tempOptions: [],
      isWithDriver: false, paid: 0, discount: 0, withTva: false, status: 'confermer',
      cautionAmount: 0
    });
  };

  const handleEdit = (res: Reservation) => {
    setEditingId(res.id);
    setFormData({
      ...res,
      startDate: res.startDate.split('T')[0],
      startTime: res.startDate.split('T')[1],
      endDate: res.endDate.split('T')[0],
      endTime: res.endDate.split('T')[1],
      differentReturn: res.pickupAgencyId !== res.returnAgencyId,
      tempOptions: res.options,
      isWithDriver: !!res.driverId,
      paid: res.paidAmount,
      withTva: res.withTVA
    });
    setIsCreating(true);
  };

  const handleActivate = () => {
    if (!selectedRes) return;
    const log: LocationLog = {
      mileage: logData.mileage || 0,
      fuel: logData.fuel as any,
      location: logData.location || '',
      date: new Date().toISOString(),
      notes: logData.notes
    };
    setReservations(prev => prev.map(r => r.id === selectedRes.id ? { ...r, status: 'en cours', activationLog: log } : r));
    setActiveModal(null);
  };

  const handleTerminate = () => {
    if (!selectedRes) return;
    const extraTotal = termData.extraKmCost + termData.extraFuelCost;
    const finalInvoiceTotal = selectedRes.totalAmount + (termData.withTva ? extraTotal * 1.19 : extraTotal);
    
    setReservations(prev => prev.map(r => r.id === selectedRes.id ? { 
      ...r, 
      status: 'terminer', 
      totalAmount: finalInvoiceTotal,
      terminationLog: {
        mileage: termData.mileage,
        fuel: termData.fuel,
        location: termData.location,
        date: termData.date,
        notes: termData.notes
      }
    } : r));
    setActiveModal(null);
  };

  const handleProcessPayment = () => {
    if (!selectedRes || paymentAmount <= 0) return;
    setReservations(prev => prev.map(r => 
      r.id === selectedRes.id ? { ...r, paidAmount: r.paidAmount + paymentAmount } : r
    ));
    setPaymentAmount(0);
    setActiveModal(null);
  };

  const handleDelete = () => {
    if (!selectedRes) return;
    setReservations(prev => prev.filter(r => r.id !== selectedRes.id));
    setActiveModal(null);
  };

  const replaceVariables = (content: string, res: Reservation) => {
    const client = getCustomer(res.customerId);
    const vehicle = getVehicle(res.vehicleId);
    return content
      .replace('{{client_name}}', `${client?.firstName} ${client?.lastName}`)
      .replace('{{client_phone}}', client?.phone || '')
      .replace('{{res_number}}', res.reservationNumber)
      .replace('{{total_amount}}', res.totalAmount.toLocaleString())
      .replace('{{vehicle_name}}', `${vehicle?.brand} ${vehicle?.model}`)
      .replace('{{vehicle_plate}}', vehicle?.immatriculation || '')
      .replace('{{current_date}}', new Date().toLocaleDateString());
  };

  return (
    <div className={`p-4 md:p-12 animate-fade-in ${isRtl ? 'font-arabic text-right' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-16">
        <h1 className="text-6xl font-black text-gray-900 tracking-tighter">{t.title}</h1>
        {!isCreating && <GradientButton onClick={() => setIsCreating(true)} className="!py-6 !px-12 text-2xl shadow-2xl">+ {t.newRes}</GradientButton>}
        {isCreating && <button onClick={resetForm} className="px-10 py-5 bg-gray-100 rounded-3xl font-black text-gray-400 hover:text-red-500 uppercase text-xs tracking-widest transition-all">Annuler</button>}
      </div>

      {isCreating ? (
        <div className="max-w-6xl mx-auto">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-12 max-w-4xl mx-auto">
            {t.steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black transition-all ${step >= i + 1 ? 'bg-blue-600 text-white shadow-xl scale-110' : 'bg-gray-100 text-gray-300'}`}>{step > i + 1 ? '✓' : i + 1}</div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${step >= i + 1 ? 'text-blue-600' : 'text-gray-300'}`}>{s}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 p-10 md:p-16 min-h-[600px] flex flex-col relative overflow-hidden">
             {step === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
                   <div className="p-10 bg-blue-50/50 rounded-[3.5rem] border border-blue-100 space-y-8 shadow-inner">
                      <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-4">🛫 DÉPART</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <input type="date" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} className="px-6 py-4 rounded-2xl font-bold bg-white shadow-sm outline-none" />
                        <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="px-6 py-4 rounded-2xl font-bold bg-white shadow-sm outline-none" />
                      </div>
                      <select value={formData.pickupAgencyId || ''} onChange={e => setFormData({...formData, pickupAgencyId: e.target.value})} className="w-full px-6 py-4 rounded-2xl font-bold bg-white shadow-sm outline-none appearance-none cursor-pointer">
                        <option value="">Sélectionner une agence</option>
                        {MOCK_AGENCIES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                   </div>
                   <div className="p-10 bg-indigo-50/50 rounded-[3.5rem] border border-indigo-100 space-y-8 shadow-inner">
                      <div className="flex justify-between items-center">
                         <h3 className="text-sm font-black text-indigo-600 uppercase tracking-[0.3em]">🛬 RETOUR</h3>
                         <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={formData.differentReturn} onChange={e => setFormData({...formData, differentReturn: e.target.checked})} className="w-6 h-6 rounded-lg text-indigo-600" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.labels.diffReturn}</span>
                         </label>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <input type="date" value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} className="px-6 py-4 rounded-2xl font-bold bg-white shadow-sm outline-none" />
                        <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="px-6 py-4 rounded-2xl font-bold bg-white shadow-sm outline-none" />
                      </div>
                      {formData.differentReturn && (
                        <select value={formData.returnAgencyId || ''} onChange={e => setFormData({...formData, returnAgencyId: e.target.value})} className="w-full px-6 py-4 rounded-2xl font-bold bg-white shadow-sm outline-none appearance-none cursor-pointer">
                          <option value="">Sélectionner une agence de retour</option>
                          {MOCK_AGENCIES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      )}
                   </div>
                </div>
             )}

             {step === 2 && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {MOCK_VEHICLES.map(v => (
                    <button key={v.id} onClick={() => setFormData({...formData, vehicleId: v.id})} className={`group p-8 rounded-[3.5rem] border-4 transition-all text-left relative overflow-hidden ${formData.vehicleId === v.id ? 'border-blue-600 bg-blue-50 shadow-2xl scale-105' : 'border-gray-50 bg-gray-50/50 hover:border-blue-200'}`}>
                       <div className="relative h-40 rounded-[2rem] overflow-hidden mb-6 shadow-xl">
                          <img src={v.mainImage} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                       </div>
                       <h4 className="text-xl font-black text-gray-900 truncate uppercase">{v.brand} {v.model}</h4>
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">{v.immatriculation} • {v.fuelType}</p>
                       <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Tarif/J</p>
                          <p className="text-2xl font-black text-gray-900">{v.dailyRate} <span className="text-xs opacity-40">DZ</span></p>
                       </div>
                    </button>
                  ))}
               </div>
             )}

             {step === 3 && (
                <div className="animate-fade-in space-y-10">
                   {!isCreatingNewClient ? (
                     <>
                        <div className="relative group max-w-2xl mx-auto">
                           <span className="absolute inset-y-0 left-8 flex items-center text-3xl opacity-20">🔍</span>
                           <input type="text" placeholder={t.labels.searchClient} className="w-full pl-24 pr-8 py-7 bg-gray-50 border-4 border-transparent focus:bg-white focus:border-blue-600 rounded-[3rem] outline-none font-black text-2xl transition-all shadow-inner" onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)).slice(0, 4).map(c => (
                             <button key={c.id} onClick={() => setFormData({...formData, customerId: c.id})} className={`flex items-center gap-7 p-8 rounded-[3.5rem] border-2 transition-all ${formData.customerId === c.id ? 'bg-blue-600 border-blue-600 text-white shadow-2xl scale-[1.02]' : 'bg-gray-50 border-transparent hover:border-blue-400'}`}>
                                <img src={c.profilePicture} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl" />
                                <div className="text-left overflow-hidden">
                                   <p className={`text-xl font-black truncate ${formData.customerId === c.id ? 'text-white' : 'text-gray-900'}`}>{c.firstName} {c.lastName}</p>
                                   <p className={`text-xs font-bold ${formData.customerId === c.id ? 'text-blue-100' : 'text-gray-400'}`}>📞 {c.phone} • 🆔 {c.idCardNumber}</p>
                                </div>
                             </button>
                           ))}
                           <button onClick={() => setIsCreatingNewClient(true)} className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-[3.5rem] border-4 border-dashed border-gray-200 hover:border-blue-400 hover:bg-white transition-all group">
                              <span className="text-5xl mb-4">👤+</span>
                              <span className="font-black text-gray-400 uppercase tracking-widest group-hover:text-blue-600">{t.labels.newClient}</span>
                           </button>
                        </div>
                     </>
                   ) : (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-gray-50/50 p-12 rounded-[4rem] border border-gray-100 animate-scale-in">
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <input type="text" placeholder="Prénom" onChange={e => setNewClientData({...newClientData, firstName: e.target.value})} className="px-6 py-4 rounded-2xl bg-white shadow-sm outline-none font-bold" />
                              <input type="text" placeholder="Nom" onChange={e => setNewClientData({...newClientData, lastName: e.target.value})} className="px-6 py-4 rounded-2xl bg-white shadow-sm outline-none font-bold" />
                           </div>
                           <input type="tel" placeholder="Téléphone" onChange={e => setNewClientData({...newClientData, phone: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white shadow-sm outline-none font-bold" />
                           <select value={newClientData.wilaya} onChange={e => setNewClientData({...newClientData, wilaya: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white shadow-sm outline-none font-bold appearance-none cursor-pointer">
                              {ALGERIAN_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                           </select>
                           <textarea placeholder="Adresse complète" onChange={e => setNewClientData({...newClientData, address: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white shadow-sm outline-none font-bold h-24 resize-none" />
                        </div>
                        <div className="space-y-6">
                           <input type="text" placeholder="N° CNI" onChange={e => setNewClientData({...newClientData, idCardNumber: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-white shadow-sm outline-none font-bold" />
                           <div className="grid grid-cols-2 gap-4">
                              <input type="text" placeholder="N° Permis" onChange={e => setNewClientData({...newClientData, licenseNumber: e.target.value})} className="px-6 py-4 rounded-2xl bg-white shadow-sm outline-none font-bold" />
                              <input type="date" onChange={e => setNewClientData({...newClientData, licenseExpiry: e.target.value})} className="px-6 py-4 rounded-2xl bg-white shadow-sm outline-none font-bold" />
                           </div>
                           <div className="p-8 border-4 border-dashed border-gray-200 rounded-[2.5rem] bg-white/50 text-center">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Photos Documents (CNI, Permis...)</p>
                              <button onClick={() => document.getElementById('docs-in')?.click()} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-all">📷 Télécharger Photos</button>
                              <input type="file" id="docs-in" multiple className="hidden" accept="image/*" />
                           </div>
                           <div className="flex gap-4 pt-4">
                              <button onClick={() => setIsCreatingNewClient(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px]">Annuler</button>
                              <GradientButton onClick={() => {
                                 const c: Customer = {
                                    id: `c-${Date.now()}`, firstName: newClientData.firstName || '', lastName: newClientData.lastName || '',
                                    phone: newClientData.phone || '', idCardNumber: newClientData.idCardNumber || '', wilaya: newClientData.wilaya || '16 - Alger',
                                    address: newClientData.address || '', licenseNumber: newClientData.licenseNumber || '', licenseExpiry: newClientData.licenseExpiry || '',
                                    profilePicture: 'https://via.placeholder.com/200', documentImages: [], totalReservations: 0, totalSpent: 0
                                 };
                                 onAddCustomer(c); setFormData({...formData, customerId: c.id}); setIsCreatingNewClient(false);
                              }} className="flex-[2] !py-4 rounded-2xl shadow-xl">Enregistrer & Sélectionner</GradientButton>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
             )}

             {step === 4 && (
                <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-10">
                      <div className="p-10 bg-gray-50 rounded-[3.5rem] border border-gray-100 shadow-inner">
                         <div className="flex justify-between items-center mb-8">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">🤵‍♂️ {t.labels.withDriver}</h3>
                            <input type="checkbox" checked={formData.isWithDriver} onChange={e => setFormData({...formData, isWithDriver: e.target.checked})} className="w-8 h-8 rounded-xl text-blue-600" />
                         </div>
                         {formData.isWithDriver && (
                           <select value={formData.driverId || ''} onChange={e => setFormData({...formData, driverId: e.target.value})} className="w-full px-6 py-4 rounded-2xl font-bold bg-white shadow-sm outline-none appearance-none cursor-pointer">
                              <option value="">Choisir un chauffeur</option>
                              {MOCK_WORKERS.filter(w => w.role === 'driver').map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                           </select>
                         )}
                      </div>
                      <div className="p-10 bg-blue-50/50 rounded-[3.5rem] border border-blue-100 shadow-inner">
                         <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 px-4">{t.labels.caution}</label>
                         <input type="number" value={formData.cautionAmount || ''} onChange={e => setFormData({...formData, cautionAmount: Number(e.target.value)})} className="w-full px-8 py-6 rounded-[2rem] bg-white font-black text-4xl text-blue-600 shadow-xl text-center outline-none" placeholder="0" />
                      </div>
                   </div>
                   <div className="p-10 bg-white border border-gray-100 rounded-[3.5rem] shadow-xl space-y-10 flex flex-col overflow-hidden">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] border-b pb-6">Services & Options</h3>
                      <div className="grid grid-cols-2 gap-4">
                         {(['decoration', 'equipment', 'insurance', 'service'] as const).map(cat => (
                           <button key={cat} onClick={() => { setTempOptionCat(cat); setActiveModal('add-option'); }} className="px-6 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm">+ {cat}</button>
                         ))}
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                         {formData.tempOptions.map(o => (
                           <div key={o.id} className="flex justify-between items-center p-6 bg-gray-50 rounded-[2rem] border border-gray-100 animate-scale-in">
                              <div><p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">{o.category}</p><p className="font-black text-gray-900 text-lg uppercase leading-none">{o.name}</p></div>
                              <p className="font-black text-blue-600 text-xl">{o.price.toLocaleString()} DZ</p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             )}

             {step === 5 && (
                <div className="animate-fade-in space-y-12">
                   <div className="bg-gray-900 rounded-[4.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5 text-[15rem] font-black rotate-12 leading-none">BILL</div>
                      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                         <div className="flex items-center gap-10">
                            <img src={getVehicle(formData.vehicleId!)?.mainImage} className="w-32 h-32 rounded-full border-4 border-white/20 p-2 bg-white/5 shadow-2xl object-cover" />
                            <div>
                               <h4 className="text-4xl font-black uppercase leading-none mb-3">{getVehicle(formData.vehicleId!)?.brand} {getVehicle(formData.vehicleId!)?.model}</h4>
                               <p className="text-blue-400 font-black text-sm tracking-[0.3em] uppercase">{getVehicle(formData.vehicleId!)?.immatriculation}</p>
                               <div className="flex gap-4 mt-8">
                                  <span className="px-6 py-2 bg-white/10 rounded-full text-xs font-black uppercase">{invoice.days} Jours</span>
                                  <span className="px-6 py-2 bg-white/10 rounded-full text-xs font-black uppercase">{getVehicle(formData.vehicleId!)?.dailyRate} DZ/J</span>
                               </div>
                            </div>
                         </div>
                         <div className="text-center lg:text-right">
                            <p className="text-[10px] font-black uppercase opacity-40 mb-4 tracking-[0.4em]">TOTAL GÉNÉRAL À PAYER</p>
                            <p className="text-9xl font-black text-blue-400 leading-none tracking-tighter">{invoice.finalTotal.toLocaleString()} <span className="text-3xl font-bold uppercase">DZ</span></p>
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="p-12 bg-white border border-gray-100 rounded-[4.5rem] shadow-sm space-y-10">
                         <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Décomposition du tarif</h4>
                            <label className="flex items-center gap-4 cursor-pointer group">
                               <input type="checkbox" checked={formData.withTva} onChange={e => setFormData({...formData, withTva: e.target.checked})} className="w-8 h-8 rounded-xl text-blue-600" />
                               <span className="text-[10px] font-black text-gray-400 uppercase">{t.labels.tva}</span>
                            </label>
                         </div>
                         <div className="space-y-6 font-bold text-gray-700">
                            <div className="flex justify-between items-center text-xl"><span>Base de location</span><span className="font-black text-gray-900">{invoice.baseTotal.toLocaleString()} DZ</span></div>
                            <div className="flex justify-between items-center pt-8 border-t-2 border-dashed border-gray-50">
                               <span className="text-red-500 text-[10px] font-black uppercase">{t.labels.discount}</span>
                               <input type="number" value={formData.discount || ''} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} className="w-44 px-6 py-4 bg-red-50 rounded-[1.5rem] text-right font-black text-red-600 outline-none" placeholder="0" />
                            </div>
                         </div>
                      </div>
                      <div className="p-12 bg-blue-50/20 border border-blue-100 rounded-[4.5rem] shadow-inner space-y-12">
                         <div className="space-y-6">
                            <label className="block text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] px-6">{t.labels.paid}</label>
                            <input type="number" value={formData.paid || ''} onChange={e => setFormData({...formData, paid: Number(e.target.value)})} className="w-full px-10 py-10 rounded-[3rem] bg-white font-black text-7xl text-blue-600 shadow-2xl text-center outline-none focus:ring-12 ring-blue-50 transition-all" />
                         </div>
                         <div className="p-10 bg-white/80 rounded-[3.5rem] border border-blue-200 flex justify-between items-center shadow-xl">
                            <div><p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">Reste à payer</p></div>
                            <p className={`text-6xl font-black ${invoice.rest > 0 ? 'text-red-600' : 'text-green-600'} tracking-tighter`}>{invoice.rest.toLocaleString()} <span className="text-2xl font-bold">DZ</span></p>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             <div className="mt-auto pt-16 flex justify-between items-center">
                <button disabled={step === 1} onClick={() => setStep(step - 1)} className={`px-14 py-6 font-black uppercase text-xs tracking-[0.3em] text-gray-300 hover:text-gray-900 transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}>RETOUR</button>
                <div className="flex gap-4">
                   {step < 5 ? (
                     <GradientButton onClick={() => setStep(step + 1)} className="!px-24 !py-7 text-2xl rounded-[2.5rem] shadow-2xl shadow-blue-100">Suivant →</GradientButton>
                   ) : (
                     <GradientButton onClick={handleSaveRes} className="!px-32 !py-9 text-4xl rounded-[3.5rem] shadow-2xl shadow-green-100">✅ {t.labels.confirm}</GradientButton>
                   )}
                </div>
             </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <>
          {/* Filter & Search Bar */}
          <div className="mb-12 flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {(['all', 'confermer', 'en cours', 'terminer', 'annuler', 'en attente'] as const).map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all border-2 ${filterStatus === s ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-600'}`}>
                  {t.status[s]}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-[500px] group">
              <span className="absolute inset-y-0 left-8 flex items-center text-gray-400 text-3xl opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
              <input type="text" placeholder="Client ou Dossier N°..." value={searchQuery} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-20 pr-8 py-6 bg-white border-2 border-gray-100 focus:border-blue-600 rounded-[3rem] text-xl font-bold shadow-sm outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-12">
            {filteredReservations.map(res => {
              const c = getCustomer(res.customerId);
              const v = getVehicle(res.vehicleId);
              const rest = res.totalAmount - res.paidAmount;
              const days = calculateDays(res.startDate, res.endDate);
              
              return (
                <div key={res.id} className="group bg-white rounded-[5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden hover:shadow-[0_50px_120px_-30px_rgba(59,130,246,0.2)] hover:-translate-y-4 transition-all duration-700 flex flex-col h-full relative">
                  <div className="relative h-72 overflow-hidden">
                    <img src={v?.mainImage} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
                       <span className={`px-8 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest text-white shadow-2xl ${res.status === 'en cours' ? 'bg-green-600' : res.status === 'terminer' ? 'bg-gray-800' : 'bg-blue-600'}`}>{res.status}</span>
                       <span className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-[1.25rem] text-[11px] font-black text-gray-900 shadow-xl">#{res.reservationNumber}</span>
                    </div>
                    <div className={`absolute bottom-0 translate-y-1/2 ${isRtl ? 'left-12' : 'right-12'} z-10`}>
                       <img src={c?.profilePicture} className="w-24 h-24 rounded-full border-[6px] border-white shadow-2xl object-cover" />
                    </div>
                  </div>

                  <div className="p-14 pt-16 space-y-12 flex-1">
                    <div>
                       <h3 className="text-4xl font-black text-gray-900 group-hover:text-blue-600 transition-colors truncate uppercase leading-none">{v?.brand} {v?.model}</h3>
                       <p className="text-gray-400 font-bold mt-4 uppercase tracking-[0.2em] text-[12px] flex items-center gap-3">
                          <span className="w-3 h-3 bg-blue-600 rounded-full"></span> {c?.firstName} {c?.lastName}
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-8 rounded-[3.5rem] border border-gray-100 shadow-inner">
                       <div className="text-center border-r border-gray-200">
                          <p className="text-[11px] font-black text-gray-400 uppercase mb-2">Période Location</p>
                          <p className="font-black text-gray-900 text-sm leading-relaxed">{new Date(res.startDate).toLocaleDateString()}<br/>→ {new Date(res.endDate).toLocaleDateString()}</p>
                       </div>
                       <div className="flex flex-col items-center justify-center">
                          <p className="text-[11px] font-black text-gray-400 uppercase mb-1">Durée</p>
                          <p className="text-3xl font-black text-blue-600 leading-none">{days} <span className="text-xs uppercase">Jours</span></p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="text-center bg-gray-50/30 p-4 rounded-3xl">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">PAYÉ</p>
                          <p className="text-3xl font-black text-gray-900 leading-none">{res.paidAmount.toLocaleString()} <span className="text-xs opacity-40">DZ</span></p>
                       </div>
                       <div className="text-center bg-red-50/30 p-4 rounded-3xl">
                          <p className="text-[10px] font-black text-red-500 uppercase mb-2 tracking-widest">DETTE / RESTE</p>
                          <p className={`text-3xl font-black ${rest > 0 ? 'text-red-600' : 'text-green-600'} leading-none`}>{rest.toLocaleString()} <span className="text-xs opacity-40">DZ</span></p>
                       </div>
                    </div>

                    <div className="space-y-4 pt-10 border-t border-gray-50">
                       <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => { setSelectedRes(res); setActiveModal('details'); }} className="flex-1 py-5 bg-blue-50 text-blue-600 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all shadow-sm">🔍 Détails</button>
                          <button onClick={() => handleEdit(res)} className="flex-1 py-5 bg-gray-50 text-gray-500 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-black hover:text-white transition-all">✏️ Éditer</button>
                       </div>
                       <div className="flex gap-4">
                          {res.status === 'confermer' && (
                            <button onClick={() => { setSelectedRes(res); setLogData({ mileage: v?.mileage, fuel: 'plein', location: MOCK_AGENCIES.find(a => a.id === res.pickupAgencyId)?.id || '' }); setActiveModal('activate'); }} className="flex-1 py-6 bg-green-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all">🏁 {t.labels.activate}</button>
                          )}
                          {res.status === 'en cours' && (
                            <button onClick={() => { setSelectedRes(res); setTermData({...termData, mileage: (res.activationLog?.mileage || 0) + 100, location: MOCK_AGENCIES.find(a => a.id === res.returnAgencyId)?.id || ''}); setActiveModal('terminate'); }} className="flex-1 py-6 bg-orange-600 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all">🔒 Terminer Location</button>
                          )}
                          <button onClick={() => { setSelectedRes(res); setActiveModal('template-select'); }} className="flex-1 py-6 bg-gray-900 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-black transition-all">🖨️ {res.status === 'en cours' || res.status === 'terminer' ? 'Contrat' : 'Devis'}</button>
                       </div>
                       {rest > 0 && (
                          <button onClick={() => { setSelectedRes(res); setPaymentAmount(0); setActiveModal('pay'); }} className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-3">💰 {t.labels.pay}</button>
                       )}
                       <button onClick={() => { setSelectedRes(res); setActiveModal('delete'); }} className="w-full py-4 text-xs font-black text-gray-300 uppercase tracking-[0.3em] hover:text-red-500 transition-colors">🗑️ Supprimer Dossier</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* --- ACTION MODALS --- */}

      {/* TEMPLATE SELECT MODAL */}
      {activeModal === 'template-select' && selectedRes && (
        <ModalBase title={t.labels.selectTemplate} onClose={() => setActiveModal(null)} maxWidth="max-w-4xl">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              {AVAILABLE_TEMPLATES.filter(tpl => {
                if (selectedRes.status === 'en cours' || selectedRes.status === 'terminer') return tpl.category === 'contract';
                return tpl.category === 'devis' || tpl.category === 'invoice';
              }).map(tpl => (
                <button key={tpl.id} onClick={() => { setSelectedTemplate(tpl); setActiveModal('print-view'); }} className="group p-8 rounded-[3rem] border-2 border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all text-left flex items-center gap-6 shadow-sm hover:shadow-xl">
                   <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📄</div>
                   <div>
                      <h4 className="text-xl font-black text-gray-900 uppercase">{tpl.name}</h4>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Design Studio • Ready to print</p>
                   </div>
                </button>
              ))}
           </div>
        </ModalBase>
      )}

      {/* PRINT VIEW MODAL */}
      {activeModal === 'print-view' && selectedRes && selectedTemplate && (
        <ModalBase title="Génération du Document" onClose={() => setActiveModal(null)} maxWidth="max-w-5xl">
           <div className="bg-gray-100 p-10 flex justify-center custom-scrollbar max-h-[70vh] rounded-[2rem]">
              <div className="bg-white shadow-2xl relative" style={{ width: `${selectedTemplate.canvasWidth}px`, height: `${selectedTemplate.canvasHeight}px` }}>
                 {selectedTemplate.elements.map(el => (
                   <div key={el.id} className="absolute" style={{
                      left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: `${el.height}px`, fontSize: `${el.fontSize}px`,
                      color: el.color, backgroundColor: el.backgroundColor, fontFamily: el.fontFamily, fontWeight: el.fontWeight as any,
                      textAlign: el.textAlign, borderRadius: `${el.borderRadius}px`, padding: `${el.padding}px`, borderWidth: `${el.borderWidth}px`,
                      borderColor: el.borderColor, opacity: el.opacity, zIndex: el.zIndex, whiteSpace: 'pre-wrap', lineHeight: el.lineHeight
                   }}>
                      {replaceVariables(el.content, selectedRes)}
                   </div>
                 ))}
              </div>
           </div>
           <div className="mt-10 flex justify-end gap-6">
              <button onClick={() => setActiveModal('template-select')} className="px-10 py-4 bg-gray-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400">Changer de modèle</button>
              <GradientButton onClick={() => window.print()} className="!px-16 !py-5 text-xl rounded-2xl">🖨️ Lancer l'impression PDF</GradientButton>
           </div>
        </ModalBase>
      )}

      {/* ACTIVATE MODAL */}
      {activeModal === 'activate' && selectedRes && (
        <ModalBase title="Mise en circulation (Check-in)" onClose={() => setActiveModal(null)} maxWidth="max-w-2xl">
           <div className="space-y-10 animate-fade-in">
              <div className="flex items-center gap-8 bg-blue-50 p-8 rounded-[3rem] border border-blue-100 shadow-inner">
                 <img src={getVehicle(selectedRes.vehicleId)?.mainImage} className="w-40 h-24 object-cover rounded-2xl border-4 border-white shadow-lg" />
                 <div>
                    <h4 className="text-2xl font-black uppercase text-gray-900">{getVehicle(selectedRes.vehicleId)?.brand} {getVehicle(selectedRes.vehicleId)?.model}</h4>
                    <p className="text-blue-600 font-black tracking-widest">{getVehicle(selectedRes.vehicleId)?.immatriculation}</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-4">Kilométrage de départ</label>
                    <input type="number" value={logData.mileage || ''} onChange={e => setLogData({...logData, mileage: Number(e.target.value)})} className="w-full px-8 py-5 bg-gray-50 rounded-2xl font-black text-4xl outline-none shadow-inner" placeholder="00000" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-4">Lieu de prise en charge</label>
                    <select value={logData.location} onChange={e => setLogData({...logData, location: e.target.value})} className="w-full px-6 py-5 bg-gray-50 rounded-2xl font-bold outline-none shadow-inner appearance-none cursor-pointer">
                        {MOCK_AGENCIES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                 </div>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-4">Niveau de Carburant</label>
                 <div className="grid grid-cols-5 gap-3">
                    {(['plein', '1/2', '1/4', '1/8', 'vide'] as const).map(lvl => (
                       <button key={lvl} onClick={() => setLogData({...logData, fuel: lvl})} className={`py-4 rounded-2xl font-black text-[10px] uppercase border-2 transition-all ${logData.fuel === lvl ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 border-transparent'}`}>{lvl}</button>
                    ))}
                 </div>
              </div>
              <textarea value={logData.notes} onChange={e => setLogData({...logData, notes: e.target.value})} className="w-full px-8 py-6 bg-gray-50 rounded-[2.5rem] font-bold h-24 outline-none resize-none shadow-inner" placeholder="Notes optionnelles sur l'état du véhicule..." />
              <GradientButton onClick={handleActivate} className="w-full !py-6 text-xl rounded-3xl shadow-2xl">CONFIRMER LE DÉPART ET ACTIVER →</GradientButton>
           </div>
        </ModalBase>
      )}

      {/* TERMINATE MODAL */}
      {activeModal === 'terminate' && selectedRes && (
        <ModalBase title="Clôture de la location (Check-out)" onClose={() => setActiveModal(null)} maxWidth="max-w-6xl">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
              <div className="space-y-10">
                 <div className="p-10 bg-gray-900 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl font-black rotate-12">KM</div>
                    <div className="relative z-10 space-y-8">
                       <h4 className="text-xs font-black uppercase text-blue-400 tracking-widest flex items-center gap-4">🛣️ Suivi Kilométrique</h4>
                       <div className="flex justify-between items-center border-b border-white/10 pb-8">
                          <div><p className="text-[10px] uppercase opacity-40 mb-1">AU DÉPART</p><p className="text-3xl font-black">{selectedRes.activationLog?.mileage || 0} KM</p></div>
                          <div className="text-right"><p className="text-[10px] uppercase opacity-40 mb-1">AU RETOUR</p><input type="number" value={termData.mileage} onChange={e => setTermData({...termData, mileage: Number(e.target.value)})} className="bg-white/10 px-4 py-2 rounded-xl text-3xl font-black text-blue-400 outline-none w-48 text-right focus:bg-white/20 transition-all" /></div>
                       </div>
                       <div className="flex justify-between items-center pt-4">
                          <span className="text-sm font-black uppercase text-gray-400">DISTANCE TOTALE PARCOURUE</span>
                          <span className="text-6xl font-black tracking-tighter text-blue-400">{(termData.mileage - (selectedRes.activationLog?.mileage || 0)).toLocaleString()} <span className="text-xl font-bold">KM</span></span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-gray-400 uppercase px-4 tracking-widest">Lieu de retour</label>
                       <select value={termData.location} onChange={e => setTermData({...termData, location: e.target.value})} className="w-full px-6 py-5 bg-gray-50 rounded-2xl font-bold outline-none shadow-inner appearance-none cursor-pointer">
                          {MOCK_AGENCIES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-gray-400 uppercase px-4 tracking-widest">Date & Heure retour</label>
                       <input type="datetime-local" value={termData.date} onChange={e => setTermData({...termData, date: e.target.value})} className="w-full px-6 py-5 bg-gray-50 rounded-2xl font-bold outline-none shadow-inner" />
                    </div>
                 </div>

                 <div className="p-10 bg-blue-50/50 rounded-[3.5rem] border border-blue-100 shadow-inner">
                    <label className="block text-[10px] font-black text-blue-600 uppercase mb-6 px-4 tracking-widest">⛽ Niveau Carburant (Départ: {selectedRes.activationLog?.fuel})</label>
                    <div className="grid grid-cols-5 gap-3">
                       {(['plein', '1/2', '1/4', '1/8', 'vide'] as const).map(lvl => (
                          <button key={lvl} onClick={() => setTermData({...termData, fuel: lvl})} className={`py-4 rounded-2xl font-black text-[9px] uppercase border-2 transition-all ${termData.fuel === lvl ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-white text-gray-400 border-transparent hover:border-blue-200'}`}>{lvl}</button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="space-y-10">
                 <div className="p-12 bg-white border border-gray-100 rounded-[4rem] shadow-xl space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 text-8xl font-black rotate-12 pointer-events-none">FRAIS</div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-6 flex items-center gap-4">💸 Frais Supplémentaires de Clôture</h3>
                    <div className="space-y-8">
                       <div className="flex justify-between items-center gap-10">
                          <div className="flex-1"><p className="text-sm font-black text-gray-900 uppercase">Kilométrage excédentaire</p><p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-tighter">Facturé si dépassement forfait</p></div>
                          <input type="number" value={termData.extraKmCost || ''} onChange={e => setTermData({...termData, extraKmCost: Number(e.target.value)})} className="w-40 px-6 py-4 bg-red-50 rounded-2xl text-right font-black text-red-600 outline-none border-2 border-transparent focus:border-red-200 transition-all" placeholder="0" />
                       </div>
                       <div className="flex justify-between items-center gap-10">
                          <div className="flex-1"><p className="text-sm font-black text-gray-900 uppercase">Carburant manquant</p><p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-tighter">Différence par rapport au check-in</p></div>
                          <input type="number" value={termData.extraFuelCost || ''} onChange={e => setTermData({...termData, extraFuelCost: Number(e.target.value)})} className="w-40 px-6 py-4 bg-red-50 rounded-2xl text-right font-black text-red-600 outline-none border-2 border-transparent focus:border-red-200 transition-all" placeholder="0" />
                       </div>
                       <div className="pt-8 border-t-2 border-dashed border-gray-100 space-y-6">
                          <div className="flex justify-between items-center px-4"><span className="text-sm font-black text-gray-400 uppercase tracking-widest">Sous-Total Frais</span><span className="text-xl font-bold text-gray-600">{(termData.extraKmCost + termData.extraFuelCost).toLocaleString()} DZ</span></div>
                          <div className="flex justify-between items-center p-6 bg-red-50 rounded-[2.5rem] border border-red-100">
                             <div className="flex items-center gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                   <input type="checkbox" checked={termData.withTva} onChange={e => setTermData({...termData, withTva: e.target.checked})} className="w-7 h-7 rounded-xl text-red-600 focus:ring-red-200" />
                                   <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{t.labels.tva}</span>
                                </label>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black text-red-400 uppercase tracking-[0.3em] mb-1">TOTAL FRAIS SUPPLÉMENTAIRES TTC</p>
                                <p className="text-4xl font-black text-red-600 tracking-tighter">{(termData.withTva ? (termData.extraKmCost + termData.extraFuelCost) * 1.19 : (termData.extraKmCost + termData.extraFuelCost)).toLocaleString()} <span className="text-lg">DZ</span></p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <textarea value={termData.notes} onChange={e => setTermData({...termData, notes: e.target.value})} className="w-full px-10 py-8 bg-gray-50 rounded-[3rem] font-bold h-32 outline-none resize-none shadow-inner border border-gray-100" placeholder="Note de clôture: observations sur l'état général au retour..." />
                 <GradientButton onClick={handleTerminate} className="w-full !py-8 text-4xl rounded-[3.5rem] shadow-2xl shadow-green-100 hover:scale-[1.02] active:scale-95 transition-all">✅ CLÔTURER LE DOSSIER</GradientButton>
              </div>
           </div>
        </ModalBase>
      )}

      {/* PAY DEBT MODAL */}
      {activeModal === 'pay' && selectedRes && (
        <ModalBase title="Règlement de dette" onClose={() => setActiveModal(null)} maxWidth="max-w-md">
           <div className="space-y-12 text-center animate-scale-in">
              <div className="p-10 bg-red-50 rounded-[3.5rem] border border-red-100 shadow-inner group">
                 <p className="text-[11px] font-black text-red-400 uppercase mb-4 tracking-widest group-hover:scale-110 transition-transform">Dette Actuelle</p>
                 <p className="text-7xl font-black text-red-600 tracking-tighter">{(selectedRes.totalAmount - selectedRes.paidAmount).toLocaleString()} <span className="text-2xl font-bold uppercase">DZ</span></p>
              </div>
              <div className="space-y-6">
                 <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest px-4">Montant à verser aujourd'hui</label>
                 <div className="relative group">
                    <span className="absolute inset-y-0 left-8 flex items-center text-4xl text-gray-300 opacity-50 font-black">DZ</span>
                    <input type="number" value={paymentAmount || ''} onChange={e => setPaymentAmount(Number(e.target.value))} autoFocus className="w-full pl-24 pr-10 py-10 bg-gray-900 text-white rounded-[3.5rem] font-black text-6xl text-center outline-none shadow-2xl focus:ring-12 ring-blue-500/20 transition-all placeholder-gray-700" placeholder="0" 
                        onKeyDown={(e) => { if (e.key === 'Enter') handleProcessPayment(); }}
                    />
                 </div>
                 <GradientButton onClick={handleProcessPayment} disabled={paymentAmount <= 0} className="w-full !py-6 text-xl rounded-3xl shadow-2xl">
                    {t.labels.confirmPay} →
                 </GradientButton>
                 <p className="text-xs font-bold text-gray-400 mt-6 italic bg-gray-50 inline-block px-6 py-2 rounded-full border border-gray-100 uppercase tracking-tighter">Appuyez sur <span className="text-gray-900 font-black">Entrée ⏎</span> pour confirmer</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-full py-5 text-xs font-black text-gray-300 uppercase tracking-[0.5em] hover:text-gray-900 transition-colors">ANNULER LE PAIEMENT</button>
           </div>
        </ModalBase>
      )}

      {/* DELETE MODAL */}
      {activeModal === 'delete' && selectedRes && (
        <ModalBase title="Supprimer le dossier" onClose={() => setActiveModal(null)} maxWidth="max-w-md">
           <div className="space-y-10 text-center animate-scale-in">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center text-5xl mx-auto shadow-inner animate-bounce">⚠️</div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-gray-900">{t.labels.deleteConfirm}</h3>
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cette action est irréversible</p>
              </div>
              <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                 <p className="text-xl font-black text-gray-900">Dossier N° {selectedRes.reservationNumber}</p>
                 <p className="text-sm font-bold text-red-600 mt-1 uppercase tracking-tighter">Client: {getCustomer(selectedRes.customerId)?.firstName} {getCustomer(selectedRes.customerId)?.lastName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setActiveModal(null)} className="py-5 bg-gray-100 rounded-2xl font-black uppercase text-[11px] tracking-widest text-gray-500 hover:bg-gray-200 transition-all">Garder</button>
                 <button onClick={handleDelete} className="py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all">Supprimer</button>
              </div>
           </div>
        </ModalBase>
      )}

      {/* DETAILS MODAL */}
      {activeModal === 'details' && selectedRes && (
        <ModalBase title="Fiche Dossier de Location" onClose={() => setActiveModal(null)} maxWidth="max-w-6xl">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-6 animate-fade-in">
              <div className="space-y-10">
                 <div className="bg-gray-50 rounded-[4rem] p-12 shadow-inner relative overflow-hidden border border-gray-100">
                    <div className="flex items-center gap-10 mb-12">
                       <img src={getVehicle(selectedRes.vehicleId)?.mainImage} className="w-56 h-36 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white" />
                       <div className="overflow-hidden">
                          <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3">Le Véhicule</p>
                          <h4 className="text-4xl font-black text-gray-900 leading-tight uppercase truncate">{getVehicle(selectedRes.vehicleId)?.brand}<br/>{getVehicle(selectedRes.vehicleId)?.model}</h4>
                          <p className="text-sm font-black text-blue-700 bg-blue-100 inline-block px-4 py-1 rounded-full mt-4 tracking-widest shadow-sm">{getVehicle(selectedRes.vehicleId)?.immatriculation}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="bg-white p-8 rounded-[3rem] text-center border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">🛫 Départ</p><p className="font-black text-gray-800 text-lg">{new Date(selectedRes.startDate).toLocaleDateString()}</p><p className="text-[10px] font-bold text-blue-600 bg-blue-50 inline-block px-4 py-1 rounded-full mt-2 uppercase">{new Date(selectedRes.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p></div>
                       <div className="bg-white p-8 rounded-[3rem] text-center border border-gray-100 shadow-sm"><p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">🛬 Retour</p><p className="font-black text-gray-800 text-lg">{new Date(selectedRes.endDate).toLocaleDateString()}</p><p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 inline-block px-4 py-1 rounded-full mt-2 uppercase">{new Date(selectedRes.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p></div>
                    </div>
                 </div>
                 <div className="p-12 bg-white border-2 border-gray-50 rounded-[4rem] flex items-center gap-10 shadow-sm hover:border-blue-200 transition-colors group">
                    <img src={getCustomer(selectedRes.customerId)?.profilePicture} className="w-28 h-28 rounded-full border-4 border-white shadow-2xl object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="overflow-hidden">
                       <p className="text-[11px] font-black text-blue-600 uppercase mb-2 tracking-widest">Locataire Titulaire</p>
                       <h4 className="text-3xl font-black text-gray-900 uppercase truncate">{getCustomer(selectedRes.customerId)?.firstName} {getCustomer(selectedRes.customerId)?.lastName}</h4>
                       <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">📞 {getCustomer(selectedRes.customerId)?.phone} <span className="opacity-30">|</span> 🆔 {getCustomer(selectedRes.customerId)?.idCardNumber}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-10">
                 <div className="bg-gray-900 rounded-[4.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl font-black rotate-12 leading-none pointer-events-none">PAY</div>
                    <div className="relative z-10 flex justify-between items-center mb-12 border-b border-white/10 pb-10">
                       <div><p className="text-[11px] font-black uppercase opacity-40 mb-3 tracking-[0.3em]">Total Dossier</p><p className="text-6xl font-black text-blue-400 tracking-tighter">{selectedRes.totalAmount.toLocaleString()} <span className="text-xl">DZ</span></p></div>
                       <div className="text-right"><p className="text-[11px] font-black uppercase opacity-40 mb-3 tracking-[0.3em]">Déjà versé</p><p className="text-4xl font-black text-green-400 tracking-tighter">{selectedRes.paidAmount.toLocaleString()} <span className="text-lg">DZ</span></p></div>
                    </div>
                    <div className={`p-10 rounded-[3rem] flex justify-between items-center shadow-inner ${selectedRes.totalAmount - selectedRes.paidAmount > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                       <span className="text-sm font-black uppercase tracking-widest">Solde Restant</span>
                       <span className="text-6xl font-black tracking-tighter">{(selectedRes.totalAmount - selectedRes.paidAmount).toLocaleString()} <span className="text-2xl">DZ</span></span>
                    </div>
                 </div>
                 <div className="p-12 bg-white border-2 border-gray-50 rounded-[4rem] shadow-sm flex flex-col h-full overflow-hidden">
                    <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-10 border-b pb-6 flex justify-between items-center">
                        <span>Détails Additionnels</span>
                        <span className="bg-gray-100 px-4 py-1 rounded-full text-[9px] text-gray-500">Total: {selectedRes.options.length + (selectedRes.driverId ? 1 : 0)} Services</span>
                    </h5>
                    <div className="flex flex-wrap gap-4 overflow-y-auto max-h-[150px] pr-2 custom-scrollbar">
                       <span className="px-6 py-3 bg-blue-50 text-blue-600 rounded-full text-[11px] font-black uppercase border border-blue-100 flex items-center gap-4 shadow-sm hover:scale-105 transition-transform cursor-default"><span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span> Caution: {selectedRes.cautionAmount.toLocaleString()} DZ</span>
                       {selectedRes.driverId && <span className="px-6 py-3 bg-orange-50 text-orange-600 rounded-full text-[11px] font-black uppercase border border-orange-100 flex items-center gap-4 shadow-sm hover:scale-105 transition-transform cursor-default"><span className="w-2 h-2 bg-orange-600 rounded-full"></span> Chauffeur Inclus</span>}
                       {selectedRes.options.map(o => <span key={o.id} className="px-6 py-3 bg-gray-50 text-gray-500 rounded-full text-[11px] font-black uppercase border border-gray-100 flex items-center gap-4 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm cursor-default"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> {o.name}: {o.price.toLocaleString()} DZ</span>)}
                    </div>
                    <div className="mt-auto pt-10 grid grid-cols-2 gap-4">
                        <button className="py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all">📄 Imprimer Dossier</button>
                        <button className="py-5 bg-blue-50 text-blue-600 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">✉️ Envoyer PDF</button>
                    </div>
                 </div>
              </div>
           </div>
        </ModalBase>
      )}

      {/* ADD OPTION MODAL */}
      {activeModal === 'add-option' && (
        <ModalBase title={`Ajouter ${tempOptionCat}`} onClose={() => setActiveModal(null)} maxWidth="max-w-md">
           <form onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              const newOpt: RentalOption = { id: `opt-${Date.now()}`, name: d.get('name') as string, price: Number(d.get('price')), category: tempOptionCat! };
              setFormData({ ...formData, tempOptions: [...formData.tempOptions, newOpt] });
              setActiveModal(null);
           }} className="space-y-10 animate-fade-in">
              <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 px-4">Désignation de l'option</label>
                    <input name="name" required autoFocus className="w-full px-8 py-5 bg-gray-50 rounded-2xl font-black text-lg outline-none border-2 border-transparent focus:border-blue-500 transition-all shadow-inner" placeholder="Ex: GPS, Décoration..." />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 px-4">Prix Supplémentaire (DZ)</label>
                    <input name="price" type="number" required className="w-full px-8 py-5 bg-gray-50 rounded-2xl font-black text-4xl text-blue-600 outline-none border-2 border-transparent focus:border-blue-500 transition-all shadow-inner" placeholder="0" />
                </div>
              </div>
              <GradientButton type="submit" className="w-full !py-6 text-xl rounded-3xl shadow-2xl">AJOUTER AU CONTRAT →</GradientButton>
           </form>
        </ModalBase>
      )}
    </div>
  );
};

export default PlannerPage;
