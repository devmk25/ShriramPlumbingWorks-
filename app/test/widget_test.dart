import 'package:flutter_test/flutter_test.dart';
import 'package:shriram_plumbing/main.dart';

void main() {
  testWidgets('App starts without crash', (WidgetTester tester) async {
    await tester.pumpWidget(const ShriramPlumbingApp());
    expect(find.byType(ShriramPlumbingApp), findsOneWidget);
  });
}
