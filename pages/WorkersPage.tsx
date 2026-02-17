
import React, { useState, useRef, useEffect } from 'react';
import { Language, Worker, Role, WorkerTransaction } from '../types';
import GradientButton from '../components/GradientButton';
import * as dataService from '../services/dataService';

interface WorkersPageProps {
  lang: Language;
}

type ModalType = 'payment' | 'advance' | 'absences' | 'history' | 'delete' | null;

const WorkersPage: React.FC<WorkersPageProps> = ({ lang }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [activeModal, setActiveModal] = useState<{ type: ModalType; worker: Worker | null }>({ type: null, worker: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRtl = lang === 'ar';
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Load workers on mount
  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dataService.getWorkers();
      setWorkers(data);
    } catch (err) {
      console.error('Error loading workers:', err);
      setError(lang === 'fr' ? 'Erreur lors du chargement de l\'équipe' : 'خطأ في تحميل الفريق');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorker = async (workerData: Worker | Omit<Worker, 'id' | 'history'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (editingWorker && 'id' in workerData) {
        const updated = await dataService.updateWorker(editingWorker.id, workerData);
        const newWorkers = workers.map(w => w.id === updated.id ? updated : w);
        setWorkers(newWorkers);
      } else {
        const created = await dataService.createWorker(workerData as Omit<Worker, 'id' | 'history'>);
        const newWorkers = [created, ...workers];
        setWorkers(newWorkers);
      }
      
      setIsFormOpen(false);
      setEditingWorker(null);
    } catch (err) {
      console.error('Error saving worker:', err);
      setError(lang === 'fr' ? 'Erreur lors de l\'enregistrement' : 'خطأ في الحفظ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (workerId: string, type: 'payment' | 'advance' | 'absence', amount: number, note?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await dataService.createWorkerTransaction({
        workerId,
        type,
        amount,
        date: new Date().toISOString().split('T')[0],
        note
      });

      // Reload workers to get updated transactions
      const updated = await dataService.getWorkers();
      setWorkers(updated);
      setActiveModal({ type: null, worker: null });
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(lang === 'fr' ? 'Erreur lors de l\'ajout' : 'خطأ في الإضافة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorker = async (worker: Worker) => {
    try {
      setIsLoading(true);
      setError(null);
      await dataService.deleteWorker(worker.id);
      const newWorkers = workers.filter(w => w.id !== worker.id);
      setWorkers(newWorkers);
      setActiveModal({ type: null, worker: null });
    } catch (err) {
      console.error('Error deleting worker:', err);
      setError(lang === 'fr' ? 'Erreur lors de la suppression' : 'خطأ في الحذف');
    } finally {
      setIsLoading(false);
    }
  };
  fr: {
    title: 'Gestion de l\'Équipe',
    addBtn: 'Ajouter un membre',
    search: 'Rechercher un membre...',
    fullName: 'Nom Complet',
    birthday: 'Date de naissance',
    phone: 'Téléphone',
    email: 'E-mail',
    address: 'Adresse',
    idCard: 'N° Carte d\'identité',
    workerType: 'Type de travailleur',
    paymentType: 'Type de paiement',
    amount: 'Montant du salaire',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    day: 'Par jour',
    month: 'Par mois',
    absences: 'Absences',
    paid: 'Total Payé',
    payment: 'Paiement',
    advance: 'Avance',
    history: 'Historique',
    edit: 'Modifier',
    delete: 'Supprimer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    photo: 'Photo (optionnel)',
    currency: 'DZ',
    salaryBase: 'Salaire de base',
    deductions: 'Déductions (Avances/Absences)',
    finalPayment: 'Paiement Final',
    confirmDelete: 'Voulez-vous vraiment supprimer ce travailleur ?',
    note: 'Note / Commentaire',
    date: 'Date'
  },
  ar: {
    title: 'إدارة الفريق',
    addBtn: 'إضافة عضو',
    search: 'بحث عن عضو...',
    fullName: 'الاسم الكامل',
    birthday: 'تاريخ الميلاد',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    address: 'العنوان',
    idCard: 'رقم بطاقة التعريف',
    workerType: 'نوع العامل',
    paymentType: 'نوع الدفع',
    amount: 'قيمة الراتب',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    day: 'يومياً',
    month: 'شهرياً',
    absences: 'الغيابات',
    paid: 'إجمالي المدفوع',
    payment: 'دفع',
    advance: 'تسبيق',
    history: 'السجل',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    photo: 'الصورة (اختياري)',
    currency: 'دج',
    salaryBase: 'الراتب الأساسي',
    deductions: 'اقتطاعات (تسبيقات/غيابات)',
    finalPayment: 'الدفع النهائي',
    confirmDelete: 'هل أنت متأكد من حذف هذا العامل؟',
    note: 'ملاحظة',
    date: 'التاريخ'
  }
};

const ModalContainer: React.FC<{ children: React.ReactNode; title: string; onClose: () => void }> = ({ children, title, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-scale-in p-10 overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-gray-900">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-2xl">✕</button>
      </div>
      {children}
    </div>
  </div>
);

const WorkersPage: React.FC<WorkersPageProps> = ({ lang }) => {
  const [workers, setWorkers] = useState<Worker[]>(MOCK_WORKERS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [activeModal, setActiveModal] = useState<{ type: ModalType; worker: Worker | null }>({ type: null, worker: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const isRtl = lang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentT = WORKER_TRANSLATIONS[lang];

  const handleOpenForm = (worker: Worker | null = null) => {
    setEditingWorker(worker);
    setPhotoPreview(worker?.photo || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingWorker(null);
  };

  const handleCloseModal = () => setActiveModal({ type: null, worker: null });

  const handleDeleteWorker = (id: string) => {
    setWorkers(prev => prev.filter(w => w.id !== id));
    handleCloseModal();
  };

  const handleAddTransaction = (workerId: string, type: 'payment' | 'advance' | 'absence', amount: number, date: string, note?: string) => {
    setWorkers(prev => prev.map(w => {
      if (w.id === workerId) {
        const newTrans: WorkerTransaction = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          amount,
          date,
          note
        };
        const updatedHistory = [...w.history, newTrans];
        const updatedTotalPaid = type === 'payment' ? w.totalPaid + amount : w.totalPaid;
        const updatedAbsences = type === 'absence' ? w.absences + 1 : w.absences;
        return { ...w, history: updatedHistory, totalPaid: updatedTotalPaid, absences: updatedAbsences };
      }
      return w;
    }));
    handleCloseModal();
  };

  const calculateDeductions = (worker: Worker) => {
    return worker.history
      .filter(t => t.type === 'advance' || t.type === 'absence')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  if (isFormOpen) {
    return (
      <div className={`p-8 animate-fade-in ${isRtl ? 'font-arabic text-right' : ''}`}>
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-12">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black text-gray-900">{editingWorker ? currentT.edit : currentT.addBtn}</h2>
            <button onClick={handleCloseForm} className="text-gray-400 hover:text-red-500 transition-all text-2xl">✕</button>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => { e.preventDefault(); handleCloseForm(); }}>
            <div className="md:col-span-2 flex flex-col items-center gap-4 bg-gray-50 p-8 rounded-[2rem]">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <span className="text-6xl flex items-center justify-center h-full">👤</span>}
              </div>
              <GradientButton type="button" onClick={() => fileInputRef.current?.click()} className="!py-2 text-sm">{currentT.photo}</GradientButton>
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && setPhotoPreview(URL.createObjectURL(e.target.files[0]))} className="hidden" accept="image/*" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.fullName}</label>
              <input type="text" defaultValue={editingWorker?.fullName} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.birthday}</label>
              <input type="date" defaultValue={editingWorker?.birthday} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.phone}</label>
              <input type="tel" defaultValue={editingWorker?.phone} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.email}</label>
              <input type="email" defaultValue={editingWorker?.email} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.idCard}</label>
              <input type="text" defaultValue={editingWorker?.idCardNumber} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.workerType}</label>
              <select defaultValue={editingWorker?.role} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold">
                <option value="admin">Admin</option>
                <option value="worker">Worker</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.paymentType}</label>
              <select defaultValue={editingWorker?.paymentType} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold">
                <option value="day">{currentT.day}</option>
                <option value="month">{currentT.month}</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.amount} ({currentT.currency})</label>
              <input type="number" defaultValue={editingWorker?.amount} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
            </div>
            <div className="md:col-span-2 border-t pt-8 mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.username}</label>
                <input type="text" defaultValue={editingWorker?.username} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.password}</label>
                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 mt-8">
              <button type="button" onClick={handleCloseForm} className="px-8 py-4 font-black text-gray-400 uppercase tracking-widest">{currentT.cancel}</button>
              <GradientButton type="submit" className="!px-12 !py-4">{currentT.save}</GradientButton>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 ${isRtl ? 'font-arabic text-right' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
        <h1 className="text-4xl font-black text-gray-900">{currentT.title}</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder={currentT.search} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none shadow-sm font-bold" 
          />
          <GradientButton onClick={() => handleOpenForm()}>{currentT.addBtn}</GradientButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {workers.filter(w => w.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map(worker => (
          <div key={worker.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-500 group">
            <div className="flex items-center gap-6 mb-8">
              <img src={worker.photo || 'https://via.placeholder.com/200'} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
              <div>
                <h3 className="text-xl font-black text-gray-900">{worker.fullName}</h3>
                <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest">{worker.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{currentT.paid}</p>
                <p className="font-black text-green-600">{worker.totalPaid.toLocaleString()} {currentT.currency}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{currentT.absences}</p>
                <p className="font-black text-red-600">{worker.absences}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <button onClick={() => setActiveModal({ type: 'payment', worker })} className="flex-1 py-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">💸 {currentT.payment}</button>
                <button onClick={() => setActiveModal({ type: 'advance', worker })} className="flex-1 py-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all">💳 {currentT.advance}</button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setActiveModal({ type: 'absences', worker })} className="flex-1 py-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">⚠️ {currentT.absences}</button>
                <button onClick={() => setActiveModal({ type: 'history', worker })} className="flex-1 py-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 hover:text-white transition-all">📜 {currentT.history}</button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleOpenForm(worker)} className="flex-1 py-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">✏️ {currentT.edit}</button>
                <button onClick={() => setActiveModal({ type: 'delete', worker })} className="flex-1 py-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">🗑️ {currentT.delete}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeModal.type === 'delete' && activeModal.worker && (
        <ModalContainer title={currentT.delete} onClose={handleCloseModal}>
          <div className="text-center p-4">
            <p className="text-lg font-bold mb-8 text-gray-700">{currentT.confirmDelete} <b>{activeModal.worker.fullName}</b>?</p>
            <div className="flex gap-4">
              <button onClick={handleCloseModal} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase text-xs tracking-widest">{currentT.cancel}</button>
              <button onClick={() => handleDeleteWorker(activeModal.worker!.id)} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">🗑️ {currentT.delete}</button>
            </div>
          </div>
        </ModalContainer>
      )}

      {activeModal.type === 'payment' && activeModal.worker && (
        <ModalContainer title={currentT.payment} onClose={handleCloseModal}>
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleAddTransaction(activeModal.worker!.id, 'payment', Number(formData.get('amount')), formData.get('date') as string, formData.get('note') as string);
          }}>
            <div className="p-6 bg-blue-50 rounded-2xl">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">{currentT.salaryBase}</span>
                <span className="font-black">{activeModal.worker.amount.toLocaleString()} {currentT.currency}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-red-500">{currentT.deductions}</span>
                <span className="font-black text-red-600">-{calculateDeductions(activeModal.worker).toLocaleString()} {currentT.currency}</span>
              </div>
              <div className="flex justify-between border-t border-blue-100 pt-2 mt-2">
                <span className="text-sm font-black text-blue-800">{currentT.finalPayment}</span>
                <span className="text-lg font-black text-blue-900">{(activeModal.worker.amount - calculateDeductions(activeModal.worker)).toLocaleString()} {currentT.currency}</span>
              </div>
            </div>
            <input type="hidden" name="amount" value={activeModal.worker.amount - calculateDeductions(activeModal.worker)} />
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.date}</label>
              <input type="date" name="date" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.note}</label>
              <textarea name="note" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none h-24"></textarea>
            </div>
            <GradientButton className="w-full !py-5">{currentT.payment}</GradientButton>
          </form>
        </ModalContainer>
      )}

      {(activeModal.type === 'advance' || activeModal.type === 'absences') && activeModal.worker && (
        <ModalContainer title={activeModal.type === 'advance' ? currentT.advance : currentT.absences} onClose={handleCloseModal}>
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleAddTransaction(activeModal.worker!.id, activeModal.type as any, Number(formData.get('amount')), formData.get('date') as string, formData.get('note') as string);
          }}>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.amount} ({currentT.currency})</label>
              <input type="number" name="amount" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.date}</label>
              <input type="date" name="date" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.note}</label>
              <textarea name="note" className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none h-24"></textarea>
            </div>
            <GradientButton className="w-full !py-5">{activeModal.type === 'advance' ? currentT.advance : currentT.absences}</GradientButton>
          </form>
        </ModalContainer>
      )}

      {activeModal.type === 'history' && activeModal.worker && (
        <ModalContainer title={currentT.history} onClose={handleCloseModal}>
          <div className="space-y-4">
            {activeModal.worker.history.length === 0 ? (
              <p className="text-center text-gray-400 py-10 font-bold">Aucun historique disponible.</p>
            ) : (
              activeModal.worker.history.slice().reverse().map(t => (
                <div key={t.id} className={`p-5 rounded-2xl border-l-4 ${t.type === 'payment' ? 'bg-green-50 border-green-500' : t.type === 'advance' ? 'bg-orange-50 border-orange-500' : 'bg-red-50 border-red-500'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-black uppercase text-[10px] tracking-widest">{t.type}</span>
                    <span className="text-xs font-bold text-gray-400">{t.date}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-gray-900 font-black">{t.amount.toLocaleString()} {currentT.currency}</p>
                    <p className="text-[10px] font-bold text-gray-500 italic">{t.note}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ModalContainer>
      )}
    </div>
  );
};

export default WorkersPage;
