
import React, { useState, useEffect } from 'react';
import { User, Language, Vehicle, Inspection, Damage, Customer } from './types';
import { TRANSLATIONS, MENU_ITEMS, DEFAULT_TEMPLATES } from './constants';
import * as supabaseService from './services/supabaseService';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import EmptyPage from './pages/EmptyPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import VehiclesPage from './pages/VehiclesPage';
import CustomersPage from './pages/CustomersPage';
import AgenciesPage from './pages/AgenciesPage';
import WorkersPage from './pages/WorkersPage';
import ExpensesPage from './pages/ExpensesPage';
import PlannerPage from './pages/PlannerPage';
import ConfigPage from './pages/ConfigPage';
import OperationsPage from './pages/OperationsPage';
import PersonalizationPage from './pages/PersonalizationPage';
import BillingPage from './pages/BillingPage';
import ReportsPage from './pages/ReportsPage';
import DashboardPage from './pages/DashboardPage';
import WorkerPaymentsPage from './pages/WorkerPaymentsPage';
import DriverPlannerPage from './pages/DriverPlannerPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('fr');
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // App Data State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [damages, setDamages] = useState<Damage[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [vehiclesData, inspectionsData, damagesData, customersData] = await Promise.all([
          supabaseService.getVehicles(),
          supabaseService.getInspections(),
          supabaseService.getDamages(),
          supabaseService.getCustomers()
        ]);
        
        setVehicles(vehiclesData);
        setInspections(inspectionsData);
        setDamages(damagesData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} lang={lang} onLanguageToggle={setLang} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage lang={lang} onNavigate={setActivePage} user={user} />;
      case 'planner':
        if (user.role === 'driver') {
          return <DriverPlannerPage lang={lang} user={user} />;
        }
        return (
          <PlannerPage 
            lang={lang} 
            customers={customers} 
            onAddCustomer={(c) => setCustomers([...customers, c])} 
          />
        );
      case 'operations':
        return (
          <OperationsPage 
            lang={lang} 
            vehicles={vehicles}
            inspections={inspections}
            damages={damages}
            templates={templates}
            onAddInspection={(i) => setInspections([i, ...inspections])}
            onUpdateInspection={(i) => setInspections(inspections.map(insp => insp.id === i.id ? i : insp))}
            onDeleteInspection={(id) => setInspections(inspections.filter(i => i.id !== id))}
            onUpdateVehicleMileage={(id, m) => setVehicles(vehicles.map(v => v.id === id ? { ...v, mileage: m } : v))}
            onAddDamage={(d) => setDamages([d, ...damages])}
            onUpdateDamage={(d) => setDamages(damages.map(dmg => dmg.id === d.id ? d : dmg))}
            onDeleteDamage={(id) => setDamages(damages.filter(d => d.id !== id))}
          />
        );
      case 'vehicles':
        return <VehiclesPage lang={lang} initialVehicles={vehicles} onUpdateVehicles={setVehicles} />;
      case 'customers':
        return <CustomersPage lang={lang} />;
      case 'agencies':
        return <AgenciesPage lang={lang} />;
      case 'team':
        return <WorkersPage lang={lang} />;
      case 'expenses':
        return <ExpensesPage lang={lang} />;
      case 'billing':
        return <BillingPage lang={lang} customers={customers} vehicles={vehicles} templates={templates} />;
      case 'personalization':
        return <PersonalizationPage lang={lang} initialTemplates={templates} onUpdateTemplates={setTemplates} />;
      case 'reports':
        return <ReportsPage lang={lang} />;
      case 'ai_analysis':
        return <AIAnalysisPage lang={lang} />;
      case 'config':
        return <ConfigPage lang={lang} />;
      case 'my_payments':
        return <WorkerPaymentsPage lang={lang} user={user} />;
      default:
        return <EmptyPage title={activePage} lang={lang} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 flex ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        activeId={activePage} 
        onNavigate={setActivePage} 
        lang={lang} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        user={user}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar 
          user={user} 
          lang={lang} 
          onLanguageChange={setLang} 
          onLogout={handleLogout} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50/50 custom-scrollbar">
          <div className="container mx-auto max-w-[1600px]">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
