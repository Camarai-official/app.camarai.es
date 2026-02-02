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
    <Card className={cn("w-full p-4", className)}>
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex flex-col items-start gap-1">
          <h1 className="w-fit self-start text-2xl md:text-3xl font-semibold tracking-tight text-transparent bg-clip-text brand-gradient-text">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="mt-2 h-1 w-8 rounded-sm brand-accent-bar" />
    </Card>
  );
}
