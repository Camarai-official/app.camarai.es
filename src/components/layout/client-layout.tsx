'use client';

import * as React from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { EstablishmentProvider } from '../../hooks/EstablishmentContext';
import { AuthProvider, useAuth } from '../../hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Loading from '../../app/loading';
import { MobileHeader } from '@/components/layout/mobile-header';
import { useScrollbarCompensation } from '@/hooks/use-scrollbar-compensation';
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Singleton Convex client - created once outside any component
let convexClient: ConvexReactClient | null = null;

function getConvexClient() {
  if (convexClient) return convexClient;
  const url = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_SELF_HOSTED_URL;
  if (!url) return null;
  try {
    convexClient = new ConvexReactClient(url);
    return convexClient;
  } catch (error) {
    console.error('Error inicializando Convex:', error);
    return null;
  }
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { isMobile, isTablet } = useIsMobile();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const handleStart = () => setIsNavigating(true);
    window.addEventListener('navigation-start', handleStart);
    return () => window.removeEventListener('navigation-start', handleStart);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 500);
    return () => clearTimeout(timer);
  }, [pathname, isMounted]);

  if (!isMounted) {
    return (
      <SidebarInset className="!pl-0">
        <div className="flex-1 flex flex-col">{children}</div>
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

function AppShell({ children }: { children: React.ReactNode }) {
  useScrollbarCompensation();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // If not authenticated and not on login page, we could redirect, 
  // but it's better to handle it by showing only login page content
  // or using a layout-level check.
  
  const isLoginPage = pathname === '/login';

  if (!isAuthenticated && !isLoginPage) {
    // We can't use redirect() here as it's a client component and we want to avoid infinite loops
    // or flickering. The useAuth hook handles initial loading.
    if (typeof window !== 'undefined') {
       window.location.href = '/login';
    }
    return null;
  }

  if (isLoginPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
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
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const client = getConvexClient();

  const content = (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );

  if (client) {
    return (
      <ConvexProvider client={client}>
        {content}
      </ConvexProvider>
    );
  }

  return content;
}
