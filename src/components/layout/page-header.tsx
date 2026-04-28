import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { H1, TextSM } from "@/components/ui/typography";

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  mobileRow?: boolean;
};

export function PageHeader({ title, subtitle, className, actions, mobileRow }: PageHeaderProps) {
  return (
    <header className={cn("mx-4 sm:mx-6 py-4 sm:py-8", className)}>
        <div className={cn(
            "flex gap-4 lg:flex-row lg:items-center lg:justify-between",
            mobileRow ? "flex-row items-center justify-between" : "flex-col"
        )}>
                
                <div className="space-y-1 min-w-0">
                    <H1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</H1>
                    {subtitle && (
                        <TextSM className="text-muted-foreground font-medium">{subtitle}</TextSM>
                    )}
                </div>

            {actions && (
                <div className={cn(
                    "flex flex-wrap items-center gap-3 shrink-0 lg:w-auto",
                    mobileRow ? "w-auto" : "w-full"
                )}>
                    {actions}
                </div>
            )}
        </div>
    </header>
  );
}
