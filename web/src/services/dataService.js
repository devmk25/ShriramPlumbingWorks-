/**
 * श्रीराम प्लंबिंग वर्क्स (मिरजवाडी) - 100x IQ Optimized Firebase Data Persistence Layer
 * 
 * Features:
 * - Granular Delta Writes: Saves ONLY what changed (1 write per action instead of whole-db loops)
 * - Deterministic IDs: Prevents double entries & duplicate documents
 * - Atomic Batch Writes for Attendance: All worker attendance records in 1 atomic transaction
 * - Targeted Collection Listeners: Reads ONLY the collection that changed, with automatic local caching
 * - Offline Resilient: LocalStorage fallback ensures zero downtime
 */
import { db, USE_FIREBASE } from './firebaseConfig';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';

const STORAGE_KEY = 'SHRIRAM_PLUMBING_DB_V5';

export const INITIAL_DATA = {
  firmProfile: {
    firmName: "श्रीराम प्लंबिंग वर्क्स, मिरजवाडी",
    ownerName: "संतोष मेंगाणे",
    phone: "9999999999",
    address: "मु. पो. मिरजवाडी, ता. आष्टा, जि. सांगली",
    thermalHeader: "श्रीराम प्लंबिंग वर्क्स - मजुरी व उचल हिशोब पावती",
    tagline: "धुमुस मशिन, कोअर कटिंग, वॉल कटिंग व सिव्हिल कंत्राटदार"
  },
  users: [
    {
      id: "u_admin_01",
      mobile: "9999999999",
      password: "admin",
      fullName: "संतोष मेंगाणे (कंत्राटदार)",
      role: "ADMIN"
    }
  ],
  builders: [],
  workCategories: [
    { id: "cat_01", name: "प्लंबिंग (नवीन कामे)", unit: "पॉईंट्स / काम", defaultRate: 0, isCustom: false },
    { id: "cat_02", name: "प्लंबिंग दुरुस्ती", unit: "व्हिजिट / दिवस", defaultRate: 0, isCustom: false },
    { id: "cat_03", name: "नवीन साईट धुमसणे (Dhumus Compactor)", unit: "sq.ft", defaultRate: 4.5, isCustom: false },
    { id: "cat_04", name: "विझारिंग काम (Waterproofing)", unit: "sq.ft / काम", defaultRate: 0, isCustom: false },
    { id: "cat_05", name: "कोअर कटिंग (Core Cutting)", unit: "होल्स संख्या", defaultRate: 350, isCustom: false },
    { id: "cat_06", name: "ब्रेकर फोडकाम (Demolition)", unit: "तास / दिवस", defaultRate: 0, isCustom: false },
    { id: "cat_07", name: "वॉल & RCC कटिंग", unit: "रनिंग फूट (R.ft)", defaultRate: 40, isCustom: false }
  ],
  sites: [],
  workers: [],
  dailyWork: [],
  attendance: [],
  advances: []
};

// --- LocalStorage Fast Cache ---
export const loadStoredData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveData(INITIAL_DATA);
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_DATA,
      ...parsed,
      builders: Array.isArray(parsed.builders) ? parsed.builders : [],
      sites: Array.isArray(parsed.sites) ? parsed.sites : [],
      workers: Array.isArray(parsed.workers) ? parsed.workers : [],
      dailyWork: Array.isArray(parsed.dailyWork) ? parsed.dailyWork : [],
      attendance: Array.isArray(parsed.attendance) ? parsed.attendance : [],
      advances: Array.isArray(parsed.advances) ? parsed.advances : [],
      workCategories: (parsed.workCategories && parsed.workCategories.length > 0) ? parsed.workCategories : INITIAL_DATA.workCategories
    };
  } catch (err) {
    console.error("Storage load error, falling back to clean data:", err);
    return INITIAL_DATA;
  }
};

export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Storage save error:", err);
  }
};

// --- 100x IQ Granular Cloud Operations (Single-Document Delta Writes) ---

/** Save or update a single document in a specific collection (1 read/write cost only) */
export const cloudSaveItem = async (collectionName, docId, data) => {
  if (!USE_FIREBASE || !db || !collectionName || !docId) return;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn(`Firestore write notice (${collectionName}/${docId}):`, err.message);
  }
};

/** Delete a single document from a specific collection */
export const cloudDeleteItem = async (collectionName, docId) => {
  if (!USE_FIREBASE || !db || !collectionName || !docId) return;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Firestore delete notice (${collectionName}/${docId}):`, err.message);
  }
};

/** Atomic Batch Write for Attendance (Zero Duplicates via deterministic key) */
export const cloudBatchAttendance = async (records) => {
  if (!USE_FIREBASE || !db || !Array.isArray(records) || records.length === 0) return;
  try {
    const batch = writeBatch(db);
    records.forEach(rec => {
      // Deterministic key: att_${workerId}_${date} prevents duplicate attendance entries
      const recordId = rec.id || `att_${rec.workerId}_${rec.date}`;
      const docRef = doc(db, 'attendance', recordId);
      batch.set(docRef, { ...rec, id: recordId }, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.warn("Firestore attendance batch error:", err.message);
  }
};

// --- 100x IQ Modular Real-time Listeners (Reads ONLY what changed) ---
export const subscribeToAllCollections = (callbacks) => {
  if (!USE_FIREBASE || !db) return () => {};

  const unsubs = [];

  try {
    // 1. Firm Profile Listener
    unsubs.push(
      onSnapshot(doc(db, 'firm_profile', 'main'), (snap) => {
        if (snap.exists() && callbacks.onFirmProfile) {
          callbacks.onFirmProfile(snap.data());
        }
      }, (err) => console.debug("Profile listener notice:", err.message))
    );

    // 2. Workers Collection Listener
    unsubs.push(
      onSnapshot(collection(db, 'workers'), (snap) => {
        if (callbacks.onWorkers) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          callbacks.onWorkers(list);
        }
      }, (err) => console.debug("Workers listener notice:", err.message))
    );

    // 3. Builders Collection Listener
    unsubs.push(
      onSnapshot(collection(db, 'builders'), (snap) => {
        if (callbacks.onBuilders) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          callbacks.onBuilders(list);
        }
      }, (err) => console.debug("Builders listener notice:", err.message))
    );

    // 4. Sites Collection Listener
    unsubs.push(
      onSnapshot(collection(db, 'sites'), (snap) => {
        if (callbacks.onSites) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          callbacks.onSites(list);
        }
      }, (err) => console.debug("Sites listener notice:", err.message))
    );

    // 5. Daily Work Log Listener
    unsubs.push(
      onSnapshot(collection(db, 'daily_work'), (snap) => {
        if (callbacks.onDailyWork) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          callbacks.onDailyWork(list);
        }
      }, (err) => console.debug("Daily work listener notice:", err.message))
    );

    // 6. Attendance Collection Listener
    unsubs.push(
      onSnapshot(collection(db, 'attendance'), (snap) => {
        if (callbacks.onAttendance) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          callbacks.onAttendance(list);
        }
      }, (err) => console.debug("Attendance listener notice:", err.message))
    );

    // 7. Advances Collection Listener
    unsubs.push(
      onSnapshot(collection(db, 'advances'), (snap) => {
        if (callbacks.onAdvances) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          callbacks.onAdvances(list);
        }
      }, (err) => console.debug("Advances listener notice:", err.message))
    );

    // 8. Work Categories Listener (Always keep built-in categories merged with custom ones)
    unsubs.push(
      onSnapshot(collection(db, 'work_categories'), (snap) => {
        if (callbacks.onWorkCategories) {
          const mergedMap = new Map(INITIAL_DATA.workCategories.map(c => [c.id, c]));
          snap.docs.forEach(d => {
            mergedMap.set(d.id, { id: d.id, ...d.data() });
          });
          callbacks.onWorkCategories(Array.from(mergedMap.values()));
        }
      }, (err) => console.debug("Categories listener notice:", err.message))
    );
  } catch (err) {
    console.warn("Firestore collections subscription init notice:", err.message);
  }

  return () => {
    unsubs.forEach(unsub => {
      try { unsub(); } catch (_) {}
    });
  };
};
