'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  LogIn,
  LogOut,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { getAdminLandingRoute, canAccessAdmin } from '@/lib/rbac';

export function NewsroomAccessPortalClient() {
  const { user, status, login, logout } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated and authorized, provide instant feedback
  const isStaff = canAccessAdmin(user?.role);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      
      // Post login navigation
      if (redirectParam) {
        router.push(redirectParam);
      } else {
        router.push('/admin');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isBn
          ? 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে ইমেল এবং পাসওয়ার্ড যাচাই করুন।'
          : 'Authentication failed. Please verify your credentials or contact the editorial administrator.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Background ambient decoration */}
      <div className="w-full max-w-md">
        <div className="relative bg-[var(--newsos-bg-primary)] dark:bg-[#18181b] rounded-2xl border border-[var(--newsos-border-default)] dark:border-[#27272a] shadow-2xl overflow-hidden transition-all duration-300">
          
          {/* Top Brand Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#8a0e16] via-[#b91c1c] to-[#8a0e16]" />

          <div className="p-6 sm:p-8">
            {/* Header / Security Badge */}
            <div className="flex flex-col items-center text-center">
              {/* Logo */}
              <div className="mb-3 relative w-12 h-12 rounded-xl overflow-hidden border border-[var(--newsos-border-default)] shadow-sm">
                <Image
                  src="/Logo_Canva.jpg"
                  alt="The Contemporary Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <h1 className="text-2xl font-bold font-serif text-[var(--newsos-text-primary)] dark:text-zinc-100 tracking-tight">
                {isBn ? 'দ্য কনটেম্পোরারি' : 'The Contemporary'}
              </h1>
              <p className="text-xs font-medium uppercase tracking-widest text-[#8a0e16] dark:text-[#f87171] mt-0.5">
                {isBn ? 'নিউজরুম ও প্রশাসন প্রবেশদ্বার' : 'Newsroom & Editorial Gateway'}
              </p>
             
            </div>

            {/* If user is already logged in */}
            {status === 'authenticated' && user ? (
              <div className="mt-6 p-4 rounded-xl bg-[var(--newsos-bg-secondary)] dark:bg-[#202023] border border-[var(--newsos-border-default)] dark:border-[#2f2f35]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8a0e16] text-white flex items-center justify-center font-bold text-sm">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-[var(--newsos-text-primary)] dark:text-zinc-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-[var(--newsos-text-tertiary)] dark:text-zinc-400 truncate">
                      {user.email}
                    </p>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#8a0e16]/10 text-[#8a0e16] dark:bg-[#8a0e16]/30 dark:text-[#f87171]">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{user.role}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => router.push(getAdminLandingRoute(user.role))}
                    className="w-full py-2.5 px-4 bg-[#8a0e16] hover:bg-[#720a11] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>{isBn ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'Proceed to Admin Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full py-2 px-4 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[var(--newsos-text-secondary)] dark:text-zinc-400 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isBn ? 'অন্য অ্যাকাউন্ট দিয়ে লগইন করুন' : 'Switch / Sign out'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Login Form */
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                    <p className="leading-relaxed">{errorMsg}</p>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="staff-email"
                    className="block text-xs font-semibold text-[var(--newsos-text-secondary)] dark:text-zinc-300 uppercase tracking-wider mb-1.5"
                  >
                    {isBn ? 'স্টাফ ইমেল' : 'Staff Email Address'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="staff-email"
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="editor@thecontemporary.news"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-[var(--newsos-bg-secondary)] dark:bg-[#1f1f23] border border-[var(--newsos-border-default)] dark:border-[#2f2f35] text-[var(--newsos-text-primary)] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#8a0e16] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="staff-password"
                    className="block text-xs font-semibold text-[var(--newsos-text-secondary)] dark:text-zinc-300 uppercase tracking-wider mb-1.5"
                  >
                    {isBn ? 'পাসওয়ার্ড' : 'Security Password'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="staff-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-[var(--newsos-bg-secondary)] dark:bg-[#1f1f23] border border-[var(--newsos-border-default)] dark:border-[#2f2f35] text-[var(--newsos-text-primary)] dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#8a0e16] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 bg-[#8a0e16] hover:bg-[#720a11] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Authenticating...'}</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{isBn ? 'পোর্টাল প্রবেশ করুন' : 'Sign in to Newsroom'}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Disclaimer */}
            <div className="mt-8 pt-5 border-t border-[var(--newsos-border-default)] dark:border-[#27272a] text-center">
              <p className="text-[11px] leading-relaxed text-[var(--newsos-text-tertiary)] dark:text-zinc-500">
                {isBn
                  ? 'নিরাপত্তা বিজ্ঞপ্তি: এই পোর্টালটি কেবল অনুমোদিত কর্মীদের জন্য সংরক্ষিত। সর্বজনীন ব্যবহারকারী এখানে লগইন করতে পারবেন না।'
                  : 'Security Notice: This portal is strictly restricted to authorized staff. General public accounts cannot authenticate through this gateway.'}
              </p>

              <div className="mt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a0e16] dark:text-[#f87171] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isBn ? 'মূল ওয়েবসাইটে ফিরে যান' : 'Return to Public Newspaper'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
