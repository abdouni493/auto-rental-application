
import React, { useState, useEffect } from 'react';
import { Language, Vehicle, Customer, Expense, Reservation } from '../types';
import { TRANSLATIONS } from '../constants';
import { getRentalAIAnalysis } from '../services/geminiService';
import * as dataService from '../services/dataService';
import GradientButton from '../components/GradientButton';

interface AIAnalysisPageProps {
  lang: Language;
}

type AnalysisCategory = 'fleet' | 'crm' | 'finance' | 'global';

const AIAnalysisPage: React.FC<AIAnalysisPageProps> = ({ lang }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AnalysisCategory>('global');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  const isRtl = lang === 'ar';
  const t = TRANSLATIONS[lang];

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [vData, cData, eData, rData] = await Promise.all([
          dataService.getVehicles(),
          dataService.getCustomers(),
          dataService.getExpenses(),
          dataService.getReservations()
        ]);
        setVehicles(vData);
        setCustomers(cData);
        setExpenses(eData);
        setReservations(rData);
      } catch (err) {
        console.error('Failed to load AI analysis data:', err);
      }
    };
    loadData();
  }, []);

  const categories = [
    { id: 'global', labelFr: 'Stratégie Globale', labelAr: 'الاستراتيجية العامة', icon: '🌐', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'fleet', labelFr: 'Gestion de Flotte', labelAr: 'إدارة الأسطول', icon: '🚗', color: 'bg-blue-50 text-blue-600' },
    { id: 'crm', labelFr: 'Analyse Clientèle', labelAr: 'تحليل الزبائن', icon: '👥', color: 'bg-purple-50 text-purple-600' },
    { id: 'finance', labelFr: 'Rentabilité & Frais', labelAr: 'الربحية والمصاريف', icon: '💰', color: 'bg-green-50 text-green-600' },
  ];

  const gatherData = (category: AnalysisCategory) => {
    const summary: any = {};
    
    if (category === 'fleet' || category === 'global') {
      summary.vehicles = vehicles.map(v => ({
        model: `${v.brand} ${v.model}`,
        rate: v.dailyRate,
        mileage: v.mileage,
        status: v.status
      }));
    }
    
    if (category === 'crm' || category === 'global') {
      summary.customers = customers.map(c => ({
        wilaya: c.wilaya,
        totalSpent: c.totalSpent,
        reservations: c.totalReservations
      }));
    }

    if (category === 'finance' || category === 'global') {
      summary.expenses = expenses.map(e => ({ name: e.name, cost: e.cost }));
      summary.revenue = reservations.reduce((acc, r) => acc + (r.paidAmount || 0), 0);
    }

    return summary;
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    
    const dataContext = gatherData(selectedCategory);
    const categoryLabel = categories.find(c => c.id === selectedCategory)?.[lang === 'fr' ? 'labelFr' : 'labelAr'] || selectedCategory;
    
    const result = await getRentalAIAnalysis(categoryLabel, dataContext, lang);
    setAnalysis(result || null);
    setLoading(false);
  };

  const currentT = {
    fr: {
      header: "Consultant IA Stratégique",
      sub: "Sélectionnez un domaine d'analyse pour recevoir des conseils professionnels basés sur vos données réelles.",
      cta: "Lancer l'audit intelligent",
      analyzing: "Analyse des données en cours...",
      resultTitle: "Rapport d'Expertise Gemini",
    },
    ar: {
      header: "مستشار الذكاء الاصطناعي الاستراتيجي",
      sub: "اختر مجال التحليل للحصول على نصائح مهنية بناءً على بياناتك الحقيقية.",
      cta: "بدء التدقيق الذكي",
      analyzing: "جاري تحليل البيانات...",
      resultTitle: "تقرير خبرة Gemini",
    }
  }[lang];

  return (
    <div className={`p-4 sm:p-8 animate-fade-in ${isRtl ? 'font-arabic text-right' : ''}`}>
      {/* Header Section */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className={`flex items-center gap-6 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] shadow-2xl shadow-blue-200 flex items-center justify-center text-4xl">🧠</div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">{currentT.header}</h1>
            <p className="text-gray-400 font-bold mt-2">{currentT.sub}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Category Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as AnalysisCategory)}
              className={`
                relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 text-left group
                ${selectedCategory === cat.id 
                  ? 'bg-white border-blue-600 shadow-2xl shadow-blue-100 scale-105 z-10' 
                  : 'bg-white border-gray-100 hover:border-blue-200 opacity-60 hover:opacity-100'
                }
                ${isRtl ? 'text-right' : ''}
              `}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner ${cat.color}`}>
                {cat.icon}
              </div>
              <h3 className={`text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors ${isRtl ? 'font-arabic' : ''}`}>
                {lang === 'fr' ? cat.labelFr : cat.labelAr}
              </h3>
              {selectedCategory === cat.id && (
                <div className="absolute top-6 right-6 w-3 h-3 bg-blue-600 rounded-full animate-ping"></div>
              )}
            </button>
          ))}
        </div>

        {/* Action Area */}
        <div className="flex justify-center py-6">
          <GradientButton 
            onClick={handleAnalyze} 
            disabled={loading}
            className="!px-16 !py-6 text-2xl rounded-[2.5rem] shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-lg uppercase tracking-widest">{currentT.analyzing}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span>✨</span>
                <span className="text-lg uppercase tracking-widest">{currentT.cta}</span>
              </div>
            )}
          </GradientButton>
        </div>

        {/* Result Area */}
        {(loading || analysis) && (
          <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 p-8 sm:p-14 animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
            
            <div className={`flex items-center gap-4 mb-10 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span className="text-3xl">📄</span>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">{currentT.resultTitle}</h2>
            </div>

            {loading ? (
              <div className="space-y-6">
                <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded-full w-5/6 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse"></div>
              </div>
            ) : (
              <div className={`prose prose-lg max-w-none text-gray-800 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="whitespace-pre-wrap font-medium text-lg text-gray-700 bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
                  {analysis}
                </div>
                
                <div className={`mt-10 flex gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <button className="px-6 py-3 bg-white border border-gray-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                    🖨️ Imprimer le rapport
                  </button>
                  <button className="px-6 py-3 bg-white border border-gray-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                    💾 Exporter PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisPage;
