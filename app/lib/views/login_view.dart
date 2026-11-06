import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../core/localization.dart';
import '../providers/app_provider.dart';
import 'admin_home_view.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _mobileController = TextEditingController();
  final _passwordController = TextEditingController();
  String? _error;

  void _handleLogin() {
    final provider = Provider.of<AppProvider>(context, listen: false);
    final success = provider.login(_mobileController.text, _passwordController.text);

    if (success) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const AdminHomeView()),
      );
    } else {
      setState(() {
        _error = provider.language == 'mr' 
          ? 'अवैध ॲडमिन मोबाईल नंबर किंवा पासवर्ड!' 
          : 'Invalid Admin mobile or password!';
      });
    }
  }

  void _fillDemo(String m, String p) {
    _mobileController.text = m;
    _passwordController.text = p;
    setState(() => _error = null);
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final lang = provider.language;

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Top Language Switcher
                  Align(
                    alignment: Alignment.topRight,
                    child: TextButton.icon(
                      onPressed: provider.toggleLanguage,
                      icon: const Icon(Icons.language, size: 18, color: AppTheme.primaryBlue),
                      label: Text(
                        lang == 'mr' ? 'English' : 'मराठी',
                        style: const TextStyle(fontWeight: FontWeight.w700, color: AppTheme.primaryBlue),
                      ),
                      style: TextButton.styleFrom(
                        backgroundColor: AppTheme.blueLight,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Brand Icon & Title
                  Container(
                    width: 84,
                    height: 84,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryBlue.withValues(alpha: 0.2),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        )
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: Image.asset(
                        'assets/images/shriram_logo.jpg',
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  const Text(
                    'श्रीराम प्लंबिंग वर्क्स',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.textDark,
                    ),
                  ),
                  const Text(
                    'मिरजवाडी • कंत्राटदार संतोष मेंगाणे',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.accentEmerald),
                  ),
                  const SizedBox(height: 32),

                  // Login Form Card - Bento Architecture
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: AppTheme.bentoDecoration(radius: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          AppLocale.get('loginTitle', lang),
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          AppLocale.get('loginSub', lang),
                          style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                        ),
                        const SizedBox(height: 20),

                        if (_error != null) ...[
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: Colors.red.shade200),
                            ),
                            child: Text(
                              _error!,
                              style: TextStyle(color: Colors.red.shade700, fontSize: 12, fontWeight: FontWeight.bold),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          const SizedBox(height: 14),
                        ],

                        // Mobile Input
                        TextField(
                          controller: _mobileController,
                          keyboardType: TextInputType.phone,
                          decoration: InputDecoration(
                            labelText: AppLocale.get('mobileLabel', lang),
                            prefixIcon: const Icon(Icons.phone_rounded, color: AppTheme.primaryBlue, size: 20),
                            filled: true,
                            fillColor: AppTheme.bgLight,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Password Input
                        TextField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: InputDecoration(
                            labelText: AppLocale.get('passwordLabel', lang),
                            prefixIcon: const Icon(Icons.lock_rounded, color: AppTheme.primaryBlue, size: 20),
                            filled: true,
                            fillColor: AppTheme.bgLight,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Submit Button
                        ElevatedButton(
                          onPressed: _handleLogin,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.accentEmerald,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          child: Text(
                            AppLocale.get('loginBtn', lang),
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Demo Quick Access
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => _fillDemo('9999999999', 'admin'),
                      icon: const Icon(Icons.shield_rounded, size: 16, color: AppTheme.primaryBlue),
                      label: Text(
                        AppLocale.get('adminDemo', lang),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppTheme.primaryBlue),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
