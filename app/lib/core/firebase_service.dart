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

  /// Sync data map to Cloud Firestore with clean, individual nodes
  static Future<void> syncToCloud(Map<String, dynamic> data) async {
    if (!isInitialized || _db == null) return;
    try {
      // 1. Maintain instant real-time sync document
      await _db!
          .collection(collectionName)
          .doc(documentId)
          .set(data, SetOptions(merge: true));

      // 2. Synchronize into clean, individual, human-readable collections
      if (data['firmProfile'] is Map) {
        await _db!
            .collection('firm_profile')
            .doc('main')
            .set(Map<String, dynamic>.from(data['firmProfile'] as Map), SetOptions(merge: true));
      }

      if (data['builders'] is List) {
        for (var item in data['builders'] as List) {
          if (item is Map && item['id'] != null) {
            await _db!.collection('builders').doc(item['id'].toString()).set(
              Map<String, dynamic>.from(item),
              SetOptions(merge: true),
            );
          }
        }
      }

      if (data['sites'] is List) {
        for (var item in data['sites'] as List) {
          if (item is Map && item['id'] != null) {
            await _db!.collection('sites').doc(item['id'].toString()).set(
              Map<String, dynamic>.from(item),
              SetOptions(merge: true),
            );
          }
        }
      }

      if (data['workers'] is List) {
        for (var item in data['workers'] as List) {
          if (item is Map && item['id'] != null) {
            await _db!.collection('workers').doc(item['id'].toString()).set(
              Map<String, dynamic>.from(item),
              SetOptions(merge: true),
            );
          }
        }
      }

      if (data['dailyWork'] is List) {
        for (var item in data['dailyWork'] as List) {
          if (item is Map && item['id'] != null) {
            await _db!.collection('daily_work').doc(item['id'].toString()).set(
              Map<String, dynamic>.from(item),
              SetOptions(merge: true),
            );
          }
        }
      }

      if (data['attendance'] is List) {
        for (var item in data['attendance'] as List) {
          if (item is Map && item['id'] != null) {
            await _db!.collection('attendance').doc(item['id'].toString()).set(
              Map<String, dynamic>.from(item),
              SetOptions(merge: true),
            );
          }
        }
      }

      if (data['advances'] is List) {
        for (var item in data['advances'] as List) {
          if (item is Map && item['id'] != null) {
            await _db!.collection('advances').doc(item['id'].toString()).set(
              Map<String, dynamic>.from(item),
              SetOptions(merge: true),
            );
          }
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('Firestore clean cloud sync notice: $e');
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
