import { getInitialChatState } from "@/app/data";
import { Chat } from "@/components/chat";

export default async function Home() {
  const initialState = await getInitialChatState();
  return (
    <main className="flex h-dvh w-full">
      <Chat initialState={initialState} />
    </main>
  );
}
