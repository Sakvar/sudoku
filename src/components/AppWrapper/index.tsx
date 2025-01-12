"use client"
import dynamic from 'next/dynamic';

const ClientRoot = dynamic(
  () => import('@/components/ClientRoot'),
  { ssr: false }
);

export default function AppWrapper({
  children,
  className
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <html lang="en" className={className}>
      <body className="antialiased">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
} 