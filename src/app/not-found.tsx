'use client';

import { useLanguage } from '@/contexts/language-context';
import { SiteShell } from '@/components/layout/SiteShell';
import { ComingSoon } from '@/components/states/ComingSoon';

export default function NotFound() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <SiteShell>
      <ComingSoon
        title={isBn ? 'পৃষ্ঠাটি পাওয়া যাচ্ছে না' : 'Page not found'}
        description={
          isBn
            ? 'আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি বিদ্যমান নেই বা সরানো হয়েছে। হোমপেজে ফিরে যান।'
            : "The page you are looking for doesn't exist or has been moved. Head back to the homepage."
        }
      />
    </SiteShell>
  );
}
