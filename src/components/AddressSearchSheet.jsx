import { useState, useRef, useEffect } from 'react';
import ExpandableSheet from './ExpandableSheet';

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

export default function AddressSearchSheet({ onSelect, onClose, selectedAddress = '' }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const hasQuery = query.trim().length > 0;
  const filtered = hasQuery
    ? SAMPLE_ADDRESSES.filter((a) => a.road.includes(query.trim()) || a.jibun.includes(query.trim())).slice(0, 5)
    : [];

  return (
    <ExpandableSheet onDismiss={onClose} autoFocus title="주소 검색" showClose>

      {/* 검색 필드 */}
      <div className="px-4 pb-3 shrink-0">
        <div className="flex items-center gap-3 h-[48px] px-4 rounded-[14px] border border-[#e3e3df] bg-[#f8f8f6] focus-within:border-[#16cc83] transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <circle cx="8" cy="8" r="5.5" stroke="#ababa9" strokeWidth="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="#ababa9" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="주소 검색"
            className="flex-1 text-[14px] text-[#3a3a37] leading-[1.5] outline-none bg-transparent placeholder:text-[#ababa9]"
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

      {/* 결과 리스트 */}
      <div className="px-4 pb-8">
        {!hasQuery ? (
          selectedAddress ? (
            <div className="flex flex-col gap-1.5">
              <div className="px-4 py-3.5 rounded-[12px] bg-[#f0faf5] flex items-center">
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-[14px] font-semibold text-[#16cc83] leading-[1.5]">{selectedAddress}</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 ml-3">
                  <path d="M4.5 10.5L8 14L15.5 6.5" stroke="#16cc83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[12px] text-[#ababa9] text-center pt-4">변경하려면 주소를 검색해주세요</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <span className="text-[13px] text-[#ababa9]">도로명, 지번, 건물명으로 검색해보세요</span>
            </div>
          )
        ) : filtered.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {filtered.map((addr, i) => {
              const isSelected = selectedAddress === addr.road;
              return (
                <button
                  key={i}
                  onClick={() => onSelect?.(addr.road)}
                  className={`w-full px-4 py-3.5 rounded-[12px] flex items-center text-left transition-colors ${isSelected ? 'bg-[#f0faf5]' : 'active:bg-[#f4f4f4]'}`}
                >
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className={`text-[14px] font-semibold leading-[1.5] ${isSelected ? 'text-[#16cc83]' : 'text-[#3a3a37]'}`}>
                      {addr.road}
                    </span>
                    <span className="text-[12px] text-[#90908e] leading-[1.5]">
                      지번) {addr.jibun}
                    </span>
                  </div>
                  {isSelected && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 ml-3">
                      <path d="M4.5 10.5L8 14L15.5 6.5" stroke="#16cc83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-1">
            <span className="text-[13px] text-[#90908e]">검색 결과가 없습니다</span>
            <span className="text-[12px] text-[#ababa9]">도로명, 지번, 건물명으로 다시 검색해주세요</span>
          </div>
        )}
      </div>
    </ExpandableSheet>
  );
}
