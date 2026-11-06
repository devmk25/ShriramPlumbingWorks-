import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/firebase_service.dart';
import 'core/theme.dart';
import 'providers/app_provider.dart';
import 'views/login_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FirebaseService.initialize();
  runApp(const ShriramPlumbingApp());
}

class ShriramPlumbingApp extends StatelessWidget {
  const ShriramPlumbingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
      ],
      child: MaterialApp(
        title: 'श्रीराम प्लंबिंग वर्क्स',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const LoginView(),
      ),
    );
  }
}
