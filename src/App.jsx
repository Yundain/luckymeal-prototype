import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from './stores/useAppStore';
import Header from './components/Header';
import NaverMap from './components/NaverMap';
import BottomSheet from './components/BottomSheet';
import ReSearchButton from './components/ReSearchButton';
import MapViewButton from './components/MapViewButton';
import PlaceDetailSheet from './components/PlaceDetailSheet';
import SearchOverlay from './components/SearchOverlay';
import Toast from './components/Toast';
import RoleSelectionOverlay from './components/RoleSelectionOverlay';
import OwnerPreview from './components/OwnerPreview';
import EmailInput from './components/EmailInput';
import PasswordInput from './components/PasswordInput';
import PhoneVerification from './components/PhoneVerification';
import StoreSearch from './components/StoreSearch';
import StoreLanding from './components/StoreLanding';
import MenuSelect from './components/MenuSelect';
import PriceQuantity from './components/PriceQuantity';
import PickupTime from './components/PickupTime';
import StoreInfo from './components/StoreInfo';
import StoreDetailInput from './components/StoreDetailInput';
import ExitConfirmSheet from './components/ExitConfirmSheet';
import RegistrationComplete from './components/RegistrationComplete';
import MobileKeyboard from './components/MobileKeyboard';

// 스크린 순서 — 번호(#1 ~ #12)로도 접근 가능
const SCREEN_ORDER = [
  'home',              // #1
  'role-select',       // #2
  'owner-preview',     // #3
  'email',             // #4
  'password',          // #5
  'phone',             // #6
  'store-search',      // #7
  'store-landing',     // #8
  'menu-select',       // #9
  'price-quantity',    // #10
  'pickup-time',       // #11
  'store-info',        // #12
  'address-search',    // #13
  'store-detail-input', // #14
  'registration-complete', // #15
];

// 온보딩 스텝 (draft 저장 대상)
const ONBOARDING_SCREENS = [
  'store-search', 'store-landing', 'menu-select',
  'price-quantity', 'pickup-time', 'store-info',
  'address-search', 'store-detail-input',
];

const DRAFT_KEY = 'luckymeal_onboarding_draft';

function getScreenFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return null;
  const num = parseInt(hash, 10);
  if (!isNaN(num) && num >= 1 && num <= SCREEN_ORDER.length) {
    return SCREEN_ORDER[num - 1];
  }
  if (SCREEN_ORDER.includes(hash)) return hash;
  return null;
}

function saveDraft(data) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export default function App() {
  const { selectedPlaceId } = useAppStore();
  const [screen, setScreenState] = useState(() => getScreenFromHash() || 'role-select');
  const [userEmail, setUserEmail] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [priceConfig, setPriceConfig] = useState({ price: 12000, quantity: 4 });
  const [pickupDaySettings, setPickupDaySettings] = useState(null);
  const [storeInfoData, setStoreInfoData] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDraftRestore, setShowDraftRestore] = useState(false);
  const [draftData, setDraftData] = useState(null);

  const setScreen = useCallback((name) => {
    setScreenState(name);
    const idx = SCREEN_ORDER.indexOf(name);
    window.location.hash = idx >= 0 ? `${idx + 1}` : name;
  }, []);

  const handleClose = useCallback(() => setShowExitConfirm(true), []);

  // "저장하고 나가기" — 현재 스텝 데이터를 draft로 저장 후 홈 이동
  const handleSaveAndExit = useCallback(() => {
    saveDraft({
      screen,
      userEmail,
      selectedStore,
      selectedDays,
      selectedMenus,
    });
    setShowExitConfirm(false);
    setScreen('home');
  }, [screen, userEmail, selectedStore, selectedDays, selectedMenus, setScreen]);

  const handleExitCancel = useCallback(() => setShowExitConfirm(false), []);

  // draft 복원
  const handleRestoreDraft = useCallback(() => {
    if (!draftData) return;
    if (draftData.userEmail) setUserEmail(draftData.userEmail);
    if (draftData.selectedStore) setSelectedStore(draftData.selectedStore);
    if (draftData.selectedDays) setSelectedDays(draftData.selectedDays);
    if (draftData.selectedMenus) setSelectedMenus(draftData.selectedMenus);
    setScreen(draftData.screen);
    setShowDraftRestore(false);
    setDraftData(null);
  }, [draftData, setScreen]);

  const handleDismissDraft = useCallback(() => {
    clearDraft();
    setShowDraftRestore(false);
    setDraftData(null);
  }, []);

  // 온보딩 진입 시 draft 체크
  useEffect(() => {
    if (screen === 'owner-preview' || screen === 'role-select') {
      const draft = loadDraft();
      if (draft?.screen && ONBOARDING_SCREENS.includes(draft.screen)) {
        setDraftData(draft);
        setShowDraftRestore(true);
      }
    }
  }, [screen]);

  // 브라우저 뒤로가기/앞으로가기 지원
  useEffect(() => {
    const onHashChange = () => {
      const s = getScreenFromHash();
      if (s) setScreenState(s);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // 프로그레스 바 스텝 클릭 → 해당 화면으로 이동
  const STEP_SCREENS = ['menu-select', 'price-quantity', 'pickup-time', 'store-info'];
  const handleStepClick = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < STEP_SCREENS.length) {
      setScreen(STEP_SCREENS[stepIndex]);
    }
  }, [setScreen]);

  const handleSelectRole = (role) => {
    if (role === 'owner') {
      setScreen('owner-preview');
    } else {
      setScreen('home');
    }
  };

  // 온보딩 완료 시 draft 삭제
  const handleOnboardingComplete = useCallback(() => {
    clearDraft();
    setScreen('home');
  }, [setScreen]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '100svh' }}>
      {/* 지도 영역 (전체 화면) */}
      <div className="absolute inset-0">
        <NaverMap />
        {!selectedPlaceId && <ReSearchButton />}
      </div>

      {/* 헤더 (상세페이지가 없을 때만) */}
      {!selectedPlaceId && <Header />}

      {/* 리스트 바텀시트 (상세페이지가 없을 때만) */}
      {!selectedPlaceId && <BottomSheet />}

      {/* 지도 보기 플로팅 버튼 */}
      {!selectedPlaceId && <MapViewButton />}

      {/* 가게 상세 바텀시트 */}
      <PlaceDetailSheet />

      {/* 토스트 메시지 */}
      <Toast />

      {/* 검색 오버레이 */}
      <SearchOverlay />

      {/* 오버레이 스크린 */}
      <div className="absolute inset-0 z-50">
        {/* SOL1: 역할 선택 오버레이 */}
        {screen === 'role-select' && (
          <RoleSelectionOverlay onSelectRole={handleSelectRole} />
        )}

        {/* S1-A-1: 소비자 앱 미리보기 (사장님용) */}
        {screen === 'owner-preview' && (
          <OwnerPreview
            onBack={() => setScreen('role-select')}
            onNext={() => setScreen('email')}
            onLogin={() => setScreen('home')}
          />
        )}

        {/* 이메일 입력 */}
        {screen === 'email' && (
          <EmailInput
            onBack={() => setScreen('owner-preview')}
            onNext={(email) => {
              setUserEmail(email);
              setScreen('password');
            }}
          />
        )}

        {/* 비밀번호 입력 */}
        {screen === 'password' && (
          <PasswordInput
            email={userEmail}
            onBack={() => setScreen('email')}
            onNext={() => setScreen('phone')}
          />
        )}

        {/* 휴대폰 인증 */}
        {screen === 'phone' && (
          <PhoneVerification
            onBack={() => setScreen('password')}
            onNext={() => setScreen('store-search')}
          />
        )}

        {/* 가게 검색 */}
        {screen === 'store-search' && (
          <StoreSearch
            onClose={handleClose}
            onBack={handleClose}
            initialQuery={storeSearchQuery}
            onQueryChange={setStoreSearchQuery}
            onSelect={(store) => {
              setSelectedStore(store);
              setScreen('store-detail-input');
            }}
          />
        )}

        {/* 가게명/상세주소 확인 */}
        {screen === 'store-detail-input' && (
          <StoreDetailInput
            store={selectedStore}
            onClose={handleClose}
            onBack={() => setScreen('store-search')}
            onAddressChange={(address) => setSelectedStore((prev) => ({ ...prev, address }))}
            onNext={(detail) => {
              setSelectedStore((prev) => ({ ...prev, ...detail }));
              setScreen('store-landing');
            }}
          />
        )}

        {/* 가게 랜딩 (럭키백 개념 소개) */}
        {screen === 'store-landing' && (
          <StoreLanding
            storeName={selectedStore?.name || '가게'}
            onClose={handleClose}
            onBack={() => setScreen('store-detail-input')}
            onNext={() => setScreen('menu-select')}
          />
        )}

        {/* 메뉴 선택 (SOL2) */}
        {screen === 'menu-select' && (
          <MenuSelect
            onClose={handleClose}
            onBack={() => setScreen('store-landing')}
            onNext={(menus) => {
              if (menus) setSelectedMenus(menus);
              if (!selectedDays || selectedDays.length === 0) {
                setSelectedDays(['월요일','화요일','수요일','목요일','금요일','토요일']);
              }
              setScreen('price-quantity');
            }}
            onStepClick={handleStepClick}
          />
        )}

        {/* 가격/수량 설정 */}
        {screen === 'price-quantity' && (
          <PriceQuantity
            selectedDays={selectedDays}
            onClose={handleClose}
            onBack={() => setScreen('menu-select')}
            onNext={(config) => setScreen('pickup-time')}
            onDaysChange={(days) => setSelectedDays(days)}
            onStepClick={handleStepClick}
            initialPrice={priceConfig.price}
            initialQuantity={priceConfig.quantity}
            onPriceChange={setPriceConfig}
          />
        )}

        {/* 픽업시간 설정 */}
        {screen === 'pickup-time' && (
          <PickupTime
            selectedDays={selectedDays}
            onClose={handleClose}
            onBack={() => setScreen('price-quantity')}
            onNext={(timeSettings) => setScreen('store-info')}
            onStepClick={handleStepClick}
            initialDaySettings={pickupDaySettings}
            onDaySettingsChange={setPickupDaySettings}
          />
        )}

        {/* 가게 정보 (마지막 단계) */}
        {screen === 'store-info' && (
          <StoreInfo
            onClose={handleClose}
            onBack={() => setScreen('pickup-time')}
            onNext={() => setScreen('registration-complete')}
            onStepClick={handleStepClick}
            selectedMenus={selectedMenus}
            initialData={storeInfoData}
            onDataChange={setStoreInfoData}
          />
        )}

        {/* 등록 완료 */}
        {screen === 'registration-complete' && (
          <RegistrationComplete onConfirm={handleOnboardingComplete} />
        )}

        {/* 종료 확인 바텀시트 */}
        {showExitConfirm && (
          <ExitConfirmSheet onConfirm={handleSaveAndExit} onCancel={handleExitCancel} />
        )}

        {/* 모바일 키보드 목업 */}
        <MobileKeyboard />

        {/* 임시저장 복원 토스트 */}
        {showDraftRestore && draftData && (
          <div className="absolute bottom-6 left-4 right-4 z-[80] animate-slide-up">
            <div
              className="bg-[#1d1d1d] rounded-[18px] p-4 shadow-lg"
              style={{ fontFamily: 'Pretendard, sans-serif' }}
            >
              <p className="text-white text-[14px] font-semibold mb-1">
                작성 중인 입점 신청이 있어요
              </p>
              <p className="text-[#a0a0a0] text-[12px] mb-3">
                {(() => {
                  const stepNames = {
                    'store-search': '가게 검색',
                    'store-detail-input': '가게명 확인',
                    'store-landing': '럭키백 소개',
                    'menu-select': '메뉴 선택',
                    'price-quantity': '판매 설정',
                    'pickup-time': '픽업 시간',
                    'store-info': '가게 정보',
                    'address-search': '주소 검색',
                  };
                  return `마지막 작성: ${stepNames[draftData.screen] || draftData.screen}`;
                })()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreDraft}
                  className="flex-1 h-[40px] bg-[#16cc83] rounded-[12px] text-[13px] font-semibold text-white active:bg-[#12b574] transition-colors"
                >
                  이어서 작성하기
                </button>
                <button
                  onClick={handleDismissDraft}
                  className="h-[40px] px-4 rounded-[12px] text-[13px] font-semibold text-[#a0a0a0] active:bg-[#2a2a2a] transition-colors"
                >
                  새로 시작
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
