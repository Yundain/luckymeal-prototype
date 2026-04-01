/**
 * 지도 검색 관련 유틸리티 함수
 */

/**
 * Haversine 공식을 사용한 두 좌표 간 거리 계산 (km)
 * @param {number} lat1 - 시작점 위도
 * @param {number} lng1 - 시작점 경도
 * @param {number} lat2 - 끝점 위도
 * @param {number} lng2 - 끝점 경도
 * @returns {number} 거리 (km)
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * 줌 레벨에 따른 검색 반경 (km) 매핑
 * 네이버 지도 기준, 모바일 화면(약 375px 너비)에서
 * 화면에 보이는 영역보다 살짝 넓게 검색되도록 설정
 *
 * | 줌 레벨 | 검색 반경 | 설명 |
 * |---------|----------|------|
 * | 18 (최대 확대) | 0.15km | 150m 반경 |
 * | 17 | 0.3km | 300m 반경 |
 * | 16 | 0.5km | 500m 반경 |
 * | 15 | 1km | 도보 10분 거리 |
 * | 14 (기본) | 1.5km | 기본 검색 반경 |
 * | 13 | 2.5km | 자전거 거리 |
 * | 12 | 4km | 동네 전체 |
 * | 11 | 7km | 구 단위 |
 * | 10 (최소 축소) | 12km | 광역 검색 |
 */
export const ZOOM_RADIUS_MAP = {
  18: 0.15,
  17: 0.3,
  16: 0.5,
  15: 1,
  14: 1.5,
  13: 2.5,
  12: 4,
  11: 7,
  10: 12,
};

/**
 * 줌 레벨에 해당하는 검색 반경 반환
 * @param {number} zoom - 네이버 지도 줌 레벨 (10-18)
 * @returns {number} 검색 반경 (km)
 */
export const getRadiusForZoom = (zoom) => {
  // 범위 제한
  const clampedZoom = Math.max(10, Math.min(18, Math.round(zoom)));
  return ZOOM_RADIUS_MAP[clampedZoom] || 2;
};

/**
 * 중심점과 반경을 기준으로 원형 영역 내 가게 필터링
 * @param {Array} places - 가게 목록
 * @param {Object} center - 중심 좌표 { lat, lng }
 * @param {number} radiusKm - 검색 반경 (km)
 * @returns {Array} 반경 내 가게 목록 (거리 정보 포함)
 */
export const filterPlacesByRadius = (places, center, radiusKm) => {
  return places
    .map((place) => {
      const distance = calculateDistance(
        center.lat,
        center.lng,
        place.lat,
        place.lng
      );
      return { ...place, calculatedDistance: distance };
    })
    .filter((place) => place.calculatedDistance <= radiusKm)
    .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
};

/**
 * 거리를 사람이 읽기 좋은 형태로 포맷
 * @param {number} km - 거리 (km)
 * @returns {string} 포맷된 거리 문자열
 */
export const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};
