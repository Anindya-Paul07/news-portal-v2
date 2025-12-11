'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError(null);
      await login(form);
      router.push('/');
    } catch {
      setError('Login failed. Please verify your details.');
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{ maxWidth: 420, mx: 'auto', p: 4, borderRadius: 3, boxShadow: 4, bgcolor: 'background.paper' }}
    >
      <Stack spacing={0.5}>
        <Typography variant="overline" sx={{ letterSpacing: 3, color: 'text.secondary' }}>
          Access
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your newsroom credentials.
        </Typography>
      </Stack>
      <Stack component="form" onSubmit={onSubmit} spacing={2} mt={3}>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        <Button type="submit" sx={{ py: 1.2, fontWeight: 800 }}>
          Sign in
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        No account?{' '}
        <Link href="/auth/register" style={{ fontWeight: 700, color: 'inherit' }}>
          Create one
        </Link>
      </Typography>
    </Paper>
  );
}
