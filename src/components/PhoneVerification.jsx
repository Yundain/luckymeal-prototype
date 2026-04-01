import { useState, useRef, useEffect } from 'react';

const CASE_PRESETS = {
  'phone-empty': { phone: '', sent: false, code: ['','','','','',''], notif: false },
  'phone-entered': { phone: '01012345678', sent: false, code: ['','','','','',''], notif: false },
  'phone-sent': { phone: '01012345678', sent: true, code: ['','','','','',''], notif: true },
  'phone-partial': { phone: '01012345678', sent: true, code: ['1','2','3','','',''], notif: false },
  'phone-complete': { phone: '01012345678', sent: true, code: ['1','2','3','4','5','6'], notif: false },
  'phone-error': { phone: '01012345678', sent: true, code: ['9','9','9','9','9','9'], notif: false, error: '인증번호가 일치하지 않습니다' },
};

export default function PhoneVerification({ onNext, onBack }) {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const phoneValid = phone.replace(/[^0-9]/g, '').length >= 10;
  const sendEnabled = phoneValid && !sent;

  const [showNotif, setShowNotif] = useState(false);
  const notifCode = useRef('');

  // 어노테이션 케이스 수신
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SET_CASE' && CASE_PRESETS[e.data.case]) {
        const p = CASE_PRESETS[e.data.case];
        setPhone(p.phone);
        setSent(p.sent);
        setCode(p.code);
        setError(p.error || '');
        if (p.notif) {
          notifCode.current = '123456';
          setShowNotif(true);
          setTimeout(() => setShowNotif(false), 4000);
        } else {
          setShowNotif(false);
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleSend = () => {
    if (!phoneValid) return;
    setSent(true);
    setError('');
    notifCode.current = String(Math.floor(100000 + Math.random() * 900000));
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 4000);
  };

  const handleCodeChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (value && index === 5) {
      const full = next.join('');
      if (full.length === 6) {
        setTimeout(() => onNext?.(), 400);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const allFilled = code.every((c) => c !== '');

  return (
    <div className="absolute inset-0 z-50 bg-white overflow-y-auto" style={{ fontFamily: 'Pretendard, sans-serif' }}>
    <div className="flex flex-col min-h-full">
      {/* 문자 알림 배너 */}
      {showNotif && (
        <div className="absolute top-3 left-3 right-3 z-[80] animate-notif-in">
          <div className="bg-white/95 backdrop-blur-md rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.15)] px-4 py-3 flex items-start gap-3" onClick={() => setShowNotif(false)}>
            <div className="w-[36px] h-[36px] rounded-[10px] bg-[#16cc83] flex items-center justify-center shrink-0 mt-0.5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5H17V14C17 14.55 16.55 15 16 15H4C3.45 15 3 14.55 3 14V5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 5L10 11L17 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#1d1d1d] leading-[1.4]">문자메시지</span>
                <span className="text-[11px] text-[#90908e] leading-[1.4]">지금</span>
              </div>
              <p className="text-[13px] text-[#545453] leading-[1.4] mt-0.5">
                [럭키밀] 인증번호 [{notifCode.current}]를 입력해주세요.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between h-[48px] px-4 shrink-0">
        <button onClick={onBack} className="w-[28px] h-[28px] flex items-center justify-center rounded-full">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-[12px] text-[#737373] leading-[18px]">고객센터</span>
      </div>

      <div className="px-4 mt-4">
        <h1 className="text-[18px] font-bold leading-[24px] tracking-[0.15px] text-[#1d1d1d]">휴대폰 인증</h1>
        <div className="mt-2 text-[12px] text-[#1d1d1d] leading-[18px]">
          <p>주문 정보를 카카오톡으로도 발송드립니다</p>
          <p>*알림을 끄거나 직원을 추가할 수 있습니다</p>
        </div>
      </div>

      <div className="flex gap-2 px-4 mt-4">
        <div className="flex-1 h-[44px] bg-[#f4f4f4] rounded-[16px] px-4 flex items-center">
          <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/[^0-9]/g, '')); if (sent) setSent(false); }} placeholder="ex. 01072325130" maxLength={11} className="w-full bg-transparent text-[12px] text-[#1d1d1d] leading-[18px] outline-none placeholder:text-[#737373]" />
        </div>
        <button onClick={handleSend} disabled={!sendEnabled} className={`shrink-0 h-[44px] px-3 rounded-[16px] text-[12px] text-white leading-[18px] whitespace-nowrap transition-colors ${sendEnabled ? 'bg-[#16cc83] active:bg-[#12b574]' : 'bg-[#cfcfcf]'}`}>
          {sent ? '재발송' : '인증번호 발송'}
        </button>
      </div>

      {sent && (
        <div className="px-4 mt-4 animate-fade-in">
          <p className="text-[12px] text-[#1d1d1d] leading-[18px] mb-3">인증번호 6자리를 입력해주세요</p>
          <div className="flex gap-2 justify-center">
            {code.map((digit, i) => (
              <input key={i} ref={(el) => (inputRefs.current[i] = el)} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleCodeChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} className={`w-[44px] h-[52px] bg-[#f4f4f4] rounded-[12px] text-center text-[18px] font-bold text-[#1d1d1d] outline-none transition-all ${digit ? 'border-2 border-[#16cc83]' : 'border-2 border-transparent'}`} autoFocus={i === 0} />
            ))}
          </div>
          {error && <p className="text-[10px] text-[#ff4444] mt-2 text-center">{error}</p>}
          {allFilled && !error && <p className="text-[12px] text-[#16cc83] mt-2 text-center">인증 완료!</p>}
        </div>
      )}

      <div className="flex-1" />

      <div className="sticky bottom-0 px-4 pb-6 pt-4 bg-white">
        <button onClick={() => allFilled && !error && onNext?.()} disabled={!allFilled || !!error} className={`w-full py-4 rounded-[18px] text-[14px] font-bold leading-[20px] tracking-[0.1px] text-white transition-colors ${allFilled && !error ? 'bg-[#16cc83] active:bg-[#12b574]' : 'bg-[#cfcfcf]'}`}>
          다음
        </button>
      </div>
    </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @keyframes notif-in { 0% { opacity: 0; transform: translateY(-100%); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-notif-in { animation: notif-in 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
}
