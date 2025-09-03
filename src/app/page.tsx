import ChatInterface from '@/components/chat-interface';
import ChatHistory from '@/components/chat-history';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function Home() {
  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <ChatHistory />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main className="flex h-screen flex-col items-center bg-background">
          <div className="flex-1 w-full overflow-y-auto">
            <ChatInterface />
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
