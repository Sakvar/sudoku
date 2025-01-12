import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Script from "next/script";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppWrapper className={`${geistSans.variable} ${geistMono.variable}`}>
      <Script 
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      {children}
    </AppWrapper>
  );
}
