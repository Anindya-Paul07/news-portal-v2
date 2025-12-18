'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import type { Role } from '@/lib/types';

type ProtectedRouteOptions = {
  redirectTo?: string;
  allowedRoles?: Role[];
  forbiddenTo?: string;
};

export function useProtectedRoute(pathOrOptions: string | ProtectedRouteOptions = '/auth/login') {
  const { status, user } = useAuth();
  const router = useRouter();

  const options: ProtectedRouteOptions =
    typeof pathOrOptions === 'string' ? { redirectTo: pathOrOptions } : pathOrOptions;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(options.redirectTo ?? '/auth/login');
    }
    if (status === 'authenticated' && options.allowedRoles && user?.role) {
      if (!options.allowedRoles.includes(user.role)) {
        router.replace(options.forbiddenTo ?? '/');
      }
    }
  }, [options.allowedRoles, options.forbiddenTo, options.redirectTo, router, status, user?.role]);

  return status;
}
