
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/chat');
  }, [router]);

  return (
    <main className="flex items-center justify-center h-screen bg-background">
      <div className="dot-flashing"></div>
    </main>
  );
}
