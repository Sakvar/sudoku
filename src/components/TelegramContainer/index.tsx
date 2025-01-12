"use client"
import dynamic from 'next/dynamic';

// Import TelegramWrapper with SSR disabled
const TelegramWrapper = dynamic(
  () => import('../TelegramWrapper'),
  { 
    ssr: false,
    loading: () => (
      <div className="telegram-app-container">
        <div className="telegram-app" />
      </div>
    )
  }
);

export default function TelegramContainer() {
  return <TelegramWrapper />;
} 