import { useState, useRef, useEffect, useCallback } from 'react';
import ModalSheet from './ModalSheet';

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

/* ── 슬라이더 (좌우 드래그) ── */
function SliderPicker({ values, selectedIndex, onChange, formatValue, highlightRange }) {
  const trackRef = useRef(null);
  const dragging = useRef(false);

  const ratio = values.length > 1 ? selectedIndex / (values.length - 1) : 0;

  const indexFromClientX = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * (values.length - 1));
  };

  const handleStart = (clientX) => {
    dragging.current = true;
    onChange(indexFromClientX(clientX));
  };
  const handleMove = (clientX) => {
    if (!dragging.current) return;
    onChange(indexFromClientX(clientX));
  };
  const handleEnd = () => { dragging.current = false; };

  useEffect(() => {
    const up = () => handleEnd();
    const move = (e) => handleMove(e.touches ? e.touches[0].clientX : e.clientX);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  });

  return (
    <div className="border border-[#e3e3df] rounded-[12px] px-5 py-4 flex flex-col gap-3">
      {/* 트랙 */}
      <div
        ref={trackRef}
        className="relative w-full h-[50px] flex items-end cursor-pointer select-none"
        onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientX); }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        {/* 하이라이트 구간 */}
        {highlightRange && (() => {
          const startIdx = values.findIndex(v => v >= highlightRange[0]);
          const endIdx = values.findIndex(v => v > highlightRange[1]) - 1;
          if (startIdx < 0) return null;
          const ei = endIdx < 0 ? values.length - 1 : endIdx;
          const left = startIdx / (values.length - 1) * 100;
          const right = ei / (values.length - 1) * 100;
          return (
            <>
              {/* 라벨 */}
              <div
                className="absolute top-0 text-[12px] font-semibold text-[#0ab26f] whitespace-nowrap"
                style={{ left: `${(left + right) / 2}%`, transform: 'translateX(-50%)' }}
              >
                70%가 선택한 구간
              </div>
              {/* 양쪽 보더 + 배경 */}
              <div
                className="absolute bottom-0 border-l border-r border-[#16cc83]"
                style={{ left: `${left}%`, width: `${right - left}%`, height: '22px' }}
              >
                <div className="w-full h-[13px] mt-[2px] bg-[#e4f8ed]" />
              </div>
            </>
          );
        })()}
        {/* 배경 트랙 */}
        <div className="absolute left-0 right-0 bottom-[8px] h-[5px] bg-[#e3e3df] rounded-[8px]" />
        {/* 채워진 트랙 */}
        <div
          className="absolute left-0 bottom-[8px] h-[5px] bg-[#16cc83] rounded-[8px] transition-[width] duration-75"
          style={{ width: `${ratio * 100}%` }}
        />
        {/* 썸 */}
        <div
          className="absolute w-[16px] h-[16px] bg-white rounded-full border-2 border-[#16cc83] shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-[left] duration-75"
          style={{ left: `calc(${ratio * 100}% - 8px)`, bottom: '2px' }}
        />
      </div>

      {/* ±버튼 + 값 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, selectedIndex - 1))}
          className="w-[36px] h-[36px] rounded-[14px] border border-[#e3e3df] flex items-center justify-center shrink-0 active:bg-[#f5f5f3]"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 10H15" stroke="#3a3a37" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <span className="flex-1 text-center text-[20px] font-semibold text-[#1d1d1d] leading-[1.5] tracking-[-0.2px]">
          {formatValue(values[selectedIndex])}
        </span>
        <button
          onClick={() => onChange(Math.min(values.length - 1, selectedIndex + 1))}
          className="w-[36px] h-[36px] rounded-[14px] border border-[#e3e3df] flex items-center justify-center shrink-0 active:bg-[#f5f5f3]"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 5V15M5 10H15" stroke="#3a3a37" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── 휠 피커 (세로 스크롤) ── */
function WheelPicker({ values, selectedIndex, onChange, formatValue }) {
  const containerRef = useRef(null);
  const dragRef = useRef({ isDragging: false, startY: 0, startOffset: 0 });
  const [offset, setOffset] = useState(-selectedIndex * ITEM_HEIGHT);
  const [isAnimating, setIsAnimating] = useState(false);
  const momentumRef = useRef({ lastY: 0, lastTime: 0, velocity: 0 });

  const centerOffset = Math.floor(VISIBLE_COUNT / 2) * ITEM_HEIGHT;

  const snapToIndex = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(values.length - 1, idx));
    setIsAnimating(true);
    setOffset(-clamped * ITEM_HEIGHT);
    onChange(clamped);
    setTimeout(() => setIsAnimating(false), 300);
  }, [values.length, onChange]);

  useEffect(() => {
    setIsAnimating(true);
    setOffset(-selectedIndex * ITEM_HEIGHT);
    setTimeout(() => setIsAnimating(false), 300);
  }, [selectedIndex]);

  const getIndexFromOffset = (off) => Math.round(-off / ITEM_HEIGHT);

  const handleStart = (clientY) => {
    setIsAnimating(false);
    dragRef.current = { isDragging: true, startY: clientY, startOffset: offset };
    momentumRef.current = { lastY: clientY, lastTime: Date.now(), velocity: 0 };
  };

  const handleMove = (clientY) => {
    if (!dragRef.current.isDragging) return;
    const diff = clientY - dragRef.current.startY;
    const now = Date.now();
    const dt = now - momentumRef.current.lastTime;
    if (dt > 0) {
      momentumRef.current.velocity = (clientY - momentumRef.current.lastY) / dt;
      momentumRef.current.lastY = clientY;
      momentumRef.current.lastTime = now;
    }
    setOffset(dragRef.current.startOffset + diff);
  };

  const handleEnd = () => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    const v = momentumRef.current.velocity;
    const projected = offset + v * 120;
    const idx = getIndexFromOffset(projected);
    snapToIndex(idx);
  };

  const onTouchStart = (e) => handleStart(e.touches[0].clientY);
  const onTouchMove = (e) => { e.preventDefault(); handleMove(e.touches[0].clientY); };
  const onTouchEnd = () => handleEnd();
  const onMouseDown = (e) => { e.preventDefault(); handleStart(e.clientY); };
  const onMouseMove = (e) => handleMove(e.clientY);
  const onMouseUp = () => handleEnd();

  useEffect(() => {
    if (!dragRef.current.isDragging) return;
    const up = () => handleEnd();
    const move = (e) => handleMove(e.clientY);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  });

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{ height: WHEEL_HEIGHT }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
    >
      {/* 선택 영역 하이라이트 */}
      <div
        className="absolute left-0 right-0 pointer-events-none z-10 border-y border-[#e3e3df]"
        style={{ top: centerOffset, height: ITEM_HEIGHT }}
      />
      {/* 위아래 페이드 그라데이션 */}
      <div className="absolute inset-x-0 top-0 h-[88px] pointer-events-none z-20"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
      <div className="absolute inset-x-0 bottom-0 h-[88px] pointer-events-none z-20"
        style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />

      {/* 아이템 리스트 */}
      <div
        style={{
          transform: `translateY(${offset + centerOffset}px)`,
          transition: isAnimating ? 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
        }}
      >
        {values.map((val, i) => {
          const isSelected = i === selectedIndex;
          return (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{ height: ITEM_HEIGHT }}
              onClick={() => snapToIndex(i)}
            >
              <span
                className={`text-center transition-all duration-200 ${
                  isSelected
                    ? 'text-[20px] font-semibold text-[#1d1d1d]'
                    : 'text-[16px] font-medium text-[#c0c0be]'
                }`}
                style={{ letterSpacing: '-0.2px', lineHeight: '1.5' }}
              >
                {formatValue(val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StepperBottomSheet({
  title,
  subtitle,
  highlightRange,
  value,
  formatValue,
  getHint,
  step = 1,
  min = 1,
  max = 99,
  variant = 'wheel', // 'wheel' | 'slider'
  onApply,
  onClose,
}) {
  const values = [];
  for (let v = min; v <= max; v += step) values.push(v);
  const initialIndex = values.indexOf(value) !== -1 ? values.indexOf(value) : 0;

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const current = values[selectedIndex];

  const decrease = () => setSelectedIndex((i) => Math.max(0, i - 1));
  const increase = () => setSelectedIndex((i) => Math.min(values.length - 1, i + 1));

  return (
    <ModalSheet onDismiss={onClose}>
      {/* 스크롤 가능 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {/* 헤더 */}
        <div className="px-5 pt-3 pb-2">
        <h3 className="text-[20px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.2px] whitespace-pre-line">
          {title}
        </h3>
        <p className="text-[12px] text-[#90908e] leading-[1.5] mt-0.5 whitespace-pre-line">
          {subtitle}
        </p>
      </div>

      {/* 힌트 */}
      {getHint && (
        <div className="flex justify-center pt-1 pb-0">
          <span className="text-[12px] font-semibold text-[#578fff] leading-[1.5]">
            {getHint(current)}
          </span>
        </div>
      )}

      {/* 입력 영역 */}
      {variant === 'slider' ? (
        <div className="px-5 py-2">
          <SliderPicker
            values={values}
            selectedIndex={selectedIndex}
            onChange={setSelectedIndex}
            formatValue={formatValue}
            highlightRange={highlightRange}
          />
        </div>
      ) : (
        <div className="px-3 py-3">
          <div className="border border-[#e3e3df] rounded-[12px] px-5 py-2 flex items-center gap-3">
            <button
              onClick={decrease}
              disabled={selectedIndex <= 0}
              className={`w-[36px] h-[36px] rounded-[14px] border border-[#e3e3df] flex items-center justify-center shrink-0 transition-colors ${
                selectedIndex <= 0 ? 'opacity-30' : 'active:bg-[#f4f4f4]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10H15" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex-1">
              <WheelPicker
                values={values}
                selectedIndex={selectedIndex}
                onChange={setSelectedIndex}
                formatValue={formatValue}
              />
            </div>
            <button
              onClick={increase}
              disabled={selectedIndex >= values.length - 1}
              className={`w-[36px] h-[36px] rounded-[14px] border border-[#e3e3df] flex items-center justify-center shrink-0 transition-colors ${
                selectedIndex >= values.length - 1 ? 'opacity-30' : 'active:bg-[#f4f4f4]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 5V15M5 10H15" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
      </div>

      {/* 하단 버튼 — 스크롤 밖 고정 */}
      <div className="shrink-0 px-3 pt-4 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 h-[52px] rounded-[18px] border border-[#e3e3df] bg-white flex items-center justify-center active:bg-[#f4f4f4] transition-colors"
        >
          <span className="text-[14px] font-semibold text-[#6d6d6b] leading-[1.5]">취소</span>
        </button>
        <button
          onClick={() => onApply?.(current)}
          className="flex-1 h-[52px] rounded-[18px] bg-[#16cc83] flex items-center justify-center active:bg-[#12b574] transition-colors"
        >
          <span className="text-[14px] font-semibold text-white leading-[1.5]">적용</span>
        </button>
      </div>
    </ModalSheet>
  );
}
