"use client";

import { useFormState, useFormStatus } from "react-dom";
import { handleGenerateStory } from "@/app/actions";
import { useCharacter } from "@/context/character-context";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { ContentDisplay } from "./content-display";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      Generate Story
    </Button>
  );
}

export function StoryGeneratorForm() {
  const { character } = useCharacter();
  const formRef = useRef<HTMLFormElement>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const { toast } = useToast();

  const initialState = { message: "", error: false, data: null };
  const actionWithCharacter = handleGenerateStory.bind(null, character);
  const [state, formAction] = useFormState(actionWithCharacter, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: state.message,
        });
      } else {
        setGeneratedContent(state.data);
        formRef.current?.reset();
      }
    }
  }, [state, toast]);

  return (
    <div className="space-y-8">
      <form ref={formRef} action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Story Elements</CardTitle>
            <CardDescription>
              Provide the core elements of your story.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plot">Plot</Label>
              <Textarea
                id="plot"
                name="plot"
                placeholder="e.g., A forbidden romance between a young student and her professor..."
                className="min-h-32"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Specific Details (Optional)</Label>
              <Textarea
                id="details"
                name="details"
                placeholder="e.g., Include a scene during a thunderstorm, a secret note..."
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>

      {useFormStatus().pending && (
         <Card className="animate-pulse">
            <CardHeader>
                <div className="h-6 w-3/4 rounded-md bg-muted"></div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-4 w-full rounded-md bg-muted"></div>
                <div className="h-4 w-5/6 rounded-md bg-muted"></div>
                <div className="h-4 w-full rounded-md bg-muted"></div>
                <div className="h-4 w-4/6 rounded-md bg-muted"></div>
            </CardContent>
         </Card>
      )}

      {generatedContent && (
        <div className="animate-fade-in">
          <ContentDisplay 
            title="Generated Story"
            content={generatedContent.story}
            type="story"
          />
        </div>
      )}
    </div>
  );
}
