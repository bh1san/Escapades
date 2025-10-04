
"use client";

import { handleGenerateStory, handleGeneratePrompt } from "@/app/actions";
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


const initialMessage: Message = {
  role: "model",
  content:
    "You are an expert in writing erotic fiction. Tell me a story you would like to hear, and I will write it for you.",
};

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isStoryPending, setIsStoryPending] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const [promptState, promptFormAction, isPromptPending] = useActionState(handleGeneratePrompt, {
    message: "",
    prompt: "",
    error: false,
  });

  useEffect(() => {
    if (promptState.message && !isPromptPending) {
        if (promptState.error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: promptState.message,
            });
        } else if (promptState.prompt && formRef.current) {
            const promptTextarea = formRef.current.querySelector('textarea[name="prompt"]') as HTMLTextAreaElement;
            if (promptTextarea) {
                promptTextarea.value = promptState.prompt;
                promptTextarea.focus();
            }
        }
    }
  }, [promptState, isPromptPending, toast]);

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isStoryPending]);

  const handleFormSubmit = async (formData: FormData) => {
    const prompt = formData.get('prompt') as string;
    if (!prompt.trim() || isStoryPending) {
        return;
    }
    
    formRef.current?.reset();
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setIsStoryPending(true);

    try {
        const story = await handleGenerateStory(prompt);
        setMessages((prev) => [...prev, { role: "model", content: story }]);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
        });
        // Remove the user message that led to the error
        setMessages(currentMessages => currentMessages.slice(0, -1));
    } finally {
        setIsStoryPending(false);
    }
  }
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isStoryPending) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const startNewChat = () => {
    setMessages([initialMessage]);
  };

  const isPending = isStoryPending || isPromptPending;

  return (
    <>
      <HistorySidebar history={messages} onNewChat={startNewChat} />
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
                    <HistorySidebar history={messages} onNewChat={startNewChat} isMobile={true}/>
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
                {isStoryPending && (
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
             <div className="flex items-center gap-2">
               <form action={promptFormAction}>
                <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {isPromptPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand className="h-4 w-4" />
                    )}
                    <span className="sr-only">Generate story idea</span>
                  </Button>
               </form>
               <form ref={formRef} action={handleFormSubmit} className="flex items-center gap-2 w-full">
                <Textarea
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
                    size="icon"
                    disabled={isPending}
                    className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full"
                  >
                    {isStoryPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="sr-only">Send message</span>
                  </Button>
               </form>
             </div>
           </Card>
        </div>
      </div>
    </>
  );
}
