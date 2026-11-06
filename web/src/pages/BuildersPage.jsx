import React, { useState } from 'react';
import { Building2, Plus, Phone, MapPin, Search, Trash2, Edit3, UserCheck, Briefcase, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BuildersPage = () => {
  const { data, addBuilder, updateBuilder, deleteBuilder, setActiveTab, t } = useApp();
  const builders = data.builders || [];
  const sites = data.sites || [];
  const dailyWork = data.dailyWork || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBuilder, setEditingBuilder] = useState(null);

  // Form State
  const [firmName, setFirmName] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  const handleOpenAdd = () => {
    setEditingBuilder(null);
    setFirmName('');
    setEngineerName('');
    setPhone('');
    setLocation('');
    setShowModal(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBuilder(b);
    setFirmName(b.firmName);
    setEngineerName(b.engineerName);
    setPhone(b.phone);
    setLocation(b.location);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firmName.trim() && !engineerName.trim()) {
      alert("कृपया फर्मचे नाव किंवा इंजिनिअरचे नाव प्रविष्ट करा");
      return;
    }

    if (editingBuilder) {
      updateBuilder(editingBuilder.id, {
        firmName: firmName.trim(),
        engineerName: engineerName.trim(),
        phone: phone.trim(),
        location: location.trim()
      });
    } else {
      addBuilder({
        firmName: firmName.trim(),
        engineerName: engineerName.trim(),
        phone: phone.trim(),
        location: location.trim()
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`तुम्हाला '${name}' बिल्डर/इंजिनिअर हटवायचा आहे का?`)) {
      deleteBuilder(id);
    }
  };

  const filteredBuilders = builders.filter(b => {
    const term = searchTerm.toLowerCase();
    return (
      (b.firmName && b.firmName.toLowerCase().includes(term)) ||
      (b.engineerName && b.engineerName.toLowerCase().includes(term)) ||
      (b.location && b.location.toLowerCase().includes(term)) ||
      (b.phone && b.phone.includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner - Bento Hero */}
      <div className="bento-hero p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🏛️</span> {t.buildersTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t.buildersSub}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="tactile-btn-primary px-4 py-2.5 text-white font-bold text-xs rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addBuilder}</span>
        </button>
      </div>

      {/* Search and Overview Metric Cards - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bento-card p-3.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 outline-hidden"
          />
        </div>

        <div className="bento-card p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">{t.totalBuilders}</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{builders.length}</div>
          </div>
          <Building2 className="w-7 h-7 text-blue-600 bg-blue-50 p-1.5 rounded-xl border border-blue-100 tactile-btn" />
        </div>

        <div className="bento-card p-4 flex items-center justify-between border-emerald-200">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">{t.totalSitesCount}</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{sites.length}</div>
          </div>
          <Briefcase className="w-7 h-7 text-emerald-600 bg-emerald-50 p-1.5 rounded-xl border border-emerald-100 tactile-btn" />
        </div>
      </div>

      {/* Builders Grid - Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuilders.map((builder) => {
          const linkedSites = sites.filter(s => s.builderId === builder.id);
          const builderWorks = dailyWork.filter(w => w.builderId === builder.id || linkedSites.some(s => s.id === w.siteId));
          const totalBilling = builderWorks.reduce((acc, w) => acc + (Number(w.totalAmount) || 0), 0);

          return (
            <div
              key={builder.id}
              className="bento-card p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{builder.firmName || "वैयक्तिक बांधकाम"}</span>
                    </h3>
                    <div className="text-xs font-bold text-slate-600 mt-0.5">
                      {builder.engineerName}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(builder)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="माहिती बदला"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(builder.id, builder.firmName || builder.engineerName)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="हटवा"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {builder.phone ? (
                      <a href={`tel:${builder.phone}`} className="font-semibold hover:text-blue-600">
                        {builder.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">नंबर नोंदवलेला नाही</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{builder.location || "सांगली जिल्हा"}</span>
                  </div>
                </div>

                {/* Linked Sites List */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>{t.linkedSites} ({linkedSites.length}):</span>
                  </div>
                  {linkedSites.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {linkedSites.map(s => (
                        <span key={s.id} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">{t.noLinkedSites}</span>
                  )}
                </div>
              </div>

              {/* Bottom Billing Summary */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{t.totalBillingAmount}</span>
                  <span className="text-sm font-extrabold text-emerald-700">₹{totalBilling.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <span>{t.viewMonthlyBill}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBuilders.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">{t.noLinkedSites}</h3>
        </div>
      )}

      {/* Add / Edit Builder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              {editingBuilder ? t.editBuilder : t.addBuilder}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {t.buildersSub}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.firmNameInput}
                </label>
                <input
                  type="text"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="उदा. त्रिमूर्ती कन्स्ट्रक्शन / वाडकर असोसिएट"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.engineerNameInput} *
                </label>
                <input
                  type="text"
                  required
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  placeholder="उदा. इंजी. अरविंद खोत"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.mobileLabel}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9823000000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.builderLocation}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="आष्टा, मिरजवाडी, सांगली"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all active:scale-95"
                >
                  {editingBuilder ? (t.language === 'en' ? 'Save Changes' : 'बदल सेव्ह करा') : (t.language === 'en' ? 'Register' : 'नोंदवा')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
