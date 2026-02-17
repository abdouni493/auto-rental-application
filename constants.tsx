
import { MenuItem, TranslationSet } from './types';

export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', labelFr: 'Tableau de bord', labelAr: 'لوحة القيادة', icon: '📊' },
  { id: 'planner', labelFr: 'Planificateur', labelAr: 'المخطط', icon: '📅' },
  { id: 'operations', labelFr: 'Opérations', labelAr: 'العمليات', icon: '⚙️' },
  { id: 'vehicles', labelFr: 'Véhicules', labelAr: 'المركبات', icon: '🚗' },
  { id: 'customers', labelFr: 'Clients', labelAr: 'الزبائن', icon: '👥' },
  { id: 'agencies', labelFr: 'Agences', labelAr: 'الوكالات', icon: '🏢' },
  { id: 'team', labelFr: 'Équipe', labelAr: 'الفريق', icon: '🤝' },
  { id: 'billing', labelFr: 'Facturation', labelAr: 'الفواتير', icon: '💰' },
  { id: 'personalization', labelFr: 'Personalisation', labelAr: 'التخصيص', icon: '🎨' },
  { id: 'expenses', labelFr: 'Dépenses', labelAr: 'المصاريف', icon: '📉' },
  { id: 'reports', labelFr: 'Rapports', labelAr: 'التقارير', icon: '📄' },
  { id: 'ai_analysis', labelFr: 'Analyses IA', labelAr: 'تحليلات الذكاء الاصطناعي', icon: '🧠' },
  { id: 'config', labelFr: 'Configuration', labelAr: 'الإعدادات', icon: '🛠️' },
];

export const ALGERIAN_WILAYAS = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna", 
  "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira", 
  "11 - Tamanrasset", "12 - Téبessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", 
  "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda", 
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", 
  "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla", 
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arreridj", "35 - Boumerdès", 
  "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela", 
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", 
  "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - El M'Ghair", "50 - El Meniaa", 
  "51 - Ouled Djellal", "52 - Bordj Badji Mokhtar", "53 - Beni Abbes", "54 - Timimoun", "55 - Touggourt", 
  "56 - Djanet", "57 - In Salah", "58 - In Guezzam"
];

export const DEFAULT_TEMPLATES: any[] = [
  {
    id: 'tpl-inv-1',
    name: 'Facture Professionnelle',
    category: 'invoice',
    canvasWidth: 595,
    canvasHeight: 842,
    elements: [
      { id: 'e1', type: 'logo', label: 'Logo', content: 'DRIVEFLOW', x: 40, y: 40, width: 160, height: 70, fontSize: 18, fontWeight: '900', color: '#2563eb', textAlign: 'center', backgroundColor: '#eff6ff', borderWidth: 2, borderColor: '#bfdbfe', borderRadius: 20 },
      { id: 'e2', type: 'variable', label: 'Info Agence', content: 'DriveFlow Management\nAlger Centre\n021 55 66 77', x: 40, y: 120, width: 250, height: 60, fontSize: 9, color: '#64748b', lineHeight: 1.6 },
      { id: 'e3', type: 'static', label: 'Label', content: 'FACTURE', x: 350, y: 40, width: 200, fontSize: 32, fontWeight: '900', textAlign: 'right', color: '#1e293b', letterSpacing: -1 },
      { id: 'e4', type: 'variable', label: 'Numéro', content: 'N°: {{res_number}}\nDate: {{current_date}}', x: 350, y: 90, width: 200, textAlign: 'right', fontSize: 10, fontWeight: '700' },
      { id: 'e5', type: 'variable', label: 'Client', content: 'CLIENT:\n{{client_name}}\n{{client_phone}}', x: 40, y: 220, width: 280, padding: 20, backgroundColor: '#f8fafc', borderRadius: 24, fontWeight: '700', borderWidth: 1, borderColor: '#f1f5f9' },
      { id: 'e6', type: 'table', label: 'Détails', content: '', x: 40, y: 360, width: 515, height: 280 },
      { id: 'e7', type: 'variable', label: 'Paiements', content: 'TOTAL HT: {{total_amount}} DZ\nTOTAL TTC: {{total_amount}} DZ', x: 350, y: 660, width: 200, textAlign: 'right', fontWeight: '900', color: '#1e293b', fontSize: 11, lineHeight: 1.8 },
      { id: 'e8', type: 'qr_code', label: 'QR Sync', content: 'VALID-DOCUMENT', x: 40, y: 720, width: 80, height: 80, backgroundColor: '#f1f5f9', borderRadius: 10, textAlign: 'center', fontSize: 8 }
    ]
  },
  {
    id: 'tpl-cont-1',
    name: 'Contrat Premium Gold',
    category: 'contract',
    canvasWidth: 595,
    canvasHeight: 842,
    elements: [
      { id: 'c1', type: 'static', label: 'Titre', content: 'CONTRAT DE LOCATION VÉHICULE', x: 40, y: 40, width: 515, fontSize: 24, fontWeight: '900', textAlign: 'center', color: '#1e293b', backgroundColor: '#f8fafc', padding: 15, borderRadius: 15 },
      { id: 'c2', type: 'variable', label: 'Agence', content: 'DriveFlow Agency', x: 40, y: 110, width: 250, fontSize: 10, fontWeight: '700' },
      { id: 'c3', type: 'variable', label: 'Num Contrat', content: 'Contrat N°: {{res_number}}', x: 300, y: 110, width: 250, textAlign: 'right', fontSize: 10, fontWeight: '700' },
      { id: 'c4', type: 'variable', label: 'Locataire', content: 'LE LOCATAIRE:\n{{client_name}}\nTél: {{client_phone}}', x: 40, y: 160, width: 250, fontSize: 9, lineHeight: 1.5 },
      { id: 'c5', type: 'variable', label: 'Vehicule', content: 'LE VÉHICULE:\n{{vehicle_name}}\n{{vehicle_plate}}', x: 300, y: 160, width: 250, fontSize: 9, lineHeight: 1.5 },
      { id: 'c6', type: 'fuel_mileage', label: 'Etat Compteur', content: '', x: 40, y: 300, width: 515, height: 70, backgroundColor: '#f8fafc', borderRadius: 15 },
      { id: 'c7', type: 'checklist', label: 'Inventaire', content: 'security', x: 40, y: 390, width: 515, height: 250 },
      { id: 'c8', type: 'signature_area', label: 'Signature Client', content: 'VISA CLIENT', x: 315, y: 680, width: 240, height: 120, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20 }
    ]
  }
];

export const TRANSLATIONS: Record<'fr' | 'ar', TranslationSet> = {
  fr: {
    loginTitle: 'Connexion DriveFlow', usernameLabel: 'Nom d\'utilisateur', passwordLabel: 'Mot de passe', loginButton: 'Se connecter', autoFillLabel: 'Accès rapide', logout: 'Déconnexion', welcome: 'Bienvenue', searchPlaceholder: 'Rechercher...', emptyState: 'Cette interface est actuellement vide.', aiAnalyze: 'Analyser les données de location avec l\'IA'
  },
  ar: {
    loginTitle: 'تسجيل الدخول DriveFlow', usernameLabel: 'اسم المستخدم', passwordLabel: 'كلمة المرور', loginButton: 'تسجيل الدخول', autoFillLabel: 'دخول سريع', logout: 'تسجيل الخروج', welcome: 'أهلاً بك', searchPlaceholder: 'بحث...', emptyState: 'هذه الواجهة فارغة حالياً.', aiAnalyze: 'تحليل بيانات التأجير بالذكاء الاصطناعي'
  }
};
