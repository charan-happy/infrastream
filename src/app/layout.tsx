import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { ServiceStatus } from '@/components/ServiceStatus';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'InfraStream | Real-time DevOps Intelligence',
  description: 'Real-time DevOps event intelligence platform powered by Aiven Kafka, PostgreSQL, and Valkey',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-950 font-sans text-white antialiased`}
      >
        <Sidebar />
        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 pl-14 lg:pl-8 lg:px-8 backdrop-blur">
            <div />
            <ServiceStatus />
          </header>
          <main className="p-4 lg:p-8">{children}</main>
          <footer className="border-t border-zinc-800 px-4 lg:px-8 py-4 text-center text-xs text-zinc-600">
            Built with{' '}
            <span className="text-red-500">&#10084;</span>{' '}
            by{' '}
            <a
              href="https://www.linkedin.com/in/nagacharan-g/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Nagacharan
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
}
