import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shriram_plumbing/main.dart';
import 'package:shriram_plumbing/models/models.dart';
import 'package:shriram_plumbing/providers/app_provider.dart';
import 'package:shriram_plumbing/views/admin_home_view.dart';

void main() {
  testWidgets('App starts without crash', (WidgetTester tester) async {
    await tester.pumpWidget(const ShriramPlumbingApp());
    expect(find.byType(ShriramPlumbingApp), findsOneWidget);
  });

  testWidgets('AdminHomeView renders cleanly with empty clean database across all tabs', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AppProvider(),
        child: const MaterialApp(home: AdminHomeView()),
      ),
    );
    await tester.pumpAndSettle();

    // Tap through all 7 BottomNavigationBar tabs to verify zero empty-list crashes
    final navFinder = find.byType(BottomNavigationBar);
    expect(navFinder, findsOneWidget);

    for (var i = 0; i < 7; i++) {
      final navBar = tester.widget<BottomNavigationBar>(navFinder);
      navBar.onTap!(i);
      await tester.pumpAndSettle();
    }
  });

  test('AppProvider CRUD, Deterministic Attendance, Khata & Billing calculations', () {
    final provider = AppProvider();

    // 1. Add Builder & Site
    provider.addBuilder(
      firmName: 'त्रिमूर्ती कन्स्ट्रक्शन',
      engineerName: 'इंजी. खोत',
      phone: '9823000001',
      location: 'सांगली',
    );
    expect(provider.builders.length, 1);
    final builderId = provider.builders.first.id;

    final site = provider.addSite(
      name: 'मिरजवाडी साईट',
      location: 'मिरजवाडी',
      builderId: builderId,
    );
    expect(provider.sites.length, 1);
    expect(site.builderId, builderId);

    // 2. Add Worker
    provider.addWorker(
      fullName: 'राजू पाटील',
      phone: '9876543210',
      dailyRate: 600,
      openingBalance: 500,
      skill: 'धुमुस ऑपरेटर',
    );
    expect(provider.workers.length, 1);
    final workerId = provider.workers.first.id;

    // 3. Deterministic Attendance (re-marking same date updates instead of duplicating)
    provider.markAttendance([
      {'workerId': workerId, 'siteId': site.id, 'date': '2026-11-12', 'status': 'FULL'},
    ]);
    provider.markAttendance([
      {'workerId': workerId, 'siteId': site.id, 'date': '2026-11-12', 'status': 'HALF'},
    ]);
    expect(provider.attendance.length, 1);
    expect(provider.attendance.first.id, 'att_${workerId}_2026-11-12');
    expect(provider.attendance.first.wageEarned, 300.0);

    // 4. Advance & Khata Formula: opening (500) + earned (300) - advance (200) = 600
    provider.addAdvance(
      workerId: workerId,
      siteId: site.id,
      date: '2026-11-12',
      amount: 200,
      reason: 'घरखर्च',
      paymentMode: 'CASH',
    );
    expect(provider.advances.first.siteName, 'मिरजवाडी साईट');

    final khata = provider.calculateKhata(workerId);
    expect(khata['openingBalance'], 500.0);
    expect(khata['wagesEarned'], 300.0);
    expect(khata['totalAdvances'], 200.0);
    expect(khata['netPayable'], 600.0);

    // 5. Work Log & Builder Billing
    provider.addDailyWorkLog(
      siteId: site.id,
      categoryId: 'cat_03',
      categoryName: 'धुमसणे',
      date: '2026-11-12',
      quantity: 1000,
      unit: 'sq.ft',
      rate: 4.5,
      totalAmount: 4500,
      notes: 'बेसमेंट पूर्ण',
    );
    final billing = provider.calculateBuilderBilling(builderId);
    expect(billing?['totalBilled'], 4500.0);

    // 6. Firm Profile Update & Language Switch
    provider.updateFirmProfile(
      FirmProfile(
        firmName: 'श्रीराम प्लंबिंग वर्क्स, मिरजवाडी',
        ownerName: 'संतोष मेंगाणे',
        phone: '9999999999',
        address: 'मिरजवाडी',
        thermalHeader: 'पावती',
      ),
    );
    expect(provider.firmProfile.address, 'मिरजवाडी');
    expect(provider.language, 'mr');
    provider.toggleLanguage();
    expect(provider.language, 'en');
  });
}
