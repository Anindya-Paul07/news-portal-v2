'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import type { Role } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const allowedRoles: Role[] = ['super_admin', 'admin', 'editorial', 'journalist'];
  useProtectedRoute({ redirectTo: '/auth/login', allowedRoles, forbiddenTo: '/' });
  return children;
}
