// Application State & Persistence for Abwab Al-Jinan (أبواب الجنان) App
const STORAGE_KEY = 'ABWAB_ALJINAN_STATE_V1';

const defaultState = {
  userName: 'أحمد',
  ramadanDate: '2025-03-01T00:00:00', // Configurable target
  habits: {
    quran: true,
    prayers: true,
    athkar: true,
    qiyam: false,
    charity: false,
    water: false
  },
  missedFasts: 2,
  khatmahGoal: 1, // 1, 2 or 3
  caffeineCups: 1,
  caffeineInitial: 4,
  preRamadanChallenge: {
    title: 'تحدي صيام 30 يوماً قبل رمضان',
    targetDays: 30,
    fastedDays: [1, 2, 3, 4, 5, 6, 7], // 7 sample initial days
    streak: 7
  },
  quran: {
    pagesReadToday: 8,
    targetPagesToday: 20,
    currentSurah: 1,
    bookmark: { surah: 1, surahName: 'الفاتحة', ayah: 1 },
    fontSize: 22
  },
  prepTasks: [
    { id: '1', text: 'تجهيز ركن الصلاة وسجادات جديدة والمصاحف', category: 'prayer', done: true },
    { id: '2', text: 'شراء التمور وقمر الدين وياميش رمضان', category: 'groceries', done: true },
    { id: '3', text: 'تفريز اللحوم والدواجن والخضار للأسبوع الأول', category: 'groceries', done: false },
    { id: '4', text: 'تعليق زينة رمضان وفوانيس الأطفال بالبيت', category: 'decor', done: false },
    { id: '5', text: 'تجهيز كراتين وشنط الصدقات لتوزيعها قبل الشهر', category: 'charity', done: false },
    { id: '6', text: 'صلة الرحم والاتصال بالأقارب للتهنئة وتصفية القلوب', category: 'spiritual', done: false }
  ],
  customDuas: [
    { id: 'd1', text: 'اللهم سلّمنا لرمضان وسلّم رمضان لنا وتسلّمه منا متقبلاً.' },
    { id: 'd2', text: 'اللهم أعنا فيه على الصيام والقيام وغض البصر وحفظ اللسان.' },
    { id: 'd3', text: 'اللهم ارزق والديّ الصحة والعافية واجعلنا من عتقائك من النار.' }
  ],
  tasbeeh: {
    count: 33,
    dhikrIndex: 0
  }
};

const athkarList = [
  { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", target: 33, merit: "حُطّت خطاياه وإن كانت مثل زبد البحر" },
  { text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", target: 33, merit: "أفضل الدعاء وأثقل ما في الميزان" },
  { text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", target: 100, merit: "أفضل ما قاله النبيون" },
  { text: "اللَّهُ أَكْبَرُ كَبِيرًا", target: 33, merit: "عظيمة الثواب والأجر" },
  { text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ", target: 100, merit: "ممحاة للذنوب ومجلبة للرزق والبركة" },
  { text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", target: 10, merit: "من صلى عليّ صلاة صلى الله عليه بها عشراً" }
];

// All 114 Surahs Metadata
const surahsMetadata = [
  { id: 1, name: "الفاتحة", type: "مكية", ayahs: 7, juz: 1, pages: 1 },
  { id: 2, name: "البقرة", type: "مدنية", ayahs: 286, juz: 1, pages: 48 },
  { id: 3, name: "آل عمران", type: "مدنية", ayahs: 200, juz: 3, pages: 27 },
  { id: 4, name: "النساء", type: "مدنية", ayahs: 176, juz: 4, pages: 29 },
  { id: 5, name: "المائدة", type: "مدنية", ayahs: 120, juz: 6, pages: 22 },
  { id: 6, name: "الأنعام", type: "مكية", ayahs: 165, juz: 7, pages: 23 },
  { id: 7, name: "الأعراف", type: "مكية", ayahs: 206, juz: 8, pages: 26 },
  { id: 8, name: "الأنفال", type: "مدنية", ayahs: 75, juz: 9, pages: 10 },
  { id: 9, name: "التوبة", type: "مدنية", ayahs: 129, juz: 10, pages: 16 },
  { id: 10, name: "يونس", type: "مكية", ayahs: 109, juz: 11, pages: 13 },
  { id: 11, name: "هود", type: "مكية", ayahs: 123, juz: 11, pages: 14 },
  { id: 12, name: "يوسف", type: "مكية", ayahs: 111, juz: 12, pages: 14 },
  { id: 13, name: "الرعد", type: "مدنية", ayahs: 43, juz: 13, pages: 6 },
  { id: 14, name: "إبراهيم", type: "مكية", ayahs: 52, juz: 13, pages: 7 },
  { id: 15, name: "الحجر", type: "مكية", ayahs: 99, juz: 14, pages: 5 },
  { id: 16, name: "النحل", type: "مكية", ayahs: 128, juz: 14, pages: 14 },
  { id: 17, name: "الإسراء", type: "مكية", ayahs: 111, juz: 15, pages: 11 },
  { id: 18, name: "الكهف", type: "مكية", ayahs: 110, juz: 15, pages: 12 },
  { id: 19, name: "مريم", type: "مكية", ayahs: 98, juz: 16, pages: 7 },
  { id: 20, name: "طه", type: "مكية", ayahs: 135, juz: 16, pages: 10 },
  { id: 21, name: "الأنبياء", type: "مكية", ayahs: 112, juz: 17, pages: 10 },
  { id: 22, name: "الحج", type: "مدنية", ayahs: 78, juz: 17, pages: 10 },
  { id: 23, name: "المؤمنون", type: "مكية", ayahs: 118, juz: 18, pages: 8 },
  { id: 24, name: "النور", type: "مدنية", ayahs: 64, juz: 18, pages: 10 },
  { id: 25, name: "الفرقان", type: "مكية", ayahs: 77, juz: 18, pages: 7 },
  { id: 26, name: "الشعراء", type: "مكية", ayahs: 227, juz: 19, pages: 10 },
  { id: 27, name: "النمل", type: "مكية", ayahs: 93, juz: 19, pages: 9 },
  { id: 28, name: "القصص", type: "مكية", ayahs: 88, juz: 20, pages: 11 },
  { id: 29, name: "العنكبوت", type: "مكية", ayahs: 69, juz: 20, pages: 8 },
  { id: 30, name: "الروم", type: "مكية", ayahs: 60, juz: 21, pages: 7 },
  { id: 31, name: "لقمان", type: "مكية", ayahs: 34, juz: 21, pages: 4 },
  { id: 32, name: "السجدة", type: "مكية", ayahs: 30, juz: 21, pages: 3 },
  { id: 33, name: "الأحزاب", type: "مدنية", ayahs: 73, juz: 21, pages: 10 },
  { id: 34, name: "سبأ", type: "مكية", ayahs: 54, juz: 22, pages: 6 },
  { id: 35, name: "فاطر", type: "مكية", ayahs: 45, juz: 22, pages: 6 },
  { id: 36, name: "يس", type: "مكية", ayahs: 83, juz: 22, pages: 6 },
  { id: 37, name: "الصافات", type: "مكية", ayahs: 182, juz: 23, pages: 7 },
  { id: 38, name: "ص", type: "مكية", ayahs: 88, juz: 23, pages: 5 },
  { id: 39, name: "الزمر", type: "مكية", ayahs: 75, juz: 23, pages: 9 },
  { id: 40, name: "غافر", type: "مكية", ayahs: 85, juz: 24, pages: 9 },
  { id: 41, name: "فصلت", type: "مكية", ayahs: 54, juz: 24, pages: 6 },
  { id: 42, name: "الشورى", type: "مكية", ayahs: 53, juz: 25, pages: 6 },
  { id: 43, name: "الزخرف", type: "مكية", ayahs: 89, juz: 25, pages: 7 },
  { id: 44, name: "الدخان", type: "مكية", ayahs: 59, juz: 25, pages: 3 },
  { id: 45, name: "الجاثية", type: "مكية", ayahs: 37, juz: 25, pages: 4 },
  { id: 46, name: "الأحقاف", type: "مكية", ayahs: 35, juz: 26, pages: 5 },
  { id: 47, name: "محمد", type: "مدنية", ayahs: 38, juz: 26, pages: 4 },
  { id: 48, name: "الفتح", type: "مدنية", ayahs: 29, juz: 26, pages: 5 },
  { id: 49, name: "الحجرات", type: "مدنية", ayahs: 18, juz: 26, pages: 3 },
  { id: 50, name: "ق", type: "مكية", ayahs: 45, juz: 26, pages: 3 },
  { id: 51, name: "الذاريات", type: "مكية", ayahs: 60, juz: 26, pages: 3 },
  { id: 52, name: "الطور", type: "مكية", ayahs: 49, juz: 27, pages: 3 },
  { id: 53, name: "النجم", type: "مكية", ayahs: 62, juz: 27, pages: 3 },
  { id: 54, name: "القمر", type: "مكية", ayahs: 55, juz: 27, pages: 3 },
  { id: 55, name: "الرحمن", type: "مدنية", ayahs: 78, juz: 27, pages: 4 },
  { id: 56, name: "الواقعة", type: "مكية", ayahs: 96, juz: 27, pages: 4 },
  { id: 57, name: "الحديد", type: "مدنية", ayahs: 29, juz: 27, pages: 5 },
  { id: 58, name: "المجادلة", type: "مدنية", ayahs: 22, juz: 28, pages: 4 },
  { id: 59, name: "الحشر", type: "مدنية", ayahs: 24, juz: 28, pages: 3 },
  { id: 60, name: "الممتحنة", type: "مدنية", ayahs: 13, juz: 28, pages: 3 },
  { id: 61, name: "الصف", type: "مدنية", ayahs: 14, juz: 28, pages: 2 },
  { id: 62, name: "الجمعة", type: "مدنية", ayahs: 11, juz: 28, pages: 2 },
  { id: 63, name: "المنافقون", type: "مدنية", ayahs: 11, juz: 28, pages: 2 },
  { id: 64, name: "التغابن", type: "مدنية", ayahs: 18, juz: 28, pages: 2 },
  { id: 65, name: "الطلاق", type: "مدنية", ayahs: 12, juz: 28, pages: 2 },
  { id: 66, name: "التحريم", type: "مدنية", ayahs: 12, juz: 28, pages: 2 },
  { id: 67, name: "الملك", type: "مكية", ayahs: 30, juz: 29, pages: 3 },
  { id: 68, name: "القلم", type: "مكية", ayahs: 52, juz: 29, pages: 3 },
  { id: 69, name: "الحاقة", type: "مكية", ayahs: 52, juz: 29, pages: 3 },
  { id: 70, name: "المعارج", type: "مكية", ayahs: 44, juz: 29, pages: 2 },
  { id: 71, name: "نوح", type: "مكية", ayahs: 28, juz: 29, pages: 2 },
  { id: 72, name: "الجن", type: "مكية", ayahs: 28, juz: 29, pages: 2 },
  { id: 73, name: "المزمل", type: "مكية", ayahs: 20, juz: 29, pages: 2 },
  { id: 74, name: "المدثر", type: "مكية", ayahs: 56, juz: 29, pages: 2 },
  { id: 75, name: "القيامة", type: "مكية", ayahs: 40, juz: 29, pages: 2 },
  { id: 76, name: "الإنسان", type: "مدنية", ayahs: 31, juz: 29, pages: 2 },
  { id: 77, name: "المرسلات", type: "مكية", ayahs: 50, juz: 29, pages: 2 },
  { id: 78, name: "النبأ", type: "مكية", ayahs: 40, juz: 30, pages: 2 },
  { id: 79, name: "النازعات", type: "مكية", ayahs: 46, juz: 30, pages: 2 },
  { id: 80, name: "عبس", type: "مكية", ayahs: 42, juz: 30, pages: 1 },
  { id: 81, name: "التكوير", type: "مكية", ayahs: 29, juz: 30, pages: 1 },
  { id: 82, name: "الانفطار", type: "مكية", ayahs: 19, juz: 30, pages: 1 },
  { id: 83, name: "المطففين", type: "مكية", ayahs: 36, juz: 30, pages: 1 },
  { id: 84, name: "الانشقاق", type: "مكية", ayahs: 25, juz: 30, pages: 1 },
  { id: 85, name: "البروج", type: "مكية", ayahs: 22, juz: 30, pages: 1 },
  { id: 86, name: "الطارق", type: "مكية", ayahs: 17, juz: 30, pages: 1 },
  { id: 87, name: "الأعلى", type: "مكية", ayahs: 19, juz: 30, pages: 1 },
  { id: 88, name: "الغاشية", type: "مكية", ayahs: 26, juz: 30, pages: 1 },
  { id: 89, name: "الفجر", type: "مكية", ayahs: 30, juz: 30, pages: 1 },
  { id: 90, name: "البلد", type: "مكية", ayahs: 20, juz: 30, pages: 1 },
  { id: 91, name: "الشمس", type: "مكية", ayahs: 15, juz: 30, pages: 1 },
  { id: 92, name: "الليل", type: "مكية", ayahs: 21, juz: 30, pages: 1 },
  { id: 93, name: "الضحى", type: "مكية", ayahs: 11, juz: 30, pages: 1 },
  { id: 94, name: "الشرح", type: "مكية", ayahs: 8, juz: 30, pages: 1 },
  { id: 95, name: "التين", type: "مكية", ayahs: 8, juz: 30, pages: 1 },
  { id: 96, name: "العلق", type: "مكية", ayahs: 19, juz: 30, pages: 1 },
  { id: 97, name: "القدر", type: "مكية", ayahs: 5, juz: 30, pages: 1 },
  { id: 98, name: "البينة", type: "مدنية", ayahs: 8, juz: 30, pages: 1 },
  { id: 99, name: "الزلزلة", type: "مدنية", ayahs: 8, juz: 30, pages: 1 },
  { id: 100, name: "العاديات", type: "مكية", ayahs: 11, juz: 30, pages: 1 },
  { id: 101, name: "القارعة", type: "مكية", ayahs: 11, juz: 30, pages: 1 },
  { id: 102, name: "التكاثر", type: "مكية", ayahs: 8, juz: 30, pages: 1 },
  { id: 103, name: "العصر", type: "مكية", ayahs: 3, juz: 30, pages: 1 },
  { id: 104, name: "الهمزة", type: "مكية", ayahs: 9, juz: 30, pages: 1 },
  { id: 105, name: "الفيل", type: "مكية", ayahs: 5, juz: 30, pages: 1 },
  { id: 106, name: "قريش", type: "مكية", ayahs: 4, juz: 30, pages: 1 },
  { id: 107, name: "الماعون", type: "مكية", ayahs: 7, juz: 30, pages: 1 },
  { id: 108, name: "الكوثر", type: "مكية", ayahs: 3, juz: 30, pages: 1 },
  { id: 109, name: "الكافرون", type: "مكية", ayahs: 6, juz: 30, pages: 1 },
  { id: 110, name: "النصر", type: "مدنية", ayahs: 3, juz: 30, pages: 1 },
  { id: 111, name: "المسد", type: "مكية", ayahs: 5, juz: 30, pages: 1 },
  { id: 112, name: "الإخلاص", type: "مكية", ayahs: 4, juz: 30, pages: 1 },
  { id: 113, name: "الفلق", type: "مكية", ayahs: 5, juz: 30, pages: 1 },
  { id: 114, name: "الناس", type: "مكية", ayahs: 6, juz: 30, pages: 1 }
];

// Offline Quran Cache for Essential Surahs
const offlineSurahs = {
  1: {
    name: "الفاتحة",
    bismillah: true,
    ayahs: [
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      "الرَّحْمَٰنِ الرَّحِيمِ",
      "مَالِكِ يَوْمِ الدِّينِ",
      "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ"
    ]
  },
  67: {
    name: "الملك",
    bismillah: true,
    ayahs: [
      "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
      "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ",
      "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ",
      "ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ",
      "وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ",
      "وَلِلَّذِينَ كَفَرُوا بِرَبِّهِمْ عَذَابُ جَهَنَّمَ ۖ وَبِئْسَ الْمَصِيرُ",
      "إِذَا أُلْقُوا فِيهَا سَمِعُوا لَهَا شَهِيقًا وَهِيَ تَفُورُ",
      "تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ ۖ كُلَّمَا أُلْقِيَ فِيهَا فَوْجٌ سَأَلَهُمْ خَزَنَتُهَا أَلَمْ يَأْتِكُمْ نَذِيرٌ",
      "قَالُوا بَلَىٰ قَدْ جَاءَنَا نَذِيرٌ فَكَذَّبْنَا وَقُلْنَا مَا نَزَّلَ اللَّهُ مِن شَيْءٍ إِنْ أَنتُمْ إِلَّا فِي ضَلَالٍ كَبِيرٍ",
      "وَقَالُوا لَوْ كُنَّا نَسْمَعُ أَوْ نَعْقِلُ مَا كُنَّا فِي أَصْحَابِ السَّعِيرِ",
      "فَاعْتَرَفُوا بِذَنبِهِمْ فَسُحْقًا لِّأَصْحَابِ السَّعِيرِ",
      "إِنَّ الَّذِينَ يَخْشَوْنَ رَبَّهُم بِالْغَيْبِ لَهُم مَّغْفِرَةٌ وَأَجْرٌ كَبِيرٌ",
      "وَأَسِرُّوا قَوْلَكُمْ أَوِ اجْهَرُوا بِهِ ۖ إِنَّهُ عَلِيمٌ بِذَاتِ الصُّدُورِ",
      "أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ",
      "هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ ۖ وَإِلَيْهِ النُّشُورُ"
    ]
  },
  97: {
    name: "القدر",
    bismillah: true,
    ayahs: [
      "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ",
      "وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ",
      "لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ",
      "تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ",
      "سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ"
    ]
  },
  112: {
    name: "الإخلاص",
    bismillah: true,
    ayahs: [
      "قُلْ هُوَ اللَّهُ أَحَدٌ",
      "اللَّهُ الصَّمَدُ",
      "لَمْ يَلِدْ وَلَمْ يُولَدْ",
      "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ"
    ]
  },
  113: {
    name: "الفلق",
    bismillah: true,
    ayahs: [
      "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
      "مِن شَرِّ مَا خَلَقَ",
      "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
      "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
      "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ"
    ]
  },
  114: {
    name: "الناس",
    bismillah: true,
    ayahs: [
      "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
      "مَلِكِ النَّاسِ",
      "إِلَٰهِ النَّاسِ",
      "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
      "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
      "مِنَ الْجِنَّةِ وَالنَّاسِ"
    ]
  }
};

let appState = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultState,
        ...parsed,
        preRamadanChallenge: { ...defaultState.preRamadanChallenge, ...(parsed.preRamadanChallenge || {}) },
        quran: { ...defaultState.quran, ...(parsed.quran || {}) },
        habits: { ...defaultState.habits, ...(parsed.habits || {}) }
      };
    }
  } catch (e) {
    console.error('Error loading state', e);
  }
  return JSON.parse(JSON.stringify(defaultState));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.error('Error saving state', e);
  }
}

// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('text-amber-400');
    btn.classList.add('text-cyan-400/60');
  });
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeNav) {
    activeNav.classList.remove('text-cyan-400/60');
    activeNav.classList.add('text-amber-400');
  }

  if (tabId === 'quran') {
    renderQuranWird();
  } else if (tabId === 'tracker') {
    renderChallenge();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Countdown Calculation
function updateCountdown() {
  const now = new Date().getTime();
  let target = new Date(appState.ramadanDate).getTime();
  if (isNaN(target) || target <= now) {
    target = now + (27 * 86400000 + 14 * 3600000 + 35 * 60000 + 48 * 1000);
  }

  const diff = target - now;

  if (diff <= 0) {
    const dEl = document.getElementById('cd-days');
    if (dEl) dEl.innerText = '00';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const dEl = document.getElementById('cd-days');
  const hEl = document.getElementById('cd-hours');
  const mEl = document.getElementById('cd-mins');
  const sEl = document.getElementById('cd-secs');
  const bannerDays = document.getElementById('banner-days-left');

  if (dEl) dEl.innerText = days < 10 ? '0' + days : days;
  if (bannerDays) bannerDays.innerText = days;
  if (hEl) hEl.innerText = hours < 10 ? '0' + hours : hours;
  if (mEl) mEl.innerText = minutes < 10 ? '0' + minutes : minutes;
  if (sEl) sEl.innerText = seconds < 10 ? '0' + seconds : seconds;
}

// Quick Habit Toggle from Dashboard Rings
function toggleHabitQuick(habitKey) {
  toggleHabit(habitKey);
  const status = appState.habits[habitKey] ? 'تم تسجيل إنجاز' : 'تم إلغاء';
  const name = habitKey === 'quran' ? 'ورد القرآن' : (habitKey === 'athkar' ? 'الأذكار' : 'الصلوات');
  showToast(`${status} ${name} لليوم ✨`);
}

// Habit Tracking
function toggleHabit(habitKey) {
  if (appState.habits.hasOwnProperty(habitKey)) {
    appState.habits[habitKey] = !appState.habits[habitKey];
    saveState();
    renderHabits();
    if (navigator.vibrate) navigator.vibrate(25);
  }
}

function renderHabits() {
  const container = document.getElementById('habits-list');
  if (!container) return;

  const habitLabels = {
    quran: { title: 'قراءة الورد القرآني', desc: `أتممت ${appState.quran.pagesReadToday} من ${appState.quran.targetPagesToday} صفحة` },
    prayers: { title: 'الصلوات الخمس والسنن الرواتب', desc: '12 ركعة سنة لبناء بيت في الجنة' },
    athkar: { title: 'أذكار الصباح والمساء', desc: 'حصن المسلم اليومي' },
    qiyam: { title: 'ركعتين قيام ليل (تدريب)', desc: 'تسخين لصلاة التراويح' },
    water: { title: 'شرب 2.5 لتر ماء موزع', desc: 'ترطيب وتجهيز الكلى للصيام' },
    charity: { title: 'صدقة اليوم (ولو بكلمة طيبة)', desc: 'تعويد النفس على البذل' }
  };

  let total = Object.keys(habitLabels).length;
  let done = 0;

  let html = '';
  for (const [key, info] of Object.entries(habitLabels)) {
    const isDone = !!appState.habits[key];
    if (isDone) done++;
    html += `
      <div onclick="toggleHabit('${key}')" class="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/50 border ${isDone ? 'border-amber-400/40 bg-emerald-900/30' : 'border-emerald-800/40'} cursor-pointer transition-all duration-200">
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center ${isDone ? 'bg-amber-400 text-emerald-950' : 'border border-emerald-600 bg-transparent'} transition">
            ${isDone ? '✓' : ''}
          </div>
          <div>
            <h5 class="text-xs font-bold ${isDone ? 'text-amber-200 line-through opacity-80' : 'text-slate-100'}">${info.title}</h5>
            <p class="text-[10px] text-emerald-300/70">${info.desc}</p>
          </div>
        </div>
        <span class="text-[10px] text-emerald-400">${isDone ? 'منجز' : 'متبقي'}</span>
      </div>
    `;
  }
  container.innerHTML = html;

  const percent = Math.round((done / total) * 100);
  const pText = document.getElementById('progress-text');
  const pCircle = document.getElementById('progress-circle');
  if (pText) pText.innerText = `${percent}%`;
  if (pCircle) pCircle.setAttribute('stroke-dasharray', `${percent}, 100`);

  // Update Dashboard Concentric Double Rings (Yellow outer arc + Cyan inner arc + Cyan checkmark)
  const arcConfigs = {
    quran: { outer: 68, inner: 55 },
    athkar: { outer: 50, inner: 55 },
    prayers: { outer: 60, inner: 55 }
  };

  ['quran', 'athkar', 'prayers'].forEach(hKey => {
    const isCompleted = !!appState.habits[hKey];
    const outerRing = document.getElementById(`ring-outer-${hKey}`);
    const innerRing = document.getElementById(`ring-inner-${hKey}`);
    const checkEl = document.getElementById(`check-${hKey}`);
    const legacyRing = document.getElementById(`ring-${hKey}`);

    if (outerRing) {
      const cfg = arcConfigs[hKey] || { outer: 65, inner: 55 };
      outerRing.setAttribute('stroke-dasharray', isCompleted ? `${cfg.outer}, 120` : '0, 120');
    }
    if (innerRing) {
      const cfg = arcConfigs[hKey] || { outer: 65, inner: 55 };
      innerRing.setAttribute('stroke-dasharray', isCompleted ? `${cfg.inner}, 90` : '0, 90');
    }
    if (legacyRing) {
      legacyRing.setAttribute('stroke-dasharray', isCompleted ? '100, 100' : '0, 100');
    }
    if (checkEl) {
      if (isCompleted) {
        checkEl.innerHTML = `
          <svg class="w-4 h-4 text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.85)]" fill="none" stroke="currentColor" stroke-width="3.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        `;
      } else {
        checkEl.innerHTML = `<span class="text-xs text-slate-500 font-bold">○</span>`;
      }
    }
  });
}

// ===============================================================
// PRE-RAMADAN FASTING GOAL & STREAK (تحدي صيام ما قبل رمضان)
// ===============================================================

function calculateStreak(fastedDays) {
  if (!fastedDays || fastedDays.length === 0) return 0;
  const sorted = [...new Set(fastedDays)].sort((a, b) => a - b);
  let currentStreak = 1;
  let maxStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 1;
    }
  }
  return maxStreak;
}

function renderChallenge() {
  const challenge = appState.preRamadanChallenge || defaultState.preRamadanChallenge;
  const target = challenge.targetDays || 30;
  const fasted = challenge.fastedDays || [];
  const count = fasted.length;
  const pct = Math.min(100, Math.round((count / target) * 100));
  const streak = calculateStreak(fasted);
  challenge.streak = streak;

  // 1. Home screen challenge widgets
  const homeTitle = document.getElementById('home-challenge-title');
  const homeCount = document.getElementById('home-challenge-count');
  const homePct = document.getElementById('home-challenge-pct');
  const homeBar = document.getElementById('home-challenge-bar');
  const homeStreak = document.getElementById('home-challenge-streak');

  if (homeTitle) homeTitle.innerText = challenge.title;
  if (homeCount) homeCount.innerText = `${count} من ${target} يوماً`;
  if (homePct) homePct.innerText = `${pct}%`;
  if (homeBar) homeBar.style.width = `${pct}%`;
  if (homeStreak) homeStreak.innerText = `🔥 ${streak} أيام متتالية`;

  // 2. Tracker screen detailed widgets
  const trackerTitle = document.getElementById('tracker-challenge-title');
  const trackerCount = document.getElementById('tracker-challenge-count');
  const trackerRemaining = document.getElementById('tracker-challenge-remaining');
  const trackerPct = document.getElementById('tracker-challenge-pct');
  const trackerBar = document.getElementById('tracker-challenge-bar');
  const trackerStreak = document.getElementById('tracker-challenge-streak');

  if (trackerTitle) trackerTitle.innerText = challenge.title;
  if (trackerCount) trackerCount.innerText = count;
  if (trackerRemaining) trackerRemaining.innerText = Math.max(0, target - count);
  if (trackerPct) trackerPct.innerText = `${pct}%`;
  if (trackerBar) trackerBar.style.width = `${pct}%`;
  if (trackerStreak) trackerStreak.innerText = streak;

  // Badges update
  const b1 = document.getElementById('badge-5-days');
  const b2 = document.getElementById('badge-15-days');
  const b3 = document.getElementById('badge-30-days');
  if (b1) {
    if (count >= 5) b1.className = "p-2 rounded-xl bg-amber-500/20 border border-amber-400 text-center";
    else b1.className = "p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-center opacity-50";
  }
  if (b2) {
    if (count >= 15) b2.className = "p-2 rounded-xl bg-amber-500/20 border border-amber-400 text-center";
    else b2.className = "p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-center opacity-50";
  }
  if (b3) {
    if (count >= target) b3.className = "p-2 rounded-xl bg-amber-500/20 border border-amber-400 text-center";
    else b3.className = "p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-center opacity-50";
  }

  // 3. Render 30-Day Grid
  const gridContainer = document.getElementById('challenge-days-grid');
  if (!gridContainer) return;

  let gridHtml = '';
  for (let day = 1; day <= target; day++) {
    const isFasted = fasted.includes(day);
    if (isFasted) {
      gridHtml += `
        <button onclick="toggleChallengeDay(${day})" class="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-emerald-950 font-black shadow-lg shadow-amber-500/20 active:scale-95 transition flex flex-col items-center justify-center border border-amber-300">
          <span class="text-xs">🌙</span>
          <span class="text-[10px] font-bold mt-0.5">يوم ${day}</span>
        </button>
      `;
    } else {
      gridHtml += `
        <button onclick="toggleChallengeDay(${day})" class="p-2.5 rounded-2xl bg-emerald-950/70 border border-emerald-800/60 text-slate-300 hover:border-amber-400/50 hover:bg-emerald-900/40 active:scale-95 transition flex flex-col items-center justify-center">
          <span class="text-[11px] text-emerald-600 font-bold">○</span>
          <span class="text-[10px] mt-0.5">يوم ${day}</span>
        </button>
      `;
    }
  }
  gridContainer.innerHTML = gridHtml;
}

function toggleChallengeDay(day) {
  const challenge = appState.preRamadanChallenge;
  const idx = challenge.fastedDays.indexOf(day);
  if (idx > -1) {
    challenge.fastedDays.splice(idx, 1);
    showToast(`تم إلغاء تحديد اليوم ${day}`);
  } else {
    challenge.fastedDays.push(day);
    challenge.fastedDays.sort((a, b) => a - b);
    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);

    if (challenge.fastedDays.length === challenge.targetDays) {
      showToast('🎉 ماشاء الله! أتممت تحدي الصيام كاملاً بنجاح، هنيئاً لك الاستعداد العظيم!');
    } else if (challenge.fastedDays.length % 5 === 0) {
      showToast(`✨ مبارك! أتممت ${challenge.fastedDays.length} يوماً من الصيام، استمر بالثبات!`);
    } else {
      showToast(`تقبل الله صيامك! تم تسجيل اليوم ${day} بنجاح 🌙`);
    }
  }
  saveState();
  renderChallenge();
}

function quickLogChallengeDay() {
  const challenge = appState.preRamadanChallenge;
  const target = challenge.targetDays || 30;
  for (let d = 1; d <= target; d++) {
    if (!challenge.fastedDays.includes(d)) {
      toggleChallengeDay(d);
      return;
    }
  }
  showToast('لقد أكملت جميع أيام التحدي بنجاح ما شاء الله 🌟');
}

function editChallengeGoal() {
  const challenge = appState.preRamadanChallenge;
  const newTitle = prompt('عنوان هدف التحدي:', challenge.title);
  if (newTitle && newTitle.trim()) {
    challenge.title = newTitle.trim();
  }

  const daysStr = prompt('كم عدد الأيام المستهدفة؟ (مثلاً: 30 أو 15 أو 10):', challenge.targetDays);
  const daysNum = parseInt(daysStr);
  if (!isNaN(daysNum) && daysNum > 0 && daysNum <= 60) {
    challenge.targetDays = daysNum;
  }

  saveState();
  renderChallenge();
  showToast('تم حفظ إعدادات هدف التحدي 🎯');
}

function resetChallengeDays() {
  if (confirm('هل ترغب في إعادة ضبط عداد أيام التحدي والبدء من جديد؟')) {
    appState.preRamadanChallenge.fastedDays = [];
    appState.preRamadanChallenge.streak = 0;
    saveState();
    renderChallenge();
    showToast('تمت إعادة ضبط التحدي بنجاح');
  }
}

// ===============================================================
// QURAN & DAILY WIRD (المصحف الشريف وحساب الورد اليومي)
// ===============================================================

function renderQuranWird() {
  const goalPages = (appState.khatmahGoal || 1) * 20;
  appState.quran.targetPagesToday = goalPages;
  const read = appState.quran.pagesReadToday || 0;
  const pct = Math.min(100, Math.round((read / goalPages) * 100));

  const elPagesCount = document.getElementById('wird-pages-count');
  const elPagesTarget = document.getElementById('wird-pages-target');
  const elProgress = document.getElementById('wird-progress-bar');
  const elPct = document.getElementById('wird-percent-text');
  const elBookmarkText = document.getElementById('quran-bookmark-info');
  const homeWirdEl = document.getElementById('home-wird-pages');

  if (elPagesCount) elPagesCount.innerText = read;
  if (elPagesTarget) elPagesTarget.innerText = goalPages;
  if (elProgress) elProgress.style.width = `${pct}%`;
  if (elPct) elPct.innerText = `${pct}%`;
  if (homeWirdEl) homeWirdEl.innerText = read;

  if (elBookmarkText && appState.quran.bookmark) {
    elBookmarkText.innerText = `سورة ${appState.quran.bookmark.surahName} (الآية ${appState.quran.bookmark.ayah})`;
  }

  if (read >= goalPages && !appState.habits.quran) {
    appState.habits.quran = true;
    saveState();
    renderHabits();
    showToast('مبارك! أتممت قراءة وردك القرآني لليوم 📖✨');
  }
}

function logWirdPages(count) {
  appState.quran.pagesReadToday = Math.max(0, (appState.quran.pagesReadToday || 0) + count);
  saveState();
  renderQuranWird();
  renderHabits();
  if (count > 0) {
    showToast(`تمت إضافة ${count} صفحة لوردك اليومي 👍`);
  }
}

function resetWirdToday() {
  if (confirm('هل تريد تصفير عداد صفحات ورد اليوم؟')) {
    appState.quran.pagesReadToday = 0;
    appState.habits.quran = false;
    saveState();
    renderQuranWird();
    renderHabits();
    showToast('تم تصفير ورد اليوم');
  }
}

function renderSurahIndex(filterText = '') {
  const container = document.getElementById('surah-index-list');
  if (!container) return;

  const filtered = surahsMetadata.filter(s => 
    s.name.includes(filterText) || s.id.toString() === filterText || s.type.includes(filterText)
  );

  let html = '';
  filtered.forEach(s => {
    const isCurrent = appState.quran.currentSurah === s.id;
    html += `
      <div onclick="openSurah(${s.id})" class="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/60 border ${isCurrent ? 'border-amber-400 bg-emerald-900/40' : 'border-emerald-800/40'} cursor-pointer transition">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs font-mono">
            ${s.id}
          </div>
          <div>
            <h4 class="text-xs font-bold text-slate-100 flex items-center gap-2">
              سورة ${s.name}
              ${isCurrent ? '<span class="text-[9px] bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded">المعروضة</span>' : ''}
            </h4>
            <span class="text-[10px] text-emerald-300/70">${s.type} • ${s.ayahs} آية • الجزء ${s.juz}</span>
          </div>
        </div>
        <div class="text-left">
          <span class="text-xs text-amber-300 font-semibold font-mono">~${s.pages} ص</span>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function searchSurahs(input) {
  renderSurahIndex(input.value.trim());
}

async function openSurah(surahId) {
  appState.quran.currentSurah = surahId;
  saveState();
  switchQuranSubTab('reader');

  const meta = surahsMetadata.find(s => s.id === surahId) || { name: 'السورة', ayahs: 0, type: 'مكية' };
  
  const titleEl = document.getElementById('reader-surah-title');
  const infoEl = document.getElementById('reader-surah-info');
  const contentEl = document.getElementById('reader-verses-container');

  if (titleEl) titleEl.innerText = `سورة ${meta.name}`;
  if (infoEl) infoEl.innerText = `${meta.type} • ${meta.ayahs} آية • الجزء ${meta.juz}`;
  if (contentEl) {
    contentEl.innerHTML = `
      <div class="text-center py-8 text-emerald-300">
        <div class="inline-block animate-spin text-2xl mb-2">⏳</div>
        <p class="text-xs">جاري فتح المصحف الشريف...</p>
      </div>
    `;
  }

  if (offlineSurahs[surahId]) {
    displaySurahVerses(surahId, offlineSurahs[surahId].ayahs, offlineSurahs[surahId].bismillah);
    return;
  }

  const cached = localStorage.getItem(`QURAN_SURAH_${surahId}`);
  if (cached) {
    try {
      const data = JSON.parse(cached);
      displaySurahVerses(surahId, data.ayahs, surahId !== 9);
      return;
    } catch (e) {}
  }

  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/quran-uthmani`);
    const json = await res.json();
    if (json.code === 200 && json.data && json.data.ayahs) {
      const verses = json.data.ayahs.map(a => a.text);
      try {
        localStorage.setItem(`QURAN_SURAH_${surahId}`, JSON.stringify({ ayahs: verses }));
      } catch (e) {}
      displaySurahVerses(surahId, verses, surahId !== 9 && surahId !== 1);
    } else {
      throw new Error('API Error');
    }
  } catch (err) {
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="text-center py-6 px-4 bg-emerald-950/70 rounded-2xl border border-amber-500/30">
          <span class="text-2xl mb-2 block">📖</span>
          <h4 class="text-xs font-bold text-amber-200">سورة ${meta.name} (${meta.ayahs} آية)</h4>
          <p class="text-[11px] text-slate-300 mt-2 leading-relaxed">
            يمكنك تلاوة السورة مباشرة من مصحفك الورقي وسنسجل صفحاتها في وردك تلقائياً!
          </p>
          <div class="mt-4 flex justify-center gap-2">
            <button onclick="logWirdPages(${meta.pages})" class="px-4 py-2 rounded-xl bg-amber-400 text-emerald-950 font-bold text-xs shadow-md">
              ✓ سجّل قراءة سورة ${meta.name} (${meta.pages} ص)
            </button>
          </div>
        </div>
      `;
    }
  }
}

function displaySurahVerses(surahId, ayahs, showBismillah = true) {
  const contentEl = document.getElementById('reader-verses-container');
  if (!contentEl) return;

  const meta = surahsMetadata.find(s => s.id === surahId);
  const bookmark = appState.quran.bookmark || {};

  let html = '';
  html += `
    <div class="text-center py-3 px-4 mb-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#10372e] to-emerald-950 border border-amber-400/30">
      <h3 class="text-base font-bold text-amber-300 font-quran">سُورَةُ ${meta.name}</h3>
      <span class="text-[10px] text-emerald-300/80 font-mono">${meta.type} • آياتها ${meta.ayahs}</span>
    </div>
  `;

  if (showBismillah && surahId !== 9) {
    html += `
      <div class="text-center my-4">
        <span class="font-quran text-lg text-amber-200/90 tracking-wider">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
      </div>
    `;
  }

  html += `<div class="leading-[2.4] text-justify text-slate-100 font-quran" style="font-size: ${appState.quran.fontSize || 22}px;">`;
  
  ayahs.forEach((ayahText, idx) => {
    const ayahNum = idx + 1;
    const isBookmarked = bookmark.surah === surahId && bookmark.ayah === ayahNum;

    let cleanText = ayahText;
    if (surahId !== 1 && ayahNum === 1 && cleanText.startsWith("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")) {
      cleanText = cleanText.replace("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "").trim();
    }

    html += `
      <span class="ayah-span cursor-pointer hover:text-amber-300 transition ${isBookmarked ? 'bg-amber-500/25 px-1 rounded border-b-2 border-amber-400' : ''}" onclick="setBookmark(${surahId}, '${meta.name}', ${ayahNum})">
        ${cleanText}
        <span class="inline-flex items-center justify-center text-amber-400 font-mono text-[13px] mx-1 border border-amber-500/40 rounded-full w-6 h-6 bg-emerald-950/70 select-none" title="الآية ${ayahNum}">
          ${ayahNum}
        </span>
      </span>
    `;
  });

  html += `</div>`;

  html += `
    <div class="mt-8 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3">
      <button onclick="logWirdPages(${meta.pages})" class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-bold text-xs shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
        <span>📖</span>
        <span>أتممت قراءة السورة (+${meta.pages} ص لوردك)</span>
      </button>
      <button onclick="setBookmark(${surahId}, '${meta.name}', 1)" class="py-2.5 px-3 rounded-xl bg-emerald-950 border border-amber-400/40 text-amber-300 text-xs hover:bg-emerald-900 transition">
        🔖 وضع فاصل
      </button>
    </div>
  `;

  contentEl.innerHTML = html;
}

function setBookmark(surahId, surahName, ayahNum) {
  appState.quran.bookmark = { surah: surahId, surahName, ayah: ayahNum };
  saveState();
  renderQuranWird();
  showToast(`تم حفظ الفاصل عند سورة ${surahName} (الآية ${ayahNum}) 🔖`);
  
  if (appState.quran.currentSurah === surahId) {
    openSurah(surahId);
  }
}

function goToBookmark() {
  if (appState.quran.bookmark && appState.quran.bookmark.surah) {
    openSurah(appState.quran.bookmark.surah);
  } else {
    openSurah(1);
  }
}

function changeQuranFontSize(delta) {
  appState.quran.fontSize = Math.max(16, Math.min(34, (appState.quran.fontSize || 22) + delta));
  saveState();
  if (appState.quran.currentSurah) {
    openSurah(appState.quran.currentSurah);
  }
}

function nextSurah() {
  const current = appState.quran.currentSurah || 1;
  if (current < 114) openSurah(current + 1);
}

function prevSurah() {
  const current = appState.quran.currentSurah || 1;
  if (current > 1) openSurah(current - 1);
}

function switchQuranSubTab(subTab) {
  const indexView = document.getElementById('quran-index-view');
  const readerView = document.getElementById('quran-reader-view');
  const btnIndex = document.getElementById('btn-subtab-index');
  const btnReader = document.getElementById('btn-subtab-reader');

  if (subTab === 'index') {
    if (indexView) indexView.classList.remove('hidden');
    if (readerView) readerView.classList.add('hidden');
    if (btnIndex) {
      btnIndex.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-amber-400 text-emerald-950 shadow-md transition";
    }
    if (btnReader) {
      btnReader.className = "flex-1 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-amber-300 transition";
    }
  } else {
    if (indexView) indexView.classList.add('hidden');
    if (readerView) readerView.classList.remove('hidden');
    if (btnReader) {
      btnReader.className = "flex-1 py-2 text-xs font-bold rounded-xl bg-amber-400 text-emerald-950 shadow-md transition";
    }
    if (btnIndex) {
      btnIndex.className = "flex-1 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-amber-300 transition";
    }
  }
}

// Missed Fasts Counter
function changeMissedFasts(delta) {
  appState.missedFasts = Math.max(0, appState.missedFasts + delta);
  saveState();
  const el = document.getElementById('missed-fasts-count');
  if (el) el.innerText = appState.missedFasts;

  if (appState.missedFasts === 0) {
    showToast('هنيئاً لك! أتممت قضاء ما فاتك من رمضان الماضي 🎉');
  }
}

// Khatmah Planner
function setKhatmahGoal(goal) {
  appState.khatmahGoal = goal;
  appState.quran.targetPagesToday = goal * 20;
  saveState();
  renderKhatmah();
  renderQuranWird();
}

function renderKhatmah() {
  const goal = appState.khatmahGoal || 1;
  const pagesPerSalah = goal * 4;
  const juzPerDay = goal;
  
  const elPages = document.getElementById('khatmah-pages-per-salah');
  const elJuz = document.getElementById('khatmah-juz-per-day');
  if (elPages) elPages.innerText = pagesPerSalah;
  if (elJuz) elJuz.innerText = juzPerDay;

  [1, 2, 3].forEach(g => {
    const btn = document.getElementById(`btn-khatmah-${g}`);
    if (btn) {
      if (g === goal) {
        btn.className = "py-1.5 px-3 rounded-xl bg-amber-400 text-emerald-950 font-bold text-xs transition";
      } else {
        btn.className = "py-1.5 px-3 rounded-xl bg-emerald-950 text-slate-300 border border-emerald-800 text-xs transition";
      }
    }
  });
}

// Caffeine Detox
function updateCaffeine(delta) {
  appState.caffeineCups = Math.max(0, Math.min(6, appState.caffeineCups + delta));
  saveState();
  renderCaffeine();
}

function renderCaffeine() {
  const cupsEl = document.getElementById('caffeine-cups');
  const barEl = document.getElementById('caffeine-bar');
  const statusEl = document.getElementById('caffeine-status');

  if (cupsEl) cupsEl.innerText = `${appState.caffeineCups} كوب`;
  const pct = Math.max(10, Math.round(((appState.caffeineInitial - appState.caffeineCups) / appState.caffeineInitial) * 100));
  if (barEl) barEl.style.width = `${pct}%`;
  
  if (statusEl) {
    if (appState.caffeineCups <= 1) {
      statusEl.innerText = 'ممتاز! جسدك مستعد للصيام بدون صداع القهوة 👍';
    } else {
      statusEl.innerText = `الهدف القادم: تقليل كوب واحد كل 3 أيام ☕`;
    }
  }
}

// Prep Checklist
function renderPrepTasks() {
  const listEl = document.getElementById('prep-tasks-container');
  if (!listEl) return;

  let html = '';
  appState.prepTasks.forEach((task, index) => {
    html += `
      <div class="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 hover:bg-emerald-900/40 transition">
        <label class="flex items-center gap-3 cursor-pointer flex-1">
          <input type="checkbox" ${task.done ? 'checked' : ''} onchange="togglePrepTask(${index})" class="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer">
          <span class="text-xs ${task.done ? 'line-through text-slate-400' : 'text-slate-100'}">${task.text}</span>
        </label>
        <button onclick="removePrepTask(${index})" class="text-slate-500 hover:text-red-400 text-xs px-2">✕</button>
      </div>
    `;
  });
  listEl.innerHTML = html;
}

function togglePrepTask(index) {
  if (appState.prepTasks[index]) {
    appState.prepTasks[index].done = !appState.prepTasks[index].done;
    saveState();
    renderPrepTasks();
  renderMeals();
  }
}

function removePrepTask(index) {
  appState.prepTasks.splice(index, 1);
  saveState();
  renderPrepTasks();
  renderMeals();
}

function addPrepTask() {
  const text = prompt('أدخل تفاصيل المهمة أو مستلزمات التجهيز:');
  if (text && text.trim()) {
    appState.prepTasks.push({
      id: Date.now().toString(),
      text: text.trim(),
      category: 'custom',
      done: false
    });
    saveState();
    renderPrepTasks();
  renderMeals();
    showToast('تمت إضافة المهمة بنجاح 📝');
  }
}

function addMealToGroceries(mealName, ingredients) {
  ingredients.forEach(item => {
    appState.prepTasks.push({
      id: Date.now().toString() + Math.random(),
      text: `مشتريات لـ (${mealName}): ${item}`,
      category: 'groceries',
      done: false
    });
  });
  saveState();
  renderPrepTasks();
  renderMeals();
  showToast(`تم تحويل مكونات ${mealName} إلى قائمة مشترياتك! 🛒`);
}

function calculateZakat() {
  const totalAmount = parseFloat(document.getElementById('zakat-cash').value) || 0;
  const goldGramPrice = parseFloat(document.getElementById('gold-price').value) || 3500;
  const nisab = 85 * goldGramPrice;

  const resultEl = document.getElementById('zakat-result');
  const detailsEl = document.getElementById('zakat-details');

  if (totalAmount < nisab) {
    resultEl.innerText = '0 جنيه (المبلغ لم يبلغ النصاب)';
    detailsEl.innerText = `نصاب الزكاة الحالي هو قيمة 85 جرام ذهب عيار 21 (حوالي ${nisab.toLocaleString()} ج).`;
  } else {
    const zakatDue = totalAmount * 0.025;
    resultEl.innerText = `${zakatDue.toLocaleString()} ج.م`;
    detailsEl.innerText = `مقدار الزكاة الواجب إخراجها (2.5% من المال الذي حال عليه الحول).`;
  }
}

// Interactive Tasbeeh
function incrementTasbeeh() {
  appState.tasbeeh.count++;
  saveState();
  updateTasbeehUI();

  const currentDhikr = athkarList[appState.tasbeeh.dhikrIndex];
  if (appState.tasbeeh.count % currentDhikr.target === 0) {
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
    showToast(`أتممت ${appState.tasbeeh.count} من ${currentDhikr.text}، تقبل الله منك! 📿`);
  } else {
    if (navigator.vibrate) navigator.vibrate(15);
  }
}

function resetTasbeeh() {
  appState.tasbeeh.count = 0;
  saveState();
  updateTasbeehUI();
}

function nextDhikr() {
  appState.tasbeeh.dhikrIndex = (appState.tasbeeh.dhikrIndex + 1) % athkarList.length;
  appState.tasbeeh.count = 0;
  saveState();
  updateTasbeehUI();
}

function updateTasbeehUI() {
  const current = athkarList[appState.tasbeeh.dhikrIndex];
  const countEl = document.getElementById('tasbeeh-count');
  const nameEl = document.getElementById('tasbeeh-name');
  const meritEl = document.getElementById('tasbeeh-merit');
  const targetEl = document.getElementById('tasbeeh-target');

  if (countEl) countEl.innerText = appState.tasbeeh.count;
  if (nameEl) nameEl.innerText = current.text;
  if (meritEl) meritEl.innerText = current.merit;
  if (targetEl) targetEl.innerText = `الهدف المقترح: ${current.target} مرة`;
}

// Personal Dua Box
function renderCustomDuas() {
  const container = document.getElementById('custom-duas-list');
  if (!container) return;

  let html = '';
  appState.customDuas.forEach((d, index) => {
    html += `
      <div class="bg-gradient-to-r from-emerald-950 to-[#0e2f29] p-3.5 rounded-2xl border border-amber-500/25 relative group">
        <p class="text-xs text-slate-100 font-serif leading-relaxed">"${d.text}"</p>
        <button onclick="deleteCustomDua(${index})" class="absolute top-2 left-2 text-slate-500 hover:text-red-400 text-xs p-1">✕</button>
      </div>
    `;
  });
  container.innerHTML = html;
}

function addCustomDua() {
  const text = prompt('اكتب دعاءك الخاص لرمضان لتدعو به عند الإفطار وفي السجود:');
  if (text && text.trim()) {
    appState.customDuas.push({
      id: Date.now().toString(),
      text: text.trim()
    });
    saveState();
    renderCustomDuas();
    showToast('تمت إضافة دعائك الخاص بنجاح 🤲');
  }
}

function deleteCustomDua(index) {
  appState.customDuas.splice(index, 1);
  saveState();
  renderCustomDuas();
}

function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-400 text-emerald-950 px-4 py-2 rounded-full font-bold text-xs shadow-2xl z-50 transition-all duration-300 opacity-0 pointer-events-none transform translate-y-2';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-2');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 2500);
}

function editUserName() {
  const newName = prompt('ما اسمك الكريم؟', appState.userName);
  if (newName && newName.trim()) {
    appState.userName = newName.trim();
    saveState();
    const el = document.getElementById('user-greeting-name');
    if (el) el.innerText = `أهلاً بك يا ${appState.userName} 🌙`;
    showToast(`أهلاً بك يا ${appState.userName}`);
  }
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  const userGreeting = document.getElementById('user-greeting-name');
  if (userGreeting) userGreeting.innerText = `أهلاً بك يا ${appState.userName} 🌙`;

  const missedEl = document.getElementById('missed-fasts-count');
  if (missedEl) missedEl.innerText = appState.missedFasts;

  renderHabits();
  renderChallenge();
  renderKhatmah();
  renderCaffeine();
  renderPrepTasks();
  renderMeals();
  updateTasbeehUI();
  renderCustomDuas();
  renderQuranWird();
  renderSurahIndex();

  if (appState.quran.bookmark && appState.quran.bookmark.surah) {
    openSurah(appState.quran.bookmark.surah);
  } else {
    openSurah(1);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.log('SW registration skipped in local file protocol:', err);
    });
  }
});


// ===============================================================
// CUSTOM USER MEALS MANAGEMENT (وجبات السحور والإفطار المخصصة)
// ===============================================================

let currentMealsFilter = 'all';

function getMealsList() {
  if (!appState.customMeals || !Array.isArray(appState.customMeals) || appState.customMeals.length === 0) {
    appState.customMeals = [
      {
        id: 'm1',
        title: 'زبادي يوناني وشوفان بالموز والعسل',
        desc: 'سحور مثالي غني بالبوتاسيوم والبروتين بطيء الامتصاص لمنع الجوع والعطش',
        category: 'suhoor',
        ingredients: ['زبادي يوناني', 'شوفان كامل', 'موز', 'عسل نحل', 'خيار', 'تمر']
      },
      {
        id: 'm2',
        title: 'فول بزيت الزيتون والليمون مع بيض مسلوق',
        desc: 'سحور تقليدي مشبع يمد الجسم بطاقة تدوم طوال ساعات الصيام',
        category: 'suhoor',
        ingredients: ['فول مدمس', 'زيت زيتون', 'ليمون وكمون', 'بيض مسلوق', 'خبز أسمر']
      },
      {
        id: 'm3',
        title: 'تمر وشوربة دافئة مع دجاج مشوي وسلطة',
        desc: 'إفطار متوازن خفيف على المعدة يمنع الخمول وارتفاع السكر المفاجئ',
        category: 'iftar',
        ingredients: ['تمر مجدول', 'شوربة خضار أو شوفان', 'صدور دجاج مشوية', 'طبق سلطة خضراء', 'أرز بسمتي']
      },
      {
        id: 'm4',
        title: 'سمك مشوي في الفرن مع خضار سوتيه',
        desc: 'إفطار صحي خفيف مليء بالأوميجا 3 وسهل الهضم لليالي الصيام والقيام',
        category: 'iftar',
        ingredients: ['سمك فيليه أو دنيس', 'بطاطس', 'ليمون وثوم', 'سلطة طحينة', 'خضار مشكل']
      }
    ];
    saveState();
  }
  return appState.customMeals;
}

function renderMeals(filter = currentMealsFilter) {
  currentMealsFilter = filter;
  const container = document.getElementById('meals-list-container');
  if (!container) return;

  const meals = getMealsList();
  const filtered = meals.filter(m => filter === 'all' || m.category === filter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400 bg-cyan-950/40 rounded-2xl border border-cyan-800/40">
        <p class="text-xs mb-2">لا توجد وجبات مسجلة في هذا القسم بعد.</p>
        <button onclick="openAddMealModal()" class="text-xs text-amber-300 font-bold hover:underline">+ أضف أول وجبة الآن</button>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(meal => {
    const isSuhoor = meal.category === 'suhoor';
    const badgeText = isSuhoor ? '🥣 سحور' : '🍲 إفطار';
    const badgeColor = isSuhoor ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-amber-950 text-amber-300 border-amber-800';

    const ingBadges = (meal.ingredients || []).map(ing => 
      `<span class="text-[9px] bg-cyan-950/80 text-slate-300 px-2 py-0.5 rounded-md border border-cyan-800/50">${ing}</span>`
    ).join(' ');

    const ingArrayJson = JSON.stringify(meal.ingredients || []).replace(/"/g, '&quot;');

    html += `
      <div class="bg-gradient-to-b from-[#0e2a3c] to-[#0a2030] p-4 rounded-2xl border border-amber-400/30 shadow-md space-y-2.5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[10px] px-2 py-0.5 rounded-full border ${badgeColor} font-bold">${badgeText}</span>
              <h4 class="text-xs font-bold text-slate-100">${meal.title}</h4>
            </div>
            ${meal.desc ? `<p class="text-[11px] text-cyan-300/80 leading-relaxed">${meal.desc}</p>` : ''}
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button onclick="editMeal('${meal.id}')" title="تعديل الوجبة" class="w-6 h-6 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-slate-300 flex items-center justify-center text-xs">✏️</button>
            <button onclick="deleteMeal('${meal.id}')" title="حذف الوجبة" class="w-6 h-6 rounded-lg bg-cyan-950 hover:bg-red-900/40 text-slate-400 hover:text-red-300 flex items-center justify-center text-xs">🗑️</button>
          </div>
        </div>

        ${meal.ingredients && meal.ingredients.length > 0 ? `
          <div class="pt-1 border-t border-cyan-800/30">
            <div class="flex flex-wrap items-center gap-1 mb-2">
              <span class="text-[9px] text-slate-400 font-medium">المكونات:</span>
              ${ingBadges}
            </div>
            <button onclick="addMealToGroceries('${meal.title}', ${ingArrayJson})" class="w-full py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-amber-400/40 text-[10px] font-bold text-amber-300 transition flex items-center justify-center gap-1.5">
              <span>🛒</span>
              <span>تحويل المكونات لقائمة المشتريات</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

function filterMeals(category) {
  document.querySelectorAll('.meal-filter-btn').forEach(btn => {
    btn.classList.remove('bg-amber-400', 'text-slate-950');
    btn.classList.add('bg-cyan-950', 'text-slate-300');
  });
  const activeBtn = document.getElementById(`meal-filter-${category}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-cyan-950', 'text-slate-300');
    activeBtn.classList.add('bg-amber-400', 'text-slate-950');
  }
  renderMeals(category);
}

function openAddMealModal(mealId = '') {
  const modal = document.getElementById('meal-modal');
  if (!modal) return;

  const idInput = document.getElementById('modal-meal-id');
  const nameInput = document.getElementById('modal-meal-name');
  const catInput = document.getElementById('modal-meal-category');
  const descInput = document.getElementById('modal-meal-desc');
  const ingInput = document.getElementById('modal-meal-ingredients');
  const titleEl = document.getElementById('modal-meal-title');

  if (mealId) {
    const meal = getMealsList().find(m => m.id === mealId);
    if (meal) {
      idInput.value = meal.id;
      nameInput.value = meal.title || '';
      catInput.value = meal.category || 'suhoor';
      descInput.value = meal.desc || '';
      ingInput.value = (meal.ingredients || []).join('، ');
      titleEl.innerText = 'تعديل الوجبة';
    }
  } else {
    idInput.value = '';
    nameInput.value = '';
    catInput.value = 'suhoor';
    descInput.value = '';
    ingInput.value = '';
    titleEl.innerText = 'إضافة وجبة جديدة';
  }

  modal.classList.remove('hidden');
}

function closeMealModal() {
  const modal = document.getElementById('meal-modal');
  if (modal) modal.classList.add('hidden');
}

function saveMealFromModal() {
  const idInput = document.getElementById('modal-meal-id');
  const nameInput = document.getElementById('modal-meal-name');
  const catInput = document.getElementById('modal-meal-category');
  const descInput = document.getElementById('modal-meal-desc');
  const ingInput = document.getElementById('modal-meal-ingredients');

  const title = nameInput.value.trim();
  if (!title) {
    alert('يرجى كتابة اسم الوجبة');
    return;
  }

  const category = catInput.value;
  const desc = descInput.value.trim();
  const rawIngs = ingInput.value;
  const ingredients = rawIngs ? rawIngs.split(/[,،]+/).map(s => s.trim()).filter(Boolean) : [];

  const meals = getMealsList();

  if (idInput.value) {
    // Edit existing
    const idx = meals.findIndex(m => m.id === idInput.value);
    if (idx !== -1) {
      meals[idx] = {
        ...meals[idx],
        title,
        category,
        desc,
        ingredients
      };
      showToast('تم تحديث بيانات الوجبة بنجاح ✨');
    }
  } else {
    // Add new
    const newMeal = {
      id: Date.now().toString(),
      title,
      category,
      desc,
      ingredients
    };
    meals.unshift(newMeal);
    showToast('تمت إضافة الوجبة الجديدة بنجاح 🥣');
  }

  appState.customMeals = meals;
  saveState();
  closeMealModal();
  renderMeals();
}

function editMeal(id) {
  openAddMealModal(id);
}

function deleteMeal(id) {
  if (confirm('هل أنت متأكد من حذف هذه الوجبة؟')) {
    appState.customMeals = getMealsList().filter(m => m.id !== id);
    saveState();
    renderMeals();
    showToast('تم حذف الوجبة');
  }
}
