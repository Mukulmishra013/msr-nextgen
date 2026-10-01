import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/Toast';
import { AGENCY_CONFIG } from '@/lib/config';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f6e56',
};

export const metadata: Metadata = {
  metadataBase: new URL(AGENCY_CONFIG.siteUrl),
  title: 'MSR Next Gen — Digital Marketing & 24/7 AI WhatsApp Agents for Indian Businesses',
  description:
    'Get more customers for your business with high-converting Meta & Google Ads and 24/7 AI WhatsApp chatbot agents. Built for ambitious Indian local businesses and D2C brands.',
  keywords: [
    'digital marketing agency India',
    'AI WhatsApp chatbot agent',
    'Meta ads for Indian businesses',
    'Google ads agency India',
    'D2C growth marketing',
    'MSR Next Gen',
    'lead generation agency',
  ],
  authors: [{ name: 'MSR Next Gen' }],
  creator: 'MSR Next Gen',
  publisher: 'MSR Next Gen',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: AGENCY_CONFIG.siteUrl,
    title: 'MSR Next Gen — High-Converting Ads & 24/7 AI WhatsApp Agents',
    description:
      'We run high-converting ad campaigns and deploy 24/7 AI WhatsApp agents that qualify leads and book customer orders automatically.',
    siteName: 'MSR Next Gen',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MSR Next Gen — Ads & AI That Actually Deliver Results',
    description:
      'Get more customers for your local business or D2C brand with proven ad funnels and automated WhatsApp customer booking.',
  },
  alternates: {
    canonical: AGENCY_CONFIG.siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-surface-50 text-slate-900 antialiased selection:bg-brand-600 selection:text-white">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
