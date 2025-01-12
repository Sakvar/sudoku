"use client"
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const TelegramWrapper = dynamic(
  () => import('../TelegramWrapper'),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function TelegramContainer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp after mount
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="telegram-app">
      <TelegramWrapper />
    </div>
  );
} 