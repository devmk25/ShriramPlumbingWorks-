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

  final List<BuilderModel> _builders = [
    BuilderModel(id: 'b_01', firmName: 'त्रिमूर्ती कन्स्ट्रक्शन', engineerName: 'इंजी. अरविंद खोत', phone: '9823011111', location: 'आष्टा'),
    BuilderModel(id: 'b_02', firmName: 'वाडकर असोसिएट', engineerName: 'इंजी. B. B. वाडकर', phone: '9823022222', location: 'मिरजवाडी'),
    BuilderModel(id: 'b_03', firmName: 'मोरया कन्स्ट्रक्शन', engineerName: 'इंजी. संतोष बसुगडे', phone: '9823033333', location: 'सांगली'),
    BuilderModel(id: 'b_04', firmName: 'प्रतिक कन्स्ट्रक्शन', engineerName: 'इंजी. प्रतिक गायकवाड', phone: '9823044444', location: 'इस्लामपूर'),
    BuilderModel(id: 'b_05', firmName: 'पूर्वा कन्स्ट्रक्शन', engineerName: 'इंजी. हारुडे साहेब', phone: '9823055555', location: 'आष्टा'),
    BuilderModel(id: 'b_06', firmName: 'अंजनेय कन्स्ट्रक्शन', engineerName: 'इंजी. उदय पाटील', phone: '9823066666', location: 'सांगली'),
    BuilderModel(id: 'b_07', firmName: 'पिरॅमिड कन्स्ट्रक्शन', engineerName: 'इंजी. मदन पाटील', phone: '9823077777', location: 'मिरज'),
    BuilderModel(id: 'b_08', firmName: 'सांबुचे कन्स्ट्रक्शन', engineerName: 'इंजी. सचिन सांबुचे', phone: '9823088888', location: 'आष्टा'),
    BuilderModel(id: 'b_09', firmName: 'जाधव असोसिएट्स', engineerName: 'इंजी. प्रसन्न जाधव', phone: '9823099999', location: 'पलूस'),
    BuilderModel(id: 'b_10', firmName: 'स्वप्नपूर्ती कन्स्ट्रक्शन', engineerName: 'इंजी. माधव इंगवले', phone: '9823100000', location: 'मिरजवाडी'),
    BuilderModel(id: 'b_11', firmName: 'गायकवाड कन्स्ट्रक्शन', engineerName: 'इंजी. किशोर गायकवाड', phone: '9823111111', location: 'आष्टा'),
    BuilderModel(id: 'b_12', firmName: 'सावंत असोसिएट्स', engineerName: 'इंजी. सचिन सावंत', phone: '9823122222', location: 'सांगली'),
    BuilderModel(id: 'b_13', firmName: 'कसाले कन्स्ट्रक्शन', engineerName: 'इंजी. प्रज्वल कसाले', phone: '9823133333', location: 'इस्लामपूर'),
    BuilderModel(id: 'b_14', firmName: 'जाधव बिल्डर्स', engineerName: 'इंजी. अमित जाधव', phone: '9823144444', location: 'आष्टा'),
    BuilderModel(id: 'b_15', firmName: 'पाटील असोसिएट्स', engineerName: 'इंजी. अमरसिंह पाटील', phone: '9823155555', location: 'मिरज'),
  ];

  final List<WorkCategoryModel> _workCategories = [
    WorkCategoryModel(id: 'cat_01', name: 'प्लंबिंग (नवीन कामे)', unit: 'पॉईंट्स / काम', defaultRate: 0),
    WorkCategoryModel(id: 'cat_02', name: 'प्लंबिंग दुरुस्ती', unit: 'व्हिजिट / दिवस', defaultRate: 0),
    WorkCategoryModel(id: 'cat_03', name: 'नवीन साईट धुमसणे (Dhumus Compactor)', unit: 'sq.ft', defaultRate: 4.5),
    WorkCategoryModel(id: 'cat_04', name: 'विझारिंग काम (Waterproofing)', unit: 'sq.ft / काम', defaultRate: 0),
    WorkCategoryModel(id: 'cat_05', name: 'कोअर कटिंग (Core Cutting)', unit: 'होल्स संख्या', defaultRate: 350),
    WorkCategoryModel(id: 'cat_06', name: 'ब्रेकर फोडकाम (Demolition)', unit: 'तास / दिवस', defaultRate: 0),
    WorkCategoryModel(id: 'cat_07', name: 'वॉल & RCC कटिंग', unit: 'रनिंग फूट (R.ft)', defaultRate: 40),
  ];

  final List<Site> _sites = [
    Site(
      id: 'site_01',
      name: 'त्रिमूर्ती रेसिडेन्सी साईट',
      builderId: 'b_01',
      builderName: 'त्रिमूर्ती कन्स्ट्रक्शन (इंजी. अरविंद खोत)',
      location: 'आष्टा बायपास',
      status: 'ACTIVE',
      createdAt: '2026-10-01',
    ),
    Site(
      id: 'site_02',
      name: 'वाडकर बंगला साईट',
      builderId: 'b_02',
      builderName: 'वाडकर असोसिएट (इंजी. B. B. वाडकर)',
      location: 'मिरजवाडी',
      status: 'ACTIVE',
      createdAt: '2026-10-05',
    ),
    Site(
      id: 'site_03',
      name: 'मोरया हाईट्स',
      builderId: 'b_03',
      builderName: 'मोरया कन्स्ट्रक्शन (इंजी. संतोष बसुगडे)',
      location: 'सांगली रोड',
      status: 'ACTIVE',
      createdAt: '2026-10-10',
    ),
  ];

  final List<Worker> _workers = [
    Worker(
      id: 'w_01',
      fullName: 'राजू संभाजी पाटील',
      phone: '9822001122',
      dailyRate: 600,
      openingBalance: 1200,
      status: 'ACTIVE',
      skill: 'धुमुस मशिन ऑपरेटर',
    ),
    Worker(
      id: 'w_02',
      fullName: 'तानाजी विठ्ठल खोत',
      phone: '9822003344',
      dailyRate: 650,
      openingBalance: 800,
      status: 'ACTIVE',
      skill: 'कोअर कटिंग हेड',
    ),
    Worker(
      id: 'w_03',
      fullName: 'सचिन विष्णू माने',
      phone: '9822005566',
      dailyRate: 550,
      openingBalance: 500,
      status: 'ACTIVE',
      skill: 'मशिन हेल्पर',
    ),
    Worker(
      id: 'w_04',
      fullName: 'सर्जेराव बापू कदम',
      phone: '9822007788',
      dailyRate: 600,
      openingBalance: 0,
      status: 'ACTIVE',
      skill: 'प्लंबिंग हेड',
    ),
  ];

  final List<DailyWorkLog> _dailyWork = [
    DailyWorkLog(
      id: 'dw_01',
      builderId: 'b_01',
      builderName: 'त्रिमूर्ती कन्स्ट्रक्शन (इंजी. अरविंद खोत)',
      siteId: 'site_01',
      siteName: 'त्रिमूर्ती रेसिडेन्सी साईट',
      categoryId: 'cat_03',
      categoryName: 'नवीन साईट धुमसणे (Dhumus Compactor)',
      date: '2026-10-25',
      quantity: 2500,
      unit: 'sq.ft',
      rate: 4.5,
      totalAmount: 11250,
      notes: 'आज बेसमेंटचे पूर्ण धुमुस काम झाले.',
    ),
    DailyWorkLog(
      id: 'dw_02',
      builderId: 'b_01',
      builderName: 'त्रिमूर्ती कन्स्ट्रक्शन (इंजी. अरविंद खोत)',
      siteId: 'site_01',
      siteName: 'त्रिमूर्ती रेसिडेन्सी साईट',
      categoryId: 'cat_05',
      categoryName: 'कोअर कटिंग (Core Cutting)',
      date: '2026-10-25',
      quantity: 12,
      unit: 'होल्स संख्या',
      rate: 350,
      totalAmount: 4200,
      notes: '१२ होल्स कोर कटिंग पूर्ण केले.',
    ),
  ];

  final List<AttendanceRecord> _attendance = [
    AttendanceRecord(
      id: 'att_01',
      workerId: 'w_01',
      workerName: 'राजू संभाजी पाटील',
      siteId: 'site_01',
      siteName: 'त्रिमूर्ती रेसिडेन्सी साईट',
      date: '2026-10-25',
      status: 'FULL',
      multiplier: 1.0,
      wageEarned: 600,
    ),
    AttendanceRecord(
      id: 'att_02',
      workerId: 'w_02',
      workerName: 'तानाजी विठ्ठल खोत',
      siteId: 'site_01',
      siteName: 'त्रिमूर्ती रेसिडेन्सी साईट',
      date: '2026-10-25',
      status: 'FULL',
      multiplier: 1.0,
      wageEarned: 650,
    ),
  ];

  final List<AdvanceRecord> _advances = [
    AdvanceRecord(
      id: 'adv_01',
      workerId: 'w_01',
      workerName: 'राजू संभाजी पाटील',
      siteId: 'site_01',
      date: '2026-10-25',
      amount: 500,
      reason: 'दवाखाना खर्च',
      paymentMode: 'CASH',
    ),
  ];

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
