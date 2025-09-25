import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col">
      <main className="flex-1 overflow-hidden">
        <Chat />
      </main>
    </div>
  );
}
