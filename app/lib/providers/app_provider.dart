import 'package:flutter/material.dart';
import '../models/models.dart';
import '../core/firebase_service.dart';

class AppProvider with ChangeNotifier {
  String _language = 'mr'; // Default Marathi
  UserAccount? _currentUser;

  AppProvider() {
    _initCloudSync();
  }

  void _initCloudSync() {
    final stream = FirebaseService.streamCloudData();
    if (stream != null) {
      stream.listen((snapshot) {
        if (snapshot.exists && snapshot.data() != null) {
          final data = snapshot.data()!;
          _loadFromMap(data);
          notifyListeners();
        }
      }, onError: (e) {
        // Run smoothly with local data
      });
    }
  }

  void _syncToCloud() {
    FirebaseService.syncToCloud(toMap());
  }

  void _notifyAndSync() {
    notifyListeners();
    _syncToCloud();
  }

  Map<String, dynamic> toMap() {
    return {
      'firmProfile': _firmProfile.toMap(),
      'builders': _builders.map((b) => b.toMap()).toList(),
      'workCategories': _workCategories.map((c) => c.toMap()).toList(),
      'sites': _sites.map((s) => s.toMap()).toList(),
      'workers': _workers.map((w) => w.toMap()).toList(),
      'dailyWork': _dailyWork.map((d) => d.toMap()).toList(),
      'attendance': _attendance.map((a) => a.toMap()).toList(),
      'advances': _advances.map((a) => a.toMap()).toList(),
    };
  }

  void _loadFromMap(Map<String, dynamic> data) {
    if (data['builders'] is List) {
      final list = (data['builders'] as List)
          .map((m) => BuilderModel.fromMap(Map<String, dynamic>.from(m)))
          .toList();
      if (list.isNotEmpty) {
        _builders.clear();
        _builders.addAll(list);
      }
    }
    if (data['sites'] is List) {
      final list = (data['sites'] as List)
          .map((m) => Site.fromMap(Map<String, dynamic>.from(m)))
          .toList();
      if (list.isNotEmpty) {
        _sites.clear();
        _sites.addAll(list);
      }
    }
    if (data['workers'] is List) {
      final list = (data['workers'] as List)
          .map((m) => Worker.fromMap(Map<String, dynamic>.from(m)))
          .toList();
      if (list.isNotEmpty) {
        _workers.clear();
        _workers.addAll(list);
      }
    }
    if (data['dailyWork'] is List) {
      final list = (data['dailyWork'] as List)
          .map((m) => DailyWorkLog.fromMap(Map<String, dynamic>.from(m)))
          .toList();
      if (list.isNotEmpty) {
        _dailyWork.clear();
        _dailyWork.addAll(list);
      }
    }
    if (data['attendance'] is List) {
      final list = (data['attendance'] as List)
          .map((m) => AttendanceRecord.fromMap(Map<String, dynamic>.from(m)))
          .toList();
      if (list.isNotEmpty) {
        _attendance.clear();
        _attendance.addAll(list);
      }
    }
    if (data['advances'] is List) {
      final list = (data['advances'] as List)
          .map((m) => AdvanceRecord.fromMap(Map<String, dynamic>.from(m)))
          .toList();
      if (list.isNotEmpty) {
        _advances.clear();
        _advances.addAll(list);
      }
    }
  }

  final FirmProfile _firmProfile = FirmProfile(
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

  final List<WorkCategoryModel> _workCategories = [
    WorkCategoryModel(id: 'cat_01', name: 'प्लंबिंग (नवीन कामे)', unit: 'पॉईंट्स / काम', defaultRate: 0),
    WorkCategoryModel(id: 'cat_02', name: 'प्लंबिंग दुरुस्ती', unit: 'व्हिजिट / दिवस', defaultRate: 0),
    WorkCategoryModel(id: 'cat_03', name: 'नवीन साईट धुमसणे (Dhumus Compactor)', unit: 'sq.ft', defaultRate: 4.5),
    WorkCategoryModel(id: 'cat_04', name: 'विझारिंग काम (Waterproofing)', unit: 'sq.ft / काम', defaultRate: 0),
    WorkCategoryModel(id: 'cat_05', name: 'कोअर कटिंग (Core Cutting)', unit: 'होल्स संख्या', defaultRate: 350),
    WorkCategoryModel(id: 'cat_06', name: 'ब्रेकर फोडकाम (Demolition)', unit: 'तास / दिवस', defaultRate: 0),
    WorkCategoryModel(id: 'cat_07', name: 'वॉल & RCC कटिंग', unit: 'रनिंग फूट (R.ft)', defaultRate: 40),
  ];

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
    _notifyAndSync();
  }

  void updateBuilder(String id, {String? firmName, String? engineerName, String? phone, String? location}) {
    final idx = _builders.indexWhere((b) => b.id == id);
    if (idx != -1) {
      final old = _builders[idx];
      _builders[idx] = BuilderModel(
        id: old.id,
        firmName: firmName ?? old.firmName,
        engineerName: engineerName ?? old.engineerName,
        phone: phone ?? old.phone,
        location: location ?? old.location,
      );
      _notifyAndSync();
    }
  }

  void deleteBuilder(String id) {
    _builders.removeWhere((b) => b.id == id);
    _notifyAndSync();
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
    _notifyAndSync();
    return cat;
  }

  void deleteWorkCategory(String id) {
    _workCategories.removeWhere((c) => c.id == id);
    _notifyAndSync();
  }

  // Add Site
  void addSite({required String name, required String location, String builderId = ''}) {
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
    _sites.add(newSite);
    _notifyAndSync();
  }

  void deleteSite(String id) {
    _sites.removeWhere((s) => s.id == id);
    _notifyAndSync();
  }

  // Attendance
  void markAttendance(List<Map<String, dynamic>> records) {
    for (var rec in records) {
      final worker = _workers.firstWhere((w) => w.id == rec['workerId']);
      final site = _sites.firstWhere((s) => s.id == rec['siteId'], orElse: () => _sites[0]);
      final mult = rec['status'] == 'FULL' ? 1.0 : (rec['status'] == 'HALF' ? 0.5 : 0.0);
      
      _attendance.removeWhere((a) => a.workerId == rec['workerId'] && a.date == rec['date']);
      _attendance.insert(
        0,
        AttendanceRecord(
          id: 'att_${DateTime.now().millisecondsSinceEpoch}_${rec['workerId']}',
          workerId: worker.id,
          workerName: worker.fullName,
          siteId: site.id,
          siteName: site.name,
          date: rec['date'],
          status: rec['status'],
          multiplier: mult,
          wageEarned: worker.dailyRate * mult,
        ),
      );
    }
    _notifyAndSync();
  }

  // Advance
  void addAdvance({
    required String workerId,
    required String siteId,
    required String date,
    required double amount,
    required String reason,
    required String paymentMode,
  }) {
    final worker = _workers.firstWhere((w) => w.id == workerId);
    _advances.insert(
      0,
      AdvanceRecord(
        id: 'adv_${DateTime.now().millisecondsSinceEpoch}',
        workerId: worker.id,
        workerName: worker.fullName,
        siteId: siteId,
        date: date,
        amount: amount,
        reason: reason,
        paymentMode: paymentMode,
      ),
    );
    _notifyAndSync();
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
    final site = _sites.where((s) => s.id == siteId).firstOrNull ?? _sites[0];
    final bId = builderId ?? site.builderId;
    final b = _builders.where((x) => x.id == bId).firstOrNull;
    final bName = b != null ? '${b.firmName} (${b.engineerName})' : site.builderName;

    _dailyWork.insert(
      0,
      DailyWorkLog(
        id: 'dw_${DateTime.now().millisecondsSinceEpoch}',
        builderId: bId,
        builderName: bName,
        siteId: site.id,
        siteName: site.name,
        categoryId: categoryId ?? 'cat_03',
        categoryName: categoryName ?? 'काम',
        date: date,
        quantity: quantity,
        unit: unit,
        rate: rate,
        totalAmount: totalAmount,
        notes: notes,
      ),
    );
    _notifyAndSync();
  }

  void deleteDailyWorkLog(String id) {
    _dailyWork.removeWhere((w) => w.id == id);
    _notifyAndSync();
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
    _workers.add(worker);
    _notifyAndSync();
  }

  void deleteWorker(String id) {
    _workers.removeWhere((w) => w.id == id);
    _notifyAndSync();
  }

  // Worker Khata Formula Engine
  Map<String, dynamic> calculateKhata(String workerId, {String? monthFilter}) {
    final worker = _workers.firstWhere((w) => w.id == workerId, orElse: () => _workers[0]);
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
