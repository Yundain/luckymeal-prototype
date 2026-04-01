import { useState, useEffect, useRef } from 'react';

/**
 * iOS 스타일 모바일 키보드 시각적 목업
 * - type="korean": 한글 쿼티 키보드
 * - type="number": 숫자 키패드
 * - input focus 시 슬라이드업, blur 시 슬라이드다운
 */

const KOREAN_ROWS = [
  ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],
  ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
  ['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'],
];

const NUMBER_ROWS = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['','0','⌫'],
];

export default function MobileKeyboard({ type = 'korean' }) {
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [kbType, setKbType] = useState(type);

  // postMessage로 키보드 온/오프 제어
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'KEYBOARD_TOGGLE') {
        setEnabled(e.data.enabled);
        if (!e.data.enabled) setVisible(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // focus/blur 감지
  useEffect(() => {
    if (!enabled) return;

    // 모바일 실기기에서는 실제 키보드가 뜨므로 목업 비활성
    const isInIframe = window.parent !== window;
    const isMobile = !isInIframe && window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    const show = (e) => {
      const el = e.target;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const inputType = el.getAttribute('type');
        const inputMode = el.getAttribute('inputmode') || el.inputMode;
        if (inputType === 'tel' || inputMode === 'numeric' || inputType === 'number') {
          setKbType('number');
        } else {
          setKbType('korean');
        }
        setVisible(true);
      }
    };
    const hide = (e) => {
      setTimeout(() => {
        const active = document.activeElement;
        if (active?.tagName !== 'INPUT' && active?.tagName !== 'TEXTAREA') {
          setVisible(false);
        }
      }, 50);
    };

    document.addEventListener('focusin', show);
    document.addEventListener('focusout', hide);
    return () => {
      document.removeEventListener('focusin', show);
      document.removeEventListener('focusout', hide);
    };
  }, [enabled]);

  const kbRef = useRef(null);

  // 키보드 높이를 CSS 변수로 내보내기
  useEffect(() => {
    if (visible && kbRef.current) {
      const h = kbRef.current.offsetHeight;
      document.documentElement.style.setProperty('--kb-height', `${h}px`);
    } else {
      document.documentElement.style.setProperty('--kb-height', '0px');
    }
  }, [visible]);

  return (
    <div
      ref={kbRef}
      className="fixed bottom-0 left-0 right-0 z-[200] pointer-events-none"
      style={{
        transition: 'transform 300ms cubic-bezier(0.33, 1, 0.68, 1)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
      }}
    >
      <div className="pointer-events-auto">
        {kbType === 'korean' ? <KoreanKeyboard /> : <NumberKeyboard />}
      </div>
    </div>
  );
}

function KoreanKeyboard() {
  return (
    <div className="bg-[#d1d3d9] pt-1.5 pb-1 px-[3px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* 상단 자동완성 바 */}
      <div className="flex items-center gap-1 px-1 pb-1.5">
        {['이전','다음'].map((label) => (
          <div key={label} className="h-[30px] px-3 flex items-center justify-center rounded-[5px] bg-white/70">
            <span className="text-[13px] text-[#3a3a37]">{label}</span>
          </div>
        ))}
        <div className="flex-1" />
        <div className="h-[30px] px-3 flex items-center justify-center rounded-[5px] bg-white/70">
          <span className="text-[13px] font-semibold text-[#007aff]">완료</span>
        </div>
      </div>

      {/* 1행 */}
      <div className="flex gap-[5px] px-[2px] mb-[9px] justify-center">
        {KOREAN_ROWS[0].map((key) => (
          <div key={key} className="flex-1 h-[42px] bg-white rounded-[5px] flex items-center justify-center shadow-[0_1px_0_#898a8d]">
            <span className="text-[18px] text-[#1d1d1d]">{key}</span>
          </div>
        ))}
      </div>

      {/* 2행 */}
      <div className="flex gap-[5px] px-[14px] mb-[9px] justify-center">
        {KOREAN_ROWS[1].map((key) => (
          <div key={key} className="flex-1 h-[42px] bg-white rounded-[5px] flex items-center justify-center shadow-[0_1px_0_#898a8d]">
            <span className="text-[18px] text-[#1d1d1d]">{key}</span>
          </div>
        ))}
      </div>

      {/* 3행 */}
      <div className="flex gap-[5px] px-[2px] mb-[9px] justify-center">
        {/* 쉬프트 */}
        <div className="w-[42px] h-[42px] bg-[#adb3bc] rounded-[5px] flex items-center justify-center shadow-[0_1px_0_#898a8d]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3L3 11H6.5V15H11.5V11H15L9 3Z" stroke="#1d1d1d" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        {KOREAN_ROWS[2].map((key) => (
          <div key={key} className="flex-1 h-[42px] bg-white rounded-[5px] flex items-center justify-center shadow-[0_1px_0_#898a8d]">
            <span className="text-[18px] text-[#1d1d1d]">{key}</span>
          </div>
        ))}
        {/* 백스페이스 */}
        <div className="w-[42px] h-[42px] bg-[#adb3bc] rounded-[5px] flex items-center justify-center shadow-[0_1px_0_#898a8d]">
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <path d="M7 1L1 8L7 15H19V1H7Z" stroke="#1d1d1d" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <path d="M11 5.5L15 10.5M15 5.5L11 10.5" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* 4행 — 스페이스바 */}
      <div className="flex gap-[5px] px-[2px]">
        <div className="w-[50px] h-[42px] bg-[#adb3bc] rounded-[5px] flex items-center justify-center shadow-[0_1px_0_#898a8d]">
          <span className="text-[14px] text-[#1d1d1d]">123</span>
        </div>
        <div className="w-[36px] h-[42px] bg-[#adb3bc] rounded-[5px] flex items-center justify-center shadow-[0_1px_0_#898a8d]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#1d1d1d" strokeWidth="1.5" fill="none"/>
            <path d="M7.5 10.5C7.5 10.5 8.5 13 10 13C11.5 13 12.5 10.5 12.5 10.5" stroke="#1d1d1d" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="7.5" cy="8" r="0.8" fill="#1d1d1d"/>
            <circle cx="12.5" cy="8" r="0.8" fill="#1d1d1d"/>
          </svg>
        </div>
        <div className="flex-1 h-[42px] bg-white rounded-[5px] flex items-center justify-center shadow-[0_1px_0_#898a8d]">
          <span className="text-[14px] text-[#1d1d1d]">space</span>
        </div>
        <div className="w-[80px] h-[42px] bg-[#007aff] rounded-[5px] flex items-center justify-center shadow-[0_1px_0_#006ae0]">
          <span className="text-[14px] font-semibold text-white">검색</span>
        </div>
      </div>

      {/* 홈바 영역 */}
      <div className="h-[20px]" />
    </div>
  );
}

function NumberKeyboard() {
  return (
    <div className="bg-[#d1d3d9] pt-1.5 pb-1 px-[3px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* 상단 바 */}
      <div className="flex items-center gap-1 px-1 pb-1.5">
        <div className="flex-1" />
        <div className="h-[30px] px-3 flex items-center justify-center rounded-[5px] bg-white/70">
          <span className="text-[13px] font-semibold text-[#007aff]">완료</span>
        </div>
      </div>

      {NUMBER_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-[5px] px-[2px] mb-[9px] justify-center">
          {row.map((key, ki) => {
            if (key === '') {
              return <div key={ki} className="flex-1 h-[46px]" />;
            }
            if (key === '⌫') {
              return (
                <div key={ki} className="flex-1 h-[46px] bg-[#adb3bc] rounded-[5px] flex items-center justify-center shadow-[0_1px_0_#898a8d]">
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                    <path d="M7 1L1 8L7 15H19V1H7Z" stroke="#1d1d1d" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                    <path d="M11 5.5L15 10.5M15 5.5L11 10.5" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              );
            }
            return (
              <div key={ki} className="flex-1 h-[46px] bg-white rounded-[5px] flex items-center justify-center shadow-[0_1px_0_#898a8d]">
                <span className="text-[22px] text-[#1d1d1d]">{key}</span>
              </div>
            );
          })}
        </div>
      ))}

      {/* 홈바 영역 */}
      <div className="h-[20px]" />
    </div>
  );
}
