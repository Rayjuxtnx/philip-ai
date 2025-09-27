
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Home() {
  const { user, signInWithGithub, isAuthLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isAuthLoading) {
      router.replace('/chat');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <main className="flex items-center justify-center h-screen bg-background">
        <div className="dot-flashing"></div>
      </main>
    );
  }

  if (user) {
    return (
      <main className="flex items-center justify-center h-screen bg-background">
        <div className="dot-flashing"></div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Philip Virtual Assistant</CardTitle>
          <CardDescription>Sign in to start your session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={signInWithGithub} className="w-full">
            <Github className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
