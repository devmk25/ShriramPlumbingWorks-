import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        return web;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDNEUSHQ8wqNn2KfRF7S0OAchXwq2V-G1g',
    appId: '1:297426173791:web:fa06dc8d208969ed1e00ea',
    messagingSenderId: '297426173791',
    projectId: 'shriram-plumbing',
    authDomain: 'shriram-plumbing.firebaseapp.com',
    storageBucket: 'shriram-plumbing.firebasestorage.app',
    measurementId: 'G-TMBY7JJFVN',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyC60VuNvt7V0josVM1Gn1AvefmQM_Fh-LM',
    appId: '1:297426173791:android:77b41135b21b2f5c1e00ea',
    messagingSenderId: '297426173791',
    projectId: 'shriram-plumbing',
    storageBucket: 'shriram-plumbing.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyC60VuNvt7V0josVM1Gn1AvefmQM_Fh-LM',
    appId: '1:297426173791:ios:77b41135b21b2f5c1e00ea',
    messagingSenderId: '297426173791',
    projectId: 'shriram-plumbing',
    storageBucket: 'shriram-plumbing.firebasestorage.app',
    iosBundleId: 'com.mas.shriramplumbing',
  );
}
