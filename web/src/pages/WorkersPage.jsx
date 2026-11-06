import React, { useState } from 'react';
import { Users, UserPlus, Phone, Coins, FileText, Check, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WorkersPage = ({ onOpenAdvanceModal, onOpenSlipModal }) => {
  const { data, addWorker, deleteWorker, calculateWorkerKhata, setSelectedSlipWorker, t } = useApp();
  const { workers } = data;

  const [showAddWorker, setShowAddWorker] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dailyRate, setDailyRate] = useState('600');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [skill, setSkill] = useState('धुमुस ऑपरेटर');
  const [success, setSuccess] = useState('');

  const handleAddWorker = (e) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert("कृपया नाव व मोबाईल नंबर टाका");
      return;
    }

    addWorker({
      fullName,
      phone,
      dailyRate,
      openingBalance,
      skill
    });

    setSuccess(`कामगार "${fullName}" यशस्वीपणे जोडला गेला!`);
    setFullName('');
    setPhone('');
    setShowAddWorker(false);
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Bento Hero */}
      <div className="bento-hero p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>👷</span> {t.workerTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            कामगारांची यादी, रोजंदारी दर, चालू हजेरी आणि मजुरी व उचल हिशोब लेजर
          </p>
        </div>

        <button
          onClick={() => setShowAddWorker(true)}
          className="tactile-btn-emerald px-4 py-2.5 text-white font-bold text-xs rounded-xl flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.addWorker}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Workers Grid Cards - Bento Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {workers.map((worker) => {
          const khata = calculateWorkerKhata(worker.id);
          const { fullDays, halfDays, totalDaysEquivalent, currentWagesEarned, totalAdvancesTaken, netCashPayable } = khata;

          return (
            <div
              key={worker.id}
              className="bento-card p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header: Name & Role */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {worker.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold">{worker.skill}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" /> {worker.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      ₹{worker.dailyRate} / दिवस
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`'${worker.fullName}' कामगाराचे रेकॉर्ड हटवायचे का?`)) {
                          deleteWorker(worker.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="कामगार हटवा"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Khata Formula Breakdown Box */}
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>हजेरी तपशील:</span>
                    <span className="font-bold text-slate-800">
                      {fullDays} Full + {halfDays} Half ({totalDaysEquivalent} दिवस)
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>एकूण कमावलेली मजुरी:</span>
                    <span className="font-bold text-slate-800">₹{currentWagesEarned.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>मागील शिल्लक बाकी:</span>
                    <span className="font-bold text-slate-800">₹{worker.openingBalance?.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-red-600 font-semibold border-t border-slate-200/60 pt-1.5">
                    <span>घेतलेली एकूण उचल (वजावट):</span>
                    <span>- ₹{totalAdvancesTaken.toLocaleString()}</span>
                  </div>

                  {/* Net Cash Payable or Excess Advance */}
                  {netCashPayable < 0 ? (
                    <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-xl border border-red-200 mt-2 font-bold">
                      <span className="text-red-800 text-[11px] uppercase">
                        ⚠️ अतिरिक्त उचल / शिल्लक येणे:
                      </span>
                      <span className="text-base text-red-600 font-black">
                        ₹{Math.abs(netCashPayable).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 mt-2 font-bold">
                      <span className="text-emerald-800 text-[11px] uppercase">
                        आज हातावर देणे बाकी:
                      </span>
                      <span className="text-base text-emerald-700 font-black">
                        ₹{netCashPayable.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Tactile */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onOpenAdvanceModal(worker.id)}
                  className="tactile-btn px-3.5 py-2 rounded-xl text-blue-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.giveAdvance}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenSlipModal(worker.id)}
                  className="tactile-btn-emerald px-3.5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.viewSlip}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Worker Modal */}
      {showAddWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">{t.addWorker}</h3>
            <p className="text-xs text-slate-500 mb-4">
              कामगाराचे नाव, मोबाईल नंबर, रोजंदारी दर व जुनी बाकी नोंदवा
            </p>

            <form onSubmit={handleAddWorker} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.workerName}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="उदा. राजू संभाजी पाटील"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.mobileNumber}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.skillType}
                  </label>
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    placeholder="धुमुस ऑपरेटर / हेल्पर"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.dailyWageRate}
                  </label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    placeholder="600"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.openingBalance}
                  </label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddWorker(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-200"
                >
                  {t.saveWorker}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
