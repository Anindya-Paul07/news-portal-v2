import { SiteShell } from '@/components/layout/SiteShell';
import { ComingSoon } from '@/components/states/ComingSoon';

export default function ComingSoonPage() {
  return (
    <SiteShell>
      <ComingSoon
        title="New experience launching soon"
        description="We are preparing this section of The Contemporary for prime time. In the meantime, continue exploring the latest stories from the newsroom."
      />
    </SiteShell>
  );
}
