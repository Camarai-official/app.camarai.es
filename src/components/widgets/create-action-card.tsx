"use client";

import type { ElementType, KeyboardEvent } from "react";
import { PlusCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TextSM } from "@/components/ui/typography";

type CreateActionCardProps = {
  label: string;
  onClick?: () => void;
  className?: string;
  icon?: ElementType;
  variant?: 'grid' | 'list';
};

export function CreateActionCard({
  label,
  onClick,
  className,
  icon: Icon = PlusCircle,
  variant = 'grid',
}: CreateActionCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={label}
      className={cn(
        "col-span-1 border-dashed border-2 bg-card transition-all rounded-xl hover:border-primary hover:bg-primary/5 hover:text-primary cursor-pointer flex items-center justify-center",
        variant === 'list' ? "h-16 flex-row" : "h-32 flex-col",
        className
      )}
    >
      <div className={cn(
        "flex items-center text-muted-foreground",
        variant === 'list' ? "flex-row gap-3 px-4 w-full" : "flex-col gap-2"
      )}>
        <Icon className={cn(variant === 'list' ? "h-5 w-5" : "h-8 w-8")} />
        <TextSM>{label}</TextSM>
      </div>
    </Card>
  );
}
