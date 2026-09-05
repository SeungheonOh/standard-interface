import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Standard Interface',
  description: 'Building a standard interface for humans and AI.',
  metadataBase: new URL('https://standard-interface.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Standard Interface',
    description: 'Building a standard interface for humans and AI.',
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
