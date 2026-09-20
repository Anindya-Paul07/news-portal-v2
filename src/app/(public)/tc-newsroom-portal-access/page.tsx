import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NewsroomAccessPortalClient } from '@/components/auth/NewsroomAccessPortalClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Newsroom Gateway | The Contemporary',
  description: 'Authorized personnel access gateway for The Contemporary editorial and administration systems.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
  },
};

export default function NewsroomAccessPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#8a0e16]" />
        </div>
      }
    >
      <NewsroomAccessPortalClient />
    </Suspense>
  );
}
