import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, FileText, CheckCircle2, AlertTriangle, Maximize2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ThermalReceiptModal = ({ workerId, month = "2026-10", onClose }) => {
  const { data, calculateWorkerKhata, t } = useApp();
  const [printFormat, setPrintFormat] = useState('80mm'); // '80mm' | 'a4'
  const printRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const khata = calculateWorkerKhata(workerId, month);
  if (!khata) return null;

  const { worker, fullDays, halfDays, totalDaysEquivalent, dailyRate, openingBalance, currentWagesEarned, totalPayableBeforeAdvances, totalAdvancesTaken, advancesList, netCashPayable } = khata;
  const { firmProfile } = data;

  const handlePrint = () => {
    window.print();
  };

  const isExcessAdvance = netCashPayable < 0;
  const excessAmount = Math.abs(netCashPayable);

  return (
    <div className="fixed inset-0 z-50 flex flex-col w-screen h-screen bg-slate-900/95 backdrop-blur-md overflow-hidden no-print">
      
      {/* Top Full-Screen Master Header Bar */}
      <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 text-white z-20">
        
        {/* Left: Document Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
              <span>अधिकृत मजुरी व उचल पावती (Payment Slip)</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {worker.fullName} • {month} • {firmProfile.firmName || "श्रीराम प्लंबिंग वर्क्स"}
            </p>
          </div>
        </div>

        {/* Center: Format Switcher (80mm Thermal vs A4 Letterhead) */}
        <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 hidden sm:flex items-center gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setPrintFormat('80mm')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              printFormat === '80mm'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🧾</span>
            <span>थर्मल पावती (80mm)</span>
          </button>
          <button
            type="button"
            onClick={() => setPrintFormat('a4')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              printFormat === 'a4'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📄</span>
            <span>A4 लेटरहेड (पूर्ण पान)</span>
          </button>
        </div>

        {/* Right: Print Button + Big Prominent Cross (X) Icon to Close */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95"
            title="पावती प्रिंट किंवा PDF सेव्ह करा"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">प्रिंट पावती (Print / PDF)</span>
            <span className="md:hidden">प्रिंट</span>
          </button>

          {/* Prominent Cross Icon at Top Right */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-red-600/90 hover:text-white text-slate-300 border border-slate-700 hover:border-red-500 flex items-center justify-center transition-all active:scale-90"
            title="पूर्ण पान बंद करा (Close - Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Format Toggle for Mobile Screens */}
      <div className="sm:hidden bg-slate-800/90 p-2 border-b border-slate-700 flex justify-center gap-2 text-xs font-bold shrink-0">
        <button
          type="button"
          onClick={() => setPrintFormat('80mm')}
          className={`px-3 py-1.5 rounded-lg ${
            printFormat === '80mm' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          🧾 थर्मल (80mm)
        </button>
        <button
          type="button"
          onClick={() => setPrintFormat('a4')}
          className={`px-3 py-1.5 rounded-lg ${
            printFormat === 'a4' ? 'bg-blue-600 text-white' : 'text-slate-400'
          }`}
        >
          📄 A4 लेटरहेड
        </button>
      </div>

      {/* Main Full-Page Canvas Area (Scrollable with ample padding) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 flex justify-center items-start bg-slate-800/60">
        
        {printFormat === '80mm' ? (
          /* ============================================================== */
          /* 1. PROFESSIONAL 80mm THERMAL RECEIPT SLIP                      */
          /* ============================================================== */
          <div
            ref={printRef}
            className="w-full max-w-[390px] bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-200 my-4 font-mono text-xs leading-relaxed"
          >
            {/* Header: Logo & Business Branding */}
            <div className="text-center pb-4 border-b-2 border-dashed border-slate-400">
              <img
                src="/shriram_logo.jpg"
                alt="श्रीराम लोगो"
                className="w-14 h-14 mx-auto rounded-xl object-cover mb-2 border border-slate-200 shadow-xs"
              />
              <div className="font-black text-base tracking-wide uppercase text-blue-900 font-sans">
                {firmProfile.firmName || "श्रीराम प्लंबिंग वर्क्स"}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5 font-sans">
                प्रोप्रायटर: {firmProfile.ownerName || "संतोष मेंगाणे"}
              </div>
              <div className="text-[11px] text-slate-600 font-sans mt-0.5">
                {firmProfile.tagline || "धुमुस मशिन, कोअर कटिंग, वॉल कटिंग व सिव्हिल कंत्राटदार"}
              </div>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                {firmProfile.address || "मु. पो. मिरजवाडी, ता. आष्टा, जि. सांगली"} | मो.: {firmProfile.phone || "9999999999"}
              </div>
              <div className="text-[11px] font-bold mt-2 text-blue-900 bg-blue-50 border border-blue-200 py-1 rounded-md font-sans">
                मासिक मजुरी व उचल हिशोब • {month}
              </div>
            </div>

            {/* Worker Details Section */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5 font-sans">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">कामगाराचे नाव:</span>
                <span className="font-black text-slate-900 text-sm">{worker.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">कौशल्य / काम:</span>
                <span className="font-bold text-slate-700 text-xs">{worker.skill}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">रोजंदारी दर:</span>
                <span className="font-extrabold text-blue-700 text-xs">₹{dailyRate} / दिवस</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs">हजेरी तपशील:</span>
                <span className="font-bold text-slate-800 text-xs">{fullDays} Full + {halfDays} Half = {totalDaysEquivalent} दिवस</span>
              </div>
            </div>

            {/* Earnings Calculation Breakdown */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5 font-sans">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">चालू महिन्याची मजुरी:</span>
                <span className="font-bold text-slate-900">₹{currentWagesEarned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>मागील जुनी बाकी:</span>
                <span className="font-bold">₹{openingBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 pt-1.5 border-t border-dotted border-slate-300 text-sm">
                <span>एकूण देय मजुरी:</span>
                <span className="text-blue-700">₹{totalPayableBeforeAdvances.toLocaleString()}</span>
              </div>
            </div>

            {/* Advances (उचल) Deductions */}
            <div className="py-3 border-b border-dashed border-slate-400 font-sans">
              <div className="font-bold text-xs mb-2 text-slate-800 flex justify-between">
                <span>घेतलेली उचल (Advances):</span>
                <span className="text-red-600 font-black">- ₹{totalAdvancesTaken.toLocaleString()}</span>
              </div>
              {advancesList.length === 0 ? (
                <div className="text-slate-400 italic text-[11px] py-0.5">कोणतीही उचल घेतलेली नाही.</div>
              ) : (
                <div className="space-y-1 text-xs">
                  {advancesList.map((adv) => (
                    <div key={adv.id} className="flex justify-between text-slate-700 bg-slate-50 px-2 py-1 rounded">
                      <span>• {adv.date} ({adv.reason})</span>
                      <span className="font-bold text-slate-900">₹{adv.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Final Net Cash Settlement Highlight Box */}
            <div className="my-4 font-sans">
              {isExcessAdvance ? (
                <div className="py-3 px-3 text-center bg-red-50 rounded-xl border-2 border-red-300 shadow-sm">
                  <div className="text-xs font-bold text-red-800">
                    ⚠️ अतिरिक्त उचल / मजुराकडे शिल्लक येणे
                  </div>
                  <div className="text-xl font-black text-red-600 mt-1">
                    ₹{excessAmount.toLocaleString()} /-
                  </div>
                  <div className="text-[10px] text-red-700 mt-0.5">
                    (ही रक्कम पुढील महिन्याच्या खात्यावर वर्ग होईल)
                  </div>
                </div>
              ) : (
                <div className="py-3.5 px-3 text-center bg-emerald-50 rounded-xl border-2 border-emerald-400 shadow-sm">
                  <div className="text-xs font-bold text-emerald-800">
                    ✅ आज हातात देय निव्वळ मजुरी (Net Payable)
                  </div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    ₹{netCashPayable.toLocaleString()} /-
                  </div>
                  <div className="text-[10px] text-emerald-800 mt-0.5 font-semibold">
                    (उचल वजा करून अंतिम रक्कम अदा केली)
                  </div>
                </div>
              )}
            </div>

            {/* Official Dual Signature Area */}
            <div className="pt-6 pb-2 flex justify-between text-xs text-slate-600 font-sans border-t border-slate-200">
              <div className="text-center">
                <div className="h-8"></div>
                <div className="font-black text-slate-900">{firmProfile.ownerName || "संतोष मेंगाणे"}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">(कंत्राटदार स्वाक्षरी)</div>
              </div>
              <div className="text-center">
                <div className="h-8"></div>
                <div className="font-black text-slate-900">{worker.fullName}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">(कामगार सही / अंगठा)</div>
              </div>
            </div>

            {/* Bottom Thank You / Date Stamp */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-400 font-sans">
              पावती तयार दिनांक: {new Date().toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' })} • संगणकीकृत पावती
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* 2. OFFICIAL EXECUTIVE A4 LETTERHEAD INVOICE FORMAT             */
          /* ============================================================== */
          <div
            ref={printRef}
            className="w-full max-w-4xl bg-white text-slate-900 p-8 md:p-12 rounded-2xl shadow-2xl border border-slate-200 my-4 font-sans text-xs leading-normal"
          >
            {/* Executive Letterhead Header */}
            <div className="border-b-2 border-blue-600 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src="/shriram_logo.jpg"
                    alt="श्रीराम लोगो"
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-md shrink-0"
                  />
                  <div>
                    <h1 className="text-2xl font-black text-blue-900 tracking-tight">
                      {firmProfile.firmName || "श्रीराम प्लंबिंग वर्क्स"}
                    </h1>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {firmProfile.tagline || "धुमुस मशिन, कोअर कटिंग, वॉल कटिंग व सिव्हिल कंत्राटदार"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {firmProfile.address || "मु. पो. मिरजवाडी, ता. आष्टा, जि. सांगली"}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="inline-block px-3.5 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-extrabold tracking-wide">
                    मासिक मजुरी पावती पत्रक
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-2">
                    मोबाईल: {firmProfile.phone || "9999999999"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    पावती क्र.: SPW-{month}-{worker.id?.substring(0, 4)}
                  </div>
                </div>
              </div>
            </div>

            {/* Worker & Billing Meta Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs">
              <div>
                <div className="text-slate-400 font-bold uppercase text-[10px]">कामगाराचे नाव व संपर्क:</div>
                <div className="font-black text-base text-slate-900 mt-0.5">{worker.fullName}</div>
                <div className="text-xs text-slate-600 mt-1">
                  <strong>कौशल्य:</strong> {worker.skill} | <strong>मोबाईल:</strong> {worker.phone}
                </div>
              </div>
              <div className="md:text-right">
                <div className="text-slate-400 font-bold uppercase text-[10px]">हिशोब महिना व तारीख:</div>
                <div className="font-black text-base text-blue-900 mt-0.5">{month}</div>
                <div className="text-xs text-slate-600 mt-1">
                  <strong>दिनांक:</strong> {new Date().toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Tabular Statement */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black">
                  <tr>
                    <th className="p-3 text-left">तपशील (Particulars)</th>
                    <th className="p-3 text-center">प्रमाण / दिवस (Qty/Days)</th>
                    <th className="p-3 text-right">दर (Rate)</th>
                    <th className="p-3 text-right">रक्कम (Amount ₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">चालू महिन्यातील हजेरी काम</td>
                    <td className="p-3 text-center font-semibold">{fullDays} Full + {halfDays} Half ({totalDaysEquivalent} दिवस)</td>
                    <td className="p-3 text-right font-bold text-slate-700">₹{dailyRate}</td>
                    <td className="p-3 text-right font-black text-slate-900">₹{currentWagesEarned.toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">मागील महिन्यातील शिल्लक बाकी</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                    <td className="p-3 text-right text-slate-400">-</td>
                    <td className="p-3 text-right font-black text-slate-900">₹{openingBalance.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-blue-50/40 font-black text-slate-900 border-t border-slate-200">
                    <td className="p-3" colSpan={3}>एकूण देय मजुरी (Gross Wages)</td>
                    <td className="p-3 text-right text-blue-700 text-sm">₹{totalPayableBeforeAdvances.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-red-50/30 text-red-700 font-bold">
                    <td className="p-3" colSpan={3}>
                      वजा: घेतलेली उचल रक्कम (Total Advance Deducted - {advancesList.length} नोंदी)
                    </td>
                    <td className="p-3 text-right font-black text-red-600 text-sm">- ₹{totalAdvancesTaken.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Advance Transactions Breakdown if any */}
            {advancesList.length > 0 && (
              <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-bold text-xs text-slate-700 mb-2">उचल तपशील (Advance Log):</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {advancesList.map((adv) => (
                    <div key={adv.id} className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between">
                      <span className="text-slate-600">{adv.date} ({adv.reason})</span>
                      <span className="font-bold text-slate-900">₹{adv.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Net Settlement Banner */}
            {isExcessAdvance ? (
              <div className="p-5 bg-red-50 border-2 border-red-300 rounded-xl text-center mb-8 shadow-xs">
                <div className="text-xs font-bold text-red-800 uppercase tracking-wider">
                  ⚠️ कामगाराकडे अतिरिक्त उचल शिल्लक येणे (Excess Advance Carry Forward)
                </div>
                <div className="text-3xl font-black text-red-600 mt-1">
                  ₹{excessAmount.toLocaleString()} /-
                </div>
                <p className="text-xs text-red-700 mt-1">
                  (मजुरीपेक्षा उचल जास्त झाल्यामुळे ही रक्कम पुढील महिन्याच्या खात्यावर वळती केली जाईल)
                </p>
              </div>
            ) : (
              <div className="p-6 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-center mb-8 shadow-xs">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  ✅ आज हातात देय निव्वळ मजुरी रक्कम (Net Cash Payable)
                </div>
                <div className="text-3xl font-black text-emerald-700 mt-1">
                  ₹{netCashPayable.toLocaleString()} /-
                </div>
                <p className="text-xs text-emerald-800 mt-1 font-semibold">
                  (उचल वजा करून संतोषजींकडून अंतिम रोख अदा करण्यात आली)
                </p>
              </div>
            )}

            {/* Signature & Seal Footer */}
            <div className="pt-10 flex justify-between text-xs text-slate-700 border-t border-slate-300">
              <div className="text-center">
                <div className="font-bold text-slate-900 text-sm">{firmProfile.ownerName || "संतोष मेंगाणे"}</div>
                <div className="text-xs text-slate-500 mt-0.5">श्रीराम प्लंबिंग वर्क्स, मिरजवाडी</div>
                <div className="text-[11px] text-slate-400 mt-8">(अधिकृत कंत्राटदार स्वाक्षरी / शिक्का)</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-slate-900 text-sm">{worker.fullName}</div>
                <div className="text-xs text-slate-500 mt-0.5">मोबाईल: {worker.phone}</div>
                <div className="text-[11px] text-slate-400 mt-8">(कामगार सही / अंगठा)</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
