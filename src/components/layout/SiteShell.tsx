import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function SiteShell({ children }: { children: React.ReactNode }) {
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
      <Header />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, flex: 1 }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
}
