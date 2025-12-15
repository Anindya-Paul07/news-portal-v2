import { SiteShell } from '@/components/layout/SiteShell';
import { ComingSoon } from '@/components/states/ComingSoon';

export default function NotFound() {
  return (
    <SiteShell>
      <ComingSoon
        title="This page is coming soon"
        description="The page you are trying to open is not yet available. We are working on it—check back soon or navigate to the homepage."
      />
    </SiteShell>
  );
}
