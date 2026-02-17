
import React, { useState, useEffect } from 'react';
import { Language, Expense, Maintenance, Vehicle } from '../types';
import GradientButton from '../components/GradientButton';
import * as dataService from '../services/dataService';

interface ExpensesPageProps { lang: Language; }

const ExpensesPage: React.FC<ExpensesPageProps> = ({ lang }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [activeTab, setActiveTab] = useState<'store' | 'vehicle'>('store');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [maintenanceType, setMaintenanceType] = useState<string>('vidange');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRtl = lang === 'ar';

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [expensesData, vehiclesData] = await Promise.all([
        dataService.getExpenses(),
        dataService.getVehicles()
      ]);
      setExpenses(expensesData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(lang === 'fr' ? 'Erreur lors du chargement' : 'خطأ في التحميل');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveExpense = async (expenseData: Expense | Omit<Expense, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (editingItem && 'id' in expenseData) {
        const updated = await dataService.updateExpense(editingItem.id, expenseData);
        const newExpenses = expenses.map(e => e.id === updated.id ? updated : e);
        setExpenses(newExpenses);
      } else {
        const created = await dataService.createExpense(expenseData as Omit<Expense, 'id'>);
        const newExpenses = [created, ...expenses];
        setExpenses(newExpenses);
      }
      
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Error saving expense:', err);
      setError(lang === 'fr' ? 'Erreur lors de l\'enregistrement' : 'خطأ في الحفظ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    try {
      setIsLoading(true);
      setError(null);
      await dataService.deleteExpense(expense.id);
      const newExpenses = expenses.filter(e => e.id !== expense.id);
      setExpenses(newExpenses);
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError(lang === 'fr' ? 'Erreur lors de la suppression' : 'خطأ في الحذف');
    } finally {
      setIsLoading(false);
    }
  };

  const t = {
    fr: {
      storeTitle: 'Dépenses du Magasin',
      vehicleTitle: 'Entretien & Frais Véhicules',
      addExpense: 'Nouvelle Dépense',
      addMaintenance: 'Nouvel Entretien',
      expenseName: 'Nom de la dépense',
      cost: 'Coût',
      date: 'Date',
      expiryDate: 'Date d\'expiration',
      vehicle: 'Véhicule',
      type: 'Type',
      note: 'Note (optionnel)',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      delete: 'Supprimer',
      currency: 'DZ',
      vidange: 'Vidange',
      assurance: 'Assurance',
      ct: 'Contrôle Technique',
      other: 'Autre',
      confirmDelete: 'Voulez-vous supprimer cette entrée ?'
    },
    ar: {
      storeTitle: 'مصاريف المحل',
      vehicleTitle: 'صيانة ومصاريف السيارات',
      addExpense: 'مصروف جديد',
      addMaintenance: 'صيانة جديدة',
      expenseName: 'اسم المصروف',
      cost: 'التكلفة',
      date: 'التاريخ',
      expiryDate: 'تاريخ الانتهاء',
      vehicle: 'المركبة',
      type: 'النوع',
      note: 'ملاحظة (اختياري)',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      currency: 'دج',
      vidange: 'تغيير الزيت',
      assurance: 'التأمين',
      ct: 'الفحص التقني',
      other: 'أخرى',
      confirmDelete: 'هل أنت متأكد من الحذف؟'
    }
  };

  const currentT = t[lang];

  const handleOpenForm = (item: any = null) => {
    setEditingItem(item);
    setMaintenanceType(item?.type || 'vidange');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string, tab: 'store' | 'vehicle') => {
    if (confirm(currentT.confirmDelete)) {
      if (tab === 'store') setExpenses(expenses.filter(e => e.id !== id));
      else setMaintenances(maintenances.filter(m => m.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (activeTab === 'store') {
      const expenseData: Expense = {
        id: editingItem?.id || Math.random().toString(36).substr(2, 9),
        name: data.name as string,
        cost: Number(data.cost),
        date: data.date as string
      };
      if (editingItem) setExpenses(expenses.map(exp => exp.id === editingItem.id ? expenseData : exp));
      else setExpenses([...expenses, expenseData]);
    } else {
      const type = data.type as any;
      const maintenanceData: Maintenance = {
        id: editingItem?.id || Math.random().toString(36).substr(2, 9),
        vehicleId: data.vehicleId as string,
        type: type,
        name: type === 'other' ? (data.name as string) : (currentT[type as keyof typeof currentT] as string),
        cost: Number(data.cost),
        date: data.date as string,
        expiryDate: type !== 'other' ? (data.expiryDate as string) : undefined,
        note: data.note as string
      };
      if (editingItem) setMaintenances(maintenances.map(m => m.id === editingItem.id ? maintenanceData : m));
      else setMaintenances([...maintenances, maintenanceData]);
    }
    handleCloseForm();
  };

  return (
    <div className={`p-8 ${isRtl ? 'font-arabic text-right' : ''}`}>
      <div className="flex gap-4 mb-12">
        <button onClick={() => setActiveTab('store')} className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'store' ? 'bg-blue-600 text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100'}`}>
          🏪 {currentT.storeTitle}
        </button>
        <button onClick={() => setActiveTab('vehicle')} className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === 'vehicle' ? 'bg-blue-600 text-white shadow-xl' : 'bg-white text-gray-400 border border-gray-100'}`}>
          🚗 {currentT.vehicleTitle}
        </button>
      </div>

      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-gray-900">{activeTab === 'store' ? currentT.storeTitle : currentT.vehicleTitle}</h1>
        <GradientButton onClick={() => handleOpenForm()}>
          {activeTab === 'store' ? currentT.addExpense : currentT.addMaintenance}
        </GradientButton>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 overflow-y-auto max-h-[95vh]">
            <h2 className="text-2xl font-black text-gray-900 mb-8">{editingItem ? currentT.edit : (activeTab === 'store' ? currentT.addExpense : currentT.addMaintenance)}</h2>
            <form className="space-y-6" onSubmit={handleSave}>
              {activeTab === 'store' ? (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.expenseName}</label>
                    <input name="name" type="text" defaultValue={editingItem?.name} required className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.cost}</label>
                      <input name="cost" type="number" defaultValue={editingItem?.cost} required className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.date}</label>
                      <input name="date" type="date" defaultValue={editingItem?.date} required className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.vehicle}</label>
                    <select name="vehicleId" defaultValue={editingItem?.vehicleId} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold">
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.immatriculation})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.type}</label>
                    <select name="type" defaultValue={maintenanceType} onChange={(e) => setMaintenanceType(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold">
                      <option value="vidange">{currentT.vidange}</option>
                      <option value="assurance">{currentT.assurance}</option>
                      <option value="ct">{currentT.ct}</option>
                      <option value="other">{currentT.other}</option>
                    </select>
                  </div>
                  {maintenanceType === 'other' ? (
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.expenseName}</label>
                      <input name="name" type="text" defaultValue={editingItem?.name} required className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                    </div>
                  ) : null}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.cost}</label>
                      <input name="cost" type="number" defaultValue={editingItem?.cost} required className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.date}</label>
                      <input name="date" type="date" defaultValue={editingItem?.date} required className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                    </div>
                  </div>
                  {maintenanceType !== 'other' && (
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.expiryDate}</label>
                      <input name="expiryDate" type="date" defaultValue={editingItem?.expiryDate} required className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{currentT.note}</label>
                    <textarea name="note" defaultValue={editingItem?.note} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold h-24"></textarea>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={handleCloseForm} className="px-8 py-4 font-black text-gray-400 uppercase tracking-widest">{currentT.cancel}</button>
                <GradientButton type="submit">{currentT.save}</GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeTab === 'store' ? (
          expenses.map(exp => (
            <div key={exp.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">💰</div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-900">{exp.cost.toLocaleString()} <span className="text-sm font-bold opacity-40">{currentT.currency}</span></p>
                  <p className="text-xs font-bold text-gray-400">{exp.date}</p>
                </div>
              </div>
              <h3 className="text-lg font-black text-gray-800 mb-6">{exp.name}</h3>
              <div className="flex gap-4">
                <button onClick={() => handleOpenForm(exp)} className="flex-1 py-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">✏️ {currentT.edit}</button>
                <button onClick={() => handleDelete(exp.id, 'store')} className="flex-1 py-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">🗑️ {currentT.delete}</button>
              </div>
            </div>
          ))
        ) : (
          maintenances.map(m => {
            const v = vehicles.find(veh => veh.id === m.vehicleId);
            return (
              <div key={m.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${m.type === 'vidange' ? 'bg-orange-50 text-orange-600' : m.type === 'assurance' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                    {m.type === 'vidange' ? '🛢️' : m.type === 'assurance' ? '🛡️' : '🛠️'}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900">{m.cost.toLocaleString()} <span className="text-sm font-bold opacity-40">{currentT.currency}</span></p>
                    <p className="text-xs font-bold text-gray-400">{m.date}</p>
                  </div>
                </div>
                <h3 className="text-lg font-black text-gray-800 mb-2">{m.name}</h3>
                <p className="text-blue-600 font-bold uppercase text-[10px] tracking-widest mb-4">🚗 {v?.brand} {v?.model}</p>
                {m.expiryDate && <p className="text-[10px] font-black text-red-600 uppercase mb-4">⌛ Exp: {m.expiryDate}</p>}
                <div className="flex gap-4">
                  <button onClick={() => handleOpenForm(m)} className="flex-1 py-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">✏️ {currentT.edit}</button>
                  <button onClick={() => handleDelete(m.id, 'vehicle')} className="flex-1 py-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">🗑️ {currentT.delete}</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;
