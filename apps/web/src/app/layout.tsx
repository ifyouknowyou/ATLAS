import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'ATLAS — Intelligence Platform',
    template: '%s · ATLAS',
  },
  description:
    'ATLAS — AI Intelligence & Investigation Platform for authorized investigations and research.',
};

export const viewport: Viewport = {
  themeColor: '#04070c',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}