"use client";

import { handleGenerateStory, handleGeneratePrompt } from "@/app/actions";
import { useEffect, useRef, useState, useActionState } from "react";
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
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);


  const [state, formAction, isPending] = useActionState(handleGenerateStory, {
    message: "",
    error: false,
  });

  useEffect(() => {
    if (state.message && !isPending) {
      if (state.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: state.message,
        });
        setMessages((currentMessages) =>
          currentMessages.filter((msg, index) => index !== currentMessages.length - 1 || msg.role !== 'user')
        );
      } else if (state.data?.story) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "model", content: state.data.story },
        ]);
        formRef.current?.reset();
      }
    }
  }, [state, isPending, toast]);

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isPending]);

  const handleFormSubmit = (formData: FormData) => {
    const prompt = formData.get('prompt') as string;
    if (!prompt.trim() || isPending) {
        return;
    }
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    formAction(formData);
  }
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isPending) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const startNewChat = () => {
    setMessages([initialMessage]);
  };

  const generatePrompt = async () => {
    setIsGeneratingPrompt(true);
    const result = await handleGeneratePrompt();
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    } else if (result.prompt && formRef.current) {
      const promptTextarea = formRef.current.querySelector('textarea[name="prompt"]') as HTMLTextAreaElement;
      if (promptTextarea) {
        promptTextarea.value = result.prompt;
        promptTextarea.focus();
      }
    }
    setIsGeneratingPrompt(false);
  };

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
             <form ref={formRef} action={handleFormSubmit} className="flex items-center gap-2">
               <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={generatePrompt}
                  disabled={isGeneratingPrompt || isPending}
                  className="text-muted-foreground hover:text-primary"
                >
                  {isGeneratingPrompt ? (
                     <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand className="h-4 w-4" />
                  )}
                  <span className="sr-only">Generate story idea</span>
                </Button>
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
