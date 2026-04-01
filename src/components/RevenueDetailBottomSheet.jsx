import ModalSheet from './ModalSheet';

export default function RevenueDetailBottomSheet({ price, quantity, daysCount, monthlyRevenue, onClose }) {
  const sellingPrice = price * 0.5; // 소비자 판매가 (정가의 50%)
  const luckyMealFee = Math.round(price * 0.098); // 럭키밀 수수료 (정가의 9.8%)
  const pgFee = Math.round(sellingPrice * 0.03); // PG 수수료 (판매가의 3%)

  return (
    <ModalSheet onDismiss={onClose}>
      {/* 스크롤 가능 영역 */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {/* 헤더: 월 예상 수익 */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <span className="text-[18px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.09px]">
          월 예상 수익
        </span>
        <span className="text-[22px] font-semibold text-[#0ab26f] leading-[1.5] tracking-[-0.22px]">
          약 {monthlyRevenue.toLocaleString()}원
        </span>
      </div>

      {/* 상세 내역 */}
      <div className="px-5 py-4 flex flex-col gap-4">
        {/* 소비자 판매가 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between text-[14px]">
            <span className="text-[#6d6d6b] leading-[1.5]">소비자 판매가 (50%)</span>
            <span className="font-semibold text-[#3a3a37] leading-[1.5]">개당 {sellingPrice.toLocaleString()}원</span>
          </div>
          <div className="flex items-start justify-between text-[12px] text-[#90908e]">
            <span className="leading-[1.5]">ㄴ 럭키밀 수수료 (정가의 9.8%)</span>
            <span className="leading-[1.5]">-{luckyMealFee.toLocaleString()}원</span>
          </div>
          <div className="flex items-start justify-between text-[12px] text-[#90908e]">
            <span className="leading-[1.5]">ㄴ PG 수수료 (판매가의 3%)</span>
            <span className="leading-[1.5]">-{pgFee.toLocaleString()}원</span>
          </div>
        </div>

        {/* 입점료/연회비 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[14px] text-[#6d6d6b] leading-[1.5]">입점료/연회비</span>
            <span className="bg-[#545453] text-white text-[12px] font-semibold leading-[1.5] px-1.5 py-px rounded-[8px]">
              무료
            </span>
          </div>
          <span className="text-[14px] font-semibold text-[#3a3a37] leading-[1.5]">-0원</span>
        </div>
        </div>
      </div>

      {/* 닫기 버튼 — 스크롤 밖 고정 */}
      <div className="shrink-0 px-3 pt-4">
        <button
          onClick={onClose}
          className="w-full h-[52px] rounded-[18px] border border-[#e3e3df] bg-white flex items-center justify-center active:bg-[#f4f4f4] transition-colors"
        >
          <span className="text-[14px] font-semibold text-[#6d6d6b] leading-[1.5]">닫기</span>
        </button>
      </div>
    </ModalSheet>
  );
}
