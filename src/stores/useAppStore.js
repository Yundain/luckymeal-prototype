import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // 바텀시트 상태: 'min' (20%), 'mid' (50%), 'max' (90%)
  sheetState: 'mid',
  setSheetState: (state) => set({ sheetState: state }),

  // 선택된 가게 ID (핀 클릭 시)
  selectedPlaceId: null,
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),

  // 필터 상태
  filters: {
    availableOnly: false,
    category: 'all',
    pickupDay: 'all', // 'all', 'today', 'tomorrow'
    pickupTimeRange: 'all', // 'all', 'morning', 'lunch', 'afternoon', 'evening'
  },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  // 정렬
  sortBy: 'pickupTime',
  setSortBy: (sort) => set({ sortBy: sort }),

  // 선택된 위치 탭
  locationTab: 'home', // 'home', 'work'
  setLocationTab: (tab) => set({ locationTab: tab }),

  // 재검색 버튼 표시 여부
  showReSearch: false,
  setShowReSearch: (show) => set({ showReSearch: show }),

  // 지도 중심 좌표
  mapCenter: { lat: 37.5547, lng: 126.9707 },
  setMapCenter: (center) => set({ mapCenter: center }),

  // 지도 bounds (현재 지도 영역)
  mapBounds: null,
  setMapBounds: (bounds) => set({ mapBounds: bounds }),

  // 현재 줌 레벨
  zoomLevel: 14,
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),

  // 현재 검색 반경 (km)
  searchRadius: 2,
  setSearchRadius: (radius) => set({ searchRadius: radius }),

  // 현재 표시할 가게 ID 목록 (지도 영역 내)
  visiblePlaceIds: null, // null이면 전체 표시
  setVisiblePlaceIds: (ids) => set({ visiblePlaceIds: ids }),

  // 토스트 메시지
  toastMessage: null,
  setToastMessage: (message) => set({ toastMessage: message }),
  clearToastMessage: () => set({ toastMessage: null }),

  // 줌아웃 트리거 (더 넓게 검색 버튼 클릭 시)
  triggerZoomOut: false,
  setTriggerZoomOut: (trigger) => set({ triggerZoomOut: trigger }),

  // 등록된 위치 정보
  savedLocations: {
    home: { lat: 37.5704, lng: 126.9831, name: '집' }, // 서울 종로구 종로 1
    work: { lat: 37.5503, lng: 126.9197, name: '회사' }, // 서울 마포구 양화로 81
  },

  // 위치 이동 트리거 (집/회사 버튼 클릭 시)
  triggerMoveToLocation: null, // 'home' | 'work' | null
  setTriggerMoveToLocation: (location) => set({ triggerMoveToLocation: location }),

  // 반경 원 표시 트리거 (재검색 시)
  showRadiusCircle: false,
  setShowRadiusCircle: (show) => set({ showRadiusCircle: show }),

  // 가게 상세 시트 상태: 'min' (15%), 'mid' (60%), 'max' (100%)
  detailSheetState: 'mid',
  setDetailSheetState: (state) => set({ detailSheetState: state }),

  // 검색 모드 상태
  isSearchMode: false,
  setIsSearchMode: (isOpen) => set({ isSearchMode: isOpen }),
  searchKeyword: '',
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  searchType: null, // 'category' | 'menu' | 'store' | null
  setSearchType: (type) => set({ searchType: type }),
}));
