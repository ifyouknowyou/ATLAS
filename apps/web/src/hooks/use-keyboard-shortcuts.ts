'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'k') return; // handled by Cmd+K command palette
      }

      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);

      if (isInput) return;

      switch (e.key.toLowerCase()) {
        case 'g':
          router.push('/graph');
          break;
        case 'm':
          router.push('/map');
          break;
        case 't':
          router.push('/timeline');
          break;
        case 'i':
          router.push('/intelligence');
          break;
        case 'a':
          router.push('/intelligence/alerts');
          break;
        case 'e':
          router.push('/evidence');
          break;
        case 'r':
          router.push('/reports');
          break;
        case '/':
          e.preventDefault();
          router.push('/search');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);
}