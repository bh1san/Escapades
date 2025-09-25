"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useToast } from "@/hooks/use-toast";
import type { SavedItem } from "@/lib/types";
import { Separator } from "./ui/separator";

interface ContentDisplayProps {
  title: string;
  content: string | string[];
  type: 'story' | 'conversation';
}

export function ContentDisplay({ title, content, type }: ContentDisplayProps) {
  const [savedItems, setSavedItems] = useLocalStorage<SavedItem[]>('erotic-escapades-content', []);
  const { toast } = useToast();

  const handleSave = () => {
    const newItem: SavedItem = {
      id: new Date().toISOString(),
      type,
      title,
      content,
      savedAt: new Date().toISOString(),
    };
    setSavedItems([newItem, ...savedItems]);
    toast({
      title: "Content Saved",
      description: `Your ${type} has been saved successfully.`
    })
  };

  const renderStoryContent = (storyContent: string | string[]) => {
    if (Array.isArray(storyContent)) {
      return (
        <div className="space-y-6">
          {storyContent.map((chapter, index) => (
            <div key={index}>
              <h3 className="text-xl font-bold font-headline mb-2">Chapter {index + 1}</h3>
              <p className="whitespace-pre-wrap leading-relaxed">{chapter}</p>
            </div>
          ))}
        </div>
      );
    }
    return <p className="whitespace-pre-wrap leading-relaxed">{storyContent}</p>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        <CardDescription>
            {type === 'story' ? "Your generated story." : "Your generated conversation."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {type === 'story' && renderStoryContent(content)}
        {type === 'conversation' && Array.isArray(content) && (
          <div className="space-y-4">
            {content.map((line, index) => (
              <p key={index} className="leading-relaxed">
                <span className="font-bold mr-2">Step {index + 1}:</span>
                {line}
              </p>
            ))}
          </div>
        )}
      </CardContent>
      <Separator className="my-4"/>
      <CardFooter>
        <Button variant="outline" onClick={handleSave} className="w-full sm:w-auto">
          <Bookmark className="mr-2 h-4 w-4" />
          Save to Collection
        </Button>
      </CardFooter>
    </Card>
  );
}
