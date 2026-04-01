import { useState, useRef, useEffect } from 'react';

const SAMPLE_ADDRESSES = [
  { road: '서울 마포구 월드컵북로 21', jibun: '서울 마포구 상수동 72-1' },
  { road: '서울 마포구 성미산로 11', jibun: '서울 마포구 연남동 228-1' },
  { road: '서울 강남구 테헤란로 123', jibun: '서울 강남구 역삼동 678-9' },
  { road: '서울 마포구 양화로 12', jibun: '서울 마포구 합정동 112-5' },
  { road: '서울 송파구 올림픽로 202', jibun: '서울 송파구 잠실동 40-1' },
  { road: '대전 중구 대종로 480번길 15', jibun: '대전 중구 은행동 145-1' },
  { road: '서울 용산구 이태원로 200', jibun: '서울 용산구 한남동 657-9' },
  { road: '서울 강서구 마곡중앙로 59', jibun: '서울 강서구 마곡동 757-2' },
  { road: '서울 마포구 망원로 55', jibun: '서울 마포구 망원동 415-3' },
  { road: '부산 해운대구 해운대로 142번길 15', jibun: '부산 해운대구 우동 1405' },
  { road: '인천 연수구 송도동 6-2', jibun: '인천 연수구 송도동 6-2' },
];

const CASE_PRESETS = {
  'addr-empty': { query: '' },
  'addr-results': { query: '마포' },
  'addr-no-results': { query: '없는주소xyz' },
};

export default function AddressSearch({ onBack, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 어노테이션 케이스 수신
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SET_CASE' && CASE_PRESETS[e.data.case]) {
        setQuery(CASE_PRESETS[e.data.case].query);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const hasQuery = query.trim().length > 0;
  const filtered = hasQuery
    ? SAMPLE_ADDRESSES.filter((a) => a.road.includes(query.trim()) || a.jibun.includes(query.trim())).slice(0, 5)
    : [];

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

      {/* 헤더 */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-[24px] font-semibold leading-[1.5] tracking-[-0.24px] text-[#3a3a37]">
          지번, 도로명, 건물명으로 검색
        </h1>
      </div>

      {/* 검색 필드 */}
      <div data-annotate="addr-field" className="px-3 pt-6 pb-4 shrink-0">
        <div className="flex items-center gap-3 h-[52px] border border-[#6d6d6b] rounded-[18px] px-4 bg-white shadow-[0_0_0_4px_#f2f1ed]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <circle cx="11" cy="11" r="7" stroke="#6d6d6b" strokeWidth="1.5" />
            <path d="M16 16L20 20" stroke="#6d6d6b" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="주소 검색"
            className="flex-1 text-[16px] text-[#3a3a37] leading-[1.5] outline-none bg-transparent placeholder:text-[#90908e]"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="shrink-0 w-[20px] h-[20px] flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" fill="#d4d4d4" />
                <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 검색 결과 */}
      <div data-annotate="addr-results" className="flex-1 overflow-y-auto px-3 flex flex-col gap-2 pb-6">
        {/* 검색 전: 빈 화면 */}
        {!hasQuery && null}

        {/* 결과 있음 */}
        {hasQuery && filtered.length > 0 && filtered.map((addr, i) => (
          <button
            key={i}
            onClick={() => onSelect?.(addr.road)}
            className="w-full border border-[#e3e3df] rounded-[12px] px-5 py-[18px] flex flex-col gap-1 items-start text-left active:bg-[#f4f4f4] transition-colors"
          >
            <span className="text-[14px] font-semibold text-[#545453] leading-[1.5]">
              {addr.road}
            </span>
            <span className="text-[14px] text-[#6d6d6b] leading-[1.5]">
              지번) {addr.jibun}
            </span>
          </button>
        ))}

        {/* 결과 없음 — 중앙 정렬 */}
        {hasQuery && filtered.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="10" width="32" height="28" rx="4" stroke="#d4d4d4" strokeWidth="2" fill="none"/>
              <circle cx="28" cy="28" r="8" stroke="#d4d4d4" strokeWidth="2" fill="none"/>
              <path d="M34 34L40 40" stroke="#d4d4d4" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-[14px] font-semibold text-[#3a3a37]">검색 결과가 없습니다</span>
            <p className="text-[13px] text-[#90908e] text-center leading-[1.5]">
              도로명, 지번, 건물명, 아파트명으로
              <br />
              다시 검색해주세요
            </p>
            <button className="mt-1">
              <span className="text-[14px] font-semibold text-[#0ab26f] leading-[1.5]">고객센터로 이동</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
