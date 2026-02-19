import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { H1, TextSM } from "./typography";

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, subtitle, className, actions }: PageHeaderProps) {
  return (
    <header className={cn("mx-6 py-8", className)}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                
                <div className="space-y-1">
                    <H1 className="text-3xl font-bold text-foreground">{title}</H1>
                    {subtitle && (
                        <TextSM className="text-muted-foreground font-medium">{subtitle}</TextSM>
                    )}
                </div>

            {actions && (
                <div className="flex flex-wrap items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    </header>
  );
}
