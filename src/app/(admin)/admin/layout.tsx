'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import type { Role } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const allowedRoles: Role[] = ['super_admin', 'admin', 'editorial'];
  useProtectedRoute({ redirectTo: '/tc-newsroom-portal-access', allowedRoles, forbiddenTo: '/' });
  return children;
}
