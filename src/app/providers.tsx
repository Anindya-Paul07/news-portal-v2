'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider } from '@/contexts/theme-context';
import { AuthProvider } from '@/contexts/auth-context';
import { LanguageProvider } from '@/contexts/language-context';
import { AlertProvider } from '@/contexts/alert-context';
import { useThemeMode } from '@/contexts/theme-context';
import { getTheme } from '@/theme';

function ThemeBridge({ children }: { children: ReactNode }) {
  const { theme } = useThemeMode();
  const muiTheme = getTheme(theme === 'dark' ? 'dark' : 'light');
  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <ThemeBridge>
          <AlertProvider>
            <LanguageProvider>
              <AuthProvider>{children}</AuthProvider>
            </LanguageProvider>
          </AlertProvider>
        </ThemeBridge>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
