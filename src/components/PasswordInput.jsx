import { useState, useEffect } from 'react';

function EyeIcon({ visible, onClick }) {
  return (
    <button onClick={onClick} className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">
      {visible ? (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 4.5C5.25 4.5 2.25 9 2.25 9C2.25 9 5.25 13.5 9 13.5C12.75 13.5 15.75 9 15.75 9C15.75 9 12.75 4.5 9 4.5Z" stroke="#737373" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="9" r="2.25" stroke="#737373" strokeWidth="1.2"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 4.5C5.25 4.5 2.25 9 2.25 9C2.25 9 5.25 13.5 9 13.5C12.75 13.5 15.75 9 15.75 9C15.75 9 12.75 4.5 9 4.5Z" stroke="#737373" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="9" r="2.25" stroke="#737373" strokeWidth="1.2"/>
          <line x1="3" y1="15" x2="15" y2="3" stroke="#737373" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
}

const CASE_PRESETS = {
  'pw-empty': { pw: '', confirm: '', showPw: false },
  'pw-short': { pw: 'abc', confirm: '', showPw: false },
  'pw-mismatch': { pw: 'password123', confirm: 'password456', showPw: false },
  'pw-match': { pw: 'password123', confirm: 'password123', showPw: false },
  'pw-visible': { pw: 'password123', confirm: 'password123', showPw: true },
  'pw-simple': { pw: 'abcdef', confirm: 'abcdef', showPw: false },
  'pw-numbers-only': { pw: '12345678', confirm: '12345678', showPw: false },
};

export default function PasswordInput({ email, onNext, onBack }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isLongEnough = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isComplex = hasLetter && hasNumber;
  const isMatch = password === confirm && confirm.length > 0;
  const isValid = isLongEnough && isComplex && isMatch;

  // 어노테이션 케이스 수신
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SET_CASE' && CASE_PRESETS[e.data.case]) {
        const p = CASE_PRESETS[e.data.case];
        setPassword(p.pw);
        setConfirm(p.confirm);
        setShowPw(p.showPw);
        setShowConfirm(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-white overflow-y-auto" style={{ fontFamily: 'Pretendard, sans-serif' }}>
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between h-[48px] px-4 shrink-0">
        <button onClick={onBack} className="w-[28px] h-[28px] flex items-center justify-center rounded-full">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-[12px] text-[#737373] leading-[18px]">고객센터</span>
      </div>

      <div className="px-4 mt-4">
        <h1 className="text-[18px] font-bold leading-[24px] tracking-[0.15px] text-[#1d1d1d]">비밀번호 입력</h1>
        <div className="mt-2 text-[12px] text-[#1d1d1d] leading-[18px]">
          <p>영문+숫자 조합 8자 이상의 비밀번호와</p>
          <p>비밀번호 확인까지 입력해주세요!</p>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="h-[44px] bg-[#f4f4f4] rounded-[16px] px-4 flex items-center gap-2.5">
          <span className="text-[12px] text-[#1d1d1d] leading-[18px] shrink-0">아이디</span>
          <span className="text-[12px] text-[#1d1d1d] leading-[18px]">{email}</span>
        </div>
      </div>

      <div className="px-4 mt-3">
        <div className="h-[44px] bg-[#f4f4f4] rounded-[16px] px-4 flex items-center justify-between">
          <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" className="flex-1 bg-transparent text-[12px] text-[#1d1d1d] leading-[18px] outline-none placeholder:text-[#737373]" />
          <EyeIcon visible={showPw} onClick={() => setShowPw(!showPw)} />
        </div>
        {password.length > 0 && !isLongEnough && (
          <p className="text-[10px] text-[#ff4444] mt-1 px-1">8자 이상 입력해주세요</p>
        )}
        {password.length >= 8 && !isComplex && (
          <p className="text-[10px] text-[#ff4444] mt-1 px-1">영문과 숫자를 모두 포함해주세요</p>
        )}
      </div>

      <div className="px-4 mt-2">
        <div className="h-[44px] bg-[#f4f4f4] rounded-[16px] px-4 flex items-center justify-between">
          <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="비밀번호 확인" className="flex-1 bg-transparent text-[12px] text-[#1d1d1d] leading-[18px] outline-none placeholder:text-[#737373]" />
          <EyeIcon visible={showConfirm} onClick={() => setShowConfirm(!showConfirm)} />
        </div>
        {confirm.length > 0 && !isMatch && (
          <p className="text-[10px] text-[#ff4444] mt-1 px-1">비밀번호가 일치하지 않습니다</p>
        )}
      </div>

      <div className="flex-1" />

      <div className="sticky bottom-0 px-4 pb-6 pt-4 bg-white">
        <button onClick={() => isValid && onNext?.()} disabled={!isValid} className={`w-full py-4 rounded-[18px] text-[14px] font-bold leading-[20px] tracking-[0.1px] text-white transition-colors ${isValid ? 'bg-[#16cc83] active:bg-[#12b574]' : 'bg-[#cfcfcf]'}`}>
          다음
        </button>
      </div>
    </div>
    </div>
  );
}
