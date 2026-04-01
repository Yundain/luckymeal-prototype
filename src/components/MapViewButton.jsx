import { useAppStore } from '../stores/useAppStore';

export default function MapViewButton() {
  const { sheetState, setSheetState } = useAppStore();

  // 바텀시트가 최대일 때만 표시
  if (sheetState !== 'max') return null;

  const handleClick = () => {
    setSheetState('mid');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-full shadow-lg"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <span className="text-sm font-medium">지도 보기</span>
    </button>
  );
}
