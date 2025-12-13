import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'N',
    template: `%s | N`,
  },
  description: 'Build an app',
  keywords: ['nextjs', 'react', 'typescript'],
  authors: [{ name: 'Agent Battalion' }],
  creator: 'Agent Battalion',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'N',
    description: 'Build an app',
    siteName: 'N',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'N',
    description: 'Build an app',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}