import { useState } from 'react';
import ModalSheet from './ModalSheet';

const DAYS = [
  { label: '월요일', short: '월', defaultChecked: true },
  { label: '화요일', short: '화', defaultChecked: true },
  { label: '수요일', short: '수', defaultChecked: true },
  { label: '목요일', short: '목', defaultChecked: true },
  { label: '금요일', short: '금', defaultChecked: true },
  { label: '토요일', short: '토', defaultChecked: false },
  { label: '일요일', short: '일', defaultChecked: false },
];

export default function DaysSelectionBottomSheet({ onNext, onClose, initialSelected }) {
  const [selected, setSelected] = useState(
    () => initialSelected?.length
      ? new Set(initialSelected)
      : new Set(DAYS.filter((d) => d.defaultChecked).map((d) => d.label))
  );

  const toggle = (day) => {
    const next = new Set(selected);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }
    setSelected(next);
  };

  const canProceed = selected.size >= 1;

  return (
    <ModalSheet onDismiss={onClose}>
      {/* 스크롤 가능 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {/* 타이틀 */}
        <div className="px-5 pt-1 pb-1">
          <h3 className="text-[18px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.09px]">
            어떤 요일에 판매할까요?
            <br />
            예상 수익을 계산해볼게요
          </h3>
        </div>

        {/* 요일 칩 */}
      <div className="px-5 pt-5 pb-3 flex flex-wrap gap-2">
        {DAYS.map((day) => {
          const isChecked = selected.has(day.label);
          return (
            <button
              key={day.label}
              onClick={() => toggle(day.label)}
              className={`h-[40px] px-4 rounded-full text-[14px] font-semibold transition-colors ${
                isChecked
                  ? 'bg-[#16cc83] text-white'
                  : 'bg-[#f4f4f2] text-[#6d6d6b]'
              }`}
            >
              {day.short}
            </button>
          );
        })}
      </div>

      {/* 안내 텍스트 */}
      <div className="px-5 pb-4">
        {selected.size === 0 ? (
          <div className="flex flex-col gap-2">
            <div className="bg-[#f0f4ff] border border-[#d4dfff] rounded-[12px] px-3.5 py-3">
              <p className="text-[14px] font-semibold text-[#578fff] leading-[1.5]">
                최소 1개 요일을 선택해주세요
              </p>
              <p className="text-[13px] text-[#7a9bff] leading-[1.5] mt-0.5">
                선예약을 받아두고, 재고가 없으면 취소하면 돼요
              </p>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-[#90908e] leading-[1.5]">
            62%의 사장님이 주 6-7회 판매해요
          </p>
        )}
        </div>
      </div>

      {/* CTA — 스크롤 밖 고정 */}
      <div className="shrink-0 px-3 pt-4 pb-2">
        <button
          onClick={() => canProceed && onNext?.(Array.from(selected))}
          disabled={!canProceed}
          className={`w-full h-[52px] rounded-[18px] text-[14px] font-semibold text-white transition-colors ${
            canProceed ? 'bg-[#16cc83] active:bg-[#12b574]' : 'bg-[#beedd3]'
          }`}
        >
          다음
        </button>
      </div>
    </ModalSheet>
  );
}
