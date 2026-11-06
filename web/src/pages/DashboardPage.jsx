import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Coins, 
  TrendingUp, 
  CheckCircle2, 
  PlusCircle, 
  ArrowUpRight, 
  Clock,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VoiceInput } from '../components/VoiceInput';

export const DashboardPage = () => {
  const { data, t, setActiveTab, setSelectedSlipWorker } = useApp();
  const { sites, workers, attendance, advances, dailyWork } = data;
  const todayStr = new Date().toISOString().split('T')[0];

  const [voiceNote, setVoiceNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);

  // Calculations for today
  const activeSitesCount = sites.filter(s => s.status === 'ACTIVE').length;
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const todayWorkersPresent = todayAttendance.filter(a => a.status === 'FULL' || a.status === 'HALF').length;
  const todayAdvancesTotal = advances
    .filter(a => a.date === todayStr)
    .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const todayBillingTotal = dailyWork
    .filter(d => d.date === todayStr)
    .reduce((sum, d) => sum + (Number(d.totalBilling) || 0), 0);

  const handleSaveVoiceNote = () => {
    if (voiceNote.trim()) {
      setSavedNotes([voiceNote.trim(), ...savedNotes]);
      setVoiceNote('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Bento Hero */}
      <div className="bento-hero p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 font-bold text-xs mb-2 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>दैनिक कामाचा सारांश</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t.todaySummary}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            दिनांक: {new Date().toLocaleDateString('mr-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick Action Pills - 3D Tactile Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('attendance')}
            className="tactile-btn-emerald px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.fastAttendanceBtn}</span>
          </button>

          <button
            onClick={() => setActiveTab('advances')}
            className="tactile-btn-primary px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2"
          >
            <Coins className="w-4 h-4" />
            <span>{t.recordAdvanceBtn}</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards - Bento Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Sites */}
        <div className="bento-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.activeSites}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 tactile-btn">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{activeSitesCount} <span className="text-xs font-bold text-slate-400">साईट्स</span></div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            काम चालू असलेल्या साईट्स
          </div>
        </div>

        {/* Card 2: Today Workers */}
        <div className="bento-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.todayWorkers}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 tactile-btn">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{todayWorkersPresent} / {workers.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            आज हजर कामगार (Full/Half)
          </div>
        </div>

        {/* Card 3: Today Advances */}
        <div className="bento-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.todayAdvances}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 tactile-btn">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹{todayAdvancesTotal.toLocaleString()}</div>
          <div className="text-[11px] font-semibold text-blue-600 mt-1">
            आज रोख वाटलेली उचल
          </div>
        </div>

        {/* Card 4: Today Work Amount */}
        <div className="bento-card p-5 border-emerald-200">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {t.todayBilling}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 tactile-btn">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">₹{todayBillingTotal.toLocaleString()}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            धुमुस व कटिंग एकूण काम
          </div>
        </div>
      </div>

      {/* Main Grid: Voice Notes & Ongoing Site Work */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Marathi Voice Memo */}
        <div className="lg:col-span-1 bento-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span>🎙️</span> {t.voiceNoteTitle}
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              मराठी व्हॉईस (mr-IN)
            </span>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={voiceNote}
                onChange={(e) => setVoiceNote(e.target.value)}
                placeholder="माईकवर क्लिक करून शुद्ध मराठीत बोला (उदा. 'त्रिमूर्ती साईटवर आज ६ होल कोअर कटिंग पूर्ण झाले')..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden transition-all resize-none tactile-well leading-relaxed"
              />
              {voiceNote && (
                <button
                  type="button"
                  onClick={() => setVoiceNote('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-red-500 p-1 text-xs"
                  title="मजकूर पुसा (Clear)"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Contractor Marathi Chips */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {[
                "कोअर कटिंग पूर्ण",
                "धुमसणे काम पूर्ण",
                "वॉल कटिंग चालू",
                "उद्या मजूर पाठवा"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setVoiceNote(prev => prev ? `${prev}, ${chip}` : chip)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-bold text-slate-600 transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <VoiceInput
                onTranscript={(text) => setVoiceNote(prev => prev ? `${prev} ${text}` : text)}
              />
              
              <button
                onClick={handleSaveVoiceNote}
                disabled={!voiceNote.trim()}
                className="tactile-btn-primary px-3.5 py-2 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                {t.saveVoiceNote}
              </button>
            </div>

            {/* Saved Audio Notes List */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                अलिकडील व्हॉईस नोंदी:
              </div>
              {savedNotes.length === 0 ? (
                <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  अजून कोणतीही व्हॉईस नोंद नाही.
                </div>
              ) : (
                savedNotes.map((note, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-700 font-medium leading-relaxed">
                    {note}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Sites & Work Overview */}
        <div className="lg:col-span-2 bento-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">
                चालू साईट्स व कामाची स्थिती (Active Sites)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">४ ते ५ साईट्सवरील काम व हजेरीचा तपशील</p>
            </div>
            <button
              onClick={() => setActiveTab('sites')}
              className="tactile-btn px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
            >
              <span>सर्व साईट्स पहा</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {sites.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-slate-600">अजून कोणतीही साईट जोडलेली नाही.</p>
                <p className="mt-1 text-[11px]">नवीन साईट जोडण्यासाठी "सर्व साईट्स पहा" वर क्लिक करा.</p>
              </div>
            ) : (
              sites.map((site) => {
              const siteWork = dailyWork.filter(d => d.siteId === site.id);
              const totalSqft = siteWork.reduce((sum, d) => sum + (d.dhumusSqft || 0), 0);
              const totalHoles = siteWork.reduce((sum, d) => sum + (d.coreCuttingHoles || 0), 0);
              const siteWorkersCount = attendance.filter(a => a.siteId === site.id && a.date === todayStr).length;

              return (
                <div
                  key={site.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{site.name}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        site.status === 'ACTIVE' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {site.status === 'ACTIVE' ? t.active : t.completed}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>📍 {site.location}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-600">आज {siteWorkersCount} मजूर कार्यरत</span>
                    </div>
                  </div>

                  {/* Measurement Metrics */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">धुमुस काम</div>
                      <div className="font-extrabold text-slate-800">{totalSqft.toLocaleString()} sq.ft</div>
                    </div>
                    <div className="text-right pl-3 border-l border-slate-200">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">कोर कटिंग</div>
                      <div className="font-extrabold text-blue-600">{totalHoles} होल्स</div>
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      </div>
    </div>
  );
};
