import { useState, useEffect } from 'react';
import TimeRangePickerSheet from './TimeRangePickerSheet';

const STEPS = ['메뉴', '판매 설정', '픽업시간', '가게 정보'];

const ALL_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const MAX_SLOTS = 2;

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

const CASE_PRESETS = {
  'pickup-all-on': {
    daySettings: ALL_DAYS.map((day) => ({
      day,
      active: true,
      slots: [{ startTime: '18:00', endTime: '19:00' }],
    })),
  },
  'pickup-some-off': {
    daySettings: ALL_DAYS.map((day) => ({
      day,
      active: ['월', '화', '수', '목', '금'].includes(day),
      slots: [{ startTime: '18:00', endTime: '19:00' }],
    })),
  },
  'pickup-all-off': {
    daySettings: ALL_DAYS.map((day) => ({
      day,
      active: false,
      slots: [{ startTime: '18:00', endTime: '19:00' }],
    })),
  },
  'pickup-time-picker': {
    daySettings: ALL_DAYS.map((day) => ({
      day,
      active: ['월', '화', '수', '목', '금'].includes(day),
      slots: [{ startTime: '18:00', endTime: '19:00' }],
    })),
    pickerMode: { type: 'day', index: 0, slotIndex: 0 },
  },
  'pickup-all-off-next': {
    daySettings: ALL_DAYS.map((day) => ({
      day,
      active: false,
      slots: [{ startTime: '18:00', endTime: '19:00' }],
    })),
  },
};

export default function PickupTime({ selectedDays, onNext, onBack, onClose, onStepClick, initialDaySettings, onDaySettingsChange }) {
  const activeDayLabels = (selectedDays || ['월요일','화요일','수요일','목요일','금요일','토요일'])
    .map((d) => d.replace('요일', ''));

  const [daySettings, setDaySettings] = useState(() =>
    initialDaySettings || ALL_DAYS.map((day) => ({
      day,
      active: activeDayLabels.includes(day),
      slots: [{ startTime: '18:00', endTime: '19:00' }],
    }))
  );

  // 타임피커 상태: { type: 'day', index, slotIndex } | { type: 'bulk' }
  const [pickerMode, setPickerMode] = useState(null);

  // 인라인 에러: { [dayIndex]: 'error message' }
  const [slotErrors, setSlotErrors] = useState({});

  // App에 변경 전파
  useEffect(() => { onDaySettingsChange?.(daySettings); }, [daySettings]);

  // 어노테이션 케이스 수신
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'SET_CASE' && CASE_PRESETS[e.data.case]) {
        const preset = CASE_PRESETS[e.data.case];
        if (preset.daySettings) setDaySettings(preset.daySettings);
        if (preset.pickerMode !== undefined) setPickerMode(preset.pickerMode);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const openPicker = (index, slotIndex = 0) => {
    setPickerMode({ type: 'day', index, slotIndex });
    window.parent.postMessage({ type:'SHEET_OPENED', sheet:'pickup-time-picker-sheet' }, '*');
  };

  const handlePickerApply = (start, end, applyToAll) => {
    if (!pickerMode) return;
    let newSettings;
    if (applyToAll) {
      newSettings = daySettings.map((d) => {
        if (!d.active) return d;
        const newSlots = [...d.slots];
        const si = pickerMode.slotIndex;
        if (si < newSlots.length) {
          newSlots[si] = { startTime: start, endTime: end };
        }
        return { ...d, slots: newSlots };
      });
    } else {
      newSettings = daySettings.map((d, i) => {
        if (i !== pickerMode.index) return d;
        const newSlots = [...d.slots];
        newSlots[pickerMode.slotIndex] = { startTime: start, endTime: end };
        return { ...d, slots: newSlots };
      });
    }
    // 2슬롯인 경우 자동 정렬 (이른 타임이 위)
    newSettings = newSettings.map((d) => {
      if (d.slots.length < 2) return d;
      const sorted = [...d.slots].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
      return { ...d, slots: sorted };
    });
    setDaySettings(newSettings);

    // 인라인 에러 검증
    const errors = {};
    newSettings.forEach((d, i) => {
      if (!d.active || d.slots.length < 2) return;
      const s0Start = toMin(d.slots[0].startTime), s0End = toMin(d.slots[0].endTime);
      const s1Start = toMin(d.slots[1].startTime), s1End = toMin(d.slots[1].endTime);
      if (s0Start < s1End && s0End > s1Start) {
        errors[i] = '타임 간 최소 1시간 간격이 필요해요';
      } else {
        const gap = Math.min(Math.abs(s1Start - s0End), Math.abs(s0Start - s1End));
        if (gap < 60) errors[i] = '타임 간 최소 1시간 간격이 필요해요';
      }
    });
    setSlotErrors(errors);
    setPickerMode(null);
  };

  const toggleDay = (index) => {
    setDaySettings((prev) =>
      prev.map((d, i) =>
        i === index ? { ...d, active: !d.active } : d
      )
    );
    const d = daySettings[index];
    if (d.active) {
      // 비활성화 → 에러 제거
      setSlotErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    } else {
      // 활성화 → 2슬롯이면 에러 재검증
      if (d.slots.length >= 2) {
        const s0Start = toMin(d.slots[0].startTime), s0End = toMin(d.slots[0].endTime);
        const s1Start = toMin(d.slots[1].startTime), s1End = toMin(d.slots[1].endTime);
        if (s0Start < s1End && s0End > s1Start) {
          setSlotErrors((prev) => ({ ...prev, [index]: '타임 간 최소 1시간 간격이 필요해요' }));
        } else {
          const gap = Math.min(Math.abs(s1Start - s0End), Math.abs(s0Start - s1End));
          if (gap < 60) setSlotErrors((prev) => ({ ...prev, [index]: '타임 간 최소 1시간 간격이 필요해요' }));
        }
      }
    }
  };

  const addSlot = (index) => {
    setDaySettings((prev) =>
      prev.map((d, i) => {
        if (i !== index || d.slots.length >= MAX_SLOTS) return d;
        return { ...d, slots: [...d.slots, { startTime: '11:00', endTime: '12:00' }] };
      })
    );
  };

  const removeSlot = (dayIndex, slotIndex) => {
    setDaySettings((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        const newSlots = d.slots.filter((_, si) => si !== slotIndex);
        return { ...d, slots: newSlots };
      })
    );
    // 슬롯 1개가 되면 에러 제거
    setSlotErrors((prev) => {
      const next = { ...prev };
      delete next[dayIndex];
      return next;
    });
  };

  // 전체 OFF 체크 + 슬롯 에러 체크
  const hasAnyActive = daySettings.some((d) => d.active);
  const hasSlotErrors = Object.keys(slotErrors).length > 0;
  const canProceed = hasAnyActive && !hasSlotErrors;

  // 2슬롯이 아닌 활성 요일이 하나라도 있는지
  const hasSingleSlotDays = daySettings.some((d) => d.active && d.slots.length < MAX_SLOTS);

  // 2타임 안내 바텀시트
  const [showTwoSlotGuide, setShowTwoSlotGuide] = useState(false);

  const addSlotToAll = () => {
    setShowTwoSlotGuide(true);
  };

  const confirmTwoSlot = () => {
    setDaySettings((prev) =>
      prev.map((d) => {
        if (!d.active || d.slots.length >= MAX_SLOTS) return d;
        const firstStart = parseInt(d.slots[0].startTime.split(':')[0]);
        // 1타임이 15시 이후면 오전(11~12), 이전이면 저녁(18~19)
        const newSlot = firstStart >= 15
          ? { startTime: '11:00', endTime: '12:00' }
          : { startTime: '18:00', endTime: '19:00' };
        const slots = [d.slots[0], newSlot].sort((a, b) =>
          toMin(a.startTime) - toMin(b.startTime)
        );
        return { ...d, slots };
      })
    );
    setShowTwoSlotGuide(false);
  };

  const getPickerStart = () => {
    if (!pickerMode) return '18:00';
    if (pickerMode.type === 'bulk') return pickerMode.startTime;
    const slot = daySettings[pickerMode.index].slots[pickerMode.slotIndex];
    return slot.startTime === '없음' ? '18:00' : slot.startTime;
  };

  const getPickerEnd = () => {
    if (!pickerMode) return '19:00';
    if (pickerMode.type === 'bulk') return pickerMode.endTime;
    const slot = daySettings[pickerMode.index].slots[pickerMode.slotIndex];
    return slot.endTime === '없음' ? '19:00' : slot.endTime;
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-white flex flex-col"
      style={{ fontFamily: 'Pretendard, sans-serif' }}
    >
      {/* 상단 네비 */}
      <div className="flex items-center justify-between h-[48px] px-1 shrink-0">
        <button onClick={onBack} className="w-[42px] h-[42px] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex items-center">
          <button className="px-2.5 h-[42px] flex items-center">
            <span className="text-[12px] font-semibold text-[#0ab26f] leading-[1.5]">고객센터</span>
          </button>
          <button onClick={onClose} className="w-[42px] h-[42px] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 프로그레스 바 */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute h-[2px] bg-[#e3e3df] left-[13px] right-[21px] top-[29px]" />
            <div className="absolute h-[2px] bg-[#16cc83] left-[13px] right-[121px] top-[29px]" />
            {STEPS.map((step, i) => (
              <button key={step} onClick={() => onStepClick?.(i)} className="flex flex-col items-center gap-2 relative z-10">
                <span className={`text-[12px] font-semibold leading-[1.5] ${i <= 2 ? 'text-[#545453]' : 'text-[#ababa9]'}`}>
                  {step}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    i < 2
                      ? 'bg-[#16cc83]'
                      : i === 2
                      ? 'bg-[#16cc83] ring-[6px] ring-[rgba(22,204,131,0.2)]'
                      : 'bg-[#e3e3df]'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 헤더 */}
        <div className="px-5 pt-5 pb-2">
          <h2 className="text-[18px] font-semibold text-[#3a3a37] leading-[1.5] tracking-[-0.09px]">
            고객이 럭키백을 몇 시에 찾으러 올까요?
          </h2>
          <p className="text-[12px] text-[#90908e] leading-[1.5] mt-0.5">
            입점 후 실제 오픈 전에 담당자가 다시 함께 확인해드리니 안심하세요!
            <br />
            대부분의 가게가 마감시간부터 2시간 이내로 설정해요 (픽업 시간이 길수록 주문이 많아요)
            <br />
            재고가 적어도 괜찮아요. 선예약을 받고 남은 제품이 없으면 취소할 수 있어요
          </p>
        </div>

        {/* 요일별 시간 설정 */}
        <div data-annotate="pickup-daylist" className="px-5 pt-5 pb-3 flex flex-col gap-4 items-end">
          {daySettings.map((setting, index) => (
            <div key={setting.day} className="flex flex-col gap-2 w-full">
              {/* 슬롯들 + 인라인 에러 (비활성 시 첫 줄만) */}
              {(setting.active ? setting.slots : [setting.slots[0]]).map((slot, slotIndex) => (
                <div key={slotIndex} data-annotate="pickup-slot" className="flex items-center gap-2 w-full">
                  {/* 토글 pill (첫 번째 슬롯에만) */}
                  {slotIndex === 0 ? (
                    <button
                      onClick={() => toggleDay(index)}
                      className={`flex items-center gap-1 rounded-[24px] py-1 shrink-0 transition-colors ${
                        setting.active
                          ? 'bg-[#11c07a] pl-2.5 pr-1'
                          : 'bg-[#f2f1ed] pl-1.5 pr-2.5'
                      }`}
                    >
                      {setting.active ? (
                        <>
                          <span className="text-[14px] font-semibold text-white leading-[1.5]">
                            {setting.day}
                          </span>
                          <div className="w-[22px] h-[22px] bg-white rounded-full" />
                        </>
                      ) : (
                        <>
                          <div className="w-[20px] h-[20px] bg-white rounded-full shadow-sm" />
                          <span className="text-[14px] font-semibold text-[#6d6d6b] leading-[1.5]">
                            {setting.day}
                          </span>
                        </>
                      )}
                    </button>
                  ) : (
                    /* 두 번째 슬롯: 토글 자리 빈 공간 */
                    <div className="w-[58px] shrink-0" />
                  )}

                  {/* 시간 표시 (클릭 시 피커 열기) */}
                  <button
                    onClick={() => setting.active ? openPicker(index, slotIndex) : toggleDay(index)}
                    className="flex-1 flex items-center gap-2 text-[16px] leading-[1.5]"
                  >
                    <span className={`flex-1 text-center ${setting.active ? (slot.startTime === '없음' ? 'text-[#ababa9]' : 'text-[#3a3a37]') : 'text-[#ababa9]'}`}>
                      {setting.active ? slot.startTime : '없음'}
                    </span>
                    <span className="text-[#3a3a37] shrink-0">~</span>
                    <span className={`flex-1 text-center ${setting.active ? (slot.endTime === '없음' ? 'text-[#ababa9]' : 'text-[#3a3a37]') : 'text-[#ababa9]'}`}>
                      {setting.active ? slot.endTime : '없음'}
                    </span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                      <path d="M7.5 5L12.5 10L7.5 15" stroke={setting.active ? '#3a3a37' : '#ababa9'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* X 버튼 (두 번째 슬롯만) */}
                  {setting.active && slotIndex === 1 && (
                    <button
                      onClick={() => removeSlot(index, slotIndex)}
                      className="w-[30px] h-[30px] rounded-[12px] border border-[#e3e3df] flex items-center justify-center shrink-0"
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M5 9H13" stroke="#1d1d1d" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                  {/* 2슬롯 모드에서 첫 번째 슬롯 오른쪽 빈 공간 */}
                  {setting.active && slotIndex === 0 && setting.slots.length >= MAX_SLOTS && (
                    <div className="w-[30px] shrink-0" />
                  )}
                </div>
              ))}
              {/* 인라인 에러 메시지 */}
              {slotErrors[index] && (
                <p className="text-[13px] font-medium text-[#ff4444] leading-[1.5] text-center">
                  {slotErrors[index]}
                </p>
              )}
            </div>
          ))}

          {/* 하루에 2타임 열기 버튼 (아직 2슬롯이 아닌 활성 요일이 있을 때만) */}
          {hasSingleSlotDays && (
            <button
              data-annotate="pickup-2slot"
              onClick={addSlotToAll}
              className="flex items-center gap-1.5 self-start mt-1"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3.5V12.5M3.5 8H12.5" stroke="#0ab26f" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[14px] font-semibold text-[#0ab26f] leading-[1.5]">
                하루에 2타임 열기
              </span>
            </button>
          )}

        </div>

        <div className="h-[120px]" />
      </div>

      {/* 하단 CTA */}
      <div
        className="shrink-0 px-3 pt-4 pb-2"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, white 33%)' }}
      >
        {!hasAnyActive && (
          <p className="text-[12px] text-[#ff4444] text-center mb-2">최소 1개 요일을 선택해주세요</p>
        )}
        <div className="flex items-center gap-3">
          <button data-annotate="pickup-method-btn" onClick={() => window.open('https://www.notion.so/33affa413387806c9762c63801b308b3?pvs=24', '_blank')} className="flex-1 h-[52px] border border-[#e3e3df] rounded-[18px] flex items-center justify-center gap-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#6d6d6b" strokeWidth="1.5"/>
              <path d="M12 8v4M12 16h.01" stroke="#6d6d6b" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-[14px] font-semibold text-[#6d6d6b] leading-[1.5]">픽업 방식</span>
          </button>
          <button
            onClick={() => canProceed && onNext?.(daySettings.filter((d) => d.active))}
            disabled={!canProceed}
            className={`flex-1 h-[52px] rounded-[18px] flex items-center justify-center transition-colors ${
              canProceed ? 'bg-[#16cc83] active:bg-[#12b574]' : 'bg-[#beedd3] cursor-not-allowed'
            }`}
          >
            <span className="text-[14px] font-semibold text-white leading-[1.5]">다음</span>
          </button>
        </div>
      </div>

      {/* 2타임 안내 바텀시트 */}
      {showTwoSlotGuide && (
        <div className="absolute inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTwoSlotGuide(false)} />
          <div className="relative w-full bg-white rounded-t-[24px] px-5 pt-6 pb-3 z-10">
            <h3 className="text-[18px] font-semibold text-[#1d1d1d] leading-[1.5] mb-2">
              하루에 2타임 열기
            </h3>
            <p className="text-[14px] text-[#6d6d6b] leading-[1.7] mb-1">
              점심·저녁 각각 다른 시간에 판매할 수 있어요.
            </p>
            <p className="text-[13px] text-[#90908e] leading-[1.6] mb-6">
              예) 1타임 11:00~12:00 / 2타임 18:00~19:00
              <br />
              시간은 추가 후 자유롭게 수정할 수 있어요.
            </p>
            <button
              onClick={confirmTwoSlot}
              className="w-full h-[52px] bg-[#16cc83] rounded-[18px] flex items-center justify-center active:bg-[#12b574] transition-colors mb-2"
            >
              <span className="text-[14px] font-semibold text-white leading-[1.5]">2타임 추가하기</span>
            </button>
            <button
              onClick={() => setShowTwoSlotGuide(false)}
              className="w-full h-[44px] flex items-center justify-center"
            >
              <span className="text-[14px] font-semibold text-[#90908e] leading-[1.5]">취소</span>
            </button>
          </div>
        </div>
      )}

      {/* 타임 레인지 피커 바텀시트 */}
      {pickerMode && (
        <TimeRangePickerSheet
          startTime={getPickerStart()}
          endTime={getPickerEnd()}
          showApplyAll={pickerMode.type === 'day'}
          onApply={handlePickerApply}
          onClose={() => setPickerMode(null)}
        />
      )}
    </div>
  );
}
