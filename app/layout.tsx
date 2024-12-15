import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SwitchContextProvider } from '@/context/SwitchContext';
import { AuthProvider } from '@/context/AuthContext';
<<<<<<< HEAD
=======
import { CurrentDocumentProvider } from '@/context/AppContext';
import { CurrentResourceProvider } from '@/context/AppContext';
>>>>>>> 3c333ed (Fix linting errors and proceed with force push)

// TODO: Replace this with the fonts that designers provide.
const geistSans = localFont({
  src: './fonts/Geist-Regular.woff',
  variable: '--font-geist-sans',
  weight: '400',
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'WDB Template',
  description: 'A template for WDB projects!',
=======
  title: 'Curiocity',
>>>>>>> 3c333ed (Fix linting errors and proceed with force push)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <AuthProvider>
        <SwitchContextProvider>
          <CurrentDocumentProvider>
            <CurrentResourceProvider>
              <body className={`${geistSans.variable} antialiased`}>
                {children}
              </body>
            </CurrentResourceProvider>
          </CurrentDocumentProvider>
        </SwitchContextProvider>
      </AuthProvider>
    </html>
  );
}
