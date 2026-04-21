import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart, Plus, Minus, X, Flame, Lock, Settings, CheckCircle,
  ChevronRight, Sparkles, MessageCircle, Edit3, Save, LogOut,
  AlertCircle, Star, TrendingUp, Heart, Eye, EyeOff
} from 'lucide-react';

/* ============================================================
 *  🍗 MEXICANA CHICKEN — 인터랙티브 대시보드 & 키오스크
 *  Version 1.0
 *  - 고객 주문 화면 + 관리자 편집 모드 통합
 *  - 사장님 한마디, 상황별 큐레이션, 주문·결제 플로우
 *  - window.storage 로 사장님 편집 내용 영구 저장
 * ============================================================ */

/* ───── 큐레이션 태그 정의 (확장 가능) ───── */
const CURATION_TAGS = {
  family:    { icon: '👨‍👩‍👧‍👦', label: '가족모임',   color: 'bg-amber-100 text-amber-800 border-amber-200' },
  solo:      { icon: '🍺',         label: '혼술·혼밥',  color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  date:      { icon: '💑',         label: '데이트',     color: 'bg-rose-100 text-rose-700 border-rose-200' },
  party:     { icon: '🎉',         label: '파티·모임',  color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' },
  kid:       { icon: '🧒',         label: '아이도 좋아',color: 'bg-sky-100 text-sky-700 border-sky-200' },
  spicy:     { icon: '🌶️',        label: '매운맛 러버',color: 'bg-red-100 text-red-700 border-red-200' },
  cheese:    { icon: '🧀',         label: '치즈 러버',  color: 'bg-orange-100 text-orange-700 border-orange-200' },
  sweet:     { icon: '🍯',         label: '달달한맛',   color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  garlic:    { icon: '🧄',         label: '마늘러버',   color: 'bg-lime-100 text-lime-700 border-lime-200' },
  classic:   { icon: '🏠',         label: '추억·클래식',color: 'bg-stone-100 text-stone-700 border-stone-200' },
  night:     { icon: '🌙',         label: '야식·심야',  color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  business:  { icon: '💼',         label: '회식·깔끔', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  first:     { icon: '🤝',         label: '처음이면',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  challenge: { icon: '🔥',         label: '매운맛 챌린지', color: 'bg-rose-200 text-rose-900 border-rose-300' },
};

/* ───── 한마리 치킨 기본 데이터 ───── */
const MENU_DATA = [
  {
    id: 'fried', name: '후라이드', price: 18000, emoji: '🍗',
    tagline: '90년대 퇴근길 아빠가 사오시던 그 맛',
    description: '튀김옷은 얇고 속살은 촉촉한 정통 한국식 통닭. 소스 없이 닭 자체의 고소함을 즐길 수 있는 가장 정직한 한 마리입니다.',
    spice: 0, sweet: 1, salty: 2, rich: 3,
    tags: ['family', 'solo', 'classic', 'kid', 'first'],
    ownerDefault: '처음 오신 분께 제일 먼저 추천드려요. 어떤 반찬이든 무난하게 어울립니다.',
    pairing: '생맥주 · 콜라 · 피클',
  },
  {
    id: 'yangnyeom', name: '양념치킨', price: 19000, emoji: '🍗',
    tagline: '양념치킨의 원조, 15가지 특별한 재료',
    description: '4가지 신선한 야채와 15가지 비법 재료로 만든 멕시카나 시그니처 양념소스. 단짠의 밸런스가 좋아서 모두가 무난히 좋아하는 국민 메뉴.',
    spice: 1, sweet: 3, salty: 2, rich: 2,
    tags: ['family', 'kid', 'classic'],
    ownerDefault: '아이가 있는 가족 모임이라면 양념으로 주세요. 호불호가 가장 적어요.',
    pairing: '사이다 · 콜라 · 치킨무',
  },
  {
    id: 'half', name: '후라이드+양념 반반', price: 19000, emoji: '🍗',
    tagline: '고민될 때는 역시 반반',
    description: '오리지널 후라이드의 담백함 + 시그니처 양념의 달콤함. 입맛이 다른 사람들이 한 테이블에 앉았을 때 최적의 선택.',
    spice: 1, sweet: 2, salty: 2, rich: 2,
    tags: ['family', 'first', 'party'],
    ownerDefault: '두세 분이 드실 때, 취향이 다르실 때 가장 안전한 선택이에요.',
    pairing: '생맥주 · 사이다',
  },
  {
    id: 'gomae', name: '고매치킨', price: 20000, emoji: '🌶️', isNewDefault: true,
    tagline: '고추와 마요의 새로운 밸런스 — NEW',
    description: '매콤한 청양고추의 향과 고소한 마요 소스가 어우러진 신메뉴. 매운맛은 적당하면서 끝맛이 크리미하게 마무리됩니다.',
    spice: 2, sweet: 1, salty: 2, rich: 3,
    tags: ['date', 'solo', 'night'],
    ownerDefault: '새로 나왔어요! 적당히 매운맛이 있으면서 크리미하게 끝나는 조합을 원하시면 고매치킨.',
    pairing: '하이볼 · 생맥주',
  },
  {
    id: 'ddaengcho', name: '땡쵸치킨', price: 20000, emoji: '🔥',
    tagline: '유튜브 치킨월드컵 1위, 불맛까지 머금은 매운맛',
    description: '3가지 고춧가루로 매운맛의 레이어를 쌓고, 팬에 볶아 불향까지 더한 "맛있게 매운" 치킨의 1위. 너무 맵지는 않아 고추 러버가 아니어도 도전 가능.',
    spice: 3, sweet: 1, salty: 3, rich: 2,
    tags: ['spicy', 'solo', 'night', 'party'],
    ownerDefault: '매운 거 좋아하시면 여기서부터 시작하세요. 불맛이 포인트예요.',
    pairing: '생맥주 · 하이볼 · 시원한 음료',
  },
  {
    id: 'garlic', name: '마늘알마니치킨', price: 21000, emoji: '🧄',
    tagline: '큐브 마늘의 알싸한 한 방',
    description: '생마늘 큐브의 알싸함과 아삭함이 후라이드의 바삭함과 만나 탄생한 리얼 마늘치킨. 어른들 입맛을 제대로 저격합니다.',
    spice: 1, sweet: 0, salty: 3, rich: 4,
    tags: ['garlic', 'business', 'solo', 'night'],
    ownerDefault: '생마늘 그대로 들어가서 향이 살아있어요. 맥주랑 드시면 끝내줍니다.',
    pairing: '생맥주 · 소주',
  },
  {
    id: 'kkanpoong', name: '깐풍요리치킨', price: 21000, emoji: '🥢',
    tagline: '치킨을 넘어선 한 접시의 중식 요리',
    description: '숙성 마늘과 대파로 맛을 낸 프리미엄 깐풍기 소스에 불향을 입힌 단짠매콤 치킨. "요리"라는 이름이 붙은 이유가 있습니다.',
    spice: 2, sweet: 2, salty: 3, rich: 3,
    tags: ['date', 'party', 'business'],
    ownerDefault: '중식집 깐풍기 좋아하시는 분이라면 무조건. 테이블에 올리면 분위기 달라져요.',
    pairing: '고량주 · 생맥주 · 소주',
  },
  {
    id: 'gangjeong', name: '강정치킨', price: 19000, emoji: '🍯',
    tagline: '매니아들이 숨겨둔 찐 추천 메뉴',
    description: '양념이 끈적하게 튀김옷과 합쳐지면서 더 바삭해지는 독특한 식감. 일반 양념보다 연하면서 한방 같은 풍미가 도는, 치킨 덕후들의 "진짜배기".',
    spice: 1, sweet: 3, salty: 2, rich: 3,
    tags: ['solo', 'party', 'first'],
    ownerDefault: '양념치킨 드셔본 분은 다음엔 강정으로 가보세요. 한 번 맛 들이면 돌아오세요.',
    pairing: '생맥주 · 소주',
  },
  {
    id: 'mayo', name: '모두의마요치킨', price: 20000, emoji: '🥚',
    tagline: '모두의 마음을 사로잡는 달콤고소함',
    description: '갈릭찹찹소스가 함께 제공되어 찍먹(달콤고소) 또는 부먹(새콤달콤매콤)으로 즐길 수 있는 메뉴. 아이와 어른이 한 판으로 모두 행복한 선택.',
    spice: 1, sweet: 3, salty: 2, rich: 4,
    tags: ['family', 'kid', 'date'],
    ownerDefault: '소스가 따로 와요. 아이는 찍먹으로, 어른은 부먹으로 나눠 드시면 좋아요.',
    pairing: '사이다 · 콜라 · 우유',
  },
  {
    id: 'pprigo-cheese', name: '뿌리고치킨 (눈꽃치즈)', price: 20000, emoji: '🧀',
    tagline: '치즈 함량 20% 업! 뿌려 먹는 바삭함',
    description: '구 치토스치킨의 바리에이션. 매콤 달콤 바삭한 치즈 시즈닝을 뿌려 먹어서 손에서 멈추지 않는 맛. MZ들의 최애 라인.',
    spice: 1, sweet: 2, salty: 3, rich: 4,
    tags: ['cheese', 'night', 'party', 'kid'],
    ownerDefault: '치즈 좋아하면 무조건. 시즈닝 한 번 더 원하시면 말씀하세요.',
    pairing: '콜라 · 사이다',
  },
  {
    id: 'pprigo-spicy', name: '뿌리고치킨 (매콤달콤)', price: 20000, emoji: '🌶️',
    tagline: '맵단짠 시즈닝이 뿌려진 중독성',
    description: '청양고추 향이 나는 매콤짭짤 시즈닝. 일반 치즈 시즈닝보다 덜 느끼해서 "자꾸 손이 가는" 중독성이 특징.',
    spice: 2, sweet: 2, salty: 3, rich: 3,
    tags: ['spicy', 'night', 'solo', 'party'],
    ownerDefault: '맵단짠 좋아하시면 눈꽃치즈보다 이쪽을 더 추천드려요.',
    pairing: '생맥주 · 하이볼',
  },
  {
    id: 'honey', name: '허니벌꿀치킨', price: 19000, emoji: '🍯',
    tagline: '달달함이 입 안을 감싸는 디저트 치킨',
    description: '꿀의 자연스러운 달콤함이 바삭한 튀김옷과 만나 치킨이면서도 디저트 같은 만족감을 주는 메뉴. 아이 있는 가족, 단 거 좋아하시는 분께.',
    spice: 0, sweet: 5, salty: 1, rich: 2,
    tags: ['sweet', 'kid', 'family', 'date'],
    ownerDefault: '애기들 있으면 이거예요. 아이스 아메리카노랑도 의외로 잘 어울려요.',
    pairing: '우유 · 콜라 · 아이스 아메리카노',
  },
  {
    id: 'ganjang', name: '간장치킨', price: 19000, emoji: '🥢',
    tagline: '100% 의성 마늘 간장소스의 깔끔함',
    description: '의성 산지 마늘이 들어간 간장소스로 풍미는 깊지만 느끼하지 않고 깔끔한 마무리. 어른 입맛 저격, 회식 테이블 단골.',
    spice: 0, sweet: 1, salty: 4, rich: 3,
    tags: ['business', 'classic', 'family'],
    ownerDefault: '회식이나 어른분들 모인 자리에 가장 많이 나가는 메뉴예요.',
    pairing: '소주 · 막걸리 · 생맥주',
  },
  {
    id: 'buldak', name: '불닭치킨', price: 21000, emoji: '🔥',
    tagline: '도전하시겠어요? 극강의 매운맛',
    description: '매운맛 5단계 끝판왕. 땡쵸보다 한참 위의 매운맛으로, 매운 거 진심인 분들만 도전하시길 권합니다.',
    spice: 5, sweet: 1, salty: 3, rich: 2,
    tags: ['challenge', 'spicy', 'solo'],
    ownerDefault: '정말 매운 거 좋아하시는 분만 시켜주세요. 우유 꼭 준비해드립니다.',
    pairing: '우유 · 생맥주 · 스파클링',
  },
];

/* ───── 사이드 메뉴 ───── */
const SIDE_DATA = [
  { id: 's1',  name: '핑거칩',              price: 7000 },
  { id: 's2',  name: '소떡소떡 (기본)',     price: 3000 },
  { id: 's3',  name: '소떡소떡 (뿌리고)',   price: 3000 },
  { id: 's4',  name: '소떡소떡 (땡쵸)',     price: 3000 },
  { id: 's5',  name: '어니언링',            price: 4000 },
  { id: 's6',  name: '멕시감자',            price: 4000 },
  { id: 's7',  name: '고추감자',            price: 4000 },
  { id: 's8',  name: '단짠감자치즈볼',      price: 4000 },
  { id: 's9',  name: '오메이징 쉬림프 FULL(4+4)', price: 12000 },
  { id: 's10', name: '오메이징 쉬림프 HALF(2+2)', price: 7000 },
  { id: 's11', name: '치즈스틱',            price: 3000 },
  { id: 's12', name: '케이준넛겟감자',      price: 4000 },
  { id: 's13', name: '더블치즈볼',          price: 4000 },
  { id: 's14', name: '수작 미니 핫도그',    price: 5000 },
  { id: 's15', name: '모래집 후라이드',     price: 5000 },
  { id: 's16', name: '멘보샤',              price: 5500 },
];

/* ───── 부위별 치킨 (가격은 관리자에서 확정) ───── */
const PART_DATA = [
  { id: 'p1', name: '멕시핀 (다리)',           price: 23000, note: '소스 변경은 매장 문의' },
  { id: 'p2', name: '멕시윙 (날개)',           price: 23000, note: '소스 변경은 매장 문의' },
  { id: 'p3', name: '멕시콤보 (날개+다리)',    price: 25000, note: '소스 변경은 매장 문의' },
];

/* ───── 투마리 세트 추가 금액 (기준: 후라이드+후라이드 = 25,000원) ───── */
const TWO_PIECE_BASE = 25000;
const TWO_PIECE_ADDONS = {
  'fried': 0, 'yangnyeom': 1000, 'ganjang': 1000, 'honey': 2000,
  'gangjeong': 1000, 'ddaengcho': 3000, 'pprigo-cheese': 2000,
  'pprigo-spicy': 3000, 'mayo': 3000, 'buldak': 3000,
  'garlic': 4000, 'kkanpoong': 3000,
};

/* ───── 영구 저장 헬퍼 ───── */
const STORE_KEYS = {
  ANNOUNCEMENT: 'mexicana:announcement',
  OVERRIDES:    'mexicana:menuOverrides',
  SETTINGS:     'mexicana:settings',
};

async function loadStore(key, fallback) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : fallback;
  } catch { return fallback; }
}
async function saveStore(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); return true; }
  catch (e) { console.error('save failed', e); return false; }
}

/* ───── 맛 프로필 바 ───── */
function FlavorBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 text-stone-600">{label}</span>
      <div className="flex-1 flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <div key={i}
            className={`h-2 flex-1 rounded-sm transition-all ${i <= value ? color : 'bg-stone-200'}`} />
        ))}
      </div>
    </div>
  );
}

/* ───── 배지 ───── */
function Badge({ children, variant = 'default' }) {
  const map = {
    new:     'bg-red-500 text-white',
    sold:    'bg-stone-400 text-white',
    default: 'bg-amber-100 text-amber-800',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${map[variant]}`}>{children}</span>;
}

/* =========================================================
 *  메인 앱
 * ========================================================= */
export default function App() {
  /* 상태 */
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState('customer'); // customer | admin
  const [cart, setCart] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('browse'); // browse | review | done
  const [orderNumber, setOrderNumber] = useState(null);

  // 로고 탭 카운트 (관리자 진입용)
  const [logoTaps, setLogoTaps] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // 사장님 편집 데이터
  const [announcement, setAnnouncement] = useState('안녕하세요! 오늘도 바삭하게 튀겨드릴게요 🍗');
  const [overrides, setOverrides] = useState({}); // { [id]: { soldOut, isNew, priceOverride, ownerNote } }
  const [settings, setSettings] = useState({ adminPin: '1234', storeName: '멕시카나 치킨' });

  /* 초기 로드 */
  useEffect(() => {
    (async () => {
      const [a, o, s] = await Promise.all([
        loadStore(STORE_KEYS.ANNOUNCEMENT, null),
        loadStore(STORE_KEYS.OVERRIDES, null),
        loadStore(STORE_KEYS.SETTINGS, null),
      ]);
      if (a) setAnnouncement(a);
      if (o) setOverrides(o);
      if (s) setSettings(s);
      setLoaded(true);
    })();
  }, []);

  /* 메뉴 병합 — 기본 데이터 + 사장님 override */
  const menus = useMemo(() => MENU_DATA.map(m => {
    const o = overrides[m.id] || {};
    return {
      ...m,
      price: o.priceOverride ?? m.price,
      isSoldOut: !!o.soldOut,
      isNew: o.isNew ?? (m.isNewDefault || false),
      ownerNote: o.ownerNote ?? m.ownerDefault,
    };
  }), [overrides]);

  /* 필터링 */
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return menus;
    if (activeFilter === 'new') return menus.filter(m => m.isNew);
    return menus.filter(m => m.tags.includes(activeFilter));
  }, [menus, activeFilter]);

  /* 장바구니 */
  const addToCart = (item, type = 'menu', options = {}) => {
    setCart(prev => {
      const key = `${type}-${item.id}-${options.twoPiece ? 'set' : 'one'}`;
      const existing = prev.find(c => c.key === key);
      if (existing) {
        return prev.map(c => c.key === key ? { ...c, qty: c.qty + 1 } : c);
      }
      const basePrice = options.twoPiece
        ? TWO_PIECE_BASE + (TWO_PIECE_ADDONS[item.id] || 0)
        : item.price;
      return [...prev, {
        key, id: item.id, name: item.name, emoji: item.emoji,
        price: basePrice, qty: 1, type, twoPiece: !!options.twoPiece
      }];
    });
  };
  const changeQty = (key, delta) => {
    setCart(prev => prev.flatMap(c => {
      if (c.key !== key) return [c];
      const q = c.qty + delta;
      return q <= 0 ? [] : [{ ...c, qty: q }];
    }));
  };
  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  /* 로고 탭 → PIN 모달 */
  const handleLogoTap = () => {
    const n = logoTaps + 1;
    setLogoTaps(n);
    setTimeout(() => setLogoTaps(0), 2000);
    if (n >= 5) {
      setLogoTaps(0);
      setShowPinModal(true);
    }
  };
  const tryPin = () => {
    if (pinInput === settings.adminPin) {
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
      setMode('admin');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
    }
  };

  /* 사장님 저장 함수 */
  const saveAnnouncement = async (v) => {
    setAnnouncement(v);
    await saveStore(STORE_KEYS.ANNOUNCEMENT, v);
  };
  const saveOverrides = async (v) => {
    setOverrides(v);
    await saveStore(STORE_KEYS.OVERRIDES, v);
  };
  const updateOverride = (id, patch) => {
    const next = { ...overrides, [id]: { ...(overrides[id] || {}), ...patch } };
    saveOverrides(next);
  };

  /* 주문 확정 */
  const confirmOrder = () => {
    const num = Math.floor(Math.random() * 9000) + 1000;
    setOrderNumber(num);
    setCheckoutStep('done');
  };
  const resetOrder = () => {
    setCart([]);
    setCheckoutStep('browse');
    setOrderNumber(null);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
        <div className="text-stone-500">로드 중…</div>
      </div>
    );
  }

  /* ═════ 관리자 모드 ═════ */
  if (mode === 'admin') {
    return <AdminView
      announcement={announcement}
      saveAnnouncement={saveAnnouncement}
      menus={menus}
      overrides={overrides}
      updateOverride={updateOverride}
      settings={settings}
      saveSettings={async (s) => { setSettings(s); await saveStore(STORE_KEYS.SETTINGS, s); }}
      onExit={() => setMode('customer')}
    />;
  }

  /* ═════ 주문 완료 ═════ */
  if (checkoutStep === 'done') {
    return <OrderDoneView orderNumber={orderNumber} cart={cart} total={cartTotal} onReset={resetOrder} />;
  }

  /* ═════ 주문 확인 ═════ */
  if (checkoutStep === 'review') {
    return <ReviewView
      cart={cart} total={cartTotal}
      onBack={() => setCheckoutStep('browse')}
      onConfirm={confirmOrder}
      changeQty={changeQty}
    />;
  }

  /* ═════ 고객 메인 화면 ═════ */
  return (
    <div className="min-h-screen bg-[#FFF8E7] text-stone-900"
         style={{ fontFamily: "'Pretendard','Apple SD Gothic Neo',system-ui,sans-serif" }}>
      {/* 폰트 로드 */}
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css');
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes pulse-red { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.5); } 50% { box-shadow: 0 0 0 12px rgba(220,38,38,0); } }
        .anim-pulse-red { animation: pulse-red 2s infinite; }
        @keyframes wiggle { 0%,100% {transform:rotate(-2deg);} 50% {transform:rotate(2deg);} }
        .anim-wiggle { animation: wiggle 3s ease-in-out infinite; }
      `}</style>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-[#B91C1C] text-white shadow-lg">
        <div className="px-6 py-3 flex items-center justify-between">
          <button onClick={handleLogoTap} className="flex items-center gap-3 select-none">
            <span className="text-3xl anim-wiggle inline-block">🍗</span>
            <div>
              <div className="font-black text-xl tracking-tight">mexicana</div>
              <div className="text-xs opacity-80 -mt-1">Chicken · Since 1989</div>
            </div>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-green-500 px-2 py-1 rounded-full font-semibold">● 영업중</span>
            <button
              onClick={() => setCheckoutStep('review')}
              disabled={cartCount === 0}
              className={`relative flex items-center gap-2 px-5 py-3 rounded-full font-bold transition
                ${cartCount === 0 ? 'bg-white/20 text-white/50 cursor-not-allowed'
                                  : 'bg-yellow-400 text-red-900 hover:bg-yellow-300 anim-pulse-red'}`}>
              <ShoppingCart size={18} />
              <span>장바구니</span>
              {cartCount > 0 && (
                <span className="bg-red-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* 사장님 한마디 */}
        <div className="bg-yellow-300 text-red-900 px-6 py-2 text-sm font-semibold flex items-center gap-2">
          <MessageCircle size={16} />
          <span className="opacity-70 text-xs">사장님 한마디</span>
          <span className="truncate">{announcement}</span>
        </div>
      </header>

      {/* ── 큐레이션 필터 ── */}
      <section className="px-6 py-5 bg-white border-b border-stone-200 sticky top-[96px] z-20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-red-600" />
          <h2 className="text-sm font-bold text-stone-700">오늘 어떤 기분이세요?</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <FilterChip active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
            🔎 전체 보기
          </FilterChip>
          <FilterChip active={activeFilter === 'new'} onClick={() => setActiveFilter('new')}>
            ✨ 신메뉴
          </FilterChip>
          {Object.entries(CURATION_TAGS).map(([k, t]) => (
            <FilterChip key={k} active={activeFilter === k} onClick={() => setActiveFilter(k)}>
              {t.icon} {t.label}
            </FilterChip>
          ))}
        </div>
      </section>

      {/* ── 메뉴 그리드 ── */}
      <main className="px-6 py-6">
        <h2 className="text-2xl font-black mb-4 text-red-900">
          한마리 치킨 <span className="text-sm font-normal text-stone-500">· {filtered.length}종</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(m => (
            <MenuCard key={m.id} menu={m} onClick={() => setSelectedMenu(m)} />
          ))}
        </div>

        {/* 투마리 세트 안내 */}
        <section className="mt-10 bg-gradient-to-r from-red-900 to-red-700 text-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="text-yellow-400" />
            <h3 className="text-xl font-bold">투마리 세트로 드세요!</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">
            후라이드 + 후라이드 {TWO_PIECE_BASE.toLocaleString()}원부터.
            메뉴 카드에서 "투마리 세트 추가" 버튼으로 구성할 수 있어요.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {Object.entries(TWO_PIECE_ADDONS).slice(0, 8).map(([id, add]) => {
              const m = MENU_DATA.find(x => x.id === id);
              if (!m) return null;
              return (
                <div key={id} className="bg-white/10 rounded px-2 py-1.5">
                  {m.name} <span className="opacity-60">+{add.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 사이드 */}
        <h2 className="text-2xl font-black mt-10 mb-4 text-red-900">사이드 메뉴</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {SIDE_DATA.map(s => (
            <button key={s.id} onClick={() => addToCart(s, 'side')}
              className="bg-white border-2 border-stone-200 rounded-xl p-3 text-left hover:border-red-400 hover:shadow-md transition active:scale-95">
              <div className="font-semibold text-sm">{s.name}</div>
              <div className="text-red-700 font-bold mt-1">{s.price.toLocaleString()}원</div>
              <div className="text-xs text-stone-500 mt-1 flex items-center gap-1"><Plus size={12}/> 담기</div>
            </button>
          ))}
        </div>

        {/* 부위별 */}
        <h2 className="text-2xl font-black mt-10 mb-4 text-red-900">부위별 치킨</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PART_DATA.map(p => (
            <button key={p.id} onClick={() => addToCart(p, 'part')}
              className="bg-white border-2 border-stone-200 rounded-xl p-4 text-left hover:border-red-400 hover:shadow-md transition active:scale-95">
              <div className="font-bold">{p.name}</div>
              <div className="text-red-700 font-bold text-lg mt-1">{p.price.toLocaleString()}원</div>
              <div className="text-xs text-stone-500 mt-1">{p.note}</div>
            </button>
          ))}
        </div>

        <footer className="mt-14 pb-24 text-center text-xs text-stone-400">
          멕시카나 치킨 · 로고를 5번 탭하면 관리자 모드로 진입합니다.
        </footer>
      </main>

      {/* ── 메뉴 상세 모달 ── */}
      {selectedMenu && (
        <MenuDetailModal
          menu={selectedMenu}
          onClose={() => setSelectedMenu(null)}
          onAdd={(opts) => { addToCart(selectedMenu, 'menu', opts); setSelectedMenu(null); }}
        />
      )}

      {/* ── PIN 모달 ── */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
             onClick={() => setShowPinModal(false)}>
          <div onClick={(e) => e.stopPropagation()}
               className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="text-red-600" />
              <h3 className="font-bold text-lg">관리자 진입</h3>
            </div>
            <p className="text-sm text-stone-600 mb-3">4자리 PIN을 입력하세요. (초기값: 1234)</p>
            <input
              type="password" value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryPin()}
              className={`w-full border-2 rounded-lg px-4 py-3 text-center text-2xl tracking-widest ${pinError ? 'border-red-500 bg-red-50' : 'border-stone-300'}`}
              maxLength={6} autoFocus
            />
            {pinError && <p className="text-red-600 text-xs mt-2">PIN이 일치하지 않아요</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowPinModal(false)}
                className="flex-1 py-3 rounded-lg bg-stone-200 font-semibold">취소</button>
              <button onClick={tryPin}
                className="flex-1 py-3 rounded-lg bg-red-600 text-white font-semibold">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 *  🍗 메뉴 카드
 * ───────────────────────────────────────────────────── */
function MenuCard({ menu, onClick }) {
  const soldOut = menu.isSoldOut;
  return (
    <button
      onClick={!soldOut ? onClick : undefined}
      disabled={soldOut}
      className={`text-left bg-white rounded-2xl border-2 p-4 flex flex-col transition relative
        ${soldOut ? 'border-stone-200 opacity-50 cursor-not-allowed'
                  : 'border-stone-200 hover:border-red-400 hover:shadow-xl hover:-translate-y-1'}`}>
      {/* 배지 */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
        {menu.isNew && !soldOut && <Badge variant="new">NEW</Badge>}
        {soldOut && <Badge variant="sold">품절</Badge>}
      </div>

      <div className="text-5xl mb-2">{menu.emoji}</div>
      <div className="font-black text-lg leading-tight">{menu.name}</div>
      <div className="text-xs text-stone-500 mt-0.5 mb-2 line-clamp-2 min-h-[2.5em]">{menu.tagline}</div>

      <div className="flex flex-wrap gap-1 mb-3">
        {menu.tags.slice(0, 3).map(t => {
          const c = CURATION_TAGS[t];
          if (!c) return null;
          return <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full border ${c.color}`}>{c.icon}{c.label}</span>;
        })}
      </div>

      <div className="mt-auto flex items-end justify-between">
        <div>
          <div className="text-red-700 font-black text-xl">{menu.price.toLocaleString()}원</div>
          {menu.spice >= 3 && (
            <div className="flex items-center gap-0.5 text-red-500 text-xs">
              {Array.from({ length: menu.spice }).map((_, i) => <Flame key={i} size={12} fill="currentColor" />)}
            </div>
          )}
        </div>
        {!soldOut && <div className="bg-red-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow">
          <Plus size={18} />
        </div>}
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────
 *  필터 칩
 * ───────────────────────────────────────────────────── */
function FilterChip({ active, children, onClick }) {
  return (
    <button onClick={onClick}
      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border-2 transition flex-shrink-0
        ${active ? 'bg-red-600 text-white border-red-600'
                 : 'bg-white text-stone-700 border-stone-200 hover:border-red-400'}`}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────
 *  메뉴 상세 모달
 * ───────────────────────────────────────────────────── */
function MenuDetailModal({ menu, onClose, onAdd }) {
  const addonPrice = TWO_PIECE_ADDONS[menu.id];
  const canTwoPiece = addonPrice !== undefined;
  const twoPiecePrice = canTwoPiece ? TWO_PIECE_BASE + addonPrice : null;

  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-end md:items-center justify-center p-0 md:p-6"
         onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
           className="bg-[#FFF8E7] rounded-t-3xl md:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
           style={{ animation: 'slideUp 0.3s ease-out' }}>
        {/* 헤더 */}
        <div className="bg-red-700 text-white p-6 rounded-t-3xl md:rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 rounded-full p-2 hover:bg-white/30">
            <X size={20} />
          </button>
          <div className="flex items-start gap-4">
            <div className="text-7xl">{menu.emoji}</div>
            <div>
              <div className="flex gap-2 mb-2">
                {menu.isNew && <Badge variant="new">NEW</Badge>}
              </div>
              <h2 className="text-2xl font-black">{menu.name}</h2>
              <p className="text-sm opacity-80 mt-1">{menu.tagline}</p>
              <div className="text-3xl font-black mt-3">{menu.price.toLocaleString()}원</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* 설명 */}
          <div>
            <h3 className="font-bold text-sm text-stone-500 mb-1">어떤 치킨인가요</h3>
            <p className="text-sm leading-relaxed">{menu.description}</p>
          </div>

          {/* 사장님 한마디 */}
          <div className="bg-white border-2 border-yellow-400 rounded-xl p-4 relative">
            <div className="absolute -top-2.5 left-4 bg-yellow-400 text-red-900 text-xs font-bold px-2 py-0.5 rounded">
              👨‍🍳 사장님 Pick
            </div>
            <p className="text-sm mt-1 italic">"{menu.ownerNote}"</p>
          </div>

          {/* 맛 프로필 */}
          <div>
            <h3 className="font-bold text-sm text-stone-500 mb-2">맛 프로필</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <FlavorBar label="매운맛" value={menu.spice} color="bg-red-500" />
              <FlavorBar label="달콤함" value={menu.sweet} color="bg-amber-500" />
              <FlavorBar label="짭조름함" value={menu.salty} color="bg-stone-600" />
              <FlavorBar label="진한맛" value={menu.rich} color="bg-orange-600" />
            </div>
          </div>

          {/* 어울림 */}
          {menu.pairing && (
            <div className="flex gap-2 text-sm">
              <span className="text-stone-500 font-bold">🥂 페어링:</span>
              <span>{menu.pairing}</span>
            </div>
          )}

          {/* 상황 태그 */}
          <div>
            <h3 className="font-bold text-sm text-stone-500 mb-2">이런 상황에 추천해요</h3>
            <div className="flex flex-wrap gap-2">
              {menu.tags.map(t => {
                const c = CURATION_TAGS[t];
                if (!c) return null;
                return <span key={t} className={`text-xs px-3 py-1 rounded-full border ${c.color}`}>{c.icon} {c.label}</span>;
              })}
            </div>
          </div>

          {/* 주문 버튼 */}
          <div className="border-t-2 border-stone-200 pt-4 space-y-2">
            <button onClick={() => onAdd({ twoPiece: false })}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition active:scale-95">
              <Plus size={22} /> 한마리 담기 · {menu.price.toLocaleString()}원
            </button>
            {canTwoPiece && (
              <button onClick={() => onAdd({ twoPiece: true })}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition active:scale-95">
                🍗🍗 투마리 세트로 담기 · {twoPiecePrice.toLocaleString()}원
                <span className="text-xs">(후라이드+{menu.name})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 *  주문 확인 화면
 * ───────────────────────────────────────────────────── */
function ReviewView({ cart, total, onBack, onConfirm, changeQty }) {
  return (
    <div className="min-h-screen bg-[#FFF8E7]" style={{ fontFamily: "'Pretendard',system-ui,sans-serif" }}>
      <header className="bg-red-700 text-white px-6 py-4 flex items-center gap-3">
        <button onClick={onBack} className="bg-white/20 rounded-full p-2">
          <X size={20} />
        </button>
        <h1 className="text-xl font-black">주문 확인</h1>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        {cart.length === 0 ? (
          <div className="text-center py-20 text-stone-500">장바구니가 비어있어요.</div>
        ) : (
          <>
            <div className="space-y-3">
              {cart.map(c => (
                <div key={c.key} className="bg-white rounded-xl p-4 flex items-center gap-4 border-2 border-stone-200">
                  <div className="text-3xl">{c.emoji || '🍽️'}</div>
                  <div className="flex-1">
                    <div className="font-bold">
                      {c.name} {c.twoPiece && <span className="text-xs bg-yellow-300 text-red-900 px-2 py-0.5 rounded-full ml-1">투마리세트</span>}
                    </div>
                    <div className="text-red-700 font-bold">{c.price.toLocaleString()}원</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQty(c.key, -1)} className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200"><Minus size={16} className="mx-auto" /></button>
                    <span className="w-8 text-center font-bold">{c.qty}</span>
                    <button onClick={() => changeQty(c.key, 1)} className="w-9 h-9 rounded-full bg-red-600 text-white hover:bg-red-700"><Plus size={16} className="mx-auto" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-red-900 text-white rounded-xl p-6 mt-6">
              <div className="flex justify-between text-sm opacity-80 mb-1">
                <span>총 수량</span>
                <span>{cart.reduce((s,c) => s + c.qty, 0)}개</span>
              </div>
              <div className="flex justify-between text-2xl font-black">
                <span>합계</span>
                <span>{total.toLocaleString()}원</span>
              </div>
            </div>

            <button onClick={onConfirm}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-red-900 font-black py-5 rounded-xl text-xl mt-4 active:scale-95">
              주문 확정하기
            </button>
            <p className="text-xs text-stone-500 text-center mt-2">
              확정 시 주문번호가 발급되고 카운터에서 결제를 진행합니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
 *  주문 완료 화면
 * ───────────────────────────────────────────────────── */
function OrderDoneView({ orderNumber, cart, total, onReset }) {
  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-6"
         style={{ fontFamily: "'Pretendard',system-ui,sans-serif" }}>
      <div className="max-w-md w-full text-center">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-black mb-2">주문이 접수되었어요!</h1>
        <p className="text-stone-500 mb-6">아래 번호를 카운터에 말씀해 주세요</p>

        <div className="bg-red-700 text-white rounded-2xl p-8 mb-4">
          <div className="text-sm opacity-80 mb-1">주문번호</div>
          <div className="text-6xl font-black tracking-widest">{orderNumber}</div>
        </div>

        <div className="bg-white rounded-xl p-4 text-left mb-4 border-2 border-stone-200">
          <div className="text-xs text-stone-500 font-bold mb-2">주문 내역</div>
          {cart.map(c => (
            <div key={c.key} className="flex justify-between text-sm py-1">
              <span>{c.name} × {c.qty}</span>
              <span className="font-semibold">{(c.price * c.qty).toLocaleString()}원</span>
            </div>
          ))}
          <div className="border-t border-stone-200 mt-2 pt-2 flex justify-between font-black">
            <span>합계</span>
            <span className="text-red-700">{total.toLocaleString()}원</span>
          </div>
        </div>

        <button onClick={onReset}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl active:scale-95">
          처음으로 돌아가기
        </button>
      </div>
    </div>
  );
}

/* =========================================================
 *  🔐 관리자 모드
 * ========================================================= */
function AdminView({ announcement, saveAnnouncement, menus, overrides, updateOverride, settings, saveSettings, onExit }) {
  const [draft, setDraft] = useState(announcement);
  const [saved, setSaved] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [showPinChange, setShowPinChange] = useState(false);
  const [newPin, setNewPin] = useState('');

  useEffect(() => setDraft(announcement), [announcement]);

  const saveAnn = async () => {
    await saveAnnouncement(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="min-h-screen bg-stone-100" style={{ fontFamily: "'Pretendard',system-ui,sans-serif" }}>
      <header className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Settings />
          <h1 className="font-black text-lg">사장님 관리자</h1>
        </div>
        <button onClick={onExit} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg">
          <LogOut size={18} /> 고객 화면으로
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 안내 배너 */}
        <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded">
          <p className="text-sm">
            <b>💡 사용 안내:</b> 이 화면에서 수정한 내용은 자동으로 저장되며,
            손님이 보는 화면에 즉시 반영됩니다.
          </p>
        </div>

        {/* 사장님 한마디 */}
        <section className="bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="text-red-600" />
            <h2 className="font-black text-lg">오늘의 한마디</h2>
          </div>
          <p className="text-xs text-stone-500 mb-2">상단 배너에 노출됩니다. (예: 날씨 안내, 신메뉴 추천, 재료 품절 공지 등)</p>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2}
            className="w-full border-2 border-stone-300 rounded-lg p-3 text-sm focus:border-red-500 outline-none" />
          <div className="flex items-center gap-3 mt-3">
            <button onClick={saveAnn}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-2">
              <Save size={16} /> 저장
            </button>
            {saved && <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
              <CheckCircle size={16} /> 저장됐어요!
            </span>}
          </div>
        </section>

        {/* 메뉴별 관리 */}
        <section className="bg-white rounded-2xl p-6 shadow">
          <h2 className="font-black text-lg mb-1">메뉴 관리</h2>
          <p className="text-xs text-stone-500 mb-4">품절 · NEW 배지 · 가격 · 사장님 코멘트를 수정할 수 있어요.</p>

          <div className="space-y-2">
            {menus.map(m => {
              const o = overrides[m.id] || {};
              return (
                <div key={m.id} className="border border-stone-200 rounded-lg p-3 flex items-center gap-3 flex-wrap">
                  <div className="text-2xl">{m.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">{m.name}</div>
                    <div className="text-xs text-stone-500">{m.price.toLocaleString()}원</div>
                  </div>
                  <button
                    onClick={() => updateOverride(m.id, { soldOut: !m.isSoldOut })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${m.isSoldOut ? 'bg-red-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    {m.isSoldOut ? <EyeOff size={14} /> : <Eye size={14} />}
                    {m.isSoldOut ? '품절' : '판매중'}
                  </button>
                  <button
                    onClick={() => updateOverride(m.id, { isNew: !m.isNew })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${m.isNew ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    NEW {m.isNew ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={() => setEditingMenu(m)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
                    <Edit3 size={12} /> 코멘트·가격
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 설정 */}
        <section className="bg-white rounded-2xl p-6 shadow">
          <h2 className="font-black text-lg mb-4">설정</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">관리자 PIN</div>
                <div className="text-xs text-stone-500">현재: {'•'.repeat(settings.adminPin.length)}</div>
              </div>
              <button onClick={() => { setNewPin(''); setShowPinChange(true); }}
                className="px-4 py-2 bg-stone-200 rounded-lg text-sm font-semibold">변경</button>
            </div>
          </div>
        </section>
      </div>

      {/* 메뉴 편집 모달 */}
      {editingMenu && <MenuEditModal menu={editingMenu} overrides={overrides} updateOverride={updateOverride}
        onClose={() => setEditingMenu(null)} />}

      {/* PIN 변경 모달 */}
      {showPinChange && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowPinChange(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-3">새 PIN 입력</h3>
            <input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)}
              className="w-full border-2 border-stone-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest"
              maxLength={6} autoFocus />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowPinChange(false)} className="flex-1 py-3 rounded-lg bg-stone-200 font-semibold">취소</button>
              <button onClick={async () => {
                if (newPin.length >= 4) {
                  await saveSettings({ ...settings, adminPin: newPin });
                  setShowPinChange(false);
                }
              }} className="flex-1 py-3 rounded-lg bg-red-600 text-white font-semibold">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* 메뉴 편집 모달 */
function MenuEditModal({ menu, overrides, updateOverride, onClose }) {
  const o = overrides[menu.id] || {};
  const [note, setNote] = useState(o.ownerNote ?? menu.ownerDefault);
  const [price, setPrice] = useState(o.priceOverride ?? menu.price);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="font-black text-lg mb-1">{menu.name}</h3>
        <p className="text-xs text-stone-500 mb-4">사장님 코멘트와 가격을 수정할 수 있어요.</p>

        <label className="block text-sm font-semibold mb-1">사장님 코멘트</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
          className="w-full border-2 border-stone-300 rounded-lg p-2 text-sm" />

        <label className="block text-sm font-semibold mb-1 mt-4">가격 (원)</label>
        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full border-2 border-stone-300 rounded-lg p-2 text-sm" />

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-stone-200 font-semibold">취소</button>
          <button onClick={() => {
            updateOverride(menu.id, { ownerNote: note, priceOverride: price });
            onClose();
          }} className="flex-1 py-3 rounded-lg bg-red-600 text-white font-semibold">저장</button>
        </div>

        <button onClick={() => {
          updateOverride(menu.id, { ownerNote: undefined, priceOverride: undefined });
          onClose();
        }} className="w-full mt-2 py-2 text-xs text-stone-500 underline">
          기본값으로 되돌리기
        </button>
      </div>
    </div>
  );
}
