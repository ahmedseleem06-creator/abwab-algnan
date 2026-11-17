/**
 * أبواب الجنان - Abwab Al-Jinan
 * رفيق الاستعداد لشهر رمضان المبارك
 * JavaScript Application Logic (v2.0 - Emerald & Gold Edition)
 */

// =========================================================================
// 1. Initial State & Local Storage Management
// =========================================================================

const STORAGE_KEY = 'abwab_aljinan_state_v2';

const defaultState = {
  selectedCity: 'Cairo',
  achievements: {
    fasting: true,
    prayers: [true, true, true, true, false], // Fajr, Dhuhr, Asr, Maghrib, Isha
    quran: true,
    tasbeeh: 150,
    streak: 5
  },
  khatmahGoal: 1, // 1 (30 days), 2 (15 days), 3 (10 days)
  fastingChallenge: Array.from({ length: 30 }, (_, i) => i < 8), // First 8 days completed
  quran: {
    currentSurah: 1,
    bookmark: { surah: 2, ayah: 1, surahName: "سورة البقرة" }
  },
  tasbeeh: {
    count: 150,
    dailyTotal: 150,
    currentPresetIdx: 0
  }
};

let appState = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultState, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e);
  }
  return JSON.parse(JSON.stringify(defaultState));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}

// =========================================================================
// 2. Tab Navigation
// =========================================================================

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  const target = document.getElementById('tab-' + tabId);
  if (target) {
    target.classList.add('active');
  }

  // Update Bottom Nav Highlighting
  ['home', 'prayers', 'quran', 'tasbeeh'].forEach(id => {
    const btn = document.getElementById('nav-' + id);
    if (btn) {
      if (id === tabId) {
        btn.className = 'flex flex-col items-center text-amber-300 text-xs font-bold transition';
      } else {
        btn.className = 'flex flex-col items-center text-slate-400 hover:text-amber-300 text-xs transition';
      }
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================================================
// 3. Live Hijri & Gregorian Dates and Ramadan Countdown
// =========================================================================

function updateLiveDates() {
  const now = new Date();

  // Gregorian Formatter
  try {
    const gregFormatter = new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const elGreg = document.getElementById('liveGregorianHeader');
    if (elGreg) elGreg.textContent = gregFormatter.format(now);
  } catch (e) {
    console.warn('Gregorian format fallback', e);
  }

  // Hijri Formatter (Umm al-Qura)
  try {
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const elHijri = document.getElementById('liveHijriHeader');
    if (elHijri) elHijri.textContent = hijriFormatter.format(now) + ' هـ';
  } catch (e) {
    const elHijri = document.getElementById('liveHijriHeader');
    if (elHijri) elHijri.textContent = 'الثلاثاء 8 جمادى الآخرة 1448 هـ';
  }
}

function updateRamadanCountdown() {
  // Ramadan 1, 1448 AH begins approx February 8, 2027
  const target = new Date('2027-02-08T00:00:00');
  const now = new Date();
  let diff = target - now;

  if (diff <= 0) {
    diff = 82 * 24 * 3600 * 1000 + 14 * 3600 * 1000 + 35 * 60 * 1000;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const elDays = document.getElementById('countdownDays');
  const elHours = document.getElementById('countdownHours');
  const elMins = document.getElementById('countdownMins');
  const elSecs = document.getElementById('countdownSecs');

  if (elDays) elDays.textContent = days;
  if (elHours) elHours.textContent = String(hours).padStart(2, '0');
  if (elMins) elMins.textContent = String(minutes).padStart(2, '0');
  if (elSecs) elSecs.textContent = String(seconds).padStart(2, '0');
}

// =========================================================================
// 4. Prayer Times Engine
// =========================================================================

const citySchedules = {
  Cairo: {
    name: 'القاهرة ومحيطها',
    fajr: '04:52', sunrise: '06:21', dhuhr: '11:43', asr: '14:44', maghrib: '17:04', isha: '18:24'
  },
  Alexandria: {
    name: 'الإسكندرية والساحل',
    fajr: '04:57', sunrise: '06:27', dhuhr: '11:48', asr: '14:48', maghrib: '17:08', isha: '18:29'
  },
  Makkah: {
    name: 'مكة المكرمة وما جاورها',
    fajr: '05:08', sunrise: '06:29', dhuhr: '12:05', asr: '15:18', maghrib: '17:41', isha: '19:11'
  },
  Madinah: {
    name: 'المدينة المنورة',
    fajr: '05:12', sunrise: '06:33', dhuhr: '12:06', asr: '15:15', maghrib: '17:38', isha: '19:08'
  },
  Riyadh: {
    name: 'مدينة الرياض',
    fajr: '04:47', sunrise: '06:08', dhuhr: '11:41', asr: '14:49', maghrib: '17:14', isha: '18:44'
  },
  Dubai: {
    name: 'دبي والإمارات',
    fajr: '05:14', sunrise: '06:33', dhuhr: '12:08', asr: '15:19', maghrib: '17:43', isha: '19:13'
  },
  Jerusalem: {
    name: 'القدس الشريف وفلسطين',
    fajr: '04:46', sunrise: '06:14', dhuhr: '11:33', asr: '14:31', maghrib: '16:53', isha: '18:14'
  }
};

function changeCity(cityKey) {
  if (citySchedules[cityKey]) {
    appState.selectedCity = cityKey;
    saveState();
    renderPrayerTimes();
  }
}

function renderPrayerTimes() {
  const cityKey = appState.selectedCity || 'Cairo';
  const data = citySchedules[cityKey] || citySchedules.Cairo;

  // Header and title
  const cityTitle = document.getElementById('prayerCityTitle');
  if (cityTitle) cityTitle.textContent = data.name;

  const citySelect = document.getElementById('citySelect');
  if (citySelect && citySelect.value !== cityKey) {
    citySelect.value = cityKey;
  }

  // Parse today times
  const now = new Date();
  const timesList = [
    { key: 'fajr', name: 'صلاة الفجر', time: data.fajr, icon: 'fa-cloud-sun' },
    { key: 'sunrise', name: 'الشروق', time: data.sunrise, icon: 'fa-sun' },
    { key: 'dhuhr', name: 'صلاة الظهر', time: data.dhuhr, icon: 'fa-sun' },
    { key: 'asr', name: 'صلاة العصر', time: data.asr, icon: 'fa-cloud-sun' },
    { key: 'maghrib', name: 'صلاة المغرب (الإفطار)', time: data.maghrib, icon: 'fa-moon' },
    { key: 'isha', name: 'صلاة العشاء والتراويح', time: data.isha, icon: 'fa-star-and-crescent' }
  ];

  // Determine next prayer
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let nextPrayer = timesList[0];
  let minDiff = 99999;

  for (const p of timesList) {
    const [h, m] = p.time.split(':').map(Number);
    const pMinutes = h * 60 + m;
    const diff = pMinutes - currentMinutes;
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextPrayer = p;
    }
  }

  // Next prayer quick banner
  const nextNameEl = document.getElementById('nextPrayerName');
  const nextTimeEl = document.getElementById('nextPrayerTime');
  if (nextNameEl) nextNameEl.textContent = nextPrayer.name;
  if (nextTimeEl) nextTimeEl.textContent = formatTime12(nextPrayer.time);

  // Table rows in Prayers Tab
  const tableContainer = document.getElementById('prayerTimesTable');
  if (tableContainer) {
    tableContainer.innerHTML = timesList.map(p => {
      const isNext = p.key === nextPrayer.key;
      return `
        <div class="flex items-center justify-between p-3 rounded-2xl ${isNext ? 'bg-[#082a22] border-2 border-amber-400 shadow-lg' : 'bg-[#061e19] border border-amber-500/20'} transition">
          <div class="flex items-center gap-2.5">
            <i class="fa-solid ${p.icon} text-amber-400 text-xs"></i>
            <span class="text-xs font-bold ${isNext ? 'text-amber-300' : 'text-white'}">${p.name} ${isNext ? '(القادمة)' : ''}</span>
          </div>
          <span class="text-xs font-mono font-bold ${isNext ? 'text-amber-300' : 'text-slate-300'}">${formatTime12(p.time)}</span>
        </div>
      `;
    }).join('');
  }

  // Update countdown to next prayer
  updateNextPrayerCountdown(nextPrayer.time);
}

function formatTime12(time24) {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${mStr} ${suffix}`;
}

function updateNextPrayerCountdown(nextTime24) {
  const [h, m] = nextTime24.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);

  if (target < now) {
    target.setDate(target.getDate() + 1);
  }

  let diff = target - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  const countdownEl = document.getElementById('prayerCountdown');
  if (countdownEl) {
    countdownEl.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

// =========================================================================
// 5. Smart Achievement Hub Logic (بديل الدوائر)
// =========================================================================

function recalculateDashboard() {
  const ach = appState.achievements;
  let totalTasks = 4;
  let completed = 0;

  if (ach.fasting) completed += 1;

  const prayersDone = ach.prayers.filter(Boolean).length;
  if (prayersDone === 5) completed += 1;
  else completed += (prayersDone / 5);

  if (ach.quran) completed += 1;
  if (ach.tasbeeh >= 300) completed += 1;
  else completed += (ach.tasbeeh / 300);

  const percent = Math.min(100, Math.round((completed / totalTasks) * 100));

  // Progress percentage & bar
  const percentText = document.getElementById('overallPercentText');
  const progressBar = document.getElementById('overallProgressBar');
  if (percentText) percentText.textContent = percent + '%';
  if (progressBar) progressBar.style.width = percent + '%';

  // Counter
  const doneTasksCount = (ach.fasting ? 1 : 0) + (prayersDone === 5 ? 1 : 0) + (ach.quran ? 1 : 0) + (ach.tasbeeh >= 300 ? 1 : 0);
  const tasksCounterEl = document.getElementById('completedTasksCounter');
  if (tasksCounterEl) tasksCounterEl.textContent = `${doneTasksCount} من 4 مهام مكتملة`;

  // Streak badge
  const streakBadge = document.getElementById('streakBadge');
  if (streakBadge) streakBadge.textContent = `🔥 ${ach.streak || 5} أيام متتالية من الالتزام`;

  // 1. Fasting Card Update
  const fastingCard = document.getElementById('card-fasting');
  const fastingCheck = document.getElementById('check-fasting');
  const fastingText = document.getElementById('fastingStatusText');
  if (fastingCard && fastingCheck && fastingText) {
    if (ach.fasting) {
      fastingCard.className = 'cursor-pointer p-3 rounded-2xl bg-[#07241e] border border-amber-500/40 hover:border-amber-400 transition-all flex flex-col justify-between';
      fastingCheck.className = 'w-5 h-5 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center text-[10px] font-bold shadow-sm';
      fastingCheck.textContent = '✓';
      fastingText.textContent = 'تم تسجيل الصيام ✓';
    } else {
      fastingCard.className = 'cursor-pointer p-3 rounded-2xl bg-[#051a15] border border-emerald-500/20 hover:border-amber-400 transition-all flex flex-col justify-between opacity-80';
      fastingCheck.className = 'w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold';
      fastingCheck.textContent = '○';
      fastingText.textContent = 'اضغط لتسجيل الصيام';
    }
  }

  // 2. Prayers Card & 5 Buttons
  const prayersBadge = document.getElementById('prayersCountBadge');
  const prayersSub = document.getElementById('prayersSubText');
  if (prayersBadge) prayersBadge.textContent = `${prayersDone}/5`;
  if (prayersSub) prayersSub.textContent = prayersDone === 5 ? 'تمت جميع الصلوات ✓' : `متبقي ${5 - prayersDone} صلوات`;

  const prayerNames = ['فجر', 'ظهر', 'عصر', 'مغرب', 'عشاء'];
  ach.prayers.forEach((done, idx) => {
    const btn = document.getElementById('prayer-btn-' + idx);
    if (btn) {
      if (done) {
        btn.className = 'py-1.5 rounded-xl bg-amber-400 text-emerald-950 font-bold transition shadow-sm';
        btn.textContent = prayerNames[idx] + ' ✓';
      } else {
        btn.className = 'py-1.5 rounded-xl bg-[#0a2f27] text-slate-300 hover:border-amber-400 border border-emerald-500/30 transition';
        btn.textContent = prayerNames[idx];
      }
    }
  });

  // 3. Quran Card Update
  const btnWird = document.getElementById('btnCompleteWird');
  const checkQuran = document.getElementById('check-quran');
  const wirdBtnCheck = document.getElementById('wirdBtnCheck');
  const wirdBtnText = document.getElementById('wirdBtnText');
  if (btnWird && checkQuran) {
    if (ach.quran) {
      btnWird.className = 'w-full py-2.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/40 transition flex items-center justify-center gap-2';
      if (wirdBtnCheck) wirdBtnCheck.textContent = '✓';
      if (wirdBtnText) wirdBtnText.textContent = 'أتممت قراءة ورد اليوم بنجاح';
      checkQuran.className = 'w-5 h-5 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center text-[10px] font-bold';
      checkQuran.textContent = '✓';
    } else {
      btnWird.className = 'w-full py-2.5 rounded-xl bg-[#061e19] text-slate-300 hover:border-amber-400 text-xs font-bold border border-emerald-500/30 transition flex items-center justify-center gap-2';
      if (wirdBtnCheck) wirdBtnCheck.textContent = '○';
      if (wirdBtnText) wirdBtnText.textContent = 'اضغط لتأكيد إتمام ورد اليوم';
      checkQuran.className = 'w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold';
      checkQuran.textContent = '○';
    }
  }

  // 4. Tasbeeh Card Update
  const checkAzkar = document.getElementById('check-azkar');
  const azkarSummary = document.getElementById('azkarSummary');
  if (checkAzkar) {
    checkAzkar.textContent = ach.tasbeeh >= 300 ? '✓' : ach.tasbeeh;
    checkAzkar.className = ach.tasbeeh >= 300
      ? 'w-5 h-5 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center text-[10px] font-bold'
      : 'w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold';
  }
  if (azkarSummary) azkarSummary.textContent = `${ach.tasbeeh} / 300 تسبيحة`;

  saveState();
}

function toggleAchievement(type) {
  if (type === 'fasting') {
    appState.achievements.fasting = !appState.achievements.fasting;
    // update pre-Ramadan streak
    appState.fastingChallenge[7] = appState.achievements.fasting;
    renderFastingChallenge();
  } else if (type === 'quran') {
    appState.achievements.quran = !appState.achievements.quran;
  }
  recalculateDashboard();
}

function togglePrayer(idx) {
  appState.achievements.prayers[idx] = !appState.achievements.prayers[idx];
  recalculateDashboard();
}

// =========================================================================
// 6. Pre-Ramadan Fasting Challenge (30 Days)
// =========================================================================

function renderFastingChallenge() {
  const container = document.getElementById('fastingDaysGrid');
  if (!container) return;

  const completedCount = appState.fastingChallenge.filter(Boolean).length;
  const countText = document.getElementById('fastingDaysCountText');
  if (countText) countText.textContent = `صمت ${completedCount} من 30 يوماً`;

  container.innerHTML = appState.fastingChallenge.slice(0, 10).map((done, idx) => {
    const dayNum = idx + 1;
    if (done) {
      return `<div onclick="toggleChallengeDay(${idx})" class="w-7 h-7 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center text-[10px] font-bold mx-auto cursor-pointer shadow-sm hover:scale-105 transition">${dayNum}</div>`;
    } else if (idx === completedCount) {
      return `<div onclick="toggleChallengeDay(${idx})" class="w-7 h-7 rounded-lg bg-[#0a2e26] border border-amber-500/50 text-amber-300 flex items-center justify-center text-[10px] font-bold mx-auto cursor-pointer hover:scale-105 transition">${dayNum}</div>`;
    } else {
      return `<div onclick="toggleChallengeDay(${idx})" class="w-7 h-7 rounded-lg bg-[#051a15] text-slate-500 flex items-center justify-center text-[10px] mx-auto cursor-pointer hover:border hover:border-amber-500/30 transition">${dayNum}</div>`;
    }
  }).join('');
}

function toggleChallengeDay(idx) {
  appState.fastingChallenge[idx] = !appState.fastingChallenge[idx];
  if (idx === 7) {
    appState.achievements.fasting = appState.fastingChallenge[idx];
  }
  saveState();
  renderFastingChallenge();
  recalculateDashboard();
}

// =========================================================================
// 7. Quran Reader, Khatmah Designer & Simplified Wird
// =========================================================================

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
  { id: 11, name: "هود", type: "مكية", ayahs: 123, juz: 11, pages: 13 },
  { id: 12, name: "يوسف", type: "مكية", ayahs: 111, juz: 12, pages: 14 },
  { id: 13, name: "الرعد", type: "مدنية", ayahs: 43, juz: 13, pages: 6 },
  { id: 14, name: "إبراهيم", type: "مكية", ayahs: 52, juz: 13, pages: 7 },
  { id: 15, name: "الحجر", type: "مكية", ayahs: 99, juz: 14, pages: 5 },
  { id: 16, name: "النحل", type: "مكية", ayahs: 128, juz: 14, pages: 14 },
  { id: 17, name: "الإسراء", type: "مكية", ayahs: 111, juz: 15, pages: 11 },
  { id: 18, name: "الكهف", type: "مكية", ayahs: 110, juz: 15, pages: 12 },
  { id: 19, name: "مريم", type: "مكية", ayahs: 98, juz: 16, pages: 8 },
  { id: 20, name: "طه", type: "مكية", ayahs: 135, juz: 16, pages: 10 },
  { id: 21, name: "الأنبياء", type: "مكية", ayahs: 112, juz: 17, pages: 10 },
  { id: 22, name: "الحج", type: "مدنية", ayahs: 78, juz: 17, pages: 10 },
  { id: 23, name: "المؤمنون", type: "مكية", ayahs: 118, juz: 18, pages: 9 },
  { id: 24, name: "النور", type: "مدنية", ayahs: 64, juz: 18, pages: 10 },
  { id: 25, name: "الفرقان", type: "مكية", ayahs: 77, juz: 18, pages: 8 },
  { id: 26, name: "الشعراء", type: "مكية", ayahs: 227, juz: 19, pages: 11 },
  { id: 27, name: "النمل", type: "مكية", ayahs: 93, juz: 19, pages: 10 },
  { id: 28, name: "القصص", type: "مكية", ayahs: 88, juz: 20, pages: 11 },
  { id: 29, name: "العنكبوت", type: "مكية", ayahs: 69, juz: 20, pages: 8 },
  { id: 30, name: "الروم", type: "مكية", ayahs: 60, juz: 21, pages: 7 },
  { id: 31, name: "لقمان", type: "مكية", ayahs: 34, juz: 21, pages: 4 },
  { id: 32, name: "السجدة", type: "مكية", ayahs: 30, juz: 21, pages: 3 },
  { id: 33, name: "الأحزاب", type: "مدنية", ayahs: 73, juz: 21, pages: 10 },
  { id: 34, name: "سبأ", type: "مكية", ayahs: 54, juz: 22, pages: 7 },
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
  { id: 55, name: "الرحمن", type: "مدنية", ayahs: 78, juz: 27, pages: 3 },
  { id: 56, name: "الواقعة", type: "مكية", ayahs: 96, juz: 27, pages: 3 },
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
  { id: 67, name: "الملك", type: "مكية", ayahs: 30, juz: 29, pages: 2 },
  { id: 68, name: "القلم", type: "مكية", ayahs: 52, juz: 29, pages: 3 },
  { id: 69, name: "الحاقة", type: "مكية", ayahs: 52, juz: 29, pages: 2 },
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
  { id: 83, name: "المطففين", type: "مكية", ayahs: 36, juz: 30, pages: 2 },
  { id: 84, name: "الانشقاق", type: "مكية", ayahs: 25, juz: 30, pages: 1 },
  { id: 85, name: "البروج", type: "مكية", ayahs: 22, juz: 30, pages: 1 },
  { id: 86, name: "الطارق", type: "مكية", ayahs: 17, juz: 30, pages: 1 },
  { id: 87, name: "الأعلى", type: "مكية", ayahs: 19, juz: 30, pages: 1 },
  { id: 88, name: "الغاشية", type: "مكية", ayahs: 26, juz: 30, pages: 1 },
  { id: 89, name: "الفجر", type: "مكية", ayahs: 30, juz: 30, pages: 2 },
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

function setKhatmahGoal(goal) {
  appState.khatmahGoal = goal;
  saveState();
  renderKhatmahPlanner();
}

function renderKhatmahPlanner() {
  const goal = appState.khatmahGoal || 1;
  [1, 2, 3].forEach(g => {
    const btn = document.getElementById('goal-btn-' + g);
    if (btn) {
      if (g === goal) {
        btn.className = 'p-2 rounded-xl bg-amber-400 text-emerald-950 font-bold transition shadow-sm';
      } else {
        btn.className = 'p-2 rounded-xl bg-[#061e19] text-slate-300 border border-emerald-500/30 hover:border-amber-400 transition';
      }
    }
  });

  const goalLabels = {
    1: 'ختمة في 30 يوماً',
    2: 'ختمتان (ختمة كل 15 يوم)',
    3: '3 ختمات (ختمة كل 10 أيام)'
  };
  const dailyPages = goal * 20;
  const pagesPerSalah = goal * 4;
  const estTime = goal * 25;

  const labelEl = document.getElementById('currentKhatmahGoalLabel');
  const pagesEl = document.getElementById('khatmahDailyPages');
  const salahPagesEl = document.getElementById('khatmahPagesPerSalah');
  const estTimeEl = document.getElementById('khatmahEstTime');

  if (labelEl) labelEl.textContent = goalLabels[goal] || goalLabels[1];
  if (pagesEl) pagesEl.textContent = `${dailyPages} صفحة (${goal} جزء)`;
  if (salahPagesEl) salahPagesEl.textContent = `${pagesPerSalah} صفحات`;
  if (estTimeEl) estTimeEl.textContent = `${estTime} دقيقة/يوم`;
}

function renderSurahsList(filter = '') {
  const container = document.getElementById('surahsListContainer');
  if (!container) return;

  const cleanFilter = filter.trim().toLowerCase();
  const filtered = surahsMetadata.filter(s => 
    s.name.includes(cleanFilter) || String(s.id).includes(cleanFilter)
  );

  container.innerHTML = filtered.map(s => {
    return `
      <div onclick="openSurah(${s.id})" class="flex items-center justify-between p-2.5 rounded-2xl bg-[#061e19] border border-emerald-500/20 hover:border-amber-400 cursor-pointer transition">
        <div class="flex items-center gap-2.5">
          <span class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center font-bold">${s.id}</span>
          <div>
            <div class="text-xs font-bold font-quran text-white">سُورَةُ ${s.name}</div>
            <div class="text-[10px] text-slate-400">${s.type} • الجزء ${s.juz}</div>
          </div>
        </div>
        <span class="text-[10px] text-amber-200">${s.ayahs} آية</span>
      </div>
    `;
  }).join('');
}

function filterSurahs(val) {
  renderSurahsList(val);
}

// Full Surah Reading Modal
async function openSurah(surahId) {
  appState.quran.currentSurah = surahId;
  saveState();

  const surahInfo = surahsMetadata.find(s => s.id === surahId) || surahsMetadata[0];
  const modal = document.getElementById('surahModal');
  const modalName = document.getElementById('modalSurahName');
  const modalDetails = document.getElementById('modalSurahDetails');
  const container = document.getElementById('surahAyahsContainer');

  if (modalName) modalName.textContent = `سورة ${surahInfo.name}`;
  if (modalDetails) modalDetails.textContent = `${surahInfo.type} • ${surahInfo.ayahs} آية • الجزء ${surahInfo.juz}`;
  if (modal) modal.classList.remove('hidden');

  if (container) {
    container.innerHTML = `
      <div class="text-center py-12 text-amber-300">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
        <div class="text-xs">جاري تحميل الآيات الكريمة...</div>
      </div>
    `;
  }

  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/quran-uthmani`);
    const json = await res.json();
    if (json.code === 200 && json.data && json.data.ayahs) {
      renderAyahsText(json.data.ayahs, surahId !== 1 && surahId !== 9);
      return;
    }
  } catch (e) {
    console.warn('API error, loading fallback verses', e);
  }

  // Fallback offline text
  renderAyahsFallback(surahInfo);
}

function renderAyahsText(ayahs, showBasmala) {
  const container = document.getElementById('surahAyahsContainer');
  if (!container) return;

  let html = '';
  if (showBasmala) {
    html += `
      <div class="text-center py-3 my-2 text-amber-300 font-quran text-lg border-b border-amber-500/20">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>
    `;
  }

  html += `<div class="font-quran text-lg leading-[2.6] text-right text-slate-100 p-2">`;
  ayahs.forEach(a => {
    let text = a.text;
    if (showBasmala && a.numberInSurah === 1 && text.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')) {
      text = text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim();
    }
    html += `<span>${text}</span> <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono mx-1">﴿${a.numberInSurah}﴾</span> `;
  });
  html += `</div>`;

  container.innerHTML = html;
}

function renderAyahsFallback(info) {
  const container = document.getElementById('surahAyahsContainer');
  if (!container) return;
  container.innerHTML = `
    <div class="text-center p-6 space-y-3">
      <div class="text-amber-300 font-quran text-lg">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
      <p class="font-quran text-base leading-relaxed text-slate-200">
        قال الله تعالى في سورة ${info.name}: آيات بينات من الذكر الحكيم (عدد آياتها ${info.ayahs} آية، في الجزء ${info.juz}).
      </p>
      <div class="text-[11px] text-emerald-300 pt-4">يمكنك حفظ علامة القراءة في أي وقت بالضغط على أيقونة العلامة المرجعية بالأعلى.</div>
    </div>
  `;
}

function closeSurahModal() {
  const modal = document.getElementById('surahModal');
  if (modal) modal.classList.add('hidden');
}

function nextSurah() {
  const cur = appState.quran.currentSurah || 1;
  if (cur < 114) openSurah(cur + 1);
}

function prevSurah() {
  const cur = appState.quran.currentSurah || 1;
  if (cur > 1) openSurah(cur - 1);
}

function saveCurrentBookmark() {
  const cur = appState.quran.currentSurah || 1;
  const info = surahsMetadata.find(s => s.id === cur) || surahsMetadata[0];
  appState.quran.bookmark = {
    surah: cur,
    ayah: 1,
    surahName: `سورة ${info.name}`
  };
  saveState();
  updateBookmarkUI();
  alert(`تم حفظ العلامة المرجعية بنجاح في سورة ${info.name}!`);
}

function updateBookmarkUI() {
  const el = document.getElementById('bookmarkText');
  if (el && appState.quran.bookmark) {
    el.textContent = `${appState.quran.bookmark.surahName} - آية ${appState.quran.bookmark.ayah || 1}`;
  }
}

function goToBookmark() {
  const b = appState.quran.bookmark;
  if (b && b.surah) {
    openSurah(b.surah);
  } else {
    openSurah(1);
  }
}

// =========================================================================
// 8. Electronic Tasbeeh & Azkar Repository
// =========================================================================

const tasbeehPresets = [
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
  "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
  "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
  "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
  "سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَلَا إِلَٰهَ إِلَّا اللَّهُ ، وَاللَّهُ أَكْبَرُ",
  "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ"
];

function incrementTasbeeh() {
  appState.tasbeeh.count += 1;
  appState.tasbeeh.dailyTotal += 1;
  appState.achievements.tasbeeh = appState.tasbeeh.dailyTotal;
  saveState();

  const countEl = document.getElementById('tasbeehCount');
  const dailyEl = document.getElementById('tasbeehDailyTotal');
  if (countEl) countEl.textContent = appState.tasbeeh.count;
  if (dailyEl) dailyEl.textContent = `إجمالي اليوم: ${appState.tasbeeh.dailyTotal}`;

  // Vibration feedback if supported
  if (navigator.vibrate) {
    navigator.vibrate(30);
  }

  recalculateDashboard();
}

function resetTasbeeh() {
  appState.tasbeeh.count = 0;
  saveState();
  const countEl = document.getElementById('tasbeehCount');
  if (countEl) countEl.textContent = 0;
}

function nextZikrPreset() {
  appState.tasbeeh.currentPresetIdx = (appState.tasbeeh.currentPresetIdx + 1) % tasbeehPresets.length;
  saveState();
  const zikrEl = document.getElementById('currentZikrText');
  if (zikrEl) {
    zikrEl.textContent = tasbeehPresets[appState.tasbeeh.currentPresetIdx];
  }
}

const azkarData = {
  morning: [
    { title: "سيد الاستغفار", text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ..." },
    { title: "آية الكرسي", text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ..." },
    { title: "حماية النفس", text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ (3 مرات)" }
  ],
  evening: [
    { title: "أمسى وأمسى الملك لله", text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ..." },
    { title: "الاستعاذة من شر الخلق", text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ (3 مرات)" },
    { title: "الصلاة على النبي", text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ (10 مرات)" }
  ],
  after_prayer: [
    { title: "الاستغفار بعد السلام", text: "أَسْتَغْفِرُ اللَّهَ (3 مرات)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ" },
    { title: "التسبيح والتحميد والتكبير", text: "سُبْحَانَ اللَّهِ (33)، الْحَمْدُ لِلَّهِ (33)، اللَّهُ أَكْبَرُ (33)، وتَمام المائة: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ..." }
  ],
  ramadan_duas: [
    { title: "دعاء الإفطار المأثور", text: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ" },
    { title: "دعاء رؤية الهلال", text: "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالإِيمَانِ، وَالسَّلامَةِ وَالإِسْلامِ، رَبِّي وَرَبُّكَ اللَّهُ" },
    { title: "دعاء ليلة القدر", text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي" }
  ]
};

function loadAzkarCategory(cat) {
  const container = document.getElementById('azkarItemsList');
  if (!container || !azkarData[cat]) return;

  container.innerHTML = azkarData[cat].map(item => `
    <div class="p-3 rounded-2xl bg-[#061e19] border border-amber-500/20 text-right space-y-1">
      <div class="text-xs font-bold text-amber-300">${item.title}</div>
      <p class="text-xs text-slate-200 leading-relaxed font-quran">${item.text}</p>
    </div>
  `).join('');
}

// =========================================================================
// 9. App Initialization
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
  updateLiveDates();
  updateRamadanCountdown();
  renderPrayerTimes();
  recalculateDashboard();
  renderFastingChallenge();
  renderKhatmahPlanner();
  renderSurahsList();
  updateBookmarkUI();
  loadAzkarCategory('morning');

  // Next zikr initialization
  const zikrEl = document.getElementById('currentZikrText');
  if (zikrEl) {
    zikrEl.textContent = tasbeehPresets[appState.tasbeeh.currentPresetIdx || 0];
  }
  const tasbeehCountEl = document.getElementById('tasbeehCount');
  if (tasbeehCountEl) tasbeehCountEl.textContent = appState.tasbeeh.count || 150;

  // Real-time ticking loops
  setInterval(updateRamadanCountdown, 1000);
  setInterval(renderPrayerTimes, 60000);

  // Service Worker for Offline PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.log('SW registration skipped:', err);
    });
  }
});
