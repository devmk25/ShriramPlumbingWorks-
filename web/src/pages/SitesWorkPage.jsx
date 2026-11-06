import React, { useState, useEffect } from 'react';
import { Building2, Plus, Check, MapPin, Calculator, FileText, CheckCircle2, Trash2, Tag, Layers, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VoiceInput } from '../components/VoiceInput';

export const SitesWorkPage = () => {
  const { data, addSite, deleteSite, addDailyWork, deleteDailyWork, addWorkCategory, deleteWorkCategory, t } = useApp();
  const sites = data.sites || [];
  const builders = data.builders || [];
  const workCategories = data.workCategories || [];
  const dailyWork = data.dailyWork || [];

  // Modals
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  // New Site Form State
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteLocation, setNewSiteLocation] = useState('');
  const [newSiteBuilderId, setNewSiteBuilderId] = useState(builders[0]?.id || '');

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatUnit, setNewCatUnit] = useState('sq.ft');
  const [newCatRate, setNewCatRate] = useState('');

  // Daily Work Form State
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(workCategories[0]?.id || 'cat_03');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [notes, setNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState('');

  // Auto-fill rate and unit when category changes
  const activeCategory = workCategories.find(c => c.id === selectedCategoryId) || workCategories[0];
  const activeSite = sites.find(s => s.id === selectedSiteId) || sites[0];

  useEffect(() => {
    if (activeCategory) {
      if (activeCategory.defaultRate > 0) {
        setRate(String(activeCategory.defaultRate));
      }
    }
  }, [selectedCategoryId]);

  const calculatedTotal = (Number(quantity) || 0) * (Number(rate) || 0);

  const handleCreateSite = (e) => {
    e.preventDefault();
    if (newSiteName.trim()) {
      addSite({
        name: newSiteName.trim(),
        builderId: newSiteBuilderId,
        location: newSiteLocation.trim() || 'स्थानिक'
      });
      setNewSiteName('');
      setNewSiteLocation('');
      setShowAddSiteModal(false);
    }
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (newCatName.trim()) {
      const created = addWorkCategory({
        name: newCatName.trim(),
        unit: newCatUnit.trim() || 'काम',
        defaultRate: Number(newCatRate) || 0
      });
      setSelectedCategoryId(created.id);
      setRate(String(created.defaultRate || ''));
      setNewCatName('');
      setNewCatRate('');
      setShowAddCatModal(false);
    }
  };

  const handleSaveWorkLog = (e) => {
    e.preventDefault();
    if (!selectedSiteId) {
      alert("कृपया साईट निवडा");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      alert("कृपया कामाचे मोजमाप / प्रमाण (Quantity) प्रविष्ट करा");
      return;
    }

    addDailyWork({
      siteId: selectedSiteId,
      builderId: activeSite?.builderId || '',
      categoryId: activeCategory?.id || 'cat_custom',
      categoryName: activeCategory?.name || 'काम',
      date: workDate,
      quantity: Number(quantity),
      unit: activeCategory?.unit || 'काम',
      rate: Number(rate) || 0,
      totalAmount: calculatedTotal,
      notes
    });

    setLogSuccess("कामाची नोंद यशस्वीपणे सेव्ह झाली!");
    setQuantity('');
    setNotes('');
    setTimeout(() => setLogSuccess(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner - Bento Hero */}
      <div className="bento-hero p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🏗️</span> {t.siteMasterTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.dailyWorkTitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCatModal(true)}
            className="tactile-btn px-3.5 py-2.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>{t.addCategoryBtn}</span>
          </button>
          <button
            onClick={() => setShowAddSiteModal(true)}
            className="tactile-btn-primary px-4 py-2.5 text-white font-bold text-xs rounded-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addSite}</span>
          </button>
        </div>
      </div>

      {/* Grid: Daily Work Entry Form & Active Sites Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Work Measurement Entry - Bento Card */}
        <div className="lg:col-span-7 bento-card p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>आजचे काम नोंदवा (Work Measurement)</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              कंत्राटदार: संतोष मेंगाणे
            </span>
          </div>

          {logSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{logSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveWorkLog} className="space-y-4">
            {/* Site and Date Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.selectSite} *
                </label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden cursor-pointer"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.builderName || s.location})
                    </option>
                  ))}
                </select>
                {activeSite && activeSite.builderName && (
                  <div className="text-[10px] font-semibold text-blue-600 mt-1">
                    बिल्डर: {activeSite.builderName}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.selectDate} *
                </label>
                <input
                  type="date"
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>
            </div>

            {/* Work Category Selector */}
            <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-blue-900">
                  कामाचा प्रकार (Work Category) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(true)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
                >
                  + नवीन प्रकार जोडा
                </button>
              </div>

              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-500 outline-hidden cursor-pointer"
              >
                {workCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.unit} {cat.defaultRate > 0 ? `@ ₹${cat.defaultRate}` : ''})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity and Rate Input with Dynamic Unit */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                <span>मोजमाप व दर ({activeCategory?.name || 'काम'})</span>
                {calculatedTotal > 0 && (
                  <span className="text-emerald-700 font-black">
                    = ₹{calculatedTotal.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    प्रमाण / संख्या ({activeCategory?.unit || 'युनिट'}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={`उदा. ${activeCategory?.unit === 'sq.ft' ? '2500' : activeCategory?.unit?.includes('होल्स') ? '12' : '1'}`}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    दर प्रति {activeCategory?.unit || 'युनिट'} (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="दर ₹"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Voice Input & Notes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t.workNotes}
                </label>
                <VoiceInput onTranscript={(text) => setNotes(prev => prev ? `${prev} ${text}` : text)} />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="कामाचा तपशील (उदा. बेसमेंट धुमुस पूर्ण झाले / ३ होल्स केले)..."
                rows={2}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden resize-none"
              />
            </div>

            {/* Total Billing Banner & Submit */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div>
                <div className="text-[11px] font-bold text-emerald-800 uppercase">
                  एकूण कामाची रक्कम
                </div>
                <div className="text-xl font-black text-emerald-700">
                  ₹{calculatedTotal.toLocaleString()}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all active:scale-95"
              >
                काम सेव्ह करा
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Sites List & Status */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center justify-between">
              <span>चालू साईट्स ({sites.length})</span>
              <button
                onClick={() => setShowAddSiteModal(true)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नवीन साईट</span>
              </button>
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {sites.map(site => (
                <div
                  key={site.id}
                  className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{site.name}</span>
                    <button
                      onClick={() => {
                        if (window.confirm(`'${site.name}' साईट हटवायची का?`)) {
                          deleteSite(site.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="साईट हटवा"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {site.builderName && (
                    <div className="text-[11px] font-semibold text-blue-600 mt-0.5">
                      🏛️ {site.builderName}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{site.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Work Activity Feed with Category & Delete */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center justify-between">
              <span>अलिकडील काम नोंदी ({dailyWork.length})</span>
            </h3>
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {dailyWork.map(item => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                  <div className="flex justify-between items-start font-bold text-slate-800">
                    <div>
                      <span>{item.siteName}</span>
                      <div className="text-[10px] text-blue-600 font-medium">
                        {item.builderName || ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 font-extrabold">₹{item.totalAmount?.toLocaleString()}</span>
                      <button
                        onClick={() => {
                          if (window.confirm("ही कामाची नोंद हटवायची का?")) {
                            deleteDailyWork(item.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      {item.categoryName}: {item.quantity} {item.unit} @ ₹{item.rate}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-slate-600 italic mt-1 bg-white p-1.5 rounded-md border border-slate-100">
                      "{item.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Site Modal */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-xl">
            <h3 className="text-base font-extrabold text-slate-900 mb-2">{t.addSite}</h3>
            <p className="text-xs text-slate-500 mb-4">
              साईटकडे काम देणाऱ्या बिल्डर/इंजिनिअरशी संलग्न करा.
            </p>

            <form onSubmit={handleCreateSite} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.siteName} *
                </label>
                <input
                  type="text"
                  required
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="उदा. त्रिमूर्ती रेसिडेन्सी, वाडकर बंगला"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  बिल्डर / इंजिनिअर निवडा *
                </label>
                <select
                  value={newSiteBuilderId}
                  onChange={(e) => setNewSiteBuilderId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                >
                  <option value="">-- बिल्डर निवडा --</option>
                  {builders.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.firmName} ({b.engineerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.siteLocation}
                </label>
                <input
                  type="text"
                  value={newSiteLocation}
                  onChange={(e) => setNewSiteLocation(e.target.value)}
                  placeholder="उदा. आष्टा बायपास, मिरजवाडी"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSiteModal(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200"
                >
                  {t.saveSite}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Custom Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-xl">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">नवीन कामाचा प्रकार जोडा</h3>
            <p className="text-xs text-slate-500 mb-4">
              ७ मुख्य प्रकारांव्यतिरिक्त नवीन सिव्हिल किंवा प्लंबिंग काम जोडा.
            </p>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  कामाचे नाव *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="उदा. पाईप लाईन टेस्टिंग, गच्ची वॉटरप्रूफिंग"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    एकक / युनिट *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatUnit}
                    onChange={(e) => setNewCatUnit(e.target.value)}
                    placeholder="sq.ft, R.ft, होल्स, दिवस"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    डीफॉल्ट दर (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newCatRate}
                    onChange={(e) => setNewCatRate(e.target.value)}
                    placeholder="उदा. 40"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  प्रकार सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
