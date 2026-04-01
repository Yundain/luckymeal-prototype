import { useState, useEffect } from 'react';
import AgreementBottomSheet from './AgreementBottomSheet';

const imgHero = 'https://www.figma.com/api/mcp/asset/f0aa9e43-baa8-4c47-80ce-16fe5da8d533';

// 슬롯머신
const SLOT_WORDS = [
  { word: '빵', particle: ' 걱정 없이' },
  { word: '디저트', particle: ' 걱정 없이' },
  { word: '반찬', particle: ' 걱정 없이' },
  { word: '샐러드', particle: ' 걱정 없이' },
  { word: '도시락', particle: ' 걱정 없이' },
];
const SLOT_INTERVAL = 2200;
const TRANSITION_MS = 500;

function SlotMachine() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase('sliding');
      setTimeout(() => {
        setPhase('resetting');
        setCurrentIdx((prev) => (prev + 1) % SLOT_WORDS.length);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setPhase('idle');
          });
        });
      }, TRANSITION_MS);
    }, SLOT_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const current = SLOT_WORDS[currentIdx];
  const next = SLOT_WORDS[(currentIdx + 1) % SLOT_WORDS.length];
  const isSliding = phase === 'sliding';
  const hasTransition = phase === 'sliding';
  const display = isSliding ? next : current;
  const slotWidth = `${display.word.length * 24 + 4}px`;

  return (
    <span className="inline-flex overflow-hidden h-[36px] align-bottom relative" style={{ width: slotWidth, transition: hasTransition ? `width ${TRANSITION_MS}ms cubic-bezier(0.33, 1, 0.68, 1)` : 'none' }}>
      <span
        className="absolute left-0 flex flex-col"
        style={{
          transition: hasTransition ? `transform ${TRANSITION_MS}ms cubic-bezier(0.33, 1, 0.68, 1)` : 'none',
          transform: isSliding ? 'translateY(-36px)' : 'translateY(0)',
        }}
      >
        <span className="h-[36px] flex items-center text-[#0ab26f]">{current.word}</span>
        <span className="h-[36px] flex items-center text-[#0ab26f]">{next.word}</span>
      </span>
    </span>
  );
}

// 정산 데이터
const SETTLEMENT_DATA = [
  { area: '서울 마포구', category: '빵집', emoji: '🥐', amount: 1056510 },
  { area: '서울 강남구', category: '한식 매장', emoji: '🍚', amount: 394740 },
  { area: '서울 서초구', category: '디저트 매장', emoji: '🧁', amount: 507744 },
  { area: '서울 양천구', category: '샐러드 매장', emoji: '🥗', amount: 367650 },
  { area: '서울 강서구', category: '빵집', emoji: '🥐', amount: 632745 },
  { area: '서울 마포구', category: '식사빵 매장', emoji: '🥪', amount: 296055 },
  { area: '서울 노원구', category: '디저트 매장', emoji: '🧁', amount: 375003 },
  { area: '서울 성동구', category: '한식 매장', emoji: '🍚', amount: 371520 },
  { area: '서울 종로구', category: '빵집', emoji: '🥐', amount: 698922 },
  { area: '서울 송파구', category: '디저트 매장', emoji: '🧁', amount: 397836 },
  { area: '서울 서초구', category: '한식 매장', emoji: '🍚', amount: 375390 },
  { area: '인천 연수구', category: '빵집', emoji: '🥐', amount: 302634 },
  { area: '서울 동대문구', category: '디저트 매장', emoji: '🧁', amount: 360187 },
  { area: '서울 강남구', category: '식사빵 매장', emoji: '🥪', amount: 279114 },
  { area: '서울 구로구', category: '빵집', emoji: '🥐', amount: 520128 },
  { area: '서울 노원구', category: '한식 매장', emoji: '🍚', amount: 338250 },
  { area: '서울 마포구', category: '디저트 매장', emoji: '🧁', amount: 841725 },
  { area: '서울 도봉구', category: '빵집', emoji: '🥐', amount: 359136 },
  { area: '서울 강서구', category: '한식 매장', emoji: '🍚', amount: 325080 },
  { area: '서울 양천구', category: '디저트 매장', emoji: '🧁', amount: 355266 },
  { area: '서울 강동구', category: '빵집', emoji: '🥐', amount: 593154 },
  { area: '서울 성동구', category: '식사빵 매장', emoji: '🥪', amount: 257355 },
  { area: '과천시', category: '빵집', emoji: '🥐', amount: 253872 },
  { area: '인천 부평구', category: '빵집', emoji: '🥐', amount: 270768 },
];

function SettlementTicker() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase('sliding');
      setTimeout(() => {
        setPhase('resetting');
        setCurrentIdx((prev) => (prev + 1) % SETTLEMENT_DATA.length);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setPhase('idle');
          });
        });
      }, 400);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const current = SETTLEMENT_DATA[currentIdx];
  const next = SETTLEMENT_DATA[(currentIdx + 1) % SETTLEMENT_DATA.length];
  const isSliding = phase === 'sliding';
  const hasTransition = phase === 'sliding';

  const renderItem = (item) => (
    <div className="h-[52px] flex items-center gap-4 px-6">
      <span className="text-[24px] shrink-0">{item.emoji}</span>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-[14px] text-white leading-[1.5]">
          {item.area} {item.category}에서
        </span>
        <span className="text-[14px] font-semibold text-white leading-[1.5]">
          {item.amount.toLocaleString()}원을 정산받았어요
        </span>
      </div>
    </div>
  );

  return (
    <div
      data-annotate="preview-ticker"
      className="mx-3 rounded-[24px] overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        boxShadow: '0 0 12px rgba(0,0,0,0.25)',
      }}
    >
      <div className="h-[52px] overflow-hidden relative">
        <div
          style={{
            transition: hasTransition ? 'transform 400ms cubic-bezier(0.33, 1, 0.68, 1)' : 'none',
            transform: isSliding ? 'translateY(-52px)' : 'translateY(0)',
          }}
        >
          {renderItem(current)}
          {renderItem(next)}
        </div>
      </div>
    </div>
  );
}

const CASE_PRESETS = {
  'preview-default': { showAgreement: false },
  'preview-agreement': { showAgreement: true },
  'preview-img-error': { showAgreement: false, heroSrc: 'https://broken.invalid/no-image.jpg' },
};

export default function OwnerPreview({ onNext, onLogin, onBack }) {
  const [showAgreement, setShowAgreement] = useState(false);
  const [heroSrc, setHeroSrc] = useState(imgHero);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SET_CASE' && CASE_PRESETS[e.data.case]) {
        const preset = CASE_PRESETS[e.data.case];
        setShowAgreement(preset.showAgreement);
        if (preset.heroSrc) { setHeroSrc(preset.heroSrc); setImgFailed(false); }
        else { setHeroSrc(imgHero); setImgFailed(false); }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div
      className="absolute inset-0 z-50 bg-white flex flex-col"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      {/* 상단바 */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center h-[48px] px-1">
        <button
          onClick={onBack}
          className="w-[42px] h-[42px] flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 헤더 + 그라데이션 오버레이 */}
      <div
        data-annotate="preview-header"
        className="absolute top-[48px] left-0 right-0 z-10 px-5 pt-6 pb-[200px]"
        style={{
          background: 'linear-gradient(to bottom, white 30%, rgba(255,255,255,0) 100%)',
        }}
      >
        <p className="text-[14px] text-[#6d6d6b] leading-[1.5] text-center mb-1.5">
          국내 1위 재고 원가회수 솔루션, 럭키밀
        </p>
        <h1 className="text-[24px] font-semibold leading-[1.5] tracking-[-0.24px] text-[#1c1c1b] text-center">
          남는 <SlotMachine /> 걱정 없이
          <br />
          마음껏 생산할 수 있도록
        </h1>
      </div>

      {/* 배경 이미지 */}
      <div data-annotate="preview-hero" className="flex-1 relative bg-[#8b7355]">
        {imgFailed ? (
          <div className="absolute inset-0 bg-[#e3e3df] flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="8" fill="#c6c6c4"/>
              <path d="M16 32L22 24L26 29L30 24L34 32H16Z" fill="#ababa9"/>
              <circle cx="20" cy="20" r="3" fill="#ababa9"/>
            </svg>
          </div>
        ) : (
          <img
            src={heroSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
            onError={() => setImgFailed(true)}
          />
        )}
      </div>

      {/* 정산 티커 + CTA */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        {/* 티커 */}
        <SettlementTicker />

        {/* CTA */}
        <div
          className="px-3 pt-4 pb-2 flex flex-col items-center gap-4"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, white 33%)',
          }}
        >
          <button
            data-annotate="preview-cta"
            onClick={() => { setShowAgreement(true); window.parent.postMessage({ type:'SHEET_OPENED', sheet:'agreement-sheet' }, '*'); }}
            className="w-full h-[52px] bg-[#16cc83] rounded-[18px] flex items-center justify-center active:scale-[0.98] transition-transform"
          >
            <span className="text-white text-[14px] font-semibold">시작하기 · 가입비 무료</span>
          </button>
          <button data-annotate="preview-login" onClick={onLogin} className="py-1">
            <span className="text-[#90908e] text-[14px] font-semibold underline">
              이미 계정이 있으신가요? 로그인하기
            </span>
          </button>
        </div>
      </div>

      {/* 약관 동의 바텀시트 */}
      {showAgreement && (
        <AgreementBottomSheet
          onClose={() => setShowAgreement(false)}
          onNext={() => {
            setShowAgreement(false);
            onNext?.();
          }}
        />
      )}
    </div>
  );
}
