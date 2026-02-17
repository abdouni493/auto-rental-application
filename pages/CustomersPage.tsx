
import React, { useState, useRef, useEffect } from 'react';
import { Language, Customer } from '../types';
import { ALGERIAN_WILAYAS } from '../constants';
import GradientButton from '../components/GradientButton';
import * as dataService from '../services/dataService';

interface CustomersPageProps {
  lang: Language;
}

type ModalType = 'details' | 'history' | 'delete' | null;

const CustomersPage: React.FC<CustomersPageProps> = ({ lang }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeModal, setActiveModal] = useState<{ type: ModalType; customer: Customer | null }>({ type: null, customer: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [docPreviews, setDocPreviews] = useState<string[]>([]);
  
  const isRtl = lang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dataService.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError(lang === 'fr' ? 'Erreur lors du chargement des clients' : 'خطأ في تحميل الزبائن');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomer = async (customerData: Customer | Omit<Customer, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (editingCustomer && 'id' in customerData) {
        const updated = await dataService.updateCustomer(editingCustomer.id, customerData);
        const newCustomers = customers.map(c => c.id === updated.id ? updated : c);
        setCustomers(newCustomers);
      } else {
        const created = await dataService.createCustomer(customerData as Omit<Customer, 'id'>);
        const newCustomers = [created, ...customers];
        setCustomers(newCustomers);
      }
      
      setIsFormOpen(false);
      setEditingCustomer(null);
    } catch (err) {
      console.error('Error saving customer:', err);
      setError(lang === 'fr' ? 'Erreur lors de l\'enregistrement' : 'خطأ في الحفظ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      setIsLoading(true);
      setError(null);
      await dataService.deleteCustomer(customer.id);
      const newCustomers = customers.filter(c => c.id !== customer.id);
      setCustomers(newCustomers);
      setActiveModal({ type: null, customer: null });
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(lang === 'fr' ? 'Erreur lors de la suppression' : 'خطأ في الحذف');
    } finally {
      setIsLoading(false);
    }
  };

  const t = {
    fr: {
      title: 'Gestion des Clients',
      addBtn: 'Ajouter un client',
      search: 'Rechercher par nom, téléphone...',
      firstName: 'Prénom',
      lastName: 'Nom',
      phone: 'Numéro de téléphone',
      email: 'E-mail (optionnel)',
      idCard: 'N° Carte d\'identité',
      wilaya: 'Wilaya',
      address: 'Adresse',
      license: 'N° Permis de conduire',
      licenseExp: 'Expiration Permis',
      reservations: 'Réservations',
      spending: 'Total Dépensé',
      details: 'Voir Détails',
      edit: 'Modifier',
      delete: 'Supprimer',
      history: 'Historique',
      createTitle: 'Nouveau Client',
      editTitle: 'Modifier le Client',
      profilePic: 'Photo de profil (optionnel)',
      docs: 'Documents numérisés (ID, Permis)',
      save: 'Enregistrer',
      cancel: 'Annuler',
      confirmDelete: 'Voulez-vous vraiment supprimer ce client ?',
      currency: 'DZ',
      totalSpentLabel: 'Total Dépenses',
      resHistory: 'Historique des Réservations',
      vehicle: 'Véحicule',
      date: 'Date',
      amount: 'Montant',
      noDocs: 'Aucun document numérisé',
      optional: '(optionnel)',
      chooseFiles: 'Choisir des fichiers',
      personalInfo: 'Informations Personnelles',
      officialDocs: 'Documents Officiels'
    },
    ar: {
      title: 'إدارة الزبائن',
      addBtn: 'إضافة زبون',
      search: 'بحث بالاسم، الهاتف...',
      firstName: 'الاسم الأول',
      lastName: 'اللقب',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني (اختياري)',
      idCard: 'رقم بطاقة التعريف',
      wilaya: 'الولاية',
      address: 'العنوان',
      license: 'رقم رخصة السياقة',
      licenseExp: 'انتهاء الرخصة',
      reservations: 'الحجوزات',
      spending: 'إجمالي الإنفاق',
      details: 'التفاصيل',
      edit: 'تعديل',
      delete: 'حذف',
      history: 'السجل',
      createTitle: 'زبون جديد',
      editTitle: 'تعديل الزبون',
      profilePic: 'صورة الملف (اختياري)',
      docs: 'المستندات الممسوحة (الهوية، الرخصة)',
      save: 'حفظ',
      cancel: 'إلغاء',
      confirmDelete: 'هل أنت متأكد من حذف هذا الزبون؟',
      currency: 'دج',
      totalSpentLabel: 'إجمالي المصاريف',
      resHistory: 'سجل الحجوزات',
      vehicle: 'المركبة',
      date: 'التاريخ',
      amount: 'المبلغ',
      noDocs: 'لا توجد مستندات',
      optional: '(اختياري)',
      chooseFiles: 'اختيار ملفات',
      personalInfo: 'المعلومات الشخصية',
      officialDocs: 'الوثائق الرسمية'
    }
  };

  const currentT = t[lang];

  const handleOpenForm = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    if (customer) {
      setProfilePreview(customer.profilePicture || null);
      setDocPreviews(customer.documentImages);
    } else {
      setProfilePreview(null);
      setDocPreviews([]);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDocsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fix: Added explicit type (file: File) to handle TypeScript inference issue
      const newDocs = Array.from(e.target.files).map((file: File) => URL.createObjectURL(file));
      setDocPreviews([...docPreviews, ...newDocs]);
    }
  };

  const filteredCustomers = customers.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setActiveModal({ type: null, customer: null });
  };

  // --- Modals ---

  const DetailsModal = ({ customer }: { customer: Customer }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl animate-scale-in flex flex-col md:flex-row h-[90vh]">
        {/* Gallery/Docs Side */}
        <div className="md:w-1/3 bg-gray-50 p-10 flex flex-col items-center border-r border-gray-100 overflow-y-auto custom-scrollbar">
          <div className="w-48 h-48 rounded-full border-8 border-white shadow-2xl overflow-hidden mb-8 flex-shrink-0">
            <img src={customer.profilePicture || 'https://via.placeholder.com/200'} className="w-full h-full object-cover" alt="Profile" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10 leading-tight">{customer.firstName}<br/>{customer.lastName}</h2>
          
          <div className="w-full space-y-6">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">{currentT.docs}</h4>
            {customer.documentImages.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {customer.documentImages.map((url, i) => (
                  <div key={i} className="group relative rounded-3xl overflow-hidden shadow-lg border border-gray-200">
                    <img src={url} className="w-full object-cover transition-transform group-hover:scale-105" alt={`Doc ${i}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 bg-gray-200/50 rounded-[2rem] border-4 border-dashed border-gray-300 text-center text-gray-400 text-sm font-black uppercase tracking-widest">
                {currentT.noDocs}
              </div>
            )}
          </div>
        </div>

        {/* Info Side */}
        <div className="md:w-2/3 p-12 overflow-y-auto relative bg-white custom-scrollbar">
          <button onClick={() => setActiveModal({ type: null, customer: null })} className="absolute top-8 right-8 w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all text-2xl z-10">✕</button>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 pt-4">
            {[
              { label: currentT.phone, value: customer.phone, icon: '📞', color: 'bg-blue-50 text-blue-600' },
              { label: currentT.email, value: customer.email || '-', icon: '📧', color: 'bg-purple-50 text-purple-600' },
              { label: currentT.idCard, value: customer.idCardNumber, icon: '🆔', color: 'bg-orange-50 text-orange-600' },
              { label: currentT.wilaya, value: customer.wilaya, icon: '📍', color: 'bg-red-50 text-red-600' },
              { label: currentT.address, value: customer.address || '-', icon: '🏠', color: 'bg-indigo-50 text-indigo-600' },
              { label: currentT.license, value: customer.licenseNumber, icon: '🪪', color: 'bg-green-50 text-green-600' },
              { label: currentT.licenseExp, value: customer.licenseExpiry, icon: '📅', color: 'bg-pink-50 text-pink-600' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 p-7 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 hover:border-blue-200 transition-colors">
                <span className={`w-14 h-14 flex items-center justify-center rounded-2xl text-2xl ${item.color} shadow-sm`}>{item.icon}</span>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-base font-black text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] text-white shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-8">
            <div className="text-center sm:text-left">
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-3">{currentT.totalSpentLabel}</p>
              <p className="text-5xl font-black">{customer.totalSpent.toLocaleString()} <span className="text-2xl opacity-70">{currentT.currency}</span></p>
            </div>
            <div className="w-px h-16 bg-white/20 hidden sm:block"></div>
            <div className="text-center sm:text-right">
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-3">{currentT.reservations}</p>
              <p className="text-5xl font-black">{customer.totalReservations}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const HistoryModal = ({ customer }: { customer: Customer }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl animate-scale-in p-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900">📜 {currentT.history}</h2>
            <p className="text-gray-500 font-bold mt-1">{customer.firstName} {customer.lastName}</p>
          </div>
          <button onClick={() => setActiveModal({ type: null, customer: null })} className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">✕</button>
        </div>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {[
            { vehicle: 'VW Golf 8 R-Line', date: '01 Mar - 05 Mar 2024', amount: '35,000' },
            { vehicle: 'Dacia Duster Journey', date: '15 Feb - 25 Feb 2024', amount: '82,000' },
            { vehicle: 'BMW Serie 4 Gran Coupé', date: '10 Jan - 15 Jan 2024', amount: '42,000' },
          ].map((item, i) => (
            <div key={i} className="group flex items-center justify-between p-7 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-blue-400 transition-all hover:bg-white hover:shadow-xl">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">🚗</div>
                <div>
                  <p className="font-black text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{item.vehicle}</p>
                  <p className="text-xs font-bold text-gray-400">{item.date}</p>
                </div>
              </div>
              <p className="font-black text-blue-600 text-xl">{item.amount} {currentT.currency}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DeleteModal = ({ customer }: { customer: Customer }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl animate-scale-in p-12 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">⚠️</div>
        <h3 className="text-2xl font-black text-gray-900 mb-4">{currentT.confirmDelete}</h3>
        <p className="text-gray-500 font-bold mb-10 leading-relaxed">
          {customer.firstName} <span className="text-red-600">{customer.lastName}</span><br/>
          <span className="text-xs uppercase tracking-widest opacity-60 font-black">{customer.phone}</span>
        </p>
        <div className="flex gap-4">
          <button onClick={() => setActiveModal({ type: null, customer: null })} className="flex-1 py-5 bg-gray-100 rounded-[1.5rem] font-black text-gray-500 hover:bg-gray-200 transition-all uppercase text-xs tracking-widest">{currentT.cancel}</button>
          <button onClick={() => handleDelete(customer.id)} className="flex-1 py-5 bg-red-600 rounded-[1.5rem] font-black text-white hover:bg-red-700 transition-all shadow-xl shadow-red-100 uppercase text-xs tracking-widest">{currentT.delete}</button>
        </div>
      </div>
    </div>
  );

  // --- Form View ---

  if (isFormOpen) {
    return (
      <div className={`p-4 md:p-8 animate-fade-in ${isRtl ? 'font-arabic text-right' : ''}`}>
        <div className="max-w-6xl mx-auto bg-white rounded-[3.5rem] shadow-[0_32px_120px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
          <div className="p-8 md:p-14">
            <div className="flex items-center justify-between mb-12 border-b border-gray-50 pb-12">
              <h2 className="text-5xl font-black text-gray-900 flex items-center gap-6">
                <span className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl shadow-blue-200">
                  {editingCustomer ? '✏️' : '👤'}
                </span>
                {editingCustomer ? currentT.editTitle : currentT.createTitle}
              </h2>
              <button onClick={handleCloseForm} className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all text-3xl shadow-inner">✕</button>
            </div>
            
            <form className="space-y-16" onSubmit={(e) => { e.preventDefault(); handleCloseForm(); }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Left Side: General Info */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 text-blue-600 border-b border-blue-50 pb-4">
                    <span className="text-3xl">🪪</span>
                    <h3 className="text-xl font-black uppercase tracking-widest">{currentT.personalInfo}</h3>
                  </div>

                  {/* Profile Pic Upload */}
                  <div className="flex flex-col items-center gap-6 p-10 bg-gray-50 rounded-[3rem] border border-gray-100 shadow-inner">
                    <div className="relative group w-40 h-40">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-white flex items-center justify-center">
                        {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" /> : <span className="text-6xl">👤</span>}
                      </div>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border-4 border-white">📸</button>
                      <input type="file" ref={fileInputRef} onChange={handleProfileUpload} className="hidden" accept="image/*" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{currentT.profilePic}</p>
                      <p className="text-[10px] font-bold text-blue-500">{currentT.chooseFiles}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">{currentT.firstName}</label>
                      <input type="text" defaultValue={editingCustomer?.firstName} className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-[2rem] outline-none font-black transition-all shadow-inner" placeholder="Karim" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">{currentT.lastName}</label>
                      <input type="text" defaultValue={editingCustomer?.lastName} className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-[2rem] outline-none font-black transition-all shadow-inner" placeholder="Benali" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">{currentT.phone}</label>
                      <input type="tel" defaultValue={editingCustomer?.phone} className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-[2rem] outline-none font-black transition-all shadow-inner" placeholder="0550..." required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">{currentT.email}</label>
                      <input type="email" defaultValue={editingCustomer?.email} className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-[2rem] outline-none font-black transition-all shadow-inner" placeholder="email@example.dz" />
                    </div>
                  </div>
                </div>

                {/* Right Side: Docs & Location */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 text-orange-600 border-b border-orange-50 pb-4">
                    <span className="text-3xl">📄</span>
                    <h3 className="text-xl font-black uppercase tracking-widest">{currentT.officialDocs}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">{currentT.idCard}</label>
                      <input type="text" defaultValue={editingCustomer?.idCardNumber} className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-[2rem] outline-none font-black transition-all shadow-inner" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">{currentT.wilaya}</label>
                      <select 
                        defaultValue={editingCustomer?.wilaya || "16 - Alger"} 
                        className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-[2rem] outline-none font-black transition-all shadow-inner appearance-none cursor-pointer"
                        required
                      >
                        {ALGERIAN_WILAYAS.map((wilaya) => (
                          <option key={wilaya} value={wilaya}>{wilaya}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">{currentT.address}</label>
                    <input type="text" defaultValue={editingCustomer?.address} className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-[2rem] outline-none font-black transition-all shadow-inner" placeholder="Cité 500 Logements..." />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">{currentT.license}</label>
                      <input type="text" defaultValue={editingCustomer?.licenseNumber} className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-[2rem] outline-none font-black transition-all shadow-inner" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">{currentT.licenseExp}</label>
                      <input type="date" defaultValue={editingCustomer?.licenseExpiry} className="w-full px-7 py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-[2rem] outline-none font-black transition-all shadow-inner" required />
                    </div>
                  </div>

                  {/* Documents Upload Section */}
                  <div className="p-10 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <div className="flex flex-col items-center text-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md">📑</div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{currentT.docs}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">PNG, JPG, PDF (Max 5MB)</p>
                      </div>
                      <input type="file" multiple ref={docInputRef} onChange={handleDocsUpload} className="hidden" accept="image/*" />
                      <GradientButton type="button" onClick={() => docInputRef.current?.click()} className="!py-4 !px-10 text-base rounded-2xl">
                        {currentT.chooseFiles}
                      </GradientButton>

                      {docPreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full mt-10">
                          {docPreviews.map((url, i) => (
                            <div key={i} className="group relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white transition-all hover:scale-105 hover:rotate-2">
                              <img src={url} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setDocPreviews(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center text-lg shadow-xl hover:scale-110 transition-transform">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-12 border-t border-gray-100">
                <button type="button" onClick={handleCloseForm} className="px-14 py-5 text-sm font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-all rounded-[1.5rem]">{currentT.cancel}</button>
                <GradientButton type="submit" className="!px-20 !py-6 text-2xl rounded-[2.5rem] shadow-2xl shadow-blue-100">{currentT.save}</GradientButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- Grid View ---

  return (
    <div className={`p-4 md:p-8 ${isRtl ? 'font-arabic text-right' : ''}`}>
      {/* Header Area */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">{currentT.title}</h1>
          <div className="flex items-center gap-3 text-gray-500 font-bold">
            <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
            {filteredCustomers.length} {lang === 'fr' ? 'clients dans votre base' : 'زبون في قاعدة البيانات'}
          </div>
        </div>
        
        <div className={`flex flex-col sm:flex-row items-center gap-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="relative group w-full sm:w-96">
            <span className={`absolute inset-y-0 ${isRtl ? 'right-6' : 'left-6'} flex items-center text-gray-400 group-focus-within:text-blue-600 transition-colors text-xl`}>🔍</span>
            <input 
              type="text" 
              placeholder={currentT.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRtl ? 'pr-16 pl-6 text-right' : 'pl-16 pr-6'} py-5 bg-white border-2 border-gray-100 focus:border-blue-600 rounded-[2.2rem] text-lg font-bold transition-all outline-none shadow-sm hover:shadow-2xl`}
            />
          </div>
          <GradientButton onClick={() => handleOpenForm()} className="w-full sm:w-auto !py-5 !px-12 text-xl shadow-blue-200 hover:scale-105 transition-transform">
            <span className="text-2xl">+</span> {currentT.addBtn}
          </GradientButton>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="group bg-white rounded-[4rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden hover:shadow-[0_40px_100px_-20px_rgba(59,130,246,0.15)] hover:-translate-y-4 transition-all duration-700 flex flex-col h-full">
            <div className="p-10 flex flex-col h-full">
              {/* Card Header */}
              <div className="flex items-center gap-7 mb-10">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl overflow-hidden flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                  <img src={customer.profilePicture || 'https://via.placeholder.com/200'} className="w-full h-full object-cover" alt="Profile" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight truncate">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <p className="text-blue-600 font-black mt-2 flex items-center gap-2">
                    <span className="text-lg">📞</span> {customer.phone}
                  </p>
                </div>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-5 mb-10">
                <div className="p-6 rounded-[2.5rem] bg-blue-50/70 border border-transparent hover:border-blue-300 transition-all text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{currentT.reservations}</p>
                  <p className="text-3xl font-black text-blue-600">{customer.totalReservations}</p>
                </div>
                <div className="p-6 rounded-[2.5rem] bg-green-50/70 border border-transparent hover:border-green-300 transition-all text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{currentT.spending}</p>
                  <p className="text-xl font-black text-green-700 truncate">{customer.totalSpent.toLocaleString()} {currentT.currency}</p>
                </div>
              </div>

              {/* Extra Info */}
              <div className="space-y-4 mb-10 px-2 flex-1">
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">📧</span>
                    <p className="text-xs font-bold text-gray-500 truncate">{customer.email}</p>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 mt-0.5">📍</span>
                  <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed">
                    {customer.wilaya}, {customer.address || '-'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setActiveModal({ type: 'details', customer })} className="py-4.5 px-6 rounded-2xl border-2 border-gray-100 hover:border-blue-600 hover:text-blue-600 text-gray-600 font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm">
                    <span className="text-xl">🔍</span> {currentT.details}
                  </button>
                  <button onClick={() => setActiveModal({ type: 'history', customer })} className="py-4.5 px-6 rounded-2xl border-2 border-gray-100 hover:border-blue-600 hover:text-blue-600 text-gray-600 font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm">
                    <span className="text-xl">📜</span> {currentT.history}
                  </button>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleOpenForm(customer)} className="flex-1 py-4.5 bg-gray-50 hover:bg-blue-600 hover:text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95">✏️ {currentT.edit}</button>
                  <button onClick={() => setActiveModal({ type: 'delete', customer })} className="flex-1 py-4.5 bg-gray-50 hover:bg-red-600 hover:text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95">🗑️ {currentT.delete}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Modals */}
      {activeModal.type === 'details' && activeModal.customer && <DetailsModal customer={activeModal.customer} />}
      {activeModal.type === 'history' && activeModal.customer && <HistoryModal customer={activeModal.customer} />}
      {activeModal.type === 'delete' && activeModal.customer && <DeleteModal customer={activeModal.customer} />}
    </div>
  );
};

export default CustomersPage;
