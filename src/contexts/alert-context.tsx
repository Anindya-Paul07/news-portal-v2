'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

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
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const notify = useCallback((input: AlertInput) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const alert: AlertMessage = {
      id,
      title: input.title,
      description: input.description,
      type: input.type || 'info',
    };
    setAlerts((prev) => [...prev, alert]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const contextValue = useMemo(() => ({ notify }), [notify]);

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {alerts.length > 0 && typeof document !== 'undefined'
        ? createPortal(
            <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-full max-w-xs flex-col gap-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="pointer-events-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-xl shadow-[rgba(0,0,0,0.18)]"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                    {alert.type === 'success' && 'Success'}
                    {alert.type === 'error' && 'Error'}
                    {alert.type === 'info' && 'Notice'}
                  </div>
                  {alert.title && <p className="headline text-lg font-bold text-[var(--color-ink)]">{alert.title}</p>}
                  {alert.description && <p className="text-sm text-[var(--color-muted)]">{alert.description}</p>}
                </div>
              ))}
            </div>,
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
