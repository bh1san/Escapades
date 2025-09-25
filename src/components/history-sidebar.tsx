import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
  history: Message[];
  onNewChat: () => void;
  isMobile?: boolean;
}

export function HistorySidebar({ history, onNewChat, isMobile = false }: HistorySidebarProps) {
  const userPrompts = history.filter((message) => message.role === "user");

  return (
    <div className={cn(
        "flex-col w-64 bg-muted/40 border-r",
        isMobile ? "flex h-full" : "hidden md:flex"
    )}>
      <div className="p-4">
         <Button onClick={onNewChat} className="w-full">
           <Plus className="mr-2 h-4 w-4" />
           New Chat
         </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight px-2">History</h2>
          <div className="space-y-1">
            {userPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start truncate"
              >
                {prompt.content}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
