'use client';

import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AdminShell } from '@/components/layout/AdminShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/auth-context';
import { ErrorState } from '@/components/states/ErrorState';

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
      <Card sx={{ borderRadius: 3, boxShadow: 4, maxWidth: 520 }}>
        <CardHeader title="Password" subheader="Keep your backoffice secure." />
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
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
            <Button type="submit" sx={{ alignSelf: 'flex-start' }}>
              Update password
            </Button>
            {status === 'success' && (
              <Typography variant="body2" color="success.main">
                {message}
              </Typography>
            )}
            {status === 'error' && <ErrorState title={message} />}
          </Stack>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
