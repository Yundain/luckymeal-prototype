import { useState, useRef, useEffect } from 'react';

const CASE_PRESETS = {
  'search-empty-query': { query: '' },
  'search-with-results': { query: '브래댄코' },
  'search-no-results': { query: '없는가게이름xyz' },
  'search-many-results': { query: '브래댄코' },
};

const ALL_STORES = [
  // 브래댄코
  { name: '브래댄코 상왕십리점', address: '서울 성동구 왕십리로 115 (상왕십리동)' },
  { name: '브래댄코 본점', address: '서울 마포구 성미산로 11 (연남동)' },
  { name: '브래댄코 서울역점', address: '서울 용산구 한강대로 405 (동자동)' },
  { name: '브래댄코 강남점', address: '서울 강남구 테헤란로 123 (역삼동)' },
  { name: '브래댄코 홍대점', address: '서울 마포구 양화로 12 (연남동)' },
  { name: '브래댄코 여의도점', address: '서울 영등포구 여의대방로 45 (여의도동)' },
  { name: '브래댄코 잠실점', address: '서울 송파구 올림픽로 202 (잠실동)' },
  // 브 검색 결과
  { name: '브레드숍 성수점', address: '서울 성동구 서울숲2길 44 (성수동)' },
  { name: '브레디포스트 망원점', address: '서울 마포구 망원로 77 (망원동)' },
  { name: '브릭오븐 베이커리', address: '서울 종로구 삼청로 45 (삼청동)' },
  { name: '브런치카페 모닝', address: '서울 강남구 압구정로 234 (신사동)' },
  { name: '브레드랩 연남점', address: '서울 마포구 연남로 35 (연남동)' },
  { name: '브라운브레드', address: '서울 서초구 방배로 112 (방배동)' },
  { name: '브레드피플', address: '서울 송파구 백제고분로 380 (석촌동)' },
  { name: '브리오슈도레 한남점', address: '서울 용산구 한남대로 42 (한남동)' },
  { name: '브레첼하우스 이태원점', address: '서울 용산구 이태원로 180 (이태원동)' },
  { name: '브레드온더테이블', address: '서울 마포구 와우산로 94 (상수동)' },
  { name: '브이베이커리 건대점', address: '서울 광진구 아차산로 262 (화양동)' },
  { name: '브레드앤버터 신촌점', address: '서울 서대문구 연세로 36 (창천동)' },
  { name: '브런치클럽 합정점', address: '서울 마포구 양화로 160 (합정동)' },
  { name: '브레드가든', address: '서울 강서구 마곡중앙로 59 (마곡동)' },
  { name: '브릿지베이커리 노원점', address: '서울 노원구 동일로 1414 (상계동)' },
  { name: '브레드팩토리 역삼점', address: '서울 강남구 역삼로 180 (역삼동)' },
  { name: '브로트 상수점', address: '서울 마포구 독막로 88 (상수동)' },
  { name: '브레드스미스 문래점', address: '서울 영등포구 도림로 430 (문래동)' },
  { name: '브레드앤코 판교점', address: '경기 성남시 분당구 판교역로 146 (백현동)' },
  { name: '브레드윈 서초점', address: '서울 서초구 서초대로 398 (서초동)' },
  // 기타
  { name: '파리바게뜨 망원점', address: '서울 마포구 망원로 55 (망원동)' },
  { name: '뚜레쥬르 합정점', address: '서울 마포구 양화로 12 (합정동)' },
  { name: '성심당 대전본점', address: '대전 중구 대종로 480번길 15 (은행동)' },
  { name: '일타르타르트 마곡점', address: '서울 강서구 마곡중앙로 59 (마곡동)' },
  { name: '베이커리 한강점', address: '서울 용산구 이태원로 200 (한남동)' },
];

export default function StoreSearch({ onSelect, onBack, onClose, initialQuery = '', onQueryChange }) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => { onQueryChange?.(query); }, [query]);

  // 어노테이션 케이스 수신
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SET_CASE' && CASE_PRESETS[e.data.case]) {
        const preset = CASE_PRESETS[e.data.case];
        setQuery(preset.query);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const sorted = [...ALL_STORES].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const hasQuery = query.trim().length > 0;
  const filtered = hasQuery
    ? ALL_STORES.filter((s) => s.name.includes(query.trim())).slice(0, 5)
    : [];

  const handleTouchStart = () => {
    // 스크롤 시작하면 키보드 내리기
    inputRef.current?.blur();
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-white flex flex-col"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      {/* 상단 네비 */}
      <div className="flex items-center justify-between h-[48px] px-1 shrink-0">
        <button
          onClick={onBack}
          className="w-[42px] h-[42px] flex items-center justify-center"
        >
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

      {/* 헤더 */}
      <div className="px-5 pt-6 pb-2 shrink-0">
        <h1 className="text-[24px] font-semibold leading-[1.5] tracking-[-0.24px] text-[#3a3a37]">
          환영합니다!
          <br />
          가게 이름을 입력해주세요
        </h1>
        <p className="text-[14px] text-[#6d6d6b] leading-[1.5] mt-1.5">
          가게 이름과 지점명을 입력해주세요
        </p>
      </div>

      {/* 검색 필드 */}
      <div data-annotate="search-field" className="px-3 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-3 h-[52px] border border-[#6d6d6b] rounded-[18px] px-4 bg-white shadow-[0_0_0_4px_#f2f1ed]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="11" cy="11" r="7" stroke="#6d6d6b" strokeWidth="1.5"/>
            <path d="M16 16L20 20" stroke="#6d6d6b" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="가게 이름 검색"
            className="flex-1 text-[16px] text-[#3a3a37] leading-[1.5] outline-none bg-transparent placeholder:text-[#90908e]"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
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

      {/* 리스트 */}
      <div
        data-annotate="search-results"
        ref={listRef}
        className="flex-1 overflow-y-auto px-3 flex flex-col gap-2 pb-6"
        onTouchStart={handleTouchStart}
      >
        {/* 검색 전: 아무것도 안 보임 */}
        {!hasQuery && null}

        {/* 검색 결과 있음 */}
        {hasQuery && filtered.length > 0 && (
          <>
            {filtered.map((store) => (
              <button
                key={store.name}
                onClick={() => onSelect?.(store)}
                className="w-full border border-[#e3e3df] rounded-[12px] px-5 py-[18px] flex flex-col gap-1 items-start text-left active:bg-[#f4f4f4] transition-colors"
              >
                <span className="text-[14px] font-semibold text-[#545453] leading-[1.5]">
                  {store.name}
                </span>
                <span className="text-[14px] text-[#6d6d6b] leading-[1.5]">
                  {store.address}
                </span>
              </button>
            ))}

            {/* 직접 입력하기 — 결과 있을 때 하단 */}
            <button
              data-annotate="search-direct"
              onClick={() => onSelect?.({ name: query || '', address: '', directInput: true })}
              className="w-full border border-[#e3e3df] rounded-[12px] p-2 flex items-center active:bg-[#f4f4f4] transition-colors"
            >
              <div className="h-[42px] px-3 rounded-[16px] flex items-center gap-1">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 5V15M5 10H15" stroke="#0ab26f" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-[14px] font-semibold text-[#0ab26f] leading-[1.5]">
                  직접 입력하기
                </span>
              </div>
            </button>
          </>
        )}

        {/* 검색 결과 없음 — 중앙 정렬 */}
        {hasQuery && filtered.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="10" width="32" height="28" rx="4" stroke="#d4d4d4" strokeWidth="2" fill="none"/>
              <circle cx="28" cy="28" r="8" stroke="#d4d4d4" strokeWidth="2" fill="none"/>
              <path d="M34 34L40 40" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-[14px] text-[#90908e]">검색 결과가 없습니다</span>
            <button
              data-annotate="search-direct"
              onClick={() => onSelect?.({ name: query || '', address: '', directInput: true })}
              className="flex items-center gap-1 mt-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="#0ab26f" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-[14px] font-semibold text-[#0ab26f] leading-[1.5]">직접 입력하기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
