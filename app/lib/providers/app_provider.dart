import 'package:flutter/material.dart';
import '../models/models.dart';
import '../core/firebase_service.dart';

/// श्रीराम प्लंबिंग वर्क्स (मिरजवाडी) - 100x IQ Optimized State & Sync Provider
/// 
/// Highlights:
/// - Granular Delta Writes: Every UI mutation saves/deletes ONLY the modified document.
/// - Deterministic Document IDs: 'att_${workerId}_${date}' ensures zero duplicate attendance.
/// - Targeted Collection Streams: Subscribes independently to each collection. Unchanged collections are never queried.
/// - Zero Unwanted Loops: Replaces whole-database loops with single-doc operations.
class AppProvider with ChangeNotifier {
  String _language = 'mr'; // Default Marathi
  UserAccount? _currentUser;

  AppProvider() {
    _initCloudSync();
  }

  void _initCloudSync() {
    // 1. Firm Profile Stream
    FirebaseService.streamDocument('firm_profile', 'main')?.listen((data) {
      if (data != null) {
        _firmProfile = FirmProfile.fromMap(data);
        notifyListeners();
      }
    }, onError: (_) {});

    // 2. Builders Collection Stream
    FirebaseService.streamCollection('builders')?.listen((list) {
      _builders.clear();
      _builders.addAll(list.map((m) => BuilderModel.fromMap(m)));
      notifyListeners();
    }, onError: (_) {});

    // 3. Work Categories Stream (merge defaults + custom from cloud)
    FirebaseService.streamCollection('work_categories')?.listen((list) {
      final Map<String, WorkCategoryModel> merged = {
        for (final cat in _defaultWorkCategories) cat.id: cat,
      };
      for (final m in list) {
        final cat = WorkCategoryModel.fromMap(m);
        if (cat.id.isNotEmpty) {
          merged[cat.id] = cat;
        }
      }
      _workCategories.clear();
      _workCategories.addAll(merged.values);
      notifyListeners();
    }, onError: (_) {});

    // 4. Sites Collection Stream
    FirebaseService.streamCollection('sites')?.listen((list) {
      _sites.clear();
      _sites.addAll(list.map((m) => Site.fromMap(m)));
      notifyListeners();
    }, onError: (_) {});

    // 5. Workers Collection Stream
    FirebaseService.streamCollection('workers')?.listen((list) {
      _workers.clear();
      _workers.addAll(list.map((m) => Worker.fromMap(m)));
      notifyListeners();
    }, onError: (_) {});

    // 6. Daily Work Stream
    FirebaseService.streamCollection('daily_work')?.listen((list) {
      _dailyWork.clear();
      final mapped = list.map((m) => DailyWorkLog.fromMap(m)).toList();
      mapped.sort((a, b) => b.date.compareTo(a.date));
      _dailyWork.addAll(mapped);
      notifyListeners();
    }, onError: (_) {});

    // 7. Attendance Collection Stream
    FirebaseService.streamCollection('attendance')?.listen((list) {
      _attendance.clear();
      _attendance.addAll(list.map((m) => AttendanceRecord.fromMap(m)));
      notifyListeners();
    }, onError: (_) {});

    // 8. Advances Collection Stream
    FirebaseService.streamCollection('advances')?.listen((list) {
      _advances.clear();
      final mapped = list.map((m) => AdvanceRecord.fromMap(m)).toList();
      mapped.sort((a, b) => b.date.compareTo(a.date));
      _advances.addAll(mapped);
      notifyListeners();
    }, onError: (_) {});
  }

  FirmProfile _firmProfile = FirmProfile(
    firmName: 'श्रीराम प्लंबिंग वर्क्स, मिरजवाडी',
    ownerName: 'संतोष मेंगाणे',
    phone: '9999999999',
    address: 'मु. पो. मिरजवाडी, ता. आष्टा, जि. सांगली',
    thermalHeader: 'मजुरी व उचल हिशोब पावती',
    tagline: 'धुमुस मशिन, कोअर कटिंग, वॉल कटिंग व सिव्हिल कंत्राटदार',
  );

  final List<UserAccount> _users = [
    UserAccount(
      id: 'u_admin_01',
      mobile: '9999999999',
      password: 'admin',
      fullName: 'संतोष मेंगाणे (कंत्राटदार)',
      role: 'ADMIN',
    ),
  ];

  final List<BuilderModel> _builders = [];

  static final List<WorkCategoryModel> _defaultWorkCategories = [
    WorkCategoryModel(id: 'cat_01', name: 'प्लंबिंग (नवीन कामे)', unit: 'पॉईंट्स / काम', defaultRate: 0),
    WorkCategoryModel(id: 'cat_02', name: 'प्लंबिंग दुरुस्ती', unit: 'व्हिजिट / दिवस', defaultRate: 0),
    WorkCategoryModel(id: 'cat_03', name: 'नवीन साईट धुमसणे (Dhumus Compactor)', unit: 'sq.ft', defaultRate: 4.5),
    WorkCategoryModel(id: 'cat_04', name: 'विझारिंग काम (Waterproofing)', unit: 'sq.ft / काम', defaultRate: 0),
    WorkCategoryModel(id: 'cat_05', name: 'कोअर कटिंग (Core Cutting)', unit: 'होल्स संख्या', defaultRate: 350),
    WorkCategoryModel(id: 'cat_06', name: 'ब्रेकर फोडकाम (Demolition)', unit: 'तास / दिवस', defaultRate: 0),
    WorkCategoryModel(id: 'cat_07', name: 'वॉल & RCC कटिंग', unit: 'रनिंग फूट (R.ft)', defaultRate: 40),
  ];

  final List<WorkCategoryModel> _workCategories = List.of(_defaultWorkCategories);

  final List<Site> _sites = [];
  final List<Worker> _workers = [];
  final List<DailyWorkLog> _dailyWork = [];
  final List<AttendanceRecord> _attendance = [];
  final List<AdvanceRecord> _advances = [];

  // Getters
  String get language => _language;
  UserAccount? get currentUser => _currentUser;
  FirmProfile get firmProfile => _firmProfile;
  List<BuilderModel> get builders => _builders;
  List<WorkCategoryModel> get workCategories => _workCategories;
  List<Site> get sites => _sites;
  List<Worker> get workers => _workers;
  List<DailyWorkLog> get dailyWork => _dailyWork;
  List<AttendanceRecord> get attendance => _attendance;
  List<AdvanceRecord> get advances => _advances;

  // Language Toggle
  void toggleLanguage() {
    _language = _language == 'mr' ? 'en' : 'mr';
    notifyListeners();
  }

  // Auth
  bool login(String mobile, String password) {
    try {
      final user = _users.firstWhere(
        (u) => u.mobile.trim() == mobile.trim() && u.password.trim() == password.trim(),
      );
      _currentUser = user;
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  void logout() {
    _currentUser = null;
    notifyListeners();
  }

  // Firm Profile Update
  void updateFirmProfile(FirmProfile profile) {
    _firmProfile = profile;
    notifyListeners();
    FirebaseService.saveDoc('firm_profile', 'main', _firmProfile.toMap());
  }

  // Builders CRUD
  void addBuilder({
    required String firmName,
    required String engineerName,
    required String phone,
    required String location,
  }) {
    final b = BuilderModel(
      id: 'b_${DateTime.now().millisecondsSinceEpoch}',
      firmName: firmName,
      engineerName: engineerName,
      phone: phone,
      location: location,
    );
    _builders.insert(0, b);
    notifyListeners();
    FirebaseService.saveDoc('builders', b.id, b.toMap());
  }

  void updateBuilder(String id, {String? firmName, String? engineerName, String? phone, String? location}) {
    final idx = _builders.indexWhere((b) => b.id == id);
    if (idx != -1) {
      final old = _builders[idx];
      final updated = BuilderModel(
        id: old.id,
        firmName: firmName ?? old.firmName,
        engineerName: engineerName ?? old.engineerName,
        phone: phone ?? old.phone,
        location: location ?? old.location,
      );
      _builders[idx] = updated;
      notifyListeners();
      FirebaseService.saveDoc('builders', updated.id, updated.toMap());
    }
  }

  void deleteBuilder(String id) {
    _builders.removeWhere((b) => b.id == id);
    notifyListeners();
    FirebaseService.deleteDoc('builders', id);
  }

  // Work Categories CRUD
  WorkCategoryModel addWorkCategory({
    required String name,
    required String unit,
    required double defaultRate,
  }) {
    final cat = WorkCategoryModel(
      id: 'cat_${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      unit: unit,
      defaultRate: defaultRate,
      isCustom: true,
    );
    _workCategories.add(cat);
    notifyListeners();
    FirebaseService.saveDoc('work_categories', cat.id, cat.toMap());
    return cat;
  }

  void deleteWorkCategory(String id) {
    _workCategories.removeWhere((c) => c.id == id);
    notifyListeners();
    FirebaseService.deleteDoc('work_categories', id);
  }

  // Add Site
  Site addSite({required String name, required String location, String builderId = ''}) {
    String bName = '';
    if (builderId.isNotEmpty) {
      final b = _builders.where((x) => x.id == builderId).firstOrNull;
      if (b != null) {
        bName = '${b.firmName} (${b.engineerName})';
      }
    }

    final newSite = Site(
      id: 'site_${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      builderId: builderId,
      builderName: bName,
      location: location,
      status: 'ACTIVE',
      createdAt: DateTime.now().toIso8601String().split('T')[0],
    );
    _sites.insert(0, newSite);
    notifyListeners();
    FirebaseService.saveDoc('sites', newSite.id, newSite.toMap());
    return newSite;
  }

  void deleteSite(String id) {
    _sites.removeWhere((s) => s.id == id);
    notifyListeners();
    FirebaseService.deleteDoc('sites', id);
  }

  // Attendance (100x IQ Atomic Batch with Deterministic ID: zero duplicates)
  void markAttendance(List<Map<String, dynamic>> records) {
    final batchItems = <Map<String, dynamic>>[];

    for (var rec in records) {
      final worker = _workers.where((w) => w.id == rec['workerId']).firstOrNull;
      if (worker == null) continue;
      final site = _sites.where((s) => s.id == rec['siteId']).firstOrNull ?? _sites.firstOrNull;
      final mult = rec['status'] == 'FULL' ? 1.0 : (rec['status'] == 'HALF' ? 0.5 : 0.0);
      final deterministicId = 'att_${rec['workerId']}_${rec['date']}';
      
      _attendance.removeWhere((a) => a.workerId == rec['workerId'] && a.date == rec['date']);
      
      final entry = AttendanceRecord(
        id: deterministicId,
        workerId: worker.id,
        workerName: worker.fullName,
        siteId: site?.id ?? '',
        siteName: site != null && site.name.isNotEmpty ? site.name : 'मुख्य साईट',
        date: rec['date'],
        status: rec['status'],
        multiplier: mult,
        wageEarned: worker.dailyRate * mult,
      );

      _attendance.insert(0, entry);
      batchItems.add(entry.toMap());
    }
    
    if (batchItems.isNotEmpty) {
      notifyListeners();
      FirebaseService.batchSaveAttendance(batchItems);
    }
  }

  // Advance (उचल)
  void addAdvance({
    required String workerId,
    required String siteId,
    required String date,
    required double amount,
    required String reason,
    required String paymentMode,
  }) {
    final worker = _workers.where((w) => w.id == workerId).firstOrNull;
    if (worker == null) return;
    final site = _sites.where((s) => s.id == siteId).firstOrNull;
    final adv = AdvanceRecord(
      id: 'adv_${DateTime.now().millisecondsSinceEpoch}',
      workerId: worker.id,
      workerName: worker.fullName,
      siteId: siteId,
      siteName: site != null && site.name.isNotEmpty ? site.name : 'ऑफिस / साईट',
      date: date,
      amount: amount,
      reason: reason,
      paymentMode: paymentMode,
    );
    _advances.insert(0, adv);
    notifyListeners();
    FirebaseService.saveDoc('advances', adv.id, adv.toMap());
  }

  void deleteAdvance(String id) {
    _advances.removeWhere((a) => a.id == id);
    notifyListeners();
    FirebaseService.deleteDoc('advances', id);
  }

  // Work Log (Dynamic Category, Builder, Unit, Rate, Amount)
  void addDailyWorkLog({
    required String siteId,
    String? builderId,
    String? categoryId,
    String? categoryName,
    required String date,
    required double quantity,
    required String unit,
    required double rate,
    required double totalAmount,
    required String notes,
  }) {
    final site = _sites.where((s) => s.id == siteId).firstOrNull ?? (_sites.isNotEmpty ? _sites[0] : Site(id: '', name: '', builderId: '', builderName: '', location: '', status: '', createdAt: ''));
    final bId = builderId ?? site.builderId;
    final b = _builders.where((x) => x.id == bId).firstOrNull;
    final bName = b != null ? '${b.firmName} (${b.engineerName})' : site.builderName;

    final log = DailyWorkLog(
      id: 'dw_${DateTime.now().millisecondsSinceEpoch}',
      builderId: bId,
      builderName: bName.isNotEmpty ? bName : 'सर्वसाधारण',
      siteId: site.id,
      siteName: site.name.isNotEmpty ? site.name : 'सर्वसाधारण साईट',
      categoryId: categoryId ?? 'cat_03',
      categoryName: categoryName ?? 'काम',
      date: date,
      quantity: quantity,
      unit: unit,
      rate: rate,
      totalAmount: totalAmount,
      notes: notes,
    );

    _dailyWork.insert(0, log);
    notifyListeners();
    FirebaseService.saveDoc('daily_work', log.id, log.toMap());
  }

  void deleteDailyWorkLog(String id) {
    _dailyWork.removeWhere((w) => w.id == id);
    notifyListeners();
    FirebaseService.deleteDoc('daily_work', id);
  }

  // Add Worker
  void addWorker({
    required String fullName,
    required String phone,
    required double dailyRate,
    required double openingBalance,
    required String skill,
  }) {
    final newId = 'w_${DateTime.now().millisecondsSinceEpoch}';
    final worker = Worker(
      id: newId,
      fullName: fullName,
      phone: phone,
      dailyRate: dailyRate,
      openingBalance: openingBalance,
      status: 'ACTIVE',
      skill: skill,
    );
    _workers.insert(0, worker);
    notifyListeners();
    FirebaseService.saveDoc('workers', worker.id, worker.toMap());
  }

  void deleteWorker(String id) {
    _workers.removeWhere((w) => w.id == id);
    notifyListeners();
    FirebaseService.deleteDoc('workers', id);
  }

  // Worker Khata Formula Engine
  // [मागील बाकी] + [चालू हजेरीनुसार मजुरी] - [एकूण उचल] = [आज मजुराला देणे बाकी]
  Map<String, dynamic> calculateKhata(String workerId, {String? monthFilter}) {
    final worker = _workers.firstWhere((w) => w.id == workerId, orElse: () => _workers.isNotEmpty ? _workers[0] : Worker(id: '', fullName: '', phone: '', dailyRate: 0, openingBalance: 0, status: '', skill: ''));
    final workerAtt = _attendance.where((a) {
      if (a.workerId != workerId) return false;
      if (monthFilter != null && monthFilter.isNotEmpty) {
        return a.date.startsWith(monthFilter);
      }
      return true;
    }).toList();

    final fullDays = workerAtt.where((a) => a.status == 'FULL').length;
    final halfDays = workerAtt.where((a) => a.status == 'HALF').length;
    final totalDaysEquiv = fullDays + (halfDays * 0.5);
    final wagesEarned = workerAtt.fold<double>(0.0, (sum, a) => sum + a.wageEarned);

    final workerAdv = _advances.where((a) {
      if (a.workerId != workerId) return false;
      if (monthFilter != null && monthFilter.isNotEmpty) {
        return a.date.startsWith(monthFilter);
      }
      return true;
    }).toList();
    final totalAdvances = workerAdv.fold<double>(0.0, (sum, a) => sum + a.amount);

    final totalPayable = worker.openingBalance + wagesEarned;
    final netPayable = totalPayable - totalAdvances;

    return {
      'worker': worker,
      'fullDays': fullDays,
      'halfDays': halfDays,
      'totalDaysEquiv': totalDaysEquiv,
      'wagesEarned': wagesEarned,
      'openingBalance': worker.openingBalance,
      'totalAdvances': totalAdvances,
      'advancesList': workerAdv,
      'netPayable': netPayable,
    };
  }

  // Builder Invoicing calculation
  Map<String, dynamic>? calculateBuilderBilling(String builderId, {String? monthFilter}) {
    final builder = _builders.where((b) => b.id == builderId).firstOrNull;
    if (builder == null) return null;

    final works = _dailyWork.where((w) {
      final match = w.builderId == builderId || _sites.any((s) => s.id == w.siteId && s.builderId == builderId);
      if (!match) return false;
      if (monthFilter != null && monthFilter.isNotEmpty) {
        return w.date.startsWith(monthFilter);
      }
      return true;
    }).toList();

    final totalBilled = works.fold<double>(0.0, (sum, w) => sum + w.totalAmount);

    return {
      'builder': builder,
      'works': works,
      'totalBilled': totalBilled,
      'worksCount': works.length,
    };
  }
}
