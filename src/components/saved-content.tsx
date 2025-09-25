"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { SavedItem } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessagesSquare, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function SavedContent() {
  const [savedItems, setSavedItems] = useLocalStorage<SavedItem[]>(
    "erotic-escapades-content",
    []
  );

  const handleDelete = (id: string) => {
    setSavedItems(savedItems.filter((item) => item.id !== id));
  };

  if (savedItems.length === 0) {
    return (
        <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertTitle>No Saved Creations</AlertTitle>
            <AlertDescription>
                You haven't saved any stories or conversations yet. Start creating to see them here!
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {savedItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
        <AccordionItem value={item.id} className="border-b-0">
          <AccordionTrigger className="p-6 hover:no-underline">
            <div className="flex items-center gap-4 text-left w-full">
              {item.type === "story" ? (
                <BookOpen className="h-5 w-5 text-primary" />
              ) : (
                <MessagesSquare className="h-5 w-5 text-primary" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-base">
                  {item.type === "story" ? "Story" : "Conversation"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Saved {formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-6 pb-6 space-y-4">
            {item.type === "story" && typeof item.content === 'string' && (
                <p className="whitespace-pre-wrap leading-relaxed">{item.content}</p>
            )}
            {item.type === "conversation" && Array.isArray(item.content) && (
                <div className="space-y-4">
                {item.content.map((line, index) => (
                    <p key={index} className="leading-relaxed">
                    <span className="font-bold mr-2">Step {index + 1}:</span>
                    {line}
                    </p>
                ))}
                </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(item.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        </Card>
      ))}
    </Accordion>
  );
}
