import type { Metadata } from 'next';
import './globals.css';
import { ApolloAppProvider } from '@/lib/apollo-provider';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'CAMPVOX | Your Campus. Better, Every Day.',
  description:
    'CAMPVOX gives students, staff, and campus teams one clear place to report, track, and resolve concerns. Your Campus. Better, Every Day.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[#F7FCFC] text-[#123650] antialiased">
        <ApolloAppProvider>
          <AuthProvider>{children}</AuthProvider>
        </ApolloAppProvider>
      </body>
    </html>
  );
}
