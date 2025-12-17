'use client';
import Box, { BoxProps } from '@mui/material/Box';
import Container, { ContainerProps } from '@mui/material/Container';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

type SiteShellProps = {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  disableMainContainer?: boolean;
  containerProps?: ContainerProps;
  mainProps?: BoxProps;
};

export function SiteShell({
  children,
  showHeader = true,
  showFooter = true,
  disableMainContainer = false,
  containerProps,
  mainProps,
}: SiteShellProps) {
  const { sx: containerSx, ...restContainer } = containerProps || {};
  const { sx: mainSx, ...restMain } = mainProps || {};

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {showHeader && <Header />}
      {disableMainContainer ? (
        <Box component="main" sx={{ flex: 1, width: '100%', ...mainSx }} {...restMain}>
          {children}
        </Box>
      ) : (
        <Container
          component="main"
          maxWidth="xl"
          sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 }, flex: 1, ...containerSx }}
          {...restContainer}
        >
          {children}
        </Container>
      )}
      {showFooter && <Footer />}
    </Box>
  );
}
