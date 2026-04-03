import { useState, useRef, useCallback } from 'react';
import ExpandableSheet from './ExpandableSheet';

/**
 * SearchSelectSheet — Search Select Input + ExpandableSheet 복합 컴포넌트
 *
 * 트리거 (선택 전: 검색 버튼 / 선택 후: 선택 항목 + X) +
 * 바텀시트 (검색 필드 + 결과 리스트)
 *
 * Props:
 * - title: 바텀시트 헤더 타이틀
 * - placeholder: 검색 인풋 placeholder
 * - emptyMessage: 검색 전 안내 문구
 * - noResultMessage: 검색 결과 없음 문구
 * - items: 검색 대상 배열
 * - filterFn: (item, query) => boolean — 필터 함수
 * - renderItem: (item, { isSelected }) => ReactNode — 결과 항목 렌더링
 * - getItemKey: (item) => string — 항목 고유키
 * - getItemLabel: (item) => string — 트리거에 표시할 텍스트
 * - value: 현재 선택된 항목 (null이면 미선택)
 * - onChange: (item | null) => void — 선택 변경 콜백
 * - triggerPlaceholder: 트리거 버튼 placeholder
 * - maxResults: 최대 결과 수 (기본 10)
 */
export default function SearchSelectSheet({
  title,
  placeholder = '검색어를 입력해주세요',
  emptyMessage = '검색어를 입력해보세요',
  noResultMessage = '검색 결과가 없습니다',
  items = [],
  filterFn,
  renderItem,
  getItemKey = (item) => item.id || item.name,
  getItemLabel = (item) => item.name,
  value = null,
  onChange,
  triggerPlaceholder = '검색',
  maxResults = 10,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const open = useCallback(() => {
    setQuery('');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  const select = useCallback((item) => {
    // 이미 선택된 항목 → 해제 (시트 유지)
    if (value && getItemKey(value) === getItemKey(item)) {
      onChange?.(null);
      return;
    }
    onChange?.(item);
    close();
  }, [onChange, close, value, getItemKey]);

  const clear = useCallback((e) => {
    e.stopPropagation();
    onChange?.(null);
  }, [onChange]);

  const hasQuery = query.trim().length > 0;
  const results = hasQuery
    ? items.filter((item) => filterFn(item, query.trim())).slice(0, maxResults)
    : [];

  return (
    <>
      {/* ── 트리거 ── */}
      {value ? (
        <button
          onClick={open}
          className="w-full flex items-center gap-3 h-[52px] px-4 rounded-[14px] border border-[#16cc83] bg-[#f0faf5] active:bg-[#e5f5ed] transition-colors"
        >
          <div className="flex-1 min-w-0 text-left">
            <span className="text-[14px] font-semibold text-[#3a3a37] leading-[1.5]">
              {getItemLabel(value)}
            </span>
          </div>
          <div
            role="button"
            onClick={clear}
            className="shrink-0 w-[20px] h-[20px] flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" fill="#c6c6c4"/>
              <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </button>
      ) : (
        <button
          onClick={open}
          className="w-full flex items-center gap-3 h-[48px] px-4 rounded-[14px] border border-[#e3e3df] bg-white active:bg-[#f8f8f6] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <circle cx="8" cy="8" r="5.5" stroke="#ababa9" strokeWidth="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="#ababa9" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-[14px] text-[#ababa9] leading-[1.5]">{triggerPlaceholder}</span>
        </button>
      )}

      {/* ── 바텀시트 ── */}
      {isOpen && (
        <ExpandableSheet
          onDismiss={close}
          autoFocus
          title={title}
          showClose
          stickyContent={
            <div className="px-4 pb-3">
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
                  placeholder={placeholder}
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
          }
        >
          <div className="px-4 pb-8">
            {!hasQuery ? (
              value ? (
                /* 선택된 항목 표시 */
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => onChange?.(null)}
                    className="w-full px-4 py-3.5 rounded-[12px] bg-[#f0faf5] flex items-center text-left active:bg-[#e5f5ed] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      {renderItem(value, { isSelected: true, isCurrentValue: true })}
                    </div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 ml-3">
                      <path d="M4.5 10.5L8 14L15.5 6.5" stroke="#16cc83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <p className="text-[12px] text-[#ababa9] text-center pt-4">변경하려면 검색해주세요</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <span className="text-[13px] text-[#ababa9]">{emptyMessage}</span>
                </div>
              )
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-1">
                <span className="text-[13px] text-[#90908e]">{noResultMessage}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {results.map((item) => {
                  const key = getItemKey(item);
                  const isSelected = value && getItemKey(value) === key;
                  return (
                    <button
                      key={key}
                      onClick={() => select(item)}
                      className={`w-full px-4 py-3.5 rounded-[12px] flex items-center text-left transition-colors ${isSelected ? 'bg-[#f0faf5]' : 'active:bg-[#f4f4f4]'}`}
                    >
                      <div className="flex-1 min-w-0">
                        {renderItem(item, { isSelected })}
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
            )}
          </div>
        </ExpandableSheet>
      )}
    </>
  );
}
