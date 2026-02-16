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
    <header className="m-6 py-4">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-start">
            <div className="flex flex-col items-start gap-1">
              <H1 className="text-transparent bg-clip-text brand-gradient-text">
                {title}
              </H1>
              {subtitle ? (
                <TextSM className="text-muted-foreground">{subtitle}</TextSM>
              ) : null}
            </div>
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2 self-stretch justify-end">
              {actions}
            </div>
          ) : null}
        </div>
    </header>
  );
}
