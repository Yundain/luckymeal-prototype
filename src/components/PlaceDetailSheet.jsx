import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { mockPlaces } from '../data/mockPlaces';

// 스냅 포인트 정의 (화면 높이 대비 %)
const SNAP_POINTS = {
  min: 15,   // 미니멀 (닫힘 직전)
  mid: 60,   // 기본 상태
  max: 100,  // 풀스크린
};

export default function PlaceDetailSheet() {
  const { selectedPlaceId, setSelectedPlaceId, detailSheetState, setDetailSheetState } = useAppStore();
  const sheetRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const [currentHeight, setCurrentHeight] = useState(SNAP_POINTS.mid);
  const [isDragging, setIsDragging] = useState(false);

  // store의 detailSheetState 변경 시 currentHeight 동기화
  useEffect(() => {
    if (detailSheetState && SNAP_POINTS[detailSheetState] !== undefined) {
      setCurrentHeight(SNAP_POINTS[detailSheetState]);
    }
  }, [detailSheetState]);

  // place를 useMemo로 계산 (훅 순서 보장)
  const place = useMemo(() => {
    return mockPlaces.find((p) => p.id === selectedPlaceId) || null;
  }, [selectedPlaceId]);

  // 할인율 계산 (place가 있을 때만)
  const discountPercent = useMemo(() => {
    if (!place) return 0;
    return Math.round(
      ((place.originalPrice - place.discountPrice) / place.originalPrice) * 100
    );
  }, [place]);

  // 가장 가까운 스냅 포인트 찾기
  const findClosestSnap = useCallback((height, velocity = 0) => {
    const projectedHeight = height - velocity * 0.15;

    // min 이하로 내리면 닫기
    if (projectedHeight < SNAP_POINTS.min - 5) {
      return 'close';
    }

    let closestState = 'mid';
    let minDiff = Infinity;

    Object.entries(SNAP_POINTS).forEach(([state, snapHeight]) => {
      const diff = Math.abs(projectedHeight - snapHeight);
      if (diff < minDiff) {
        minDiff = diff;
        closestState = state;
      }
    });

    return closestState;
  }, []);

  // 닫기 함수
  const handleClose = useCallback(() => {
    setCurrentHeight(0);
    setDetailSheetState('mid'); // 상태 리셋
    setTimeout(() => {
      setSelectedPlaceId(null);
    }, 300);
  }, [setSelectedPlaceId, setDetailSheetState]);

  // 드래그 핸들러
  const handlePointerDown = useCallback((e) => {
    dragStartY.current = e.clientY;
    dragStartHeight.current = currentHeight;
    setIsDragging(true);
  }, [currentHeight]);

  // 전역 포인터 이벤트 리스너
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const deltaY = dragStartY.current - e.clientY;
      const deltaPercent = (deltaY / window.innerHeight) * 100;
      const newHeight = Math.max(
        5,
        Math.min(SNAP_POINTS.max, dragStartHeight.current + deltaPercent)
      );
      setCurrentHeight(newHeight);
    };

    const handlePointerUp = () => {
      const velocity = 0;
      const closestState = findClosestSnap(currentHeight, velocity);

      if (closestState === 'close') {
        handleClose();
      } else {
        setCurrentHeight(SNAP_POINTS[closestState]);
        setDetailSheetState(closestState); // store 상태도 업데이트
      }
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, currentHeight, findClosestSnap, handleClose, setDetailSheetState]);

  // 선택 시 초기 높이 설정
  useEffect(() => {
    if (selectedPlaceId) {
      setCurrentHeight(SNAP_POINTS.mid);
    }
  }, [selectedPlaceId]);

  // 선택된 가게가 없으면 렌더링 안함 (모든 Hooks 다음에 위치)
  if (!place) return null;

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 flex flex-col"
      style={{
        height: `${currentHeight}vh`,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        transition: isDragging ? 'none' : 'height 0.3s ease-out',
      }}
    >
      {/* 드래그 핸들 */}
      <div
        className="flex-shrink-0 flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* 헤더 (닫기 버튼) */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pb-2">
        <button onClick={handleClose} className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
          <button className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 스크롤 가능한 컨텐츠 */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* 메인 이미지 */}
        <div className="relative">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-48 object-cover"
          />
          {place.isNew && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
              NEW
            </span>
          )}
        </div>

        {/* 가게 정보 */}
        <div className="p-4">
          {/* 가게명 */}
          <h1 className="text-xl font-bold text-black">{place.name}</h1>

          {/* 별점 + 리뷰 + 거리 */}
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <span className="text-yellow-500">★</span>
            <span className="font-medium">{place.rating}</span>
            <span className="text-gray-300">·</span>
            <span>리뷰 {place.reviewCount}개</span>
            <span className="text-gray-300">·</span>
            <span>{place.distance}km</span>
          </div>

          {/* 픽업 정보 */}
          <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {place.pickupDay === 'tomorrow' ? (
                <span className="px-2 py-1 bg-red-100 text-red-500 text-sm font-medium rounded">
                  내일
                </span>
              ) : (
                <span className="px-2 py-1 bg-green-100 text-green-600 text-sm font-medium rounded">
                  오늘
                </span>
              )}
              <span className="text-gray-700 font-medium">
                {place.pickupTime.start} ~ {place.pickupTime.end}
              </span>
            </div>
            {place.status === 'available' && (
              <span className="ml-auto text-green-600 font-medium">
                {place.availableCount}개 남음
              </span>
            )}
          </div>

          {/* 가격 */}
          <div className="flex items-center justify-between mt-4 p-4 bg-green-50 rounded-lg">
            <div>
              <span className="text-sm text-gray-400 line-through">
                {place.originalPrice.toLocaleString()}원
              </span>
              <span className="ml-2 text-sm text-green-600 font-medium">
                {discountPercent}% 할인
              </span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {place.discountPrice.toLocaleString()}원
            </span>
          </div>

          {/* 메뉴 목록 */}
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">구성품</h2>
            <div className="flex flex-wrap gap-2">
              {place.menus.map((menu, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {menu}
                </span>
              ))}
            </div>
          </div>

          {/* 가게 위치 */}
          <div className="mt-6">
            <h2 className="text-lg font-bold mb-3">픽업 위치</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{place.name}</p>
              <p className="text-sm text-gray-500 mt-1">서울시 마포구 (상세주소)</p>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="mt-6 mb-24">
            <h2 className="text-lg font-bold mb-3">주의사항</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>픽업 시간 내에 방문해주세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>구성품은 당일 재고에 따라 변경될 수 있습니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>예약 후 취소는 픽업 2시간 전까지 가능합니다</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-gray-100">
        <button
          className={`w-full py-4 rounded-xl text-white font-bold text-lg ${
            place.status === 'available'
              ? 'bg-green-500 active:bg-green-600'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={place.status !== 'available'}
        >
          {place.status === 'available'
            ? `${place.discountPrice.toLocaleString()}원 예약하기`
            : '마감되었습니다'}
        </button>
      </div>
    </div>
  );
}
