'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { type AdminArea, canAccessAdminArea, getAdminLandingRoute } from '@/lib/rbac';

export function useAdminAreaGuard(area: AdminArea) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (canAccessAdminArea(user?.role, area)) return;
    router.replace(getAdminLandingRoute(user?.role));
  }, [area, router, status, user?.role]);
}

