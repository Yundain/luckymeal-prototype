import { useRef, useEffect, useCallback } from 'react';

// ── Design Spec: Type A — Modal (액션/선택형) ──
// fit-content(max 70vh), scrim 0.5, 아래 드래그 dismiss,
// 위 rubber-band(30%), velocity 500px/s, 300/250ms 애니메이션,
// focus trap, Escape dismiss, reduce-motion 대응
// 📄 전체 스펙: ~/.claude/docs/luckymeal/wireframes/BottomSheet-DesignSpec.md

const EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';
const SNAP_MS = 300;
const DISMISS_MS = 250;
const FAST_VEL = 500;       // px/s — 빠른 플릭 임계값
const RUBBER = 0.3;          // 위로 드래그 시 rubber-band 계수
const MAX_VH = 70;           // 최대 높이
const DISMISS_RATIO = 0.4;   // 시트 높이 40% 이상 내리면 dismiss

export default function ModalSheet({ children, onDismiss }) {
  const backdropRef = useRef(null);
  const sheetRef = useRef(null);
  const dragRef = useRef({ active: false, startY: 0, lastY: 0, lastT: 0, vy: 0 });
  const dismissing = useRef(false);
  const reducedMotion = useRef(false);

  // ── reduce-motion 체크 ──
  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const dur = (ms) => (reducedMotion.current ? 0 : ms);

  // ── 열림 애니메이션 ──
  useEffect(() => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (!sheet || !backdrop) return;

    sheet.style.transform = 'translateY(100%)';
    backdrop.style.opacity = '0';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sheet.style.transition = `transform ${dur(SNAP_MS)}ms ${EASING}`;
        sheet.style.transform = 'translateY(0)';
        backdrop.style.transition = `opacity ${dur(SNAP_MS)}ms ${EASING}`;
        backdrop.style.opacity = '1';
      });
    });
  }, []);

  // ── Focus trap ──
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const timer = setTimeout(() => {
      const els = getFocusable(sheet);
      if (els.length) els[0].focus();
    }, dur(SNAP_MS));

    const trap = (e) => {
      if (e.key !== 'Tab') return;
      const els = getFocusable(sheet);
      if (!els.length) return;
      if (e.shiftKey && document.activeElement === els[0]) {
        e.preventDefault();
        els[els.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === els[els.length - 1]) {
        e.preventDefault();
        els[0].focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => { clearTimeout(timer); document.removeEventListener('keydown', trap); };
  }, []);

  // ── Escape dismiss ──
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  // ── dismiss ──
  const dismiss = useCallback(() => {
    if (dismissing.current) return;
    dismissing.current = true;
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (sheet) {
      sheet.style.transition = `transform ${dur(DISMISS_MS)}ms ${EASING}`;
      sheet.style.transform = 'translateY(100%)';
    }
    if (backdrop) {
      backdrop.style.transition = `opacity ${dur(DISMISS_MS)}ms ${EASING}`;
      backdrop.style.opacity = '0';
    }
    setTimeout(() => onDismiss?.(), dur(DISMISS_MS) || 1);
  }, [onDismiss]);

  // ── transform 직접 조작 (드래그 중 리렌더 없이) ──
  const applyOffset = useCallback((dy) => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (!sheet) return;

    sheet.style.transition = 'none';
    const y = dy >= 0 ? dy : dy * RUBBER;
    sheet.style.transform = `translateY(${y}px)`;

    if (backdrop) {
      const h = sheet.offsetHeight || 300;
      const progress = Math.max(0, Math.min(1, 1 - Math.max(0, dy) / h));
      backdrop.style.transition = 'none';
      backdrop.style.opacity = String(progress);
    }
  }, []);

  const snapBack = useCallback(() => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (sheet) {
      sheet.style.transition = `transform ${dur(SNAP_MS)}ms ${EASING}`;
      sheet.style.transform = 'translateY(0)';
    }
    if (backdrop) {
      backdrop.style.transition = `opacity ${dur(SNAP_MS)}ms ${EASING}`;
      backdrop.style.opacity = '1';
    }
  }, []);

  // ── 드래그 로직 ──
  const startDrag = useCallback((clientY) => {
    dragRef.current = { active: true, startY: clientY, lastY: clientY, lastT: Date.now(), vy: 0 };
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }, []);

  const moveDrag = useCallback((clientY) => {
    const d = dragRef.current;
    if (!d.active) return;

    const now = Date.now();
    const dt = (now - d.lastT) / 1000;
    if (dt > 0.001) {
      const iv = (clientY - d.lastY) / dt;
      d.vy = d.vy * 0.4 + iv * 0.6; // exponential smoothing
    }
    d.lastY = clientY;
    d.lastT = now;

    applyOffset(clientY - d.startY);
  }, [applyOffset]);

  const endDrag = useCallback(() => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';

    const dy = d.lastY - d.startY;
    const velocity = d.vy; // positive = 아래
    const sheetH = sheetRef.current?.offsetHeight || 300;

    if (velocity > FAST_VEL || dy > sheetH * DISMISS_RATIO) {
      dismiss();
    } else {
      snapBack();
    }
  }, [dismiss, snapBack]);

  // ── 핸들 포인터 이벤트 ──
  const onHandlePointerDown = useCallback((e) => {
    e.preventDefault();
    startDrag(e.clientY);
  }, [startDrag]);

  // ── 콘텐츠 터치 이벤트 (스크롤 불가 영역에서 아래로 드래그) ──
  const onContentTouchStart = useCallback((e) => {
    const el = e.currentTarget;
    if (el.scrollHeight > el.clientHeight + 1) return; // 스크롤 가능하면 스킵
    startDrag(e.touches[0].clientY);
  }, [startDrag]);

  // ── window 레벨 리스너 (드래그 지속) ──
  useEffect(() => {
    const onPM = (e) => { if (dragRef.current.active) moveDrag(e.clientY); };
    const onPU = () => { if (dragRef.current.active) endDrag(); };
    const onTM = (e) => {
      if (!dragRef.current.active) return;
      e.preventDefault();
      moveDrag(e.touches[0].clientY);
    };
    const onTE = () => { if (dragRef.current.active) endDrag(); };

    window.addEventListener('pointermove', onPM);
    window.addEventListener('pointerup', onPU);
    window.addEventListener('touchmove', onTM, { passive: false });
    window.addEventListener('touchend', onTE);
    return () => {
      window.removeEventListener('pointermove', onPM);
      window.removeEventListener('pointerup', onPU);
      window.removeEventListener('touchmove', onTM);
      window.removeEventListener('touchend', onTE);
    };
  }, [moveDrag, endDrag]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end" role="dialog" aria-modal="true">
      {/* Scrim */}
      <div
        ref={backdropRef}
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={dismiss}
        aria-label="닫기"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full bg-white rounded-t-[24px] flex flex-col overflow-hidden"
        style={{ maxHeight: `${MAX_VH}vh`, fontFamily: 'Pretendard, sans-serif' }}
      >
        {/* 핸들 바: 36×4, 터치 영역 44px+ */}
        <div
          className="flex justify-center shrink-0 cursor-grab active:cursor-grabbing touch-none"
          style={{ padding: '12px 0', minHeight: '28px' }}
          onPointerDown={onHandlePointerDown}
          role="slider"
          aria-label="시트 드래그 핸들"
          tabIndex={-1}
        >
          <div className="w-[36px] h-[4px] bg-[#C4C4C4] rounded-[2px]" />
        </div>

        {/*
          children을 그대로 flex column에 배치.
          시트(maxHeight 70vh) 안에서 flex 레이아웃이 작동하므로:
          - shrink-0 요소(CTA 등)는 항상 보임
          - 나머지 콘텐츠가 넘치면 스크롤 가능한 영역에서만 스크롤
          소비자 사용법: 스크롤 될 body에 "flex-1 min-h-0 overflow-y-auto",
                       고정 footer에 "shrink-0"
        */}
        <div
          className="flex-1 min-h-0 flex flex-col"
          onTouchStart={onContentTouchStart}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ── 유틸 ──
function getFocusable(root) {
  return root.querySelectorAll(
    'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[href]'
  );
}
