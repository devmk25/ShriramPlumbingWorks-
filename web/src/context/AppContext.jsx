import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  loadStoredData, 
  saveData, 
  subscribeToAllCollections, 
  cloudSaveItem, 
  cloudDeleteItem, 
  cloudBatchAttendance 
} from '../services/dataService';
import { translations } from '../i18n/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(loadStoredData());
  const [language, setLanguage] = useState('mr'); // Marathi by default
  const [currentUser, setCurrentUser] = useState(() => {
    // Default logged in as Admin for instant convenience
    return data.users.find(u => u.role === 'ADMIN') || data.users[0];
  });
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashTab = window.location.hash.replace('#', '');
      if (['dashboard', 'builders', 'sites', 'attendance', 'workers', 'advances', 'reports', 'settings'].includes(hashTab)) {
        return hashTab;
      }
    }
    return 'dashboard';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({ tab }, '', `#${tab}`);
    }
  };

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.tab) {
        setActiveTabState(e.state.tab);
      } else {
        setActiveTabState('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [selectedSlipWorker, setSelectedSlipWorker] = useState(null);

  // 100x IQ: Granular Real-time Subscriptions (Reads ONLY collections that change)
  useEffect(() => {
    const unsubscribe = subscribeToAllCollections({
      onFirmProfile: (profile) => {
        setData(prev => ({ ...prev, firmProfile: { ...prev.firmProfile, ...profile } }));
      },
      onWorkers: (workers) => {
        setData(prev => ({ ...prev, workers }));
      },
      onBuilders: (builders) => {
        setData(prev => ({ ...prev, builders }));
      },
      onSites: (sites) => {
        setData(prev => ({ ...prev, sites }));
      },
      onDailyWork: (dailyWork) => {
        setData(prev => ({ ...prev, dailyWork }));
      },
      onAttendance: (attendance) => {
        setData(prev => ({ ...prev, attendance }));
      },
      onAdvances: (advances) => {
        setData(prev => ({ ...prev, advances }));
      },
      onWorkCategories: (cats) => {
        setData(prev => ({ ...prev, workCategories: cats }));
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Fast offline-first local cache (Zero Firestore write overhead here)
  useEffect(() => {
    saveData(data);
  }, [data]);

  const t = translations[language] || translations.mr;

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'mr' ? 'en' : 'mr'));
  };

  // Auth
  const login = (mobile, password) => {
    const user = data.users.find(
      u => u.mobile.trim() === mobile.trim() && u.password.trim() === password.trim()
    );
    if (user && user.role === 'ADMIN') {
      setCurrentUser(user);
      setActiveTab('dashboard');
      return { success: true };
    }
    return { success: false, message: language === 'mr' ? 'अवैध ॲडमिन मोबाईल किंवा पासवर्ड!' : 'Invalid Admin Mobile or Password!' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Firm Profile
  const updateFirmProfile = (updatedProfile) => {
    setData(prev => {
      const merged = { ...prev.firmProfile, ...updatedProfile };
      cloudSaveItem('firm_profile', 'main', merged);
      return { ...prev, firmProfile: merged };
    });
  };

  // Sites
  const addSite = (site) => {
    const builder = (data.builders || []).find(b => b.id === site.builderId);
    const builderName = builder ? `${builder.firmName} (${builder.engineerName})` : (site.builderName || '');
    const newSite = {
      id: `site_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      name: site.name,
      builderId: site.builderId || '',
      builderName: builderName,
      location: site.location || 'स्थानिक'
    };
    setData(prev => ({
      ...prev,
      sites: [newSite, ...prev.sites]
    }));
    cloudSaveItem('sites', newSite.id, newSite);
    return newSite;
  };

  const deleteSite = (siteId) => {
    setData(prev => ({
      ...prev,
      sites: prev.sites.filter(s => s.id !== siteId)
    }));
    cloudDeleteItem('sites', siteId);
  };

  // Builders CRUD
  const addBuilder = (bData) => {
    const newB = {
      id: `b_${Date.now()}`,
      firmName: bData.firmName || '',
      engineerName: bData.engineerName || '',
      phone: bData.phone || '',
      location: bData.location || 'सांगली / मिरज / आष्टा'
    };
    setData(prev => ({
      ...prev,
      builders: [newB, ...(prev.builders || [])]
    }));
    cloudSaveItem('builders', newB.id, newB);
    return newB;
  };

  const updateBuilder = (builderId, updated) => {
    setData(prev => {
      const updatedBuilders = (prev.builders || []).map(b => b.id === builderId ? { ...b, ...updated } : b);
      const bObj = updatedBuilders.find(b => b.id === builderId);
      if (bObj) cloudSaveItem('builders', builderId, bObj);
      return { ...prev, builders: updatedBuilders };
    });
  };

  const deleteBuilder = (builderId) => {
    setData(prev => ({
      ...prev,
      builders: (prev.builders || []).filter(b => b.id !== builderId)
    }));
    cloudDeleteItem('builders', builderId);
  };

  // Work Categories CRUD
  const addWorkCategory = (catData) => {
    const newCat = {
      id: `cat_${Date.now()}`,
      name: catData.name,
      unit: catData.unit || 'काम',
      defaultRate: Number(catData.defaultRate) || 0,
      isCustom: true
    };
    setData(prev => ({
      ...prev,
      workCategories: [...(prev.workCategories || []), newCat]
    }));
    cloudSaveItem('work_categories', newCat.id, newCat);
    return newCat;
  };

  const deleteWorkCategory = (catId) => {
    setData(prev => ({
      ...prev,
      workCategories: (prev.workCategories || []).filter(c => c.id !== catId)
    }));
    cloudDeleteItem('work_categories', catId);
  };

  // Workers
  const addWorker = (workerData) => {
    const workerId = `w_${Date.now()}`;
    const newWorker = {
      id: workerId,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      openingBalance: Number(workerData.openingBalance) || 0,
      dailyRate: Number(workerData.dailyRate) || 600,
      fullName: workerData.fullName,
      phone: workerData.phone,
      skill: workerData.skill || 'कामगार'
    };

    setData(prev => ({
      ...prev,
      workers: [newWorker, ...prev.workers]
    }));
    cloudSaveItem('workers', newWorker.id, newWorker);
    return newWorker;
  };

  const deleteWorker = (workerId) => {
    setData(prev => ({
      ...prev,
      workers: prev.workers.filter(w => w.id !== workerId)
    }));
    cloudDeleteItem('workers', workerId);
  };

  // Daily Work Log (Dynamic Category, Builder, Unit, Rate, Amount)
  const addDailyWork = (workData) => {
    const site = data.sites.find(s => s.id === workData.siteId);
    const builder = (data.builders || []).find(b => b.id === (workData.builderId || site?.builderId));
    const category = (data.workCategories || []).find(c => c.id === workData.categoryId);

    const quantity = Number(workData.quantity) || 0;
    const rate = Number(workData.rate) || 0;
    const totalAmount = Number(workData.totalAmount) || (quantity * rate);

    const newLog = {
      id: `dw_${Date.now()}`,
      builderId: builder ? builder.id : (site?.builderId || ''),
      builderName: builder ? `${builder.firmName} (${builder.engineerName})` : (site?.builderName || 'सर्वसाधारण'),
      siteId: workData.siteId,
      siteName: site ? site.name : "सर्वसाधारण साईट",
      categoryId: workData.categoryId || (category?.id || 'cat_custom'),
      categoryName: workData.categoryName || (category?.name || 'इतर काम'),
      date: workData.date || new Date().toISOString().split('T')[0],
      quantity,
      unit: workData.unit || (category?.unit || 'काम'),
      rate,
      totalAmount,
      notes: workData.notes || ""
    };

    setData(prev => ({
      ...prev,
      dailyWork: [newLog, ...prev.dailyWork]
    }));
    cloudSaveItem('daily_work', newLog.id, newLog);
    return newLog;
  };

  const deleteDailyWork = (workId) => {
    setData(prev => ({
      ...prev,
      dailyWork: prev.dailyWork.filter(w => w.id !== workId)
    }));
    cloudDeleteItem('daily_work', workId);
  };

  // Helper: flexible date matcher supporting Day (YYYY-MM-DD), Week (WEEK:YYYY-MM-DD), Month (YYYY-MM), Year (YYYY)
  const matchesDateFilter = (recordDate, filterStr) => {
    if (!filterStr) return true;
    const d = recordDate || '';
    if (filterStr.startsWith('WEEK:')) {
      const endStr = filterStr.slice(5);
      const endDate = new Date(endStr);
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);
      const startStr = startDate.toISOString().split('T')[0];
      return d >= startStr && d <= endStr;
    }
    return d.startsWith(filterStr);
  };

  // Builder Invoicing / Billing calculation
  const calculateBuilderBilling = (builderId, monthFilter = null) => {
    const builder = (data.builders || []).find(b => b.id === builderId);
    if (!builder) return null;

    const works = (data.dailyWork || []).filter(w => {
      const matchBuilder = w.builderId === builderId || (data.sites.find(s => s.id === w.siteId)?.builderId === builderId);
      if (!matchBuilder) return false;
      return matchesDateFilter(w.date, monthFilter);
    });

    const totalBilled = works.reduce((sum, w) => sum + (Number(w.totalAmount) || 0), 0);

    const categorySummary = {};
    works.forEach(w => {
      const catName = w.categoryName || 'इतर काम';
      if (!categorySummary[catName]) {
        categorySummary[catName] = { name: catName, quantity: 0, unit: w.unit || 'काम', amount: 0, count: 0 };
      }
      categorySummary[catName].quantity += Number(w.quantity) || 0;
      categorySummary[catName].amount += Number(w.totalAmount) || 0;
      categorySummary[catName].count += 1;
    });

    return {
      builder,
      works,
      categorySummary: Object.values(categorySummary),
      totalBilled,
      worksCount: works.length
    };
  };

  // Fast Bulk Attendance (100x IQ Atomic Batch with Deterministic ID)
  const saveBulkAttendance = (records) => {
    // records: array of { workerId, siteId, date, status }
    const newEntries = records.map(rec => {
      const worker = data.workers.find(w => w.id === rec.workerId);
      const site = data.sites.find(s => s.id === rec.siteId);
      const mult = rec.status === 'FULL' ? 1.0 : rec.status === 'HALF' ? 0.5 : 0;
      const rate = worker ? worker.dailyRate : 600;

      // Deterministic key: att_${workerId}_${date} prevents duplicate attendance records
      const attId = rec.id || `att_${rec.workerId}_${rec.date}`;

      return {
        id: attId,
        workerId: rec.workerId,
        workerName: worker ? worker.fullName : "कामगार",
        siteId: rec.siteId || (data.sites[0] ? data.sites[0].id : ""),
        siteName: site ? site.name : "मुख्य साईट",
        date: rec.date,
        status: rec.status,
        multiplier: mult,
        wageEarned: rate * mult
      };
    });

    setData(prev => {
      // replace existing attendance for same date & worker if any
      const keys = new Set(newEntries.map(e => `${e.date}_${e.workerId}`));
      const filteredExisting = prev.attendance.filter(a => !keys.has(`${a.date}_${a.workerId}`));
      return {
        ...prev,
        attendance: [...newEntries, ...filteredExisting]
      };
    });

    // 100x IQ: Commit only changed records in 1 atomic Firestore batch (zero duplicates)
    cloudBatchAttendance(newEntries);
  };

  // Advances (उचल)
  const addAdvance = (advData) => {
    const worker = data.workers.find(w => w.id === advData.workerId);
    const site = data.sites.find(s => s.id === advData.siteId);

    const newAdv = {
      id: `adv_${Date.now()}`,
      workerId: advData.workerId,
      workerName: worker ? worker.fullName : "कामगार",
      siteId: advData.siteId || "",
      siteName: site ? site.name : "ऑफिस / साईट",
      date: advData.date || new Date().toISOString().split('T')[0],
      amount: Number(advData.amount) || 0,
      reason: advData.reason || "दैनंदिन उचल",
      paymentMode: advData.paymentMode || "CASH"
    };

    setData(prev => ({
      ...prev,
      advances: [newAdv, ...prev.advances]
    }));
    cloudSaveItem('advances', newAdv.id, newAdv);
    return newAdv;
  };

  const deleteAdvance = (advanceId) => {
    setData(prev => ({
      ...prev,
      advances: prev.advances.filter(a => a.id !== advanceId)
    }));
    cloudDeleteItem('advances', advanceId);
  };

  // Exact Calculation Formula from Client Specification
  // [मागील बाकी] + [चालू हजेरीनुसार मजुरी] - [एकूण उचल] = [आज मजुराला देणे बाकी]
  const calculateWorkerKhata = (workerId, monthFilter = null) => {
    const worker = data.workers.find(w => w.id === workerId);
    if (!worker) return null;

    // Filter attendance by period if specified
    const workerAttendance = data.attendance.filter(a => {
      if (a.workerId !== workerId) return false;
      return matchesDateFilter(a.date, monthFilter);
    });

    // Count full & half days
    const fullDays = workerAttendance.filter(a => a.status === 'FULL').length;
    const halfDays = workerAttendance.filter(a => a.status === 'HALF').length;
    const totalDaysEquivalent = fullDays + (halfDays * 0.5);
    const currentWagesEarned = workerAttendance.reduce((sum, a) => sum + (Number(a.wageEarned) || 0), 0);

    // Filter advances
    const workerAdvances = data.advances.filter(a => {
      if (a.workerId !== workerId) return false;
      return matchesDateFilter(a.date, monthFilter);
    });

    const totalAdvancesTaken = workerAdvances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
    const openingBalance = Number(worker.openingBalance) || 0;
    const totalPayableBeforeAdvances = openingBalance + currentWagesEarned;
    const netCashPayable = totalPayableBeforeAdvances - totalAdvancesTaken;

    return {
      worker,
      fullDays,
      halfDays,
      totalDaysEquivalent,
      dailyRate: worker.dailyRate,
      openingBalance,
      currentWagesEarned,
      totalPayableBeforeAdvances,
      totalAdvancesTaken,
      advancesList: workerAdvances,
      netCashPayable
    };
  };

  return (
    <AppContext.Provider
      value={{
        data,
        language,
        toggleLanguage,
        t,
        currentUser,
        login,
        logout,
        activeTab,
        setActiveTab,
        selectedSlipWorker,
        setSelectedSlipWorker,
        updateFirmProfile,
        addBuilder,
        updateBuilder,
        deleteBuilder,
        addWorkCategory,
        deleteWorkCategory,
        addSite,
        deleteSite,
        addWorker,
        deleteWorker,
        addDailyWork,
        deleteDailyWork,
        saveBulkAttendance,
        addAdvance,
        deleteAdvance,
        calculateWorkerKhata,
        calculateBuilderBilling
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
