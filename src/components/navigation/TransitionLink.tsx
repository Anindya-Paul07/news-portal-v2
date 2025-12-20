'use client';

import Link, { type LinkProps } from 'next/link';
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteTransition } from '@/contexts/route-transition-context';

type TransitionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    disableTransition?: boolean;
  };

const isModifiedEvent = (event: MouseEvent<HTMLAnchorElement>) =>
  event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || event.button !== 0;

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(function TransitionLink(
  { onClick, href, disableTransition, ...props },
  ref,
) {
  const router = useRouter();
  const { startNavigation } = useRouteTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (isModifiedEvent(event)) return;
    if (disableTransition) {
      startNavigation();
      return;
    }

    event.preventDefault();

    const hrefString = typeof href === 'string' ? href : href?.toString();
    startNavigation();

    startTransition(() => {
      const navigate = () => {
        if (hrefString) router.push(hrefString);
      };

      // View Transitions API (Chrome) for a premium feel.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const startViewTransition = (document as any).startViewTransition as undefined | ((cb: () => void) => void);
      if (startViewTransition) startViewTransition.call(document, navigate);
      else navigate();
    });
  };

  return <Link ref={ref} href={href} onClick={handleClick} {...props} />;
});
