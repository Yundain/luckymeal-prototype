import { useState, useEffect, useRef } from 'react';
import RevenueDetailBottomSheet from './RevenueDetailBottomSheet';
import StepperBottomSheet from './StepperBottomSheet';
import DaysSelectionBottomSheet from './DaysSelectionBottomSheet';

const CASE_PRESETS = {
  'price-default': {
    price: 12000,
    quantity: 4,
  },
  'price-min': {
    price: 5000,
    quantity: 4,
  },
  'price-high': {
    price: 20000,
    quantity: 4,
  },
  'price-stepper-price': {
    price: 12000,
    quantity: 4,
    showPricePicker: true,
  },
  'price-stepper-qty': {
    price: 12000,
    quantity: 4,
    showQuantityPicker: true,
  },
  'price-revenue-detail': {
    price: 12000,
    quantity: 4,
    showRevenue: true,
  },
  'price-qty-zero': {
    price: 12000,
    quantity: 0,
  },
};

const STEPS = ['메뉴', '가격/수량', '픽업시간', '가게 정보'];

// 슬롯머신 숫자 롤링 컴포넌트 — 각 자릿수가 개별적으로 굴러감
function RollingDigit({ char, prevChar, version }) {
  const isNumber = /\d/.test(char);
  const changed = char !== prevChar && isNumber;

  if (!changed) {
    return (
      <span style={{ display: 'inline-block', position: 'relative' }}>
        {char}
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
        height: '1.5em',
        verticalAlign: 'bottom',
      }}
    >
      {/* 이전 숫자 — 위로 빠져나감 */}
      <span
        key={`out-${version}`}
        style={{
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          animation: 'digitRollOut 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        }}
      >
        {prevChar || char}
      </span>
      {/* 새 숫자 — 아래에서 올라옴 */}
      <span
        key={`in-${version}`}
        style={{
          display: 'block',
          animation: 'digitRollIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        }}
      >
        {char}
      </span>
    </span>
  );
}

function RollingNumber({ value, className }) {
  const formatted = value.toLocaleString();
  const prevRef = useRef(formatted);
  const versionRef = useRef(0);
  const [prev, setPrev] = useState(formatted);
  const [current, setCurrent] = useState(formatted);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const oldVal = prevRef.current;
    if (oldVal === formatted) return;
    versionRef.current += 1;
    setPrev(oldVal);
    setCurrent(formatted);
    setVersion(versionRef.current);
    prevRef.current = formatted;
  }, [formatted]);

  // 자릿수 길이가 다를 때 짧은 쪽을 앞에서 패딩
  const maxLen = Math.max(prev.length, current.length);
  const padPrev = prev.padStart(maxLen);
  const padCurr = current.padStart(maxLen);

  return (
    <span className={className} style={{ display: 'inline-flex' }}>
      {padCurr.split('').map((ch, i) => (
        <RollingDigit key={i} char={ch} prevChar={padPrev[i]} version={version} />
      ))}
    </span>
  );
}

export default function PriceQuantity({ selectedDays, onNext, onBack, onClose, onDaysChange, onStepClick }) {
  const [price, setPrice] = useState(12000);
  const [quantity, setQuantity] = useState(4);
  const [showRevenue, setShowRevenue] = useState(false);
  const [showPricePicker, setShowPricePicker] = useState(false);
  const [showQuantityPicker, setShowQuantityPicker] = useState(false);
  const [showToast, setShowToast] = useState(true);
  const [showDaysPicker, setShowDaysPicker] = useState(false);
  const [revenueBounce, setRevenueBounce] = useState(false);
  const prevRevenueRef = useRef(null);

  // postMessage 리스너: 외부에서 케이스 프리셋 적용
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type !== 'SET_CASE' || !CASE_PRESETS[e.data.case]) return;
      const preset = CASE_PRESETS[e.data.case];
      if (preset.price !== undefined) setPrice(preset.price);
      if (preset.quantity !== undefined) setQuantity(preset.quantity);
      if (preset.showPricePicker !== undefined) setShowPricePicker(preset.showPricePicker);
      if (preset.showQuantityPicker !== undefined) setShowQuantityPicker(preset.showQuantityPicker);
      if (preset.showRevenue !== undefined) setShowRevenue(preset.showRevenue);
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 요일 표시 텍스트
  const daysCount = selectedDays?.length || 6;
  const daysLabel = `주 ${daysCount}일`;
  const sellingPrice = price * 0.5; // 소비자 판매가 (정가의 50%)
  const revenuePerUnit = price * 0.4; // 사장님 수익 (정가의 40%)
  const dailyLoss = price * quantity;
  const monthlyRevenue = Math.round(revenuePerUnit * quantity * daysCount * 4.3 / 1000) * 1000;

  // 수익 변동 시 바운스 애니메이션 트리거 (바텀시트 닫힌 후 딜레이)
  useEffect(() => {
    if (prevRevenueRef.current !== null && prevRevenueRef.current !== monthlyRevenue) {
      const delayTimer = setTimeout(() => {
        setRevenueBounce(true);
        setTimeout(() => setRevenueBounce(false), 600);
      }, 350); // 바텀시트 닫히는 시간 대기
      prevRevenueRef.current = monthlyRevenue;
      return () => clearTimeout(delayTimer);
    }
    prevRevenueRef.current = monthlyRevenue;
  }, [monthlyRevenue]);

  // 가격 힌트
  const getPriceHint = (p) => {
    if (p === 12000) return '딱 평균이에요';
    if (p < 12000) return '평균보다 낮아요';
    return '평균보다 높아요';
  };

  // 수량 힌트
  const getQuantityHint = (q) => {
    if (q === 4) return '딱 평균이에요';
    if (q < 4) return '평균보다 적어요';
    return '평균보다 많아요';
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-white flex flex-col"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      {/* 토스트 */}
      {showToast && (
        <div className="absolute top-[50px] left-0 right-0 z-[70] flex justify-center animate-toast-in">
          <div className="bg-[#545453] rounded-[16px] px-3 py-2.5 flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#16cc83"/>
              <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[14px] font-semibold text-white leading-[1.5] pr-1.5 whitespace-nowrap">
              추천값을 세팅했어요
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toast-in {
          0% { opacity: 0; transform: translateY(-12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-toast-in {
          animation: toast-in 0.3s ease-out;
        }
        @keyframes digitRollIn {
          0% { transform: translateY(100%); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes digitRollOut {
          0% { transform: translateY(0); opacity: 1; }
          70% { opacity: 0; }
          100% { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes revenue-bounce {
          0% { transform: scale(1); }
          20% { transform: scale(1.12); }
          40% { transform: scale(0.97); }
          60% { transform: scale(1.05); }
          80% { transform: scale(0.99); }
          100% { transform: scale(1); }
        }
        .animate-revenue-bounce {
          animation: revenue-bounce 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
      `}</style>

      {/* 상단 네비 */}
      <div className="flex items-center justify-between h-[48px] px-1 shrink-0">
        <button onClick={onBack} className="w-[42px] h-[42px] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex items-center">
          <button className="px-2.5 h-[42px] flex items-center">
            <span className="text-[12px] font-semibold text-[#0ab26f] leading-[1.5]">고객센터</span>
          </button>
          <button onClick={onClose} className="w-[42px] h-[42px] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 프로그레스 바 */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute h-[2px] bg-[#e3e3df] left-[13px] right-[21px] top-[29px]" />
            <div className="absolute h-[2px] bg-[#16cc83] left-[13px] right-[220px] top-[29px]" />
            {STEPS.map((step, i) => (
              <button key={step} onClick={() => onStepClick?.(i)} className="flex flex-col items-center gap-2 relative z-10">
                <span className={`text-[12px] font-semibold leading-[1.5] ${i <= 1 ? 'text-[#545453]' : 'text-[#ababa9]'}`}>
                  {step}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    i < 1
                      ? 'bg-[#16cc83]'
                      : i === 1
                      ? 'bg-[#16cc83] ring-[6px] ring-[rgba(22,204,131,0.2)]'
                      : 'bg-[#e3e3df]'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div data-annotate="price-sentence" className="flex flex-col items-center justify-center gap-7 py-20">
          {/* 요일 표시 — "주 N일" 탭하면 요일 선택 바텀시트 */}
          <button
            onClick={() => setShowDaysPicker(true)}
            className="flex items-center gap-1.5 pb-2"
          >
            <span className="text-[16px] font-semibold text-[#0ab26f] leading-[1.5] border-b border-dashed border-[#0ab26f]">
              {daysLabel}
            </span>
            <span className="text-[16px] font-semibold text-[#545453] leading-[1.5]">
              마다
            </span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="#0ab26f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 가격 선택 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setShowPricePicker(true); window.parent.postMessage({ type:'SHEET_OPENED', sheet:'price-stepper-price' }, '*'); }}
              className="bg-white border-4 border-[#e3e3df] rounded-[4px] flex items-center gap-1 px-1.5 py-0.5"
            >
              <span className="text-[24px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.24px]">
                {price.toLocaleString()}
              </span>
              <span className="text-[16px] font-semibold text-[#3a3a37] leading-[1.5]">원</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-90">
                <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="#3a3a37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="text-[20px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.2px] px-1">
              어치 럭키백을
            </span>
          </div>

          {/* 수량 선택 */}
          <div className="flex items-center gap-1">
            <span className="text-[20px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.2px] px-1">
              하루에
            </span>
            <button
              onClick={() => { setShowQuantityPicker(true); window.parent.postMessage({ type:'SHEET_OPENED', sheet:'price-stepper-qty' }, '*'); }}
              className="bg-white border-4 border-[#e3e3df] rounded-[4px] flex items-center gap-1 px-1.5 py-0.5"
            >
              <span className="text-[24px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.24px]">
                {quantity}
              </span>
              <span className="text-[16px] font-semibold text-[#3a3a37] leading-[1.5]">개</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-90">
                <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="#3a3a37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="text-[20px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.2px] px-1">
              씩 예약 받기
            </span>
          </div>

          {/* 로스 해결 텍스트 */}
          <p className="text-[14px] font-semibold text-[#578fff] leading-[1.5]">
            하루에 로스 <RollingNumber value={dailyLoss} />원 해결!
          </p>
        </div>
      </div>

      {/* 입점 후에도 수정 가능 툴팁 */}
      <div className="absolute bottom-[100px] right-[29px] z-10">
        <div className="bg-[#3a3a37] rounded-[20px] px-2.5 py-1.5 relative">
          <span className="text-[14px] font-semibold text-white leading-[16px] whitespace-nowrap">
            입점 후에도 수정 가능
          </span>
          <div
            className="absolute left-[23px] top-full w-0 h-0"
            style={{
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '8px solid #3a3a37',
            }}
          />
        </div>
      </div>

      {/* 하단 CTA */}
      <div data-annotate="price-revenue" className={`shrink-0 border-t border-[#16cc83] rounded-t-[24px] transition-shadow duration-300 ${revenueBounce ? 'shadow-[0_0_0_8px_rgba(22,204,131,0.3)]' : 'shadow-[0_0_0_6px_rgba(22,204,131,0.15)]'}`}>
        <div className="flex items-center gap-6 pl-4 pr-3 pt-3 pb-2">
          <button
            onClick={() => { setShowRevenue(true); window.parent.postMessage({ type:'SHEET_OPENED', sheet:'price-revenue-detail' }, '*'); }}
            className={`flex flex-col items-start shrink-0 transition-transform ${revenueBounce ? 'animate-revenue-bounce' : ''}`}
          >
            <div className="flex items-center gap-1 mb-[-4px]">
              <span className="text-[14px] font-semibold text-[#6d6d6b] leading-[1.5]">
                월 예상 수익
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="rotate-90">
                <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="#6d6d6b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex items-center gap-1.5 mb-[-4px]">
              <span className={`text-[18px] font-semibold leading-[1.5] tracking-[-0.09px] transition-colors duration-300 ${revenueBounce ? 'text-[#0ab26f]' : 'text-[#1d1d1d]'}`}>약</span>
              <RollingNumber
                value={monthlyRevenue}
                className={`text-[24px] font-semibold leading-[1.5] tracking-[-0.24px] transition-colors duration-300 ${revenueBounce ? 'text-[#0ab26f]' : 'text-[#1d1d1d]'}`}
              />
              <span className={`text-[18px] font-semibold leading-[1.5] tracking-[-0.09px] transition-colors duration-300 ${revenueBounce ? 'text-[#0ab26f]' : 'text-[#1d1d1d]'}`}>원</span>
            </div>
          </button>

          <button
            onClick={() => quantity > 0 && onNext?.({ price, quantity })}
            disabled={quantity === 0}
            className={`flex-1 h-[52px] rounded-[18px] flex items-center justify-center transition-colors ${
              quantity > 0 ? 'bg-[#16cc83] active:bg-[#12b574]' : 'bg-[#beedd3] cursor-not-allowed'
            }`}
          >
            <span className="text-[14px] font-semibold text-white leading-[1.5]">
              {quantity > 0 ? '계속' : '수량을 설정해주세요'}
            </span>
          </button>
        </div>
      </div>

      {/* 가격 스테퍼 바텀시트 */}
      {showPricePicker && (
        <StepperBottomSheet
          title={"럭키백 1개에\n얼마씩 담을까요?"}
          subtitle={"현재 매장 판매가(정가) 기준으로 설정해주세요"}
          highlightRange={[12000, 20000]}
          value={price}
          step={200}
          min={3000}
          max={40000}
          variant="slider"
          getHint={null}
          formatValue={(v) => `${v.toLocaleString()}원`}
          onApply={(v) => { setPrice(v); setShowPricePicker(false); }}
          onClose={() => setShowPricePicker(false)}
        />
      )}

      {/* 수량 스테퍼 바텀시트 */}
      {showQuantityPicker && (
        <StepperBottomSheet
          title={"하루에 럭키백을\n몇 개 팔까요?"}
          subtitle={"선예약을 받은 뒤 남은 재고만큼\n확정하는 시스템이니 안심하세요!"}
          value={quantity}
          step={1}
          min={1}
          max={20}
          getHint={getQuantityHint}
          formatValue={(v) => `${v}개`}
          onApply={(v) => { setQuantity(v); setShowQuantityPicker(false); }}
          onClose={() => setShowQuantityPicker(false)}
        />
      )}

      {/* 월 예상 수익 바텀시트 */}
      {showRevenue && (
        <RevenueDetailBottomSheet
          price={price}
          quantity={quantity}
          daysCount={daysCount}
          monthlyRevenue={monthlyRevenue}
          onClose={() => setShowRevenue(false)}
        />
      )}

      {/* 요일 수정 바텀시트 */}
      {showDaysPicker && (
        <DaysSelectionBottomSheet
          initialSelected={selectedDays}
          onClose={() => setShowDaysPicker(false)}
          onNext={(days) => {
            setShowDaysPicker(false);
            onDaysChange?.(days);
          }}
        />
      )}
    </div>
  );
}
