import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Language, Vehicle, Reservation, Customer } from '../types';
import GradientButton from '../components/GradientButton';
import * as dataService from '../services/dataService';

interface VehiclesPageProps {
  lang: Language;
  initialVehicles: Vehicle[];
  onUpdateVehicles: (v: Vehicle[]) => void;
}

type ModalType = 'details' | 'history' | 'delete' | null;

interface ImageItem {
  id: string;
  url: string;
  isPrincipal: boolean;
  file?: File;
}

const VehiclesPage: React.FC<VehiclesPageProps> = ({ lang, initialVehicles, onUpdateVehicles }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [activeModal, setActiveModal] = useState<{ type: ModalType; vehicle: Vehicle | null }>({ type: null, vehicle: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [formImages, setFormImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isRtl = lang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load vehicles on mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dataService.getVehicles();
      setVehicles(data);
      onUpdateVehicles(data);
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError(lang === 'fr' ? 'Erreur lors du chargement des véhicules' : 'خطأ في تحميل المركبات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVehicle = async (vehicleData: Vehicle | Omit<Vehicle, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (editingVehicle && 'id' in vehicleData) {
        const updated = await dataService.updateVehicle(editingVehicle.id, vehicleData);
        const newVehicles = vehicles.map(v => v.id === updated.id ? updated : v);
        setVehicles(newVehicles);
        onUpdateVehicles(newVehicles);
      } else {
        const created = await dataService.createVehicle(vehicleData as Omit<Vehicle, 'id'>);
        const newVehicles = [created, ...vehicles];
        setVehicles(newVehicles);
        onUpdateVehicles(newVehicles);
      }
      
      setIsFormOpen(false);
      setEditingVehicle(null);
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setError(lang === 'fr' ? 'Erreur lors de l\'enregistrement' : 'خطأ في الحفظ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    try {
      setIsLoading(true);
      setError(null);
      await dataService.deleteVehicle(vehicle.id);
      const newVehicles = vehicles.filter(v => v.id !== vehicle.id);
      setVehicles(newVehicles);
      onUpdateVehicles(newVehicles);
      setActiveModal({ type: null, vehicle: null });
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError(lang === 'fr' ? 'Erreur lors de la suppression' : 'خطأ في الحذف');
    } finally {
      setIsLoading(false);
    }
  };

  const t = {
    fr: {
      title: 'Gestion de Flotte',
      addBtn: 'Ajouter un véhicule',
      search: 'Rechercher par marque, modèle ou plaque...',
      fuel: 'Carburant', transmission: 'Boîte', seats: 'Places', year: 'Année',
      details: 'Détails', edit: 'Modifier', delete: 'Supprimer', history: 'Historique',
      createTitle: 'Nouveau Véhicule', editTitle: 'Modifier le Véhicule',
      brand: 'Marque', model: 'Modèle', immatriculation: 'Immatriculation', color: 'Couleur',
      chassis: 'Numéro de châssis', dailyRate: 'Tarif journalier', weeklyRate: 'Tarif hebdomadaire',
      monthlyRate: 'Tarif mensuel', deposit: 'Caution', status: 'Statut', mileage: 'Kilométrage',
      expiry: 'Expiration Assurance', techControl: 'Contrôle Technique', insuranceInfo: 'Compagnie Assurance',
      save: 'Enregistrer le véhicule', cancel: 'Annuler', manual: 'Manuelle', auto: 'Automatique',
      essence: 'Essence', diesel: 'Diesel', gpl: 'GPL', doors: 'Portes',
      disposable: 'Disponible à la location', location: 'Emplacement actuel',
      currency: 'DZ', confirmDelete: 'Voulez-vous vraiment supprimer ce véhicule ?',
      mainPhoto: 'Photo Principale', secondaryPhotos: 'Photos Secondaires',
      generalInfo: 'Informations Générales', technicalInfo: 'Fiche Technique',
      pricing: 'Tarification & Caution', fleetStatus: 'État de la Flotte',
      adminDocs: 'Documents & Alertes',
      totalGains: 'Revenus Totaux',
      rentalsCount: 'Nombre de locations',
      client: 'Client',
      dateRange: 'Période',
      amount: 'Montant'
    },
    ar: {
      title: 'إدارة الأسطول',
      addBtn: 'إضافة مركبة',
      search: 'بحث...',
      fuel: 'الوقود', transmission: 'ناقل الحركة', seats: 'مقاعد', year: 'السنة',
      details: 'التفاصيل', edit: 'تعديل', delete: 'حذف', history: 'السجل',
      createTitle: 'مركبة جديدة', editTitle: 'تعديل المركبة',
      brand: 'الماركة', model: 'الطراز', immatriculation: 'الترقيم', color: 'اللون',
      chassis: 'رقم الهيكل', dailyRate: 'السعر اليومي', weeklyRate: 'السعر الأسبوعي',
      monthlyRate: 'السعر الشهري', deposit: 'الضمان', status: 'الحالة', mileage: 'المسافة المقطوعة',
      expiry: 'انتهاء التأمين', techControl: 'الفحص التقني', insuranceInfo: 'شركة التأمين',
      save: 'حفظ المركبة', cancel: 'إلغاء', manual: 'يدوي', auto: 'أوتوماتيك',
      essence: 'بنزين', diesel: 'ديزل', gpl: 'غاز', doors: 'الأبواب',
      disposable: 'متاح للإيجار', location: 'الموقع الحالي',
      currency: 'دج', confirmDelete: 'هل أنت متأكد من حذف هذه المركبة؟',
      mainPhoto: 'الصورة الرئيسية', secondaryPhotos: 'صور إضافية',
      generalInfo: 'معلومات عامة', technicalInfo: 'البطاقة التقنية',
      pricing: 'الأسعار والضمان', fleetStatus: 'حالة الأسطول',
      adminDocs: 'الوثائق والتنبيهات',
      totalGains: 'إجمالي المداخيل',
      rentalsCount: 'عدد الإيجارات',
      client: 'الزبون',
      dateRange: 'الفترة',
      amount: 'المبلغ'
    }
  };

  const currentT = t[lang];

  const handleOpenForm = (vehicle: Vehicle | null = null) => {
    setEditingVehicle(vehicle);
    if (vehicle) {
      const imgs: ImageItem[] = [
        { id: 'main', url: vehicle.mainImage, isPrincipal: true },
        ...vehicle.secondaryImages.map((url, i) => ({ id: `sec-${i}`, url, isPrincipal: false }))
      ];
      setFormImages(imgs);
    } else {
      setFormImages([]);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingVehicle(null);
    setFormImages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImgs: ImageItem[] = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        isPrincipal: formImages.length === 0,
        file: file
      }));
      setFormImages([...formImages, ...newImgs]);
    }
  };

  const setAsPrincipal = (id: string) => {
    setFormImages(formImages.map(img => ({ ...img, isPrincipal: img.id === id })));
  };

  const removeImage = (id: string) => {
    setFormImages(formImages.filter(img => img.id !== id));
  };

  const filteredVehicles = initialVehicles.filter(v => 
    v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.immatriculation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    onUpdateVehicles(initialVehicles.filter(v => v.id !== id));
    setActiveModal({ type: null, vehicle: null });
  };

  const SectionHeader = ({ title, icon, color }: { title: string; icon: string; color: string }) => (
    <div className={`flex items-center gap-4 border-b pb-4 mb-8 ${color}`}>
      <span className="text-3xl">{icon}</span>
      <h3 className="text-xl font-black uppercase tracking-widest">{title}</h3>
    </div>
  );

  // --- Modals ---

  const DetailsModal = ({ vehicle }: { vehicle: Vehicle }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-6xl rounded-[4rem] overflow-hidden shadow-2xl animate-scale-in border border-white/20">
        <div className="flex flex-col lg:flex-row h-[90vh]">
          {/* Left: Gallery */}
          <div className="lg:w-1/2 bg-gray-50 p-10 overflow-y-auto custom-scrollbar border-r">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl mb-8 group">
              <img src={vehicle.mainImage} className="w-full aspect-[16/10] object-cover transition-transform duration-[2s] group-hover:scale-110" />
              <div className="absolute top-6 right-6 bg-blue-600 text-white px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">{currentT.mainPhoto}</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {vehicle.secondaryImages.map((url, i) => (
                <div key={i} className="rounded-[2rem] overflow-hidden shadow-lg border-4 border-white hover:scale-105 transition-transform cursor-pointer">
                  <img src={url} className="w-full aspect-square object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detailed Info */}
          <div className="lg:w-1/2 p-12 overflow-y-auto relative bg-white custom-scrollbar">
            <button onClick={() => setActiveModal({ type: null, vehicle: null })} className="absolute top-8 right-8 w-14 h-14 flex items-center justify-center bg-gray-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all text-2xl z-10">✕</button>
            
            <div className="mb-12 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${vehicle.status === 'disponible' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{vehicle.status}</span>
                <span className="px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{vehicle.year}</span>
              </div>
              <h2 className="text-5xl font-black text-gray-900 leading-tight">{vehicle.brand} <span className="text-blue-600">{vehicle.model}</span></h2>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-3xl">📍</span>
                <p className="text-gray-400 font-bold text-xl">{vehicle.currentLocation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12">
              {[
                { label: currentT.fuel, value: vehicle.fuelType.toUpperCase(), icon: '⛽', color: 'text-orange-600 bg-orange-50' },
                { label: currentT.transmission, value: vehicle.transmission, icon: '⚙️', color: 'text-indigo-600 bg-indigo-50' },
                { label: currentT.seats, value: `${vehicle.seats} Places`, icon: '👥', color: 'text-blue-600 bg-blue-50' },
                { label: currentT.doors, value: `${vehicle.doors} Portes`, icon: '🚪', color: 'text-purple-600 bg-purple-50' },
                { label: currentT.mileage, value: `${vehicle.mileage.toLocaleString()} KM`, icon: '🛣️', color: 'text-green-600 bg-green-50' },
                { label: currentT.immatriculation, value: vehicle.immatriculation, icon: '🏷️', color: 'text-red-600 bg-red-50' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 hover:border-blue-200 transition-colors">
                  <span className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl shadow-sm ${item.color}`}>{item.icon}</span>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-base font-black text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] border-b pb-4">Tarification</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-6 bg-blue-600 rounded-3xl text-white text-center shadow-xl">
                  <p className="text-[9px] font-black uppercase opacity-60 mb-2">Jour</p>
                  <p className="text-xl font-black">{vehicle.dailyRate} <span className="text-xs">{currentT.currency}</span></p>
                </div>
                <div className="p-6 bg-indigo-600 rounded-3xl text-white text-center shadow-xl">
                  <p className="text-[9px] font-black uppercase opacity-60 mb-2">Semaine</p>
                  <p className="text-xl font-black">{vehicle.weeklyRate} <span className="text-xs">{currentT.currency}</span></p>
                </div>
                <div className="p-6 bg-black rounded-3xl text-white text-center shadow-xl">
                  <p className="text-[9px] font-black uppercase opacity-60 mb-2">Mois</p>
                  <p className="text-xl font-black">{vehicle.monthlyRate} <span className="text-xs">{currentT.currency}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const HistoryModal = ({ vehicle }: { vehicle: Vehicle }) => {
    const vehicleRentals = useMemo(() => {
      return MOCK_RESERVATIONS.filter(r => r.vehicleId === vehicle.id);
    }, [vehicle.id]);

    const totalRevenue = useMemo(() => {
      return vehicleRentals.reduce((acc, r) => acc + r.totalAmount, 0);
    }, [vehicleRentals]);

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="bg-white w-full max-w-4xl rounded-[4rem] overflow-hidden shadow-2xl animate-scale-in p-12 border border-white/20">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl shadow-xl">📜</div>
              <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{currentT.history}</h2>
                <p className="text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">{vehicle.brand} {vehicle.model} - {vehicle.immatriculation}</p>
              </div>
            </div>
            <button onClick={() => setActiveModal({ type: null, vehicle: null })} className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-200 transition-colors text-2xl shadow-inner">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-7xl font-black rotate-12 transition-transform group-hover:scale-125">DZ</div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{currentT.totalGains}</p>
              <p className="text-5xl font-black">{totalRevenue.toLocaleString()} <span className="text-2xl">{currentT.currency}</span></p>
            </div>
            <div className="bg-white border-2 border-gray-100 p-8 rounded-[3rem] shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.rentalsCount}</p>
              <p className="text-5xl font-black text-gray-900">{vehicleRentals.length}</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {vehicleRentals.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <span className="text-6xl mb-6 block">📂</span>
                <p className="text-xl font-black uppercase tracking-widest">Aucune location enregistrée</p>
              </div>
            ) : (
              vehicleRentals.slice().reverse().map((res, i) => {
                const client = vehicles[0]?.currentRentals?.find(r => r.id === res.customerId) ? 
                  { id: res.customerId, firstName: 'Cliente', lastName: res.customerId, profilePicture: '👤' } : 
                  { id: res.customerId, firstName: 'Cliente', lastName: res.customerId, profilePicture: '👤' };
                return (
                  <div key={i} className="group flex items-center justify-between p-7 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-blue-400 transition-all hover:bg-white hover:shadow-xl">
                    <div className="flex items-center gap-6">
                      <img src={typeof client?.profilePicture === 'string' && client.profilePicture.startsWith('http') ? client?.profilePicture : '👤'} className="w-16 h-16 rounded-full bg-white object-cover border-4 border-white shadow-md group-hover:scale-110 transition-transform" alt={client?.firstName} />
                      <div>
                        <p className="font-black text-gray-900 text-xl group-hover:text-blue-600 transition-colors">{client?.firstName} {client?.lastName}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {new Date(res.startDate).toLocaleDateString()} - {new Date(res.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{currentT.amount}</p>
                       <p className="font-black text-blue-600 text-2xl">{res.totalAmount.toLocaleString()} <span className="text-sm">{currentT.currency}</span></p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- Form View ---

  if (isFormOpen) {
    return (
      <div className={`p-4 md:p-8 animate-fade-in ${isRtl ? 'font-arabic text-right' : ''}`}>
        <div className="max-w-6xl mx-auto bg-white rounded-[4rem] shadow-[0_32px_120px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
           <div className="p-8 md:p-16">
             <div className="flex items-center justify-between mb-16 border-b border-gray-50 pb-12">
               <h2 className="text-6xl font-black text-gray-900 tracking-tighter">
                {editingVehicle ? currentT.editTitle : currentT.createTitle}
               </h2>
               <button onClick={handleCloseForm} className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-3xl shadow-inner">✕</button>
             </div>

             <form className="space-y-20" onSubmit={(e) => { e.preventDefault(); handleCloseForm(); }}>
                {/* Section 1: General Info */}
                <section>
                   <SectionHeader title={currentT.generalInfo} icon="🏷️" color="text-blue-600" />
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.brand}</label>
                        <input type="text" defaultValue={editingVehicle?.brand} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" placeholder="Ex: Volkswagen" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.model}</label>
                        <input type="text" defaultValue={editingVehicle?.model} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" placeholder="Ex: Golf 8" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.immatriculation}</label>
                        <input type="text" defaultValue={editingVehicle?.immatriculation} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" placeholder="00000-123-00" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.year}</label>
                        <input type="number" defaultValue={editingVehicle?.year} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" placeholder="2024" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.color}</label>
                        <input type="text" defaultValue={editingVehicle?.color} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" placeholder="Noir Saphir" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.chassis}</label>
                        <input type="text" defaultValue={editingVehicle?.chassisNumber} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" placeholder="VIN..." required />
                      </div>
                   </div>
                </section>

                {/* Section 2: Technical Info */}
                <section>
                   <SectionHeader title={currentT.technicalInfo} icon="⚙️" color="text-indigo-600" />
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.fuel}</label>
                        <select defaultValue={editingVehicle?.fuelType} className="w-full px-8 py-5 bg-gray-50 rounded-3xl outline-none font-black text-lg appearance-none cursor-pointer border-2 border-transparent focus:bg-white focus:border-blue-500 shadow-inner">
                          <option value="essence">{currentT.essence}</option>
                          <option value="diesel">{currentT.diesel}</option>
                          <option value="gpl">{currentT.gpl}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.transmission}</label>
                        <select defaultValue={editingVehicle?.transmission} className="w-full px-8 py-5 bg-gray-50 rounded-3xl outline-none font-black text-lg appearance-none cursor-pointer border-2 border-transparent focus:bg-white focus:border-blue-500 shadow-inner">
                          <option value="manuelle">{currentT.manual}</option>
                          <option value="automatique">{currentT.auto}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.seats}</label>
                        <input type="number" defaultValue={editingVehicle?.seats} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.doors}</label>
                        <input type="number" defaultValue={editingVehicle?.doors} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" required />
                      </div>
                   </div>
                </section>

                {/* Section 3: Pricing & Deposit */}
                <section>
                   <SectionHeader title={currentT.pricing} icon="💰" color="text-green-600" />
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-green-50/30 p-10 rounded-[3rem] border border-green-100 shadow-inner">
                      <div>
                        <label className="block text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 px-2">{currentT.dailyRate}</label>
                        <input type="number" defaultValue={editingVehicle?.dailyRate} className="w-full px-8 py-5 bg-white border-2 border-transparent focus:border-green-500 rounded-3xl outline-none font-black text-2xl text-green-700 transition-all shadow-sm" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 px-2">{currentT.weeklyRate}</label>
                        <input type="number" defaultValue={editingVehicle?.weeklyRate} className="w-full px-8 py-5 bg-white border-2 border-transparent focus:border-green-500 rounded-3xl outline-none font-black text-2xl text-green-700 transition-all shadow-sm" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 px-2">{currentT.monthlyRate}</label>
                        <input type="number" defaultValue={editingVehicle?.monthlyRate} className="w-full px-8 py-5 bg-white border-2 border-transparent focus:border-green-500 rounded-3xl outline-none font-black text-2xl text-green-700 transition-all shadow-sm" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.deposit}</label>
                        <input type="number" defaultValue={editingVehicle?.deposit} className="w-full px-8 py-5 bg-gray-900 text-white rounded-3xl outline-none font-black text-2xl shadow-2xl" required />
                      </div>
                   </div>
                </section>

                {/* Section 4: Fleet Status */}
                <section>
                   <SectionHeader title={currentT.fleetStatus} icon="📊" color="text-orange-600" />
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.status}</label>
                        <select defaultValue={editingVehicle?.status} className="w-full px-8 py-5 bg-gray-50 rounded-3xl outline-none font-black text-lg appearance-none cursor-pointer border-2 border-transparent focus:bg-white focus:border-blue-500 shadow-inner">
                          <option value="disponible">{lang === 'fr' ? 'Disponible' : 'متاح'}</option>
                          <option value="loué">{lang === 'fr' ? 'Loué' : 'مؤجر'}</option>
                          <option value="maintenance">{lang === 'fr' ? 'Maintenance' : 'صيانة'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.location}</label>
                        <select defaultValue={editingVehicle?.currentLocation} className="w-full px-8 py-5 bg-gray-50 rounded-3xl outline-none font-black text-lg appearance-none cursor-pointer border-2 border-transparent focus:bg-white focus:border-blue-500 shadow-inner">
                           <option value="Branch 1">Branch 1</option>
                           <option value="Branch 2">Branch 2</option>
                           <option value="Branch 3">Branch 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.mileage}</label>
                        <input type="number" defaultValue={editingVehicle?.mileage} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" required />
                      </div>
                   </div>
                </section>

                {/* Section 5: Admin Docs */}
                <section>
                   <SectionHeader title={currentT.adminDocs} icon="📄" color="text-red-600" />
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.expiry}</label>
                        <input type="date" defaultValue={editingVehicle?.insuranceExpiry} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.techControl}</label>
                        <input type="date" defaultValue={editingVehicle?.techControlDate} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">{currentT.insuranceInfo}</label>
                        <input type="text" defaultValue={editingVehicle?.insuranceInfo} className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl outline-none font-black text-lg transition-all shadow-inner" placeholder="Ex: Alliance Assurance - Formule Tous Risques" required />
                      </div>
                   </div>
                </section>

                {/* Section 6: Photos */}
                <section>
                   <SectionHeader title="Media & Photos" icon="📸" color="text-purple-600" />
                   <div className="p-12 bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-200">
                      <div className="flex flex-col items-center text-center gap-8">
                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-5xl shadow-xl">🖼️</div>
                        <div>
                           <h3 className="text-2xl font-black text-gray-900">Ajouter des photos du véhicule</h3>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">La première photo sera utilisée comme vignette principale</p>
                        </div>
                        <input type="file" multiple ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        <GradientButton type="button" onClick={() => fileInputRef.current?.click()} className="!py-5 !px-14 text-xl rounded-2xl shadow-xl">Choisir les fichiers</GradientButton>
                        
                        {formImages.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 w-full mt-10">
                            {formImages.map((img) => (
                              <div key={img.id} className={`group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 transition-all ${img.isPrincipal ? 'border-blue-600 scale-110' : 'border-white hover:scale-105'}`}>
                                <img src={img.url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                  {!img.isPrincipal && <button type="button" onClick={() => setAsPrincipal(img.id)} className="bg-white text-blue-600 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-xl">★ Principal</button>}
                                  <button type="button" onClick={() => removeImage(img.id)} className="bg-red-600 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-xl">Supprimer</button>
                                </div>
                                {img.isPrincipal && <div className="absolute bottom-4 left-0 right-0 text-center"><span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl">Principale</span></div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                   </div>
                </section>

                <div className="flex justify-end gap-6 pt-12 border-t border-gray-100">
                  <button type="button" onClick={handleCloseForm} className="px-14 py-5 text-sm font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-all rounded-[2rem]">{currentT.cancel}</button>
                  <GradientButton type="submit" className="!px-24 !py-7 text-3xl rounded-[2.5rem] shadow-2xl shadow-blue-100">{currentT.save}</GradientButton>
                </div>
             </form>
           </div>
        </div>
      </div>
    );
  }

  // --- Grid View ---

  return (
    <div className={`p-4 md:p-8 animate-fade-in ${isRtl ? 'font-arabic text-right' : ''}`}>
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-10 mb-20 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">{currentT.title}</h1>
          <div className="flex items-center gap-3 text-gray-500 font-bold uppercase text-xs tracking-widest">
            <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
            {filteredVehicles.length} Véhicules en stock
          </div>
        </div>
        
        <div className={`flex flex-col sm:flex-row items-center gap-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="relative group w-full sm:w-[450px]">
            <span className={`absolute inset-y-0 ${isRtl ? 'right-6' : 'left-6'} flex items-center text-gray-400 group-focus-within:text-blue-600 transition-colors text-2xl`}>🔍</span>
            <input 
              type="text" 
              placeholder={currentT.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRtl ? 'pr-16 pl-6 text-right' : 'pl-16 pr-6'} py-6 bg-white border-2 border-gray-100 focus:border-blue-600 rounded-[2.5rem] text-lg font-bold transition-all outline-none shadow-sm hover:shadow-2xl`}
            />
          </div>
          <GradientButton onClick={() => handleOpenForm()} className="w-full sm:w-auto !py-6 !px-14 text-2xl shadow-2xl hover:scale-105 transition-transform rounded-[2rem]">
            + {currentT.addBtn}
          </GradientButton>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-12">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="group bg-white rounded-[4rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden hover:shadow-[0_50px_120px_-30px_rgba(59,130,246,0.2)] hover:-translate-y-4 transition-all duration-700 flex flex-col h-full">
            {/* Card Media */}
            <div className="relative h-72 overflow-hidden bg-gray-100">
              <img src={vehicle.mainImage} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
              <div className="absolute top-6 left-6 flex gap-2">
                 <div className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white shadow-xl ${vehicle.status === 'disponible' ? 'bg-green-600' : 'bg-red-600'}`}>{vehicle.status}</div>
                 <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-900 shadow-xl">{vehicle.year}</div>
              </div>
              <div className={`absolute bottom-6 ${isRtl ? 'left-6' : 'right-6'} flex -space-x-4`}>
                 {vehicle.secondaryImages.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform">
                       <img src={img} className="w-full h-full object-cover" />
                    </div>
                 ))}
                 {vehicle.secondaryImages.length > 3 && (
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-900 flex items-center justify-center text-[8px] font-black text-white shadow-lg">+{vehicle.secondaryImages.length - 3}</div>
                 )}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-10 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight truncate">
                    {vehicle.brand} <span className="opacity-40">{vehicle.model}</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="text-xs">📍</span>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{vehicle.currentLocation}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{currentT.currency} / JOUR</p>
                   <p className="text-3xl font-black text-gray-900 leading-none">{vehicle.dailyRate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-5 rounded-[2.5rem] bg-gray-50 flex items-center gap-4 border border-transparent hover:border-blue-100 transition-all">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{currentT.transmission}</p>
                    <p className="text-xs font-black text-gray-800 uppercase">{vehicle.transmission.slice(0, 4)}.</p>
                  </div>
                </div>
                <div className="p-5 rounded-[2.5rem] bg-gray-50 flex items-center gap-4 border border-transparent hover:border-blue-100 transition-all">
                  <span className="text-2xl">⛽</span>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{currentT.fuel}</p>
                    <p className="text-xs font-black text-gray-800 uppercase">{vehicle.fuelType}</p>
                  </div>
                </div>
                <div className="p-5 rounded-[2.5rem] bg-gray-50 flex items-center gap-4 border border-transparent hover:border-blue-100 transition-all">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{currentT.seats}</p>
                    <p className="text-xs font-black text-gray-800 uppercase">{vehicle.seats} Pers.</p>
                  </div>
                </div>
                <div className="p-5 rounded-[2.5rem] bg-gray-50 flex items-center gap-4 border border-transparent hover:border-blue-100 transition-all">
                  <span className="text-2xl">🛣️</span>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{currentT.mileage}</p>
                    <p className="text-xs font-black text-gray-800 uppercase">{vehicle.mileage.toLocaleString()} KM</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto space-y-4 pt-4 border-t border-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setActiveModal({ type: 'details', vehicle })} className="py-4.5 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center justify-center gap-3">
                    🔍 {currentT.details}
                  </button>
                  <button onClick={() => setActiveModal({ type: 'history', vehicle })} className="py-4.5 rounded-2xl bg-gray-50 text-gray-500 hover:bg-black hover:text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center justify-center gap-3">
                    📜 {currentT.history}
                  </button>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleOpenForm(vehicle)} className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-500 hover:bg-indigo-600 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3">✏️ {currentT.edit}</button>
                  <button onClick={() => setActiveModal({ type: 'delete', vehicle })} className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-500 hover:bg-red-600 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3">🗑️ {currentT.delete}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals Rendering */}
      {activeModal.type === 'details' && activeModal.vehicle && <DetailsModal vehicle={activeModal.vehicle} />}
      {activeModal.type === 'history' && activeModal.vehicle && <HistoryModal vehicle={activeModal.vehicle} />}
      {activeModal.type === 'delete' && activeModal.vehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
           <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl animate-scale-in p-12 text-center">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">⚠️</div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">{currentT.confirmDelete}</h3>
              <p className="text-gray-500 font-bold mb-10 leading-relaxed uppercase tracking-tighter">
                {activeModal.vehicle.brand} {activeModal.vehicle.model}<br/>
                <span className="text-red-600 font-black">{activeModal.vehicle.immatriculation}</span>
              </p>
              <div className="flex gap-4">
                <button onClick={() => setActiveModal({ type: null, vehicle: null })} className="flex-1 py-5 bg-gray-100 rounded-[1.5rem] font-black text-gray-500 hover:bg-gray-200 transition-all uppercase text-[10px] tracking-widest">{currentT.cancel}</button>
                <button onClick={() => handleDelete(activeModal.vehicle!.id)} className="flex-1 py-5 bg-red-600 rounded-[1.5rem] font-black text-white hover:bg-red-700 transition-all shadow-xl shadow-red-100 uppercase text-[10px] tracking-widest">{currentT.delete}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;
