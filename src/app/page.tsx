import { SiteShell } from '@/components/layout/SiteShell';
import PublicPage from './(public)/page';

export default function RootPage() {
  return (
    <SiteShell disableMainContainer>
      <PublicPage />
    </SiteShell>
  );
}
