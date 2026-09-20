'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'info';

type AlertMessage = {
  id: string;
  title?: string;
  description?: string;
  type: AlertType;
};

type AlertInput = {
  title?: string;
  description?: string;
  type?: AlertType;
};

type AlertContextValue = {
  notify: (input: AlertInput) => void;
  showAlert: (message: string, type?: AlertType, title?: string) => void;
  removeAlert: (id: string) => void;
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((input: AlertInput) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
    const alert: AlertMessage = {
      id,
      title: input.title,
      description: input.description,
      type: input.type || 'info',
    };
    setAlerts((prev) => [...prev, alert]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  }, []);

  const showAlert = useCallback(
    (message: string, type: AlertType = 'info', title?: string) => {
      notify({
        title,
        description: message,
        type,
      });
    },
    [notify],
  );

  const contextValue = useMemo(() => ({ notify, showAlert, removeAlert }), [notify, showAlert, removeAlert]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alerts.length > 0 && typeof document !== 'undefined'
        ? createPortal(
            <>
              <style>{`
                @keyframes toastSlideIn {
                  0% { transform: translateY(-12px) scale(0.96); opacity: 0; }
                  100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                .tc-toast-card {
                  animation: toastSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
              `}</style>
              <div
                aria-live="polite"
                className="pointer-events-none fixed right-4 top-5 z-[99999] flex w-full max-w-sm flex-col gap-2.5 sm:right-6 sm:top-6"
              >
                {alerts.map((alert) => {
                  const isSuccess = alert.type === 'success';
                  const isError = alert.type === 'error';
                  const borderColor = isSuccess
                    ? 'border-l-emerald-500'
                    : isError
                    ? 'border-l-rose-500'
                    : 'border-l-[#8a0e16]';

                  return (
                    <div
                      key={alert.id}
                      role="alert"
                      className={`tc-toast-card pointer-events-auto relative flex items-start gap-3.5 rounded-xl border border-neutral-200 border-l-[5px] ${borderColor} bg-white p-4 text-neutral-900 shadow-[0_12px_36px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,0,0,0.08)] dark:border-neutral-700/80 dark:bg-[#1e1e22] dark:text-white dark:shadow-[0_16px_40px_rgba(0,0,0,0.65)]`}
                      style={{ opacity: 1 }}
                    >
                      {/* Status Icon */}
                      <div
                        className={`shrink-0 rounded-full p-2 ${
                          isSuccess
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                            : isError
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                            : 'bg-red-100 text-[#8a0e16] dark:bg-red-950/80 dark:text-red-400'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                        ) : isError ? (
                          <AlertCircle className="h-4 w-4 stroke-[2.5]" />
                        ) : (
                          <Info className="h-4 w-4 stroke-[2.5]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider ${
                              isSuccess
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : isError
                                ? 'text-rose-700 dark:text-rose-400'
                                : 'text-[#8a0e16] dark:text-red-400'
                            }`}
                          >
                            {isSuccess ? 'Success' : isError ? 'Error' : 'Notice'}
                          </span>
                        </div>

                        {alert.title && (
                          <p className="mt-0.5 text-sm font-bold leading-tight text-neutral-900 dark:text-white">
                            {alert.title}
                          </p>
                        )}
                        {alert.description && (
                          <p className="mt-1 text-xs font-semibold leading-relaxed text-neutral-600 dark:text-neutral-300 break-words">
                            {alert.description}
                          </p>
                        )}
                      </div>

                      {/* Dismiss Button */}
                      <button
                        type="button"
                        onClick={() => removeAlert(alert.id)}
                        aria-label="Close notification"
                        className="shrink-0 -mr-1 -mt-1 rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                      >
                        <X className="h-4 w-4 stroke-[2.2]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>,
            document.body,
          )
        : null}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return ctx;
}
