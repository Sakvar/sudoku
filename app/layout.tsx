import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import AppWrapper from '@/components/AppWrapper';

const geistSans = localFont({
  src: [
    {
      path: '../public/fonts/GeistVF.woff',
      weight: '100 900',
      style: 'normal',
    }
  ],
  variable: '--font-geist-sans',
});

const geistMono = localFont({
  src: [
    {
      path: '../public/fonts/GeistMonoVF.woff',
      weight: '100 900',
      style: 'normal',
    }
  ],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: "Sudoku",
  description: "Sudoku game for Telegram",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  viewportFit: 'cover',
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  console.log("Process.env: ", JSON.stringify(process.env)); // This logs on the server during build/runtime
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <GoogleAnalytics />
        {process.env.NEXT_PUBLIC_TELEGRAM_WEBAPP === 'true' && (
          <Script 
            src="https://telegram.org/js/telegram-web-app.js"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="antialiased">
        <AppWrapper className={`${geistSans.variable} ${geistMono.variable}`}>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
