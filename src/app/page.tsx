import ChatInterface from '@/components/chat-interface';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-background">
      <div className="w-full max-w-2xl">
        <ChatInterface />
      </div>
    </main>
  );
}
