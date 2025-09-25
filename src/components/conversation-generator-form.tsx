"use client";

import { useFormState, useFormStatus } from "react-dom";
import { handleGenerateConversation } from "@/app/actions";
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
import { Input } from "@/components/ui/input";
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
      Generate Conversation
    </Button>
  );
}

export function ConversationGeneratorForm() {
  const { character } = useCharacter();
  const formRef = useRef<HTMLFormElement>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const { toast } = useToast();

  const initialState = { message: "", error: false, data: null };
  const actionWithCharacter = handleGenerateConversation.bind(null, character);
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
            <CardTitle className="font-headline">Conversation Details</CardTitle>
            <CardDescription>
              Set the topic and number of steps for your conversation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Textarea
                id="topic"
                name="topic"
                placeholder="e.g., A chance encounter at a dimly lit jazz club..."
                className="min-h-24"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="steps">Conversation Steps</Label>
              <Input
                id="steps"
                name="steps"
                type="number"
                placeholder="e.g., 5"
                min="2"
                max="10"
                defaultValue="5"
                required
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
            <CardContent className="space-y-2">
                <div className="h-4 w-full rounded-md bg-muted"></div>
                <div className="h-4 w-5/6 rounded-md bg-muted"></div>
                <div className="h-4 w-full rounded-md bg-muted"></div>
            </CardContent>
         </Card>
      )}
      {generatedContent && (
        <div className="animate-fade-in">
          <ContentDisplay 
            title="Generated Conversation"
            content={generatedContent.conversation}
            type="conversation"
          />
        </div>
      )}
    </div>
  );
}
