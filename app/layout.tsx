import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';

export const dynamic = 'force-dynamic';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Apoema',
  description: 'Apoema - ERP',
  creator: 'Grupo Ativa TI e Michael Duarte',
  authors: [
    {
      name: 'Michael Duarte',
      url: 'https://www.linkedin.com/in/michaeldu4rte/',
    },
    {
      name: 'Mateus Lair',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <TooltipProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
