export default function RegistrationComplete({ onConfirm }) {
  return (
    <div
      className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      <div className="w-[80px] h-[80px] rounded-full bg-[#16cc83] flex items-center justify-center mb-5 animate-check-pop">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="animate-check-draw">
          <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-[22px] font-bold text-[#1c1c1b] leading-[1.4] tracking-[-0.2px] text-center mb-1">
        가게 등록 완료!
      </h2>
      <p className="text-[15px] font-semibold text-[#545453] leading-[1.5] text-center mb-2">
        심사 후 바로 판매 시작
      </p>
      <p className="text-[14px] text-[#6d6d6b] leading-[1.6] text-center px-8">
        보통 1영업일 이내 심사가 완료되며,<br />카카오 알림톡으로 결과를 보내드려요
      </p>
      <div className="mt-8 mx-6 w-[calc(100%-48px)] bg-[#f8f8f6] rounded-[16px] p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-[40px] h-[40px] rounded-[12px] bg-[#e4f8ed] flex items-center justify-center">
            <span className="text-[20px]">🍀</span>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#3a3a37] leading-[1.5]">브래댄코 상왕십리점</p>
            <p className="text-[12px] text-[#90908e] leading-[1.5]">럭키백 판매 신청</p>
          </div>
        </div>
      </div>
      <div className="mt-4 mx-6 w-[calc(100%-48px)]">
        <div className="flex items-center justify-center gap-2 text-[13px] text-[#90908e] leading-[1.5]">
          <span>입점료 · 연회비 0원</span>
          <span className="text-[#e3e3df]">|</span>
          <span>판매될 때만 수수료</span>
          <span className="text-[#e3e3df]">|</span>
          <span>언제든 수정 가능</span>
        </div>
      </div>
      <div className="mt-8 px-6 w-full">
        <button
          data-annotate="complete-confirm"
          onClick={onConfirm}
          className="w-full h-[52px] bg-[#16cc83] rounded-[18px] flex items-center justify-center active:bg-[#12b574] transition-colors"
        >
          <span className="text-[14px] font-semibold text-white leading-[1.5]">확인</span>
        </button>
      </div>
      <style>{`
        @keyframes check-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes check-draw { 0% { opacity: 0; transform: scale(0.5); } 50% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1); } }
        .animate-check-pop { animation: check-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both; }
        .animate-check-draw { animation: check-draw 0.5s ease-out 0.3s both; }
      `}</style>
    </div>
  );
}
