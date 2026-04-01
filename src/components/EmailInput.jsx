import { useState, useRef, useEffect } from 'react';

const CASE_PRESETS = {
  'email-empty': { email: '' },
  'email-valid': { email: 'owner@bakery.com' },
  'email-invalid': { email: 'invalid-email' },
  'email-duplicate': { email: 'already@registered.com', error: '이미 가입된 이메일입니다' },
};

export default function EmailInput({ onNext, onBack }) {
  const [emailFull, setEmailFull] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFull);
  const showInvalid = emailFull.length > 0 && !isValid;

  // 어노테이션 케이스 수신
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SET_CASE' && CASE_PRESETS[e.data.case]) {
        const preset = CASE_PRESETS[e.data.case];
        setEmailFull(preset.email);
        setError(preset.error || '');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div
      className="absolute inset-0 z-50 bg-white overflow-y-auto"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
    <div className="flex flex-col min-h-full">
      {/* 상단 네비 */}
      <div className="flex items-center justify-between h-[48px] px-4 shrink-0">
        <button
          onClick={onBack}
          className="w-[28px] h-[28px] flex items-center justify-center rounded-full"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-[12px] text-[#737373] leading-[18px]">고객센터</span>
      </div>

      {/* 타이틀 */}
      <div className="px-4 mt-4">
        <h1 className="text-[18px] font-bold leading-[24px] tracking-[0.15px] text-[#1d1d1d]">
          이메일(아이디) 입력
        </h1>
        <div className="mt-2 text-[12px] text-[#1d1d1d] leading-[18px]">
          <p>메일을 받을 수 있는 이메일을 입력해주세요</p>
          <p>추후, 비밀번호를 찾을 때 사용됩니다</p>
        </div>
      </div>

      {/* 입력 필드 */}
      <div className="px-4 mt-4">
        <input
          ref={inputRef}
          type="email"
          value={emailFull}
          onChange={(e) => { setEmailFull(e.target.value); setError(''); }}
          placeholder="이메일 주소 입력 (예: name@gmail.com)"
          className={`w-full h-[44px] bg-[#f4f4f4] rounded-[16px] px-4 text-[12px] text-[#1d1d1d] leading-[18px] outline-none placeholder:text-[#737373] border-2 ${
            error ? 'border-[#ff4444]' : showInvalid ? 'border-[#ff4444]' : 'border-transparent'
          }`}
        />
        {showInvalid && (
          <p className="text-[10px] text-[#ff4444] mt-1 px-1">올바른 이메일 형식을 입력해주세요</p>
        )}
        {error && (
          <p className="text-[10px] text-[#ff4444] mt-1 px-1">{error}</p>
        )}
      </div>

      <div className="flex-1" />

      {/* 다음 버튼 */}
      <div className="sticky bottom-0 px-4 pb-6 pt-4 bg-white">
        <button
          onClick={() => isValid && !error && onNext?.(emailFull)}
          disabled={!isValid || !!error}
          className={`w-full py-4 rounded-[18px] text-[14px] font-bold leading-[20px] tracking-[0.1px] text-white transition-colors ${
            isValid && !error ? 'bg-[#16cc83] active:bg-[#12b574]' : 'bg-[#cfcfcf]'
          }`}
        >
          다음
        </button>
      </div>
    </div>
    </div>
  );
}
