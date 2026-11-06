import React from 'react';
import { 
  LayoutDashboard, 
  Building2,
  MapPin, 
  CheckCircle2, 
  Users, 
  Coins, 
  FileText, 
  Settings,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const { activeTab, setActiveTab, t, language } = useApp();

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'builders', label: t.navBuilders, icon: Building2 },
    { id: 'sites', label: t.navSites, icon: MapPin },
    { id: 'attendance', label: t.navAttendance, icon: CheckCircle2, highlight: true },
    { id: 'workers', label: t.navWorkers, icon: Users },
    { id: 'advances', label: t.navAdvances, icon: Coins },
    { id: 'reports', label: t.navReports, icon: FileText },
    { id: 'settings', label: t.navSettings, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-3.5 shrink-0 h-full flex flex-col justify-between overflow-y-auto">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {language === 'mr' ? 'मेनू (MENU)' : 'MAIN MENU'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : item.highlight
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate">{item.label}</span>
              {item.highlight && !isActive && (
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Clean Authentic Business Footer (Zero AI Gimmicks) */}
      <div className="pt-3 border-t border-slate-100 px-3">
        <div className="text-xs font-extrabold text-slate-800 tracking-tight">श्रीराम प्लंबिंग वर्क्स</div>
        <div className="text-[10px] text-slate-500 font-medium mt-0.5">मिरजवाडी • ९९९९९९९९९९</div>
      </div>
    </aside>
  );
};
