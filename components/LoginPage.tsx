
import React, { useState, useEffect } from 'react';
import { User, Role, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import GradientButton from './GradientButton';

interface LoginPageProps {
  onLogin: (user: User) => void;
  lang: Language;
  onLanguageToggle: (lang: Language) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, lang, onLanguageToggle }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');
  
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError(lang === 'fr' ? 'Veuillez remplir tous les champs' : 'يرجى ملء جميع الحقول');
      return;
    }
    
    if (username.length < 3) {
      setError(lang === 'fr' ? 'Le nom d\'utilisateur doit contenir au moins 3 caractères' : 'يجب أن يحتوي اسم المستخدم على 3 أحرف على الأقل');
      return;
    }
    
    if (password.length < 6) {
      setError(lang === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل');
      return;
    }
    
    // Determine role based on username pattern or default to 'worker'
    let role: Role = 'worker';
    if (username.toLowerCase().includes('admin')) {
      role = 'admin';
    } else if (username.toLowerCase().includes('driver')) {
      role = 'driver';
    }
    
    onLogin({ username, role });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-white relative overflow-hidden ${isRtl ? 'font-arabic' : ''}`}>
      {/* Decorative background elements with soft high-key colors */}
      <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px] opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-red-100/30 rounded-full blur-[120px] opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className={`max-w-md w-full z-10 px-6 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
        {/* Language Toggle */}
        <div className="flex justify-end mb-8">
          <button 
            onClick={() => onLanguageToggle(lang === 'fr' ? 'ar' : 'fr')}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-sm font-bold text-gray-800 hover:border-blue-400 hover:text-blue-600 transition-all duration-300 shadow-sm"
          >
            <span className="text-xl transform group-hover:scale-125 transition-transform">{lang === 'fr' ? '🇸🇦' : '🇫🇷'}</span>
            {lang === 'fr' ? 'العربية' : 'Français'}
          </button>
        </div>

        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(59,130,246,0.15)] overflow-hidden border border-gray-100">
          <div className="p-8 md:p-12">
            <div className="flex justify-center mb-10">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-red-600 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-red-600 rounded-[2rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl transform group-hover:scale-105 transition-transform duration-700">
                  D
                </div>
              </div>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
                {t.loginTitle}
              </h1>
              <p className="text-gray-600 font-semibold text-lg opacity-80">
                {lang === 'fr' ? 'Solution de Mobilité Intelligente' : 'حلول التنقل الذكي'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className={`p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 font-bold text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <label className={`block text-xs font-black text-gray-900 tracking-widest uppercase px-1 ${isRtl ? 'text-right' : ''}`}>
                  {t.usernameLabel}
                </label>
                <div className="relative group">
                  <span className={`absolute inset-y-0 ${isRtl ? 'right-5' : 'left-5'} flex items-center text-gray-400 group-focus-within:text-blue-600 transition-colors text-xl`}>
                    👤
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full ${isRtl ? 'pr-14 pl-5 text-right' : 'pl-14 pr-5'} py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-3xl text-gray-900 font-bold outline-none transition-all duration-500 placeholder-gray-300 shadow-inner`}
                    placeholder={lang === 'fr' ? 'Email ou nom d\'utilisateur' : 'البريد الإلكتروني أو اسم المستخدم'}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className={`block text-xs font-black text-gray-900 tracking-widest uppercase px-1 ${isRtl ? 'text-right' : ''}`}>
                  {t.passwordLabel}
                </label>
                <div className="relative group">
                  <span className={`absolute inset-y-0 ${isRtl ? 'right-5' : 'left-5'} flex items-center text-gray-400 group-focus-within:text-red-600 transition-colors text-xl`}>
                    🔒
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ${isRtl ? 'pr-14 pl-5 text-right' : 'pl-14 pr-5'} py-5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-500 rounded-3xl text-gray-900 font-bold outline-none transition-all duration-500 placeholder-gray-300 shadow-inner`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <GradientButton type="submit" className="w-full py-5 text-2xl mt-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
                {t.loginButton}
              </GradientButton>
            </form>
          </div>
        </div>

        <p className={`text-center text-gray-500 text-sm font-bold mt-12 tracking-wide flex items-center justify-center gap-2 ${isRtl ? 'font-arabic flex-row-reverse' : ''}`}>
          <span>DriveFlow</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>{lang === 'fr' ? 'Élégance & Performance' : 'الأناقة والأداء'}</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
