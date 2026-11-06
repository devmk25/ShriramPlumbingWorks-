import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'firebase_options.dart';

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

  static const String collectionName = 'shriram_plumbing_data';
  static const String documentId = 'main_db';

  /// Sync data map to Cloud Firestore
  static Future<void> syncToCloud(Map<String, dynamic> data) async {
    if (!isInitialized || _db == null) return;
    try {
      await _db!
          .collection(collectionName)
          .doc(documentId)
          .set(data, SetOptions(merge: true));
    } catch (e) {
      if (kDebugMode) {
        print('Firestore cloud sync notice (offline queue): $e');
      }
    }
  }

  /// Listen to real-time changes from Firestore
  static Stream<DocumentSnapshot<Map<String, dynamic>>>? streamCloudData() {
    if (!isInitialized || _db == null) return null;
    try {
      return _db!.collection(collectionName).doc(documentId).snapshots();
    } catch (e) {
      if (kDebugMode) {
        print('Firestore stream notice: $e');
      }
      return null;
    }
  }
}
