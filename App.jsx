import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Scissors,
  MapPin,
  Clock,
  Phone,
  Calendar,
  Check,
  ChevronRight,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Upload,
  LogOut,
  Lock,
  Navigation,
  ArrowUpRight,
  Bell,
  CalendarDays,
  X,
  Send,
  Loader2,
  CheckCircle2,
  DollarSign,
  RotateCcw,
  Briefcase,
  Image as ImageIcon
} from 'lucide-react';

// =========================================================================
// ПОДКЛЮЧЕНИЕ ОБЛАЧНОЙ БАЗЫ SUPABASE (РАБОТАЕТ АВТОМАТИЧЕСКИ ПОСЛЕ ДЕПЛОЯ)
// =========================================================================
function getEnvVar(key) {
  try {
    if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
      return window.__ENV__[key];
    }
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {}
  return '';
}

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');
const isCloudEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

async function supabaseRequest(path, options = {}) {
  if (!isCloudEnabled) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: options.prefer || 'return=representation',
        ...(options.headers || {})
      }
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : true;
  } catch {
    return null;
  }
}

async function supabaseOwnerSignIn(email, password) {
  if (!isCloudEnabled) {
    return { ok: Boolean(email.trim() && password.trim()), mode: 'local' };
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error_description || data.msg || 'Неверная почта или пароль' };
    }
    return { ok: true, mode: 'cloud', user: data.user };
  } catch {
    return { ok: false, error: 'Ошибка соединения с сервером авторизации' };
  }
}

// Умный ИИ-ассистент через Gemini API с резервным офлайн-ответом
async function askSmartStudioAI({ systemPrompt, messages }) {
  const apiKey = getEnvVar('VITE_GEMINI_API_KEY');
  if (!apiKey) return null;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.text || '') }]
  }));

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return null;
    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : null;
  } catch {
    return null;
  }
}

function getRouteLinks(address) {
  const encoded = encodeURIComponent(address || '');
  return {
    yandex: `https://yandex.ru/maps/?rtext=~${encoded}&rtt=auto`,
    google: `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
    dgis: `https://2gis.ru/search/${encoded}`
  };
}

const TOOLS_HERO_BANNER = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" width="100%" height="100%">
  <defs>
    <radialGradient id="leather" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#1c1e24"/>
      <stop offset="55%" stop-color="#111317"/>
      <stop offset="100%" stop-color="#090a0c"/>
    </radialGradient>
    <linearGradient id="gunmetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3a3d45"/>
      <stop offset="50%" stop-color="#1c1e22"/>
      <stop offset="100%" stop-color="#0f1013"/>
    </linearGradient>
    <linearGradient id="chrome" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="50%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f7e5a9"/>
      <stop offset="45%" stop-color="#d4af37"/>
      <stop offset="80%" stop-color="#9a7b1c"/>
      <stop offset="100%" stop-color="#f3dc90"/>
    </linearGradient>
    <filter id="sh" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#000" flood-opacity="0.75"/>
    </filter>
  </defs>
  <rect width="1200" height="760" fill="url(#leather)"/>
  <g filter="url(#sh)" opacity="0.85">
    <ellipse cx="220" cy="70" rx="115" ry="68" fill="#17191e" stroke="#2b2e35" stroke-width="2"/>
    <ellipse cx="540" cy="85" rx="125" ry="75" fill="#15171c" stroke="#2b2e35" stroke-width="2"/>
    <ellipse cx="880" cy="80" rx="125" ry="75" fill="#15171c" stroke="#2b2e35" stroke-width="2"/>
  </g>
  <g transform="translate(80, 150) rotate(12)" filter="url(#sh)">
    <rect x="0" y="0" width="175" height="265" rx="22" fill="url(#gunmetal)" stroke="#383b42" stroke-width="2"/>
    <line x1="0" y1="95" x2="175" y2="95" stroke="#0d0e11" stroke-width="3"/>
    <ellipse cx="87" cy="128" rx="18" ry="34" fill="#252830" stroke="#474b55" stroke-width="1.5"/>
    <text x="87" y="232" fill="#7c828d" font-family="sans-serif" font-size="13" font-weight="700" text-anchor="middle" letter-spacing="1">BaBylissPRO</text>
  </g>
  <g transform="translate(365, 130) rotate(17)" filter="url(#sh)">
    <rect x="28" y="-34" width="96" height="40" rx="4" fill="url(#chrome)"/>
    <path d="M18,0 L134,0 L118,325 C115,355 37,355 34,325 Z" fill="url(#gunmetal)" stroke="#3f434c" stroke-width="2"/>
    <path d="M56,120 L96,120 L88,332 L64,332 Z" fill="url(#chrome)" opacity="0.35"/>
    <text x="76" y="88" fill="#cbd5e1" font-family="sans-serif" font-size="22" font-weight="800" text-anchor="middle" letter-spacing="3">JRL</text>
  </g>
  <g transform="translate(575, 180) rotate(19)" filter="url(#sh)">
    <rect x="24" y="-28" width="76" height="32" rx="4" fill="url(#chrome)"/>
    <path d="M18,0 L106,0 L94,270 C90,295 34,295 30,270 Z" fill="url(#gunmetal)" stroke="#3f434c" stroke-width="2"/>
    <text x="62" y="78" fill="#cbd5e1" font-family="sans-serif" font-size="18" font-weight="800" text-anchor="middle" letter-spacing="2">JRL</text>
  </g>
  <g transform="translate(770, 195) rotate(19)" filter="url(#sh)">
    <rect x="22" y="-30" width="90" height="34" rx="4" fill="url(#chrome)"/>
    <rect x="12" y="0" width="110" height="295" rx="36" fill="url(#gunmetal)" stroke="#3a3d45" stroke-width="2"/>
    <circle cx="67" cy="78" r="34" fill="#101215" stroke="#d4af37" stroke-width="2" opacity="0.85"/>
    <circle cx="67" cy="162" r="18" fill="#272a30" stroke="#94a3b8" stroke-width="2"/>
  </g>
  <g transform="translate(955, 235) rotate(19)" filter="url(#sh)">
    <rect x="24" y="-26" width="76" height="28" rx="3" fill="url(#chrome)"/>
    <path d="M14,0 L110,0 L98,275 C94,298 30,298 26,275 Z" fill="#131519" stroke="#383c44" stroke-width="2"/>
    <text x="62" y="55" fill="#e2e8f0" font-family="sans-serif" font-size="15" font-weight="700" text-anchor="middle" letter-spacing="4">SABER</text>
    <circle cx="62" cy="102" r="22" fill="#1c2026" stroke="#38bdf8" stroke-width="1.5" opacity="0.8"/>
    <text x="62" y="238" fill="#e2e8f0" font-family="sans-serif" font-size="18" font-weight="800" text-anchor="middle" letter-spacing="2">S|C</text>
  </g>
  <g transform="translate(55, 430) rotate(-28)" filter="url(#sh)">
    <rect x="0" y="0" width="132" height="215" rx="16" fill="#141619" stroke="#32363e" stroke-width="2"/>
    <line x1="0" y1="48" x2="132" y2="48" stroke="#d4af37" stroke-width="2"/>
    <rect x="31" y="74" width="70" height="78" rx="6" fill="url(#gold)"/>
    <text x="66" y="118" fill="#111317" font-family="sans-serif" font-size="15" font-weight="900" text-anchor="middle" letter-spacing="1">WAHL</text>
  </g>
  <g transform="translate(520, 560) rotate(-38)" filter="url(#sh)">
    <path d="M0,-6 L265,-22 L265,-4 Z" fill="url(#gold)"/>
    <path d="M0,6 L265,22 L265,4 Z" fill="url(#gold)"/>
    <circle cx="15" cy="0" r="13" fill="#dc2626" stroke="url(#gold)" stroke-width="3.5"/>
    <ellipse cx="-95" cy="-34" rx="40" ry="27" fill="none" stroke="url(#gold)" stroke-width="11"/>
    <ellipse cx="-95" cy="34" rx="40" ry="27" fill="none" stroke="url(#gold)" stroke-width="11"/>
    <path d="M-55,-20 L0,-3 M-55,20 L0,3" stroke="url(#gold)" stroke-width="11" stroke-linecap="round"/>
  </g>
  <g transform="translate(760, 595) rotate(-36)" filter="url(#sh)">
    <path d="M0,-5 L250,-18 L250,-3 Z" fill="url(#chrome)"/>
    <path d="M0,5 L250,18 L250,3 Z" fill="url(#chrome)"/>
    <circle cx="14" cy="0" r="11" fill="#1e293b" stroke="url(#chrome)" stroke-width="3"/>
    <ellipse cx="-90" cy="-32" rx="38" ry="25" fill="none" stroke="url(#chrome)" stroke-width="10"/>
    <ellipse cx="-90" cy="32" rx="38" ry="25" fill="none" stroke="url(#chrome)" stroke-width="10"/>
    <path d="M-52,-18 L0,-3 M-52,18 L0,3" stroke="url(#chrome)" stroke-width="10" stroke-linecap="round"/>
  </g>
</svg>
`);

const THEME_PRESETS = [
  {
    id: 'leather-gold',
    name: 'Чёрная кожа и латунь',
    bg: '#0f1012',
    surface: '#16171a',
    accent: '#c5a880',
    accentText: '#0f1012',
    textMain: '#f4f4f5',
    textMuted: '#a1a1aa'
  },
  {
    id: 'emerald-wood',
    name: 'Изумруд и тёплое золото',
    bg: '#0b1411',
    surface: '#111f1a',
    accent: '#d4af37',
    accentText: '#0b1411',
    textMain: '#f4f4f5',
    textMuted: '#9ca3af'
  },
  {
    id: 'steel-chrome',
    name: 'Оружейная сталь и хром',
    bg: '#0c0d10',
    surface: '#14161b',
    accent: '#94a3b8',
    accentText: '#0c0d10',
    textMain: '#f8fafc',
    textMuted: '#94a3b8'
  },
  {
    id: 'bronze-espresso',
    name: 'Эспрессо и медь',
    bg: '#120e0c',
    surface: '#1b1512',
    accent: '#d98a5f',
    accentText: '#120e0c',
    textMain: '#faf5f2',
    textMuted: '#a89f9a'
  },
  {
    id: 'light-atelier',
    name: 'Светлое ателье',
    bg: '#f5f3ef',
    surface: '#ffffff',
    accent: '#18181b',
    accentText: '#ffffff',
    textMain: '#18181b',
    textMuted: '#52525b'
  }
];

function createDefaultStudioConfig(slug) {
  const formattedName =
    slug === 'kultura'
      ? 'KULTURA'
      : slug === 'forma'
      ? 'FORMA ATELIER'
      : slug.replace(/[-_]/g, ' ').toUpperCase();

  return {
    id: `tenant-${slug}`,
    slug,
    name: formattedName,
    subtitle: 'Парикмахерская и студия стиля',
    tagline: 'Точные стрижки, уход и выверенный сервис в спокойной атмосфере.',
    address: 'Укажите адрес студии в кабинете владельца',
    phone: '+7 (999) 000-00-00',
    heroImage: TOOLS_HERO_BANNER,
    heroOverlay: 55,
    heroButtonText: 'Записаться',
    theme: THEME_PRESETS[0],
    workHours: { start: '10:00', end: '22:00' },
    daysOff: ['Без выходных'],
    highlights: [
      { id: 'h1', title: 'Японская сталь и точность', desc: 'Работаем профессиональным инструментом ручной заточки.' },
      { id: 'h2', title: 'Стерильность 100%', desc: 'Четырёхступенчатая очистка и крафт-пакеты вскрываются при вас.' },
      { id: 'h3', title: 'Комфорт и сервис', desc: 'Свежесваренный кофе и запись строго по времени без ожидания.' }
    ],
    services: [
      { id: 's1', name: 'Мужская стрижка', price: 2800, duration: 60, category: 'Стрижки' },
      { id: 's2', name: 'Стрижка машинкой (Fade)', price: 2000, duration: 45, category: 'Стрижки' },
      { id: 's3', name: 'Моделирование бороды', price: 1800, duration: 45, category: 'Борода' },
      { id: 's4', name: 'Комплекс: Стрижка + Борода', price: 4000, duration: 90, category: 'Комплексы' }
    ],
    staff: [
      {
        id: 'm1',
        name: 'Александр Воронов',
        role: 'Топ-мастер',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=75'
      },
      {
        id: 'm2',
        name: 'Даниил Краснов',
        role: 'Старший барбер',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=75'
      }
    ],
    portfolio: [
      {
        id: 'p1',
        url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=75',
        caption: 'Текстурный кроп и низкий фейд'
      },
      {
        id: 'p2',
        url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=75',
        caption: 'Классическая форма и контуринг бороды'
      },
      {
        id: 'p3',
        url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=75',
        caption: 'Удлинённая стрижка ножницами'
      }
    ]
  };
}

function getNextDays(count = 7) {
  const days = [];
  const names = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push({
      iso: `${yyyy}-${mm}-${dd}`,
      dayName: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : names[d.getDay()],
      dayNum: d.getDate(),
      month: months[d.getMonth()]
    });
  }
  return days;
}

function timeToMinutes(t) {
  const [h, m] = (t || '10:00').split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function App() {
  const daysList = useMemo(() => getNextDays(7), []);

  // Автоматическое определение салона из ссылки (?studio=имя_салона)
  const studioSlug = useMemo(() => {
    if (typeof window === 'undefined') return 'kultura';
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get('studio') || 'kultura').trim().toLowerCase();
    return raw.replace(/[^a-z0-9-_]/g, '') || 'kultura';
  }, []);

  const [currentTenant, setCurrentTenant] = useState(() => {
    if (typeof window !== 'undefined' && !isCloudEnabled) {
      const saved = localStorage.getItem(`studio_config_${studioSlug}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return createDefaultStudioConfig(studioSlug);
  });

  // Обновление заголовка вкладки и PWA-названия под конкретный салон
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${currentTenant.name} — Онлайн-запись`;
    }
  }, [currentTenant.name]);

  // Функция сохранения настроек салона (в Supabase или локально)
  const persistTenantConfig = async (updatedConfig) => {
    setCurrentTenant(updatedConfig);
    if (isCloudEnabled) {
      await supabaseRequest(`studios?slug=eq.${studioSlug}`, {
        method: 'PATCH',
        body: JSON.stringify({ config: updatedConfig, updated_at: new Date().toISOString() })
      });
    } else if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`studio_config_${studioSlug}`, JSON.stringify(updatedConfig));
      } catch {}
    }
  };

  // Навигация: home | services | my-booking | admin
  const [activeTab, setActiveTab] = useState('home');

  // Авторизация владельца
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Записи студии
  const [bookings, setBookings] = useState(() => {
    if (typeof window !== 'undefined' && !isCloudEnabled) {
      const saved = localStorage.getItem(`studio_bookings_${studioSlug}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [];
  });

  // Загрузка данных конкретной студии из Supabase при открытии ссылки
  useEffect(() => {
    if (!isCloudEnabled) return;
    let cancelled = false;

    async function loadStudioFromCloud() {
      const studioRows = await supabaseRequest(`studios?slug=eq.${studioSlug}&select=*`);
      if (!cancelled && Array.isArray(studioRows) && studioRows[0]?.config) {
        setCurrentTenant({
          ...createDefaultStudioConfig(studioSlug),
          ...studioRows[0].config,
          slug: studioSlug
        });
      }

      const bookingRows = await supabaseRequest(
        `bookings?studio_slug=eq.${studioSlug}&order=created_at.desc`
      );
      if (!cancelled && Array.isArray(bookingRows)) {
        setBookings(
          bookingRows.map((r) => ({
            id: r.id,
            studioSlug: r.studio_slug,
            serviceName: r.service_name,
            price: Number(r.price),
            duration: Number(r.duration),
            staffId: r.staff_id,
            staffName: r.staff_name,
            date: r.booking_date,
            time: r.booking_time,
            clientName: r.client_name,
            clientPhone: r.client_phone,
            status: r.status,
            paid: Boolean(r.paid)
          }))
        );
      }
    }

    loadStudioFromCloud();
    return () => {
      cancelled = true;
    };
  }, [studioSlug]);

  // Локальное резервное сохранение записей
  useEffect(() => {
    if (!isCloudEnabled && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`studio_bookings_${studioSlug}`, JSON.stringify(bookings));
      } catch {}
    }
  }, [bookings, studioSlug]);

  // Состояние выбора в карточке записи клиента
  const [selectedServiceId, setSelectedServiceId] = useState(currentTenant.services[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState(currentTenant.staff[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(daysList[0].iso);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  // ИИ-чат клиента
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [isClientAiLoading, setIsClientAiLoading] = useState(false);

  // Модальное окно маршрута
  const [routeModalOpen, setRouteModalOpen] = useState(false);

  // ИИ-чат владельца
  const [ownerAiMessages, setOwnerAiMessages] = useState([
    {
      role: 'assistant',
      text: 'Здравствуйте! Я ваш умный бизнес-ассистент. Могу разобрать расписание на сегодня и неделю, посчитать выручку, проанализировать загрузку мастеров или предложить идеи для акций.'
    }
  ]);
  const [ownerAiInput, setOwnerAiInput] = useState('');
  const [isOwnerAiLoading, setIsOwnerAiLoading] = useState(false);

  const bookingSectionRef = useRef(null);

  useEffect(() => {
    if (!currentTenant.services.some((s) => s.id === selectedServiceId)) {
      setSelectedServiceId(currentTenant.services[0]?.id || '');
    }
    if (!currentTenant.staff.some((m) => m.id === selectedStaffId)) {
      setSelectedStaffId(currentTenant.staff[0]?.id || '');
    }
  }, [currentTenant.services, currentTenant.staff, selectedServiceId, selectedStaffId]);

  useEffect(() => {
    setAiMessages([
      {
        role: 'assistant',
        text: `Здравствуйте! Я умный ИИ-стилист и администратор студии ${currentTenant.name}. Помогу подобрать стрижку под форму лица, расскажу про уход за волосами и бородой, подскажу свободное время, цены или как построить маршрут.`
      }
    ]);
  }, [currentTenant.name]);

  const selectedService = useMemo(
    () => currentTenant.services.find((s) => s.id === selectedServiceId) || currentTenant.services[0],
    [currentTenant.services, selectedServiceId]
  );

  const selectedStaff = useMemo(
    () => currentTenant.staff.find((m) => m.id === selectedStaffId) || currentTenant.staff[0],
    [currentTenant.staff, selectedStaffId]
  );

  // Расчет свободных и занятых слотов
  const availableSlots = useMemo(() => {
    if (!selectedService || !selectedStaff) return [];
    const startMin = timeToMinutes(currentTenant.workHours.start || '10:00');
    const endMin = timeToMinutes(currentTenant.workHours.end || '22:00');
    const serviceDuration = Number(selectedService.duration) || 60;

    const busyIntervals = bookings
      .filter(
        (b) =>
          b.staffId === selectedStaff.id &&
          b.date === selectedDate &&
          b.status !== 'cancelled'
      )
      .map((b) => {
        const s = timeToMinutes(b.time);
        return { start: s, end: s + (Number(b.duration) || 60) };
      });

    const slots = [];
    for (let m = startMin; m + serviceDuration <= endMin; m += 30) {
      const slotStart = m;
      const slotEnd = m + serviceDuration;
      const hasOverlap = busyIntervals.some(
        (busy) => slotStart < busy.end && slotEnd > busy.start
      );
      slots.push({
        time: minutesToTime(m),
        available: !hasOverlap
      });
    }
    return slots;
  }, [currentTenant, selectedService, selectedStaff, selectedDate, bookings]);

  const scrollToBooking = (serviceId) => {
    if (serviceId) setSelectedServiceId(serviceId);
    setActiveTab('home');
    setTimeout(() => {
      bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // Создание записи клиента (с проверкой и записью в Supabase)
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!selectedService || !selectedStaff) {
      setBookingError('Выберите услугу и мастера');
      return;
    }
    if (!selectedTime) {
      setBookingError('Пожалуйста, выберите свободное время');
      return;
    }
    if (!clientName.trim() || clientPhone.trim().length < 6) {
      setBookingError('Укажите ваше имя и контактный телефон');
      return;
    }

    const slotObj = availableSlots.find((s) => s.time === selectedTime);
    if (!slotObj || !slotObj.available) {
      setBookingError('Это время только что заняли. Выберите соседнее свободное окно.');
      return;
    }

    const newBooking = {
      id: `BK-${Math.floor(100 + Math.random() * 900)}`,
      studioSlug,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      price: Number(selectedService.price),
      duration: Number(selectedService.duration),
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      date: selectedDate,
      time: selectedTime,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      status: 'confirmed',
      paid: false
    };

    if (isCloudEnabled) {
      const res = await supabaseRequest('bookings', {
        method: 'POST',
        body: JSON.stringify({
          id: newBooking.id,
          studio_slug: studioSlug,
          service_name: newBooking.serviceName,
          price: newBooking.price,
          duration: newBooking.duration,
          staff_id: newBooking.staffId,
          staff_name: newBooking.staffName,
          booking_date: newBooking.date,
          booking_time: newBooking.time,
          client_name: newBooking.clientName,
          client_phone: newBooking.clientPhone,
          status: 'confirmed',
          paid: false
        })
      });
      if (!res) {
        setBookingError('Это время только что забронировал другой клиент. Выберите другое окно.');
        return;
      }
    }

    setBookings((prev) => [newBooking, ...prev]);
    setCreatedBooking(newBooking);
    setSelectedTime('');
    showToast('Запись успешно подтверждена!');
  };

  const downloadIcs = (b) => {
    const [yyyy, mm, dd] = b.date.split('-');
    const [hh, min] = b.time.split(':');
    const startStr = `${yyyy}${mm}${dd}T${hh}${min}00`;
    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${b.serviceName} — ${currentTenant.name}`,
      `DTSTART:${startStr}`,
      `LOCATION:${currentTenant.address}`,
      `DESCRIPTION:Мастер: ${b.staffName}. Телефон студии: ${currentTenant.phone}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `booking-${b.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Событие сохранено для календаря');
  };

  // Умный ИИ-ассистент клиента
  const handleClientAiSend = async (promptText) => {
    const query = promptText || aiInput;
    if (!query || typeof query !== 'string' || !query.trim() || isClientAiLoading) return;

    const userMsg = { role: 'user', text: query.trim() };
    const updatedMessages = [...aiMessages, userMsg];
    setAiMessages(updatedMessages);
    if (!promptText) setAiInput('');
    setIsClientAiLoading(true);

    const firstFreeSlots = availableSlots.filter((s) => s.available).map((s) => s.time);
    const servicesContext = currentTenant.services
      .map((s) => `- ${s.name}: ${s.price} ₽ (${s.duration} мин)`)
      .join('\n');
    const staffContext = currentTenant.staff.map((m) => `- ${m.name} (${m.role})`).join('\n');

    const systemPrompt = `Ты — умный ИИ-стилист и администратор парикмахерской "${currentTenant.name}".
Отвечай дружелюбно, лаконично и профессионально на любые вопросы о мужских и женских стрижках, подборе формы под тип лица, уходе за бородой и волосами, а также по точным данным студии:
- Адрес: ${currentTenant.address}
- Телефон: ${currentTenant.phone}
- График: ${currentTenant.workHours.start}–${currentTenant.workHours.end}
- Мастера:\n${staffContext}
- Услуги и цены:\n${servicesContext}
- Свободные окна на ${selectedDate} (${selectedStaff?.name}): ${firstFreeSlots.length > 0 ? firstFreeSlots.join(', ') : 'нет свободных окон'}.`;

    const aiReply = await askSmartStudioAI({ systemPrompt, messages: updatedMessages });

    if (aiReply) {
      setAiMessages((prev) => [...prev, { role: 'assistant', text: aiReply }]);
    } else {
      const lower = query.toLowerCase();
      let fallback = '';
      if (lower.includes('окно') || lower.includes('свободн') || lower.includes('время')) {
        fallback =
          firstFreeSlots.length > 0
            ? `На ${selectedDate} к мастеру ${selectedStaff?.name} свободны окна: ${firstFreeSlots.slice(0, 6).join(', ')}. Какое время вам забронировать?`
            : `На ${selectedDate} у мастера ${selectedStaff?.name} все окна заняты. Попробуем выбрать другого мастера или соседний день?`;
      } else if (lower.includes('стои') || lower.includes('цен') || lower.includes('прайс')) {
        fallback = `Актуальный прайс студии ${currentTenant.name}:\n${servicesContext}`;
      } else if (lower.includes('адрес') || lower.includes('найти') || lower.includes('маршрут')) {
        fallback = `Мы находимся по адресу: ${currentTenant.address}. Работаем ежедневно с ${currentTenant.workHours.start} до ${currentTenant.workHours.end}. Нажмите кнопку «Построить маршрут» на странице, чтобы сразу открыть навигатор.`;
      } else if (lower.includes('стрижк') || lower.includes('лиц') || lower.includes('бород')) {
        fallback = `Для овального и прямоугольного лица отлично подходят текстурный Crop, классический Side Part или удлинённая форма ножницами. Наши мастера (${currentTenant.staff.map((m) => m.name).join(', ')}) подберут форму индивидуально.`;
      } else {
        fallback = `В студии ${currentTenant.name} мы выполняем все виды стрижек и ухода (${currentTenant.services.map((s) => s.name).join(', ')}). Ближайшие свободные окна на ${selectedDate}: ${firstFreeSlots.slice(0, 5).join(', ') || 'доступны у других мастеров'}. Чем могу помочь?`;
      }
      setAiMessages((prev) => [...prev, { role: 'assistant', text: fallback }]);
    }
    setIsClientAiLoading(false);
  };

  // Умный ИИ бизнес-ассистент владельца
  const handleOwnerAiSend = async (promptText) => {
    const query = promptText || ownerAiInput;
    if (!query || typeof query !== 'string' || !query.trim() || isOwnerAiLoading) return;

    const userMsg = { role: 'user', text: query.trim() };
    const updatedMessages = [...ownerAiMessages, userMsg];
    setOwnerAiMessages(updatedMessages);
    if (!promptText) setOwnerAiInput('');
    setIsOwnerAiLoading(true);

    const active = bookings.filter((b) => b.status !== 'cancelled');
    const completed = bookings.filter((b) => b.status === 'completed');
    const paidSum = active.filter((b) => b.paid).reduce((acc, b) => acc + Number(b.price), 0);
    const unpaidSum = active.filter((b) => !b.paid).reduce((acc, b) => acc + Number(b.price), 0);

    const bookingsListText = bookings
      .map(
        (b) =>
          `- ${b.date} ${b.time}: ${b.clientName} (${b.serviceName}, мастер ${b.staffName}, ${b.price} ₽, статус: ${b.status}, ${b.paid ? 'оплачено' : 'не оплачено'})`
      )
      .join('\n');

    const systemPrompt = `Ты — умный ИИ бизнес-ассистент владельца салона "${currentTenant.name}".
Реальные показатели студии:
- Активных записей: ${active.length}, завершено: ${completed.length}
- Получено денег в кассу: ${paidSum} ₽, ожидается к оплате: ${unpaidSum} ₽
- Журнал записей:\n${bookingsListText || 'Записей нет'}
Отвечай конкретно по цифрам студии и давай практичные советы по управлению парикмахерской и росту выручки.`;

    const aiReply = await askSmartStudioAI({ systemPrompt, messages: updatedMessages });

    if (aiReply) {
      setOwnerAiMessages((prev) => [...prev, { role: 'assistant', text: aiReply }]);
    } else {
      const lower = query.toLowerCase();
      let fallback = '';
      if (lower.includes('выручк') || lower.includes('денег') || lower.includes('запис')) {
        fallback = `Сводка по студии ${currentTenant.name}:\n• Активных записей: ${active.length}\n• Завершено услуг: ${completed.length}\n• Реально получено в кассу: ${paidSum.toLocaleString()} ₽\n• Ожидается к оплате: ${unpaidSum.toLocaleString()} ₽${
          active.length > 0
            ? `\n\nБлижайшие визиты:\n${active
                .slice(0, 5)
                .map((b) => `• ${b.date} в ${b.time} — ${b.clientName} (${b.serviceName}, ${b.price} ₽)`)
                .join('\n')}`
            : ''
        }`;
      } else if (lower.includes('средний чек') || lower.includes('акци')) {
        fallback = `Три проверенных способа поднять средний чек в ${currentTenant.name}:\n1. Предлагать экспресс-уход в мойке (+1 500 ₽ за 15 минут).\n2. Пакет «Стрижка + Борода» выгоден клиенту и повышает чек на 40%.\n3. На утренние часы (10:00–13:00) по будням ввести бонус «Кофе + укладка в подарок».`;
      } else {
        fallback = `По базе ${currentTenant.name}: сейчас ${active.length} активных записей, в кассе ${paidSum.toLocaleString()} ₽. Могу подготовить текст SMS-напоминания для клиентов или разобрать загрузку мастеров.`;
      }
      setOwnerAiMessages((prev) => [...prev, { role: 'assistant', text: fallback }]);
    }
    setIsOwnerAiLoading(false);
  };

  const theme = currentTenant.theme || THEME_PRESETS[0];

  return (
    <div
      style={{
        '--bg': theme.bg,
        '--surface': theme.surface,
        '--accent': theme.accent,
        '--accent-text': theme.accentText,
        '--text-main': theme.textMain,
        '--text-muted': theme.textMuted
      }}
      className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] pb-28 selection:bg-[var(--accent)] selection:text-[var(--accent-text)] font-sans transition-colors duration-300"
    >
      <style>{`
        .liquid-glass {
          background: linear-gradient(135deg, color-mix(in srgb, var(--surface) 62%, transparent) 0%, color-mix(in srgb, var(--bg) 74%, transparent) 100%);
          backdrop-filter: blur(20px) saturate(165%);
          -webkit-backdrop-filter: blur(20px) saturate(165%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .glass-card {
          background: color-mix(in srgb, var(--surface) 74%, transparent);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .soft-btn {
          background: color-mix(in srgb, var(--surface) 65%, transparent);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.2s ease;
        }
        .soft-btn:hover {
          background: color-mix(in srgb, var(--surface) 88%, transparent);
          border-color: color-mix(in srgb, var(--accent) 35%, transparent);
        }
        @media (prefers-reduced-motion: no-preference) {
          .smooth-appear {
            animation: fadeUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ЧИСТАЯ ВЕРХНЯЯ ПАНЕЛЬ КОНКРЕТНОГО САЛОНА */}
      <header className="sticky top-0 z-30 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-left"
          >
            <Scissors className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-bold tracking-wide text-[var(--text-main)]">
              {currentTenant.name}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'admin' ? 'home' : 'admin')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition ${
              activeTab === 'admin'
                ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-lg'
                : 'soft-btn text-[var(--text-main)]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{activeTab === 'admin' ? 'К сайту студии' : 'Кабинет владельца'}</span>
          </button>
        </div>
      </header>

      {/* УВЕДОМЛЕНИЕ */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 liquid-glass text-[var(--text-main)] px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="max-w-3xl mx-auto">
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* 1. ГЛАВНЫЙ БАННЕР И СТЕКЛЯННАЯ КНОПКА «ЗАПИСАТЬСЯ» */}
            <section className="px-4 pt-4 smooth-appear">
              <div className="relative rounded-3xl overflow-hidden border border-white/[0.07] bg-[var(--surface)] shadow-2xl">
                <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                  <img
                    src={currentTenant.heroImage}
                    alt={currentTenant.name}
                    className="w-full h-full object-cover object-center"
                  />
                  <div
                    style={{ opacity: (currentTenant.heroOverlay ?? 55) / 100 }}
                    className="absolute inset-0 bg-black"
                  />
                  <div
                    style={{
                      background: `linear-gradient(to top, var(--bg) 5%, transparent 75%)`
                    }}
                    className="absolute inset-0"
                  />
                </div>

                <div className="relative -mt-28 px-5 pb-6 z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass text-[var(--text-main)] text-[11px] tracking-wide uppercase mb-2">
                    <Scissors className="w-3 h-3 text-[var(--accent)]" />
                    <span>{currentTenant.subtitle}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)]">
                    {currentTenant.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 max-w-xl leading-relaxed">
                    {currentTenant.tagline}
                  </p>

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => scrollToBooking()}
                      className="w-full py-3.5 px-6 rounded-2xl liquid-glass hover:border-[var(--accent)]/40 text-[var(--text-main)] font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition active:scale-[0.99]"
                    >
                      <span>{currentTenant.heroButtonText || 'Записаться'}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--accent)]" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. АДРЕС С КНОПКОЙ МАРШРУТА, ВРЕМЯ РАБОТЫ И ТЕЛЕФОН */}
            <section className="px-4 smooth-appear">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 glass-card rounded-2xl p-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[var(--text-muted)]">Адрес студии</div>
                    <div className="text-[var(--text-main)] font-medium mt-0.5">{currentTenant.address}</div>
                    <button
                      type="button"
                      onClick={() => setRouteModalOpen(true)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-[var(--accent-text)] font-medium text-[11px] transition hover:opacity-90"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Построить маршрут</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                  <Clock className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[var(--text-muted)]">Время работы</div>
                    <div className="text-[var(--text-main)] font-medium mt-0.5">
                      Ежедневно {currentTenant.workHours.start} – {currentTenant.workHours.end}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{currentTenant.daysOff?.[0]}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                  <Phone className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[var(--text-muted)]">Телефон</div>
                    <a
                      href={`tel:${currentTenant.phone}`}
                      className="text-[var(--text-main)] font-medium hover:text-[var(--accent)] mt-0.5 block"
                    >
                      {currentTenant.phone}
                    </a>
                    <a
                      href={`tel:${currentTenant.phone}`}
                      className="text-[11px] text-[var(--accent)] hover:underline mt-1 inline-block"
                    >
                      Позвонить в студию
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. ТРИ ИНФОРМАЦИОННЫЕ КАРТОЧКИ НА ГЛАВНОЙ */}
            <section className="px-4 smooth-appear">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentTenant.highlights.map((item) => (
                  <div key={item.id} className="glass-card rounded-2xl p-4">
                    <div className="text-xs font-semibold text-[var(--accent)]">{item.title}</div>
                    <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. УСЛУГИ С ЦЕНАМИ */}
            <section className="px-4 smooth-appear">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-main)]">Услуги и цены</h2>
                  <p className="text-xs text-[var(--text-muted)]">Нажмите на услугу, чтобы перейти к выбору времени</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Все услуги
                </button>
              </div>

              <div className="space-y-2.5">
                {currentTenant.services.map((srv) => {
                  const isSelected = srv.id === selectedServiceId;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => scrollToBooking(srv.id)}
                      className={`p-4 rounded-2xl transition cursor-pointer flex items-center justify-between gap-3 glass-card ${
                        isSelected
                          ? '!border-[var(--accent)]/60 bg-[var(--surface)]/95'
                          : 'hover:border-[var(--accent)]/30'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[var(--accent)]">
                          {srv.category}
                        </span>
                        <h3 className="text-sm font-semibold text-[var(--text-main)] mt-0.5">{srv.name}</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Длительность: {srv.duration} мин</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-[var(--accent)]">
                          {Number(srv.price).toLocaleString()} ₽
                        </div>
                        <span className="inline-block mt-1 text-[11px] text-[var(--text-muted)] font-medium">
                          Выбрать →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 5. ФОТОГРАФИИ РАБОТ */}
            <section className="px-4 smooth-appear">
              <div className="mb-3">
                <h2 className="text-lg font-bold text-[var(--text-main)]">Фотографии работ</h2>
                <p className="text-xs text-[var(--text-muted)]">Реальные работы мастеров {currentTenant.name}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentTenant.portfolio.map((work) => (
                  <div key={work.id} className="glass-card rounded-2xl overflow-hidden flex flex-col">
                    <img
                      src={work.url}
                      alt={work.caption}
                      loading="lazy"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3 text-xs text-[var(--text-muted)] leading-snug">{work.caption}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. УМНЫЙ ИИ-ПОМОЩНИК С КНОПКАМИ БЫСТРОГО СТАРТА */}
            <section className="px-4 smooth-appear">
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-main)]">Умный ИИ-помощник студии</h3>
                      <p className="text-xs text-[var(--text-muted)]">Ответит по свободному времени, ценам, стилю и уходу</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiDrawerOpen(true)}
                    className="text-xs bg-[var(--accent)]/15 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-[var(--accent-text)] px-3 py-1.5 rounded-xl flex items-center gap-1 font-medium transition shrink-0"
                  >
                    Открыть чат <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    'Когда ближайшее окно?',
                    'Сколько стоит стрижка?',
                    'Как найти студию?',
                    'Какая стрижка подойдет к овальному лицу?'
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setAiDrawerOpen(true);
                        handleClientAiSend(q);
                      }}
                      className="soft-btn text-xs text-[var(--text-main)] px-3.5 py-2 rounded-xl"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 7. ЗАМЕТНЫЙ ЗАГОЛОВОК «ЗАПИСЬ В СТУДИЮ» И КАРТОЧКА ЗАПИСИ */}
            <section ref={bookingSectionRef} className="px-4 pt-2 smooth-appear">
              <div className="mb-3">
                <span className="text-[11px] uppercase tracking-widest text-[var(--accent)] font-semibold">
                  Онлайн-бронирование без регистрации
                </span>
                <h2 className="text-2xl font-bold text-[var(--text-main)] mt-0.5">Запись в студию</h2>
              </div>

              <div className="glass-card rounded-3xl p-5 shadow-xl">
                {createdBooking ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[var(--text-main)]">Вы успешно записаны!</h3>
                        <p className="text-xs text-[var(--text-muted)]">Код брони: {createdBooking.id}</p>
                      </div>
                    </div>

                    <div className="bg-[var(--bg)]/70 border border-white/[0.07] rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Услуга</span>
                        <span className="text-[var(--text-main)] font-medium">{createdBooking.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Мастер</span>
                        <span className="text-[var(--text-main)] font-medium">{createdBooking.staffName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Дата и время</span>
                        <span className="text-[var(--accent)] font-semibold">
                          {createdBooking.date} в {createdBooking.time}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)]">Адрес</span>
                        <button
                          type="button"
                          onClick={() => setRouteModalOpen(true)}
                          className="text-[var(--accent)] hover:underline font-medium flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3" /> {currentTenant.address}
                        </button>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/[0.07]">
                        <span className="text-[var(--text-muted)]">Стоимость</span>
                        <span className="text-sm font-bold text-[var(--text-main)]">
                          {Number(createdBooking.price).toLocaleString()} ₽
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setReminderEnabled(!reminderEnabled);
                          showToast(
                            !reminderEnabled
                              ? 'Напоминание за 5 часов включено'
                              : 'Напоминание отключено'
                          );
                        }}
                        className={`py-3 px-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition ${
                          reminderEnabled
                            ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40'
                            : 'soft-btn text-[var(--text-main)]'
                        }`}
                      >
                        <Bell className="w-4 h-4 text-[var(--accent)]" />
                        <span>{reminderEnabled ? 'Напоминание включено' : 'Напомнить за 5 ч'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadIcs(createdBooking)}
                        className="soft-btn py-3 px-4 rounded-xl text-[var(--text-main)] text-xs font-medium flex items-center justify-center gap-2"
                      >
                        <CalendarDays className="w-4 h-4 text-[var(--accent)]" />
                        <span>В календарь (.ics)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRouteModalOpen(true)}
                        className="soft-btn py-3 px-4 rounded-xl text-[var(--text-main)] text-xs font-medium flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4 text-[var(--accent)]" />
                        <span>Построить маршрут</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setCreatedBooking(null)}
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        + Оформить ещё одну запись
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (isCloudEnabled) {
                            await supabaseRequest(`bookings?id=eq.${createdBooking.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'cancelled' })
                            });
                          }
                          setBookings((prev) =>
                            prev.map((b) =>
                              b.id === createdBooking.id ? { ...b, status: 'cancelled' } : b
                            )
                          );
                          setCreatedBooking(null);
                          showToast('Запись отменена');
                        }}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Отменить запись
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmBooking} className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                        1. Выберите услугу
                      </label>
                      <select
                        value={selectedServiceId}
                        onChange={(e) => {
                          setSelectedServiceId(e.target.value);
                          setSelectedTime('');
                        }}
                        className="w-full soft-btn rounded-xl px-3.5 py-3 text-xs text-[var(--text-main)] focus:outline-none"
                      >
                        {currentTenant.services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — {s.price} ₽ ({s.duration} мин)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                        2. Выберите мастера
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {currentTenant.staff.map((member) => {
                          const active = member.id === selectedStaffId;
                          return (
                            <button
                              type="button"
                              key={member.id}
                              onClick={() => {
                                setSelectedStaffId(member.id);
                                setSelectedTime('');
                              }}
                              className={`p-3 rounded-2xl text-left flex items-center gap-3 transition ${
                                active
                                  ? 'bg-[var(--accent)]/15 border border-[var(--accent)]/50 text-[var(--text-main)]'
                                  : 'soft-btn text-[var(--text-main)]'
                              }`}
                            >
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-10 h-10 rounded-full object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold truncate">{member.name}</div>
                                <div className="text-[11px] text-[var(--text-muted)] truncate">{member.role}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                        3. Дата визита
                      </label>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {daysList.map((d) => {
                          const active = d.iso === selectedDate;
                          return (
                            <button
                              type="button"
                              key={d.iso}
                              onClick={() => {
                                setSelectedDate(d.iso);
                                setSelectedTime('');
                              }}
                              className={`px-3.5 py-2.5 rounded-2xl text-center shrink-0 transition ${
                                active
                                  ? 'bg-[var(--accent)] text-[var(--accent-text)] font-bold shadow-md'
                                  : 'soft-btn text-[var(--text-main)]'
                              }`}
                            >
                              <div className="text-[10px] uppercase opacity-80">{d.dayName}</div>
                              <div className="text-sm mt-0.5">
                                {d.dayNum} {d.month}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-[var(--text-muted)]">
                          4. Свободное время ({selectedService?.duration} мин)
                        </label>
                        <span className="text-[11px] text-[var(--text-muted)] opacity-70">Занятое время перечёркнуто</span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {availableSlots.map((slot) => {
                          const isChosen = selectedTime === slot.time;
                          return (
                            <button
                              type="button"
                              key={slot.time}
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`py-2.5 rounded-xl text-xs font-medium transition ${
                                !slot.available
                                  ? 'bg-black/15 text-[var(--text-muted)] opacity-45 line-through cursor-not-allowed'
                                  : isChosen
                                  ? 'bg-[var(--accent)] text-[var(--accent-text)] font-bold shadow-md'
                                  : 'soft-btn text-[var(--text-main)]'
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">Ваше имя</label>
                        <input
                          type="text"
                          placeholder="Например, Александр"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full soft-btn rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">Телефон</label>
                        <input
                          type="tel"
                          placeholder="+7 (999) 000-00-00"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full soft-btn rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none"
                        />
                      </div>
                    </div>

                    {bookingError && (
                      <div className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl p-3">
                        {bookingError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-2xl bg-[var(--accent)] hover:opacity-90 text-[var(--accent-text)] font-bold text-sm transition shadow-lg"
                    >
                      Подтвердить запись {selectedTime ? `на ${selectedTime}` : ''}
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ВКЛАДКА «УСЛУГИ» */}
        {activeTab === 'services' && (
          <div className="px-4 py-6 space-y-5 smooth-appear">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-main)]">Прайс-лист {currentTenant.name}</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">Выберите любую услугу для быстрой онлайн-записи</p>
            </div>
            <div className="space-y-2.5">
              {currentTenant.services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => scrollToBooking(srv.id)}
                  className="glass-card hover:border-[var(--accent)]/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--accent)]">
                      {srv.category}
                    </span>
                    <div className="text-sm font-semibold text-[var(--text-main)] mt-0.5">{srv.name}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{srv.duration} минут</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[var(--accent)]">
                      {Number(srv.price).toLocaleString()} ₽
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">Записаться →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ВКЛАДКА «МОЯ ЗАПИСЬ» */}
        {activeTab === 'my-booking' && (
          <MyBookingsView
            tenant={currentTenant}
            userBookings={bookings}
            onDownloadIcs={downloadIcs}
            onCancel={async (id) => {
              if (isCloudEnabled) {
                await supabaseRequest(`bookings?id=eq.${id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ status: 'cancelled' })
                });
              }
              setBookings((prev) =>
                prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
              );
              showToast('Запись отменена');
            }}
            onBookNew={() => scrollToBooking()}
          />
        )}

        {/* ВКЛАДКА «КАБИНЕТ ВЛАДЕЛЬЦА» */}
        {activeTab === 'admin' && (
          <div className="px-4 py-6 smooth-appear">
            {!isOwnerAuthenticated ? (
              <div className="max-w-md mx-auto glass-card rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-main)]">Вход для владельца студии</h2>
                    <p className="text-xs text-[var(--text-muted)]">Управление студией {currentTenant.name}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Почта</label>
                  <input
                    type="email"
                    placeholder="owner@studio.ru"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full soft-btn rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Пароль</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full soft-btn rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none"
                  />
                </div>

                {loginError && <p className="text-xs text-red-400">{loginError}</p>}

                <button
                  type="button"
                  disabled={isLoggingIn}
                  onClick={async () => {
                    if (!loginEmail.trim() || !loginPassword.trim()) {
                      setLoginError('Введите почту и пароль');
                      return;
                    }
                    setIsLoggingIn(true);
                    const result = await supabaseOwnerSignIn(loginEmail.trim(), loginPassword);
                    setIsLoggingIn(false);
                    if (result.ok) {
                      setIsOwnerAuthenticated(true);
                      setLoginError('');
                      showToast('Добро пожаловать в кабинет владельца');
                    } else {
                      setLoginError(result.error || 'Неверные данные входа');
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-[var(--accent)] text-[var(--accent-text)] font-bold text-xs shadow-md flex items-center justify-center gap-2"
                >
                  {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Войти в кабинет</span>
                </button>
              </div>
            ) : (
              <AdminDashboard
                tenant={currentTenant}
                studioSlug={studioSlug}
                persistTenantConfig={persistTenantConfig}
                bookings={bookings}
                setBookings={setBookings}
                daysList={daysList}
                ownerAiMessages={ownerAiMessages}
                ownerAiInput={ownerAiInput}
                setOwnerAiInput={setOwnerAiInput}
                handleOwnerAiSend={handleOwnerAiSend}
                isOwnerAiLoading={isOwnerAiLoading}
                showToast={showToast}
                onLogout={() => setIsOwnerAuthenticated(false)}
              />
            )}
          </div>
        )}
      </main>

      {/* НИЖНЯЯ СТЕКЛЯННАЯ НАВИГАЦИЯ ТЕЛЕФОНА */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md rounded-2xl liquid-glass px-2 py-1.5 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition ${
            activeTab === 'home' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Главная</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition ${
            activeTab === 'services' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Услуги</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-booking')}
          className={`flex-1 py-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition ${
            activeTab === 'my-booking' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Моя запись</span>
        </button>
      </nav>

      {/* ДИАЛОГ УМНОГО ИИ-КОНСУЛЬТАНТА КЛИЕНТА */}
      {aiDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[var(--bg)] h-full flex flex-col border-l border-white/[0.08] shadow-2xl">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-main)] text-sm">ИИ-ассистент {currentTenant.name}</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">Отвечает по стрижкам, уходу, прайсу и расписанию</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-white/[0.05] flex gap-2 overflow-x-auto text-xs">
              {[
                'Когда ближайшее окно?',
                'Сколько стоит стрижка?',
                'Посоветуй мужскую стрижку',
                'Как найти студию?'
              ].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleClientAiSend(q)}
                  className="shrink-0 soft-btn text-[var(--text-main)] px-3 py-1.5 rounded-xl transition"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {aiMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[var(--accent)] text-[var(--accent-text)] font-medium'
                        : 'glass-card text-[var(--text-main)]'
                    }`}
                  >
                    {String(msg.text || '')}
                  </div>
                </div>
              ))}
              {isClientAiLoading && (
                <div className="flex justify-start">
                  <div className="glass-card text-[var(--text-muted)] px-3.5 py-2.5 rounded-2xl text-xs flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
                    <span>Ассистент печатает ответ...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-white/[0.06] flex gap-2">
              <input
                type="text"
                placeholder="Спросите о стрижках, уходе, времени или ценах..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleClientAiSend()}
                className="flex-1 soft-btn rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleClientAiSend()}
                disabled={isClientAiLoading}
                className="bg-[var(--accent)] text-[var(--accent-text)] px-3.5 rounded-xl flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ПОСТРОЕНИЯ МАРШРУТА */}
      {routeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setRouteModalOpen(false)}
        >
          <div
            className="w-full max-w-sm liquid-glass rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[var(--accent)]">Навигация</span>
                <h3 className="text-base font-semibold text-[var(--text-main)] mt-0.5">Построить маршрут</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">{currentTenant.address}</p>
              </div>
              <button
                type="button"
                onClick={() => setRouteModalOpen(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href={getRouteLinks(currentTenant.address).yandex}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setRouteModalOpen(false)}
                className="w-full py-3 px-4 rounded-2xl soft-btn text-[var(--text-main)] font-medium flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <Navigation className="w-4 h-4 text-[var(--accent)]" />
                  <span>Яндекс.Карты / Навигатор</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)]" />
              </a>

              <a
                href={getRouteLinks(currentTenant.address).google}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setRouteModalOpen(false)}
                className="w-full py-3 px-4 rounded-2xl soft-btn text-[var(--text-main)] font-medium flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[var(--accent)]" />
                  <span>Google Maps</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)]" />
              </a>

              <a
                href={getRouteLinks(currentTenant.address).dgis}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setRouteModalOpen(false)}
                className="w-full py-3 px-4 rounded-2xl soft-btn text-[var(--text-main)] font-medium flex items-center justify-between"
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[var(--accent)]" />
                  <span>2ГИС</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)]" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// РАЗДЕЛ «МОЯ ЗАПИСЬ»
// ==========================================
function MyBookingsView({ tenant, userBookings, onDownloadIcs, onCancel, onBookNew }) {
  const routes = getRouteLinks(tenant.address);
  return (
    <div className="px-4 py-6 space-y-5 smooth-appear">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-main)]">Моя запись</h2>
          <p className="text-xs text-[var(--text-muted)]">История и управление вашими визитами в {tenant.name}</p>
        </div>
        <button
          type="button"
          onClick={onBookNew}
          className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-text)] font-semibold text-xs shadow-md"
        >
          + Новая запись
        </button>
      </div>

      {userBookings.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center space-y-3">
          <p className="text-sm text-[var(--text-muted)]">У вас пока нет активных записей</p>
          <button
            type="button"
            onClick={onBookNew}
            className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-text)] font-semibold text-xs"
          >
            Выбрать услугу и время
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {userBookings.map((b) => (
            <div key={b.id} className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] text-[var(--text-muted)]">Запись #{b.id}</span>
                  <h3 className="text-sm font-bold text-[var(--text-main)]">{b.serviceName}</h3>
                  <p className="text-xs text-[var(--text-muted)]">Мастер: {b.staffName}</p>
                </div>
                <span
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                    b.status === 'cancelled'
                      ? 'bg-red-950/60 text-red-300'
                      : b.status === 'completed'
                      ? 'bg-emerald-950/60 text-emerald-300'
                      : 'bg-[var(--accent)]/15 text-[var(--accent)]'
                  }`}
                >
                  {b.status === 'cancelled'
                    ? 'Отменена'
                    : b.status === 'completed'
                    ? 'Завершена'
                    : 'Подтверждена'}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                <span>Дата: {b.date}</span>
                <span>Время: {b.time}</span>
                <span className="text-[var(--accent)] font-semibold">
                  {Number(b.price).toLocaleString()} ₽
                </span>
              </div>

              {b.status !== 'cancelled' && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
                  <a
                    href={routes.yandex}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 soft-btn text-xs text-[var(--text-main)] rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Маршрут</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onDownloadIcs(b)}
                    className="flex-1 py-2 px-3 soft-btn text-xs text-[var(--text-main)] rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>В календарь</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onCancel(b.id)}
                    className="py-2 px-3 bg-red-950/40 text-xs text-red-300 rounded-xl"
                  >
                    Отменить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// КАБИНЕТ ВЛАДЕЛЬЦА
// ==========================================
function AdminDashboard({
  tenant,
  studioSlug,
  persistTenantConfig,
  bookings,
  setBookings,
  daysList,
  ownerAiMessages,
  ownerAiInput,
  setOwnerAiInput,
  handleOwnerAiSend,
  isOwnerAiLoading,
  showToast,
  onLogout
}) {
  const [adminTab, setAdminTab] = useState('bookings');
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);

  const [formBooking, setFormBooking] = useState({
    clientName: '',
    clientPhone: '',
    serviceName: tenant.services[0]?.name || 'Мужская стрижка',
    price: tenant.services[0]?.price || 2800,
    duration: tenant.services[0]?.duration || 60,
    staffId: tenant.staff[0]?.id || 'm1',
    date: daysList[0].iso,
    time: '13:00',
    status: 'confirmed',
    paid: false
  });

  const [newService, setNewService] = useState({
    name: '',
    price: 2500,
    duration: 60,
    category: 'Стрижки'
  });

  const [newStaffMember, setNewStaffMember] = useState({
    name: '',
    role: 'Барбер-стилист',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=75'
  });

  const [newWorkCaption, setNewWorkCaption] = useState('');
  const [newWorkUrl, setNewWorkUrl] = useState('');

  const activeBookings = bookings.filter((b) => b.status !== 'cancelled');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalRevenue = activeBookings
    .filter((b) => b.paid)
    .reduce((sum, b) => sum + Number(b.price), 0);

  const updateTenantField = (field, value) => {
    persistTenantConfig({
      ...tenant,
      [field]: value
    });
  };

  const openCreateManualBooking = () => {
    setEditingBookingId(null);
    setFormBooking({
      clientName: '',
      clientPhone: '',
      serviceName: tenant.services[0]?.name || 'Мужская стрижка',
      price: tenant.services[0]?.price || 2800,
      duration: tenant.services[0]?.duration || 60,
      staffId: tenant.staff[0]?.id || '',
      date: daysList[0].iso,
      time: '13:00',
      status: 'confirmed',
      paid: false
    });
    setShowManualModal(true);
  };

  const openEditExistingBooking = (b) => {
    setEditingBookingId(b.id);
    setFormBooking({
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      serviceName: b.serviceName,
      price: b.price,
      duration: b.duration,
      staffId: b.staffId,
      date: b.date,
      time: b.time,
      status: b.status,
      paid: b.paid
    });
    setShowManualModal(true);
  };

  const handleSaveManualBooking = async (e) => {
    e.preventDefault();
    const staffObj = tenant.staff.find((m) => m.id === formBooking.staffId) || tenant.staff[0];

    const newStart = timeToMinutes(formBooking.time);
    const newEnd = newStart + (Number(formBooking.duration) || 60);
    const conflict = bookings.find(
      (b) =>
        b.id !== editingBookingId &&
        b.staffId === (staffObj?.id || formBooking.staffId) &&
        b.date === formBooking.date &&
        b.status !== 'cancelled' &&
        newStart < timeToMinutes(b.time) + (Number(b.duration) || 60) &&
        newEnd > timeToMinutes(b.time)
    );

    if (conflict) {
      showToast(`Внимание: у мастера в ${conflict.time} уже записан ${conflict.clientName}`);
      return;
    }

    if (editingBookingId) {
      if (isCloudEnabled) {
        await supabaseRequest(`bookings?id=eq.${editingBookingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            client_name: formBooking.clientName,
            client_phone: formBooking.clientPhone,
            service_name: formBooking.serviceName,
            price: Number(formBooking.price),
            duration: Number(formBooking.duration),
            staff_id: staffObj?.id || formBooking.staffId,
            staff_name: staffObj?.name || 'Мастер',
            booking_date: formBooking.date,
            booking_time: formBooking.time
          })
        });
      }
      setBookings((prev) =>
        prev.map((b) =>
          b.id === editingBookingId
            ? {
                ...b,
                ...formBooking,
                price: Number(formBooking.price),
                duration: Number(formBooking.duration),
                staffName: staffObj?.name || 'Мастер'
              }
            : b
        )
      );
      showToast('Запись обновлена');
    } else {
      const created = {
        id: `BK-${Math.floor(100 + Math.random() * 900)}`,
        studioSlug,
        ...formBooking,
        price: Number(formBooking.price),
        duration: Number(formBooking.duration),
        staffName: staffObj?.name || 'Мастер'
      };
      if (isCloudEnabled) {
        await supabaseRequest('bookings', {
          method: 'POST',
          body: JSON.stringify({
            id: created.id,
            studio_slug: studioSlug,
            service_name: created.serviceName,
            price: created.price,
            duration: created.duration,
            staff_id: staffObj?.id || created.staffId,
            staff_name: created.staffName,
            booking_date: created.date,
            booking_time: created.time,
            client_name: created.clientName,
            client_phone: created.clientPhone,
            status: 'confirmed',
            paid: false
          })
        });
      }
      setBookings((prev) => [created, ...prev]);
      showToast('Запись добавлена вручную');
    }
    setShowManualModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card rounded-3xl p-5">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[var(--accent)]">
            Панель управления владельца
          </span>
          <h2 className="text-xl font-bold text-[var(--text-main)]">{tenant.name}</h2>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="text-xs px-3 py-2 rounded-xl soft-btn text-[var(--text-main)] flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Выйти</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <div className="text-[11px] text-[var(--text-muted)]">Активных клиентов</div>
          <div className="text-xl font-bold text-[var(--text-main)] mt-1">{activeBookings.length}</div>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="text-[11px] text-[var(--text-muted)]">Завершено услуг</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{completedBookings.length}</div>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="text-[11px] text-[var(--text-muted)]">Получено в кассу</div>
          <div className="text-xl font-bold text-[var(--accent)] mt-1">
            {totalRevenue.toLocaleString()} ₽
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'bookings', label: 'Записи и касса' },
          { id: 'appearance', label: 'Баннер и цвета' },
          { id: 'services', label: 'Услуги и мастера' },
          { id: 'portfolio', label: 'Фото работ' },
          { id: 'settings', label: 'Настройки студии' },
          { id: 'ai', label: 'ИИ-помощник владельца' }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAdminTab(t.id)}
            className={`px-3.5 py-2 rounded-xl font-medium shrink-0 transition ${
              adminTab === t.id
                ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-md'
                : 'soft-btn text-[var(--text-main)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* НАСТРОЙКА ПЕРВОГО БАННЕРА И ЦВЕТОВОЙ ГАММЫ */}
      {adminTab === 'appearance' && (
        <div className="bg-[var(--surface)] border border-white/10 rounded-3xl p-5 space-y-6 text-xs shadow-xl">
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">Первый баннер и цветовая гамма</h3>
            <p className="text-[var(--text-muted)] mt-0.5">
              Все изменения применяются мгновенно на главной странице и в навигации
            </p>
          </div>

          <div className="space-y-4 pt-3 border-t border-white/10">
            <div className="font-semibold text-[var(--accent)] uppercase tracking-wider text-[11px]">
              1. Главный баннер (самый верхний блок)
            </div>

            <div className="relative h-44 rounded-2xl overflow-hidden border border-white/10">
              <img src={tenant.heroImage} alt={tenant.name} className="w-full h-full object-cover" />
              <div
                style={{ opacity: (tenant.heroOverlay ?? 55) / 100 }}
                className="absolute inset-0 bg-black"
              />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="text-[10px] uppercase opacity-80">{tenant.subtitle}</div>
                <div className="text-lg font-bold">{tenant.name}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-text)] font-semibold cursor-pointer flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Загрузить фото с устройства</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      updateTenantField('heroImage', String(reader.result));
                      showToast('Фото первого баннера обновлено');
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  updateTenantField('heroImage', TOOLS_HERO_BANNER);
                  showToast('Возвращён стандартный баннер с инструментами');
                }}
                className="px-3.5 py-2 rounded-xl bg-[var(--bg)] border border-white/10 text-[var(--text-main)]"
              >
                Стандартный баннер (инструменты)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Ссылка на изображение баннера (URL)</label>
                <input
                  type="text"
                  value={tenant.heroImage.startsWith('data:') ? '' : tenant.heroImage}
                  placeholder="https://..."
                  onChange={(e) => e.target.value && updateTenantField('heroImage', e.target.value)}
                  className="w-full bg-[var(--bg)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1">
                  Затемнение фото для читаемости текста ({tenant.heroOverlay ?? 55}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="85"
                  value={tenant.heroOverlay ?? 55}
                  onChange={(e) => updateTenantField('heroOverlay', Number(e.target.value))}
                  className="w-full accent-[var(--accent)] mt-2"
                />
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Надпись над заголовком (бейдж)</label>
                <input
                  type="text"
                  value={tenant.subtitle}
                  onChange={(e) => updateTenantField('subtitle', e.target.value)}
                  className="w-full bg-[var(--bg)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Текст стеклянной кнопки</label>
                <input
                  type="text"
                  value={tenant.heroButtonText || 'Записаться'}
                  onChange={(e) => updateTenantField('heroButtonText', e.target.value)}
                  className="w-full bg-[var(--bg)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[var(--text-muted)] mb-1">Описание студии на баннере</label>
                <input
                  type="text"
                  value={tenant.tagline}
                  onChange={(e) => updateTenantField('tagline', e.target.value)}
                  className="w-full bg-[var(--bg)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="font-semibold text-[var(--accent)] uppercase tracking-wider text-[11px]">
              2. Цветовая гамма студии
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected = tenant.theme?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      updateTenantField('theme', preset);
                      showToast(`Применена палитра «${preset.name}»`);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--bg)]'
                        : 'border-white/10 bg-[var(--bg)]/60 hover:border-white/25'
                    }`}
                  >
                    <div className="flex -space-x-1.5 shrink-0">
                      <span
                        style={{ backgroundColor: preset.bg }}
                        className="w-5 h-5 rounded-full border border-white/20"
                      />
                      <span
                        style={{ backgroundColor: preset.surface }}
                        className="w-5 h-5 rounded-full border border-white/20"
                      />
                      <span
                        style={{ backgroundColor: preset.accent }}
                        className="w-5 h-5 rounded-full border border-white/20"
                      />
                    </div>
                    <span className="font-medium text-[var(--text-main)]">{preset.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <label className="bg-[var(--bg)] border border-white/10 rounded-xl p-2.5 flex items-center justify-between cursor-pointer">
                <span className="text-[var(--text-muted)]">Фон страницы</span>
                <input
                  type="color"
                  value={tenant.theme?.bg || '#0f1012'}
                  onChange={(e) =>
                    updateTenantField('theme', {
                      ...(tenant.theme || THEME_PRESETS[0]),
                      id: 'custom',
                      bg: e.target.value
                    })
                  }
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
              </label>

              <label className="bg-[var(--bg)] border border-white/10 rounded-xl p-2.5 flex items-center justify-between cursor-pointer">
                <span className="text-[var(--text-muted)]">Карточки</span>
                <input
                  type="color"
                  value={tenant.theme?.surface || '#16171a'}
                  onChange={(e) =>
                    updateTenantField('theme', {
                      ...(tenant.theme || THEME_PRESETS[0]),
                      id: 'custom',
                      surface: e.target.value
                    })
                  }
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
              </label>

              <label className="bg-[var(--bg)] border border-white/10 rounded-xl p-2.5 flex items-center justify-between cursor-pointer">
                <span className="text-[var(--text-muted)]">Акцент / кнопки</span>
                <input
                  type="color"
                  value={tenant.theme?.accent || '#c5a880'}
                  onChange={(e) =>
                    updateTenantField('theme', {
                      ...(tenant.theme || THEME_PRESETS[0]),
                      id: 'custom',
                      accent: e.target.value
                    })
                  }
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
              </label>

              <label className="bg-[var(--bg)] border border-white/10 rounded-xl p-2.5 flex items-center justify-between cursor-pointer">
                <span className="text-[var(--text-muted)]">Основной текст</span>
                <input
                  type="color"
                  value={tenant.theme?.textMain || '#f4f4f5'}
                  onChange={(e) =>
                    updateTenantField('theme', {
                      ...(tenant.theme || THEME_PRESETS[0]),
                      id: 'custom',
                      textMain: e.target.value
                    })
                  }
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 1. УПРАВЛЕНИЕ ЗАПИСЯМИ */}
      {adminTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[var(--text-main)]">Журнал записей на день и неделю</h3>
            <button
              type="button"
              onClick={openCreateManualBooking}
              className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-text)] font-semibold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Новая запись вручную</span>
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 text-center text-xs text-[var(--text-muted)]">
              Пока нет записей. Нажмите «Новая запись вручную» или дождитесь первой заявки от клиента.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="glass-card rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-[var(--accent)] font-semibold">
                        {b.date} в {b.time} ({b.duration} мин)
                      </div>
                      <div className="text-sm font-bold text-[var(--text-main)] mt-0.5">
                        {b.clientName} — {b.clientPhone}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Услуга: {b.serviceName} • Мастер: {b.staffName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[var(--accent)]">
                        {Number(b.price).toLocaleString()} ₽
                      </div>
                      <span
                        className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                          b.paid
                            ? 'bg-emerald-950/80 text-emerald-300'
                            : 'bg-black/20 text-[var(--text-muted)]'
                        }`}
                      >
                        {b.paid ? 'Оплачено' : 'Ожидает оплаты'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06] text-xs">
                    <button
                      type="button"
                      onClick={() => openEditExistingBooking(b)}
                      className="px-3 py-1.5 rounded-xl soft-btn text-[var(--accent)] flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Изменить (цену / время / мастера)</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (isCloudEnabled) {
                          await supabaseRequest(`bookings?id=eq.${b.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ status: 'completed' })
                          });
                        }
                        setBookings((prev) =>
                          prev.map((item) =>
                            item.id === b.id ? { ...item, status: 'completed' } : item
                          )
                        );
                        showToast('Клиент отмечен как обслуженный');
                      }}
                      className="px-3 py-1.5 rounded-xl soft-btn text-[var(--text-main)]"
                    >
                      Готово
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const nextPaid = !b.paid;
                        if (isCloudEnabled) {
                          await supabaseRequest(`bookings?id=eq.${b.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({ paid: nextPaid })
                          });
                        }
                        setBookings((prev) =>
                          prev.map((item) =>
                            item.id === b.id ? { ...item, paid: nextPaid } : item
                          )
                        );
                        showToast(nextPaid ? 'Оплата принята в кассу' : 'Оформлен возврат оплаты');
                      }}
                      className="px-3 py-1.5 rounded-xl soft-btn text-emerald-400 flex items-center gap-1"
                    >
                      {b.paid ? <RotateCcw className="w-3.5 h-3.5" /> : <DollarSign className="w-3.5 h-3.5" />}
                      <span>{b.paid ? 'Возврат' : 'Принять оплату'}</span>
                    </button>

                    {b.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (isCloudEnabled) {
                            await supabaseRequest(`bookings?id=eq.${b.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ status: 'cancelled' })
                            });
                          }
                          setBookings((prev) =>
                            prev.map((item) =>
                              item.id === b.id ? { ...item, status: 'cancelled' } : item
                            )
                          );
                          showToast('Запись отменена');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-950/40 text-red-300"
                      >
                        Отменить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. РЕДАКТИРОВАНИЕ УСЛУГ, ЦЕН, ДЛИТЕЛЬНОСТИ И МАСТЕРОВ */}
      {adminTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-[var(--surface)] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-main)]">Редактирование услуг и цен</h3>
                <p className="text-xs text-[var(--text-main)] opacity-75 mt-0.5">
                  Изменения сразу отображаются в прайсе и форме записи
                </p>
              </div>
              <span className="text-xs text-[var(--accent)] font-semibold">
                Всего: {tenant.services.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {tenant.services.map((srv) => (
                <div
                  key={srv.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-[var(--bg)]/80 border border-white/10 rounded-2xl p-3 items-center text-xs"
                >
                  <input
                    type="text"
                    value={srv.category || 'Стрижки'}
                    placeholder="Категория"
                    onChange={(e) => {
                      const updated = tenant.services.map((s) =>
                        s.id === srv.id ? { ...s, category: e.target.value } : s
                      );
                      updateTenantField('services', updated);
                    }}
                    className="sm:col-span-2 bg-[var(--surface)] border border-white/10 rounded-xl px-2.5 py-2 text-[var(--accent)] font-medium focus:outline-none"
                  />
                  <input
                    type="text"
                    value={srv.name}
                    placeholder="Название услуги"
                    onChange={(e) => {
                      const updated = tenant.services.map((s) =>
                        s.id === srv.id ? { ...s, name: e.target.value } : s
                      );
                      updateTenantField('services', updated);
                    }}
                    className="sm:col-span-4 bg-[var(--surface)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)] font-medium focus:outline-none"
                  />
                  <div className="sm:col-span-3 flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      value={srv.price}
                      onChange={(e) => {
                        const updated = tenant.services.map((s) =>
                          s.id === srv.id ? { ...s, price: Number(e.target.value) } : s
                        );
                        updateTenantField('services', updated);
                      }}
                      className="w-full bg-[var(--surface)] border border-white/10 rounded-xl px-3 py-2 text-[var(--accent)] font-bold focus:outline-none"
                    />
                    <span className="text-[var(--text-main)] opacity-80">₽</span>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-1">
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={srv.duration}
                      onChange={(e) => {
                        const updated = tenant.services.map((s) =>
                          s.id === srv.id ? { ...s, duration: Number(e.target.value) } : s
                        );
                        updateTenantField('services', updated);
                      }}
                      className="w-full bg-[var(--surface)] border border-white/10 rounded-xl px-2.5 py-2 text-[var(--text-main)] font-medium focus:outline-none"
                    />
                    <span className="text-[var(--text-main)] opacity-80">мин</span>
                  </div>
                  <button
                    type="button"
                    title="Удалить услугу"
                    onClick={() => {
                      if (tenant.services.length <= 1) {
                        showToast('Должна остаться хотя бы одна услуга');
                        return;
                      }
                      updateTenantField(
                        'services',
                        tenant.services.filter((s) => s.id !== srv.id)
                      );
                      showToast('Услуга удалена');
                    }}
                    className="sm:col-span-1 text-red-400 hover:text-red-300 flex justify-center py-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="text-xs font-semibold text-[var(--accent)]">Добавить новую услугу</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Категория (Стрижки)"
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                  className="sm:col-span-3 bg-[var(--bg)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Название новой услуги"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="sm:col-span-4 bg-[var(--bg)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Цена (₽)"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                  className="sm:col-span-2 bg-[var(--bg)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                <input
                  type="number"
                  min="15"
                  step="15"
                  placeholder="Мин"
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                  className="sm:col-span-1 bg-[var(--bg)] border border-white/10 rounded-xl px-2.5 py-2 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newService.name.trim()) {
                      showToast('Введите название услуги');
                      return;
                    }
                    updateTenantField('services', [
                      ...tenant.services,
                      {
                        ...newService,
                        name: newService.name.trim(),
                        category: newService.category.trim() || 'Стрижки',
                        id: `srv-${Date.now()}`
                      }
                    ]);
                    setNewService({ name: '', price: 2500, duration: 60, category: 'Стрижки' });
                    showToast('Новая услуга добавлена');
                  }}
                  className="sm:col-span-2 bg-[var(--accent)] text-[var(--accent-text)] font-semibold rounded-xl px-3 py-2 shadow-md"
                >
                  + Добавить
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-main)]">Мастера студии</h3>
                <p className="text-xs text-[var(--text-main)] opacity-75 mt-0.5">
                  Редактируйте имена, специализацию, фото и добавляйте мастеров
                </p>
              </div>
              <span className="text-xs text-[var(--accent)] font-semibold">
                Всего: {tenant.staff.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {tenant.staff.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 bg-[var(--bg)]/80 border border-white/10 rounded-2xl p-3 text-xs"
                >
                  <label className="relative cursor-pointer shrink-0 group" title="Нажмите, чтобы сменить фото мастера">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-11 h-11 rounded-full object-cover border border-white/15"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--accent-text)] flex items-center justify-center shadow">
                      <Upload className="w-2.5 h-2.5" />
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const updated = tenant.staff.map((st) =>
                            st.id === m.id ? { ...st, avatar: String(reader.result) } : st
                          );
                          updateTenantField('staff', updated);
                          showToast('Фото мастера обновлено');
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  <input
                    type="text"
                    value={m.name}
                    placeholder="Имя мастера"
                    onChange={(e) => {
                      const updated = tenant.staff.map((st) =>
                        st.id === m.id ? { ...st, name: e.target.value } : st
                      );
                      updateTenantField('staff', updated);
                    }}
                    className="flex-1 min-w-[130px] bg-[var(--surface)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)] font-medium focus:outline-none"
                  />
                  <input
                    type="text"
                    value={m.role}
                    placeholder="Специализация"
                    onChange={(e) => {
                      const updated = tenant.staff.map((st) =>
                        st.id === m.id ? { ...st, role: e.target.value } : st
                      );
                      updateTenantField('staff', updated);
                    }}
                    className="flex-1 min-w-[130px] bg-[var(--surface)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)] opacity-90 focus:outline-none"
                  />
                  <button
                    type="button"
                    title="Удалить мастера"
                    onClick={() => {
                      if (tenant.staff.length <= 1) {
                        showToast('В студии должен быть хотя бы один мастер');
                        return;
                      }
                      updateTenantField(
                        'staff',
                        tenant.staff.filter((st) => st.id !== m.id)
                      );
                      showToast('Мастер удалён');
                    }}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="text-xs font-semibold text-[var(--accent)]">Добавить нового мастера</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Имя и фамилия мастера"
                  value={newStaffMember.name}
                  onChange={(e) => setNewStaffMember({ ...newStaffMember, name: e.target.value })}
                  className="sm:col-span-5 bg-[var(--bg)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Должность (Барбер, Стилист...)"
                  value={newStaffMember.role}
                  onChange={(e) => setNewStaffMember({ ...newStaffMember, role: e.target.value })}
                  className="sm:col-span-4 bg-[var(--bg)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newStaffMember.name.trim()) {
                      showToast('Введите имя мастера');
                      return;
                    }
                    updateTenantField('staff', [
                      ...tenant.staff,
                      {
                        id: `m-${Date.now()}`,
                        name: newStaffMember.name.trim(),
                        role: newStaffMember.role.trim() || 'Барбер-стилист',
                        avatar: newStaffMember.avatar
                      }
                    ]);
                    setNewStaffMember({
                      name: '',
                      role: 'Барбер-стилист',
                      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=75'
                    });
                    showToast('Новый мастер добавлен');
                  }}
                  className="sm:col-span-3 bg-[var(--accent)] text-[var(--accent-text)] font-semibold rounded-xl px-3 py-2 shadow-md"
                >
                  + Добавить мастера
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ФОТОГРАФИИ РАБОТ */}
      {adminTab === 'portfolio' && (
        <div className="bg-[var(--surface)] border border-white/10 rounded-3xl p-5 space-y-5 shadow-xl text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">Фотографии работ</h3>
              <p className="text-[var(--text-main)] opacity-75 mt-0.5">
                Добавляйте новые карточки, меняйте конкретное фото или подпись — остальные работы останутся на месте
              </p>
            </div>
            <span className="text-xs text-[var(--accent)] font-semibold">
              Карточек: {tenant.portfolio.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tenant.portfolio.map((work, idx) => (
              <div
                key={work.id}
                className="bg-[var(--bg)]/85 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="relative h-48 w-full bg-black/40">
                  <img src={work.url} alt={work.caption} className="w-full h-full object-cover" />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/65 text-white text-[10px] font-medium">
                    Работа #{idx + 1}
                  </span>
                </div>

                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                      Подпись под фотографией
                    </label>
                    <input
                      type="text"
                      value={work.caption}
                      onChange={(e) => {
                        const updated = tenant.portfolio.map((item) =>
                          item.id === work.id ? { ...item, caption: e.target.value } : item
                        );
                        updateTenantField('portfolio', updated);
                      }}
                      className="w-full bg-[var(--surface)] border border-white/10 rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex-1 py-2 px-3 rounded-xl bg-[var(--accent)] text-[var(--accent-text)] font-semibold cursor-pointer flex items-center justify-center gap-1.5 text-center">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Заменить фото</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            const updated = tenant.portfolio.map((item) =>
                              item.id === work.id ? { ...item, url: String(reader.result) } : item
                            );
                            updateTenantField('portfolio', updated);
                            showToast(`Фотография #${idx + 1} заменена`);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      title="Удалить карточку"
                      onClick={() => {
                        updateTenantField(
                          'portfolio',
                          tenant.portfolio.filter((item) => item.id !== work.id)
                        );
                        showToast('Карточка удалена');
                      }}
                      className="py-2 px-3 rounded-xl bg-red-950/50 text-red-300 hover:bg-red-950/70 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="text-xs font-semibold text-[var(--accent)]">Добавить новую карточку работы</div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <label className="sm:col-span-4 py-2.5 px-3 rounded-xl bg-[var(--bg)] border border-white/15 text-[var(--text-main)] font-medium cursor-pointer flex items-center justify-center gap-1.5 hover:border-[var(--accent)]">
                <ImageIcon className="w-4 h-4 text-[var(--accent)]" />
                <span>{newWorkUrl ? 'Фото выбрано ✓' : 'Выбрать фото с телефона'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setNewWorkUrl(String(reader.result));
                      showToast('Фото готово к добавлению');
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              <input
                type="text"
                placeholder="Подпись к работе (например: Фейд и укладка — мастер Александр)"
                value={newWorkCaption}
                onChange={(e) => setNewWorkCaption(e.target.value)}
                className="sm:col-span-5 bg-[var(--bg)] border border-white/10 rounded-xl px-3 py-2.5 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />

              <button
                type="button"
                onClick={() => {
                  const imageUrl =
                    newWorkUrl ||
                    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=75';
                  const captionText = newWorkCaption.trim() || 'Новая работа мастера студии';
                  updateTenantField('portfolio', [
                    ...tenant.portfolio,
                    {
                      id: `work-${Date.now()}`,
                      url: imageUrl,
                      caption: captionText
                    }
                  ]);
                  setNewWorkUrl('');
                  setNewWorkCaption('');
                  showToast('Новая карточка работы добавлена');
                }}
                className="sm:col-span-3 bg-[var(--accent)] text-[var(--accent-text)] font-semibold rounded-xl px-4 py-2.5 shadow-md"
              >
                + Добавить карточку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. НАСТРОЙКИ СТУДИИ */}
      {adminTab === 'settings' && (
        <div className="glass-card rounded-3xl p-5 space-y-4 text-xs">
          <h3 className="text-base font-bold text-[var(--text-main)]">Основные данные студии и 3 карточки</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-muted)] mb-1">Название студии</label>
              <input
                type="text"
                value={tenant.name}
                onChange={(e) => updateTenantField('name', e.target.value)}
                className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[var(--text-muted)] mb-1">Телефон</label>
              <input
                type="text"
                value={tenant.phone}
                onChange={(e) => updateTenantField('phone', e.target.value)}
                className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[var(--text-muted)] mb-1">
                Адрес (автоматически обновляет маршрут в навигаторе)
              </label>
              <input
                type="text"
                value={tenant.address}
                onChange={(e) => updateTenantField('address', e.target.value)}
                className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[var(--text-muted)] mb-1">Открытие</label>
              <input
                type="text"
                value={tenant.workHours.start}
                onChange={(e) =>
                  updateTenantField('workHours', { ...tenant.workHours, start: e.target.value })
                }
                className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[var(--text-muted)] mb-1">Закрытие</label>
              <input
                type="text"
                value={tenant.workHours.end}
                onChange={(e) =>
                  updateTenantField('workHours', { ...tenant.workHours, end: e.target.value })
                }
                className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
            <div className="font-semibold text-[var(--text-main)]">Три информационные карточки на главной</div>
            {tenant.highlights.map((h) => (
              <div key={h.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={h.title}
                  onChange={(e) => {
                    const updated = tenant.highlights.map((item) =>
                      item.id === h.id ? { ...item, title: e.target.value } : item
                    );
                    updateTenantField('highlights', updated);
                  }}
                  className="soft-btn rounded-xl px-3 py-2 text-[var(--accent)] focus:outline-none"
                />
                <input
                  type="text"
                  value={h.desc}
                  onChange={(e) => {
                    const updated = tenant.highlights.map((item) =>
                      item.id === h.id ? { ...item, desc: e.target.value } : item
                    );
                    updateTenantField('highlights', updated);
                  }}
                  className="soft-btn rounded-xl px-3 py-2 text-[var(--text-muted)] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. УМНЫЙ ИИ-ПОМОЩНИК ВЛАДЕЛЬЦА */}
      {adminTab === 'ai' && (
        <div className="glass-card rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-main)]">Умный ИИ бизнес-ассистент</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Отвечает по реальной кассе, расписанию и помогает развивать салон
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {[
              'Что у меня по записям и выручке?',
              'Как повысить средний чек в моей студии?',
              'Придумай акцию для загрузки утренних часов'
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleOwnerAiSend(q)}
                className="soft-btn px-3.5 py-2 rounded-xl text-[var(--text-main)]"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="h-64 overflow-y-auto space-y-2.5 bg-[var(--bg)]/50 p-4 rounded-2xl">
            {ownerAiMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-[var(--accent)] text-[var(--accent-text)] font-medium'
                      : 'glass-card text-[var(--text-main)]'
                  }`}
                >
                  {String(m.text || '')}
                </div>
              </div>
            ))}
            {isOwnerAiLoading && (
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
                <span>Анализирую данные студии...</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Спросите про выручку, расписание или маркетинг..."
              value={ownerAiInput}
              onChange={(e) => setOwnerAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleOwnerAiSend()}
              className="flex-1 soft-btn rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleOwnerAiSend()}
              className="bg-[var(--accent)] text-[var(--accent-text)] px-4 py-2.5 rounded-xl font-semibold text-xs"
            >
              Спросить
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО РУЧНОГО СОЗДАНИЯ И РЕДАКТИРОВАНИЯ ЗАПИСИ */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveManualBooking}
            className="w-full max-w-md liquid-glass rounded-3xl p-5 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                {editingBookingId ? 'Редактировать запись' : 'Новая запись вручную'}
              </h3>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="col-span-2">
                <label className="block text-[var(--text-muted)] mb-1">Имя клиента</label>
                <input
                  type="text"
                  required
                  value={formBooking.clientName}
                  onChange={(e) => setFormBooking({ ...formBooking, clientName: e.target.value })}
                  className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[var(--text-muted)] mb-1">Телефон</label>
                <input
                  type="text"
                  required
                  value={formBooking.clientPhone}
                  onChange={(e) => setFormBooking({ ...formBooking, clientPhone: e.target.value })}
                  className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[var(--text-muted)] mb-1">Услуга (можно вписать свою)</label>
                <input
                  type="text"
                  required
                  value={formBooking.serviceName}
                  onChange={(e) => setFormBooking({ ...formBooking, serviceName: e.target.value })}
                  className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Цена (₽)</label>
                <input
                  type="number"
                  value={formBooking.price}
                  onChange={(e) => setFormBooking({ ...formBooking, price: Number(e.target.value) })}
                  className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--accent)] font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Длительность (мин)</label>
                <input
                  type="number"
                  value={formBooking.duration}
                  onChange={(e) =>
                    setFormBooking({ ...formBooking, duration: Number(e.target.value) })
                  }
                  className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[var(--text-muted)] mb-1">Мастер</label>
                <select
                  value={formBooking.staffId}
                  onChange={(e) => setFormBooking({ ...formBooking, staffId: e.target.value })}
                  className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
                >
                  {tenant.staff.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Дата</label>
                <input
                  type="date"
                  value={formBooking.date}
                  onChange={(e) => setFormBooking({ ...formBooking, date: e.target.value })}
                  className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[var(--text-muted)] mb-1">Время</label>
                <input
                  type="time"
                  value={formBooking.time}
                  onChange={(e) => setFormBooking({ ...formBooking, time: e.target.value })}
                  className="w-full soft-btn rounded-xl px-3 py-2 text-[var(--text-main)] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[var(--accent)] text-[var(--accent-text)] font-bold shadow-md"
            >
              Сохранить запись
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
