import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, subtitle, className, actions }: PageHeaderProps) {
  return (
    <header className="p-4 pb-2 md:p-6 md:pb-3">
      <Card className={cn("w-full p-4", className)}>
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-start">
            <div className="flex flex-col items-start gap-1">
              <h1 className="w-fit self-start text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-transparent bg-clip-text brand-gradient-text">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="mt-2 h-1 w-8 rounded-sm brand-accent-bar" />
          </div>
          {actions ? (
            <div className="flex w-full flex-wrap items-center justify-start gap-2 self-stretch sm:w-auto sm:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      </Card>
    </header>
  );
}
