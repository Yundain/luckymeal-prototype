import { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import FilterBar from './FilterBar';
import PlaceList from './PlaceList';
import ListViewHeader from './ListViewHeader';

// ── Design Spec: Type B — Persistent (지도/탐색형) ──
// 3단계 스냅: min(20%) ↔ mid(50%) ↔ max(100%), scrim 없음,
// 배경 인터랙션 허용, dismiss 없음 (영속)
// 📄 전체 스펙: ~/.claude/docs/luckymeal/wireframes/BottomSheet-DesignSpec.md
//
// 스냅 포인트 정의 (화면 높이 대비 %)
const SNAP_POINTS = {
  min: 20,   // 필터바만 보임
  mid: 50,   // 지도 절반 + 리스트 절반
  max: 100,  // 리스트 풀스크린 (완전히 덮음)
};

export default function BottomSheet() {
  const { sheetState, setSheetState } = useAppStore();
  const sheetRef = useRef(null);
  const contentRef = useRef(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const isScrollDraggingRef = useRef(false);
  const currentHeightRef = useRef(SNAP_POINTS.mid);
  const [currentHeight, setCurrentHeight] = useState(SNAP_POINTS.mid);
  const [isDragging, setIsDragging] = useState(false);

  // currentHeight 변경 시 ref도 동기화
  useEffect(() => {
    currentHeightRef.current = currentHeight;
  }, [currentHeight]);

  // 상태에 따른 높이
  const getHeightFromState = (state) => SNAP_POINTS[state] || SNAP_POINTS.mid;

  // sheetState 변경 시 높이 애니메이션
  useEffect(() => {
    const targetHeight = getHeightFromState(sheetState);
    setCurrentHeight(targetHeight);
  }, [sheetState]);

  // 가장 가까운 스냅 포인트 찾기
  const findClosestSnap = (height, velocity = 0) => {
    // 속도 기반 예측
    const projectedHeight = height - velocity * 0.15;

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
  };

  const isFullScreen = currentHeight >= 95;

  // 드래그 핸들러 (핸들 영역용)
  const handlePointerDown = (e) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragStartHeight.current = currentHeight;
    setIsDragging(true);

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const deltaY = dragStartY.current - e.clientY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.max(
      SNAP_POINTS.min,
      Math.min(SNAP_POINTS.max, dragStartHeight.current + deltaPercent)
    );

    setCurrentHeight(newHeight);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;

    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';

    const deltaY = dragStartY.current - e.clientY;
    const velocity = deltaY / 100;

    const closestState = findClosestSnap(currentHeight, velocity);
    setSheetState(closestState);
    setCurrentHeight(SNAP_POINTS[closestState]);
    setIsDragging(false);
  };

  // 전역 포인터 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, currentHeight]);

  // 콘텐츠 영역 터치 이벤트 (100% 아닐 때 바텀시트 드래그로 전환)
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const handleTouchStart = (e) => {
      // 100%일 때는 일반 스크롤 허용
      if (currentHeightRef.current >= 95) return;

      dragStartY.current = e.touches[0].clientY;
      dragStartHeight.current = currentHeightRef.current;
      isScrollDraggingRef.current = true;

      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    };

    const handleTouchMove = (e) => {
      if (!isScrollDraggingRef.current) return;
      if (currentHeightRef.current >= 95) return;

      e.preventDefault(); // 스크롤 방지, 바텀시트 드래그로 전환

      const deltaY = dragStartY.current - e.touches[0].clientY;
      const deltaPercent = (deltaY / window.innerHeight) * 100;
      const newHeight = Math.max(
        SNAP_POINTS.min,
        Math.min(SNAP_POINTS.max, dragStartHeight.current + deltaPercent)
      );

      currentHeightRef.current = newHeight;
      setCurrentHeight(newHeight);
    };

    const handleTouchEnd = (e) => {
      if (!isScrollDraggingRef.current) return;

      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';

      const touch = e.changedTouches[0];
      const deltaY = dragStartY.current - touch.clientY;
      const velocity = deltaY / 100;

      const closestState = findClosestSnap(currentHeightRef.current, velocity);
      setSheetState(closestState);
      setCurrentHeight(SNAP_POINTS[closestState]);
      isScrollDraggingRef.current = false;
    };

    contentEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    contentEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    contentEl.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      contentEl.removeEventListener('touchstart', handleTouchStart);
      contentEl.removeEventListener('touchmove', handleTouchMove);
      contentEl.removeEventListener('touchend', handleTouchEnd);
    };
  }, [setSheetState]);

  return (
    <div
      ref={sheetRef}
      className={`fixed bottom-0 left-0 right-0 bg-white z-40 flex flex-col ${
        isFullScreen ? 'rounded-none' : 'rounded-t-3xl'
      }`}
      style={{
        height: `${currentHeight}dvh`,
        paddingTop: isFullScreen ? 'env(safe-area-inset-top)' : 0,
        boxShadow: isFullScreen ? 'none' : '0 -4px 20px rgba(0, 0, 0, 0.1)',
        transition: isDragging ? 'none' : 'height 0.3s ease-out',
      }}
    >
      {/* 풀스크린일 때: 리스트뷰 헤더 */}
      {isFullScreen && (
        <div className="flex-shrink-0">
          <ListViewHeader onDragDown={handlePointerDown} />
        </div>
      )}

      {/* 풀스크린 아닐 때: 드래그 핸들 */}
      {!isFullScreen && (
        <div
          className="flex-shrink-0 flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none select-none"
          onPointerDown={handlePointerDown}
          style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
      )}

      {/* 필터 바 */}
      <div className="flex-shrink-0">
        <FilterBar isFullScreen={isFullScreen} />
      </div>

      {/* 가게 리스트 (풀스크린일 때 배너 포함) */}
      <div
        ref={contentRef}
        className={`flex-1 overscroll-contain ${isFullScreen ? 'overflow-y-auto' : 'overflow-hidden'}`}
        style={{
          WebkitOverflowScrolling: isFullScreen ? 'touch' : 'auto',
          touchAction: isFullScreen ? 'auto' : 'none',
        }}
      >
        <PlaceList showBanner={isFullScreen} isFullScreen={isFullScreen} />
      </div>
    </div>
  );
}
