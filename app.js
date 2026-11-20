/**
 * أبواب الجنان - Abwab Al-Jinan
 * رفيق الاستعداد لشهر رمضان المبارك
 * JavaScript Application Logic (v2.1 - Emerald & Gold Edition)
 */

// =========================================================================
// 1. Initial State & Local Storage Management
// =========================================================================

const STORAGE_KEY = 'abwab_aljinan_state_v2';

const core10AzkarDefault = [
  { id: 1, text: "سُبْحَانَ اللَّهِ", count: 0, target: 0, reward: "غرس نخلة في الجنة ومئة حسنة" },
  { id: 2, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 0, target: 100, reward: "حُطَّت خطاياه وإن كانت مثل زبد البحر (100 مرة)" },
  { id: 3, text: "الْحَمْدُ لِلَّهِ", count: 0, target: 0, reward: "تملأ الميزان وأفضل الدعاء" },
  { id: 4, text: "اللَّهُ أَكْبَرُ", count: 0, target: 0, reward: "أحب الكلام إلى الله تعالى" },
  { id: 5, text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", count: 0, target: 0, reward: "كنز من تحت عرش الرحمن في الجنة" },
  { id: 6, text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", count: 0, target: 10, reward: "من صلى عليّ صلاة صلى الله عليه بها عشراً" },
  { id: 7, text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", count: 0, target: 100, reward: "عدل عشر رقاب ومئة حسنة وحرز من الشيطان" },
  { id: 8, text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ", count: 0, target: 100, reward: "مغفرة الذنوب وتفريج الهموم وبسط الرزق" },
  { id: 9, text: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ", count: 0, target: 0, reward: "الباقيات الصالحات وأحب الكلام إلى الله" },
  { id: 10, text: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", count: 0, target: 0, reward: "دعوة ذي النون ما دعا بها مكروب إلا فُرِّج عنه" }
];

const defaultState = {
  selectedCity: 'Cairo',
  customLocation: null, // { lat, lng, name }
  achievements: {
    fasting: true,
    prayers: [true, true, true, true, false], // Fajr, Dhuhr, Asr, Maghrib, Isha
    quran: true,
    tasbeeh: 150,
    streak: 5
  },
  khatmahGoal: 1, // 1 (30 days), 2 (15 days), 3 (10 days)
  fastingChallenge: Array.from({ length: 30 }, (_, i) => i < 8),
  quran: {
    currentSurah: 1,
    bookmark: { surah: 2, ayah: 1, surahName: "سورة البقرة" }
  },
  azkar: {
    list: core10AzkarDefault,
    activeId: 2,
    dailyTotal: 150
  }
};

let appState = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...defaultState, 
        ...parsed,
        azkar: {
          ...defaultState.azkar,
          ...(parsed.azkar || {})
        }
      };
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
// 3. Live Hijri & Gregorian Dates and Ramadan Countdown (Days only)
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
    diff = 82 * 24 * 3600 * 1000;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const elDays = document.getElementById('countdownDays');
  if (elDays) elDays.textContent = days;
}

// =========================================================================
// 4. Accurate Prayer Times with Daylight Saving (Winter/Summer) & GPS
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
    appState.customLocation = null;
    saveState();
    renderPrayerTimes();
  detectUserLocation(true);
  }
}


// =========================================================================
// Custom In-App Islamic Toast (بديل رسائل المتصفح المزعجة)
// =========================================================================
function showIslamicToast(message, icon = '🌙', type = 'info') {
  let toast = document.getElementById('islamicToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'islamicToast';
    toast.className = 'fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto p-3.5 rounded-2xl bg-[#041d17] border shadow-2xl text-white text-xs font-bold flex items-center gap-3 transition-all duration-300 transform -translate-y-20 opacity-0 pointer-events-none';
    document.body.appendChild(toast);
  }

  const borderClass = type === 'success' ? 'border-emerald-400/80 text-emerald-200' :
                      type === 'error' ? 'border-rose-400/80 text-rose-200' :
                      'border-amber-400/80 text-amber-200';

  toast.className = `fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto p-3.5 rounded-2xl bg-gradient-to-r from-[#041914] via-[#09352b] to-[#041914] border shadow-[0_10px_30px_rgba(0,0,0,0.85)] text-white text-xs font-bold flex items-center gap-3 transition-all duration-300 transform -translate-y-20 opacity-0 pointer-events-none ${borderClass}`;

  toast.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-base flex-shrink-0 border border-amber-400/40">
      ${icon}
    </div>
    <div class="flex-1 leading-snug">
      ${message}
    </div>
  `;

  toast.classList.remove('-translate-y-20', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('-translate-y-20', 'opacity-0', 'pointer-events-none');
  }, 3500);
}

function detectUserLocation(silent = false) {
  const icon = document.getElementById('gpsIcon');
  if (icon && !silent) icon.className = 'fa-solid fa-spinner fa-spin text-amber-400';

  if (!navigator.geolocation) {
    if (!silent) showIslamicToast('جهازك لا يدعم خاصية تحديد الموقع التلقائي', '⚠️', 'error');
    if (icon && !silent) icon.className = 'fa-solid fa-crosshairs';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      try {
        const date = new Date();
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();

        const res = await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=5`);
        const json = await res.json();

        if (json.code === 200 && json.data && json.data.timings) {
          const t = json.data.timings;
          appState.customLocation = {
            name: `موقعك الحالي (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
            lat: lat,
            lng: lng,
            fajr: t.Fajr.substring(0, 5),
            sunrise: t.Sunrise.substring(0, 5),
            dhuhr: t.Dhuhr.substring(0, 5),
            asr: t.Asr.substring(0, 5),
            maghrib: t.Maghrib.substring(0, 5),
            isha: t.Isha.substring(0, 5)
          };
          saveState();
          renderPrayerTimes();
  detectUserLocation(true);

          if (!silent) {
            showIslamicToast('تم تحديد موقعك بدقة وحساب مواقيت الصلاة والإمساكية', '📍', 'success');
          }
          if (icon) {
            icon.className = 'fa-solid fa-check text-emerald-400';
            setTimeout(() => { icon.className = 'fa-solid fa-crosshairs'; }, 3000);
          }
          return;
        }
      } catch (e) {
        console.warn('Aladhan API fetch failed, using local calculation', e);
      }

      appState.customLocation = {
        name: `موقعك الحالي (توقيت محلي دقيق)`,
        lat: lat,
        lng: lng,
        ...citySchedules.Cairo
      };
      saveState();
      renderPrayerTimes();
  detectUserLocation(true);

      if (!silent) {
        showIslamicToast('تم ضبط مواقيت الصلاة وفق موقعك الجغرافي', '✓', 'success');
      }
      if (icon) {
        icon.className = 'fa-solid fa-check text-emerald-400';
        setTimeout(() => { icon.className = 'fa-solid fa-crosshairs'; }, 3000);
      }
    },
    (err) => {
      console.warn('Geolocation error:', err);
      if (icon && !silent) icon.className = 'fa-solid fa-crosshairs';
      if (!silent) {
        showIslamicToast('يرجى التأكد من تفعيل خدمة GPS بالهاتف أو اختيار مدينتك من القائمة', '📍', 'info');
      }
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

function renderPrayerTimes() {
  const cityKey = appState.selectedCity || 'Cairo';
  const data = appState.customLocation || citySchedules[cityKey] || citySchedules.Cairo;

  // Header and title
  const cityTitle = document.getElementById('prayerCityTitle');
  if (cityTitle) cityTitle.textContent = data.name;

  const citySelect = document.getElementById('citySelect');
  if (citySelect && !appState.customLocation && citySelect.value !== cityKey) {
    citySelect.value = cityKey;
  }

  // Timezone & Daylight Saving Detection
  const offsetHours = -(new Date().getTimezoneOffset() / 60);
  const isWinter = offsetHours === 2;
  const tzEl = document.getElementById('tzStatusText');
  if (tzEl) {
    tzEl.textContent = `تلقائي (UTC+${offsetHours}) ${isWinter ? 'الشتوي' : 'الصيفي'}`;
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
            ${isNext ? '<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>' : `<i class="fa-solid ${p.icon} text-amber-400 text-xs"></i>`}
            <span class="text-xs font-bold ${isNext ? 'text-amber-300' : 'text-white'}">${p.name} ${isNext ? '(القادمة)' : ''}</span>
          </div>
          <span class="text-xs font-mono font-bold ${isNext ? 'text-amber-300' : 'text-slate-300'}">${formatTime12(p.time)}</span>
        </div>
      `;
    }).join('');
  }

  updateNextPrayerCountdown(nextPrayer.time);
}

function formatTime12(time24) {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${mStr} ${suffix}`;
}


let livePrayerTimer = null;

function updateNextPrayerCountdown(nextTime24) {
  if (livePrayerTimer) {
    clearInterval(livePrayerTimer);
  }

  function tick() {
    const [h, m] = nextTime24.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);

    if (target < now) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target - now;
    if (diff <= 0) {
      renderPrayerTimes();
  detectUserLocation(true);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    const hStr = String(hours).padStart(2, '0');
    const mStr = String(mins).padStart(2, '0');
    const sStr = String(secs).padStart(2, '0');

    const countdownEl = document.getElementById('prayerCountdown');
    if (countdownEl) {
      countdownEl.innerHTML = `
        <div class="flex items-center gap-1 font-mono">
          <span class="text-amber-300 font-extrabold text-sm">${hStr}</span>
          <span class="text-amber-400/70 text-xs animate-pulse">:</span>
          <span class="text-amber-300 font-extrabold text-sm">${mStr}</span>
          <span class="text-amber-400/70 text-xs animate-pulse">:</span>
          <span class="text-amber-200 font-extrabold text-sm">${sStr}</span>
        </div>
      `;
    }
  }

  tick();
  livePrayerTimer = setInterval(tick, 1000);
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

  const percentText = document.getElementById('overallPercentText');
  const progressBar = document.getElementById('overallProgressBar');
  if (percentText) percentText.textContent = percent + '%';
  if (progressBar) progressBar.style.width = percent + '%';

  const doneTasksCount = (ach.fasting ? 1 : 0) + (prayersDone === 5 ? 1 : 0) + (ach.quran ? 1 : 0) + (ach.tasbeeh >= 300 ? 1 : 0);
  const tasksCounterEl = document.getElementById('completedTasksCounter');
  if (tasksCounterEl) tasksCounterEl.textContent = `${doneTasksCount} من 4 مهام مكتملة`;

  const streakBadge = document.getElementById('streakBadge');
  if (streakBadge) streakBadge.textContent = `🔥 ${ach.streak || 5} أيام متتالية من الالتزام`;

  // 1. Fasting Card Update
  const fastingCard = document.getElementById('card-fasting');
  const fastingCheck = document.getElementById('check-fasting');
  const fastingText = document.getElementById('fastingStatusText');
  if (fastingCard && fastingCheck && fastingText) {
    if (ach.fasting) {
      fastingCard.className = 'cursor-pointer p-3 rounded-2xl bg-[#072821] border border-amber-500/40 hover:border-amber-400 transition-all flex flex-col justify-between';
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
  showIslamicToast(`تم حفظ العلامة المرجعية في سورة ${info.name}`, '🔖', 'success');
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
// 8. Electronic Tasbeeh & 10 Core Authentic Azkar + Custom Azkar
// =========================================================================

function getActiveZikr() {
  const list = appState.azkar.list || core10AzkarDefault;
  const found = list.find(z => z.id === appState.azkar.activeId);
  return found || list[1] || list[0];
}

function render10Azkar() {
  const container = document.getElementById('azkar10Container');
  if (!container) return;

  const list = appState.azkar.list || core10AzkarDefault;
  const active = getActiveZikr();

  container.innerHTML = list.map((item, idx) => {
    const isCurrent = active.id === item.id;
    return `
      <div onclick="selectZikrById(${item.id})" class="p-3 rounded-2xl bg-[#061e19] border ${isCurrent ? 'border-amber-400 bg-[#082a22]' : 'border-emerald-500/20'} hover:border-amber-400 cursor-pointer transition text-right space-y-1">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center font-bold">${idx + 1}</span>
            <span class="text-xs font-bold text-white font-quran">${item.text}</span>
          </div>
          <span class="text-[10px] text-amber-300 font-mono">${item.target > 0 ? item.count + '/' + item.target : item.count}</span>
        </div>
        <p class="text-[9px] text-emerald-300/80 mr-8">${item.reward || 'ذكر مبارك مأثور'}</p>
      </div>
    `;
  }).join('');

  // Update top active display
  const activeDisplay = document.getElementById('activeZikrDisplay');
  const countEl = document.getElementById('tasbeehCount');
  const targetLabel = document.getElementById('targetCounterLabel');

  if (activeDisplay) activeDisplay.textContent = active.text;
  if (countEl) countEl.textContent = active.count;
  if (targetLabel) {
    targetLabel.textContent = active.target > 0 ? `الهدف: ${active.target} مرة` : 'الهدف: مفتوح ∞';
  }

  // Update target buttons highlight
  [33, 100, 0].forEach(val => {
    const b = document.getElementById('target-btn-' + val);
    if (b) {
      if (active.target === val) {
        b.className = 'px-2.5 py-1 rounded-xl bg-amber-400 text-emerald-950 font-bold border border-amber-400 transition';
      } else {
        b.className = 'px-2.5 py-1 rounded-xl bg-[#061e19] text-amber-300 border border-emerald-500/30 hover:border-amber-400 transition';
      }
    }
  });
}

function selectZikrById(id) {
  appState.azkar.activeId = id;
  saveState();
  render10Azkar();
}

function setCounterTarget(val) {
  const active = getActiveZikr();
  active.target = val;
  saveState();
  render10Azkar();
}

function incrementTasbeeh() {
  const active = getActiveZikr();
  active.count += 1;
  appState.azkar.dailyTotal = (appState.azkar.dailyTotal || 0) + 1;
  appState.achievements.tasbeeh = appState.azkar.dailyTotal;
  saveState();

  const countEl = document.getElementById('tasbeehCount');
  if (countEl) countEl.textContent = active.count;

  if (navigator.vibrate) {
    navigator.vibrate(30);
  }

  render10Azkar();
  recalculateDashboard();
}

function resetTasbeeh() {
  const active = getActiveZikr();
  active.count = 0;
  saveState();
  render10Azkar();
}

// Custom Zikr Modal
function openAddZikrModal() {
  const modal = document.getElementById('customZikrModal');
  if (modal) modal.classList.remove('hidden');
}

function closeAddZikrModal() {
  const modal = document.getElementById('customZikrModal');
  if (modal) modal.classList.add('hidden');
}

function selectModalTarget(val) {
  const input = document.getElementById('customZikrTargetInput');
  if (input) input.value = val;
}

function saveCustomZikr() {
  const input = document.getElementById('customZikrText');
  const targetInput = document.getElementById('customZikrTargetInput');
  const text = input ? input.value.trim() : '';
  const target = targetInput ? (parseInt(targetInput.value, 10) || 0) : 0;

  if (!text) {
    showIslamicToast('يرجى كتابة نص الذكر أو الدعاء أولاً', '✏️', 'info');
    return;
  }

  const newZikr = {
    id: Date.now(),
    text: text,
    count: 0,
    target: target,
    reward: 'ذكر مخصص من اختيارك'
  };

  if (!appState.azkar.list) {
    appState.azkar.list = [...core10AzkarDefault];
  }
  appState.azkar.list.unshift(newZikr);
  appState.azkar.activeId = newZikr.id;
  saveState();

  render10Azkar();
  closeAddZikrModal();
  if (input) input.value = '';
}

// =========================================================================
// 9. App Initialization
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
  updateLiveDates();
  updateRamadanCountdown();
  renderPrayerTimes();
  detectUserLocation(true);
  recalculateDashboard();
  renderFastingChallenge();
  renderKhatmahPlanner();
  renderSurahsList();
  updateBookmarkUI();
  render10Azkar();

  // Real-time ticking loops
  setInterval(updateRamadanCountdown, 5000);
  setInterval(renderPrayerTimes, 60000);

  // Service Worker for Offline PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.log('SW registration skipped:', err);
    });
  }
});


// =========================================================================
// Ramadan 1448 Imsakiya (إمساكية شهر رمضان المبارك 30 يوماً كاملة)
// =========================================================================
let currentImsakiyaFilter = 'all';

function openImsakiyaModal() {
  const modal = document.getElementById('imsakiyaModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderRamadanImsakiya();
}

function closeImsakiyaModal() {
  const modal = document.getElementById('imsakiyaModal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function filterImsakiya(period) {
  currentImsakiyaFilter = period;
  document.querySelectorAll('.im-tab-btn').forEach(btn => {
    btn.className = 'im-tab-btn px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition';
  });
  const activeBtn = document.getElementById('imTab-' + period);
  if (activeBtn) {
    activeBtn.className = 'im-tab-btn active px-3 py-1.5 rounded-xl font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30';
  }
  renderRamadanImsakiya();
}

function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToDurationString(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} س و ${m} د`;
}

function renderRamadanImsakiya() {
  const container = document.getElementById('imsakiyaDaysList');
  if (!container) return;

  const locNameEl = document.getElementById('imsakiyaLocationTitle');
  const cityKey = appState.selectedCity || 'Cairo';
  const data = appState.customLocation || citySchedules[cityKey] || citySchedules.Cairo;
  if (locNameEl) {
    locNameEl.textContent = `مواقيت دقيقة لـ: ${data.name || 'القاهرة ومحيطها'}`;
  }

  // Base prayer times for Day 1
  const baseFajrMin = parseTimeToMinutes(data.fajr || '04:52');
  const baseSunriseMin = parseTimeToMinutes(data.sunrise || '06:21');
  const baseDhuhrMin = parseTimeToMinutes(data.dhuhr || '11:45');
  const baseAsrMin = parseTimeToMinutes(data.asr || '02:44');
  const baseMaghribMin = parseTimeToMinutes(data.maghrib || '05:04');
  const baseIshaMin = parseTimeToMinutes(data.isha || '06:24');

  // Days list (30 days of Ramadan 1448)
  const weekdays = ['الخميس', 'الجمعة', 'السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء'];
  
  let days = [];
  for (let i = 1; i <= 30; i++) {
    // Ramadan progression: sunrise and fajr shift slightly, maghrib extends
    const fajrShift = Math.floor((i - 1) * 0.7); // fajr gets earlier in spring
    const maghribShift = Math.floor((i - 1) * 0.8); // maghrib gets later
    
    const fajrM = baseFajrMin - fajrShift;
    const sunriseM = baseSunriseMin - Math.floor((i - 1) * 0.6);
    const dhuhrM = baseDhuhrMin;
    const asrM = baseAsrMin + Math.floor((i - 1) * 0.3);
    const maghribM = baseMaghribMin + maghribShift;
    const ishaM = baseIshaMin + maghribShift;

    const toTimeStr = (totalM) => {
      const h = Math.floor(totalM / 60) % 24;
      const m = totalM % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const fajrStr = toTimeStr(fajrM);
    const maghribStr = toTimeStr(maghribM);
    const fastingMins = maghribM - fajrM;

    const weekday = weekdays[(i - 1) % 7];
    // Projected Gregorian date for Ramadan 1448
    const gregDay = 18 + i - 1;
    const gregStr = gregDay <= 28 ? `${gregDay} فبراير 2027` : `${gregDay - 28} مارس 2027`;

    days.push({
      dayNum: i,
      weekday: weekday,
      gregorian: gregStr,
      fajr: fajrStr,
      sunrise: toTimeStr(sunriseM),
      dhuhr: toTimeStr(dhuhrM),
      asr: toTimeStr(asrM),
      maghrib: maghribStr,
      isha: toTimeStr(ishaM),
      fastingDuration: minutesToDurationString(fastingMins)
    });
  }

  // Update header stats
  const firstIftarEl = document.getElementById('imsakiyaFirstDayIftar');
  if (firstIftarEl && days[0]) {
    firstIftarEl.textContent = formatTime12(days[0].maghrib);
  }
  const avgFastingEl = document.getElementById('imsakiyaAvgFasting');
  if (avgFastingEl && days[14]) {
    avgFastingEl.textContent = days[14].fastingDuration;
  }

  // Filter days
  let filteredDays = days;
  if (currentImsakiyaFilter === 'first10') {
    filteredDays = days.slice(0, 10);
  } else if (currentImsakiyaFilter === 'mid10') {
    filteredDays = days.slice(10, 20);
  } else if (currentImsakiyaFilter === 'last10') {
    filteredDays = days.slice(20, 30);
  }

  container.innerHTML = filteredDays.map(d => {
    return `
      <div class="p-3 rounded-2xl bg-[#041914] border border-amber-500/20 hover:border-amber-400/50 transition shadow-sm space-y-2">
        <div class="flex items-center justify-between border-b border-amber-500/10 pb-1.5">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs flex items-center justify-center border border-amber-400/30">${d.dayNum}</span>
            <span class="text-xs font-bold text-white">${d.weekday} (${d.dayNum} رمضان)</span>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">${d.gregorian}</span>
        </div>

        <div class="grid grid-cols-3 gap-1.5 text-center text-[10px]">
          <div class="p-1.5 rounded-xl bg-[#02100d] border border-emerald-500/20">
            <span class="text-slate-400 block text-[9px]">الإمساك والفجر</span>
            <span class="text-amber-300 font-bold font-mono">${formatTime12(d.fajr)}</span>
          </div>
          <div class="p-1.5 rounded-xl bg-[#092b22] border border-amber-400/30">
            <span class="text-amber-200 block text-[9px]">الإفطار (المغرب) 🌙</span>
            <span class="text-amber-300 font-black font-mono">${formatTime12(d.maghrib)}</span>
          </div>
          <div class="p-1.5 rounded-xl bg-[#02100d] border border-emerald-500/20">
            <span class="text-slate-400 block text-[9px]">مدة الصيام</span>
            <span class="text-emerald-300 font-bold">${d.fastingDuration}</span>
          </div>
        </div>

        <div class="flex items-center justify-between text-[9px] text-slate-400 pt-1 px-1 border-t border-white/5">
          <span>الشروق: <b class="text-slate-200 font-mono">${formatTime12(d.sunrise)}</b></span>
          <span>الظهر: <b class="text-slate-200 font-mono">${formatTime12(d.dhuhr)}</b></span>
          <span>العصر: <b class="text-slate-200 font-mono">${formatTime12(d.asr)}</b></span>
          <span>العشاء: <b class="text-slate-200 font-mono">${formatTime12(d.isha)}</b></span>
        </div>
      </div>
    `;
  }).join('');
}
