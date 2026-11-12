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
    final lang = provider.language;
    final khata = provider.calculateKhata(workerId);
    final Worker worker = khata['worker'];
    final profile = provider.firmProfile;
    final double netPayable = khata['netPayable'];
    final bool isExcessAdvance = netPayable < 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          lang == 'mr' ? 'अधिकृत पावती (Payment Slip)' : 'Official Payment Slip',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
        ),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded, size: 24),
          onPressed: () => Navigator.of(context).pop(),
          tooltip: lang == 'mr' ? 'बंद करा (Close)' : 'Close',
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.print_rounded, color: AppTheme.primaryBlue),
            tooltip: lang == 'mr' ? 'प्रिंट करा (Print)' : 'Print',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    lang == 'mr'
                        ? 'प्रिंटरला पावती पाठवली जात आहे... (Printing Slip)'
                        : 'Preparing slip for print...',
                  ),
                ),
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
                  '${lang == 'mr' ? 'प्रो.' : 'Prop.'}: ${profile.ownerName} • ${profile.phone}',
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
                  child: Text(
                    profile.thermalHeader.isNotEmpty
                        ? profile.thermalHeader
                        : (lang == 'mr' ? 'मासिक मजुरी व उचल हिशोब पावती' : 'Monthly Wage & Advance Settlement Slip'),
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                ),
                const Divider(thickness: 1, height: 16),

                // Worker info
                _row(lang == 'mr' ? 'कामगार:' : 'Worker:', worker.fullName, isBold: true),
                _row(lang == 'mr' ? 'कौशल्य / काम:' : 'Skill / Role:', worker.skill),
                _row(lang == 'mr' ? 'रोजंदारी दर:' : 'Daily Rate:', '₹${worker.dailyRate.toInt()} / ${lang == 'mr' ? 'दिवस' : 'day'}'),
                _row(
                  lang == 'mr' ? 'हजेरी तपशील:' : 'Attendance:',
                  '${khata['fullDays']} Full + ${khata['halfDays']} Half = ${khata['totalDaysEquiv']} ${lang == 'mr' ? 'दिवस' : 'days'}',
                ),
                const Divider(thickness: 1, height: 16),

                // Calculations
                _row(lang == 'mr' ? 'चालू महिन्याची मजुरी:' : 'Wages Earned:', '₹${khata['wagesEarned'].toInt()}'),
                _row(lang == 'mr' ? 'मागील शिल्लक बाकी:' : 'Opening Balance:', '₹${khata['openingBalance'].toInt()}'),
                _row(
                  lang == 'mr' ? 'एकूण देय मजुरी:' : 'Gross Payable:',
                  '₹${(khata['wagesEarned'] + khata['openingBalance']).toInt()}',
                  isBold: true,
                ),
                const Divider(thickness: 1, height: 16),

                // Advances
                Text(
                  lang == 'mr' ? 'घेतलेली उचल (Advance Breakdown):' : 'Advances Taken (Breakdown):',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
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
                        isExcessAdvance
                            ? (lang == 'mr' ? '⚠️ अतिरिक्त उचल / मजुराकडे शिल्लक येणे' : '⚠️ Excess Advance Balance Due')
                            : (lang == 'mr' ? '✅ आज हातात द्यायची निव्वळ मजुरी' : '✅ Net Cash Payable Today'),
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
                          lang == 'mr' ? '(पुढील महिन्याच्या खात्यावर वर्ग होईल)' : '(Carried forward to next month)',
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
                    Flexible(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(profile.ownerName, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                          Text(lang == 'mr' ? '(कंत्राटदार सही)' : '(Contractor Sign)', style: const TextStyle(fontSize: 9, color: Colors.grey)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(worker.fullName, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                          Text(lang == 'mr' ? '(कामगार अंगठा/सही)' : '(Worker Sign)', style: const TextStyle(fontSize: 9, color: Colors.grey)),
                        ],
                      ),
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
          Flexible(
            child: Text(label, style: TextStyle(fontSize: 10, color: isBold ? AppTheme.textDark : AppTheme.textMuted)),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
                color: AppTheme.textDark,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
