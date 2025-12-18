'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type RouteTransitionContextValue = {
  isNavigating: boolean;
  startNavigation: (href?: string) => void;
  finishNavigation: () => void;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

export function RouteTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const lastPathnameRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const finishNavigation = useCallback(() => {
    setIsNavigating(false);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startNavigation = useCallback(
    (href?: string) => {
      setIsNavigating(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setIsNavigating(false), 8000);
      if (href) router.push(href);
    },
    [router],
  );

  useEffect(() => {
    if (lastPathnameRef.current === null) {
      lastPathnameRef.current = pathname;
      return;
    }
    if (pathname !== lastPathnameRef.current) {
      lastPathnameRef.current = pathname;
      queueMicrotask(finishNavigation);
    }
  }, [finishNavigation, pathname]);

  useEffect(() => () => finishNavigation(), [finishNavigation]);

  const value = useMemo(
    () => ({
      isNavigating,
      startNavigation,
      finishNavigation,
    }),
    [finishNavigation, isNavigating, startNavigation],
  );

  return <RouteTransitionContext.Provider value={value}>{children}</RouteTransitionContext.Provider>;
}

export function useRouteTransition() {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) throw new Error('useRouteTransition must be used within RouteTransitionProvider');
  return ctx;
}
