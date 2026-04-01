import { useState, useEffect } from 'react';
import DaysSelectionBottomSheet from './DaysSelectionBottomSheet';

const CASE_PRESETS = {
  'menu-empty': {
    selected: new Set(),
    searchQuery: '',
  },
  'menu-one': {
    selected: new Set(['소금빵']),
    searchQuery: '',
  },
  'menu-max': {
    selected: new Set(['소금빵', '크루아상', '휘낭시에']),
    searchQuery: '',
  },
  'menu-search-empty': {
    selected: new Set(),
    searchQuery: '없는메뉴xyz',
  },
  'menu-days-sheet': {
    selected: new Set(['소금빵']),
    searchQuery: '',
    showDays: true,
  },
  'menu-max-blocked': {
    selected: new Set(['소금빵', '크루아상', '휘낭시에']),
    searchQuery: '',
    triggerMaxError: true,
  },
};

const CATEGORIES = [
  {
    name: '빵',
    items: ['빵류', '소금빵', '식빵', '크루아상', '베이글', '단팥빵', '크림빵', '소보로', '도넛', '페스트리', '모닝빵', '바게트', '치아바타', '깜빠뉴', '포카치아', '프레첼', '단과자', '식사빵'],
  },
  {
    name: '구움과자',
    items: ['구움과자류', '휘낭시에', '마들렌', '스콘', '쿠키', '에그타르트', '까눌레', '파운드케이크', '브라우니'],
  },
  {
    name: '케이크·디저트',
    items: ['디저트류', '케이크', '타르트', '파이', '마카롱', '티라미수', '푸딩'],
  },
  {
    name: '샌드위치·간편식',
    items: ['간편식류', '샌드위치', '토스트', '고로케', '조리빵', '샐러드', '포케', '피자', '키슈'],
  },
  {
    name: '한식·반찬',
    items: ['반찬류', '반찬', '한식요리', '국·찌개', '도시락', '밀키트', '분식'],
  },
  {
    name: '떡·전통과자',
    items: ['떡·한과류', '떡', '설기', '떡케이크', '약과', '한과'],
  },
  {
    name: '간식·기타',
    items: ['간식류', '크로플', '와플', '호두과자', '붕어빵', '음료', '아이스크림', '과일', '컷팅과일'],
  },
];

const STEPS = ['메뉴', '가격/수량', '픽업시간', '가게 정보'];

function ChevronDown({ open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M4 6L8 10L12 6" stroke="#90908e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function MenuSelect({ onNext, onBack, onClose, onStepClick }) {
  const [selected, setSelected] = useState(new Set());
  const [openCategories, setOpenCategories] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showDays, setShowDays] = useState(false);
  const [customItems, setCustomItems] = useState([]); // { name, category } 형태
  const [maxError, setMaxError] = useState(false);

  // postMessage 리스너: 외부에서 케이스 프리셋 적용
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type !== 'SET_CASE' || !CASE_PRESETS[e.data.case]) return;
      const preset = CASE_PRESETS[e.data.case];
      if (preset.selected !== undefined) setSelected(new Set(preset.selected));
      if (preset.searchQuery !== undefined) setSearchQuery(preset.searchQuery);
      if (preset.showDays !== undefined) setShowDays(preset.showDays);
      if (preset.triggerMaxError) {
        setMaxError(true);
        setTimeout(() => setMaxError(false), 2000);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // 모든 기본 품목 (검색 매칭용)
  const allDefaultItems = CATEGORIES.flatMap((cat) => cat.items);
  const allCustomNames = customItems.map((c) => c.name);

  // 카테고리별 커스텀 아이템
  const getCustomItemsForCategory = (catName) =>
    customItems.filter((c) => c.category === catName).map((c) => c.name);

  // 카테고리 미지정 커스텀 아이템 (검색으로 추가한 것)
  const uncategorizedCustomItems = customItems.filter((c) => !c.category).map((c) => c.name);

  const toggleChip = (item) => {
    const next = new Set(selected);
    if (next.has(item)) {
      next.delete(item);
    } else {
      if (next.size >= 3) {
        setMaxError(true);
        setTimeout(() => setMaxError(false), 2000);
        return;
      }
      next.add(item);
    }
    setSelected(next);
    // 검색 중 선택하면 검색 해제
    if (searchQuery) setSearchQuery('');
  };

  const addCustomItem = (name, category) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (allDefaultItems.includes(trimmed) || allCustomNames.includes(trimmed)) return;
    setCustomItems((prev) => [...prev, { name: trimmed, category: category || null }]);
    toggleChip(trimmed);
    setSearchQuery('');
  };

  const toggleCategory = (name) => {
    const next = new Set(openCategories);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setOpenCategories(next);
  };

  // 검색어가 기존 품목에 없는지 확인
  const queryTrimmed = searchQuery.trim();
  const queryExistsInDefaults = queryTrimmed && allDefaultItems.some((item) => item.includes(queryTrimmed));
  const queryExactMatch = queryTrimmed && (allDefaultItems.includes(queryTrimmed) || allCustomNames.includes(queryTrimmed));
  const showAddButton = queryTrimmed && !queryExactMatch;

  const canProceed = selected.size >= 1;

  return (
    <div
      className="absolute inset-0 z-50 bg-white flex flex-col"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      {/* 상단 네비 */}
      <div className="flex items-center justify-between h-[48px] px-1 shrink-0">
        <button onClick={onBack} className="w-[42px] h-[42px] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex items-center">
          <button className="px-2.5 h-[42px] flex items-center">
            <span className="text-[12px] font-semibold text-[#0ab26f] leading-[1.5]">고객센터</span>
          </button>
          <button onClick={onClose} className="w-[42px] h-[42px] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 최대 선택 에러 토스트 */}
      {maxError && (
        <div className="absolute top-[50px] left-0 right-0 z-[70] flex justify-center animate-[toast-in_0.3s_ease-out]">
          <div className="bg-[#545453] rounded-[16px] px-3 py-2.5 flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#ff4444"/>
              <path d="M10 6V11" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="10" cy="14" r="1" fill="white"/>
            </svg>
            <span className="text-[14px] font-semibold text-white leading-[1.5] pr-1.5 whitespace-nowrap">
              최대 3개까지 선택할 수 있어요
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toast-in {
          0% { opacity: 0; transform: translateY(-12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 프로그레스 바 */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute h-[2px] bg-[#e3e3df] left-[13px] right-[21px] top-[29px]" />
            {STEPS.map((step, i) => (
              <button key={step} onClick={() => onStepClick?.(i)} className="flex flex-col items-center gap-2 relative z-10">
                <span className={`text-[12px] font-semibold leading-[1.5] ${i === 0 ? 'text-[#545453]' : 'text-[#ababa9]'}`}>
                  {step}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#16cc83] ring-[6px] ring-[rgba(22,204,131,0.2)]' : 'bg-[#e3e3df]'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 타이틀 */}
        <div data-annotate="menu-title" className="px-5 pt-5 pb-2">
          <h2 className="text-[18px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.09px]">
            마감 후 주로 남는 메뉴
            <br />
            3가지를 선택해주세요
          </h2>
          <p className="text-[13px] text-[#90908e] leading-[1.5] mt-1">
            매일 똑같지 않아도 괜찮아요 · 대략적으로 골라주세요
          </p>
        </div>

        {/* 검색 필드 */}
        <div data-annotate="menu-search" className="px-4 py-3">
          <div className="flex items-center gap-2 border border-[#e3e3df] rounded-[16px] px-4 py-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색 또는 추가"
              className="flex-1 text-[14px] text-[#3a3a37] leading-[1.5] outline-none bg-transparent placeholder:text-[#ababa9]"
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="11" cy="11" r="7" stroke="#6d6d6b" strokeWidth="1.5"/>
              <path d="M16 16L20 20" stroke="#6d6d6b" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* 선택된 항목 요약 */}
        {selected.size > 0 && !searchQuery && (
          <div className="px-5 pt-1 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {[...selected].map((item) => (
                <button
                  key={item}
                  onClick={() => toggleChip(item)}
                  className="h-[32px] pl-[12px] pr-[8px] rounded-[12px] text-[13px] font-semibold leading-[1.5] bg-[#e4f8ed] border border-[#91e1b7] text-[#0ab26f] flex items-center gap-1.5 transition-colors"
                >
                  {item}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M4 4L10 10M10 4L4 10" stroke="#0ab26f" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              ))}
              <span className="text-[12px] text-[#90908e] leading-[1.5]">
                {selected.size}/3
              </span>
            </div>
          </div>
        )}

        {/* 검색어로 직접 추가 */}
        {showAddButton && (
          <div className="px-5 pt-3 pb-1">
            <button
              onClick={() => addCustomItem(queryTrimmed)}
              className="h-[36px] px-[14px] rounded-[14px] text-[14px] font-semibold leading-[1.5] border border-dashed border-[#91e1b7] text-[#0ab26f] bg-[#f0faf5] flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 3V11M3 7H11" stroke="#0ab26f" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              "{queryTrimmed}" 추가
            </button>
          </div>
        )}

        {/* 카테고리 목록 */}
        {searchQuery ? (
          /* 검색 중: 카테고리 구분 없이 플랫 나열 */
          <div className="flex flex-wrap gap-2 px-5 pt-3 pb-5">
            {allDefaultItems
              .filter((item) => item.includes(searchQuery))
              .map((item) => {
                const isSelected = selected.has(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleChip(item)}
                    className={`h-[36px] px-[14px] rounded-[14px] text-[14px] font-semibold leading-[1.5] transition-colors border ${
                      isSelected
                        ? 'bg-[#e4f8ed] border-[#91e1b7] text-[#0ab26f]'
                        : 'bg-white border-[#e3e3df] text-[#6d6d6b]'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
          </div>
        ) : (
          /* 기본: 카테고리별 토글 */
          <div data-annotate="menu-chips">{CATEGORIES.map((cat) => {
            const isOpen = openCategories.has(cat.name);
            return (
              <div key={cat.name}>
                <button
                  onClick={() => toggleCategory(cat.name)}
                  className="flex items-center justify-between w-full px-5 pt-5 pb-2"
                >
                  <span className="text-[14px] font-semibold text-[#90908e] leading-[1.5]">
                    {cat.name}
                  </span>
                  <ChevronDown open={isOpen} />
                </button>

                {isOpen && (
                  <div className="flex flex-wrap gap-2 px-5 pb-5">
                    {cat.items.map((item) => {
                      const isSelected = selected.has(item);
                      return (
                        <button
                          key={item}
                          onClick={() => toggleChip(item)}
                          className={`h-[36px] px-[14px] rounded-[14px] text-[14px] font-semibold leading-[1.5] transition-colors border ${
                            isSelected
                              ? 'bg-[#e4f8ed] border-[#91e1b7] text-[#0ab26f]'
                              : 'bg-white border-[#e3e3df] text-[#6d6d6b]'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                    {/* 이 카테고리에 직접 추가된 품목 */}
                    {getCustomItemsForCategory(cat.name).map((item) => {
                      const isSelected = selected.has(item);
                      return (
                        <button
                          key={item}
                          onClick={() => toggleChip(item)}
                          className={`h-[36px] px-[14px] rounded-[14px] text-[14px] font-semibold leading-[1.5] transition-colors border ${
                            isSelected
                              ? 'bg-[#e4f8ed] border-[#91e1b7] text-[#0ab26f]'
                              : 'bg-white border-[#e3e3df] text-[#6d6d6b]'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        const name = prompt('추가할 메뉴 이름을 입력하세요');
                        if (name) addCustomItem(name, cat.name);
                      }}
                      className="h-[36px] px-[12px] rounded-[14px] text-[14px] font-semibold leading-[1.5] border border-dashed border-[#c6c6c4] text-[#90908e] flex items-center gap-1"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 3V11M3 7H11" stroke="#90908e" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      추가
                    </button>
                  </div>
                )}
              </div>
            );
          })}</div>
        )}

        {/* 직접 추가한 품목 (카테고리 미지정 — 검색으로 추가한 것) */}
        {uncategorizedCustomItems.length > 0 && !searchQuery && (
          <div>
            <button
              onClick={() => toggleCategory('__custom')}
              className="flex items-center justify-between w-full px-5 pt-5 pb-2"
            >
              <span className="text-[14px] font-semibold text-[#90908e] leading-[1.5]">
                직접 추가한 메뉴
              </span>
              <ChevronDown open={openCategories.has('__custom')} />
            </button>

            {openCategories.has('__custom') && (
              <div className="flex flex-wrap gap-2 px-5 pb-5">
                {uncategorizedCustomItems.map((item) => {
                  const isSelected = selected.has(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleChip(item)}
                      className={`h-[36px] px-[14px] rounded-[14px] text-[14px] font-semibold leading-[1.5] transition-colors border ${
                        isSelected
                          ? 'bg-[#e4f8ed] border-[#91e1b7] text-[#0ab26f]'
                          : 'bg-white border-[#e3e3df] text-[#6d6d6b]'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 하단 여백 */}
        <div className="h-[160px]" />
      </div>

      {/* 하단 CTA */}
      <div
        className="shrink-0 pt-4 flex flex-col"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, white 33%)' }}
      >
        {/* 안내 배지 */}
        <div className="flex justify-center pb-3">
          <span className="px-4 py-2 rounded-full border border-[#16cc83] text-[12px] font-semibold text-[#0ab26f]">
            입점 후에도 편하게 수정 가능해요
          </span>
        </div>
        {/* 버튼 영역 */}
        <div className="px-3 pb-2">
          <button
            onClick={() => { if(canProceed) { onNext?.([...selected]); } }}
            disabled={!canProceed}
            className={`flex-1 w-full h-[52px] rounded-[18px] text-[14px] font-semibold text-white transition-colors ${
              canProceed ? 'bg-[#16cc83] active:bg-[#12b574]' : 'bg-[#beedd3]'
            }`}
          >
            {canProceed
              ? `다음 (${selected.size}/3)`
              : '최소 1개를 선택해주세요'}
          </button>
        </div>
      </div>

      {/* 요일 선택 바텀시트 */}
      {showDays && (
        <DaysSelectionBottomSheet
          onClose={() => setShowDays(false)}
          onNext={(days) => {
            setShowDays(false);
            onNext?.(days, [...selected]);
          }}
        />
      )}
    </div>
  );
}
