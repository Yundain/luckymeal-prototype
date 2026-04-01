import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';

export default function Toast() {
  const { toastMessage, clearToastMessage } = useAppStore();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToastMessage();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToastMessage]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg animate-fade-in">
      {toastMessage}
    </div>
  );
}
