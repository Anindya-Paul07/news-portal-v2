import type { Role } from './types';

const roleLabels: Record<Role, { en: string; bn: string }> = {
  super_admin: { en: 'Super Admin', bn: 'সুপার অ্যাডমিন' },
  admin: { en: 'Admin', bn: 'অ্যাডমিন' },
  editorial: { en: 'Editorial', bn: 'সম্পাদনা বিভাগ' },
};

export function getAuthorRoleLabel(role: Role | undefined, language: 'en' | 'bn') {
  const labels = (role && roleLabels[role]) || { en: 'Staff Correspondent', bn: 'নিজস্ব প্রতিবেদক' };
  return labels[language];
}
