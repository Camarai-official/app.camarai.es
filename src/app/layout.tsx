'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { EstablishmentProvider } from '../hooks/EstablishmentContext';
import { Toaster } from '@/components/ui/toaster';
import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Loading from './loading';
import { MobileHeader } from '@/components/layout/mobile-header';
import { useScrollbarCompensation } from '@/hooks/use-scrollbar-compensation';

// Convex Provider
import { ConvexProvider, ConvexReactClient } from "convex/react";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Función para crear cliente Convex
function createConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_SELF_HOSTED_URL;
  try {
    return new ConvexReactClient(url);
  } catch (error) {
    console.error('Error inicializando Convex:', error);
    return null;
  }
}


function MainContent({ children }: { children: React.ReactNode }) {
  const { isMobile, isTablet } = useIsMobile();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = React.useState(false);

  React.useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    window.addEventListener('navigation-start', handleStart);
    
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 600);
    
    return () => {
      window.removeEventListener('navigation-start', handleStart);
      clearTimeout(timer);
    };
  }, [pathname]);

  const getPadding = () => {
    if (isMobile || isTablet) {
      return 'pt-20 pl-0';
    }
    return '';
  };

  return (
    <SidebarInset className={cn("transition-[padding] !pl-0", getPadding())}>
      {isNavigating && <Loading />}
      <div className={cn("flex-1 flex flex-col", isNavigating ? "opacity-0" : "opacity-100 transition-opacity duration-300")}>
        {children}
      </div>
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

  const convex = createConvexClient();

  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased bg-background text-foreground min-h-screen`}>
        {convex ? (
          <ConvexProvider client={convex}>
            <EstablishmentProvider>
              <SidebarProvider>
                <MobileHeader />
                <Sidebar variant="sidebar" collapsible="icon">
                  <SidebarNav />
                </Sidebar>
                <MainContent>{children}</MainContent>
              </SidebarProvider>
              <Toaster />
            </EstablishmentProvider>
          </ConvexProvider>
        ) : (
          <EstablishmentProvider>
            <SidebarProvider>
              <MobileHeader />
              <Sidebar variant="sidebar" collapsible="icon">
                <SidebarNav />
              </Sidebar>
              <MainContent>{children}</MainContent>
            </SidebarProvider>
            <Toaster />
          </EstablishmentProvider>
        )}
      </body>
    </html>
  );
}
