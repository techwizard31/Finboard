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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('finboard-theme');
                if (theme) {
                  const { state } = JSON.parse(theme);
                  if (state && state.theme) {
                    document.documentElement.classList.add(state.theme);
                  }
                } else {
                  document.documentElement.classList.add('light');
                }
              } catch (e) {
                document.documentElement.classList.add('light');
              }
            `,
          }}
        />
      </head>
      <body className={oxanium.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}