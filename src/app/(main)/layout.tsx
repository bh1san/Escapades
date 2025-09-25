import { MainSidebar } from "@/components/main-sidebar";
import { AppHeader } from "@/components/app-header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <MainSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
