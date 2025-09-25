"use client";

import { handleContinueStory } from "@/app/actions";
import { useEffect, useRef, useState, useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles, User, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { HistorySidebar } from "@/components/history-sidebar";

const initialMessages: Message[] = [
  {
    role: "model",
    content:
      "You are an expert in writing erotic fiction. Tell me a story you would like to hear, and I will write it for you. You can guide the story at every step.",
  },
];

export function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [state, formAction, isPending] = useActionState(handleContinueStory, {
    message: "",
    error: false,
  });

  // Effect to handle the result of the server action
  useEffect(() => {
    if (state.message && !isPending) {
      if (state.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: state.message,
        });
        // On error, remove the user's optimistic message
        setMessages((currentMessages) =>
          currentMessages.filter((msg, index) => index !== currentMessages.length - 1 || msg.role !== 'user')
        );
      } else if (state.data) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "model", content: state.data.newChapter },
        ]);
      }
    }
  }, [state, isPending, toast]);

  // Effect to scroll to the bottom when new messages are added
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = (formData: FormData) => {
    const prompt = formData.get("prompt") as string;
    if (!prompt.trim() || isPending) {
      return;
    }
    
    // Optimistically add user's message to the UI
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: prompt },
    ]);

    formAction(formData);
    formRef.current?.reset();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isPending) {
      event.preventDefault();
      if (formRef.current) {
        const formData = new FormData(formRef.current);
        handleSubmit(formData);
      }
    }
  };

  const startNewChat = () => {
    setMessages(initialMessages);
  };

  return (
    <>
      <HistorySidebar history={messages} onNewChat={startNewChat} />
      <div className="relative flex h-full w-full flex-col">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">Story Weaver</h1>
          <Button variant="outline" size="sm" onClick={startNewChat}>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </header>
        <ScrollArea className="flex-1" viewportRef={scrollViewportRef}>
          <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="space-y-8">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-4",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'model' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Sparkles size={18} className="text-primary"/>
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-prose rounded-lg p-3 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User size={18} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isPending && (
                <div className="flex items-start gap-4">
                  <Avatar className="h-8 w-8">
                     <AvatarFallback>
                        <Sparkles size={18} className="text-primary"/>
                      </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <div className="container mx-auto max-w-4xl pb-4 px-4">
           <Card className="mt-4 p-2 rounded-2xl shadow-lg">
             <form ref={formRef} action={handleSubmit} className="flex items-center gap-2">
               <input
                 type="hidden"
                 name="history"
                 value={JSON.stringify(messages)}
               />
               <Textarea
                 ref={textareaRef}
                 name="prompt"
                 placeholder="Tell me what happens next..."
                 className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0"
                 rows={1}
                 onKeyDown={handleKeyDown}
                 disabled={isPending}
               />
               <Button
                  type="submit"
                  size="icon"
                  disabled={isPending}
                  className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send message</span>
                </Button>
             </form>
           </Card>
        </div>
      </div>
    </>
  );
}
