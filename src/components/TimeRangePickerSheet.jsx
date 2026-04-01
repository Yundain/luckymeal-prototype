import { useState, useRef, useEffect } from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 6 }, (_, i) => String(i * 10).padStart(2, '0'));

const ITEM_H = 40;
const PAD = 2;

function Wheel({ items, value, onChange }) {
  const ref = useRef(null);
  const idx = Math.max(0, items.indexOf(value));
  const snapTimer = useRef(null);
  const [, tick] = useState(0);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = idx * ITEM_H;
  }, []);

  const onScroll = () => {
    tick((t) => t + 1);
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      if (!ref.current) return;
      const i = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, i));
      ref.current.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' });
      onChange(items[clamped]);
    }, 100);
  };

  const centerIdx = ref.current
    ? Math.round(ref.current.scrollTop / ITEM_H)
    : idx;

  return (
    <div style={{ width: 48, height: ITEM_H * (PAD * 2 + 1), position: 'relative', overflow: 'hidden' }}>
      <div
        ref={ref}
        onScroll={onScroll}
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div style={{ height: ITEM_H * PAD }} />
        {items.map((item, i) => {
          const dist = Math.abs(i - centerIdx);
          let fontSize = 14;
          let color = '#c6c6c4';
          if (dist === 0) { fontSize = 20; color = '#1d1d1d'; }
          else if (dist === 1) { fontSize = 18; }

          return (
            <div
              key={item}
              onClick={() => {
                ref.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' });
                onChange(items[i]);
              }}
              style={{
                height: ITEM_H,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize,
                fontWeight: 600,
                color,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {item}
            </div>
          );
        })}
        <div style={{ height: ITEM_H * PAD }} />
      </div>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: ITEM_H * PAD,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.1))',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: ITEM_H * PAD,
        background: 'linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.1))',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

export default function TimeRangePickerSheet({ startTime, endTime, onApply, onClose, showApplyAll = false, onValidate }) {
  const [sH, setSH] = useState(() => (startTime || '18:00').split(':')[0]);
  const [sM, setSM] = useState(() => (startTime || '18:00').split(':')[1]);
  const [eH, setEH] = useState(() => (endTime || '19:00').split(':')[0]);
  const [eM, setEM] = useState(() => (endTime || '19:00').split(':')[1]);
  const [applyToAll, setApplyToAll] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleApply = () => {
    const start = `${sH}:${sM}`;
    const end = `${eH}:${eM}`;
    const startMin = parseInt(sH) * 60 + parseInt(sM);
    const endMin = parseInt(eH) * 60 + parseInt(eM);

    // #3: start > end
    if (startMin >= endMin) {
      setErrorMsg('시작 시간이 종료 시간보다 늦어요');
      setTimeout(() => setErrorMsg(''), 2500);
      return;
    }

    // #4, #5: external validation (slot gap / overlap) from PickupTime
    if (onValidate) {
      const extError = onValidate(start, end);
      if (extError) {
        setErrorMsg(extError);
        setTimeout(() => setErrorMsg(''), 2500);
        return;
      }
    }

    onApply?.(start, end, applyToAll);
  };

  return (
    <div
      className="absolute inset-0 z-[60] flex items-end"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full bg-white rounded-t-[24px] flex flex-col animate-slide-up">
        {/* 핸들 */}
        <div className="flex justify-center h-[24px] items-center">
          <div className="w-[40px] h-[4px] bg-[#c6c6c4] rounded-full" />
        </div>

        {/* 타임 피커 */}
        <div className="px-3 py-2">
          <div className="border border-[#e3e3df] rounded-[12px] px-6 py-3 flex items-center justify-center">
            <div className="flex items-center">
              <Wheel items={HOURS} value={sH} onChange={setSH} />
              <span className="text-[20px] font-semibold text-[#1d1d1d] px-0.5">:</span>
              <Wheel items={MINUTES} value={sM} onChange={setSM} />
            </div>

            <span className="text-[16px] text-[#3a3a37] mx-4">~</span>

            <div className="flex items-center">
              <Wheel items={HOURS} value={eH} onChange={setEH} />
              <span className="text-[20px] font-semibold text-[#1d1d1d] px-0.5">:</span>
              <Wheel items={MINUTES} value={eM} onChange={setEM} />
            </div>
          </div>
        </div>

        {/* 다른 요일에도 일괄 적용 체크박스 */}
        {showApplyAll && (
          <button
            onClick={() => setApplyToAll((v) => !v)}
            className="flex items-center gap-2 px-5 py-3"
          >
            <div
              className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition-colors ${
                applyToAll ? 'bg-[#16cc83] border-[#16cc83]' : 'bg-white border-[#d4d4d4]'
              }`}
            >
              {applyToAll && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-[14px] font-semibold text-[#545453] leading-[1.5]">
              다른 요일에도 일괄 적용
            </span>
          </button>
        )}

        {/* 에러 메시지 */}
        {errorMsg && (
          <div className="px-5 pb-1 animate-[toast-in_0.3s_ease-out]">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#fff0f0] border border-[#ffcccc] rounded-[12px]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#ff4444" strokeWidth="1.2"/>
                <path d="M8 5V9" stroke="#ff4444" strokeWidth="1.2" strokeLinecap="round"/>
                <circle cx="8" cy="11.5" r="0.75" fill="#ff4444"/>
              </svg>
              <span className="text-[13px] font-semibold text-[#ff4444] leading-[1.5]">{errorMsg}</span>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="px-3 pt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-[52px] rounded-[18px] border border-[#e3e3df] bg-white flex items-center justify-center active:bg-[#f4f4f4] transition-colors"
          >
            <span className="text-[14px] font-semibold text-[#6d6d6b] leading-[1.5]">취소</span>
          </button>
          <button
            onClick={handleApply}
            className="flex-1 h-[52px] rounded-[18px] bg-[#16cc83] flex items-center justify-center active:bg-[#12b574] transition-colors"
          >
            <span className="text-[14px] font-semibold text-white leading-[1.5]">적용</span>
          </button>
        </div>

      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes toast-in {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        *::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
