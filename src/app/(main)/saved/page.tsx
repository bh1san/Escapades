import { SavedContent } from "@/components/saved-content";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Creations | Erotic Escapades',
  description: 'View your saved stories and conversations.',
};

export default function SavedPage() {
  return (
    <div className="container mx-auto max-w-4xl">
      <PageHeader
        title="Your Saved Creations"
        description="Revisit your saved stories and conversations. Your fantasies are kept safe here."
      />
      <div className="mt-8">
        <SavedContent />
      </div>
    </div>
  );
}
