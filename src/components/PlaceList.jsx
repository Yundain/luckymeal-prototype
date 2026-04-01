import { useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { mockPlaces } from '../data/mockPlaces';
import PlaceCard from './PlaceCard';
import ExpandSearchButton from './ExpandSearchButton';
import PromoBanner from './PromoBanner';

export default function PlaceList({ showBanner = false, isFullScreen = false }) {
  const { filters, sortBy, visiblePlaceIds } = useAppStore();

  const filteredAndSortedPlaces = useMemo(() => {
    let result = [...mockPlaces];

    // 지도 영역 필터 (재검색 후)
    if (visiblePlaceIds !== null) {
      result = result.filter((place) => visiblePlaceIds.includes(place.id));
    }

    // 예약가능만 필터
    if (filters.availableOnly) {
      result = result.filter((place) => place.status === 'available');
    }

    // 카테고리 필터
    if (filters.category && filters.category !== 'all') {
      result = result.filter((place) => place.category === filters.category);
    }

    // 날짜 필터
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
          case 'morning': // 06-12시
            return startHour >= 6 && startHour < 12;
          case 'lunch': // 12-14시
            return startHour >= 12 && startHour < 14;
          case 'afternoon': // 14-18시
            return startHour >= 14 && startHour < 18;
          case 'evening': // 18-22시
            return startHour >= 18 && startHour < 22;
          default:
            return true;
        }
      });
    }

    // 정렬
    switch (sortBy) {
      case 'distance':
        result.sort((a, b) => a.distance - b.distance);
        break;
      case 'price':
        result.sort((a, b) => a.discountPrice - b.discountPrice);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'pickupTime':
      default:
        // 픽업 시간 순 (오늘 > 내일, 그 다음 시간 순)
        result.sort((a, b) => {
          if (a.pickupDay !== b.pickupDay) {
            return a.pickupDay === 'today' ? -1 : 1;
          }
          return a.pickupTime.start.localeCompare(b.pickupTime.start);
        });
        break;
    }

    return result;
  }, [filters, sortBy, visiblePlaceIds]);

  const topHeroImage = filteredAndSortedPlaces[0]?.image;

  return (
    <div className={isFullScreen ? 'bg-[#F2F1ED]' : 'bg-white'}>
      {/* 풀스크린 헤더 섹션 */}
      {isFullScreen && topHeroImage && (
        <div className="px-4 pt-3">
          <div className="rounded-2xl overflow-hidden bg-[#F2F1ED]">
            <img
              src={topHeroImage}
              alt="대표 이미지"
              className="h-24 w-full object-cover"
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* 풀스크린일 때 배너를 스크롤 영역 최상단에 표시 */}
      {showBanner && (
        <div className="py-3 px-4">
          <PromoBanner />
        </div>
      )}

      {filteredAndSortedPlaces.map((place, index) => (
        <div key={place.id}>
          <PlaceCard place={place} isFullScreen={isFullScreen} />
          {index < filteredAndSortedPlaces.length - 1 && (
            <div className={isFullScreen ? 'h-3' : 'h-2 bg-gray-100'} />
          )}
        </div>
      ))}

      {/* 결과가 있을 때: 리스트 최하단에 "더 넓게 검색" 버튼 */}
      {filteredAndSortedPlaces.length > 0 && (
        <div className={isFullScreen ? 'px-4 pb-4' : ''}>
          <ExpandSearchButton />
        </div>
      )}

      {/* 결과가 없을 때 */}
      {filteredAndSortedPlaces.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <p className="mt-3 text-sm">이 지역에 검색 결과가 없습니다</p>
          <ExpandSearchButton variant="empty" />
        </div>
      )}
    </div>
  );
}
