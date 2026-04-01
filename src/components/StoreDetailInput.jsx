import { useState, useEffect } from 'react';
import AddressSearchSheet from './AddressSearchSheet';

const CASE_PRESETS = {
  'detail-empty': { storeName: '', detailAddress: '' },
  'detail-filled': { storeName: '브래댄코 상왕십리점', detailAddress: '1층' },
  'detail-no-name': { storeName: '', detailAddress: '1층' },
};

export default function StoreDetailInput({ store, onBack, onNext, onAddressChange, onClose }) {
  const [storeName, setStoreName] = useState(store?.name || '');
  const address = store?.address || '';
  const [detailAddress, setDetailAddress] = useState(store?.detailAddress || '');
  const [showAddressSheet, setShowAddressSheet] = useState(false);

  const canProceed = storeName.trim().length > 0 && address.length > 0 && detailAddress.trim().length > 0;

  // 어노테이션 케이스 수신
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SET_CASE' && CASE_PRESETS[e.data.case]) {
        const p = CASE_PRESETS[e.data.case];
        setStoreName(p.storeName);
        setDetailAddress(p.detailAddress);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div
      className="absolute inset-0 z-50 bg-white flex flex-col"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      {/* 상단바 */}
      <div className="flex items-center justify-between h-[48px] px-1 shrink-0">
        <button onClick={onBack} className="w-[42px] h-[42px] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex items-center">
          <div className="flex items-center gap-1.5 px-2.5 h-[42px]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="5" r="1" fill="#545453" />
              <circle cx="10" cy="10" r="1" fill="#545453" />
              <circle cx="10" cy="15" r="1" fill="#545453" />
            </svg>
            <span className="text-[12px] font-semibold text-[#0ab26f] leading-[1.5]">고객센터</span>
          </div>
          <button onClick={onClose} className="w-[42px] h-[42px] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 헤더 */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-[24px] font-semibold leading-[1.5] tracking-[-0.24px] text-[#3a3a37]">
          가게명, 상세 주소를 입력해주세요
        </h1>
      </div>

      {/* 입력 폼 */}
      <div data-annotate="detail-form" className="px-4 pt-6 flex flex-col gap-4 flex-1">
        {/* 가게 이름 */}
        <div>
          <label className="text-[14px] font-semibold text-[#545453] leading-[1.5] px-1 mb-1.5 block">
            가게 이름
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="예: 브래댄코 상왕십리점"
            className="w-full h-[52px] px-4 rounded-[18px] border border-[#c6c6c4] bg-white text-[16px] text-[#3a3a37] leading-[1.5] placeholder:text-[#ababa9] outline-none focus:border-[#16cc83] transition-colors"
          />
        </div>

        {/* 주소 */}
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-semibold text-[#545453] leading-[1.5] px-1">주소</label>
          <button
            data-annotate="detail-address-btn"
            onClick={() => setShowAddressSheet(true)}
            className="w-full h-[52px] px-4 rounded-[18px] border border-[#c6c6c4] bg-white flex items-center text-left"
          >
            {address ? (
              <span className="text-[16px] text-[#3a3a37] leading-[1.5]">{address}</span>
            ) : (
              <span className="text-[16px] text-[#ababa9] leading-[1.5]">주소를 검색해주세요</span>
            )}
          </button>

          <input
            type="text"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            placeholder="상세 주소"
            className="w-full h-[52px] px-4 rounded-[18px] border border-[#c6c6c4] bg-white text-[14px] text-[#3a3a37] leading-[1.5] placeholder:text-[#ababa9] outline-none focus:border-[#16cc83] transition-colors"
          />
        </div>
      </div>

      {/* 하단 CTA */}
      <div
        className="shrink-0 px-3 pt-4 pb-6"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, white 33%)' }}
      >
        <button
          data-annotate="detail-cta"
          onClick={() => canProceed && onNext?.({ name: storeName.trim(), address, detailAddress: detailAddress.trim() })}
          className={`flex-1 w-full h-[52px] rounded-[18px] flex items-center justify-center transition-colors ${
            canProceed ? 'bg-[#16cc83] active:bg-[#12b574]' : 'bg-[#e3e3df]'
          }`}
          disabled={!canProceed}
        >
          <span className={`text-[14px] font-semibold leading-[1.5] ${canProceed ? 'text-white' : 'text-[#ababa9]'}`}>
            다음
          </span>
        </button>
      </div>
      {/* 주소 검색 바텀시트 */}
      {showAddressSheet && (
        <AddressSearchSheet
          onSelect={(addr) => {
            onAddressChange?.(addr);
            setShowAddressSheet(false);
          }}
          onClose={() => setShowAddressSheet(false)}
        />
      )}
    </div>
  );
}
