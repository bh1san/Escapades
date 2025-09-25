"use client";

import { useFormState, useFormStatus } from "react-dom";
import { handleContinueStory } from "@/app/actions";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send, User, Bot, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "@/lib/types";
import { Card } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="icon"
      disabled={pending}
      className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      <span className="sr-only">Send message</span>
    </Button>
  );
}

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

  const initialState = { message: "", error: false, data: undefined };
  const [state, formAction] = useFormState(handleContinueStory, initialState);

  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.message && !pending) {
      if (state.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: state.message,
        });
        setMessages((messages) => messages.slice(0, -1));
      } else if (state.data) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "model", content: state.data.newChapter },
        ]);
        formRef.current?.reset();
        textareaRef.current?.focus();
      }
    }
  }, [state, pending, toast]);

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const prompt = formData.get("prompt") as string;
    if (prompt.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: prompt },
      ]);
      formAction(formData);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      <ScrollArea className="flex-1" viewportRef={scrollViewportRef}>
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <div className="space-y-8">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-4",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.role === "user" ? (
                      <User size={18} />
                    ) : (
                      <Sparkles size={18} className="text-primary"/>
                    )}
                  </AvatarFallback>
                </Avatar>
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
              </div>
            ))}
            {pending && (
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
           <form ref={formRef} onSubmit={handleFormSubmit} className="flex items-center gap-2">
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
               disabled={pending}
             />
             <SubmitButton />
           </form>
         </Card>
      </div>
    </div>
  );
}
