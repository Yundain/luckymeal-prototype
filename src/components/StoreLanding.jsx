import { useState, useRef, useEffect, useCallback } from 'react';

const CASE_PRESETS = {
  'landing-top': { hasScrolledToBottom: false },
  'landing-bottom': { hasScrolledToBottom: true },
  'landing-long-name': { hasScrolledToBottom: false, storeName: '브래댄코 상왕십리역점 (구 르빵드미라보 상왕십리)' },
};

const img6700 = 'https://www.figma.com/api/mcp/asset/f917276a-8589-4191-84de-8cefdc553c07';
const img7000 = 'https://www.figma.com/api/mcp/asset/8df3c356-e806-4beb-826b-18450d220bed';
const img9000 = 'https://www.figma.com/api/mcp/asset/795a9dc2-09ec-452d-8235-ed677df2438e';
const img10000 = 'https://www.figma.com/api/mcp/asset/8e695232-b634-4634-8939-b55734d5ea8e';
const img9801 = 'https://www.figma.com/api/mcp/asset/7d9f193f-3cb7-479c-913a-52f734097d81';

export default function StoreLanding({ storeName: storeNameProp, onNext, onBack, onClose }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [overrideName, setOverrideName] = useState(null);
  const scrollRef = useRef(null);
  const storeName = overrideName || storeNameProp;

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 40;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    if (atBottom) setHasScrolledToBottom(true);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);


  // 어노테이션 케이스 수신
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SET_CASE' && CASE_PRESETS[e.data.case]) {
        const preset = CASE_PRESETS[e.data.case];
        setHasScrolledToBottom(preset.hasScrolledToBottom);
        if (preset.storeName) setOverrideName(preset.storeName);
        else setOverrideName(null);
        if (preset.hasScrolledToBottom && scrollRef.current) {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'instant' });
        } else if (!preset.hasScrolledToBottom && scrollRef.current) {
          scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleCtaClick = () => {
    if (hasScrolledToBottom) {
      onNext();
    } else {
      const el = scrollRef.current;
      el?.scrollTo({ top: el.scrollTop + el.clientHeight * 0.8, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-white flex flex-col"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      {/* 상단 네비 */}
      <div className="flex items-center justify-between h-[48px] px-1 shrink-0">
        <button
          onClick={onBack}
          className="w-[42px] h-[42px] flex items-center justify-center"
        >
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* 헤더 */}
        <div data-annotate="landing-header" className="px-5 pt-6 pb-2">
          <h1 className="text-[24px] font-semibold leading-[1.5] tracking-[-0.24px] text-[#3a3a37]">
            {storeName}의 재고,
            <br />
            이렇게 해결해드릴게요
          </h1>
          <p className="text-[14px] text-[#6d6d6b] leading-[1.5] mt-1.5">
            입점료 0원 · 연회비 0원 · 판매될 때만 수수료
          </p>
        </div>

        {/* 빵 이미지 콜라주 */}
        <div className="px-6 pt-3 pb-3">
          <div className="relative w-[270px] h-[232px] mx-auto">
            <img src={img6700} alt="" className="absolute left-[21px] top-[15px] w-[85px] h-[93px] rounded-[10px] object-cover" />
            <img src={img7000} alt="" className="absolute left-[115px] top-0 w-[110px] h-[108px] rounded-[10px] object-cover" />
            <img src={img9000} alt="" className="absolute left-0 top-[115px] w-[106px] h-[98px] rounded-[10px] object-cover" />
            <img src={img10000} alt="" className="absolute left-[112px] top-[115px] w-[65px] h-[117px] rounded-[10px] object-cover" />
            <img src={img9801} alt="" className="absolute left-[183px] top-[115px] w-[87px] h-[107px] rounded-[10px] object-cover" />
          </div>
        </div>

        {/* 럭키백 설명 */}
        <div data-annotate="landing-concept" className="px-6 flex flex-col gap-7 pb-12">
          <div className="flex gap-4 items-center">
            <div className="w-[35px] h-[35px] bg-[#e3e3df] rounded-[8px] shrink-0" />
            <div>
              <p className="text-[16px] font-semibold text-[#545453] leading-[1.5]">
                남은 재고를
              </p>
              <p className="text-[16px] font-semibold text-[#545453] leading-[1.5]">
                랜덤하게 담아두면
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-[35px] h-[35px] bg-[#e3e3df] rounded-[8px] shrink-0" />
            <div>
              <p className="text-[16px] font-semibold text-[#545453] leading-[1.5]">
                미리 예약한 고객이
              </p>
              <p className="text-[16px] font-semibold text-[#545453] leading-[1.5]">
                할인가로 픽업하러 가요
              </p>
            </div>
          </div>
        </div>

        {/* 관리가 편해요 */}
        <div className="px-5 pt-5 pb-2">
          <h2 className="text-[18px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.09px]">
            관리가 편해요
          </h2>
        </div>
        <div className="px-6 flex flex-col gap-8 pt-6 pb-12">
          <div className="flex gap-4 items-center">
            <div className="w-[35px] h-[35px] bg-[#e3e3df] rounded-[8px] shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="text-[14px] text-[#6d6d6b] leading-[1.5]">남은 메뉴마다 일일이 판매하지 않고</p>
              <p className="text-[16px] font-semibold text-[#545453] leading-[1.5]">꾸러미 형태(럭키백)로 판매</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-[35px] h-[35px] bg-[#e3e3df] rounded-[8px] shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="text-[14px] text-[#6d6d6b] leading-[1.5]">고객이 먼저 앱에서 예약하면</p>
              <p className="text-[16px] font-semibold text-[#545453] leading-[1.5]">재고가 남은 만큼만 승인하기</p>
            </div>
          </div>
        </div>

        {/* 입점 시 기대수익 */}
        <div className="px-5 pt-5 pb-2">
          <h2 className="text-[18px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.09px]">
            입점 시 기대수익
          </h2>
        </div>
        <div className="px-6 pt-6 pb-12 flex flex-col gap-1.5">
          <p className="text-[16px] text-[#6d6d6b] leading-[1.5]">하루에 럭키백 3개씩 판매 시</p>
          <p className="text-[20px] font-semibold text-[#0ab26f] leading-[1.5] tracking-[-0.2px]">월 수익 32만원</p>
        </div>

        {/* 자주 묻는 질문 */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[14px] font-semibold text-[#90908e] leading-[1.5]">자주 묻는 질문</p>
        </div>
        <div className="px-6 py-3 flex flex-col gap-3">
          <p className="text-[16px] font-semibold text-[#545453] leading-[1.5]">Q. 많이 남지 않아도 괜찮나요?</p>
          <p className="text-[14px] text-[#6d6d6b] leading-[1.5]">팔아야 할 할당량이나 의무사항은 전혀 없습니다. 가끔씩 음식이 남는 날만 이용하실 수 있습니다.</p>
        </div>
        <div className="h-[120px]" />
      </div>

      {/* 하단 CTA */}
      <div
        className="shrink-0 px-3 pt-4 pb-6"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, white 33%)' }}
      >
        <button
          data-annotate="landing-cta"
          onClick={handleCtaClick}
          className={`flex-1 w-full h-[52px] rounded-[18px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
            hasScrolledToBottom ? 'bg-[#16cc83]' : 'bg-[#16cc83]'
          }`}
        >
          {hasScrolledToBottom ? (
            <span className="text-white text-[14px] font-semibold">다음</span>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-bounce">
                <path d="M4 6L8 10L12 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-white text-[14px] font-semibold">아래로 스크롤하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
