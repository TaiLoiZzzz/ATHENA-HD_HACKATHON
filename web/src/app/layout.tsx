import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { RankingThemeProvider } from '@/components/Ranking/ThemeProvider';
import './globals.css';
import '@/styles/ranking-theme.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ATHENA Platform - Super-App Micro-Economy',
  description: 'Transform your rewards into tradable SOV-Tokens with ATHENA Platform by Sovico Group',
  keywords: 'ATHENA, SOV-Token, blockchain, rewards, Vietjet, HDBank, Sovico Group',
  authors: [{ name: 'Sovico Group' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1B365D',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ATHENA Platform',
    description: 'Super-App Micro-Economy Ecosystem',
    type: 'website',
    locale: 'en_US',
    siteName: 'ATHENA Platform',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <AuthProvider>
          <RankingThemeProvider>
            {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                borderRadius: '0.5rem',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          </RankingThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

