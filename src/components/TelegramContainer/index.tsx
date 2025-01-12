"use client"
import dynamic from 'next/dynamic';

const TelegramWrapper = dynamic(
  () => import('../TelegramWrapper'),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function TelegramContainer() {
  return (
    <div className="telegram-app">
      <TelegramWrapper />
    </div>
  );
} 