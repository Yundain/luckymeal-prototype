import { useState, useEffect } from 'react';

const LOGO_IMG = 'https://www.figma.com/api/mcp/asset/adeff188-c0e7-46da-b18e-09788ffbb3bb';

const CASE_PRESETS = {
  'role-default': { visible: true, fadeOut: false },
};

export default function RoleSelectionOverlay({ onSelectRole }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SET_CASE' && CASE_PRESETS[e.data.caseId]) {
        const preset = CASE_PRESETS[e.data.caseId];
        setVisible(preset.visible);
        setFadeOut(preset.fadeOut);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleSelect = (role) => {
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      onSelectRole?.(role);
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col justify-end transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 반투명 블러 오버레이 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[6px]" />

      {/* 챗봇 영역 */}
      <div className="relative z-10 flex flex-col px-4" style={{ marginBottom: '180px' }}>
        {/* 로고 + 이름 */}
        <div className="flex items-center gap-2 mb-2">
          <img src={LOGO_IMG} alt="럭키밀" className="w-8 h-8" />
          <span
            className="text-white text-sm font-semibold"
            style={{ fontFamily: 'Pretendard, sans-serif' }}
          >
            럭키밀
          </span>
        </div>

        {/* 말풍선들 */}
        <div data-annotate="role-bubbles" className="flex flex-col gap-2 ml-10">
          <div
            className="bg-white rounded-[14px] px-4 py-2 self-start"
            style={{ fontFamily: 'Pretendard, sans-serif' }}
          >
            <p className="text-[#1c1c1b] text-base leading-[1.5]">
              럭키밀에 오신 것을 환영해요!
            </p>
          </div>
          <div
            className="bg-white rounded-[14px] px-4 py-2 self-start"
            style={{ fontFamily: 'Pretendard, sans-serif' }}
          >
            <p className="text-[#1c1c1b] text-base leading-[1.5]">
              어떻게 찾아오셨나요?
            </p>
          </div>
        </div>
      </div>

      {/* 역할 선택 카드 */}
      <div
        className="relative z-10 flex gap-4 px-3 py-4"
        style={{ fontFamily: 'Pretendard, sans-serif' }}
      >
        {/* 고객이에요 */}
        <button
          data-annotate="role-customer"
          onClick={() => handleSelect('customer')}
          className="flex-1 bg-white border border-[#c6c6c4] rounded-xl flex flex-col items-center gap-3 px-4 py-6 active:scale-[0.97] transition-transform"
        >
          <span className="text-[40px] leading-[1.5]">🙂</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[#545453] text-lg font-semibold tracking-[-0.09px]">
              고객이에요
            </span>
            <span className="text-[#6d6d6b] text-sm font-normal">
              반값에 구매하기
            </span>
          </div>
        </button>

        {/* 사장이에요 */}
        <button
          data-annotate="role-owner"
          onClick={() => handleSelect('owner')}
          className="flex-1 bg-white border border-[#c6c6c4] rounded-xl flex flex-col items-center gap-3 px-4 py-6 active:scale-[0.97] transition-transform"
        >
          <span className="text-[40px] leading-[1.5]">🏪</span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[#545453] text-lg font-semibold tracking-[-0.09px]">
              사장이에요
            </span>
            <span className="text-[#6d6d6b] text-sm font-normal">
              재고 해결하기
            </span>
            <span className="text-[#90908e] text-xs font-normal">
              입점료 0원 · 연회비 0원
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
