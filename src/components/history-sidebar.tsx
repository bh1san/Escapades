"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Sparkles } from "lucide-react";
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
        "flex-col w-64 border-r bg-muted/20 backdrop-blur-sm",
        isMobile ? "flex h-full" : "hidden md:flex"
    )}>
      {/* Brand */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Story Weaver
          </span>
        </div>
        <Button
          onClick={onNewChat}
          className="w-full tap-scale gap-2 rounded-xl"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Story
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
            Your Prompts
          </p>
          {userPrompts.length === 0 ? (
            <div className="text-center py-8 px-2">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/60">No stories yet. Start writing!</p>
            </div>
          ) : (
            userPrompts.map((prompt, index) => (
              <div
                key={index}
                className={cn(
                  "group flex items-start gap-2 px-2 py-2 rounded-lg cursor-default",
                  "hover:bg-primary/5 transition-colors duration-150",
                  "animate-fade-in",
                )}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-150 line-clamp-2 leading-relaxed">
                  {prompt.content}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <p className="text-xs text-center text-muted-foreground/50">
          Your stories are saved locally
        </p>
      </div>
    </div>
  );
}
