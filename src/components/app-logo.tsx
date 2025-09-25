import { HeartPulse } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-foreground", className)}>
      <HeartPulse className="h-6 w-6 text-primary" />
      <span className="font-headline text-xl font-bold tracking-tight">
        Erotic Escapades
      </span>
    </Link>
  );
}
