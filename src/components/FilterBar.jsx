import { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { categories, mockPlaces } from '../data/mockPlaces';

const sortOptions = [
  { id: 'pickupTime', label: '추천' },
  { id: 'distance', label: '거리' },
  { id: 'price', label: '가격' },
  { id: 'rating', label: '별점' },
];

export default function FilterBar({ isFullScreen = false }) {
  const { filters, setFilter, sortBy, setSortBy, visiblePlaceIds } = useAppStore();

  // 필터된 결과 수 계산
  const filteredCount = useMemo(() => {
    let result = [...mockPlaces];

    // 지도 영역 필터
    if (visiblePlaceIds !== null) {
      result = result.filter((place) => visiblePlaceIds.includes(place.id));
    }

    if (filters.availableOnly) {
      result = result.filter((place) => place.status === 'available');
    }

    // 카테고리 필터
    if (filters.category && filters.category !== 'all') {
      result = result.filter((place) => place.category === filters.category);
    }

    if (filters.pickupDay === 'today') {
      result = result.filter((place) => place.pickupDay === 'today');
    } else if (filters.pickupDay === 'tomorrow') {
      result = result.filter((place) => place.pickupDay === 'tomorrow');
    }

    // 픽업시간 필터
    if (filters.pickupTimeRange && filters.pickupTimeRange !== 'all') {
      result = result.filter((place) => {
        const startHour = parseInt(place.pickupTime.start.split(':')[0], 10);
        switch (filters.pickupTimeRange) {
          case 'morning':
            return startHour >= 6 && startHour < 12;
          case 'lunch':
            return startHour >= 12 && startHour < 14;
          case 'afternoon':
            return startHour >= 14 && startHour < 18;
          case 'evening':
            return startHour >= 18 && startHour < 22;
          default:
            return true;
        }
      });
    }

    return result.length;
  }, [filters, visiblePlaceIds]);

  if (isFullScreen) {
    return (
      <div className="bg-white pt-2">
        {/* 정렬 탭 (세그먼트) */}
        <div className="px-4">
          <div className="bg-[#F2F1ED] rounded-2xl p-1 shadow-inner flex gap-2 overflow-x-auto hide-scrollbar">
            {sortOptions.map((option) => {
              const active = sortBy === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`flex-1 min-w-[84px] h-9 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-white text-gray-800 shadow-[0_8px_24px_rgba(0,0,0,0.12)]'
                      : 'text-gray-500'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="px-4 mt-3">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {categories.map((cat) => {
              const active = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilter('category', cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-white border-[#C6C5C1] text-gray-800 shadow-sm'
                      : 'border-[#C6C5C1] text-gray-600 bg-white/70'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </button>
              );
            })}

            <span className="h-4 w-px bg-gray-200" />
            <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#F2F1ED] text-gray-600 border border-[#E6E4DD]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <path d="M6 4h12v16l-6-3-6 3V4z" />
              </svg>
              즐겨찾기
            </button>
          </div>
        </div>

        {/* 필터 행 */}
        <div className="flex items-center gap-3 px-4 py-3 text-sm">
          <button
            onClick={() => {
              const newValue = !filters.availableOnly;
              setFilter('availableOnly', newValue);
              if (!newValue) {
                setFilter('pickupDay', 'all');
              }
            }}
            className={`px-3 py-1.5 rounded-lg border ${
              filters.availableOnly
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-[#D6D5CF]'
            }`}
          >
            예약가능
          </button>

          <div className="relative">
            <select
              value={filters.pickupTimeRange}
              onChange={(e) => setFilter('pickupTimeRange', e.target.value)}
              className="appearance-none px-3 py-1.5 pr-7 rounded-lg border bg-white text-gray-700 border-[#D6D5CF] font-medium"
            >
              <option value="all">픽업시간</option>
              <option value="morning">오전 (06-12시)</option>
              <option value="lunch">점심 (12-14시)</option>
              <option value="afternoon">오후 (14-18시)</option>
              <option value="evening">저녁 (18-22시)</option>
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          <div className="flex-1 text-right text-gray-500 font-medium">{filteredCount}개 검색됨</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 필터 버튼들 */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
        {/* 예약가능만 */}
        <button
          onClick={() => {
            const newValue = !filters.availableOnly;
            setFilter('availableOnly', newValue);
            // 예약가능만 해제 시 pickupDay 필터도 초기화
            if (!newValue) {
              setFilter('pickupDay', 'all');
            }
          }}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filters.availableOnly
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          예약가능만
        </button>

        {/* 카테고리 */}
        <div className="relative flex-shrink-0">
          <select
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
            className={`appearance-none px-4 py-2 pr-8 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              filters.category !== 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          <svg
            className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              filters.category !== 'all' ? 'text-white' : 'text-gray-500'
            }`}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* 픽업시간 */}
        <div className="relative flex-shrink-0">
          <select
            value={filters.pickupTimeRange}
            onChange={(e) => setFilter('pickupTimeRange', e.target.value)}
            className={`appearance-none px-4 py-2 pr-8 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              filters.pickupTimeRange !== 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <option value="all">픽업시간</option>
            <option value="morning">오전 (06-12시)</option>
            <option value="lunch">점심 (12-14시)</option>
            <option value="afternoon">오후 (14-18시)</option>
            <option value="evening">저녁 (18-22시)</option>
          </select>
          <svg
            className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              filters.pickupTimeRange !== 'all' ? 'text-white' : 'text-gray-500'
            }`}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* 날짜 탭 (예약가능만 선택 시에만 표시) */}
      {filters.availableOnly && (
        <div className="flex mx-4 mb-2 bg-gray-100 rounded-xl p-1">
          {[
            { id: 'all', name: '전체' },
            { id: 'today', name: '오늘' },
            { id: 'tomorrow', name: '내일' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter('pickupDay', tab.id)}
              className={`flex-1 py-2 text-sm font-medium transition-colors rounded-lg ${
                filters.pickupDay === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      )}

      {/* 정렬 + 검색 결과 수 */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none text-sm text-gray-600 pr-5 cursor-pointer bg-transparent font-medium"
          >
            <option value="pickupTime">픽업 가까운 순</option>
            <option value="distance">가까운 순</option>
            <option value="price">가격 낮은 순</option>
            <option value="rating">별점 높은 순</option>
          </select>
          <svg
            className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B7280"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <span className="text-sm text-gray-400">{filteredCount}개 검색됨</span>
      </div>
    </div>
  );
}
