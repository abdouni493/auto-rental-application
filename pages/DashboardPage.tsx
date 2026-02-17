
import React, { useMemo } from 'react';
import { Language, Vehicle, Customer, Reservation, User, Worker } from '../types';
import { TRANSLATIONS } from '../constants';
import GradientButton from '../components/GradientButton';

interface DashboardPageProps {
  lang: Language;
  onNavigate: (id: string) => void;
  user: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ lang, onNavigate, user }) => {
  const isRtl = lang === 'ar';
  const isAdmin = user.role === 'admin';
  const isDriver = user.role === 'driver';

  // Driver context
  const currentWorker = useMemo(() => MOCK_WORKERS.find(w => w.username === user.username), [user.username]);
  const driverMissions = useMemo(() => MOCK_RESERVATIONS.filter(r => r.driverId === currentWorker?.id), [currentWorker]);
  const upcomingMission = useMemo(() => driverMissions.find(r => r.status === 'confermer' || r.status === 'en cours'), [driverMissions]);

  const stats = useMemo(() => {
    if (isDriver) {
      return {
        totalMissions: driverMissions.length,
        completed: driverMissions.filter(r => r.status === 'terminer').length,
        active: driverMissions.filter(r => r.status === 'en cours').length,
        reliability: 98
      };
    }

    const totalGains = MOCK_RESERVATIONS.reduce((acc, r) => acc + r.paidAmount, 0);
    const pendingGains = MOCK_RESERVATIONS.reduce((acc, r) => acc + (r.totalAmount - r.paidAmount), 0);
    const rentedCount = MOCK_VEHICLES.filter(v => v.status === 'loué').length;
    const totalVehicles = MOCK_VEHICLES.length;
    
    const techAlerts = MOCK_VEHICLES.filter(v => {
      const expiry = new Date(v.techControlDate);
      return (expiry.getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 15;
    });

    const insuranceAlerts = MOCK_VEHICLES.filter(v => {
      const expiry = new Date(v.insuranceExpiry);
      return (expiry.getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 30;
    });

    return {
      totalGains, pendingGains, rentedCount, totalVehicles,
      techAlerts: techAlerts.length,
      insuranceAlerts: insuranceAlerts.length,
      customerCount: MOCK_CUSTOMERS.length,
      utilization: Math.round((rentedCount / totalVehicles) * 100),
      inspectionsToday: MOCK_INSPECTIONS.filter(i => i.date.includes(new Date().toISOString().split('T')[0])).length
    };
  }, [isDriver, driverMissions]);

  const t = {
    fr: {
      adminTitle: 'Portail Administration',
      workerTitle: 'Espace Opérationnel',
      driverTitle: 'Tableau de Bord Chauffeur',
      welcomeAdmin: 'Pilotage stratégique de votre agence',
      welcomeWorker: 'Vos missions et suivi du parc',
      welcomeDriver: 'Préparez vos prochaines courses et trajets',
      revenue: 'Chiffre d\'affaires',
      rentals: 'Locations Actives',
      fleet: 'État de la Flotte',
      alerts: 'Maintenance & Docs',
      missions: 'Missions Totales',
      reliability: 'Indice de Confiance',
      nextMission: 'Prochaine Mission',
      noMission: 'Aucune mission prévue pour le moment',
      viewPlanner: 'Voir mon planning complet',
      actions: {
        newRes: 'Nouveau Dossier',
        addVeh: 'Parc Auto',
        billing: 'Finances',
        ai: 'Analyse IA',
        reports: 'Audit PDF',
        ops: 'Check-ins',
        myPayments: 'Mes Revenus'
      }
    },
    ar: {
      adminTitle: 'بوابة الإدارة',
      workerTitle: 'الفضاء العملياتي',
      driverTitle: 'لوحة قيادة السائق',
      welcomeAdmin: 'القيادة الاستراتيجية لوكالتك',
      welcomeWorker: 'مهامك ومتابعة الحظيرة',
      welcomeDriver: 'استعد لرحلاتك القادمة',
      revenue: 'رقم الأعمال',
      rentals: 'عقود جارية',
      fleet: 'حالة الأسطول',
      alerts: 'الصيانة والوثائق',
      missions: 'إجمالي المهام',
      reliability: 'مؤشر الموثوقية',
      nextMission: 'المهمة القادمة',
      noMission: 'لا توجد مهام مبرمجة حالياً',
      viewPlanner: 'عرض جدولي الكامل',
      actions: {
        newRes: 'ملف جديد',
        addVeh: 'حظيرة السيارات',
        billing: 'المالية',
        ai: 'الذكاء الاصطناعي',
        reports: 'تقارير PDF',
        ops: 'معاينات',
        myPayments: 'مدفوعاتي'
      }
    }
  }[lang];

  const AdminDashboard = () => (
    <div className="space-y-16 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 hover:shadow-2xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black rotate-12">DZ</div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t.revenue}</p>
          <p className="text-5xl font-black text-blue-600 tracking-tighter">{stats.totalGains.toLocaleString()} <span className="text-sm font-bold opacity-30">DZ</span></p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-bold text-red-400">{t.pending}:</span>
            <span className="text-xs font-black text-red-600">{stats.pendingGains.toLocaleString()} DZ</span>
          </div>
        </div>
        <div className="bg-gray-900 p-10 rounded-[3.5rem] shadow-2xl text-white hover:scale-[1.02] transition-all relative overflow-hidden group">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Utilisation Flotte</p>
          <p className="text-7xl font-black text-white leading-none mb-2">{stats.utilization}%</p>
          <p className="text-xs font-bold opacity-60 uppercase">{stats.rentedCount} / {stats.totalVehicles} {t.rentals}</p>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 hover:shadow-2xl transition-all group">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Clients Fidèles</p>
          <p className="text-5xl font-black text-gray-900 tracking-tighter">{stats.customerCount}</p>
          <div className="mt-4 flex items-center gap-2 text-green-500 font-bold text-xs"><span>↑ 12% Ce mois</span></div>
        </div>
        <div className="bg-red-50 p-10 rounded-[3.5rem] shadow-sm border border-red-100 hover:shadow-2xl transition-all group">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Alertes Critique</p>
          <div className="flex items-end gap-3">
             <p className="text-5xl font-black text-red-600">{stats.techAlerts + stats.insuranceAlerts}</p>
             <div className="mb-1">
                <p className="text-[8px] font-black text-red-400 uppercase">CT: {stats.techAlerts}</p>
                <p className="text-[8px] font-black text-red-400 uppercase">ASSUR: {stats.insuranceAlerts}</p>
             </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-12">
          <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-end mb-10">
               <div><h3 className="text-2xl font-black text-gray-900 tracking-tighter">Évolution Financière</h3><p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Comparaison des gains nets sur 7 jours</p></div>
               <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-[9px] font-black text-blue-600 uppercase">Semaine Actuelle</div>
            </div>
            <div className="flex items-end justify-between gap-6 h-64 px-4">
                {[65, 45, 78, 34, 92, 56, 88].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                     <div className="w-full relative">
                        <div className="bg-gray-100 w-full rounded-3xl h-56 flex flex-col justify-end overflow-hidden group-hover:bg-blue-50 transition-colors">
                          <div className="bg-gradient-to-t from-blue-600 to-indigo-400 w-full transition-all duration-1000 shadow-lg group-hover:from-blue-700 group-hover:to-indigo-500" style={{ height: `${val}%` }}></div>
                        </div>
                     </div>
                     <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Jour {i+1}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="space-y-10">
           <div className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-10 border-b pb-6">Performance Agences</h3>
              <div className="space-y-10">
                 {MOCK_AGENCIES.map((a, i) => (
                   <div key={a.id} className="space-y-4">
                      <div className="flex justify-between items-center"><span className="text-sm font-black text-gray-900 uppercase truncate pr-4">{a.name}</span><span className="text-xs font-black text-blue-600">DZ {(75000 * (i+1)).toLocaleString()}</span></div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${85 - (i*15)}%` }}></div></div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const DriverDashboard = () => (
    <div className="space-y-16 animate-fade-in">
      {/* Driver Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 flex items-center gap-8 group hover:shadow-xl transition-all">
           <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">🏁</div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.missions}</p>
              <p className="text-5xl font-black text-gray-900">{stats.totalMissions}</p>
           </div>
        </div>
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 flex items-center gap-8 group hover:shadow-xl transition-all">
           <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">⭐</div>
           <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.reliability}</p>
              <p className="text-5xl font-black text-green-600">{stats.reliability}%</p>
           </div>
        </div>
        <div className="bg-gray-900 p-10 rounded-[3.5rem] shadow-2xl text-white flex items-center gap-8 group hover:scale-[1.02] transition-all overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8 opacity-10 text-6xl font-black rotate-12">DZ</div>
           <div className="w-20 h-20 bg-white/10 text-white rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">💰</div>
           <div className="relative z-10">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Mois en cours</p>
              <p className="text-4xl font-black">{currentWorker?.amount.toLocaleString()} <span className="text-xs">DZ</span></p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Next Mission Hero Card */}
        <div className="bg-white p-12 rounded-[4.5rem] border border-gray-100 shadow-xl relative overflow-hidden">
           <div className={`flex justify-between items-center mb-10 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{t.nextMission}</h3>
              <GradientButton onClick={() => onNavigate('planner')} className="!py-2 !px-6 text-[10px] !rounded-full">{t.viewPlanner}</GradientButton>
           </div>

           {upcomingMission ? (
             <div className="space-y-10 animate-scale-in">
                {/* The Route */}
                <div className="flex items-center gap-10 bg-gray-50 p-10 rounded-[3.5rem] border border-gray-100 relative shadow-inner">
                   <div className="flex-1 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-3">DÉPART</p>
                      <p className="text-xl font-black text-gray-900">{MOCK_AGENCIES.find(a => a.id === upcomingMission.pickupAgencyId)?.name}</p>
                      <p className="text-blue-600 font-black text-xs mt-2">{new Date(upcomingMission.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                   </div>
                   <div className="w-16 h-px bg-blue-200 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full"></div>
                   </div>
                   <div className="flex-1 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-3">RETOUR</p>
                      <p className="text-xl font-black text-gray-900">{MOCK_AGENCIES.find(a => a.id === upcomingMission.returnAgencyId)?.name}</p>
                      <p className="text-indigo-600 font-black text-xs mt-2">{new Date(upcomingMission.endDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                   </div>
                </div>

                <div className="flex items-center gap-8">
                   <img src={MOCK_VEHICLES.find(v => v.id === upcomingMission.vehicleId)?.mainImage} className="w-48 h-32 rounded-[2rem] object-cover shadow-2xl border-4 border-white" />
                   <div>
                      <h4 className="text-3xl font-black text-gray-900 uppercase leading-none mb-3">
                         {MOCK_VEHICLES.find(v => v.id === upcomingMission.vehicleId)?.brand} {MOCK_VEHICLES.find(v => v.id === upcomingMission.vehicleId)?.model}
                      </h4>
                      <p className="text-blue-600 font-black tracking-widest text-sm bg-blue-50 inline-block px-4 py-1 rounded-full uppercase">
                         {MOCK_VEHICLES.find(v => v.id === upcomingMission.vehicleId)?.immatriculation}
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                         <img src={MOCK_CUSTOMERS.find(c => c.id === upcomingMission.customerId)?.profilePicture} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                         <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                            Client: <span className="text-gray-900 font-black">{MOCK_CUSTOMERS.find(c => c.id === upcomingMission.customerId)?.firstName}</span>
                         </p>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="py-24 text-center opacity-30 flex flex-col items-center gap-6">
                <span className="text-8xl">🛌</span>
                <p className="text-xl font-black uppercase tracking-widest">{t.noMission}</p>
             </div>
           )}
        </div>

        {/* Quick Links Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
           <button onClick={() => onNavigate('planner')} className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 hover:border-blue-600 hover:bg-blue-50/20 transition-all text-center group">
              <span className="text-7xl mb-6 block group-hover:scale-110 transition-transform">📅</span>
              <h4 className="text-xl font-black text-gray-900 uppercase">Mon Planning</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Courses & Historique</p>
           </button>
           <button onClick={() => onNavigate('my_payments')} className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 hover:border-indigo-600 hover:bg-indigo-50/20 transition-all text-center group">
              <span className="text-7xl mb-6 block group-hover:scale-110 transition-transform">💳</span>
              <h4 className="text-xl font-black text-gray-900 uppercase">Paiements</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Salaire & Avances</p>
           </button>
           <div className="sm:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl font-black rotate-12">SOS</div>
              <h4 className="text-2xl font-black uppercase mb-4 relative z-10">Assistance d'Urgence</h4>
              <p className="font-bold opacity-80 mb-8 max-w-md relative z-10">En cas d'accident ou de panne durant une mission, contactez immédiatement l'administrateur de l'agence.</p>
              <button className="px-12 py-5 bg-white text-blue-700 rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all relative z-10">📞 CONTACTER LE BUREAU</button>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`p-4 md:p-12 animate-fade-in ${isRtl ? 'font-arabic text-right' : ''}`}>
      <div className="mb-16">
        <h1 className="text-6xl font-black text-gray-900 tracking-tighter mb-4">
           {isAdmin ? t.adminTitle : isDriver ? t.driverTitle : t.workerTitle}
        </h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">
           {isAdmin ? t.welcomeAdmin : isDriver ? t.welcomeDriver : t.welcomeWorker}
        </p>
      </div>

      {isAdmin ? <AdminDashboard /> : isDriver ? <DriverDashboard /> : <div className="p-8">Dashboard non configuré pour ce rôle</div>}
    </div>
  );
};

export default DashboardPage;
