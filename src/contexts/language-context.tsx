'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SupportedLanguage = 'en' | 'bn';

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (next: SupportedLanguage) => void;
  toggleLanguage: () => void;
};

const STORAGE_KEY = 'newsportal:language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>('bn');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const normalized = stored.toLowerCase();
    if (normalized === 'en' || normalized === 'bn') {
      queueMicrotask(() => {
        setLanguage((current) => (current === normalized ? current : (normalized as SupportedLanguage)));
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (next: SupportedLanguage) => setLanguage(next),
      toggleLanguage: () => setLanguage((current) => (current === 'en' ? 'bn' : 'en')),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
