'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
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
    <div className="mx-auto max-w-md rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-muted)]">Join</p>
      <h1 className="headline text-3xl font-extrabold">Create an account</h1>
      <p className="text-sm text-[var(--color-muted)]">Readers become contributors in seconds.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full py-3 text-base font-bold">
          Create account
        </Button>
      </form>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        Have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-[var(--color-accent)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
