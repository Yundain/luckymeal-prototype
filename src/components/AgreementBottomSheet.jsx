import { useState } from 'react';
import ModalSheet from './ModalSheet';

const ITEMS = [
  { id: 'terms', label: '(필수) 서비스 이용 약관', required: true },
  { id: 'privacy', label: '(필수) 개인정보 수집 및 이용', required: true },
  { id: 'location', label: '(필수) 위치기반서비스 이용약관', required: true },
  { id: 'age', label: '(필수) 만 14세 이상 이용약관', required: true },
  { id: 'identity', label: '(필수) 본인확인서비스 동의사항', required: true },
  { id: 'marketing', label: '(선택) 마케팅 정보 수신 동의', required: false },
  { id: 'ad', label: '(선택) 맞춤형 광고 목적 개인정보 수집 및 이용', required: false },
];

function CheckIcon({ checked, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path
        d="M4 9L7.5 12.5L14 6"
        stroke={checked ? '#16cc83' : '#cfcfcf'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIconLarge({ checked }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke={checked ? '#16cc83' : '#cfcfcf'}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M7 12L10.5 15.5L17 8.5"
        stroke={checked ? '#16cc83' : '#cfcfcf'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <path
        d="M7 5L11 9L7 13"
        stroke="#a3a3a3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AgreementBottomSheet({ onNext, onClose }) {
  const [checked, setChecked] = useState({});

  const allChecked = ITEMS.every((item) => checked[item.id]);
  const allRequiredChecked = ITEMS.filter((i) => i.required).every(
    (item) => checked[item.id]
  );

  const toggleItem = (id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    if (allChecked) {
      setChecked({});
    } else {
      const all = {};
      ITEMS.forEach((item) => (all[item.id] = true));
      setChecked(all);
    }
  };

  return (
    <ModalSheet onDismiss={onClose}>
      {/* 스크롤 가능 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-6 px-4">
        {/* 타이틀 */}
        <p className="text-[18px] font-bold leading-[24px] tracking-[0.15px] text-[#1d1d1d]">
          <span className="text-[#16cc83]">럭키밀</span> 이용을 위해 동의가
          필요해요
        </p>

        {/* 전체 동의 */}
        <button
          onClick={toggleAll}
          className="flex gap-2 items-start w-full text-left"
        >
          <div className="shrink-0 pt-0.5">
            <CheckIconLarge checked={allChecked} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[16px] font-bold leading-[24px] tracking-[0.5px] text-[#1d1d1d]">
              전체 동의
            </span>
            <span className="text-[10px] text-[#737373] leading-[16px]">
              서비스 이용에 필수적인 최소한의 개인정보 수집 및 이용, 본인확인,
              위치정보 수집 및 이용, 광고성 정보 수신(선택)및 마케팅 정보
              수신(선택) 동의를 포함합니다
            </span>
          </div>
        </button>

        {/* 구분선 */}
        <div className="w-full h-px bg-[#e7e7e7]" />

        {/* 개별 항목 */}
        <div className="flex flex-col gap-3">
          {ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between w-full"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="flex gap-3 items-center"
              >
                <CheckIcon checked={!!checked[item.id]} />
                <span className="text-[12px] text-[#1d1d1d] leading-[18px]">
                  {item.label}
                </span>
              </button>
              <ChevronRight />
            </div>
          ))}
        </div>
      </div>

      {/* CTA — 스크롤 밖 고정 */}
      <div className="shrink-0 px-4 pt-4 pb-6">
        <button
          onClick={() => allRequiredChecked && onNext?.()}
          disabled={!allRequiredChecked}
          className={`w-full py-4 rounded-[18px] text-[14px] font-bold leading-[20px] tracking-[0.1px] text-white transition-colors ${
            allRequiredChecked ? 'bg-[#16cc83] active:bg-[#12b574]' : 'bg-[#cfcfcf]'
          }`}
        >
          다음
        </button>
      </div>
    </ModalSheet>
  );
}
