import React, { useState, useEffect, useRef } from 'react';
import { FileText, Printer, Calendar, Download, ChevronRight, CheckCircle2, Building2, Users, Eye, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsPage = ({ onOpenSlipModal }) => {
  const { data, calculateWorkerKhata, calculateBuilderBilling, t } = useApp();
  const { workers, builders, dailyWork, sites, firmProfile } = data;

  const [mainReportType, setMainReportType] = useState('workers'); // 'workers' | 'builders'
  const [activeTier, setActiveTier] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'yearly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [selectedBuilderId, setSelectedBuilderId] = useState(builders?.[0]?.id || '');
  const [builderInvoiceModal, setBuilderInvoiceModal] = useState(null);

  // Auto-sync builder selector when Firebase loads builders asynchronously
  useEffect(() => {
    if (builders && builders.length > 0 && (!selectedBuilderId || !builders.some(b => b.id === selectedBuilderId))) {
      setSelectedBuilderId(builders[0].id);
    } else if ((!builders || builders.length === 0) && selectedBuilderId) {
      setSelectedBuilderId('');
    }
  }, [builders, selectedBuilderId]);

  // Compute period filter across all 4 reporting tiers (Daily, Weekly, Monthly, Yearly)
  const todayStr = new Date().toISOString().split('T')[0];
  const workerPeriodFilter =
    activeTier === 'daily'
      ? todayStr
      : activeTier === 'weekly'
      ? `WEEK:${todayStr}`
      : activeTier === 'yearly'
      ? selectedMonth.substring(0, 4)
      : selectedMonth;

  // Compute aggregated report metrics for workers
  const reportWorkers = workers.map(w => {
    return calculateWorkerKhata(w.id, workerPeriodFilter);
  });

  const grandWagesEarned = reportWorkers.reduce((sum, k) => sum + (k?.currentWagesEarned || 0), 0);
  const grandAdvances = reportWorkers.reduce((sum, k) => sum + (k?.totalAdvancesTaken || 0), 0);
  const grandNetPayable = reportWorkers.reduce((sum, k) => sum + (k?.netCashPayable || 0), 0);
  const grandDaysWorked = reportWorkers.reduce((sum, k) => sum + (k?.totalDaysEquivalent || 0), 0);

  // Compute builder billing
  const activeBuilderBilling = selectedBuilderId
    ? calculateBuilderBilling(selectedBuilderId, selectedMonth)
    : null;

  const totalAllBuildersBilling = (dailyWork || [])
    .filter(w => w?.date?.startsWith(selectedMonth))
    .reduce((sum, w) => sum + (Number(w.totalAmount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className={builderInvoiceModal ? 'space-y-6 no-print' : 'space-y-6'}>
      {/* Top Banner - Bento Hero */}
      <div className="bento-hero p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>📑</span> हिशोब व मासिक बिलिंग अहवाल (Billing & Invoices)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            कामगारांच्या मजुरी पावत्या आणि बिल्डर/इंजिनिअर्सची कामाची अधिकृत मासिक बिले
          </p>
        </div>

        {/* Main Tab Toggle: Worker Khata vs Builder Invoices - Tactile Well */}
        <div className="tactile-well p-1 rounded-2xl flex items-center gap-1 text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setMainReportType('workers')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              mainReportType === 'workers'
                ? 'tactile-btn-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.workerSlipTab}</span>
          </button>
          <button
            onClick={() => setMainReportType('builders')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              mainReportType === 'builders'
                ? 'tactile-btn-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t.builderInvoiceTab}</span>
          </button>
        </div>
      </div>

      {/* Filter / Month Selector - Bento Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 bento-card p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">महिना निवडा:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white outline-hidden cursor-pointer"
          />
        </div>

        {mainReportType === 'workers' && (
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-[11px] font-bold">
            {[
              { id: 'daily', label: t.tabDaily },
              { id: 'weekly', label: t.tabWeekly },
              { id: 'monthly', label: t.tabMonthly },
              { id: 'yearly', label: t.tabYearly }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTier(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTier === tab.id
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW 1: WORKERS REPORTS */}
      {mainReportType === 'workers' && (
        <div className="space-y-6">
          {/* Aggregate Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                एकूण हजेरी दिवस
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {grandDaysWorked} <span className="text-xs font-bold text-slate-400">दिवस</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.totalWagesEarned}
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{grandWagesEarned.toLocaleString()}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t.totalAdvanceDeducted}
              </span>
              <div className="text-2xl font-black text-red-600 mt-1">
                ₹{grandAdvances.toLocaleString()}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-xs bg-emerald-50/30">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                {t.netCashToPay}
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                ₹{grandNetPayable.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Detailed Ledger & Slip Generation Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800">
                कामगारवार मासिक पत्रक व अधिकृत पावती यादी
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {reportWorkers.length} कामगारांचा हिशोब
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] text-slate-400 font-extrabold uppercase">
                    <th className="py-3 px-5">कामगार</th>
                    <th className="py-3 px-3">रोजंदारी दर</th>
                    <th className="py-3 px-3">हजेरी दिवस</th>
                    <th className="py-3 px-3">कमावलेली मजुरी</th>
                    <th className="py-3 px-3">मागील बाकी</th>
                    <th className="py-3 px-3">घेतलेली उचल</th>
                    <th className="py-3 px-3">निव्वळ देय (Net)</th>
                    <th className="py-3 px-5 text-right">पावती कृती</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reportWorkers.map((k) => {
                    if (!k) return null;
                    const { worker, fullDays, halfDays, totalDaysEquivalent, dailyRate, currentWagesEarned, openingBalance, totalAdvancesTaken, netCashPayable } = k;
                    const isExcess = netCashPayable < 0;

                    return (
                      <tr key={worker.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-extrabold text-slate-900">
                          <div>{worker.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{worker.skill}</div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 font-semibold">₹{dailyRate}</td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">
                          {fullDays}F + {halfDays}H ({totalDaysEquivalent})
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-800">₹{currentWagesEarned.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-slate-500">₹{openingBalance.toLocaleString()}</td>
                        <td className="py-3.5 px-3 font-bold text-red-600">-₹{totalAdvancesTaken.toLocaleString()}</td>
                        <td className="py-3.5 px-3 font-black text-sm">
                          {isExcess ? (
                            <span className="text-red-600 font-bold">
                              ₹{Math.abs(netCashPayable).toLocaleString()} (येणे बाकी)
                            </span>
                          ) : (
                            <span className="text-emerald-600">
                              ₹{netCashPayable.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => onOpenSlipModal(worker.id, workerPeriodFilter)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{t.printSlip}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BUILDER MONTHLY INVOICE (बिल्डर मासिक बिल) */}
      {mainReportType === 'builders' && (
        <div className="space-y-6">
          {/* Builder Selector & Total Billed */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <label className="block text-xs font-extrabold text-slate-700 mb-2">
                बिल्डर / सिव्हिल इंजिनिअर निवडा:
              </label>
              <select
                value={selectedBuilderId}
                onChange={(e) => setSelectedBuilderId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
              >
                {builders.length === 0 && <option value="">-- बिल्डर उपलब्ध नाही --</option>}
                {builders.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.firmName} ({b.engineerName}) - {b.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/40 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase">
                {selectedMonth} मधील एकूण साईट बिलिंग
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                ₹{activeBuilderBilling?.totalBilled?.toLocaleString() || 0}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">
                एकूण {activeBuilderBilling?.worksCount || 0} काम नोंदी
              </span>
            </div>
          </div>

          {/* Builder Work Summary Cards & Print Action */}
          {activeBuilderBilling && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>{activeBuilderBilling.builder.firmName} ({activeBuilderBilling.builder.engineerName})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    फोन: {activeBuilderBilling.builder.phone} | पत्ता: {activeBuilderBilling.builder.location} | महिना: {selectedMonth}
                  </p>
                </div>

                <button
                  onClick={() => setBuilderInvoiceModal(activeBuilderBilling)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 self-start transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>अधिकृत मासिक बिल प्रिंट करा</span>
                </button>
              </div>

              {/* Category Breakdown Table */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
                  कामाच्या प्रकारानुसार एकत्रित सारांश (Category Summary)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeBuilderBilling.categorySummary.map((cat, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="font-extrabold text-slate-800 text-xs">{cat.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        प्रमाण: <span className="font-bold text-slate-800">{cat.quantity} {cat.unit}</span>
                      </div>
                      <div className="text-sm font-black text-emerald-700 mt-1">
                        ₹{cat.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Itemized Works Table */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">
                  तपशीलवार दैनिक नोंदी (Itemized Work Details)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-extrabold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">तारीख</th>
                        <th className="py-2.5 px-3">साईटचे नाव</th>
                        <th className="py-2.5 px-3">कामाचा प्रकार</th>
                        <th className="py-2.5 px-3">मोजमाप</th>
                        <th className="py-2.5 px-3">दर</th>
                        <th className="py-2.5 px-3 text-right">रक्कम (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {activeBuilderBilling.works.map(work => (
                        <tr key={work.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 font-bold text-slate-800">{work.date}</td>
                          <td className="py-2.5 px-3 text-slate-800">{work.siteName}</td>
                          <td className="py-2.5 px-3 text-blue-700 font-semibold">{work.categoryName}</td>
                          <td className="py-2.5 px-3">{work.quantity} {work.unit}</td>
                          <td className="py-2.5 px-3">₹{work.rate}</td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                            ₹{work.totalAmount?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {activeBuilderBilling.works.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                            या महिन्यामध्ये या बिल्डरसाठी कोणतीही नोंद आढळली नाही.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50 font-black text-slate-900 border-t border-slate-200">
                      <tr>
                        <td colSpan={5} className="py-3 px-4 text-right uppercase text-[11px]">
                          एकूण बिल रक्कम (Total Amount):
                        </td>
                        <td className="py-3 px-3 text-right text-sm text-emerald-700">
                          ₹{activeBuilderBilling.totalBilled.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Builder Printable Invoice Modal */}
      {builderInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 print-modal-overlay">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 print-modal-card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 no-print">
              <h3 className="text-base font-extrabold text-slate-900">
                बिल्डर मासिक बिल (Contractor Monthly Invoice)
              </h3>
              <button
                onClick={() => setBuilderInvoiceModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center print-modal-scroll">
              <div className="w-full max-w-[580px] bg-white p-8 border border-slate-300 shadow-md font-sans text-xs text-slate-900 leading-normal rounded-xl print-sheet">
                {/* Letterhead */}
                <div className="border-b-2 border-blue-600 pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img
                        src="/shriram_logo.jpg"
                        alt="श्रीराम लोगो"
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                      />
                      <div>
                        <h1 className="text-xl font-black text-blue-900">
                          {firmProfile.firmName}
                        </h1>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                          प्रोप्रायटर: {firmProfile.ownerName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {firmProfile.tagline}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {firmProfile.address}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-extrabold">
                        अधिकृत बिल (TAX INVOICE)
                      </span>
                      <div className="text-xs font-bold text-slate-800 mt-2">
                        मो.: {firmProfile.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill To */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">बिल ज्यांच्या नावे:</span>
                    <div className="font-extrabold text-sm text-slate-900">
                      {builderInvoiceModal.builder.firmName}
                    </div>
                    <div className="text-xs font-bold text-slate-700">
                      {builderInvoiceModal.builder.engineerName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      मो.: {builderInvoiceModal.builder.phone} | पत्ता: {builderInvoiceModal.builder.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-semibold block text-[11px]">बिल कालावधी:</span>
                    <div className="font-extrabold text-sm text-slate-900">{selectedMonth}</div>
                    <div className="text-[11px] text-slate-500 mt-1">दिनांक: {new Date().toLocaleDateString('mr-IN')}</div>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-xs border border-slate-200 mb-4 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 font-extrabold text-slate-700">
                    <tr>
                      <th className="p-2 text-left border-b border-slate-200">अ.क्र.</th>
                      <th className="p-2 text-left border-b border-slate-200">कामाचा तपशील</th>
                      <th className="p-2 text-center border-b border-slate-200">मोजमाप</th>
                      <th className="p-2 text-right border-b border-slate-200">दर</th>
                      <th className="p-2 text-right border-b border-slate-200">रक्कम (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {builderInvoiceModal.works.map((w, idx) => (
                      <tr key={w.id}>
                        <td className="p-2 text-slate-500">{idx + 1}</td>
                        <td className="p-2">
                          <div className="font-bold text-slate-800">{w.categoryName}</div>
                          <div className="text-[10px] text-slate-400">{w.siteName} • {w.date}</div>
                        </td>
                        <td className="p-2 text-center">{w.quantity} {w.unit}</td>
                        <td className="p-2 text-right">₹{w.rate}</td>
                        <td className="p-2 text-right font-bold">₹{w.totalAmount?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-black text-slate-900 border-t border-slate-200">
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right uppercase text-[11px]">एकूण बिल रक्कम:</td>
                      <td className="p-2.5 text-right text-base text-emerald-700">
                        ₹{builderInvoiceModal.totalBilled?.toLocaleString()} /-
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Signature */}
                <div className="pt-8 flex justify-between text-xs text-slate-600 border-t border-slate-200">
                  <div className="text-center">
                    <div className="font-bold text-slate-900">{firmProfile.ownerName}</div>
                    <div className="text-[11px] text-slate-500">श्रीराम प्लंबिंग वर्क्स, मिरजवाडी</div>
                    <div className="text-[10px] text-slate-400 mt-4">(अधिकृत स्वाक्षरी)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-900">{builderInvoiceModal.builder.engineerName}</div>
                    <div className="text-[11px] text-slate-500">{builderInvoiceModal.builder.firmName}</div>
                    <div className="text-[10px] text-slate-400 mt-4">(स्वीकृती स्वाक्षरी)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100 no-print">
              <button
                onClick={() => setBuilderInvoiceModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                बंद करा
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>बिल प्रिंट करा</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
