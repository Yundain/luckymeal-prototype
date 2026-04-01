import { useAppStore } from '../stores/useAppStore';

export default function Header() {
  const { locationTab, setLocationTab, sheetState, setTriggerMoveToLocation, setIsSearchMode } = useAppStore();

  const handleLocationClick = (tab) => {
    setLocationTab(tab);
    setTriggerMoveToLocation(tab);
  };

  // 바텀시트가 100%(max)일 때는 헤더 숨김
  if (sheetState === 'max') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* 검색바 */}
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={() => setIsSearchMode(true)}
          className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-md"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="flex-1 text-left text-sm text-gray-400">
            메뉴나 가게를 검색
          </span>
          <div className="p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="p-1 relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </button>
      </div>

      {/* 위치 탭 */}
      <div className="flex items-center px-4 pb-2 gap-2">
        <button
          onClick={() => handleLocationClick('home')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm shadow-md transition-colors ${
            locationTab === 'home'
              ? 'bg-white font-medium text-gray-900'
              : 'bg-white text-gray-500'
          }`}
        >
          <span>🏠</span>
          <span>집</span>
        </button>
        <button
          onClick={() => handleLocationClick('work')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm shadow-md transition-colors ${
            locationTab === 'work'
              ? 'bg-white font-medium text-gray-900'
              : 'bg-white text-gray-500'
          }`}
        >
          <span>🏢</span>
          <span>회사</span>
        </button>
        <button className="p-2 bg-white rounded-full shadow-md">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
