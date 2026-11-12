import React from 'react';
import { Globe, LogOut, User, HardHat, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const { data, language, toggleLanguage, t, currentUser, logout } = useApp();
  const { firmProfile } = data;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs no-print">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src="/shriram_logo.jpg"
            alt="श्रीराम प्लंबिंग वर्क्स"
            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
          />
          <span className="led-pulse-emerald absolute -top-1 -right-1" title="सिस्टम सक्रिय"></span>
        </div>
        <div>
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-2">
            <span>{firmProfile.firmName || t.appName}</span>
          </h1>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{firmProfile.tagline || t.appSub}</span>
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Language Switcher - Tactile Rocker Feel */}
        <button
          onClick={toggleLanguage}
          className="tactile-btn flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all shadow-xs"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
        </button>

        {/* User Badge */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.fullName}
              </div>
              <div className="text-[10px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {t.adminBadge}
              </div>
            </div>

            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 tactile-btn">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>

            <button
              onClick={logout}
              title={t.logout}
              className="tactile-btn p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
