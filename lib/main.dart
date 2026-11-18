import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Color(0xFF061815),
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF061815),
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
        scaffoldBackgroundColor: const Color(0xFF061815),
        primaryColor: const Color(0xFFF5D061),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFF5D061),
          surface: const Color(0xFF061815),
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
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF061815))
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
      )
      ..loadRequest(Uri.parse('https://ahmedseleem06-creator.github.io/abwab-algnan/'));
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (await _controller.canGoBack()) {
          await _controller.goBack();
        } else {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF061815),
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_isLoading)
                Container(
                  color: const Color(0xFF061815),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainContentAxisAlignment.center,
                      children: [
                        Image.asset(
                          'assets/icons/icon-192.png',
                          width: 100,
                          height: 100,
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
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'رفيق الاستعداد لرمضان المبارك',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 30),
                        SizedBox(
                          width: 150,
                          child: LinearProgressIndicator(
                            value: _progress > 0 ? _progress : null,
                            color: const Color(0xFFF5D061),
                            backgroundColor: const Color(0xFF13342E),
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
