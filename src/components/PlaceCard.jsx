import { useAppStore } from '../stores/useAppStore';

// 추가 이미지 URL들 (실제로는 place.images 배열로 받아야 함)
const getSecondImage = (place) => {
  // 다른 이미지 URL 생성 (목업)
  const images = [
    'https://images.unsplash.com/photo-1517433670267-30f41c0e9e5d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
  ];
  return images[place.id % images.length];
};

export default function PlaceCard({ place, isFullScreen = false }) {
  const { setSelectedPlaceId } = useAppStore();

  const handleClick = () => {
    setSelectedPlaceId(place.id);
  };

  return (
    <div
      data-place-id={place.id}
      onClick={handleClick}
      className={
        isFullScreen
          ? 'bg-white cursor-pointer mx-4 mt-3 mb-2 rounded-2xl shadow-sm px-4 py-4'
          : 'bg-white cursor-pointer px-4 py-3'
      }
    >
      {/* 이미지 2장 그리드 */}
      <div className={`rounded-2xl overflow-hidden relative ${isFullScreen ? 'flex gap-1 h-40' : 'flex gap-1'}`}>
        <div className={`${isFullScreen ? 'flex-[1.1]' : 'flex-1 aspect-square'} relative`}>
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
        <div className={`${isFullScreen ? 'flex-[0.9]' : 'flex-1 aspect-square'} relative`}>
          <img
            src={getSecondImage(place)}
            alt={place.name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* 예약가능 배지 */}
        {place.status === 'available' && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1.5 bg-white/95 text-green-600 text-xs font-semibold rounded-full shadow-sm">
              {place.pickupDay === 'tomorrow' ? '내일' : '오늘'} {place.availableCount}개 예약가능
            </span>
          </div>
        )}
        {place.status === 'soldout' && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1.5 bg-gray-800/80 text-white text-xs font-semibold rounded-full">
              마감
            </span>
          </div>
        )}
      </div>

      {/* 가게 정보 */}
      <div className="mt-3">
        {/* 가게명 + 거리 + 아이콘 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {place.isNew && (
              <span className="text-green-500 text-sm font-bold">NEW</span>
            )}
            <h3 className="font-semibold text-base text-gray-900">{place.name}</h3>
            <span className="text-sm text-gray-400">{place.distance}km</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button className="p-1.5" onClick={(e) => e.stopPropagation()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button className="p-1.5" onClick={(e) => e.stopPropagation()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          </div>
        </div>

        {/* 별점 */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-yellow-400">★</span>
          <span className="text-sm text-gray-600">{place.reviewCount}개</span>
        </div>

        {/* 메뉴 */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
          {place.menus.map((menu, idx) => (
            <div key={menu} className="flex items-center gap-2">
              <span>{menu}</span>
              {idx < place.menus.length - 1 && <span className="h-3 w-px bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* 픽업 시간 + 가격 */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
              place.pickupDay === 'tomorrow'
                ? 'bg-orange-100 text-orange-600'
                : 'bg-green-100 text-green-600'
            }`}>
              {place.pickupDay === 'tomorrow' ? '내일' : '오늘'}
            </span>
            <span className="text-sm text-gray-600">
              {place.pickupTime.start} ~ {place.pickupTime.end}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 line-through">
              {place.originalPrice.toLocaleString()}원
            </span>
            <span className="text-base font-bold text-gray-900">
              {place.discountPrice.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
