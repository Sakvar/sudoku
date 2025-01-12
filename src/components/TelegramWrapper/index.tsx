"use client"
import React, { useEffect, useState } from 'react';
import GameWrapper from '../GameWrapper';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
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
    const webApp = window.Telegram?.WebApp;
    
    if (webApp) {
      try {
        webApp.ready();
        webApp.expand();
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
    return <div className="loading">Loading...</div>;
  }

  return (
    <main className="game-container">
      <GameWrapper />
    </main>
  );
} 