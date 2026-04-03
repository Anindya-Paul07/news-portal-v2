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
import { useAdminAreaGuard } from '@/hooks/useAdminAreaGuard';

export default function SettingsPage() {
  useAdminAreaGuard('settings');
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
      <Card 
        elevation={6}
        sx={{ 
          borderRadius: 4, 
          maxWidth: 520,
          overflow: 'hidden',
          border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,107,129,0.15)' : 'rgba(226,24,55,0.12)'}`,
        }}
      >
        <CardHeader 
          title="🔐 Password Security" 
          subheader="Keep your backoffice secure."
          sx={{
            background: (theme) => 
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(255,107,129,0.08) 100%)`
                : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(226,24,55,0.04) 100%)`,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            '& .MuiCardHeader-title': {
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: 0.5,
            },
            '& .MuiCardHeader-subheader': {
              fontStyle: 'italic',
              mt: 0.5,
            },
          }}
        />
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack component="form" spacing={3} onSubmit={onSubmit}>
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
            <Button 
              type="submit" 
              sx={{ 
                alignSelf: 'flex-start',
                px: 4,
                py: 1.5,
                fontWeight: 800,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                },
              }}
            >
              🔒 Update password
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
