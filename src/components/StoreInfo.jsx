import { useState, useRef, useEffect } from 'react';
import ExpandableSheet from './ExpandableSheet';

const MAX_PHOTOS = 5;

const TOGGLE_ITEMS = [
  { key: 'parking', icon: '🚗', label: '주차 가능', expandType: 'text', expandPlaceholder: '예: 건물 뒤 무료 주차 3대 가능' },
  { key: 't_pet', icon: '🐕', label: '반려동물 동반 가능' },
  {
    key: 'direction', icon: '📍', label: '찾아오는 길 안내',
    expandType: 'text',
    expandPlaceholder: '예: 골목 안쪽 2번째 건물, 파란 간판',
  },
];

// 공통 칩 (전체 카테고리)
const COMMON_CHIPS = [
  { label: '🌞 당일 제조', key: 'daily' },
  { label: '🥦 비건', key: 'vegan' },
  { label: '🚫 무첨가제', key: 'no_additive' },
  { label: '🚫 무방부제', key: 'no_preserv' },
  { label: '💙 블루리본', key: 'blueribbon' },
];

// 분기 칩 (특정 카테고리에서만 노출)
const CATEGORY_CHIPS = {
  '빵': [
    { label: '🥛 동물성 크림', key: 'animal_cream' },
    { label: '🌾 글루텐프리', key: 'gluten_free' },
  ],
  '구움과자': [
    { label: '🥛 동물성 크림', key: 'animal_cream' },
    { label: '🌾 글루텐프리', key: 'gluten_free' },
  ],
  '케이크·디저트': [
    { label: '🥛 동물성 크림', key: 'animal_cream' },
    { label: '🌾 글루텐프리', key: 'gluten_free' },
  ],
};

const CASE_PRESETS = {
  'info-empty': {
    photos: [],
    toggles: Object.fromEntries(TOGGLE_ITEMS.map((item) => [item.key, false])),
    expandData: Object.fromEntries(TOGGLE_ITEMS.filter((i) => i.expandType).map((item) => [item.key, ''])),
    selectedTraits: new Set(),
    description: '',
    referralStore: null,
  },
  'info-all-toggles': {
    photos: [],
    toggles: Object.fromEntries(TOGGLE_ITEMS.map((item) => [item.key, true])),
    expandData: { direction: '골목 안쪽 2번째 건물, 파란 간판' },
    selectedTraits: new Set(['daily', 'vegan', 'healthy']),
    description: '매일 아침 구운 빵이 3~5개 랜덤으로 담겨요. 당일 섭취 권장.',
    referralStore: null,
  },
  'info-with-photo': {
    photos: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1555507036-ab1f4159c89e?w=400&h=400&fit=crop',
    ],
    toggles: Object.fromEntries(TOGGLE_ITEMS.map((item) => [item.key, false])),
    expandData: Object.fromEntries(TOGGLE_ITEMS.filter((i) => i.expandType).map((item) => [item.key, ''])),
    selectedTraits: new Set(),
    description: '',
    referralStore: null,
  },
  'info-max-photos': {
    photos: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1555507036-ab1f4159c89e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1486427944544-d2c246c4df4a?w=400&h=400&fit=crop',
    ],
    toggles: Object.fromEntries(TOGGLE_ITEMS.map((item) => [item.key, false])),
    expandData: Object.fromEntries(TOGGLE_ITEMS.filter((i) => i.expandType).map((item) => [item.key, ''])),
    selectedTraits: new Set(),
    description: '',
    referralStore: null,
  },
  'info-all-chips': {
    photos: [],
    toggles: Object.fromEntries(TOGGLE_ITEMS.map((item) => [item.key, false])),
    expandData: Object.fromEntries(TOGGLE_ITEMS.filter((i) => i.expandType).map((item) => [item.key, ''])),
    selectedTraits: new Set([
      ...COMMON_CHIPS.map(c => c.key),
      ...Object.values(CATEGORY_CHIPS).flat().map(c => c.key),
    ]),
    description: '',
    referralStore: null,
  },
};

// 레퍼럴 검색용 가게 목데이터 (StoreSearch.jsx ALL_STORES와 동일)
const REFERRAL_STORES = [
  { name: '브래댄코 상왕십리점', address: '서울 마포구 월드컵북로 21' },
  { name: '브래댄코 본점', address: '서울 마포구 성미산로 11' },
  { name: '브래댄코 서울역점', address: '서울 용산구 한강대로 405' },
  { name: '브래댄코 강남점', address: '서울 강남구 테헤란로 123' },
  { name: '브래댄코 홍대점', address: '서울 마포구 양화로 12' },
  { name: '파리바게뜨 망원점', address: '서울 마포구 망원로 55' },
  { name: '뚜레쥬르 합정점', address: '서울 마포구 양화로 12' },
  { name: '성심당 대전본점', address: '대전 중구 대종로 480번길 15' },
  { name: '일타르타르트 마곡점', address: '서울 강서구 마곡중앙로 59' },
  { name: '베이커리 한강점', address: '서울 용산구 이태원로 200' },
];

// 메뉴 아이템 → 카테고리 역매핑용
const MENU_CATEGORIES = {
  '빵': ['빵류','소금빵','식빵','크루아상','베이글','단팥빵','크림빵','소보로','도넛','페스트리','모닝빵','바게트','치아바타','깜빠뉴','포카치아','프레첼','단과자','식사빵'],
  '구움과자': ['구움과자류','휘낭시에','마들렌','스콘','쿠키','에그타르트','까눌레','파운드케이크','브라우니'],
  '케이크·디저트': ['디저트류','케이크','타르트','파이','마카롱','티라미수','푸딩'],
};

function getTraitChips(selectedMenus) {
  const cats = new Set();
  for (const menu of (selectedMenus || [])) {
    for (const [cat, items] of Object.entries(MENU_CATEGORIES)) {
      if (items.includes(menu)) cats.add(cat);
    }
  }
  const extra = [];
  for (const cat of cats) {
    if (CATEGORY_CHIPS[cat]) {
      for (const chip of CATEGORY_CHIPS[cat]) {
        if (!extra.some(c => c.key === chip.key)) extra.push(chip);
      }
    }
  }
  return [...COMMON_CHIPS, ...extra];
}

export default function StoreInfo({ onNext, onBack, onClose, selectedMenus }) {
  const [photos, setPhotos] = useState([]);
  const [toggles, setToggles] = useState(() =>
    Object.fromEntries(TOGGLE_ITEMS.map((item) => [item.key, false]))
  );
  const [expandData, setExpandData] = useState(() =>
    Object.fromEntries(TOGGLE_ITEMS.filter((i) => i.expandType).map((item) => [item.key, '']))
  );
  const [selectedTraits, setSelectedTraits] = useState(new Set());
  const [description, setDescription] = useState('');
  const [referralQuery, setReferralQuery] = useState('');
  const [referralStore, setReferralStore] = useState(null);
  const [showReferralSheet, setShowReferralSheet] = useState(false);
  const referralInputRef = useRef(null);
  const fileRef = useRef(null);

  // 어노테이션 케이스 수신
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SET_CASE' && CASE_PRESETS[e.data.case]) {
        const preset = CASE_PRESETS[e.data.case];
        setPhotos(preset.photos);
        setToggles(preset.toggles);
        setExpandData(preset.expandData);
        setSelectedTraits(preset.selectedTraits);
        setDescription(preset.description);
        setReferralStore(preset.referralStore || null);
        setReferralQuery('');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, MAX_PHOTOS));
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTrait = (key) => {
    setSelectedTraits((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-white flex flex-col"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      {/* 상단바 */}
      <div className="flex items-center justify-between h-[48px] px-1 shrink-0">
        <button onClick={onBack} className="w-[42px] h-[42px] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex items-center">
          <div className="flex items-center gap-1.5 px-2.5 h-[42px]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="5" r="1" fill="#545453" />
              <circle cx="10" cy="10" r="1" fill="#545453" />
              <circle cx="10" cy="15" r="1" fill="#545453" />
            </svg>
            <span className="text-[12px] font-semibold text-[#0ab26f] leading-[1.5]">고객센터</span>
          </div>
          <button onClick={onClose} className="w-[42px] h-[42px] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 스텝바 */}
      <div className="px-5 pt-1 pb-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-[29px] left-[13px] right-[21px] h-[2px] bg-[#16cc83]" />
          {['메뉴', '판매 설정', '픽업시간', '가게 정보'].map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-2 relative z-10">
              <span className="text-[12px] font-semibold text-[#545453] leading-[1.5]">{label}</span>
              <div className={`w-[8px] h-[8px] rounded-full bg-[#16cc83] ${i === 3 ? 'ring-[3px] ring-[#16cc83]/20' : ''}`} />
            </div>
          ))}
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">

        {/* ────── 섹션 1: 우리 제품을 알려주세요 ────── */}
        <div className="px-5 pt-5 pb-2">
          <h2 className="text-[18px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.09px]">
            (선택) 우리 제품을 알려주세요
          </h2>
        </div>

        <div data-annotate="info-chips" className="px-5 pt-2 pb-5 flex flex-wrap gap-2">
          {getTraitChips(selectedMenus).map((chip) => {
            const isOn = selectedTraits.has(chip.key);
            return (
              <button
                key={chip.key}
                onClick={() => toggleTrait(chip.key)}
                className={`h-[36px] px-[10px] rounded-[14px] text-[14px] font-semibold leading-[1.5] transition-colors border ${
                  isOn
                    ? 'bg-[#e4f8ed] border-[#91e1b7] text-[#0ab26f]'
                    : 'bg-white border-[#e3e3df] text-[#6d6d6b]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* 럭키백 소개 (제품 하위) */}
        <div className="px-5 pt-2 pb-2">
          <label className="text-[14px] font-semibold text-[#545453] leading-[1.5] px-1">
            럭키백 소개
          </label>
        </div>

        <div data-annotate="info-description" className="px-5 pb-8">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="편하게 작성하면 럭키밀 AI가 예쁘게 다듬어드려요"
            className="w-full h-[116px] px-4 py-4 rounded-[18px] border border-[#c6c6c4] bg-white text-[14px] text-[#3a3a37] leading-[1.5] placeholder:text-[#ababa9] resize-none outline-none focus:border-[#16cc83] transition-colors"
          />
          <div className="px-1 mt-2">
            <ol className="text-[14px] text-[#6d6d6b] leading-[1.5] list-decimal pl-5 flex flex-col gap-0.5">
              <li>럭키백에 담길 상품들 예시 (예: 매일 아침 구운 빵이 3~5개 랜덤으로 담겨요)</li>
              <li>보관/섭취 방법 (예: 당일 섭취 권장, 실온 보관, 전자레인지에 30초)</li>
            </ol>
          </div>
        </div>

        {/* ────── 섹션 2: 가게 사진 ────── */}
        <div data-annotate="info-photo" className="px-5 pt-5 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.09px]">
                (선택) 가게 사진
              </h2>
              <span className="text-[14px] font-semibold text-[#11c07a] leading-[1.5]">{photos.length}/{MAX_PHOTOS}</span>
            </div>
            <button
              data-annotate="info-photo-example"
              className="h-[28px] px-2.5 rounded-[8px] border border-[#e3e3df] bg-white text-[12px] font-semibold text-[#6d6d6b] leading-[1.5]"
              onClick={() => {/* 예시 노션 페이지 */}}
            >
              예시
            </button>
          </div>
          <p className="text-[12px] text-[#90908e] leading-[1.5] mt-0.5">
            제품이 잘 보이는 사진을 올리면 주문량이 약 2배 올라요
            <br />
            입구를 찾기 어려운 곳이라면 외관 사진도 함께 올려주세요
          </p>
        </div>

        <div className="px-5 pt-2 pb-2">
          {photos.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((src, i) => (
                <div key={i} className="relative w-[88px] h-[88px] shrink-0 rounded-[8px] overflow-hidden">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1.5 right-1.5 w-[22px] h-[22px] bg-black/40 rounded-full flex items-center justify-center"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-[88px] h-[88px] shrink-0 rounded-[8px] border border-dashed border-[#c6c6c4] flex flex-col items-center justify-center gap-1.5 active:bg-[#f8f8f6] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4V16M4 10H16" stroke="#ababa9" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-[12px] font-semibold text-[#ababa9]">사진 추가</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-[88px] rounded-[8px] border border-dashed border-[#c6c6c4] flex flex-col items-center justify-center gap-1.5 active:bg-[#f8f8f6] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="#ababa9" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-[12px] font-semibold text-[#ababa9]">사진 추가</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />

          {/* 말풍선 — 사진 없을 때만 */}
          {photos.length === 0 && (
            <div className="flex justify-center mt-2 mb-4">
              <div className="relative bg-[#e6f2ff] rounded-[20px] px-2.5 py-1.5">
                <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-[#e6f2ff]" />
                <span className="text-[12px] font-semibold text-[#578fff] leading-[1.5]">
                  등록하지 않아도 럭키밀이 대신 채워드려요
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ────── 섹션 3: 우리 가게를 알려주세요 ────── */}
        <div className="px-5 pt-5 pb-2">
          <h2 className="text-[18px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.09px]">
            (선택) 우리 가게를 알려주세요
          </h2>
        </div>

        <div data-annotate="info-toggles" className="px-5 pb-8">
          {TOGGLE_ITEMS.map((item) => {
            const isOn = toggles[item.key];
            return (
              <div key={item.key}>
                <div
                  className="flex items-center gap-4 h-[44px] cursor-pointer"
                  onClick={() => handleToggle(item.key)}
                >
                  <span className="text-[20px] w-[24px] text-center shrink-0">{item.icon}</span>
                  <span className={`flex-1 text-[14px] font-semibold leading-[1.5] ${isOn ? 'text-[#3a3a37]' : 'text-[#ababa9]'}`}>
                    {item.label}
                  </span>
                  <div className={`w-[34px] h-[20px] rounded-full flex items-center px-[2px] transition-colors ${
                    isOn ? 'bg-[#16cc83] justify-end' : 'bg-[#c6c6c4] justify-start'
                  }`}>
                    <div className="w-[16px] h-[16px] rounded-full bg-white transition-all" />
                  </div>
                </div>

                {item.expandType === 'text' && isOn && (
                  <div className="pb-2 pl-[40px]">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="5" stroke="#ababa9" strokeWidth="1.5"/>
                        <path d="M11 11L14 14" stroke="#ababa9" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <input
                        type="text"
                        value={expandData[item.key] || ''}
                        onChange={(e) => setExpandData((prev) => ({ ...prev, [item.key]: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={item.expandPlaceholder}
                        className="w-full h-[40px] pl-9 pr-3 rounded-[12px] border border-[#e3e3df] bg-[#f8f8f6] text-[13px] text-[#3a3a37] leading-[1.5] placeholder:text-[#ababa9] outline-none focus:border-[#16cc83] transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ────── 섹션 4: 추천인 사장님 ────── */}
        <div className="px-5 pt-5 pb-2">
          <h2 className="text-[18px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.09px]">
            (선택) 추천인 사장님
          </h2>
          <p className="text-[12px] text-[#90908e] leading-[1.5] mt-0.5">
            럭키밀을 추천해준 사장님의 가게를 검색해주세요
          </p>
        </div>

        <div data-annotate="info-referral" className="px-5 pb-8">
          {referralStore ? (
            /* 선택 완료 상태 */
            <div className="flex items-center gap-3 h-[52px] px-4 rounded-[14px] border border-[#16cc83] bg-[#f0faf5]">
              <div className="flex-1 min-w-0">
                <span className="text-[14px] font-semibold text-[#3a3a37] leading-[1.5]">
                  {referralStore.name}
                </span>
              </div>
              <button
                onClick={() => {
                  setReferralStore(null);
                  setReferralQuery('');
                }}
                className="shrink-0 w-[20px] h-[20px] flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" fill="#c6c6c4"/>
                  <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ) : (
            /* 트리거 버튼 — 탭하면 바텀시트 오픈 */
            <button
              onClick={() => {
                setShowReferralSheet(true);
                setTimeout(() => referralInputRef.current?.focus(), 300);
              }}
              className="w-full flex items-center gap-3 h-[48px] px-4 rounded-[14px] border border-[#e3e3df] bg-white active:bg-[#f8f8f6] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="5.5" stroke="#ababa9" strokeWidth="1.5"/>
                <path d="M12.5 12.5L16 16" stroke="#ababa9" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[14px] text-[#ababa9] leading-[1.5]">가게 이름 검색</span>
            </button>
          )}
        </div>

        {/* 추천인 검색 바텀시트 */}
        {showReferralSheet && (
          <ExpandableSheet
            onDismiss={() => {
              setShowReferralSheet(false);
              setReferralQuery('');
            }}
            autoFocus
          >
            {/* 타이틀 */}
            <div className="px-5 pb-3 shrink-0">
              <h3 className="text-[16px] font-semibold text-[#3a3a37] leading-[1.5]">
                추천인 가게 검색
              </h3>
            </div>

            {/* 검색 필드 */}
            <div className="px-4 pb-3 shrink-0">
              <div className="flex items-center gap-3 h-[48px] px-4 rounded-[14px] border border-[#e3e3df] bg-[#f8f8f6] focus-within:border-[#16cc83] transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="5.5" stroke="#ababa9" strokeWidth="1.5"/>
                  <path d="M12.5 12.5L16 16" stroke="#ababa9" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  ref={referralInputRef}
                  type="text"
                  value={referralQuery}
                  onChange={(e) => setReferralQuery(e.target.value)}
                  placeholder="가게 이름을 입력해주세요"
                  className="flex-1 text-[14px] text-[#3a3a37] leading-[1.5] outline-none bg-transparent placeholder:text-[#ababa9]"
                />
                {referralQuery && (
                  <button
                    onClick={() => {
                      setReferralQuery('');
                      referralInputRef.current?.focus();
                    }}
                    className="shrink-0 w-[20px] h-[20px] flex items-center justify-center"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" fill="#d4d4d4"/>
                      <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* 검색 결과 리스트 */}
            <div className="px-4 pb-8">
              {referralQuery.trim().length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <span className="text-[13px] text-[#ababa9]">추천해준 가게 이름을 검색해보세요</span>
                </div>
              ) : (() => {
                const results = REFERRAL_STORES.filter((s) => s.name.includes(referralQuery.trim())).slice(0, 10);
                if (results.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-10 gap-1">
                      <span className="text-[13px] text-[#90908e]">검색 결과가 없습니다</span>
                      <span className="text-[12px] text-[#ababa9]">가게 이름을 다시 확인해주세요</span>
                    </div>
                  );
                }
                return (
                  <div className="flex flex-col gap-1.5">
                    {results.map((store) => (
                      <button
                        key={store.name}
                        onClick={() => {
                          setReferralStore(store);
                          setReferralQuery('');
                          setShowReferralSheet(false);
                        }}
                        className="w-full px-4 py-3.5 rounded-[12px] flex flex-col items-start text-left active:bg-[#f4f4f4] transition-colors"
                      >
                        <span className="text-[14px] font-semibold text-[#3a3a37] leading-[1.5]">
                          {store.name}
                        </span>
                        <span className="text-[12px] text-[#90908e] leading-[1.5]">
                          {store.address}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </ExpandableSheet>
        )}

        {/* 스크롤 하단 여백 (CTA 겹침 방지) */}
        <div className="h-[100px]" />
      </div>

      {/* 하단 CTA — 고정 */}
      <div className="shrink-0 px-3 pb-8 pt-3 bg-gradient-to-t from-white via-white to-white/0">
        <button
          data-annotate="info-cta"
          onClick={() => onNext?.({ toggles, expandData, selectedTraits: [...selectedTraits], description, photos, referralStore })}
          className="w-full h-[52px] bg-[#16cc83] rounded-[18px] flex items-center justify-center active:bg-[#12b574] transition-colors"
        >
          <span className="text-[14px] font-semibold text-white leading-[1.5]">건너뛰고 등록하기</span>
        </button>
      </div>

      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}
