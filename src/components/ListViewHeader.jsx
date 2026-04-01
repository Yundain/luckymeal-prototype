import { useAppStore } from '../stores/useAppStore';

export default function ListViewHeader({ onDragDown }) {
  const { searchRadius, setIsSearchMode } = useAppStore();

  // km를 보기 좋게 표시
  const radiusText = searchRadius < 1
    ? `${Math.round(searchRadius * 1000)}m`
    : `${searchRadius}km`;

  return (
    <div className="bg-white">
      {/* 드래그 핸들 (지도 보기용) */}
      <div
        className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={onDragDown}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* 상단 헤더: 위치 + 아이콘들 */}
      <div className="flex items-center justify-between px-4 py-2">
        <button className="flex items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#22C55E" stroke="#22C55E" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" fill="white" stroke="white" />
          </svg>
          <span className="font-semibold text-gray-900">우리집</span>
          <span className="text-green-500 font-medium">+{radiusText}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <button className="p-2" onClick={() => setIsSearchMode(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
          <button className="p-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button className="p-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
