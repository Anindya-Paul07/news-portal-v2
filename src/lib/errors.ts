'use client';

type ErrorContext =
  | 'default'
  | 'login'
  | 'register'
  | 'profile'
  | 'password'
  | 'article-save'
  | 'article-delete'
  | 'category-save'
  | 'category-delete'
  | 'ad-save'
  | 'ad-delete'
  | 'user-save'
  | 'user-delete'
  | 'media-upload'
  | 'media-update'
  | 'media-delete'
  | 'fetch';

type ApiErrorLike = {
  status?: number;
  message?: string;
  userMessage?: string;
  details?: unknown;
};

const DEFAULT_MESSAGES: Record<ErrorContext, string> = {
  default: 'Something went wrong. Please try again.',
  login: 'Unable to sign you in right now. Check your email and password and try again.',
  register: 'Unable to create your account right now. Please review your details and try again.',
  profile: 'We could not update your profile right now. Please try again.',
  password: 'We could not update your password right now. Please try again.',
  'article-save': 'We could not save the article right now. Please review the form and try again.',
  'article-delete': 'We could not delete the article right now. Please try again.',
  'category-save': 'We could not save the category right now. Please try again.',
  'category-delete': 'We could not delete the category right now. Remove linked content first or try again later.',
  'ad-save': 'We could not save the advertisement right now. Please try again.',
  'ad-delete': 'We could not delete the advertisement right now. Please try again.',
  'user-save': 'We could not save the user right now. Please try again.',
  'user-delete': 'We could not delete the user right now. Please try again.',
  'media-upload': 'We could not upload the file right now. Please try again.',
  'media-update': 'We could not update the media details right now. Please try again.',
  'media-delete': 'We could not delete the media item right now. Please try again.',
  fetch: 'We could not load this data right now. Please refresh and try again.',
};

const SENSITIVE_PATTERNS = [
  /<!doctype html/i,
  /<html/i,
  /\bexception\b/i,
  /\bstack\b/i,
  /\bsyntaxerror\b/i,
  /\breferenceerror\b/i,
  /\bat\s.+\(.+\)/i,
  /^\s*\{[\s\S]*\}\s*$/,
];

const FRIENDLY_BACKEND_MESSAGES: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /invalid credentials|incorrect password|wrong password/i, message: DEFAULT_MESSAGES.login },
  { pattern: /unauthorized|forbidden|token|jwt|session expired|not authenticated/i, message: 'Your session has expired. Please sign in again.' },
  { pattern: /networkerror|failed to fetch|load failed/i, message: 'Cannot reach the server right now. Check your connection and try again.' },
  { pattern: /email.*already/i, message: 'This email address is already in use. Try signing in instead.' },
  { pattern: /slug.*already|duplicate key/i, message: 'This slug is already in use. Please choose a different one.' },
  { pattern: /category.*referenc|subcategor|linked article/i, message: 'This category still has linked content and cannot be deleted yet.' },
];

export class AppError extends Error {
  status?: number;
  userMessage: string;
  details?: unknown;

  constructor(message: string, options?: { status?: number; userMessage?: string; details?: unknown }) {
    super(message);
    this.name = 'AppError';
    this.status = options?.status;
    this.userMessage = options?.userMessage || message;
    this.details = options?.details;
  }
}

function tryParseJson(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
  return null;
}

function extractRawMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error.trim();
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message?.trim();
  if (typeof error === 'object' && 'message' in error && typeof (error as ApiErrorLike).message === 'string') {
    return (error as ApiErrorLike).message?.trim();
  }
  return undefined;
}

function sanitizeMessage(message?: string): string | null {
  if (!message) return null;

  const parsed = tryParseJson(message);
  const candidate = parsed && typeof parsed.message === 'string' ? parsed.message.trim() : message.trim();
  if (!candidate) return null;
  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(candidate))) return null;

  const normalized = candidate.replace(/\s+/g, ' ').trim();
  if (normalized.length < 6 || normalized.length > 180) return null;
  return normalized;
}

function mapFriendlyMessage(message: string, fallback: string) {
  const matched = FRIENDLY_BACKEND_MESSAGES.find((item) => item.pattern.test(message));
  return matched?.message || message || fallback;
}

export function getDisplayErrorMessage(error: unknown, context: ErrorContext = 'default') {
  const fallback = DEFAULT_MESSAGES[context];

  if (error instanceof AppError) {
    return mapFriendlyMessage(error.userMessage, fallback);
  }

  if (typeof error === 'object' && error && 'userMessage' in error && typeof (error as ApiErrorLike).userMessage === 'string') {
    return mapFriendlyMessage((error as ApiErrorLike).userMessage as string, fallback);
  }

  const sanitized = sanitizeMessage(extractRawMessage(error));
  return sanitized ? mapFriendlyMessage(sanitized, fallback) : fallback;
}
