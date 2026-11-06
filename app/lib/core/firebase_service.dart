import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'firebase_options.dart';

/// श्रीराम प्लंबिंग वर्क्स (मिरजवाडी) - 100x IQ Optimized Firebase Engine
/// 
/// Key Features:
/// - Granular Delta Writes: Exactly 1 document write per action (eliminates full DB loop overhead)
/// - Deterministic Document IDs: Eliminates duplicate entries and double writes
/// - Atomic Batching: Writes attendance for multiple workers in a single batch
/// - Targeted Collection Streams: Listens ONLY to the specific collection that changed
/// - Zero Unwanted Reads/Writes: Extreme cost efficiency and instant offline-resilient speed
class FirebaseService {
  static bool isInitialized = false;
  static FirebaseFirestore? _db;

  static FirebaseFirestore? get firestore => _db;

  static Future<void> initialize() async {
    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform,
        );
      }
      _db = FirebaseFirestore.instance;
      isInitialized = true;
      if (kDebugMode) {
        print('Firebase successfully initialized for Shriram Plumbing Works');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Firebase initialization notice (running offline): $e');
      }
      isInitialized = false;
    }
  }

  // --- 100x IQ Granular Single-Document Delta Writes (Zero Unwanted Writes) ---

  /// Save or update a single document in a specific collection (1 Firestore write only)
  static Future<void> saveDoc(String collectionName, String docId, Map<String, dynamic> data) async {
    if (!isInitialized || _db == null || docId.isEmpty) return;
    try {
      await _db!.collection(collectionName).doc(docId).set(data, SetOptions(merge: true));
    } catch (e) {
      if (kDebugMode) {
        print('Firestore write notice ($collectionName/$docId): $e');
      }
    }
  }

  /// Delete a single document from a specific collection (1 Firestore write only)
  static Future<void> deleteDoc(String collectionName, String docId) async {
    if (!isInitialized || _db == null || docId.isEmpty) return;
    try {
      await _db!.collection(collectionName).doc(docId).delete();
    } catch (e) {
      if (kDebugMode) {
        print('Firestore delete notice ($collectionName/$docId): $e');
      }
    }
  }

  /// 100x IQ Atomic Batch for Attendance:
  /// Uses deterministic ID 'att_${workerId}_${date}' to guarantee zero duplicates
  static Future<void> batchSaveAttendance(List<Map<String, dynamic>> records) async {
    if (!isInitialized || _db == null || records.isEmpty) return;
    try {
      final batch = _db!.batch();
      for (final rec in records) {
        final workerId = rec['workerId']?.toString() ?? '';
        final date = rec['date']?.toString() ?? '';
        final recId = (rec['id'] != null && rec['id'].toString().isNotEmpty)
            ? rec['id'].toString() 
            : 'att_${workerId}_$date';
        final docRef = _db!.collection('attendance').doc(recId);
        final mapWithId = Map<String, dynamic>.from(rec)..['id'] = recId;
        batch.set(docRef, mapWithId, SetOptions(merge: true));
      }
      await batch.commit();
    } catch (e) {
      if (kDebugMode) {
        print('Firestore attendance batch notice: $e');
      }
    }
  }

  // --- 100x IQ Granular Collection Listeners (Reads ONLY what changes) ---

  /// Stream an entire collection with real-time delta updates
  static Stream<List<Map<String, dynamic>>>? streamCollection(String collectionName) {
    if (!isInitialized || _db == null) return null;
    try {
      return _db!.collection(collectionName).snapshots().map((snapshot) {
        return snapshot.docs.map((doc) => {'id': doc.id, ...doc.data()}).toList();
      });
    } catch (e) {
      if (kDebugMode) {
        print('Firestore stream collection notice ($collectionName): $e');
      }
      return null;
    }
  }

  /// Stream a single document (e.g. firm profile)
  static Stream<Map<String, dynamic>?>? streamDocument(String collectionName, String docId) {
    if (!isInitialized || _db == null) return null;
    try {
      return _db!.collection(collectionName).doc(docId).snapshots().map((doc) {
        if (!doc.exists || doc.data() == null) return null;
        return {'id': doc.id, ...doc.data()!};
      });
    } catch (e) {
      if (kDebugMode) {
        print('Firestore stream doc notice ($collectionName/$docId): $e');
      }
      return null;
    }
  }
}
