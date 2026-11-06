import React, { useState } from 'react';
import { Settings, Save, Check, Database, Shield, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { USE_FIREBASE } from '../services/firebaseConfig';

export const SettingsPage = () => {
  const { data, updateFirmProfile, t } = useApp();
  const { firmProfile } = data;

  const [form, setForm] = useState({
    firmName: firmProfile.firmName || '',
    ownerName: firmProfile.ownerName || '',
    phone: firmProfile.phone || '',
    address: firmProfile.address || '',
    thermalHeader: firmProfile.thermalHeader || '',
    tagline: firmProfile.tagline || ''
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFirmProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>⚙️</span> {t.settingsTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            फर्मचे नाव, पावती हेडर मजकूर आणि क्लाऊड डेटाबेस सेटिंग्ज
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{t.settingsSavedSuccess}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.firmName}
              </label>
              <input
                type="text"
                required
                value={form.firmName}
                onChange={(e) => setForm({ ...form, firmName: e.target.value })}
                placeholder="उदा. निर्माण कन्स्ट्रक्शन्स व मशिन वर्क्स"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.ownerName}
              </label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                placeholder="उदा. संतोष सर (कंत्राटदार)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.contactPhone}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="98XXXXXXXX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.firmAddress}
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="उदा. आष्टा / मिरजवाडी, सांगली"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              फर्म टॅगलाईन (Tagline)
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="उदा. धुमुस मशिन, कोर कटिंग व सिल्व्हिल कंत्राटदार"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.thermalHeader}
            </label>
            <input
              type="text"
              value={form.thermalHeader}
              onChange={(e) => setForm({ ...form, thermalHeader: e.target.value })}
              placeholder="मासिक मजुरी व उचल हिशोब पावती"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              हा मजकूर कामगारांना दिल्या जाणाऱ्या २/३-इंच थर्मल प्रिंट पावतीवर सर्वात वर छापला जाईल.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveSettings}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Firebase Database Readiness Status Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">
              Firebase Cloud Database कनेक्टिविटी
            </h3>
            <p className="text-xs text-slate-500">
              {USE_FIREBASE ? "🟢 Firebase जोडलेले आहे (Live Sync Active)" : "🟡 स्थानिक डेटाबेस चालू आहे (Offline LocalStorage Active)"}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2 leading-relaxed">
          <p className="font-semibold text-slate-800">
            📌 Firebase JSON कसे जोडायचे:
          </p>
          <p>
            काम पूर्ण झाल्यावर तुम्ही तुमचा Firebase प्रोजेक्ट बनवून त्यामधील कॉन्फिगरेशन कीज <code className="bg-white px-1.5 py-0.5 rounded-md border border-slate-200 font-mono text-blue-600">web/src/services/firebaseConfig.js</code> या फाईलमध्ये टाकू शकता आणि <code className="bg-white px-1.5 py-0.5 rounded-md border border-slate-200 font-mono text-emerald-600">USE_FIREBASE = true</code> करू शकता.
          </p>
          <p className="text-emerald-700 font-medium">
            ✅ संपूर्ण डेटा स्कीमा (Sites, Workers, Attendance, Advances, DailyWork) Firebase Firestore साठी 100% तयार आहे.
          </p>
        </div>
      </div>
    </div>
  );
};
