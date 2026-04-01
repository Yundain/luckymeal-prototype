import { useAppStore } from '../stores/useAppStore';

export default function ExpandSearchButton({ variant = 'default' }) {
  const { setTriggerZoomOut, setToastMessage } = useAppStore();

  const handleClick = () => {
    // 줌아웃 트리거 활성화 -> NaverMap에서 감지하여 줌아웃 + 재검색
    setTriggerZoomOut(true);
    setToastMessage('반경을 넓혀 검색합니다');
  };

  // 결과가 없을 때 강조 스타일
  if (variant === 'empty') {
    return (
      <button
        onClick={handleClick}
        className="mt-4 px-6 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 active:bg-green-700 transition-colors"
      >
        더 넓게 검색하기
      </button>
    );
  }

  // 기본: 리스트 최하단 스타일
  return (
    <div className="py-6 px-4">
      <button
        onClick={handleClick}
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-green-400 hover:text-green-600 active:bg-green-50 transition-colors flex items-center justify-center gap-2"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
          <path d="M11 8v6M8 11h6" />
        </svg>
        더 넓게 검색할까요?
      </button>
    </div>
  );
}
