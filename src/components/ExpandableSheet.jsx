import { useRef, useEffect, useCallback, useState } from 'react';

// ── Design Spec: Type C — Expandable (콘텐츠 확장형) ──
// Half(50vh) ↔ Full(90vh) 2단계 스냅, proportional scrim(0.3~0.5),
// velocity 스냅(500/1500px/s), rubber-band, 스크롤↔드래그 seamless 전환,
// autoFocus → Full로 열림, focus trap, Escape, reduce-motion
// 📄 전체 스펙: ~/.claude/docs/luckymeal/wireframes/BottomSheet-DesignSpec.md

const EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';
const SNAP_MS = 300;
const DISMISS_MS = 250;
const FAST_VEL = 500;          // px/s — 빠른 플릭
const RUBBER = 0.3;
const HALF_RATIO = 0.5;       // 50vh
const FULL_RATIO = 0.9;       // 90vh
const DISMISS_THRESHOLD = 0.3; // Half 아래로 30% 이상 내리면 dismiss

// scrim opacity: Half → 0.3, Full → 0.5, 그 사이 선형 보간
function scrimOpacity(heightRatio) {
  if (heightRatio <= 0) return 0;
  if (heightRatio <= HALF_RATIO) return 0.3 * (heightRatio / HALF_RATIO);
  return 0.3 + 0.2 * ((heightRatio - HALF_RATIO) / (FULL_RATIO - HALF_RATIO));
}

export default function ExpandableSheet({ children, onDismiss, autoFocus = false, title, showClose = false, stickyContent }) {
  const backdropRef = useRef(null);
  const sheetRef = useRef(null);
  const scrollRef = useRef(null);           // 내부 스크롤 컨테이너
  const dragRef = useRef({
    active: false,
    source: 'handle',                       // 'handle' | 'scroll'
    startY: 0,
    lastY: 0,
    lastT: 0,
    vy: 0,
    startHeightPx: 0,
  });
  const dismissing = useRef(false);
  const reducedMotion = useRef(false);
  const vpH = useRef(window.innerHeight);

  const initialSnap = autoFocus ? FULL_RATIO : HALF_RATIO;
  const [currentRatio, setCurrentRatio] = useState(initialSnap);
  const ratioRef = useRef(initialSnap);

  useEffect(() => { ratioRef.current = currentRatio; }, [currentRatio]);
  useEffect(() => {
    const onResize = () => { vpH.current = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const dur = (ms) => (reducedMotion.current ? 0 : ms);

  // ── 높이·scrim 직접 적용 ──
  const applyHeight = useCallback((ratio, animated = false) => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (!sheet) return;

    const ms = animated ? dur(SNAP_MS) : 0;
    sheet.style.transition = ms ? `height ${ms}ms ${EASING}` : 'none';
    sheet.style.height = `${ratio * 100}vh`;

    if (backdrop) {
      backdrop.style.transition = ms ? `opacity ${ms}ms ${EASING}` : 'none';
      backdrop.style.opacity = String(scrimOpacity(ratio));
    }
  }, []);

  // ── 배경 스크롤 잠금 ──
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // ── 열림 애니메이션 (translateY 100% → 0) ──
  useEffect(() => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (!sheet || !backdrop) return;

    sheet.style.height = `${initialSnap * 100}vh`;
    sheet.style.transform = 'translateY(100%)';
    backdrop.style.opacity = '0';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const ms = dur(SNAP_MS);
        sheet.style.transition = `transform ${ms}ms ${EASING}, height ${ms}ms ${EASING}`;
        sheet.style.transform = 'translateY(0)';
        backdrop.style.transition = `opacity ${ms}ms ${EASING}`;
        backdrop.style.opacity = String(scrimOpacity(initialSnap));
      });
    });
  }, []);

  // ── Focus trap ──
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const timer = setTimeout(() => {
      // autoFocus: 첫 input/textarea에 포커스
      if (autoFocus) {
        const input = sheet.querySelector('input:not([disabled]),textarea:not([disabled])');
        if (input) { input.focus(); return; }
      }
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

  // ── Escape ──
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
      const ms = dur(DISMISS_MS);
      sheet.style.transition = `transform ${ms}ms ${EASING}`;
      sheet.style.transform = 'translateY(100%)';
    }
    if (backdrop) {
      backdrop.style.transition = `opacity ${dur(DISMISS_MS)}ms ${EASING}`;
      backdrop.style.opacity = '0';
    }
    setTimeout(() => onDismiss?.(), dur(DISMISS_MS) || 1);
  }, [onDismiss]);

  // ── 스냅 결정 ──
  const resolveSnap = useCallback((heightRatio, velocity) => {
    // velocity: positive = 아래 (시트 줄어듦)
    const snaps = [HALF_RATIO, FULL_RATIO];

    // dismiss 판단: Half 아래로 많이 내렸거나 빠른 아래 플릭
    if (heightRatio < HALF_RATIO * (1 - DISMISS_THRESHOLD)) return 'dismiss';
    if (velocity > FAST_VEL && heightRatio < HALF_RATIO * 1.1) return 'dismiss';

    // 빠른 플릭 → 방향의 다음 스냅
    if (Math.abs(velocity) > FAST_VEL) {
      if (velocity > 0) {
        // 아래 (줄이기): 현재보다 작은 스냅
        return snaps.filter((s) => s < heightRatio + 0.05).pop() || snaps[0];
      } else {
        // 위 (키우기): 현재보다 큰 스냅
        return snaps.find((s) => s > heightRatio - 0.05) || snaps[snaps.length - 1];
      }
    }

    // 가장 가까운 스냅
    let closest = snaps[0];
    let minDist = Infinity;
    for (const s of snaps) {
      const d = Math.abs(heightRatio - s);
      if (d < minDist) { minDist = d; closest = s; }
    }
    return closest;
  }, []);

  // ── 드래그 시작 ──
  const startDrag = useCallback((clientY, source = 'handle') => {
    // 드래그 시작 시 키보드 해제
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      document.activeElement.blur();
    }
    dragRef.current = {
      active: true,
      source,
      startY: clientY,
      lastY: clientY,
      lastT: Date.now(),
      vy: 0,
      startHeightPx: ratioRef.current * vpH.current,
    };
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }, []);

  // ── 드래그 이동 ──
  const moveDrag = useCallback((clientY) => {
    const d = dragRef.current;
    if (!d.active) return;

    const now = Date.now();
    const dt = (now - d.lastT) / 1000;
    if (dt > 0.001) {
      const iv = (clientY - d.lastY) / dt;
      d.vy = d.vy * 0.4 + iv * 0.6;
    }

    const prevY = d.lastY;
    d.lastY = clientY;
    d.lastT = now;

    const pixelDelta = clientY - prevY; // 양수 = 손가락 아래, 음수 = 위
    const scrollEl = scrollRef.current;
    const isFromContent = d.source === 'scroll' || d.source === 'scroll-pointer';

    // Full 상태 + 콘텐츠 영역 드래그 → 스크롤↔시트 드래그 전환
    if (isFromContent && d.startHeightPx >= FULL_RATIO * vpH.current - 1) {
      const atTop = !scrollEl || scrollEl.scrollTop <= 0;

      // 위로 드래그 (콘텐츠 스크롤) — scrollTop > 0이거나 Full 상태에서 위로
      if (pixelDelta < 0 && scrollEl) {
        scrollEl.scrollTop -= pixelDelta; // pixelDelta가 음수이므로 scrollTop 증가
        return;
      }

      // 아래로 드래그 + scrollTop > 0 → 콘텐츠 스크롤
      if (pixelDelta > 0 && scrollEl && !atTop) {
        scrollEl.scrollTop -= pixelDelta;
        return;
      }

      // 아래로 드래그 + scrollTop === 0 → 시트 드래그로 전환 (아래에서 처리)
    }

    // deltaY: 양수 = 손가락 아래로 → 시트 줄어듦
    const deltaY = clientY - d.startY;
    let newHeightPx = d.startHeightPx - deltaY;

    const fullPx = FULL_RATIO * vpH.current;

    // rubber-band: Full 위로 넘어가면
    if (newHeightPx > fullPx) {
      const over = newHeightPx - fullPx;
      newHeightPx = fullPx + over * RUBBER;
    }

    // 0 이하 방지
    newHeightPx = Math.max(0, newHeightPx);

    const ratio = newHeightPx / vpH.current;
    ratioRef.current = ratio;
    setCurrentRatio(ratio);
    applyHeight(ratio, false);

    // Full 미만이면 스크롤 리셋
    if (ratio < FULL_RATIO - 0.01 && scrollEl) {
      scrollEl.scrollTop = 0;
    }
  }, [applyHeight]);

  // ── 키보드 활성 여부 판단 ──
  const isKeyboardActive = useCallback(() => {
    const el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }, []);

  // ── 드래그 종료 ──
  const endDrag = useCallback(() => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';

    const ratio = ratioRef.current;
    const velocity = d.vy; // positive = 아래

    // Option B: 키보드가 올라와 있고 아래로 드래그 → 키보드 먼저 내리고 Half로 스냅
    if (velocity > 0 && isKeyboardActive()) {
      document.activeElement.blur();
      ratioRef.current = HALF_RATIO;
      setCurrentRatio(HALF_RATIO);
      applyHeight(HALF_RATIO, true);
      return;
    }

    const target = resolveSnap(ratio, velocity);

    if (target === 'dismiss') {
      dismiss();
    } else {
      ratioRef.current = target;
      setCurrentRatio(target);
      applyHeight(target, true);
    }
  }, [resolveSnap, dismiss, applyHeight, isKeyboardActive]);

  // ── 핸들 포인터 이벤트 ──
  const onHandlePointerDown = useCallback((e) => {
    e.preventDefault();
    startDrag(e.clientY, 'handle');
  }, [startDrag]);

  // ── 스크롤 컨테이너 터치 이벤트 (seamless 전환) ──
  const scrollTouchRef = useRef({ startY: 0, sheetDragging: false });

  const onScrollTouchStart = useCallback((e) => {
    scrollTouchRef.current = { startY: e.touches[0].clientY, sheetDragging: true };
    startDrag(e.touches[0].clientY, 'scroll');
  }, [startDrag]);

  const onScrollTouchMove = useCallback((e) => {
    const st = scrollTouchRef.current;
    const touch = e.touches[0];

    if (st.sheetDragging) {
      e.preventDefault();
      moveDrag(touch.clientY);
    }
  }, [moveDrag]);

  const onScrollTouchEnd = useCallback(() => {
    if (scrollTouchRef.current.sheetDragging) {
      scrollTouchRef.current.sheetDragging = false;
      endDrag();
    }
  }, [endDrag]);

  // ── 콘텐츠 영역 포인터 이벤트 (데스크톱 마우스 드래그 지원) ──
  const scrollPointerRef = useRef({ startY: 0, sheetDragging: false });

  const onScrollPointerDown = useCallback((e) => {
    // 터치 디바이스는 터치 이벤트로 처리
    if (e.pointerType === 'touch') return;
    // 항상 즉시 드래그 시작 (Full이든 Half든)
    scrollPointerRef.current = { startY: e.clientY, sheetDragging: true };
    startDrag(e.clientY, 'scroll-pointer');
  }, [startDrag]);

  // ── window 레벨 리스너 (핸들 + 콘텐츠 포인터 드래그) ──
  useEffect(() => {
    const onPM = (e) => {
      if (!dragRef.current.active) return;
      const src = dragRef.current.source;
      if (src === 'handle' || src === 'scroll-pointer') {
        moveDrag(e.clientY);
      }
    };
    const onPU = () => {
      if (!dragRef.current.active) return;
      const src = dragRef.current.source;
      if (src === 'handle' || src === 'scroll-pointer') {
        scrollPointerRef.current.sheetDragging = false;
        endDrag();
      }
    };

    window.addEventListener('pointermove', onPM);
    window.addEventListener('pointerup', onPU);
    return () => {
      window.removeEventListener('pointermove', onPM);
      window.removeEventListener('pointerup', onPU);
    };
  }, [moveDrag, endDrag, startDrag]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end" role="dialog" aria-modal="true">
      {/* Scrim — 높이에 비례하는 opacity */}
      <div
        ref={backdropRef}
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}
        onClick={dismiss}
        aria-label="닫기"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full bg-white rounded-t-[24px] flex flex-col"
        style={{ height: `${initialSnap * 100}vh`, fontFamily: 'Pretendard, sans-serif' }}
      >
        {/* 핸들 바: 36×4, 터치 영역 44px+ */}
        <div
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={onHandlePointerDown}
          role="slider"
          aria-label="시트 드래그 핸들"
          tabIndex={-1}
        >
          <div className="flex justify-center" style={{ padding: '12px 0 0' }}>
            <div className="w-[36px] h-[4px] bg-[#C4C4C4] rounded-[2px]" />
          </div>

          {/* 타이틀 + 닫기 버튼 헤더 */}
          {title && (
            <div className="flex items-center px-5 pt-3 pb-3" style={{ minHeight: '44px' }}>
              <h3 className="flex-1 text-[16px] font-semibold text-[#3a3a37] leading-[1.5]">{title}</h3>
              {showClose && (
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(); }}
                  className="shrink-0 w-[32px] h-[32px] flex items-center justify-center rounded-full bg-[#f0f0ee] active:bg-[#e3e3df] transition-colors"
                  aria-label="닫기"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1L13 13M13 1L1 13" stroke="#90908e" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          )}
          {!title && <div style={{ paddingBottom: '12px' }} />}
        </div>

        {/* Sticky content (스크롤 영역 밖) */}
        {stickyContent && <div className="shrink-0">{stickyContent}</div>}

        {/* Content — 스크롤↔드래그 seamless 전환 */}
        <div
          ref={scrollRef}
          className="flex-1 overscroll-contain overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'none',
          }}
          onTouchStart={onScrollTouchStart}
          onTouchMove={onScrollTouchMove}
          onTouchEnd={onScrollTouchEnd}
          onPointerDown={onScrollPointerDown}
          onClick={(e) => {
            // input/textarea 외 영역 클릭 시 키보드 해제
            const tag = e.target.tagName;
            if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
              document.activeElement?.blur();
            }
          }}
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
