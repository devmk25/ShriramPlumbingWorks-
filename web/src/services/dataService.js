/**
 * श्रीराम प्लंबिंग वर्क्स (मिरजवाडी) - डेटा पर्सिस्टन्स लेयर
 * Structured according to clean Firebase Collections.
 */
import { db, USE_FIREBASE } from './firebaseConfig';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'SHRIRAM_PLUMBING_DB_V4';

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
  builders: [
    { id: "b_01", firmName: "त्रिमूर्ती कन्स्ट्रक्शन", engineerName: "इंजी. अरविंद खोत", phone: "9823011111", location: "आष्टा" },
    { id: "b_02", firmName: "वाडकर असोसिएट", engineerName: "इंजी. B. B. वाडकर", phone: "9823022222", location: "मिरजवाडी" },
    { id: "b_03", firmName: "मोरया कन्स्ट्रक्शन", engineerName: "इंजी. संतोष बसुगडे", phone: "9823033333", location: "सांगली" },
    { id: "b_04", firmName: "प्रतिक कन्स्ट्रक्शन", engineerName: "इंजी. प्रतिक गायकवाड", phone: "9823044444", location: "इस्लामपूर" },
    { id: "b_05", firmName: "पूर्वा कन्स्ट्रक्शन", engineerName: "इंजी. हारुडे साहेब", phone: "9823055555", location: "आष्टा" },
    { id: "b_06", firmName: "अंजनेय कन्स्ट्रक्शन", engineerName: "इंजी. उदय पाटील", phone: "9823066666", location: "सांगली" },
    { id: "b_07", firmName: "पिरॅमिड कन्स्ट्रक्शन", engineerName: "इंजी. मदन पाटील", phone: "9823077777", location: "मिरज" },
    { id: "b_08", firmName: "सांबुचे कन्स्ट्रक्शन", engineerName: "इंजी. सचिन सांबुचे", phone: "9823088888", location: "आष्टा" },
    { id: "b_09", firmName: "जाधव असोसिएट्स", engineerName: "इंजी. प्रसन्न जाधव", phone: "9823099999", location: "पलूस" },
    { id: "b_10", firmName: "स्वप्नपूर्ती कन्स्ट्रक्शन", engineerName: "इंजी. माधव इंगवले", phone: "9823100000", location: "मिरजवाडी" },
    { id: "b_11", firmName: "गायकवाड कन्स्ट्रक्शन", engineerName: "इंजी. किशोर गायकवाड", phone: "9823111111", location: "आष्टा" },
    { id: "b_12", firmName: "सावंत असोसिएट्स", engineerName: "इंजी. सचिन सावंत", phone: "9823122222", location: "सांगली" },
    { id: "b_13", firmName: "कसाले कन्स्ट्रक्शन", engineerName: "इंजी. प्रज्वल कसाले", phone: "9823133333", location: "इस्लामपूर" },
    { id: "b_14", firmName: "जाधव बिल्डर्स", engineerName: "इंजी. अमित जाधव", phone: "9823144444", location: "आष्टा" },
    { id: "b_15", firmName: "पाटील असोसिएट्स", engineerName: "इंजी. अमरसिंह पाटील", phone: "9823155555", location: "मिरज" }
  ],
  workCategories: [
    { id: "cat_01", name: "प्लंबिंग (नवीन कामे)", unit: "पॉईंट्स / काम", defaultRate: 0, isCustom: false },
    { id: "cat_02", name: "प्लंबिंग दुरुस्ती", unit: "व्हिजिट / दिवस", defaultRate: 0, isCustom: false },
    { id: "cat_03", name: "नवीन साईट धुमसणे (Dhumus Compactor)", unit: "sq.ft", defaultRate: 4.5, isCustom: false },
    { id: "cat_04", name: "विझारिंग काम (Waterproofing)", unit: "sq.ft / काम", defaultRate: 0, isCustom: false },
    { id: "cat_05", name: "कोअर कटिंग (Core Cutting)", unit: "होल्स संख्या", defaultRate: 350, isCustom: false },
    { id: "cat_06", name: "ब्रेकर फोडकाम (Demolition)", unit: "तास / दिवस", defaultRate: 0, isCustom: false },
    { id: "cat_07", name: "वॉल & RCC कटिंग", unit: "रनिंग फूट (R.ft)", defaultRate: 40, isCustom: false }
  ],
  sites: [
    {
      id: "site_01",
      name: "त्रिमूर्ती रेसिडेन्सी साईट",
      builderId: "b_01",
      builderName: "त्रिमूर्ती कन्स्ट्रक्शन (इंजी. अरविंद खोत)",
      location: "आष्टा बायपास",
      status: "ACTIVE",
      createdAt: "2026-10-01"
    },
    {
      id: "site_02",
      name: "वाडकर बंगला साईट",
      builderId: "b_02",
      builderName: "वाडकर असोसिएट (इंजी. B. B. वाडकर)",
      location: "मिरजवाडी",
      status: "ACTIVE",
      createdAt: "2026-10-05"
    },
    {
      id: "site_03",
      name: "मोरया हाईट्स",
      builderId: "b_03",
      builderName: "मोरया कन्स्ट्रक्शन (इंजी. संतोष बसुगडे)",
      location: "सांगली रोड",
      status: "ACTIVE",
      createdAt: "2026-10-10"
    }
  ],
  workers: [
    {
      id: "w_01",
      fullName: "राजू संभाजी पाटील",
      phone: "9822001122",
      dailyRate: 600,
      openingBalance: 1200,
      status: "ACTIVE",
      skill: "धुमुस मशिन ऑपरेटर",
      createdAt: "2026-10-01"
    },
    {
      id: "w_02",
      fullName: "तानाजी विठ्ठल खोत",
      phone: "9822003344",
      dailyRate: 650,
      openingBalance: 800,
      status: "ACTIVE",
      skill: "कोअर कटिंग हेड",
      createdAt: "2026-10-01"
    },
    {
      id: "w_03",
      fullName: "सचिन विष्णू माने",
      phone: "9822005566",
      dailyRate: 550,
      openingBalance: 500,
      status: "ACTIVE",
      skill: "मशिन हेल्पर",
      createdAt: "2026-10-02"
    },
    {
      id: "w_04",
      fullName: "सर्जेराव बापू कदम",
      phone: "9822007788",
      dailyRate: 600,
      openingBalance: 0,
      status: "ACTIVE",
      skill: "प्लंबिंग हेड",
      createdAt: "2026-10-05"
    },
    {
      id: "w_05",
      fullName: "अविनाश तुकाराम पवार",
      phone: "9822009900",
      dailyRate: 600,
      openingBalance: 0,
      status: "ACTIVE",
      skill: "ब्रेकर व वॉल कटिंग",
      createdAt: "2026-10-05"
    }
  ],
  dailyWork: [
    {
      id: "dw_01",
      builderId: "b_01",
      builderName: "त्रिमूर्ती कन्स्ट्रक्शन (इंजी. अरविंद खोत)",
      siteId: "site_01",
      siteName: "त्रिमूर्ती रेसिडेन्सी साईट",
      categoryId: "cat_03",
      categoryName: "नवीन साईट धुमसणे (Dhumus Compactor)",
      date: new Date().toISOString().split('T')[0],
      quantity: 2500,
      unit: "sq.ft",
      rate: 4.5,
      totalAmount: 11250,
      notes: "आज बेसमेंटचे पूर्ण धुमुस काम झाले."
    },
    {
      id: "dw_02",
      builderId: "b_01",
      builderName: "त्रिमूर्ती कन्स्ट्रक्शन (इंजी. अरविंद खोत)",
      siteId: "site_01",
      siteName: "त्रिमूर्ती रेसिडेन्सी साईट",
      categoryId: "cat_05",
      categoryName: "कोअर कटिंग (Core Cutting)",
      date: new Date().toISOString().split('T')[0],
      quantity: 12,
      unit: "होल्स संख्या",
      rate: 350,
      totalAmount: 4200,
      notes: "कॉलम पाईप होल्स कटिंग केले."
    },
    {
      id: "dw_03",
      builderId: "b_02",
      builderName: "वाडकर असोसिएट (इंजी. B. B. वाडकर)",
      siteId: "site_02",
      siteName: "वाडकर बंगला साईट",
      categoryId: "cat_07",
      categoryName: "वॉल & RCC कटिंग",
      date: new Date().toISOString().split('T')[0],
      quantity: 150,
      unit: "रनिंग फूट (R.ft)",
      rate: 40,
      totalAmount: 6000,
      notes: "ड्रेन पाईप कटिंग काम पूर्ण."
    }
  ],
  attendance: [
    {
      id: "att_01",
      workerId: "w_01",
      workerName: "राजू संभाजी पाटील",
      siteId: "site_01",
      siteName: "त्रिमूर्ती रेसिडेन्सी साईट",
      date: new Date().toISOString().split('T')[0],
      status: "FULL",
      multiplier: 1.0,
      wageEarned: 600
    },
    {
      id: "att_02",
      workerId: "w_02",
      workerName: "तानाजी विठ्ठल खोत",
      siteId: "site_01",
      siteName: "त्रिमूर्ती रेसिडेन्सी साईट",
      date: new Date().toISOString().split('T')[0],
      status: "FULL",
      multiplier: 1.0,
      wageEarned: 650
    },
    {
      id: "att_03",
      workerId: "w_03",
      workerName: "सचिन विष्णू माने",
      siteId: "site_02",
      siteName: "वाडकर बंगला साईट",
      date: new Date().toISOString().split('T')[0],
      status: "HALF",
      multiplier: 0.5,
      wageEarned: 275
    },
    {
      id: "att_04",
      workerId: "w_04",
      workerName: "सर्जेराव बापू कदम",
      siteId: "site_02",
      siteName: "वाडकर बंगला साईट",
      date: new Date().toISOString().split('T')[0],
      status: "FULL",
      multiplier: 1.0,
      wageEarned: 600
    }
  ],
  advances: [
    {
      id: "adv_01",
      workerId: "w_01",
      workerName: "राजू संभाजी पाटील",
      siteId: "site_01",
      siteName: "त्रिमूर्ती रेसिडेन्सी साईट",
      date: new Date().toISOString().split('T')[0],
      amount: 500,
      reason: "दवाखाना खर्च",
      paymentMode: "CASH"
    },
    {
      id: "adv_02",
      workerId: "w_03",
      workerName: "सचिन विष्णू माने",
      siteId: "site_02",
      siteName: "वाडकर बंगला साईट",
      date: new Date().toISOString().split('T')[0],
      amount: 1000,
      reason: "घरखर्च उचल",
      paymentMode: "CASH"
    }
  ]
};

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
      builders: (parsed.builders && parsed.builders.length > 0) ? parsed.builders : INITIAL_DATA.builders,
      workCategories: (parsed.workCategories && parsed.workCategories.length > 0) ? parsed.workCategories : INITIAL_DATA.workCategories
    };
  } catch (err) {
    console.error("Storage load error, falling back to initial data:", err);
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
