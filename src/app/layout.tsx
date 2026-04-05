'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Toaster } from '@/components/ui/toaster';
import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { MobileHeader } from '@/components/layout/mobile-header';
import { useScrollbarCompensation } from '@/hooks/use-scrollbar-compensation';

// Convex Provider
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { getConvexClient } from "@/lib/mock-convex";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Crear el cliente de Convex con fallback para static generation
const convex = getConvexClient();

function MainContent({ children }: { children: React.ReactNode }) {
  const { isMobile, isTablet } = useIsMobile();

  const getPadding = () => {
    if (isMobile || isTablet) {
      return 'pt-20 pl-0';
    }
    return '';
  };

  return (
    <SidebarInset className={cn("transition-[padding] !pl-0", getPadding())}>
      {children}
    </SidebarInset>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fix layout shift when modals/dropdowns open
  useScrollbarCompensation();

  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased bg-background text-foreground min-h-screen`}>
        <ConvexProvider client={convex}>
          <SidebarProvider>
            <MobileHeader />
            <Sidebar variant="sidebar" collapsible="icon">
              <SidebarNav />
            </Sidebar>
            <MainContent>{children}</MainContent>
          </SidebarProvider>
          <Toaster />
        </ConvexProvider>
      </body>
    </html>
  );
}
