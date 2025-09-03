import ChatInterface from '@/components/chat-interface';

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center bg-background">
      <div className="flex-1 w-full max-w-4xl overflow-y-auto">
        <ChatInterface />
      </div>
    </main>
  );
}
