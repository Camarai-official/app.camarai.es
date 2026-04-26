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
  if (!url) return null;
  try {
    return new ConvexReactClient(url);
  } catch (error) {
    console.error('Error inicializando Convex:', error);
    return null;
  }
}

const convexClient = createConvexClient();

function MainContent({ children }: { children: React.ReactNode }) {
  const { isMobile, isTablet } = useIsMobile();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Efecto de montaje único
  React.useEffect(() => {
    setIsMounted(true);
    const handleStart = () => setIsNavigating(true);
    window.addEventListener('navigation-start', handleStart);
    return () => window.removeEventListener('navigation-start', handleStart);
  }, []);

  // Efecto de cambio de ruta - Solo si ya está montado
  React.useLayoutEffect(() => {
    if (!isMounted) return;
    
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 500);
    return () => clearTimeout(timer);
  }, [pathname, isMounted]);

  // Si no está montado, renderizamos el layout base sin lógica dinámica para evitar Hydration Mismatch
  if (!isMounted) {
    return (
      <SidebarInset className="!pl-0">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </SidebarInset>
    );
  }

  const paddingClass = (isMobile || isTablet) ? 'pt-20 pl-0' : '';

  return (
    <SidebarInset className={cn("transition-[padding] !pl-0", paddingClass)}>
      {isNavigating && <Loading />}
      <div className={cn(
        "flex-1 flex flex-col transition-opacity duration-300", 
        isNavigating ? "opacity-0" : "opacity-100"
      )}>
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
  useScrollbarCompensation();

  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased bg-background text-foreground min-h-screen`} suppressHydrationWarning>
        {convexClient ? (
          <ConvexProvider client={convexClient}>
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
