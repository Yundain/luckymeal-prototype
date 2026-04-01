import { useAppStore } from '../stores/useAppStore';
import { mockPlaces } from '../data/mockPlaces';
import { filterPlacesByRadius, getRadiusForZoom, formatDistance } from '../utils/geoUtils';

export default function ReSearchButton() {
  const {
    showReSearch,
    setShowReSearch,
    mapCenter,
    zoomLevel,
    setVisiblePlaceIds,
    setSearchRadius,
    setToastMessage,
    setShowRadiusCircle,
    setSheetState,
  } = useAppStore();

  if (!showReSearch) return null;

  const handleClick = () => {
    // 줌 레벨에 따른 검색 반경 계산
    const radius = getRadiusForZoom(zoomLevel);
    setSearchRadius(radius);

    // 지도 중심점 기준 원형 반경 검색
    const placesInRadius = filterPlacesByRadius(mockPlaces, mapCenter, radius);

    // 검색 결과 적용
    setVisiblePlaceIds(placesInRadius.map((p) => p.id));

    // 검색 결과 안내
    const radiusText = formatDistance(radius);
    setToastMessage(`반경 ${radiusText} 내 ${placesInRadius.length}개 가게`);

    // 반경 원 표시 트리거
    setShowRadiusCircle(true);

    // 바텀시트 50%로 올리기 (결과 유무와 관계없이)
    setSheetState('mid');

    setShowReSearch(false);
  };

  // 현재 줌 레벨에 해당하는 반경 표시
  const currentRadius = getRadiusForZoom(zoomLevel);
  const radiusText = formatDistance(currentRadius);

  return (
    <button
      onClick={handleClick}
      className="fixed top-32 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-white border border-green-500 rounded-full shadow-lg hover:bg-green-50 active:bg-green-100 transition-colors"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22C55E"
        strokeWidth="2"
      >
        <path d="M23 4v6h-6" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      <span className="text-sm font-medium text-green-600">
        이 주변 {radiusText} 재검색
      </span>
    </button>
  );
}
