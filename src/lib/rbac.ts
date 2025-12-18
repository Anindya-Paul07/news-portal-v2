import type { Role } from '@/lib/types';

export type AdminArea = 'dashboard' | 'articles' | 'categories' | 'ads' | 'media' | 'users' | 'settings';

export function isEditorRole(role: Role | null | undefined) {
  return role === 'editorial' || role === 'journalist';
}

export function canAccessAdmin(role: Role | null | undefined) {
  return role === 'super_admin' || role === 'admin' || isEditorRole(role);
}

export function getAdminLandingRoute(role: Role | null | undefined) {
  if (!role) return '/admin';
  if (isEditorRole(role)) return '/admin/articles';
  if (role === 'admin' || role === 'super_admin') return '/admin';
  return '/';
}

export function canAccessAdminArea(role: Role | null | undefined, area: AdminArea) {
  if (!role) return false;
  if (role === 'super_admin') return true;
  if (role === 'admin') return area !== 'users';
  if (isEditorRole(role)) return area === 'articles' || area === 'settings';
  return false;
}

export function canDeleteArticle(role: Role | null | undefined) {
  return role === 'super_admin' || role === 'admin';
}

export function canManageUsers(role: Role | null | undefined) {
  return role === 'super_admin';
}

