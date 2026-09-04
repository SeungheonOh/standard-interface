import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ataxia — Standard Interfaces',
  description:
    'A live, programmable desktop for people and agents. Change your workspace, build your tools, and redefine the interface while you use it.',
  metadataBase: new URL('https://standard-interface.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Ataxia — Standard Interfaces',
    description:
      'A computer for you. And your agents. A live, programmable desktop built in Common Lisp.',
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
