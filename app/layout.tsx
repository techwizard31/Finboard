import type { Metadata } from 'next';
import { Oxanium } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const oxanium = Oxanium({ 
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'FinBoard - Customizable Finance Dashboard',
  description: 'Build your own real-time finance monitoring dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={oxanium.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}