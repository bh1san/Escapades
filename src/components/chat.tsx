
"use client";

import { handleChat } from "@/app/actions";
import { useEffect, useRef, useState, useCallback } from "react";
import { useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles, User, PanelLeft, Wand, ImageIcon, X, ChevronRight } from "lucide-react";
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

const SUGGESTION_GROUPS: Record<string, string[]> = {
  default: [
    "Make it more intense 🔥",
    "Add more dialogue 💬",
    "Describe her feelings in detail 💭",
    "Continue the story ➡️",
    "Upload an image to inspire the scene 📸",
  ],
  greeting: [
    "Start a forbidden romance story",
    "Write about a secret encounter",
    "Begin a slow-burn seduction tale",
    "Tell me about a chance meeting in the rain",
    "Start a story set in a luxurious hotel",
  ],
};

function getSuggestions(messages: Message[]): string[] {
  const isFirstMessage = messages.filter(m => m.role === 'user').length === 0;
  return isFirstMessage ? SUGGESTION_GROUPS.greeting : SUGGESTION_GROUPS.default;
}

export function Chat({ initialState }: ChatProps) {
  const [state, formAction, isPending] = useActionState(handleChat, initialState);
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialState.messages);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('escapades_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    }
  }, []);

  useEffect(() => {
    if (state.messages.length > initialState.messages.length) {
      setMessages(state.messages);
      localStorage.setItem('escapades_chat_history', JSON.stringify(state.messages));
      setShowSuggestions(true);
    }
  }, [state.messages, initialState.messages.length]);

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
        formRef.current?.querySelector('textarea')?.focus();
    }
  }, [state.pendingUserInput]);

  useEffect(() => {
    if (!isPending) {
        const lastAction = (formRef.current?.lastChild as HTMLButtonElement)?.value;
        if (lastAction !== 'generate_prompt') {
            setInput("");
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
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
  }, [messages, isPending]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isPending && (input.trim() || imagePreview)) {
      event.preventDefault();
      formRef.current?.querySelector('button[value="generate_story"]')?.click();
    }
  };

  const startNewChat = () => {
    localStorage.removeItem('escapades_chat_history');
    window.location.reload();
  };

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      formRef.current?.querySelector('textarea')?.focus();
    }, 50);
  }, []);

  const suggestions = getSuggestions(messages);
  const lastMessageIsModel = messages.length > 0 && messages[messages.length - 1].role === 'model';

  return (
    <>
      <HistorySidebar history={messages} onNewChat={startNewChat} />
      <div className="relative flex h-full max-h-dvh w-full flex-col">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 border-b shrink-0 md:hidden backdrop-blur-sm bg-background/80 sticky top-0 z-10">
           <Sheet>
               <SheetTrigger asChild>
                   <Button variant="ghost" size="icon" className="tap-scale">
                       <PanelLeft className="h-5 w-5" />
                       <span className="sr-only">Toggle History</span>
                   </Button>
               </SheetTrigger>
               <SheetContent side="left" className="p-0">
                   <HistorySidebar history={messages} onNewChat={startNewChat} isMobile={true}/>
               </SheetContent>
           </Sheet>
           <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
             Story Weaver
           </h1>
           <div className="w-9" />
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 border-b shrink-0 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Story Weaver
          </h1>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
            <div className="container mx-auto max-w-3xl py-8 px-4">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-end gap-3",
                      message.role === "user" ? "justify-end animate-slide-right" : "justify-start animate-slide-left"
                    )}
                    style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
                  >
                    {message.role === 'model' && (
                      <Avatar className="h-8 w-8 shrink-0 shadow-md ring-2 ring-primary/20">
                        <AvatarFallback className="bg-primary/10">
                          <Sparkles size={14} className="text-primary"/>
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-prose rounded-2xl px-4 py-3 text-sm shadow-sm transition-all duration-200",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm border border-border/50"
                      )}
                    >
                      <div className="prose prose-sm max-w-none text-foreground prose-p:before:content-none prose-p:after:content-none prose-p:my-1">
                        {message.image && (
                          <div className="mb-2">
                            <img src={message.image} alt="Uploaded content" className="max-w-full h-auto rounded-xl max-h-64 object-contain" />
                          </div>
                        )}
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 shrink-0 shadow-md ring-2 ring-border">
                        <AvatarFallback>
                          <User size={14} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isPending && (
                  <div className="flex items-end gap-3 animate-fade-in">
                    <Avatar className="h-8 w-8 shrink-0 shadow-md ring-2 ring-primary/20">
                      <AvatarFallback className="bg-primary/10">
                        <Sparkles size={14} className="text-primary"/>
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-bl-sm border border-border/50 px-4 py-3">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="animate-pulse-gentle">Weaving your story...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggestion Chips */}
                {!isPending && showSuggestions && (
                  <div className="animate-fade-in-up">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" /> Try one of these…
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className={cn(
                            "animate-chip-pop tap-scale",
                            "text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary",
                            "hover:bg-primary/15 hover:border-primary/60 hover:shadow-sm",
                            "transition-colors duration-200 cursor-pointer",
                            i === 0 && "delay-0",
                            i === 1 && "delay-75",
                            i === 2 && "delay-150",
                            i === 3 && "delay-225",
                            i === 4 && "delay-300",
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="container mx-auto max-w-3xl pb-4 px-4 mt-auto shrink-0">
          <Card className="mt-3 p-2 rounded-2xl shadow-lg border border-border/60 bg-card/80 backdrop-blur-sm transition-shadow duration-300 focus-within:shadow-xl focus-within:border-primary/40">
            {imagePreview && (
               <div className="px-2 pt-2 animate-fade-in">
                 <div className="relative inline-block w-20 h-20 rounded-xl border border-border overflow-hidden shadow-sm">
                     <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                     <Button
                       type="button"
                       variant="destructive"
                       size="icon"
                       className="absolute top-1 right-1 h-5 w-5 rounded-full tap-scale"
                       onClick={() => {
                         setImagePreview(null);
                         if (fileInputRef.current) fileInputRef.current.value = "";
                       }}
                     >
                       <X className="h-3 w-3" />
                     </Button>
                 </div>
               </div>
            )}
            <form ref={formRef} action={formAction} className="flex items-center gap-1 w-full">
               <input type="hidden" name="history" value={JSON.stringify(messages)} />
               <input type="hidden" name="image" value={imagePreview || ''} />
               <input
                 type="file"
                 accept="image/*"
                 className="hidden"
                 ref={fileInputRef}
                 onChange={handleImageUpload}
               />
               <Button
                   type="button"
                   variant="ghost"
                   size="icon"
                   disabled={isPending}
                   className="text-muted-foreground hover:text-primary tap-scale shrink-0"
                   onClick={() => fileInputRef.current?.click()}
                   title="Upload an image"
                 >
                   <ImageIcon className="h-4 w-4" />
                   <span className="sr-only">Upload image</span>
               </Button>
               <Button
                   type="submit"
                   name="action"
                   value="generate_prompt"
                   variant="ghost"
                   size="icon"
                   disabled={isPending}
                   className="text-muted-foreground hover:text-primary tap-scale shrink-0"
                   title="Generate a story idea for me"
                 >
                   <Wand className="h-4 w-4" />
                   <span className="sr-only">Generate story idea</span>
               </Button>
               <Textarea
                 value={input}
                 onChange={(e) => {
                   setInput(e.target.value);
                   if (e.target.value) setShowSuggestions(false);
                 }}
                 suppressHydrationWarning
                 name="prompt"
                 placeholder="Tell me what happens next..."
                 className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm min-h-[36px] max-h-[120px]"
                 rows={1}
                 onKeyDown={handleKeyDown}
                 disabled={isPending}
               />
               <Button
                   type="submit"
                   name="action"
                   value="generate_story"
                   size="icon"
                   disabled={isPending || (!input.trim() && !imagePreview)}
                   className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl tap-scale shrink-0 transition-all duration-200 disabled:opacity-40"
                 >
                   {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                   <span className="sr-only">Send message</span>
                 </Button>
            </form>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-2 opacity-60">
            Use the 🪄 wand for a story idea · 📸 to upload an image
          </p>
        </div>
      </div>
    </>
  );
}
