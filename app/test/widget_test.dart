import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shriram_plumbing/main.dart';
import 'package:shriram_plumbing/models/models.dart';
import 'package:shriram_plumbing/providers/app_provider.dart';
import 'package:shriram_plumbing/views/admin_home_view.dart';
import 'package:shriram_plumbing/views/login_view.dart';
import 'package:shriram_plumbing/views/thermal_slip_view.dart';

void main() {
  testWidgets('App starts without crash', (WidgetTester tester) async {
    await tester.pumpWidget(const ShriramPlumbingApp());
    expect(find.byType(ShriramPlumbingApp), findsOneWidget);
  });

  testWidgets('Full Human E2E Walkthrough on Phone Viewport (412x915)', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(412, 915);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    final provider = AppProvider();

    await tester.pumpWidget(
      ChangeNotifierProvider.value(
        value: provider,
        child: const MaterialApp(home: LoginView()),
      ),
    );
    await tester.pumpAndSettle();

    // 1. Test Language toggle on Login screen
    await tester.tap(find.text('English'));
    await tester.pumpAndSettle();
    expect(find.text('Contractor Admin Sign In'), findsOneWidget);
    await tester.tap(find.text('मराठी'));
    await tester.pumpAndSettle();
    expect(find.text('कंत्राटदार ॲडमिन लॉगिन'), findsOneWidget);

    // 2. Test Wrong Password shows error banner
    final textFields = find.byType(TextField);
    await tester.enterText(textFields.at(0), '1111111111');
    await tester.enterText(textFields.at(1), 'badpass');
    await tester.tap(find.text('लॉगिन करा'));
    await tester.pumpAndSettle();
    expect(find.textContaining('अवैध'), findsOneWidget);

    // 3. Test Demo Credentials Fill & Valid Login -> navigates to AdminHomeView
    await tester.tap(find.textContaining('9999999999 / admin'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('लॉगिन करा'));
    await tester.pumpAndSettle();
    expect(find.byType(AdminHomeView), findsOneWidget);

    // Helper to switch tabs via BottomNavigationBar
    Future<void> tapTab(int index) async {
      final nav = tester.widget<BottomNavigationBar>(find.byType(BottomNavigationBar));
      nav.onTap!(index);
      await tester.pumpAndSettle();
    }

    // 4. Builders Tab: Register a builder
    await tapTab(1);
    await tester.tap(find.text('नवीन जोडा'));
    await tester.pumpAndSettle();
    final bFields = find.descendant(of: find.byType(AlertDialog), matching: find.byType(TextField));
    await tester.enterText(bFields.at(0), 'QA फर्म');
    await tester.enterText(bFields.at(1), 'इंजी. साळुंखे');
    await tester.enterText(bFields.at(2), '9822001122');
    await tester.enterText(bFields.at(3), 'आष्टा');
    await tester.tap(find.text('नोंदवा'));
    await tester.pumpAndSettle();
    expect(find.text('QA फर्म'), findsOneWidget);

    // 5. Work Log Tab: Add Site, Add Work Log
    await tapTab(3);
    await tester.tap(find.text('+ नवीन साईट'));
    await tester.pumpAndSettle();
    final sFields = find.descendant(of: find.byType(AlertDialog), matching: find.byType(TextField));
    await tester.enterText(sFields.at(0), 'QA साईट १');
    await tester.enterText(sFields.at(1), 'सांगली');
    await tester.tap(find.text('साईट सेव्ह करा'));
    await tester.pumpAndSettle();
    expect(find.textContaining('QA साईट १'), findsWidgets);

    await tester.tap(find.text('काम सेव्ह करा'));
    await tester.pumpAndSettle();
    expect(provider.dailyWork.length, 1);

    // 6. Workers Tab: Register a Worker
    await tapTab(4);
    await tester.tap(find.text('कामगार जोडा'));
    await tester.pumpAndSettle();
    final wFields = find.descendant(of: find.byType(AlertDialog), matching: find.byType(TextField));
    await tester.enterText(wFields.at(0), 'महेश जाधव');
    await tester.enterText(wFields.at(1), '9900112233');
    await tester.enterText(wFields.at(2), '600');
    await tester.enterText(wFields.at(3), '200');
    await tester.tap(find.text('नोंदवा'));
    await tester.pumpAndSettle();
    expect(find.text('महेश जाधव'), findsOneWidget);
    expect(find.text('₹200 /-'), findsOneWidget);

    // 7. Attendance Tab: Mark Half Day & Save
    await tapTab(2);
    await tester.tap(find.text('Half (०.५)'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('हजेरी सेव्ह करा'));
    await tester.pumpAndSettle();
    expect(provider.attendance.length, 1);
    expect(provider.attendance.first.wageEarned, 300.0);

    // 8. Workers Tab -> Give Advance -> Advances Tab (Save ₹100)
    await tapTab(4);
    await tester.tap(find.text('उचल द्या'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('+₹200'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('उचल सेव्ह करा'));
    await tester.pumpAndSettle();
    expect(provider.advances.length, 1);
    expect(provider.advances.first.amount, 200.0);

    // 9. Workers Tab -> Check Khata (200 opening + 300 half - 200 advance = ₹300) & View Slip
    await tapTab(4);
    expect(find.text('₹300 /-'), findsOneWidget);
    await tester.tap(find.text('पावती'));
    await tester.pumpAndSettle();
    expect(find.byType(ThermalSlipView), findsOneWidget);
    expect(find.text('₹300 /-'), findsOneWidget);
    await tester.tap(find.byIcon(Icons.close_rounded));
    await tester.pumpAndSettle();
    expect(find.byType(AdminHomeView), findsOneWidget);

    // 10. Reports Tab (Workers & Builders)
    await tapTab(6);
    await tester.tap(find.text('बिल्डर मासिक बिल'));
    await tester.pumpAndSettle();
    expect(find.textContaining('₹11250'), findsWidgets); // total + itemized row (2500 * 4.5 = 11250)

    // 11. Settings Dialog via AppBar icon
    await tester.tap(find.byIcon(Icons.settings_rounded));
    await tester.pumpAndSettle();
    await tester.tap(find.text('सेटिंग्ज सेव्ह करा'));
    await tester.pumpAndSettle();

    // 12. Test Android Back Button: Sub-tab -> Returns to Dashboard -> Second Back -> Exit Dialog!
    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    // Should now be on Dashboard (tab 0) showing Quick Actions!
    expect(find.text('हजेरी भरा'), findsOneWidget);

    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    // Should now display Exit confirmation dialog!
    expect(find.text('बाहेर पडायचे आहे का?'), findsOneWidget);
    await tester.tap(find.text('रद्द करा'));
    await tester.pumpAndSettle();
    expect(find.text('बाहेर पडायचे आहे का?'), findsNothing);
  });

  test('AppProvider CRUD, Deterministic Attendance, Khata & Billing calculations', () {
    final provider = AppProvider();

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

    provider.addWorker(
      fullName: 'राजू पाटील',
      phone: '9876543210',
      dailyRate: 600,
      openingBalance: 500,
      skill: 'धुमुस ऑपरेटर',
    );
    expect(provider.workers.length, 1);
    final workerId = provider.workers.first.id;

    provider.markAttendance([
      {'workerId': workerId, 'siteId': site.id, 'date': '2026-11-12', 'status': 'FULL'},
    ]);
    provider.markAttendance([
      {'workerId': workerId, 'siteId': site.id, 'date': '2026-11-12', 'status': 'HALF'},
    ]);
    expect(provider.attendance.length, 1);
    expect(provider.attendance.first.id, 'att_${workerId}_2026-11-12');
    expect(provider.attendance.first.wageEarned, 300.0);

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
