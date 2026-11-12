import React, { useState, useEffect } from 'react';
import { Coins, Plus, Calendar, Check, ArrowDownLeft, Shield, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdvancesPage = ({ preselectedWorkerId }) => {
  const { data, addAdvance, deleteAdvance, t } = useApp();
  const { workers, sites, advances } = data;

  const [selectedWorkerId, setSelectedWorkerId] = useState(preselectedWorkerId || workers[0]?.id || '');
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || '');
  const [advDate, setAdvDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('घरखर्च उचल');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [success, setSuccess] = useState('');

  // Auto-sync selected worker and site when Firebase updates asynchronously
  useEffect(() => {
    if (preselectedWorkerId && workers.some(w => w.id === preselectedWorkerId)) {
      setSelectedWorkerId(preselectedWorkerId);
    } else if (workers.length > 0 && (!selectedWorkerId || !workers.some(w => w.id === selectedWorkerId))) {
      setSelectedWorkerId(workers[0].id);
    } else if (workers.length === 0 && selectedWorkerId) {
      setSelectedWorkerId('');
    }
  }, [workers, preselectedWorkerId, selectedWorkerId]);

  useEffect(() => {
    if (sites.length > 0 && (!selectedSiteId || !sites.some(s => s.id === selectedSiteId))) {
      setSelectedSiteId(sites[0].id);
    } else if (sites.length === 0 && selectedSiteId) {
      setSelectedSiteId('');
    }
  }, [sites, selectedSiteId]);

  const quickAmounts = [200, 500, 1000, 2000, 5000];

  const handleSaveAdvance = (e) => {
    e.preventDefault();
    if (!selectedWorkerId || !amount || Number(amount) <= 0) {
      alert("कृपया कामगार व योग्य उचल रक्कम टाका");
      return;
    }

    addAdvance({
      workerId: selectedWorkerId,
      siteId: selectedSiteId,
      date: advDate,
      amount: Number(amount),
      reason,
      paymentMode
    });

    const worker = workers.find(w => w.id === selectedWorkerId);
    setSuccess(`₹${amount} उचल "${worker?.fullName}" यांच्या नावावर नोंदवली गेली!`);
    setAmount('');
    setTimeout(() => setSuccess(''), 4000);
  };

  const totalAdvancesSum = advances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner - Bento Hero */}
      <div className="bento-hero p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>💰</span> {t.advancesTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            रोजच्या रोख किंवा UPI उचल नोंदी व आपोआप चालू बाकी हिशोब
          </p>
        </div>

        <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-900 tactile-well">
          एकूण नोंदवलेली उचल: <span className="font-black text-sm text-blue-700">₹{totalAdvancesSum.toLocaleString()}</span>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid: New Advance Form & Advance History Table - Bento Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Give Advance Form */}
        <div className="lg:col-span-5 bento-card p-6">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>नवीन उचल (Advance) द्या</span>
          </h3>

          <form onSubmit={handleSaveAdvance} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                कामगार निवडा
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden cursor-pointer"
              >
                {workers.length === 0 && (
                  <option value="">-- आधी कामगार जोडा --</option>
                )}
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.fullName} (दर: ₹{w.dailyRate})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  साईट निवडा
                </label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden cursor-pointer"
                >
                  {sites.length === 0 && <option value="">ऑफिस / सर्वसाधारण</option>}
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  तारीख
                </label>
                <input
                  type="date"
                  value={advDate}
                  onChange={(e) => setAdvDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.advanceAmount}
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="उदा. 500 किंवा 2000"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:bg-white focus:border-blue-500 outline-hidden"
              />

              {/* Quick Amount Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px] font-bold text-slate-600 transition-colors"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.advanceReason}
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="घरखर्च, दवाखाना, सण-उत्सव"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.paymentMode}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('CASH')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                    paymentMode === 'CASH'
                      ? 'tactile-btn-primary shadow-sm'
                      : 'tactile-btn text-slate-700'
                  }`}
                >
                  💵 {t.cash}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('UPI')}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                    paymentMode === 'UPI'
                      ? 'tactile-btn-primary shadow-sm'
                      : 'tactile-btn text-slate-700'
                  }`}
                >
                  📱 {t.online}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="tactile-btn-emerald w-full py-3 text-white font-extrabold text-xs rounded-xl"
            >
              {t.saveAdvance}
            </button>
          </form>
        </div>

        {/* Right: Advances History Log - Bento Card */}
        <div className="lg:col-span-7 bento-card p-6">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>{t.advanceHistory} ({advances.length} नोंदी)</span>
            <span className="text-[11px] font-semibold text-slate-400">तारीखवार यादी</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] text-slate-400 font-extrabold uppercase">
                  <th className="pb-2.5">तारीख</th>
                  <th className="pb-2.5">कामगार</th>
                  <th className="pb-2.5">रक्कम</th>
                  <th className="pb-2.5">कारण</th>
                  <th className="pb-2.5 text-right">प्रकार / कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {advances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      अजून कोणतीही उचल नोंदवलेली नाही.
                    </td>
                  </tr>
                ) : (
                  advances.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 text-slate-500 font-mono">{item.date}</td>
                      <td className="py-3 font-bold text-slate-800">{item.workerName}</td>
                      <td className="py-3 font-extrabold text-red-600">₹{item.amount?.toLocaleString()}</td>
                      <td className="py-3 text-slate-600">{item.reason}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.paymentMode === 'CASH' ? 'रोख' : 'UPI'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`₹${item.amount} उचल नोंद हटवायची का?`)) {
                                deleteAdvance(item.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            title="उचल नोंद हटवा"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
