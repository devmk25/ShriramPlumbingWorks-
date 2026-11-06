import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../core/localization.dart';
import '../providers/app_provider.dart';
import '../models/models.dart';
import 'login_view.dart';
import 'thermal_slip_view.dart';

class AdminHomeView extends StatefulWidget {
  const AdminHomeView({super.key});

  @override
  State<AdminHomeView> createState() => _AdminHomeViewState();
}

class _AdminHomeViewState extends State<AdminHomeView> {
  int _currentIndex = 0;

  // Local Attendance State
  final Map<String, String> _workerAttendanceStatus = {};
  final Map<String, String> _workerAttendanceSite = {};
  final String _selectedAttendanceDate = DateTime.now().toIso8601String().split('T')[0];

  // Dynamic Work Log Form State
  String? _workSiteId;
  String? _workCategoryId;
  final _workQuantityController = TextEditingController(text: '2500');
  final _workRateController = TextEditingController(text: '4.5');
  final _workNotesController = TextEditingController();

  // Advance Form State
  String? _advWorkerId;
  String? _advSiteId;
  final _advAmountController = TextEditingController();
  final _advReasonController = TextEditingController(text: 'घरखर्च उचल');
  String _advPaymentMode = 'CASH';

  // Reports State
  String _reportsSubTab = 'WORKERS'; // 'WORKERS' or 'BUILDERS'
  String? _selectedReportBuilderId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<AppProvider>(context, listen: false);
      _initAttendanceDefaults(provider);
      if (provider.sites.isNotEmpty) {
        _workSiteId = provider.sites[0].id;
        _advSiteId = provider.sites[0].id;
      }
      if (provider.workCategories.isNotEmpty) {
        _workCategoryId = provider.workCategories[2].id; // cat_03 Dhumus
        _workRateController.text = provider.workCategories[2].defaultRate.toString();
      }
      if (provider.workers.isNotEmpty) {
        _advWorkerId = provider.workers[0].id;
      }
      if (provider.builders.isNotEmpty) {
        _selectedReportBuilderId = provider.builders[0].id;
      }
      setState(() {});
    });
  }

  void _initAttendanceDefaults(AppProvider provider) {
    for (var w in provider.workers) {
      if (!_workerAttendanceStatus.containsKey(w.id)) {
        _workerAttendanceStatus[w.id] = 'FULL';
      }
      if (!_workerAttendanceSite.containsKey(w.id)) {
        _workerAttendanceSite[w.id] = provider.sites.isNotEmpty ? provider.sites[0].id : '';
      }
    }
  }

  Future<bool> _showExitDialog(BuildContext context, String lang) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.exit_to_app_rounded, color: Colors.red.shade600, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                lang == 'mr' ? 'बाहेर पडायचे आहे का?' : 'Exit App?',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
              ),
            ),
          ],
        ),
        content: Text(
          lang == 'mr'
              ? 'तुम्हाला श्रीराम प्लंबिंग वर्क्स ॲपमधून बाहेर पडायचे आहे का?'
              : 'Are you sure you want to exit Shriram Plumbing Works?',
          style: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(
              lang == 'mr' ? 'रद्द करा' : 'Cancel',
              style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade600,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
            child: Text(
              lang == 'mr' ? 'बाहेर पडा' : 'Exit',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final lang = provider.language;
    final profile = provider.firmProfile;

    _initAttendanceDefaults(provider);

    final tabs = [
      _buildDashboardTab(provider, lang),
      _buildBuildersTab(provider, lang),
      _buildAttendanceTab(provider, lang),
      _buildWorkLogTab(provider, lang),
      _buildWorkersTab(provider, lang),
      _buildAdvancesTab(provider, lang),
      _buildReportsTab(provider, lang),
    ];

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, Object? result) async {
        if (didPop) return;
        if (_currentIndex != 0) {
          setState(() {
            _currentIndex = 0;
          });
        } else {
          final shouldExit = await _showExitDialog(context, lang);
          if (shouldExit == true) {
            SystemNavigator.pop();
          }
        }
      },
      child: Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        leading: Padding(
          padding: const EdgeInsets.only(left: 12, top: 8, bottom: 8),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Image.asset(
              'assets/images/shriram_logo.jpg',
              fit: BoxFit.cover,
            ),
          ),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(profile.firmName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.textDark)),
            Text('${profile.ownerName} • ${lang == 'mr' ? 'प्रोप्रा. कंत्राटदार' : 'Proprietor'}', style: const TextStyle(fontSize: 10, color: AppTheme.accentEmerald, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: TextButton.icon(
              onPressed: provider.toggleLanguage,
              icon: const Icon(Icons.language_rounded, size: 15, color: AppTheme.primaryBlue),
              label: Text(lang == 'mr' ? 'ENG' : 'मराठी', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.primaryBlue)),
              style: TextButton.styleFrom(
                backgroundColor: AppTheme.blueLight,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 10),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.power_settings_new_rounded, color: Colors.redAccent, size: 20),
            onPressed: () {
              provider.logout();
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const LoginView()),
              );
            },
          ),
        ],
      ),
      body: tabs[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: AppTheme.borderLight, width: 1)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          selectedItemColor: AppTheme.primaryBlue,
          unselectedItemColor: const Color(0xFF64748B),
          backgroundColor: Colors.transparent,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 10),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 9),
          items: [
            BottomNavigationBarItem(
              icon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.grid_view_rounded, size: 20)),
              activeIcon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.grid_view_rounded, size: 22, color: AppTheme.primaryBlue)),
              label: AppLocale.get('dashboard', lang),
            ),
            BottomNavigationBarItem(
              icon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.domain_rounded, size: 20)),
              activeIcon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.domain_rounded, size: 22, color: AppTheme.primaryBlue)),
              label: AppLocale.get('builders', lang),
            ),
            BottomNavigationBarItem(
              icon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.how_to_reg_rounded, size: 20)),
              activeIcon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.how_to_reg_rounded, size: 22, color: AppTheme.primaryBlue)),
              label: AppLocale.get('attendance', lang),
            ),
            BottomNavigationBarItem(
              icon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.handyman_rounded, size: 20)),
              activeIcon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.handyman_rounded, size: 22, color: AppTheme.primaryBlue)),
              label: AppLocale.get('workLog', lang),
            ),
            BottomNavigationBarItem(
              icon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.badge_rounded, size: 20)),
              activeIcon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.badge_rounded, size: 22, color: AppTheme.primaryBlue)),
              label: AppLocale.get('workers', lang),
            ),
            BottomNavigationBarItem(
              icon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.account_balance_wallet_rounded, size: 20)),
              activeIcon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.account_balance_wallet_rounded, size: 22, color: AppTheme.primaryBlue)),
              label: AppLocale.get('advances', lang),
            ),
            BottomNavigationBarItem(
              icon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.receipt_long_rounded, size: 20)),
              activeIcon: const Padding(padding: EdgeInsets.only(bottom: 2), child: Icon(Icons.receipt_long_rounded, size: 22, color: AppTheme.primaryBlue)),
              label: AppLocale.get('reports', lang),
            ),
          ],
        ),
      ),
    ));
  }

  // 1. DASHBOARD TAB
  Widget _buildDashboardTab(AppProvider provider, String lang) {
    final activeSitesCount = provider.sites.where((s) => s.status == 'ACTIVE').length;
    final todayStr = _selectedAttendanceDate;
    final todayWorkers = provider.attendance.where((a) => a.date == todayStr && (a.status == 'FULL' || a.status == 'HALF')).length;
    final todayAdvances = provider.advances.where((a) => a.date == todayStr).fold<double>(0.0, (s, a) => s + a.amount);
    final todayBilling = provider.dailyWork.where((d) => d.date == todayStr).fold<double>(0.0, (s, d) => s + d.totalBilling);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: AppTheme.bentoDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.emeraldLight,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppTheme.accentEmerald.withValues(alpha: 0.3)),
                  ),
                  child: Text(AppLocale.get('todaySummary', lang), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentEmerald)),
                ),
                const SizedBox(height: 12),
                Text('${lang == 'mr' ? 'दिनांक' : 'Date'}: $todayStr', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppTheme.textDark)),
                const SizedBox(height: 14),

                Row(
                  children: [
                    Expanded(child: _metricTile(AppLocale.get('activeSites', lang), '$activeSitesCount', Icons.location_on_rounded, AppTheme.primaryBlue)),
                    const SizedBox(width: 8),
                    Expanded(child: _metricTile(AppLocale.get('todayWorkers', lang), '$todayWorkers', Icons.groups_rounded, AppTheme.accentEmerald)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(child: _metricTile(AppLocale.get('todayAdvances', lang), '₹${todayAdvances.toInt()}', Icons.money_off_rounded, Colors.red.shade600)),
                    const SizedBox(width: 8),
                    Expanded(child: _metricTile(AppLocale.get('todayBilling', lang), '₹${todayBilling.toInt()}', Icons.receipt_long_rounded, AppTheme.primaryBlue)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Quick Action Buttons
          Text(AppLocale.get('quickActions', lang), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => setState(() => _currentIndex = 2), // Attendance tab
                  icon: const Icon(Icons.check_circle_outline, size: 16),
                  label: Text(AppLocale.get('markAttendance', lang)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.accentEmerald,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => setState(() => _currentIndex = 3), // Work Log tab
                  icon: const Icon(Icons.add_task_rounded, size: 16),
                  label: Text(AppLocale.get('logWork', lang)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 2. BUILDERS & CIVIL ENGINEERS TAB
  Widget _buildBuildersTab(AppProvider provider, String lang) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          color: Colors.white,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${AppLocale.get('builders', lang)} (${provider.builders.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
              ElevatedButton.icon(
                onPressed: () => _showAddBuilderDialog(provider),
                icon: const Icon(Icons.add_business_rounded, size: 16),
                label: Text(AppLocale.get('addBuilder', lang)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryBlue,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: provider.builders.length,
            itemBuilder: (context, index) {
              final b = provider.builders[index];
              final linkedSites = provider.sites.where((s) => s.builderId == b.id).toList();

              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(b.firmName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.primaryBlue)),
                                Text(b.engineerName, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87)),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline_rounded, color: Colors.red, size: 20),
                            onPressed: () {
                              provider.deleteBuilder(b.id);
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang == 'mr' ? 'बिल्डर हटवला गेला!' : 'Builder removed!')));
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.phone, size: 14, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(b.phone, style: const TextStyle(fontSize: 11, color: Colors.black87)),
                          const SizedBox(width: 14),
                          const Icon(Icons.location_on, size: 14, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(b.location, style: const TextStyle(fontSize: 11, color: Colors.black87)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (linkedSites.isNotEmpty)
                        Wrap(
                          spacing: 4,
                          children: linkedSites.map((s) => Chip(
                            label: Text(s.name, style: const TextStyle(fontSize: 10)),
                            backgroundColor: AppTheme.blueLight,
                            padding: EdgeInsets.zero,
                            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          )).toList(),
                        ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // 3. ATTENDANCE TAB
  Widget _buildAttendanceTab(AppProvider provider, String lang) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          color: Colors.white,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(AppLocale.get('fastAttendanceTitle', lang), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
              ElevatedButton.icon(
                onPressed: () {
                  final records = provider.workers.map((w) {
                    return {
                      'workerId': w.id,
                      'siteId': _workerAttendanceSite[w.id] ?? (provider.sites.isNotEmpty ? provider.sites[0].id : ''),
                      'date': _selectedAttendanceDate,
                      'status': _workerAttendanceStatus[w.id] ?? 'FULL',
                    };
                  }).toList();

                  provider.markAttendance(records);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(lang == 'mr' ? 'सर्व कामगारांची हजेरी सेव्ह झाली!' : 'All attendance saved!'), backgroundColor: AppTheme.accentEmerald),
                  );
                },
                icon: const Icon(Icons.check, size: 16),
                label: Text(AppLocale.get('saveAttendance', lang)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentEmerald,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: provider.workers.length,
            itemBuilder: (context, index) {
              final worker = provider.workers[index];
              final currentStatus = _workerAttendanceStatus[worker.id] ?? 'FULL';

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(worker.fullName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                          Text('₹${worker.dailyRate.toInt()}/${lang == 'mr' ? 'दिवस' : 'day'}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () => setState(() => _workerAttendanceStatus[worker.id] = 'FULL'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: currentStatus == 'FULL' ? AppTheme.accentEmerald : Colors.grey.shade100,
                                foregroundColor: currentStatus == 'FULL' ? Colors.white : Colors.black87,
                                padding: const EdgeInsets.symmetric(vertical: 8),
                              ),
                              child: Text(AppLocale.get('fullDay', lang), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () => setState(() => _workerAttendanceStatus[worker.id] = 'HALF'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: currentStatus == 'HALF' ? AppTheme.primaryBlue : Colors.grey.shade100,
                                foregroundColor: currentStatus == 'HALF' ? Colors.white : Colors.black87,
                                padding: const EdgeInsets.symmetric(vertical: 8),
                              ),
                              child: Text(AppLocale.get('halfDay', lang), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () => setState(() => _workerAttendanceStatus[worker.id] = 'ABSENT'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: currentStatus == 'ABSENT' ? Colors.black87 : Colors.grey.shade100,
                                foregroundColor: currentStatus == 'ABSENT' ? Colors.white : Colors.black87,
                                padding: const EdgeInsets.symmetric(vertical: 8),
                              ),
                              child: Text(AppLocale.get('absent', lang), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // 4. WORK LOG (DYNAMIC CATEGORY & SITES) TAB
  Widget _buildWorkLogTab(AppProvider provider, String lang) {
    final activeCat = provider.workCategories.where((c) => c.id == _workCategoryId).firstOrNull ?? provider.workCategories[0];
    final qty = double.tryParse(_workQuantityController.text) ?? 0.0;
    final rt = double.tryParse(_workRateController.text) ?? 0.0;
    final totalAmount = qty * rt;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(AppLocale.get('workLog', lang), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
              TextButton.icon(
                onPressed: () => _showAddCategoryDialog(provider),
                icon: const Icon(Icons.add, size: 16),
                label: Text(AppLocale.get('addCategory', lang)),
              ),
            ],
          ),
          const SizedBox(height: 10),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.borderLight),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Site Dropdown
                DropdownButtonFormField<String>(
                  initialValue: _workSiteId ?? (provider.sites.isNotEmpty ? provider.sites[0].id : null),
                  decoration: InputDecoration(
                    labelText: AppLocale.get('selectSite', lang),
                    filled: true,
                    fillColor: AppTheme.bgLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                  items: provider.sites.map((s) => DropdownMenuItem(value: s.id, child: Text('${s.name} (${s.builderName.isNotEmpty ? s.builderName : s.location})', style: const TextStyle(fontSize: 11)))).toList(),
                  onChanged: (val) => setState(() => _workSiteId = val),
                ),
                const SizedBox(height: 12),

                // Category Dropdown
                DropdownButtonFormField<String>(
                  initialValue: _workCategoryId ?? (provider.workCategories.isNotEmpty ? provider.workCategories[0].id : null),
                  decoration: InputDecoration(
                    labelText: AppLocale.get('selectCategory', lang),
                    filled: true,
                    fillColor: AppTheme.bgLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                  items: provider.workCategories.map((c) => DropdownMenuItem(value: c.id, child: Text('${c.name} (${c.unit})', style: const TextStyle(fontSize: 11)))).toList(),
                  onChanged: (val) {
                    setState(() {
                      _workCategoryId = val;
                      final selected = provider.workCategories.where((c) => c.id == val).firstOrNull;
                      if (selected != null && selected.defaultRate > 0) {
                        _workRateController.text = selected.defaultRate.toString();
                      }
                    });
                  },
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: _workQuantityController,
                        keyboardType: TextInputType.number,
                        onChanged: (_) => setState(() {}),
                        decoration: InputDecoration(
                          labelText: '${AppLocale.get('quantity', lang)} (${activeCat.unit})',
                          filled: true,
                          fillColor: AppTheme.bgLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 1,
                      child: TextField(
                        controller: _workRateController,
                        keyboardType: TextInputType.number,
                        onChanged: (_) => setState(() {}),
                        decoration: InputDecoration(
                          labelText: AppLocale.get('rate', lang),
                          filled: true,
                          fillColor: AppTheme.bgLight,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: _workNotesController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    labelText: AppLocale.get('workNotes', lang),
                    filled: true,
                    fillColor: AppTheme.bgLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 12),

                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(color: AppTheme.emeraldLight, borderRadius: BorderRadius.circular(12)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(AppLocale.get('totalWorkBill', lang), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.accentEmerald)),
                      Text('₹${totalAmount.toInt()}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppTheme.accentEmerald)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                ElevatedButton(
                  onPressed: () {
                    final siteId = _workSiteId ?? (provider.sites.isNotEmpty ? provider.sites[0].id : '');
                    if (siteId.isEmpty) return;

                    provider.addDailyWorkLog(
                      siteId: siteId,
                      categoryId: activeCat.id,
                      categoryName: activeCat.name,
                      date: DateTime.now().toIso8601String().split('T')[0],
                      quantity: qty,
                      unit: activeCat.unit,
                      rate: rt,
                      totalAmount: totalAmount,
                      notes: _workNotesController.text,
                    );

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(lang == 'mr' ? 'काम मोजमाप यशस्वीपणे सेव्ह झाले!' : 'Work log saved successfully!'), backgroundColor: AppTheme.accentEmerald),
                    );
                    _workNotesController.clear();
                  },
                  child: Text(AppLocale.get('saveWork', lang)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          Text(AppLocale.get('recentWorkLogs', lang), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          ...provider.dailyWork.map(
            (dw) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              child: ListTile(
                title: Text(dw.siteName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                subtitle: Text('${dw.categoryName}: ${dw.quantity.toInt()} ${dw.unit} @ ₹${dw.rate.toInt()} • ${dw.date}', style: const TextStyle(fontSize: 11)),
                trailing: Text('₹${dw.totalAmount.toInt()}', style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.accentEmerald)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 5. WORKERS & KHATA TAB
  Widget _buildWorkersTab(AppProvider provider, String lang) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          color: Colors.white,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${AppLocale.get('workers', lang)} (${provider.workers.length})', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
              ElevatedButton.icon(
                onPressed: () => _showAddWorkerDialog(provider),
                icon: const Icon(Icons.person_add, size: 16),
                label: Text(AppLocale.get('addWorker', lang)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentEmerald,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: provider.workers.length,
            itemBuilder: (context, index) {
              final worker = provider.workers[index];
              final khata = provider.calculateKhata(worker.id);
              final double netPayable = khata['netPayable'];
              final bool isExcess = netPayable < 0;

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(worker.fullName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: AppTheme.blueLight, borderRadius: BorderRadius.circular(8)),
                            child: Text('₹${worker.dailyRate.toInt()}/${lang == 'mr' ? 'दिवस' : 'day'}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
                          ),
                        ],
                      ),
                      Text('${worker.skill} • ${lang == 'mr' ? 'मो.' : 'Mo.'}: ${worker.phone}', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      const SizedBox(height: 10),

                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isExcess ? Colors.red.shade50 : AppTheme.emeraldLight,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isExcess ? Colors.red.shade300 : AppTheme.accentEmerald),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              isExcess ? AppLocale.get('excessAdvance', lang) : AppLocale.get('netPayable', lang),
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isExcess ? Colors.red.shade900 : AppTheme.accentEmerald),
                            ),
                            Text(
                              '₹${(isExcess ? -netPayable : netPayable).toInt()} /-',
                              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: isExcess ? Colors.red.shade700 : AppTheme.accentEmerald),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton.icon(
                            onPressed: () {
                              setState(() {
                                _advWorkerId = worker.id;
                                _currentIndex = 5; // Advances tab
                              });
                            },
                            icon: const Icon(Icons.payments_rounded, size: 16),
                            label: Text(AppLocale.get('giveAdvance', lang)),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton.icon(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => ThermalSlipView(workerId: worker.id)),
                              );
                            },
                            icon: const Icon(Icons.receipt_long, size: 16),
                            label: Text(AppLocale.get('viewSlip', lang)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryBlue,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // 6. ADVANCES TAB
  Widget _buildAdvancesTab(AppProvider provider, String lang) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(AppLocale.get('advances', lang), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.borderLight),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                DropdownButtonFormField<String>(
                  initialValue: _advWorkerId ?? (provider.workers.isNotEmpty ? provider.workers[0].id : null),
                  decoration: InputDecoration(
                    labelText: AppLocale.get('selectWorker', lang),
                    filled: true,
                    fillColor: AppTheme.bgLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                  items: provider.workers.map((w) => DropdownMenuItem(value: w.id, child: Text(w.fullName, style: const TextStyle(fontSize: 12)))).toList(),
                  onChanged: (val) => setState(() => _advWorkerId = val),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: _advAmountController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: AppLocale.get('advanceAmount', lang),
                    filled: true,
                    fillColor: AppTheme.bgLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 10),

                Wrap(
                  spacing: 6,
                  children: [200, 500, 1000, 2000, 5000].map((amt) {
                    return ActionChip(
                      label: Text('+₹$amt', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      onPressed: () => _advAmountController.text = amt.toString(),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: _advReasonController,
                  decoration: InputDecoration(
                    labelText: AppLocale.get('advanceReason', lang),
                    filled: true,
                    fillColor: AppTheme.bgLight,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 12),

                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => setState(() => _advPaymentMode = 'CASH'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _advPaymentMode == 'CASH' ? AppTheme.primaryBlue : Colors.grey.shade100,
                          foregroundColor: _advPaymentMode == 'CASH' ? Colors.white : Colors.black87,
                        ),
                        child: Text(AppLocale.get('cash', lang)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => setState(() => _advPaymentMode = 'UPI'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _advPaymentMode == 'UPI' ? AppTheme.primaryBlue : Colors.grey.shade100,
                          foregroundColor: _advPaymentMode == 'UPI' ? Colors.white : Colors.black87,
                        ),
                        child: Text(AppLocale.get('upi', lang)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                ElevatedButton(
                  onPressed: () {
                    final workerId = _advWorkerId ?? (provider.workers.isNotEmpty ? provider.workers[0].id : '');
                    final amount = double.tryParse(_advAmountController.text) ?? 0.0;
                    if (workerId.isEmpty || amount <= 0) return;

                    provider.addAdvance(
                      workerId: workerId,
                      siteId: _advSiteId ?? '',
                      date: DateTime.now().toIso8601String().split('T')[0],
                      amount: amount,
                      reason: _advReasonController.text,
                      paymentMode: _advPaymentMode,
                    );

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('₹${amount.toInt()} ${lang == 'mr' ? 'उचल नोंदवली गेली!' : 'advance recorded!'}'), backgroundColor: AppTheme.accentEmerald),
                    );
                    _advAmountController.clear();
                  },
                  child: Text(AppLocale.get('saveAdvance', lang)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          Text(AppLocale.get('recentAdvances', lang), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          ...provider.advances.map(
            (adv) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              child: ListTile(
                title: Text(adv.workerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                subtitle: Text('${adv.date} • ${adv.reason}', style: const TextStyle(fontSize: 11)),
                trailing: Text('- ₹${adv.amount.toInt()}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.red)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // 7. REPORTS TAB (WORKER SLIPS & BUILDER INVOICES)
  Widget _buildReportsTab(AppProvider provider, String lang) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => setState(() => _reportsSubTab = 'WORKERS'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _reportsSubTab == 'WORKERS' ? AppTheme.primaryBlue : Colors.white,
                    foregroundColor: _reportsSubTab == 'WORKERS' ? Colors.white : Colors.black87,
                  ),
                  child: Text(AppLocale.get('workerSlip', lang), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => setState(() => _reportsSubTab = 'BUILDERS'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _reportsSubTab == 'BUILDERS' ? AppTheme.primaryBlue : Colors.white,
                    foregroundColor: _reportsSubTab == 'BUILDERS' ? Colors.white : Colors.black87,
                  ),
                  child: Text(AppLocale.get('builderBill', lang), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (_reportsSubTab == 'WORKERS') ...[
            ...provider.workers.map((w) {
              final khata = provider.calculateKhata(w.id);
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: ListTile(
                  title: Text(w.fullName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text('${lang == 'mr' ? 'मजुरी' : 'Wages'}: ₹${khata['wagesEarned'].toInt()} • ${lang == 'mr' ? 'उचल' : 'Advance'}: -₹${khata['totalAdvances'].toInt()}', style: const TextStyle(fontSize: 11)),
                  trailing: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => ThermalSlipView(workerId: w.id)),
                      );
                    },
                    icon: const Icon(Icons.print_rounded, size: 14),
                    label: Text(AppLocale.get('viewSlip', lang)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryBlue,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    ),
                  ),
                ),
              );
            }),
          ] else ...[
            DropdownButtonFormField<String>(
              initialValue: _selectedReportBuilderId ?? (provider.builders.isNotEmpty ? provider.builders[0].id : null),
              decoration: InputDecoration(
                labelText: AppLocale.get('builders', lang),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
              items: provider.builders.map((b) => DropdownMenuItem(value: b.id, child: Text('${b.firmName} (${b.engineerName})', style: const TextStyle(fontSize: 11)))).toList(),
              onChanged: (val) => setState(() => _selectedReportBuilderId = val),
            ),
            const SizedBox(height: 12),

            if (_selectedReportBuilderId != null) ...[
              Builder(
                builder: (context) {
                  final billing = provider.calculateBuilderBilling(_selectedReportBuilderId!);
                  if (billing == null) return const SizedBox.shrink();

                  final double total = billing['totalBilled'];
                  final List<DailyWorkLog> works = billing['works'];

                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.borderLight),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text('${AppLocale.get('totalMonthlyBill', lang)} ₹${total.toInt()}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppTheme.accentEmerald)),
                        const SizedBox(height: 12),
                        Text(AppLocale.get('workDetails', lang), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        const SizedBox(height: 6),
                        ...works.map((w) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('${w.categoryName} (${w.quantity.toInt()} ${w.unit})', style: const TextStyle(fontSize: 11)),
                              Text('₹${w.totalAmount.toInt()}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        )),
                      ],
                    ),
                  );
                },
              ),
            ],
          ],
        ],
      ),
    );
  }

  // Dialog: Add Builder
  void _showAddBuilderDialog(AppProvider provider) {
    final lang = provider.language;
    final firmCtrl = TextEditingController();
    final engCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final locCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(AppLocale.get('addBuilder', lang), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: firmCtrl, decoration: InputDecoration(labelText: lang == 'mr' ? 'फर्म / कन्स्ट्रक्शनचे नाव' : 'Firm / Construction Name')),
              const SizedBox(height: 8),
              TextField(controller: engCtrl, decoration: InputDecoration(labelText: lang == 'mr' ? 'इंजिनिअरचे नाव *' : 'Engineer Name *')),
              const SizedBox(height: 8),
              TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: InputDecoration(labelText: lang == 'mr' ? 'मोबाईल नंबर' : 'Phone Number')),
              const SizedBox(height: 8),
              TextField(controller: locCtrl, decoration: InputDecoration(labelText: lang == 'mr' ? 'गाव / ठिकाण' : 'Location')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: Text(AppLocale.get('cancel', lang))),
          ElevatedButton(
            onPressed: () {
              if (engCtrl.text.isNotEmpty || firmCtrl.text.isNotEmpty) {
                provider.addBuilder(
                  firmName: firmCtrl.text.isNotEmpty ? firmCtrl.text : (lang == 'mr' ? 'वैयक्तिक बांधकाम' : 'Private Construction'),
                  engineerName: engCtrl.text,
                  phone: phoneCtrl.text,
                  location: locCtrl.text.isNotEmpty ? locCtrl.text : 'सांगली',
                );
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang == 'mr' ? 'नवीन बिल्डर जोडला गेला!' : 'New builder registered!')));
              }
            },
            child: Text(lang == 'mr' ? 'नोंदवा' : 'Save'),
          ),
        ],
      ),
    );
  }

  // Dialog: Add Work Category
  void _showAddCategoryDialog(AppProvider provider) {
    final lang = provider.language;
    final nameCtrl = TextEditingController();
    final unitCtrl = TextEditingController(text: lang == 'mr' ? 'काम' : 'work');
    final rateCtrl = TextEditingController(text: '0');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(AppLocale.get('addCategory', lang), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: InputDecoration(labelText: lang == 'mr' ? 'कामाचे नाव *' : 'Category Name *')),
            const SizedBox(height: 8),
            TextField(controller: unitCtrl, decoration: InputDecoration(labelText: lang == 'mr' ? 'एकक / युनिट (उदा. sq.ft, R.ft)' : 'Unit (e.g. sq.ft, R.ft)')),
            const SizedBox(height: 8),
            TextField(controller: rateCtrl, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: lang == 'mr' ? 'डीफॉल्ट दर (₹)' : 'Default Rate (₹)')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: Text(AppLocale.get('cancel', lang))),
          ElevatedButton(
            onPressed: () {
              if (nameCtrl.text.isNotEmpty) {
                final cat = provider.addWorkCategory(
                  name: nameCtrl.text,
                  unit: unitCtrl.text.isNotEmpty ? unitCtrl.text : 'काम',
                  defaultRate: double.tryParse(rateCtrl.text) ?? 0.0,
                );
                setState(() {
                  _workCategoryId = cat.id;
                  _workRateController.text = cat.defaultRate.toString();
                });
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang == 'mr' ? 'नवीन काम प्रकार जोडला गेला!' : 'Work category added!')));
              }
            },
            child: Text(AppLocale.get('saveWork', lang)),
          ),
        ],
      ),
    );
  }

  // Dialog: Add Worker
  void _showAddWorkerDialog(AppProvider provider) {
    final lang = provider.language;
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final rateCtrl = TextEditingController(text: '600');
    final balanceCtrl = TextEditingController(text: '0');
    final skillCtrl = TextEditingController(text: lang == 'mr' ? 'धुमुस ऑपरेटर' : 'Machine Operator');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(AppLocale.get('addWorker', lang), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: InputDecoration(labelText: lang == 'mr' ? 'कामगाराचे पूर्ण नाव' : 'Worker Full Name')),
              const SizedBox(height: 8),
              TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: InputDecoration(labelText: lang == 'mr' ? 'मोबाईल नंबर' : 'Phone Number')),
              const SizedBox(height: 8),
              TextField(controller: rateCtrl, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: lang == 'mr' ? 'रोजंदारी दर (₹)' : 'Daily Rate (₹)')),
              const SizedBox(height: 8),
              TextField(controller: balanceCtrl, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: lang == 'mr' ? 'मागील शिल्लक बाकी (₹)' : 'Opening Balance (₹)')),
              const SizedBox(height: 8),
              TextField(controller: skillCtrl, decoration: InputDecoration(labelText: lang == 'mr' ? 'कौशल्य / काम प्रकार' : 'Skill / Role')),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: Text(AppLocale.get('cancel', lang))),
          ElevatedButton(
            onPressed: () {
              if (nameCtrl.text.isNotEmpty && phoneCtrl.text.isNotEmpty) {
                provider.addWorker(
                  fullName: nameCtrl.text,
                  phone: phoneCtrl.text,
                  dailyRate: double.tryParse(rateCtrl.text) ?? 600.0,
                  openingBalance: double.tryParse(balanceCtrl.text) ?? 0.0,
                  skill: skillCtrl.text,
                );
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(lang == 'mr' ? 'नवीन कामगार जोडला गेला!' : 'New worker registered!')));
              }
            },
            child: Text(lang == 'mr' ? 'नोंदवा' : 'Register'),
          ),
        ],
      ),
    );
  }

  Widget _metricTile(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: AppTheme.tactileButtonDecoration(
        bgColor: Colors.white,
        borderColor: AppTheme.borderLight,
        radius: 16,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: color),
          ),
          const SizedBox(height: 6),
          Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppTheme.textMuted)),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color)),
        ],
      ),
    );
  }
}
