'use client';

import { useState, type FormEvent } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSaveUser, useUsers } from '@/hooks/api-hooks';

export default function UsersPage() {
  const { data: users } = useUsers();
  const { mutateAsync: saveUser } = useSaveUser();
  const [draft, setDraft] = useState({ name: '', email: '', role: 'journalist', password: '' });
  const roles: Array<'super_admin' | 'admin' | 'journalist' | 'reader'> = [
    'super_admin',
    'admin',
    'journalist',
    'reader',
  ];

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await saveUser(draft);
    setDraft({ name: '', email: '', role: 'journalist', password: '' });
  };

  return (
    <AdminShell title="Users" description="Assign roles, toggle activation, and reset credentials.">
      <form className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-2 text-sm text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-ink)]">Role</span>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={draft.role === role ? 'primary' : 'outline'}
                  className="rounded-full px-3 py-1 text-xs"
                  onClick={() => setDraft((d) => ({ ...d, role }))}
                >
                  {role}
                </Button>
              ))}
            </div>
          </div>
          <Input
            label="Temp password"
            type="password"
            value={draft.password}
            onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
          />
        </div>
        <Button type="submit" className="w-fit">Save user</Button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[rgba(13,59,102,0.06)] text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-t border-[var(--color-border)]">
                <td className="px-4 py-3 font-semibold text-[var(--color-ink)]">{user.name}</td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{user.email}</td>
                <td className="px-4 py-3 text-[var(--color-primary)]">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
