export default function ExitConfirmSheet({ onConfirm, onCancel }) {
  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center">
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* 모달 */}
      <div
        className="relative z-10 bg-white rounded-[24px] flex flex-col pt-6 pb-4 px-4 mx-6 shadow-[0_0_40px_rgba(0,0,0,0.16)]"
        style={{ fontFamily: 'Pretendard, sans-serif' }}
      >
        {/* 텍스트 */}
        <div className="px-2 mb-5">
          <p className="text-[20px] font-semibold leading-[1.5] tracking-[-0.2px] text-[#3a3a37] mb-2">
            잠깐, 나가시겠어요?
          </p>
          <p className="text-[16px] text-[#6d6d6b] leading-[1.5]">
            작성 중인 정보는 임시저장돼요. 언제든 이어서 작성할 수 있어요.
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onCancel}
            className="w-full h-[52px] bg-[#16cc83] rounded-[18px] text-[14px] font-semibold text-white active:bg-[#12b574] transition-colors"
          >
            이어서 작성하기
          </button>
          <button
            onClick={onConfirm}
            className="w-full h-[52px] rounded-[18px] border border-[#e3e3df] text-[14px] font-semibold text-[#6d6d6b] active:bg-[#f5f5f3] transition-colors"
          >
            저장하고 나가기
          </button>
        </div>
      </div>
    </div>
  );
}
