import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { NotificationBell } from './NotificationBell';

jest.mock('@/lib/realtime-store', () => ({
  useRealtimeStore: (selector: (s: { unreadCount: number }) => unknown) =>
    selector({ unreadCount: 3 }),
}));

jest.mock('@/lib/queries', () => ({
  useUnreadCount: () => ({ data: 3 }),
}));

jest.mock('next/link', () => {
  const Link = ({ children, href, 'aria-label': ariaLabel }: {
    children: React.ReactNode;
    href: string;
    'aria-label'?: string;
  }) => <a href={href} aria-label={ariaLabel}>{children}</a>;
  return Link;
});

describe('NotificationBell', () => {
  it('shows the unread badge count', () => {
    render(<NotificationBell />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('links to the notification center', () => {
    render(<NotificationBell />);
    expect(screen.getByRole('link', { name: /Notifications.*3 unread/ })).toBeTruthy();
  });
});
