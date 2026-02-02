
'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export function MobileHeader() {
    const { isMobile, isTablet } = useIsMobile();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || (!isMobile && !isTablet)) {
        return null;
    }

    return (
        <header className="fixed top-4 left-4 z-50 rounded-full bg-primary text-primary-foreground shadow-lg">
            <SidebarTrigger variant="default" className="dark:text-[--sidebar-background]" />
        </header>
    );
}
