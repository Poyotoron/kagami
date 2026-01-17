import { useToast, type ToastType } from '../contexts/ToastContext';

const TOAST_STYLES: Record<ToastType, { bg: string; icon: string; iconColor: string }> = {
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: 'M5 13l4 4L19 7',
    iconColor: 'text-green-500',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'M6 18L18 6M6 6l12 12',
    iconColor: 'text-red-500',
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    iconColor: 'text-yellow-500',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    iconColor: 'text-blue-500',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="通知"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              flex items-start gap-3 p-4 rounded-lg border shadow-lg
              ${style.bg}
              animate-slide-in
            `}
            role="alert"
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 ${style.iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={style.icon}
              />
            </svg>
            <p className="flex-1 text-sm text-gray-700">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              aria-label="通知を閉じる"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
