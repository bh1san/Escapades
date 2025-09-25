"use client";

import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/app-logo";
import { CharacterEditor } from "@/components/character-editor";
import { Menu, UserCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MainSidebar } from "./main-sidebar";
import { useState } from "react";


export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [characterSheetOpen, setCharacterSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 md:px-8">
      <div className="flex items-center gap-4">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <MainSidebar isMobile={true} onLinkClick={() => setMobileMenuOpen(false)}/>
          </SheetContent>
        </Sheet>
        <div className="hidden md:flex">
         <AppLogo />
        </div>
      </div>
      
      <div className="md:hidden">
        <AppLogo />
      </div>

      <Sheet open={characterSheetOpen} onOpenChange={setCharacterSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <UserCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Customize Character</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
            <CharacterEditor onSave={() => setCharacterSheetOpen(false)}/>
        </SheetContent>
      </Sheet>
    </header>
  );
}
