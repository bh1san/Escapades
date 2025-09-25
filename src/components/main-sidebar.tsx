"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessagesSquare, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "./app-logo";

const navItems = [
  { href: "/", label: "Story Generator", icon: BookOpen },
  { href: "/conversation", label: "Conversation Generator", icon: MessagesSquare },
  { href: "/saved", label: "Saved Creations", icon: Bookmark },
];

interface MainSidebarProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export function MainSidebar({ isMobile = false, onLinkClick }: MainSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "h-screen flex-col border-r bg-card text-card-foreground",
        isMobile ? "flex w-full" : "hidden md:flex md:w-72"
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <AppLogo />
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) && "bg-primary/10 text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
