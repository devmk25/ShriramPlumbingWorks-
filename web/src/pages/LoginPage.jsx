import React, { useState } from 'react';
import { HardHat, Lock, Phone, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage = () => {
  const { login, t, language, toggleLanguage } = useApp();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mobile || !password) {
      setError(language === 'mr' ? 'कृपया मोबाईल नंबर व पासवर्ड टाका.' : 'Please enter mobile number and password.');
      return;
    }
    const res = login(mobile, password);
    if (!res.success) {
      setError(res.message);
    }
  };

  const fillDemo = (m, p) => {
    setMobile(m);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bento-card shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-8 text-center text-white relative">
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleLanguage}
              className="text-xs tactile-btn text-blue-700 px-3 py-1 rounded-xl font-bold transition-all"
            >
              {language === 'mr' ? 'English' : 'मराठी'}
            </button>
          </div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md overflow-hidden p-1">
            <img
              src="/shriram_logo.jpg"
              alt="श्रीराम प्लंबिंग वर्क्स लोगो"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <h2 className="text-xl font-black tracking-tight">{language === 'mr' ? 'श्रीराम प्लंबिंग वर्क्स' : 'Shriram Plumbing Works'}</h2>
          <p className="text-blue-100 text-xs mt-1 font-medium">{language === 'mr' ? 'मिरजवाडी • कंत्राटदार संतोष मेंगाणे' : 'Mirajwadi • Contractor Santosh Mengane'}</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-extrabold text-slate-800">{t.loginTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">{t.loginSub}</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.mobileLabel}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="उदा. 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all tactile-well"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all tactile-well"
                />
              </div>
            </div>

            <button
              type="submit"
              className="tactile-btn-emerald w-full mt-2 py-3 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2"
            >
              <span>{t.loginBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              द्रुत ॲडमिन लॉगिन (Quick Admin Access)
            </span>
            <button
              type="button"
              onClick={() => fillDemo('9999999999', 'admin')}
              className="tactile-btn w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-800 font-bold flex items-center justify-center gap-2 text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>👑 ॲडमिन क्रेडेंशियल्स भरा (9999999999 / admin)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
