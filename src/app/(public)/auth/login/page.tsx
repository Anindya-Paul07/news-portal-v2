'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
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
    <div className="mx-auto max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-muted)]">Access</p>
      <h1 className="headline text-3xl font-extrabold">Welcome back</h1>
      <p className="text-sm text-[var(--color-muted)]">Enter your newsroom credentials.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full py-3 text-base font-bold">
          Sign in
        </Button>
      </form>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        No account?{' '}
        <Link href="/auth/register" className="font-semibold text-[var(--color-accent)]">
          Create one
        </Link>
      </p>
    </div>
  );
}
