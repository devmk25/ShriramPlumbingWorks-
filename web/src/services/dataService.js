/**
 * श्रीराम प्लंबिंग वर्क्स (मिरजवाडी) - डेटा पर्सिस्टन्स लेयर
 * Structured according to clean Firebase Collections.
 */
import { db, USE_FIREBASE } from './firebaseConfig';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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

export const loadStoredData = () => {
  try {
    // Clear legacy mock data keys from browser
    ['SHRIRAM_PLUMBING_DB_V4', 'SHRIRAM_PLUMBING_DB_V3', 'SHRIRAM_PLUMBING_DB_V2', 'SHRIRAM_PLUMBING_DB'].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });

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
    console.error("Storage load error, falling back to initial clean data:", err);
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

const FIRESTORE_COLLECTION = 'shriram_plumbing_data';
const FIRESTORE_DOC_ID = 'main_db';

// Real-time Cloud Firestore subscription
export const subscribeToCloudData = (onDataReceived, onError) => {
  if (!USE_FIREBASE || !db) return () => {};
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          onDataReceived(cloudData);
        }
      },
      (err) => {
        console.warn("Firestore realtime sync notice (offline mode active):", err.message);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn("Firestore subscription init notice:", err.message);
    return () => {};
  }
};

// Sync updates to Cloud Firestore
export const syncToCloud = async (data) => {
  if (!USE_FIREBASE || !db) return;
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn("Cloud Firestore auto-save notice:", err.message);
  }
};
