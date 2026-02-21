"use client";

import { Guitar } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="flex items-center gap-2">
          <Guitar className="h-6 w-6" />
          <h1 className="text-lg font-bold tracking-tight">GuitarMaster</h1>
        </div>
      </div>
    </header>
  );
}
