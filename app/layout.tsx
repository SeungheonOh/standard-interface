import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ataxia — Standard Interfaces',
  description:
    'A programmable interface for people and agents. Define your own world—tiling, scrolling, or your own geometry—and change it while it runs.',
  metadataBase: new URL('https://standard-interface.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Ataxia — Standard Interfaces',
    description:
      'An interface for you. And your agents. A live, programmable Wayland compositor built in Common Lisp.',
    type: 'website',
    url: 'https://standard-interface.com',
    siteName: 'Standard Interfaces',
  },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
