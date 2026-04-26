'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-[2px] transition-all animate-in fade-in duration-300">
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-background border border-border shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-xs font-medium text-muted-foreground tracking-wide">
          Cargando...
        </span>
      </div>
    </div>
  );
}
