import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@neondatabase/neon-js/ui/css';
import { AuthProvider } from '@/components/auth-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Orpheus AI | Intelligent Assistant',
  description: 'A minimalist AI chat experience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en" className={`dark ${inter.variable}`}>
        <body className="font-body antialiased selection:bg-primary/20 selection:text-primary">
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
