import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../providers/app_provider.dart';
import '../models/models.dart';

class ThermalSlipView extends StatelessWidget {
  final String workerId;

  const ThermalSlipView({super.key, required this.workerId});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final khata = provider.calculateKhata(workerId);
    final Worker worker = khata['worker'];
    final profile = provider.firmProfile;
    final double netPayable = khata['netPayable'];
    final bool isExcessAdvance = netPayable < 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('अधिकृत पावती (Payment Slip)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, size: 24),
          onPressed: () => Navigator.of(context).pop(),
          tooltip: 'बंद करा (Close)',
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.print_rounded, color: AppTheme.primaryBlue),
            tooltip: 'प्रिंट करा (Print)',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('प्रिंटरला पावती पाठवली जात आहे... (Printing Slip)')),
              );
            },
          ),
        ],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Container(
            width: 320,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Center(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.asset(
                      'assets/images/shriram_logo.jpg',
                      width: 44,
                      height: 44,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  profile.firmName,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppTheme.primaryBlue),
                ),
                Text(
                  'प्रो.: ${profile.ownerName} • ${profile.phone}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
                Text(
                  profile.tagline,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 9, color: Colors.grey),
                ),
                Text(
                  profile.address,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 9, color: Colors.grey),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'मासिक मजुरी व उचल हिशोब पावती',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                ),
                const Divider(thickness: 1, height: 16),

                // Worker info
                _row('कामगार:', worker.fullName, isBold: true),
                _row('कौशल्य / काम:', worker.skill),
                _row('रोजंदारी दर:', '₹${worker.dailyRate.toInt()} / दिवस'),
                _row('हजेरी तपशील:', '${khata['fullDays']} Full + ${khata['halfDays']} Half = ${khata['totalDaysEquiv']} दिवस'),
                const Divider(thickness: 1, height: 16),

                // Calculations
                _row('चालू महिन्याची मजुरी:', '₹${khata['wagesEarned'].toInt()}'),
                _row('मागील शिल्लक बाकी:', '₹${khata['openingBalance'].toInt()}'),
                _row('एकूण देय मजुरी:', '₹${(khata['wagesEarned'] + khata['openingBalance']).toInt()}', isBold: true),
                const Divider(thickness: 1, height: 16),

                // Advances
                const Text(
                  'घेतलेली उचल (Advance Breakdown):',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
                ),
                const SizedBox(height: 4),
                ...((khata['advancesList'] as List<AdvanceRecord>).map(
                  (adv) => _row('• ${adv.date} (${adv.reason})', '- ₹${adv.amount.toInt()}'),
                )),
                const Divider(thickness: 1, height: 16),

                // Net Cash Banner
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                  decoration: BoxDecoration(
                    color: isExcessAdvance ? Colors.red.shade50 : AppTheme.emeraldLight,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: isExcessAdvance ? Colors.red.shade300 : AppTheme.accentEmerald),
                  ),
                  child: Column(
                    children: [
                      Text(
                        isExcessAdvance ? '⚠️ अतिरिक्त उचल / मजुराकडे शिल्लक येणे' : '✅ आज हातात द्यायची निव्वळ मजुरी',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isExcessAdvance ? Colors.red.shade900 : AppTheme.accentEmerald,
                        ),
                      ),
                      Text(
                        '₹${(isExcessAdvance ? -netPayable : netPayable).toInt()} /-',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: isExcessAdvance ? Colors.red.shade700 : AppTheme.accentEmerald,
                        ),
                      ),
                      if (isExcessAdvance)
                        Text(
                          '(पुढील महिन्याच्या खात्यावर वर्ग होईल)',
                          style: TextStyle(fontSize: 8, color: Colors.red.shade800),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Signatures
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      children: [
                        Text(profile.ownerName, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                        const Text('(कंत्राटदार सही)', style: TextStyle(fontSize: 9, color: Colors.grey)),
                      ],
                    ),
                    Column(
                      children: [
                        Text(worker.fullName, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                        const Text('(कामगार अंगठा/सही)', style: TextStyle(fontSize: 9, color: Colors.grey)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _row(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 10, color: isBold ? AppTheme.textDark : AppTheme.textMuted)),
          Text(
            value,
            style: TextStyle(
              fontSize: 10,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: AppTheme.textDark,
            ),
          ),
        ],
      ),
    );
  }
}
