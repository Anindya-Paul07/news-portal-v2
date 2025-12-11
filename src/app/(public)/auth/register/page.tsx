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

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError(null);
      await register(form);
      router.push('/');
    } catch {
      setError('Registration failed. Please verify your details.');
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{ maxWidth: 440, mx: 'auto', p: 4, borderRadius: 3, boxShadow: 4, bgcolor: 'background.paper' }}
    >
      <Stack spacing={0.5}>
        <Typography variant="overline" sx={{ letterSpacing: 3, color: 'text.secondary' }}>
          Join
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Create an account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Readers become contributors in seconds.
        </Typography>
      </Stack>
      <Stack component="form" onSubmit={onSubmit} spacing={2} mt={3}>
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
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
          Create account
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Have an account?{' '}
        <Link href="/auth/login" style={{ fontWeight: 700, color: 'inherit' }}>
          Sign in
        </Link>
      </Typography>
    </Paper>
  );
}
