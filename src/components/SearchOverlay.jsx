import { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { mockPlaces } from '../data/mockPlaces';
import { filterPlacesByRadius, getRadiusForZoom, formatDistance } from '../utils/geoUtils';

export default function SearchOverlay() {
  const inputRef = useRef(null);
  const {
    isSearchMode,
    setIsSearchMode,
    searchKeyword,
    setSearchKeyword,
    mapCenter,
    zoomLevel,
    searchRadius,
    setVisiblePlaceIds,
    setToastMessage,
    setSheetState,
    setShowRadiusCircle,
  } = useAppStore();

  // 검색 모드 열릴 때 input에 포커스
  useEffect(() => {
    if (isSearchMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchMode]);

  // 닫기
  const handleClose = () => {
    setIsSearchMode(false);
    setSearchKeyword('');
  };

  // 메뉴/설명으로 검색 (메뉴명 + 럭키백 설명)
  const handleMenuSearch = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return;

    const radius = getRadiusForZoom(zoomLevel);
    const placesInRadius = filterPlacesByRadius(mockPlaces, mapCenter, radius);

    // 메뉴명 OR 설명에서 검색
    const filtered = placesInRadius.filter(
      (p) =>
        p.menus.some((menu) => menu.toLowerCase().includes(keyword)) ||
        (p.description && p.description.toLowerCase().includes(keyword))
    );

    setVisiblePlaceIds(filtered.map((p) => p.id));

    const radiusText = formatDistance(radius);
    if (filtered.length > 0) {
      setToastMessage(`'${searchKeyword}' 검색 결과 ${filtered.length}개 가게`);
    } else {
      setToastMessage(`주변 ${radiusText}에 '${searchKeyword}' 검색 결과가 없습니다`);
    }

    setShowRadiusCircle(true);
    setSheetState('mid');
    handleClose();
  };

  // 가게명으로 검색 (전국)
  const handleStoreSearch = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return;

    // 전국 검색 (반경 제한 없음)
    const filtered = mockPlaces.filter(
      (p) => p.name.toLowerCase().includes(keyword)
    );

    setVisiblePlaceIds(filtered.map((p) => p.id));

    if (filtered.length > 0) {
      setToastMessage(`'${searchKeyword}' 가게 ${filtered.length}개 발견`);
    } else {
      setToastMessage(`'${searchKeyword}' 가게를 찾을 수 없습니다`);
    }

    setSheetState('mid');
    handleClose();
  };

  // Enter 키 처리 (기본: 메뉴명 검색)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchKeyword.trim()) {
      handleMenuSearch();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isSearchMode) return null;

  const hasKeyword = searchKeyword.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* 헤더: 검색바 */}
      <div className="flex-shrink-0 flex items-center gap-2 p-4 border-b border-gray-100">
        {/* 뒤로가기 버튼 */}
        <button onClick={handleClose} className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 검색 입력 */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="가게명, 메뉴, 카테고리 검색"
            className="w-full px-4 py-3 pr-10 bg-gray-100 rounded-xl text-base outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#999">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 검색 유형 버튼 영역 */}
      <div className="flex-1 p-4">
        {hasKeyword ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">검색 유형을 선택하세요</p>

            {/* 메뉴/설명으로 검색 */}
            <button
              onClick={handleMenuSearch}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <span className="text-2xl">🍽️</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">
                  '<span className="text-green-600">{searchKeyword}</span>' 메뉴/설명으로 검색
                </p>
                <p className="text-sm text-gray-500">주변 우선</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* 가게명으로 검색 */}
            <button
              onClick={handleStoreSearch}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <span className="text-2xl">🏪</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">
                  '<span className="text-green-600">{searchKeyword}</span>' 가게명으로 검색
                </p>
                <p className="text-sm text-gray-500">정확도 우선 (전국)</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <p>검색어를 입력해주세요</p>
            <p className="text-sm mt-2">가게명, 메뉴, 카테고리로 검색할 수 있습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
