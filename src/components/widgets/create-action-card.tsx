"use client";

import type { ElementType, KeyboardEvent } from "react";
import { PlusCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CreateActionCardProps = {
  label: string;
  onClick?: () => void;
  className?: string;
  icon?: ElementType;
};

export function CreateActionCard({
  label,
  onClick,
  className,
  icon: Icon = PlusCircle,
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
        "col-span-1 flex items-center justify-center min-h-[200px] border-2 border-dashed bg-transparent hover:border-primary hover:text-primary transition-colors cursor-pointer",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Icon className="h-8 w-8" />
        <p className="font-semibold">{label}</p>
      </div>
    </Card>
  );
}
