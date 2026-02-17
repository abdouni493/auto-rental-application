
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Language, Inspection, Reservation, Vehicle, Customer, Damage } from '../types';
import GradientButton from '../components/GradientButton';
import * as dataService from '../services/dataService';

interface OperationsPageProps {
  lang: Language;
  vehicles: Vehicle[];
  inspections: Inspection[];
  damages: Damage[];
  templates: any[];
  onAddInspection: (insp: Inspection) => void;
  onUpdateInspection: (insp: Inspection) => void;
  onDeleteInspection: (id: string) => void;
  onUpdateVehicleMileage: (vehicleId: string, newMileage: number) => void;
  onAddDamage: (dmg: Damage) => void;
  onUpdateDamage: (dmg: Damage) => void;
  onDeleteDamage: (id: string) => void;
}

type OperationTab = 'inspection' | 'dommages';
type InspectionStep = 1 | 2 | 3;

interface ChecklistItemProps {
  checked: boolean;
  label: string;
  onToggle?: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ checked, label, onToggle }) => (
  <button 
    type="button" 
    onClick={onToggle}
    disabled={!onToggle}
    className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all group ${checked ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'} ${!onToggle ? 'cursor-default' : ''}`}
  >
    <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${checked ? 'bg-white text-blue-600' : 'bg-gray-100'}`}>
      {checked ? '✓' : '✕'}
    </div>
  </button>
);

const FuelSelector: React.FC<{ value: string, onChange: (v: string) => void, lang: Language }> = ({ value, onChange, lang }) => {
  const levels = [
    { id: 'plein', label: '8/8', icon: '⛽', color: 'bg-blue-600' },
    { id: '1/2', label: '1/2', icon: '🌗', color: 'bg-blue-500' },
    { id: '1/4', label: '1/4', icon: '🌘', color: 'bg-blue-400' },
    { id: '1/8', label: '1/8', icon: '🚨', color: 'bg-orange-500' },
    { id: 'vide', label: '0/0', icon: '⚠️', color: 'bg-red-600' }
  ];
  return (
    <div className="grid grid-cols-5 gap-3">
      {levels.map(l => (
        <button
          key={l.id}
          type="button"
          onClick={() => onChange(l.id)}
          className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all group ${value === l.id ? `${l.color} border-transparent text-white shadow-xl scale-105` : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
        >
          <span className="text-2xl group-hover:scale-125 transition-transform">{l.icon}</span>
          <span className="text-[9px] font-black mt-2 uppercase tracking-widest">{l.label}</span>
        </button>
      ))}
    </div>
  );
};

const SignaturePad: React.FC<{ onSave: (dataUrl: string) => void, isRtl: boolean, initialValue?: string }> = ({ onSave, isRtl, initialValue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        if (initialValue) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0);
          img.src = initialValue;
        }
      }
    }
  }, [initialValue]);

  const startDrawing = (e: any) => { setIsDrawing(true); draw(e); };
  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) onSave(canvas.toDataURL());
  };
  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
  };
  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); onSave(''); }
  };

  return (
    <div className="relative group">
      <canvas ref={canvasRef} width={800} height={300} className="w-full bg-white border-4 border-dashed border-gray-200 rounded-[3rem] cursor-crosshair touch-none shadow-inner" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
      <button type="button" onClick={clear} className="absolute bottom-6 right-6 px-8 py-3 bg-red-50 text-red-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm">Effacer</button>
    </div>
  );
};

const OperationsPage: React.FC<OperationsPageProps> = ({ 
  lang, vehicles, inspections, damages, templates,
  onAddInspection, onUpdateInspection, onDeleteInspection, onUpdateVehicleMileage,
  onAddDamage, onUpdateDamage, onDeleteDamage
}) => {
  const [activeTab, setActiveTab] = useState<OperationTab>('inspection');
  const [isCreatingInsp, setIsCreatingInsp] = useState(false);
  const [editingInspId, setEditingInspId] = useState<string | null>(null);
  const [stepInsp, setStepInsp] = useState<InspectionStep>(1);
  const [searchResQuery, setSearchResQuery] = useState('');
  const [viewingInsp, setViewingInsp] = useState<Inspection | null>(null);
  
  // Add state for reservations and customers
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Load real data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [resData, custData] = await Promise.all([
          dataService.getReservations(),
          dataService.getCustomers()
        ]);
        setReservations(resData);
        setCustomers(custData);
      } catch (err) {
        console.error('Failed to load operations data:', err);
      }
    };
    loadData();
  }, []);

  // Print State
  const [activePrintModal, setActivePrintModal] = useState<'print-view' | null>(null);
  const [printRes, setPrintRes] = useState<Reservation | null>(null);
  const [printTemplate, setPrintTemplate] = useState<any>(null);

  const initialInspForm: Partial<Inspection> = {
    type: 'depart', 
    date: new Date().toISOString().split('T')[0], 
    fuel: 'plein',
    security: { lights: false, tires: false, brakes: false, wipers: false, mirrors: false, belts: false, horn: false },
    equipment: { spareWheel: false, jack: false, triangles: false, firstAid: false, docs: false },
    comfort: { ac: false }, 
    cleanliness: { interior: false, exterior: false },
    exteriorPhotos: [], 
    interiorPhotos: [], 
    signature: '',
    notes: ''
  };

  const [inspFormData, setInspFormData] = useState<Partial<Inspection>>(initialInspForm);
  const isRtl = lang === 'ar';

  const t = {
    fr: {
      inspection: 'Inspection', dommages: 'Dommages', history: 'Historique des Inspections',
      newBtn: 'Nouvelle Inspection',
      type: 'Type', date: 'Date', mileage: 'Kilométrage', fuel: 'Niveau Carburant',
      checkIn: 'Départ (Check-in)', checkOut: 'Retour (Check-out)',
      general: 'Informations Générales',
      security: 'Contrôle Sécurité',
      equipment: 'Équipements Obligatoires',
      comfort: 'Confort',
      cleanliness: 'État & Propreté',
      secItems: { lights: 'Feux & Phares', tires: 'Pneus (Usure/Pression)', brakes: 'Freins', wipers: 'Essuie-glaces', mirrors: 'Rétroviseurs', belts: 'Ceintures', horn: 'Klaxon' },
      eqItems: { spareWheel: 'Roue de secours', jack: 'Cric', triangles: 'Triangles', firstAid: 'Trousse secours', docs: 'Docs véhicule' },
      validate: 'Valider l\'inspection',
      next: 'Suivant', back: 'Retour',
      summary: 'Résumé de l\'inspection',
      photos: 'Photos & Validation',
      extPics: 'Photos Extérieur',
      intPics: 'Photos Intérieur',
      signature: 'Signature du Client',
      searchRes: 'Rechercher une réservation (Client)',
      vehicle: 'Véhicule',
      client: 'Locataire',
      printTitle: 'Aperçu Impression Document'
    },
    ar: {
      inspection: 'معاينة', dommages: 'أضرار', history: 'سجل المعاينات',
      newBtn: 'معاينة جديدة',
      type: 'النوع', date: 'التاريخ', mileage: 'المسافة المقطوعة', fuel: 'مستوى الوقود',
      checkIn: 'انطلاق (Check-in)', checkOut: 'عودة (Check-out)',
      general: 'معلومات عامة',
      security: 'مراقبة الأمن',
      equipment: 'المعدات الإلزامية',
      comfort: 'الراحة',
      cleanliness: 'الحالة والنظافة',
      secItems: { lights: 'الأضواء', tires: 'الإطارات', brakes: 'المكابح', wipers: 'المساحات', mirrors: 'المرايا', belts: 'أحزمة الأمان', horn: 'المنبه' },
      eqItems: { spareWheel: 'عجلة احتياطية', jack: 'رافعة', triangles: 'مثلثات التحذير', firstAid: 'صيدلية', docs: 'وثائق المركبة' },
      validate: 'تأكيد المعاينة',
      next: 'التالي', back: 'رجوع',
      summary: 'ملخص المعاينة',
      photos: 'الصور والتأكيد',
      extPics: 'صور خارجية',
      intPics: 'صور داخلية',
      signature: 'توقيع الزبون',
      searchRes: 'بحث عن حجز (الزبون)',
      vehicle: 'المركبة',
      client: 'الزبون',
      printTitle: 'معاينة طباعة الوثيقة'
    }
  }[lang];

  const filteredReservations = useMemo(() => {
    if (!searchResQuery) return [];
    return reservations.filter(res => {
      const client = customers.find(c => c.id === res.customerId);
      const name = `${client?.firstName} ${client?.lastName}`.toLowerCase();
      return name.includes(searchResQuery.toLowerCase()) || res.reservationNumber.toLowerCase().includes(searchResQuery.toLowerCase());
    }).slice(0, 5);
  }, [searchResQuery]);

  const handleToggleCheck = (category: keyof Inspection, field: string) => {
    setInspFormData(prev => ({
      ...prev,
      [category]: { ...(prev[category] as any), [field]: !(prev[category] as any)[field] }
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'exteriorPhotos' | 'interiorPhotos') => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map((file: File) => URL.createObjectURL(file));
      setInspFormData(prev => ({
        ...prev, [type]: [...(prev[type] || []), ...files]
      }));
    }
  };

  const handleFinishInsp = async () => {
    try {
      const finalData = { ...inspFormData as Inspection, id: editingInspId || `insp-${Date.now()}` };
      
      if (editingInspId) {
        // Update existing inspection in Supabase
        await dataService.updateInspection(editingInspId, finalData);
        onUpdateInspection(finalData);
      } else {
        // Create new inspection in Supabase
        const createdInspection = await dataService.createInspection(finalData);
        onAddInspection(createdInspection);
      }
      
      setIsCreatingInsp(false); 
      setEditingInspId(null); 
      setStepInsp(1); 
      setInspFormData(initialInspForm);
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Error saving inspection. Please try again.');
    }
  };

  const handleDeleteInsp = async (inspId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet inspection?')) {
      try {
        await dataService.deleteInspection(inspId);
        onDeleteInspection(inspId);
      } catch (error) {
        console.error('Error deleting inspection:', error);
        alert('Error deleting inspection. Please try again.');
      }
    }
  };

  const handlePrint = (resId: string, category: string) => {
    const res = reservations.find(r => r.id === resId);
    const tpl = templates.find(t => t.category === category);
    if (res && tpl) {
      setPrintRes(res);
      setPrintTemplate(tpl);
      setActivePrintModal('print-view');
    }
  };

  const replaceVariables = (content: string, res: Reservation) => {
    const client = customers.find(c => c.id === res.customerId);
    const vehicle = vehicles.find(v => v.id === res.vehicleId);
    return content
      .replace('{{client_name}}', `${client?.firstName} ${client?.lastName}`)
      .replace('{{client_phone}}', client?.phone || '')
      .replace('{{res_number}}', res.reservationNumber)
      .replace('{{total_amount}}', res.totalAmount.toLocaleString())
      .replace('{{vehicle_name}}', `${vehicle?.brand} ${vehicle?.model}`)
      .replace('{{vehicle_plate}}', vehicle?.immatriculation || '')
      .replace('{{current_date}}', new Date().toLocaleDateString());
  };

  const currentRes = reservations.find(r => r.id === inspFormData.reservationId);
  const currentVeh = currentRes ? vehicles.find(v => v.id === currentRes.vehicleId) : null;

  if (isCreatingInsp) {
    return (
      <div className={`p-4 md:p-8 animate-fade-in ${isRtl ? 'font-arabic text-right' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{editingInspId ? 'Modifier' : t.newBtn} <span className="text-blue-600">/ Étape {stepInsp} sur 3</span></h1>
            <button onClick={() => { setIsCreatingInsp(false); setEditingInspId(null); setInspFormData(initialInspForm); }} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all text-xl">✕</button>
          </div>

          <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
             
             {stepInsp === 1 && (
                <div className="p-10 md:p-16 space-y-12 animate-fade-in">
                   <div className="space-y-6">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-4">{t.searchRes}</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-8 flex items-center text-3xl opacity-30">🔍</span>
                        <input type="text" placeholder="Rechercher par nom ou numéro..." value={searchResQuery} onChange={(e) => setSearchResQuery(e.target.value)} className="w-full pl-20 pr-8 py-7 bg-gray-50 border-4 border-transparent focus:bg-white focus:border-blue-600 rounded-[3rem] outline-none font-black text-2xl transition-all shadow-inner" />
                        {filteredReservations.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[3rem] shadow-2xl z-50 overflow-hidden border border-gray-100">
                            {filteredReservations.map(res => (
                              <button key={res.id} onClick={() => { setInspFormData({...inspFormData, reservationId: res.id}); setSearchResQuery(''); }} className="w-full text-left p-8 hover:bg-blue-50 border-b last:border-none flex justify-between items-center group">
                                <div className="flex items-center gap-6">
                                   <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">👤</div>
                                   <div><p className="font-black text-gray-900 text-lg">{customers.find(c => c.id === res.customerId)?.firstName} {customers.find(c => c.id === res.customerId)?.lastName}</p><p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Réservation: #{res.reservationNumber}</p></div>
                                </div>
                                <span className="px-4 py-2 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600">Sélectionner</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                   </div>

                   {currentRes && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-scale-in">
                        <div className="p-8 bg-blue-50 rounded-[3rem] flex items-center gap-6 border-2 border-blue-100">
                           <img src={currentVeh?.mainImage} className="w-24 h-16 rounded-2xl object-cover shadow-xl border-4 border-white" />
                           <div><h4 className="text-xl font-black text-gray-900 uppercase leading-none mb-1">{currentVeh?.brand} {currentVeh?.model}</h4><p className="text-xs font-black text-blue-600 tracking-tighter">{currentVeh?.immatriculation}</p></div>
                        </div>
                        <div className="p-8 bg-gray-50 rounded-[3rem] flex items-center gap-6 border-2 border-gray-100">
                           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm">🏁</div>
                           <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.type}</p>
                              <div className="flex bg-white p-1 rounded-xl">
                                 <button onClick={() => setInspFormData({...inspFormData, type: 'depart'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${inspFormData.type === 'depart' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Check-in</button>
                                 <button onClick={() => setInspFormData({...inspFormData, type: 'retour'})} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${inspFormData.type === 'retour' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Check-out</button>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}

                   <div className="pt-12 border-t border-gray-50">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-10 text-center">--- {t.general} ---</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Odomètre (KM)</label>
                            <input type="number" value={inspFormData.mileage || ''} onChange={e => setInspFormData({...inspFormData, mileage: parseInt(e.target.value)})} className="w-full px-8 py-6 bg-gray-50 rounded-[2rem] font-black text-4xl outline-none shadow-inner text-gray-900" placeholder="00000" />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">{t.fuel}</label>
                            <FuelSelector value={inspFormData.fuel!} onChange={v => setInspFormData({...inspFormData, fuel: v})} lang={lang} />
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {stepInsp === 2 && (
                <div className="p-10 md:p-16 space-y-16 animate-fade-in bg-gray-50/30">
                   <div>
                      <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-4"><span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🛡️</span> {t.security}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {(Object.keys(t.secItems) as (keyof typeof t.secItems & string)[]).map(k => (
                          <ChecklistItem key={k} checked={!!(inspFormData.security && inspFormData.security[k as keyof typeof t.secItems])} label={t.secItems[k as keyof typeof t.secItems] as string} onToggle={() => handleToggleCheck('security', k)} />
                        ))}
                      </div>
                   </div>
                   <div>
                      <h3 className="text-xs font-black text-orange-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-4"><span className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">🧰</span> {t.equipment}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(Object.keys(t.eqItems) as (keyof typeof t.eqItems & string)[]).map(k => (
                          <ChecklistItem key={k} checked={!!(inspFormData.equipment && inspFormData.equipment[k as keyof typeof t.eqItems])} label={t.eqItems[k as keyof typeof t.eqItems] as string} onToggle={() => handleToggleCheck('equipment', k)} />
                        ))}
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <h3 className="text-xs font-black text-green-600 uppercase tracking-[0.3em] mb-6">{t.comfort}</h3>
                        <ChecklistItem checked={inspFormData.comfort?.ac || false} label="Climatisation (A/C)" onToggle={() => handleToggleCheck('comfort', 'ac')} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-purple-600 uppercase tracking-[0.3em] mb-6">{t.cleanliness}</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <ChecklistItem checked={inspFormData.cleanliness?.interior || false} label="Intérieur Propre" onToggle={() => handleToggleCheck('cleanliness', 'interior')} />
                           <ChecklistItem checked={inspFormData.cleanliness?.exterior || false} label="Extérieur Propre" onToggle={() => handleToggleCheck('cleanliness', 'exterior')} />
                        </div>
                      </div>
                   </div>
                   <div className="pt-8 border-t border-gray-100">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-4 block">Note générale / Observations (Optionnel)</label>
                      <textarea value={inspFormData.notes} onChange={e => setInspFormData({...inspFormData, notes: e.target.value})} className="w-full px-8 py-6 bg-white border-2 border-gray-100 rounded-[2.5rem] outline-none font-bold text-gray-700 h-32 resize-none focus:border-blue-500 transition-all shadow-sm" />
                   </div>
                </div>
             )}

             {stepInsp === 3 && (
                <div className="p-10 md:p-16 space-y-16 animate-fade-in bg-gray-50/20">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100">
                            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-8 border-b pb-4">{t.summary}</h4>
                            <div className="space-y-6">
                               <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-400">Kilométrage:</span><span className="text-2xl font-black text-gray-900">{inspFormData.mileage?.toLocaleString()} KM</span></div>
                               <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-400">Carburant:</span><span className="text-xl font-black text-blue-600 uppercase">{inspFormData.fuel}</span></div>
                            </div>
                         </div>
                         <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100">
                            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-8 border-b pb-4">{t.signature}</h4>
                            <SignaturePad isRtl={isRtl} initialValue={inspFormData.signature} onSave={s => setInspFormData({...inspFormData, signature: s})} />
                         </div>
                      </div>
                      <div className="space-y-8">
                         <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                               <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">{t.extPics}</h4>
                               <button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.multiple = true; input.onchange = (e) => handlePhotoUpload(e as any, 'exteriorPhotos'); input.click(); }} className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-full">+ Ajouter</button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                               {inspFormData.exteriorPhotos?.length === 0 ? <div className="col-span-3 py-10 text-center border-2 border-dashed rounded-3xl text-gray-300 font-black uppercase text-[10px]">Aucune photo</div> : inspFormData.exteriorPhotos?.map((p, i) => <img key={i} src={p} className="w-full aspect-square object-cover rounded-2xl" />)}
                            </div>
                         </div>
                         <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                               <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">{t.intPics}</h4>
                               <button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.multiple = true; input.onchange = (e) => handlePhotoUpload(e as any, 'interiorPhotos'); input.click(); }} className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-full">+ Ajouter</button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                               {inspFormData.interiorPhotos?.length === 0 ? <div className="col-span-3 py-10 text-center border-2 border-dashed rounded-3xl text-gray-300 font-black uppercase text-[10px]">Aucune photo</div> : inspFormData.interiorPhotos?.map((p, i) => <img key={i} src={p} className="w-full aspect-square object-cover rounded-2xl" />)}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             <div className="p-10 md:p-14 border-t border-gray-100 bg-white flex justify-between items-center">
                <button 
                  onClick={() => setStepInsp((stepInsp - 1) as InspectionStep)} 
                  className={`px-12 py-5 font-black uppercase text-xs tracking-widest text-gray-400 hover:text-gray-900 transition-all ${stepInsp === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                >
                   {t.back}
                </button>
                <div className="flex gap-4">
                   {stepInsp < 3 ? (
                      <GradientButton onClick={() => setStepInsp((stepInsp + 1) as InspectionStep)} disabled={stepInsp === 1 && !inspFormData.reservationId} className="!px-16 !py-6 text-xl !rounded-[2rem]">
                         {t.next} →
                      </GradientButton>
                   ) : (
                      <GradientButton onClick={handleFinishInsp} className="!px-24 !py-7 text-2xl !rounded-[2.5rem] shadow-2xl shadow-green-100">
                         ✅ {t.validate}
                      </GradientButton>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-8 animate-fade-in ${isRtl ? 'font-arabic text-right' : ''}`}>
      <div className="flex gap-4 mb-16">
        <button onClick={() => setActiveTab('inspection')} className={`px-12 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'inspection' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white text-gray-400 border border-gray-100'}`}>🔍 {t.inspection}</button>
        <button onClick={() => setActiveTab('dommages')} className={`px-12 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'dommages' ? 'bg-red-600 text-white shadow-xl shadow-red-100' : 'bg-white text-gray-400 border border-gray-100'}`}>💥 {t.dommages}</button>
      </div>

      {activeTab === 'inspection' ? (
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div>
              <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">{t.history}</h1>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Base de données des états des lieux</p>
            </div>
            <GradientButton onClick={() => setIsCreatingInsp(true)} className="!px-14 !py-7 text-2xl shadow-2xl">+ {t.newBtn}</GradientButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
            {inspections.map(insp => {
              const res = reservations.find(r => r.id === insp.reservationId);
              const veh = vehicles.find(v => v.id === res?.vehicleId);
              const client = customers.find(c => c.id === res?.customerId);
              return (
                <div key={insp.id} className="group bg-white rounded-[4rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden hover:shadow-[0_40px_100px_-25px_rgba(59,130,246,0.15)] hover:-translate-y-4 transition-all duration-700">
                  <div className="relative h-60 overflow-hidden">
                    <img src={veh?.mainImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                       <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase text-white shadow-xl ${insp.type === 'depart' ? 'bg-blue-600' : 'bg-indigo-600'}`}>{insp.type === 'depart' ? 'DÉPART' : 'RETOUR'}</span>
                       <span className="bg-white/90 backdrop-blur-md text-gray-900 font-black text-[10px] uppercase px-4 py-2 rounded-xl shadow-lg">{insp.date}</span>
                    </div>
                  </div>
                  <div className="p-10 space-y-8">
                     <div className="flex items-center gap-6">
                        <img src={client?.profilePicture} className="w-16 h-16 rounded-full bg-gray-100 object-cover border-4 border-gray-50 shadow-sm" />
                        <div className="flex-1 overflow-hidden">
                           <p className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-widest">Client</p>
                           <h4 className="text-xl font-black text-gray-900 truncate">{client?.firstName} {client?.lastName}</h4>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-50">
                        <div>
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">{veh?.brand}</p>
                           <p className="text-sm font-black text-gray-800">{veh?.model}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">KM</p>
                           <p className="text-xl font-black text-gray-900">{insp.mileage.toLocaleString()}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => setViewingInsp(insp)} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><span className="text-xl">👁️</span></button>
                        <button onClick={() => handlePrint(insp.reservationId, insp.type === 'depart' ? 'checkin' : 'checkout')} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-900 hover:text-white transition-all shadow-sm"><span className="text-xl">🖨️</span></button>
                        <button onClick={() => handleDeleteInsp(insp.id)} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><span className="text-xl">🗑️</span></button>
                     </div>
                     <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-50">
                        <button onClick={() => handlePrint(insp.reservationId, 'invoice')} className="text-[8px] font-black bg-gray-50 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all uppercase">Facture</button>
                        <button onClick={() => handlePrint(insp.reservationId, 'contract')} className="text-[8px] font-black bg-gray-50 py-2 rounded-lg hover:bg-yellow-600 hover:text-white transition-all uppercase">Contrat</button>
                        <button onClick={() => handlePrint(insp.reservationId, 'devis')} className="text-[8px] font-black bg-gray-50 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-all uppercase">Devis</button>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 text-center opacity-30">
          <span className="text-9xl mb-10">🚧</span>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Module Dommages</h2>
        </div>
      )}

      {/* --- Detailed Document Print Preview --- */}
      {activePrintModal === 'print-view' && printRes && printTemplate && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in">
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border border-white/20">
              <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl">🖨️</div>
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{t.printTitle}</h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{printTemplate.name} / #{printRes.reservationNumber}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <GradientButton onClick={() => window.print()} className="!px-10 !py-4 shadow-xl">Imprimer</GradientButton>
                    <button onClick={() => setActivePrintModal(null)} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm hover:text-red-500 transition-all">✕</button>
                 </div>
              </div>
              <div className="flex-1 bg-gray-100 p-16 overflow-y-auto custom-scrollbar flex justify-center">
                 <div className="bg-white shadow-2xl relative" style={{ width: `${printTemplate.canvasWidth}px`, height: `${printTemplate.canvasHeight}px` }}>
                    {printTemplate.elements.map((el: any) => (
                      <div key={el.id} className="absolute" style={{
                         left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: el.type === 'divider' ? `${el.height}px` : 'auto',
                         minHeight: `${el.height}px`, fontSize: `${el.fontSize}px`, color: el.color, backgroundColor: el.backgroundColor,
                         fontFamily: el.fontFamily, fontWeight: el.fontWeight as any, textAlign: el.textAlign, borderRadius: `${el.borderRadius}px`,
                         padding: `${el.padding}px`, borderWidth: `${el.borderWidth}px`, borderColor: el.borderColor, opacity: el.opacity,
                         zIndex: el.zIndex, whiteSpace: 'pre-wrap', lineHeight: el.lineHeight
                      }}>
                         {el.type === 'logo' && <div className="w-full h-full flex items-center justify-center font-black opacity-30 uppercase">{el.content}</div>}
                         {el.type === 'qr_code' && <div className="w-10 h-10 border-2 border-gray-900 grid grid-cols-2 gap-0.5 p-0.5"><div className="bg-gray-900"></div><div className="bg-gray-900"></div><div className="bg-gray-900"></div><div></div></div>}
                         {el.type !== 'logo' && el.type !== 'qr_code' && replaceVariables(el.content, printRes)}
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- Detailed Report View Modal --- */}
      {viewingInsp && (() => {
        const res = reservations.find(r => r.id === viewingInsp.reservationId);
        const veh = vehicles.find(v => v.id === res?.vehicleId);
        const client = customers.find(c => c.id === res?.customerId);
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
             <div className="bg-white w-full max-w-6xl rounded-[4rem] shadow-2xl animate-scale-in overflow-hidden max-h-[95vh] flex flex-col border border-white/20">
                <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl">📄</div>
                      <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Rapport d'Inspection</h2>
                   </div>
                   <button onClick={() => setViewingInsp(null)} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm hover:text-red-500 transition-all">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-16 custom-scrollbar">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="p-8 bg-blue-50/50 rounded-[3rem] border border-blue-100 flex items-center gap-8 shadow-sm">
                         <img src={veh?.mainImage} className="w-40 h-28 object-cover rounded-[2rem] shadow-2xl border-4 border-white shrink-0" />
                         <div><h3 className="text-3xl font-black text-gray-900">{veh?.brand} {veh?.model}</h3><p className="text-sm font-black text-blue-700">{veh?.immatriculation}</p></div>
                      </div>
                      <div className="p-8 bg-gray-50/50 rounded-[3rem] border border-gray-100 flex items-center gap-8 shadow-sm">
                         <img src={client?.profilePicture} className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-xl shrink-0" />
                         <div><h3 className="text-2xl font-black text-gray-900">{client?.firstName} {client?.lastName}</h3><p className="text-xs font-bold text-gray-500">📞 {client?.phone}</p></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );
      })()}
    </div>
  );
};

export default OperationsPage;
