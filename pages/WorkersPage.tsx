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
      setError(lang === 'fr' ? 'Erreur lors de la suppression' : 'خطأ في la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
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

  const t = translations[lang];

  if (isFormOpen) {
    return (
      <div className={`p-8 animate-fade-in ${isRtl ? 'font-arabic text-right' : ''}`}>
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-12">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black text-gray-900">{editingWorker ? t.edit : t.addBtn}</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-red-500 transition-all text-2xl">✕</button>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => { e.preventDefault(); setIsFormOpen(false); }}>
            <div className="md:col-span-2 flex gap-6">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white flex items-center justify-center text-6xl">
                👤
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.fullName}</label>
                <input type="text" defaultValue={editingWorker?.fullName} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold mb-4" required />
                
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.birthday}</label>
                <input type="date" defaultValue={editingWorker?.birthday} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.phone}</label>
              <input type="tel" defaultValue={editingWorker?.phone} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.email}</label>
              <input type="email" defaultValue={editingWorker?.email} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.idCard}</label>
              <input type="text" defaultValue={editingWorker?.idCardNumber} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.workerType}</label>
              <select defaultValue={editingWorker?.role} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold">
                <option value="admin">Admin</option>
                <option value="worker">Worker</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.paymentType}</label>
              <select defaultValue={editingWorker?.paymentType} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold">
                <option value="day">{t.day}</option>
                <option value="month">{t.month}</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.amount} ({t.currency})</label>
              <input type="number" defaultValue={editingWorker?.amount} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
            </div>
            <div className="md:col-span-2 border-t pt-8 mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.username}</label>
                <input type="text" defaultValue={editingWorker?.username} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.password}</label>
                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 mt-8">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-8 py-4 font-black text-gray-400 uppercase tracking-widest">{t.cancel}</button>
              <GradientButton type="submit" className="!px-12 !py-4">{t.save}</GradientButton>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 ${isRtl ? 'font-arabic text-right' : ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
        <h1 className="text-4xl font-black text-gray-900">{t.title}</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder={t.search} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none shadow-sm font-bold" 
          />
          <GradientButton onClick={() => { setEditingWorker(null); setIsFormOpen(true); }}>{t.addBtn}</GradientButton>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 font-bold">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      )}

      {!isLoading && workers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 font-bold text-lg">{lang === 'fr' ? 'Aucun travailleur trouvé' : 'لم يتم العثور على عمال'}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {workers.filter(w => w.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map(worker => (
          <div key={worker.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">👤</div>
              <div>
                <h3 className="text-lg font-black text-gray-900">{worker.fullName}</h3>
                <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest">{worker.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{t.paid}</p>
                <p className="font-black text-green-600">{worker.totalPaid?.toLocaleString() || 0} {t.currency}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">{t.absences}</p>
                <p className="font-black text-red-600">{worker.absences || 0}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button onClick={() => { setActiveModal({ type: 'payment', worker }); }} className="flex-1 py-2 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">💸 {t.payment}</button>
                <button onClick={() => { setActiveModal({ type: 'advance', worker }); }} className="flex-1 py-2 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all">💳 {t.advance}</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingWorker(worker); setIsFormOpen(true); }} className="flex-1 py-2 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">✏️ {t.edit}</button>
                <button onClick={() => { setActiveModal({ type: 'delete', worker }); }} className="flex-1 py-2 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">🗑️ {t.delete}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeModal.type === 'delete' && activeModal.worker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10">
            <h2 className="text-2xl font-black text-gray-900 mb-6">{t.delete}</h2>
            <p className="text-lg font-bold mb-8 text-gray-700">{t.confirmDelete} <b>{activeModal.worker.fullName}</b>?</p>
            <div className="flex gap-4">
              <button onClick={() => setActiveModal({ type: null, worker: null })} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase text-xs tracking-widest">{t.cancel}</button>
              <button onClick={() => handleDeleteWorker(activeModal.worker!)} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">🗑️ {t.delete}</button>
            </div>
          </div>
        </div>
      )}

      {activeModal.type === 'payment' && activeModal.worker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10">
            <h2 className="text-2xl font-black text-gray-900 mb-6">{t.payment}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddTransaction(activeModal.worker!.id, 'payment', activeModal.worker!.amount || 0);
            }}>
              <div className="p-4 bg-blue-50 rounded-2xl mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500">{t.salaryBase}</span>
                  <span className="font-black">{activeModal.worker.amount?.toLocaleString() || 0} {t.currency}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setActiveModal({ type: null, worker: null })} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase text-xs">{t.cancel}</button>
                <GradientButton type="submit" className="flex-1 !py-4">{t.payment}</GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal.type === 'advance' && activeModal.worker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10">
            <h2 className="text-2xl font-black text-gray-900 mb-6">{t.advance}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const amount = Number(formData.get('amount'));
              handleAddTransaction(activeModal.worker!.id, 'advance', amount);
            }}>
              <div className="mb-6">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t.amount} ({t.currency})</label>
                <input type="number" name="amount" className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" required />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setActiveModal({ type: null, worker: null })} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase text-xs">{t.cancel}</button>
                <GradientButton type="submit" className="flex-1 !py-4">{t.advance}</GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkersPage;
