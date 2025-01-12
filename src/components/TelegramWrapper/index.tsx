"use client"
import React, { useEffect, useState } from 'react';
import GameWrapper from '../GameWrapper';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        isExpanded: boolean;
        close: () => void;
      };
    };
  }
}

export default function TelegramWrapper() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const isTelegramWebApp = window.Telegram?.WebApp;
    
    if (isTelegramWebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Telegram WebApp:', error);
        setIsReady(true);
      }
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-container">
      <GameWrapper />
    </div>
  );
} 