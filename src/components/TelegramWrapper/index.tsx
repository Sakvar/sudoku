"use client"
import { useEffect } from 'react';
import GameWrapper from '../GameWrapper';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

export default function TelegramWrapper() {
  useEffect(() => {
    // Initialize Telegram Web App
    if (window.Telegram) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <div className="telegram-app">
      <GameWrapper />
    </div>
  );
} 