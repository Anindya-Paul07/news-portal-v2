'use client';

import { useState } from 'react';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/auth-context';

export default function SettingsPage() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('New password does not match confirmation.');
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setStatus('success');
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to update password.');
    }
  };

  return (
    <AdminShell title="Security" description="Update your backoffice password.">
      <form className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5" onSubmit={onSubmit}>
        <Input
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          label="New password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-fit">
          Update password
        </Button>
        {status !== 'idle' && (
          <p className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
        )}
      </form>
    </AdminShell>
  );
}
