class BuilderModel {
  final String id;
  final String firmName;
  final String engineerName;
  final String phone;
  final String location;

  BuilderModel({
    required this.id,
    required this.firmName,
    required this.engineerName,
    required this.phone,
    required this.location,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'firmName': firmName,
      'engineerName': engineerName,
      'phone': phone,
      'location': location,
    };
  }

  factory BuilderModel.fromMap(Map<String, dynamic> map) {
    return BuilderModel(
      id: map['id'] ?? '',
      firmName: map['firmName'] ?? '',
      engineerName: map['engineerName'] ?? '',
      phone: map['phone'] ?? '',
      location: map['location'] ?? '',
    );
  }
}

class WorkCategoryModel {
  final String id;
  final String name;
  final String unit;
  final double defaultRate;
  final bool isCustom;

  WorkCategoryModel({
    required this.id,
    required this.name,
    required this.unit,
    required this.defaultRate,
    this.isCustom = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'unit': unit,
      'defaultRate': defaultRate,
      'isCustom': isCustom,
    };
  }

  factory WorkCategoryModel.fromMap(Map<String, dynamic> map) {
    return WorkCategoryModel(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      unit: map['unit'] ?? 'काम',
      defaultRate: (map['defaultRate'] as num?)?.toDouble() ?? 0.0,
      isCustom: map['isCustom'] ?? false,
    );
  }
}

class Site {
  final String id;
  final String name;
  final String builderId;
  final String builderName;
  final String location;
  final String status; // 'ACTIVE' or 'COMPLETED'
  final String createdAt;

  Site({
    required this.id,
    required this.name,
    this.builderId = '',
    this.builderName = '',
    required this.location,
    required this.status,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'builderId': builderId,
      'builderName': builderName,
      'location': location,
      'status': status,
      'createdAt': createdAt,
    };
  }

  factory Site.fromMap(Map<String, dynamic> map) {
    return Site(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      builderId: map['builderId'] ?? '',
      builderName: map['builderName'] ?? '',
      location: map['location'] ?? '',
      status: map['status'] ?? 'ACTIVE',
      createdAt: map['createdAt'] ?? '',
    );
  }
}

class Worker {
  final String id;
  final String fullName;
  final String phone;
  final double dailyRate;
  final double openingBalance;
  final String status;
  final String skill;
  final String createdAt;

  Worker({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.dailyRate,
    required this.openingBalance,
    required this.status,
    required this.skill,
    this.createdAt = '',
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'fullName': fullName,
      'phone': phone,
      'dailyRate': dailyRate,
      'openingBalance': openingBalance,
      'status': status,
      'skill': skill,
      'createdAt': createdAt.isNotEmpty ? createdAt : DateTime.now().toIso8601String().split('T')[0],
    };
  }

  factory Worker.fromMap(Map<String, dynamic> map) {
    return Worker(
      id: map['id'] ?? '',
      fullName: map['fullName'] ?? '',
      phone: map['phone'] ?? '',
      dailyRate: (map['dailyRate'] as num?)?.toDouble() ?? 600.0,
      openingBalance: (map['openingBalance'] as num?)?.toDouble() ?? 0.0,
      status: map['status'] ?? 'ACTIVE',
      skill: map['skill'] ?? 'कामगार',
      createdAt: map['createdAt'] ?? '',
    );
  }
}

class AttendanceRecord {
  final String id;
  final String workerId;
  final String workerName;
  final String siteId;
  final String siteName;
  final String date;
  final String status; // 'FULL', 'HALF', 'ABSENT'
  final double multiplier;
  final double wageEarned;

  AttendanceRecord({
    required this.id,
    required this.workerId,
    required this.workerName,
    required this.siteId,
    required this.siteName,
    required this.date,
    required this.status,
    required this.multiplier,
    required this.wageEarned,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'workerId': workerId,
      'workerName': workerName,
      'siteId': siteId,
      'siteName': siteName,
      'date': date,
      'status': status,
      'multiplier': multiplier,
      'wageEarned': wageEarned,
    };
  }

  factory AttendanceRecord.fromMap(Map<String, dynamic> map) {
    return AttendanceRecord(
      id: map['id'] ?? '',
      workerId: map['workerId'] ?? '',
      workerName: map['workerName'] ?? '',
      siteId: map['siteId'] ?? '',
      siteName: map['siteName'] ?? '',
      date: map['date'] ?? '',
      status: map['status'] ?? 'FULL',
      multiplier: (map['multiplier'] as num?)?.toDouble() ?? 1.0,
      wageEarned: (map['wageEarned'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class AdvanceRecord {
  final String id;
  final String workerId;
  final String workerName;
  final String siteId;
  final String siteName;
  final String date;
  final double amount;
  final String reason;
  final String paymentMode;

  AdvanceRecord({
    required this.id,
    required this.workerId,
    required this.workerName,
    required this.siteId,
    this.siteName = 'ऑफिस / साईट',
    required this.date,
    required this.amount,
    required this.reason,
    required this.paymentMode,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'workerId': workerId,
      'workerName': workerName,
      'siteId': siteId,
      'siteName': siteName,
      'date': date,
      'amount': amount,
      'reason': reason,
      'paymentMode': paymentMode,
    };
  }

  factory AdvanceRecord.fromMap(Map<String, dynamic> map) {
    return AdvanceRecord(
      id: map['id'] ?? '',
      workerId: map['workerId'] ?? '',
      workerName: map['workerName'] ?? '',
      siteId: map['siteId'] ?? '',
      siteName: map['siteName'] ?? 'ऑफिस / साईट',
      date: map['date'] ?? '',
      amount: (map['amount'] as num?)?.toDouble() ?? 0.0,
      reason: map['reason'] ?? '',
      paymentMode: map['paymentMode'] ?? 'CASH',
    );
  }
}

class DailyWorkLog {
  final String id;
  final String builderId;
  final String builderName;
  final String siteId;
  final String siteName;
  final String categoryId;
  final String categoryName;
  final String date;
  final double quantity;
  final String unit;
  final double rate;
  final double totalAmount;
  final String notes;

  // Backwards compatibility helpers
  double get dhumusSqft => unit == 'sq.ft' ? quantity : 0.0;
  double get dhumusRate => unit == 'sq.ft' ? rate : 0.0;
  double get dhumusAmount => unit == 'sq.ft' ? totalAmount : 0.0;
  int get coreCuttingHoles => unit.contains('होल') ? quantity.toInt() : 0;
  double get coreCuttingRate => unit.contains('होल') ? rate : 0.0;
  double get coreCuttingAmount => unit.contains('होल') ? totalAmount : 0.0;
  double get totalBilling => totalAmount;

  DailyWorkLog({
    required this.id,
    this.builderId = '',
    this.builderName = '',
    required this.siteId,
    required this.siteName,
    this.categoryId = 'cat_03',
    this.categoryName = 'धुमुस मशिन काम',
    required this.date,
    required this.quantity,
    this.unit = 'sq.ft',
    required this.rate,
    required this.totalAmount,
    required this.notes,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'builderId': builderId,
      'builderName': builderName,
      'siteId': siteId,
      'siteName': siteName,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'date': date,
      'quantity': quantity,
      'unit': unit,
      'rate': rate,
      'totalAmount': totalAmount,
      'notes': notes,
    };
  }

  factory DailyWorkLog.fromMap(Map<String, dynamic> map) {
    final double qty = (map['quantity'] as num?)?.toDouble() ??
        (map['dhumusSqft'] as num?)?.toDouble() ??
        (map['coreCuttingHoles'] as num?)?.toDouble() ??
        0.0;
    final double rt = (map['rate'] as num?)?.toDouble() ??
        (map['dhumusRate'] as num?)?.toDouble() ??
        (map['coreCuttingRate'] as num?)?.toDouble() ??
        0.0;
    final double tot = (map['totalAmount'] as num?)?.toDouble() ??
        (map['totalBilling'] as num?)?.toDouble() ??
        (qty * rt);

    return DailyWorkLog(
      id: map['id'] ?? '',
      builderId: map['builderId'] ?? '',
      builderName: map['builderName'] ?? '',
      siteId: map['siteId'] ?? '',
      siteName: map['siteName'] ?? '',
      categoryId: map['categoryId'] ?? 'cat_03',
      categoryName: map['categoryName'] ?? 'धुमुस मशिन काम',
      date: map['date'] ?? '',
      quantity: qty,
      unit: map['unit'] ?? 'sq.ft',
      rate: rt,
      totalAmount: tot,
      notes: map['notes'] ?? '',
    );
  }
}

class FirmProfile {
  final String firmName;
  final String ownerName;
  final String phone;
  final String address;
  final String thermalHeader;
  final String tagline;

  FirmProfile({
    required this.firmName,
    required this.ownerName,
    required this.phone,
    required this.address,
    required this.thermalHeader,
    this.tagline = 'धुमुस मशिन, कोअर कटिंग, वॉल कटिंग व सिव्हिल कंत्राटदार',
  });

  Map<String, dynamic> toMap() {
    return {
      'firmName': firmName,
      'ownerName': ownerName,
      'phone': phone,
      'address': address,
      'thermalHeader': thermalHeader,
      'tagline': tagline,
    };
  }

  factory FirmProfile.fromMap(Map<String, dynamic> map) {
    return FirmProfile(
      firmName: map['firmName'] ?? '',
      ownerName: map['ownerName'] ?? '',
      phone: map['phone'] ?? '',
      address: map['address'] ?? '',
      thermalHeader: map['thermalHeader'] ?? '',
      tagline: map['tagline'] ?? 'धुमुस मशिन, कोअर कटिंग, वॉल कटिंग व सिव्हिल कंत्राटदार',
    );
  }
}

class UserAccount {
  final String id;
  final String mobile;
  final String password;
  final String fullName;
  final String role; // 'ADMIN'
  final String? workerRefId;

  UserAccount({
    required this.id,
    required this.mobile,
    required this.password,
    required this.fullName,
    required this.role,
    this.workerRefId,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'mobile': mobile,
      'password': password,
      'fullName': fullName,
      'role': role,
      'workerRefId': workerRefId,
    };
  }

  factory UserAccount.fromMap(Map<String, dynamic> map) {
    return UserAccount(
      id: map['id'] ?? '',
      mobile: map['mobile'] ?? '',
      password: map['password'] ?? '',
      fullName: map['fullName'] ?? '',
      role: map['role'] ?? 'ADMIN',
      workerRefId: map['workerRefId'],
    );
  }
}
