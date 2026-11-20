import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Color(0xFF041411),
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF041411),
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  runApp(const AbwabAlJinanApp());
}

class AbwabAlJinanApp extends StatelessWidget {
  const AbwabAlJinanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'أبواب الجنان',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFF041411),
        primaryColor: const Color(0xFFF5D061),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFF5D061),
          surface: const Color(0xFF041411),
        ),
        useMaterial3: true,
      ),
      builder: (context, child) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: child!,
        );
      },
      home: const RamadanWebViewScreen(),
    );
  }
}

class RamadanWebViewScreen extends StatefulWidget {
  const RamadanWebViewScreen({super.key});

  @override
  State<RamadanWebViewScreen> createState() => _RamadanWebViewScreenState();
}

class _RamadanWebViewScreenState extends State<RamadanWebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  double _progress = 0;

  @override
  void initState() {
    super.initState();

    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is AndroidWebViewPlatform) {
      params = AndroidWebViewControllerCreationParams();
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    final WebViewController controller =
        WebViewController.fromPlatformCreationParams(params);

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF041411))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (mounted) {
              setState(() {
                _progress = progress / 100.0;
              });
            }
          },
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = true;
              });
            }
          },
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('WebResourceError: ${error.description}');
          },
        ),
      );

    // Auto-grant Geolocation in Android WebView so HTML5 navigator.geolocation works natively without browser dialogs
    if (controller.platform is AndroidWebViewController) {
      final androidController = controller.platform as AndroidWebViewController;
      androidController.setGeolocationPermissionsPromptCallbacks(
        onShowPrompt: (request) async => const GeolocationPermissionsResponse(
          allow: true,
          retain: true,
        ),
      );
    }

    controller.loadRequest(Uri.parse('https://ahmedseleem06-creator.github.io/abwab-algnan/'));
    _controller = controller;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, dynamic result) {
        if (didPop) return;
        _controller.canGoBack().then((canGoBack) {
          if (canGoBack) {
            _controller.goBack();
          } else {
            SystemNavigator.pop();
          }
        });
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF041411),
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_isLoading)
                Container(
                  color: const Color(0xFF041411),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Image.asset(
                          'assets/icons/icon-192.png',
                          width: 110,
                          height: 110,
                          errorBuilder: (context, error, stackTrace) => const Icon(
                            Icons.nightlight_round,
                            size: 80,
                            color: Color(0xFFF5D061),
                          ),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'أبواب الجنان',
                          style: TextStyle(
                            color: Color(0xFFF5D061),
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'رفيق الاستعداد لرمضان المبارك 🌙',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 32),
                        SizedBox(
                          width: 160,
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: LinearProgressIndicator(
                              value: _progress > 0 ? _progress : null,
                              color: const Color(0xFFF5D061),
                              backgroundColor: const Color(0xFF0c3b31),
                              minHeight: 5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
