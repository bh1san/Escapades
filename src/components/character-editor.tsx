"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCharacter } from "@/context/character-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

const characterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  age: z.coerce.number().min(18, "Character must be at least 18 years old."),
  attributes: z
    .string()
    .min(10, "Physical attributes must be at least 10 characters long."),
});

type CharacterFormData = z.infer<typeof characterSchema>;

interface CharacterEditorProps {
  onSave?: () => void;
}

export function CharacterEditor({ onSave }: CharacterEditorProps) {
  const { character, setCharacter } = useCharacter();
  const { toast } = useToast();

  const form = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: character.name,
      age: character.age,
      attributes: character.attributes,
    },
  });

  const onSubmit = (data: CharacterFormData) => {
    setCharacter(data);
    toast({
      title: "Character Saved",
      description: "Your character details have been updated successfully.",
    });
    if (onSave) {
      onSave();
    }
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>Customize Your Character</SheetTitle>
        <SheetDescription>
          Define the protagonist of your stories. These details will be used in
          all generated content.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <div className="space-y-6 py-6 flex-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Nabina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 18" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attributes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Attributes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., perfect figure 34d-26-36"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <SheetFooter>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">Save Character</Button>
          </SheetFooter>
        </form>
      </Form>
    </>
  );
}
