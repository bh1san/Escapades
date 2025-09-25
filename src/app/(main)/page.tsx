import { PageHeader } from "@/components/page-header";
import { StoryGeneratorForm } from "@/components/story-generator-form";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Story Generator | Erotic Escapades',
  description: 'Generate unique adult stories with customized plot elements.',
};

export default function StoryGeneratorPage() {
  return (
    <div className="container mx-auto max-w-4xl">
      <PageHeader
        title="Story Generator"
        description="Craft a unique adult story. Enter a plot and any specific details to bring your fantasy to life."
      />
      <div className="mt-8">
        <StoryGeneratorForm />
      </div>
    </div>
  );
}
