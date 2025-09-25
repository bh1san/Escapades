import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col">
      <header className="border-b p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-semibold tracking-tight">Story Weaver</h1>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Chat />
      </main>
    </div>
  );
}
