
"use client";

import { handleChat } from "@/app/actions";
import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles, User, PanelLeft, Wand } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { HistorySidebar } from "@/components/history-sidebar";
import ReactMarkdown from 'react-markdown';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type ChatState = {
  messages: Message[];
  error?: string | null;
  pendingUserInput?: string | null;
};

interface ChatProps {
  initialState: ChatState;
}

export function Chat({ initialState }: ChatProps) {
  const [state, formAction, isPending] = useActionState(handleChat, initialState);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
  }, [state.error, toast]);

  useEffect(() => {
    if(state.pendingUserInput) {
        setInput(state.pendingUserInput);
        // Focus the textarea
        formRef.current?.querySelector('textarea')?.focus();
    }
  }, [state.pendingUserInput]);

  useEffect(() => {
    if (!isPending) {
        // Only clear input if the last action was 'generate_story'
        const lastAction = (formRef.current?.lastChild as HTMLButtonElement)?.value;
        if (lastAction !== 'generate_prompt') {
            setInput("");
        }
        formRef.current?.reset();
    }
  }, [isPending]);
  
  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [state.messages, isPending]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isPending && input.trim()) {
      event.preventDefault();
      // Directly submit the form via the submit button
      formRef.current?.querySelector('button[value="generate_story"]')?.click();
    }
  };

  const startNewChat = () => {
    window.location.reload();
  };

  return (
    <>
      <HistorySidebar history={state.messages} onNewChat={startNewChat} />
      <div className="relative flex h-full max-h-dvh w-full flex-col">
         <header className="flex items-center justify-between p-4 border-b shrink-0 md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle History</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                    <HistorySidebar history={state.messages} onNewChat={startNewChat} isMobile={true}/>
                </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold">Story Weaver</h1>
        </header>
        <header className="hidden md:flex items-center justify-between p-4 border-b shrink-0">
          <h1 className="text-xl font-bold">Story Weaver</h1>
        </header>
        <div className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
            <div className="container mx-auto max-w-4xl py-8 px-4">
              <div className="space-y-8">
                {state.messages.map((message, index) => (
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
                      <div className="prose prose-sm max-w-none text-foreground prose-p:before:content-none prose-p:after:content-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
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
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Generating your story...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
        <div className="container mx-auto max-w-4xl pb-4 px-4 mt-auto shrink-0">
           <Card className="mt-4 p-2 rounded-2xl shadow-lg">
             <form ref={formRef} action={formAction} className="flex items-center gap-2 w-full">
                <Button
                    type="submit"
                    name="action"
                    value="generate_prompt"
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Wand className="h-4 w-4" />
                    <span className="sr-only">Generate story idea</span>
                </Button>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  suppressHydrationWarning
                  name="prompt"
                  placeholder="Tell me what happens next..."
                  className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0"
                  rows={1}
                  onKeyDown={handleKeyDown}
                  disabled={isPending}
                />
                <Button
                    type="submit"
                    name="action"
                    value="generate_story"
                    size="icon"
                    disabled={isPending || !input.trim()}
                    className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
             </form>
           </Card>
        </div>
      </div>
    </>
  );
}
