import 'package:flutter/material.dart';

class AppTheme {
  // Strict Two-Color Modern Palette (No dark mode clutter, clean luminous fresh UI)
  static const Color primaryBlue = Color(0xFF2563EB); // Vibrant Royal Sapphire Blue
  static const Color accentEmerald = Color(0xFF10B981); // Fresh Mint Emerald
  static const Color emeraldLight = Color(0xFFECFDF5);
  static const Color blueLight = Color(0xFFEFF6FF);
  
  static const Color bgLight = Color(0xFFF8FAFC);
  static const Color surfaceWhite = Colors.white;
  static const Color textDark = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF64748B);
  static const Color borderLight = Color(0xFFE2E8F0);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: bgLight,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryBlue,
        primary: primaryBlue,
        secondary: accentEmerald,
        surface: surfaceWhite,
        brightness: Brightness.light,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surfaceWhite,
        foregroundColor: textDark,
        elevation: 0.5,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textDark,
          fontSize: 18,
          fontWeight: FontWeight.w800,
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceWhite,
        elevation: 0.5,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: borderLight, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accentEmerald,
          foregroundColor: Colors.white,
          elevation: 1,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: const TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  /// Bento Grid Modular Card Decoration
  static BoxDecoration bentoDecoration({
    Color bgColor = surfaceWhite,
    Color borderColor = borderLight,
    double radius = 20,
  }) {
    return BoxDecoration(
      color: bgColor,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: borderColor, width: 1),
      boxShadow: [
        BoxShadow(
          color: const Color(0xFF0F172A).withValues(alpha: 0.04),
          blurRadius: 10,
          offset: const Offset(0, 3),
        ),
      ],
    );
  }

  /// 3D Tactile Extruded Button Decoration
  static BoxDecoration tactileButtonDecoration({
    Color bgColor = surfaceWhite,
    Color borderColor = borderLight,
    double radius = 14,
  }) {
    return BoxDecoration(
      color: bgColor,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: borderColor, width: 1),
      boxShadow: [
        const BoxShadow(
          color: Colors.white,
          offset: Offset(-2, -2),
          blurRadius: 4,
        ),
        BoxShadow(
          color: const Color(0xFF0F172A).withValues(alpha: 0.06),
          offset: const Offset(2, 3),
          blurRadius: 6,
        ),
      ],
    );
  }

  /// 3D Tactile Active/Pressed Inset State
  static BoxDecoration tactilePressedDecoration({
    Color bgColor = const Color(0xFFEFF6FF),
    Color borderColor = primaryBlue,
    double radius = 14,
  }) {
    return BoxDecoration(
      color: bgColor,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: borderColor, width: 1.5),
      boxShadow: [
        BoxShadow(
          color: const Color(0xFF0F172A).withValues(alpha: 0.07),
          offset: const Offset(1, 2),
          blurRadius: 3,
        ),
      ],
    );
  }
}
