'use client';

import { useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/auth-context';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export default function ProfilePage() {
  const status = useProtectedRoute();
  const { user, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current: '', next: '' });
  const [message, setMessage] = useState<string | null>(null);

  if (status === 'loading' || status === 'idle') {
    return <Typography color="text.secondary">Loading profile...</Typography>;
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Profile
            </Typography>
            <Input
              label="Name"
              value={profile.name}
              onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="Email"
              value={profile.email}
              onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
            />
            <Button
              onClick={async () => {
                await updateProfile(profile);
                setMessage('Profile updated');
              }}
            >
              Save profile
            </Button>
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
          <Stack spacing={1.5}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Change password
            </Typography>
            <Input
              label="Current password"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
            />
            <Input
              label="New password"
              type="password"
              value={passwords.next}
              onChange={(e) => setPasswords((prev) => ({ ...prev, next: e.target.value }))}
            />
            <Button
              variant="outline"
              onClick={async () => {
                await changePassword(passwords.current, passwords.next);
                setMessage('Password updated');
                setPasswords({ current: '', next: '' });
              }}
            >
              Update password
            </Button>
          </Stack>
        </Paper>
      </Grid>

      {message && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" sx={{ color: 'warning.main' }}>
            {message}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}
