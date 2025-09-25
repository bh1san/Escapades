import { ConversationGeneratorForm } from "@/components/conversation-generator-form";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversation Generator | Erotic Escapades',
  description: 'Generate step-by-step erotically seductive conversations.',
};

export default function ConversationGeneratorPage() {
  return (
    <div className="container mx-auto max-w-4xl">
      <PageHeader
        title="Erotic Conversation Generator"
        description="Create a step-by-step seductive conversation. Set the scene and watch the dialogue unfold."
      />
      <div className="mt-8">
        <ConversationGeneratorForm />
      </div>
    </div>
  );
}
