import { notFound } from 'next/navigation';

export default function LoginPage() {
  // Public login route is disabled for security.
  // Internal staff must use the dedicated access portal.
  notFound();
}
