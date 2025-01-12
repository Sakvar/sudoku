"use client"
import { useEffect, useState } from 'react';

interface ClientRootProps {
  children: React.ReactNode;
}

export default function ClientRoot({ children }: ClientRootProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return children;
} 