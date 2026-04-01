import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { mockPlaces } from '../data/mockPlaces';
import { filterPlacesByRadius, getRadiusForZoom, formatDistance } from '../utils/geoUtils';

// 네이버 지도 스크립트 동적 로드
const loadNaverMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.naver && window.naver.maps) {
      resolve(window.naver);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_CLOUD_MAP_CLIENT_KEY}`;
    script.async = true;
    script.onload = () => resolve(window.naver);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function NaverMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const circleRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const {
    mapCenter,
    setMapCenter,
    setShowReSearch,
    selectedPlaceId,
    setSelectedPlaceId,
    setSheetState,
    setMapBounds,
    visiblePlaceIds,
    setVisiblePlaceIds,
    triggerZoomOut,
    setTriggerZoomOut,
    setToastMessage,
    setZoomLevel,
    setSearchRadius,
    searchRadius,
    savedLocations,
    triggerMoveToLocation,
    setTriggerMoveToLocation,
    showRadiusCircle,
    setShowRadiusCircle,
    setDetailSheetState,
    sheetState,
  } = useAppStore();

  // 바텀시트 높이에 따른 지도 중심 오프셋 계산 (바텀시트 위 영역의 중앙)
  const getMapCenterOffset = (sheetStateValue) => {
    const sheetHeights = { min: 20, mid: 50, max: 100 };
    const sheetHeightPercent = sheetHeights[sheetStateValue] || 50;
    // 바텀시트가 차지하는 높이의 절반만큼 지도 중심을 위로 이동
    // (화면 하단 기준이므로 양수값 = 아래로 오프셋 = 실제 중심은 위로)
    const offsetY = (sheetHeightPercent / 2) * (window.innerHeight / 100);
    return offsetY;
  };

  // setter 함수들을 ref에 저장하여 이벤트 리스너에서 최신 참조 사용
  const settersRef = useRef({
    setMapCenter,
    setShowReSearch,
    setSheetState,
    setMapBounds,
    setZoomLevel,
    setSearchRadius,
    setVisiblePlaceIds,
    setDetailSheetState,
  });

  // setter 함수들이 변경될 때마다 ref 업데이트
  useEffect(() => {
    settersRef.current = {
      setMapCenter,
      setShowReSearch,
      setSheetState,
      setMapBounds,
      setZoomLevel,
      setSearchRadius,
      setVisiblePlaceIds,
      setDetailSheetState,
    };
  }, [setMapCenter, setShowReSearch, setSheetState, setMapBounds, setZoomLevel, setSearchRadius, setVisiblePlaceIds, setDetailSheetState]);

  // 마커 생성 함수
  const createMarker = useCallback((place, map) => {
    const { naver } = window;

    // 커스텀 마커 HTML
    const isSelected = selectedPlaceId === place.id;
    const isSoldOut = place.status === 'soldout';

    const markerContent = `
      <div style="
        width: ${isSelected ? '36px' : '28px'};
        height: ${isSelected ? '36px' : '28px'};
        border-radius: 50%;
        background-color: ${isSoldOut ? '#A3A3A3' : '#22C55E'};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${isSelected ? '14px' : '12px'};
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
      ">
        ${place.availableCount > 0 ? place.availableCount : ''}
      </div>
    `;

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(place.lat, place.lng),
      map: map,
      icon: {
        content: markerContent,
        anchor: new naver.maps.Point(isSelected ? 18 : 14, isSelected ? 18 : 14),
      },
    });

    // 마커 클릭 이벤트
    naver.maps.Event.addListener(marker, 'click', () => {
      setSelectedPlaceId(place.id);
      setSheetState('mid');
    });

    return marker;
  }, [selectedPlaceId, setSelectedPlaceId, setSheetState]);

  // 마커 업데이트
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 표시할 가게 필터링
    const placesToShow = visiblePlaceIds !== null
      ? mockPlaces.filter((p) => visiblePlaceIds.includes(p.id))
      : mockPlaces;

    // 새 마커 생성
    placesToShow.forEach((place) => {
      const marker = createMarker(place, mapInstanceRef.current);
      markersRef.current.push(marker);
    });
  }, [createMarker, visiblePlaceIds]);

  // 지도 스크립트 로드 및 초기화
  useEffect(() => {
    loadNaverMapScript()
      .then(() => {
        setIsMapLoaded(true);
      })
      .catch((error) => {
        console.error('네이버 지도 로드 실패:', error);
      });
  }, []);

  // 초기 지도 중심 좌표 저장 (최초 렌더링 시점의 값 사용)
  const initialCenterRef = useRef(mapCenter);

  // 지도 초기화 - 한 번만 실행
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const { naver } = window;

    const mapOptions = {
      center: new naver.maps.LatLng(initialCenterRef.current.lat, initialCenterRef.current.lng),
      zoom: 14,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
      mapDataControl: false,
      scaleControl: false,
    };

    const map = new naver.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // bounds 업데이트 함수
    const updateBounds = () => {
      const bounds = map.getBounds();
      settersRef.current.setMapBounds({
        sw: { lat: bounds.getSW().lat(), lng: bounds.getSW().lng() },
        ne: { lat: bounds.getNE().lat(), lng: bounds.getNE().lng() },
      });
    };

    // 지도 드래그 시작 - 바텀시트 최소화 (리스트 + 상세 모두)
    naver.maps.Event.addListener(map, 'dragstart', () => {
      console.log('dragstart - setSheetState min');
      settersRef.current.setSheetState('min');
      settersRef.current.setDetailSheetState('min');
    });

    // 지도 이동 이벤트 - 드래그 종료 시 중심 좌표 업데이트
    naver.maps.Event.addListener(map, 'dragend', () => {
      const center = map.getCenter();
      const newCenter = { lat: center.lat(), lng: center.lng() };
      settersRef.current.setMapCenter(newCenter);
      updateBounds();
      settersRef.current.setShowReSearch(true);
    });

    // 줌 변경 이벤트 - 줌 레벨과 중심 좌표 모두 업데이트 + 바텀시트 최소화 (리스트 + 상세 모두)
    naver.maps.Event.addListener(map, 'zoom_changed', () => {
      const zoom = map.getZoom();
      const center = map.getCenter();
      const newCenter = { lat: center.lat(), lng: center.lng() };

      console.log('zoom_changed - setSheetState min, zoom:', zoom);
      settersRef.current.setZoomLevel(zoom);
      settersRef.current.setMapCenter(newCenter);
      updateBounds();
      settersRef.current.setShowReSearch(true);
      settersRef.current.setSheetState('min');
      settersRef.current.setDetailSheetState('min');
    });

    // 초기 bounds 설정 및 원형 반경 검색
    setTimeout(() => {
      updateBounds();

      // 초기 검색: 지도 중심 기준 원형 반경 검색
      const initialZoom = map.getZoom();
      const initialRadius = getRadiusForZoom(initialZoom);
      const center = map.getCenter();
      const centerCoords = { lat: center.lat(), lng: center.lng() };

      settersRef.current.setZoomLevel(initialZoom);
      settersRef.current.setSearchRadius(initialRadius);
      settersRef.current.setMapCenter(centerCoords);

      const initialPlaces = filterPlacesByRadius(mockPlaces, centerCoords, initialRadius);
      settersRef.current.setVisiblePlaceIds(initialPlaces.map((p) => p.id));
    }, 100);

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, [isMapLoaded]);

  // 선택된 장소 또는 visiblePlaceIds 변경 시 마커 업데이트
  useEffect(() => {
    updateMarkers();
  }, [selectedPlaceId, visiblePlaceIds, updateMarkers]);

  // 바텀시트 높이 변경 시 지도 중심 오프셋 조정
  const prevSheetStateRef = useRef(sheetState);
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver) return;

    const prevState = prevSheetStateRef.current;
    if (prevState === sheetState) return;

    const sheetHeights = { min: 20, mid: 50, max: 100 };
    const prevHeight = sheetHeights[prevState] || 50;
    const newHeight = sheetHeights[sheetState] || 50;

    // 높이 변화량의 절반만큼 지도 중심 이동 (바텀시트가 커지면 지도 중심을 위로)
    const heightDiff = newHeight - prevHeight;
    const offsetY = (heightDiff / 2) * (window.innerHeight / 100);

    if (offsetY !== 0) {
      mapInstanceRef.current.panBy(new window.naver.maps.Point(0, offsetY));
    }

    prevSheetStateRef.current = sheetState;
  }, [sheetState]);

  // 선택된 장소로 지도 이동
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPlaceId) return;

    const place = mockPlaces.find((p) => p.id === selectedPlaceId);
    if (place) {
      const { naver } = window;
      mapInstanceRef.current.panTo(new naver.maps.LatLng(place.lat, place.lng));
    }
  }, [selectedPlaceId]);

  // "더 넓게 검색" 버튼 클릭 시 줌아웃 + 원형 반경 재검색
  useEffect(() => {
    if (!triggerZoomOut || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const currentZoom = map.getZoom();

    // 2단계 줌아웃 (최소 줌 레벨 10까지)
    const newZoom = Math.max(10, currentZoom - 2);
    map.setZoom(newZoom);

    // 줌 변경 후 원형 반경으로 재검색
    setTimeout(() => {
      const bounds = map.getBounds();
      const newBounds = {
        sw: { lat: bounds.getSW().lat(), lng: bounds.getSW().lng() },
        ne: { lat: bounds.getNE().lat(), lng: bounds.getNE().lng() },
      };
      setMapBounds(newBounds);

      // 줌 레벨에 따른 반경 계산
      const newRadius = getRadiusForZoom(newZoom);
      const center = map.getCenter();
      const newCenter = { lat: center.lat(), lng: center.lng() };

      setZoomLevel(newZoom);
      setSearchRadius(newRadius);
      setMapCenter(newCenter);

      // 원형 반경 검색
      const placesInRadius = filterPlacesByRadius(mockPlaces, newCenter, newRadius);
      setVisiblePlaceIds(placesInRadius.map((p) => p.id));

      const radiusText = formatDistance(newRadius);
      setToastMessage(`반경 ${radiusText}로 확장하여 ${placesInRadius.length}개 가게를 찾았습니다`);
      setShowReSearch(false);
    }, 300);

    // 트리거 리셋
    setTriggerZoomOut(false);
  }, [triggerZoomOut, setTriggerZoomOut, setMapBounds, setVisiblePlaceIds, setToastMessage, setShowReSearch, setZoomLevel, setSearchRadius, setMapCenter]);

  // 집/회사 버튼 클릭 시 해당 위치로 이동 + 자동 재검색 + 유동적 줌 레벨
  useEffect(() => {
    if (!triggerMoveToLocation || !mapInstanceRef.current) return;

    const location = savedLocations[triggerMoveToLocation];
    if (!location) {
      setTriggerMoveToLocation(null);
      return;
    }

    const map = mapInstanceRef.current;
    const { naver } = window;
    const newCenter = { lat: location.lat, lng: location.lng };

    // 해당 위치로 지도 이동
    map.panTo(new naver.maps.LatLng(location.lat, location.lng));

    // 지도 이동 후 가게 수에 맞춰 유동적 줌 레벨 계산 및 재검색
    setTimeout(() => {
      // 점진적 반경 확장: 최소 10개 이상 OR 최대 10km 도달 시 중단
      const radiusSteps = [0.5, 1, 2, 3, 5, 7, 10]; // km 단위
      const minPlaceCount = 10;
      const maxRadius = 10; // km

      let optimalRadius = radiusSteps[0];
      let placesInRadius = [];

      for (const radius of radiusSteps) {
        placesInRadius = filterPlacesByRadius(mockPlaces, newCenter, radius);
        optimalRadius = radius;

        // 10개 이상이면 중단
        if (placesInRadius.length >= minPlaceCount) {
          break;
        }

        // 최대 반경 10km 도달 시 중단
        if (radius >= maxRadius) {
          break;
        }
      }

      // 반경에 맞는 줌 레벨 역산 (반경이 화면에 딱 맞게 보이도록 한 단계 높은 줌)
      let optimalZoom;
      if (optimalRadius <= 0.5) {
        optimalZoom = 17;
      } else if (optimalRadius <= 1) {
        optimalZoom = 16;
      } else if (optimalRadius <= 2) {
        optimalZoom = 15;
      } else if (optimalRadius <= 3) {
        optimalZoom = 14;
      } else if (optimalRadius <= 5) {
        optimalZoom = 13;
      } else if (optimalRadius <= 7) {
        optimalZoom = 12;
      } else {
        optimalZoom = 11;
      }

      // 줌 레벨 설정
      map.setZoom(optimalZoom);

      // 상태 업데이트
      setMapCenter(newCenter);
      setZoomLevel(optimalZoom);
      setSearchRadius(optimalRadius);
      setVisiblePlaceIds(placesInRadius.map((p) => p.id));
      setShowReSearch(false);

      const radiusText = formatDistance(optimalRadius);
      setToastMessage(`${location.name} 주변 ${radiusText} 내 ${placesInRadius.length}개 가게`);
    }, 300);

    // 트리거 리셋
    setTriggerMoveToLocation(null);
  }, [triggerMoveToLocation, savedLocations, setTriggerMoveToLocation, setMapCenter, setZoomLevel, setSearchRadius, setVisiblePlaceIds, setShowReSearch, setToastMessage]);

  // 반경 원 표시 (재검색 시)
  useEffect(() => {
    if (!showRadiusCircle || !mapInstanceRef.current) return;

    const { naver } = window;
    const map = mapInstanceRef.current;

    // 기존 원 제거
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    // 새 원 생성
    const circle = new naver.maps.Circle({
      map: map,
      center: new naver.maps.LatLng(mapCenter.lat, mapCenter.lng),
      radius: searchRadius * 1000, // km → m
      strokeColor: '#22C55E',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#22C55E',
      fillOpacity: 0.15,
    });

    circleRef.current = circle;

    // 1.5초 후 페이드아웃 시작
    const fadeOutTimeout = setTimeout(() => {
      let opacity = 0.15;
      const fadeInterval = setInterval(() => {
        opacity -= 0.02;
        if (opacity <= 0) {
          clearInterval(fadeInterval);
          circle.setMap(null);
          circleRef.current = null;
          setShowRadiusCircle(false);
        } else {
          circle.setOptions({
            fillOpacity: opacity,
            strokeOpacity: opacity * 5, // stroke는 더 빨리 사라지도록
          });
        }
      }, 50);
    }, 1000);

    return () => {
      clearTimeout(fadeOutTimeout);
    };
  }, [showRadiusCircle, mapCenter, searchRadius, setShowRadiusCircle]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full bg-gray-100"
      style={{ minHeight: '100%' }}
    >
      {!isMapLoaded && (
        <div className="flex items-center justify-center h-full text-gray-400">
          지도 로딩 중...
        </div>
      )}
    </div>
  );
}
