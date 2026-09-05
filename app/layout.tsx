import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Standard Interface',
  description:
    'Ataxia is a Common Lisp Wayland compositor. Arrange windows, create tools, and change behavior while applications stay open.',
  metadataBase: new URL('https://standard-interface.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Standard Interface',
    description:
      'From disorder comes form. A Common Lisp Wayland compositor with agent access and runtime changes.',
    type: 'website',
    url: 'https://standard-interface.com',
    siteName: 'Standard Interface',
  },
  icons: { icon: '/brand/standard-interface-mark.svg' },
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
