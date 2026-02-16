'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface DashboardListItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string | number;
  labelSecondary?: string | number;
  suffix?: React.ReactNode;
  className?: string;
}

export function DashboardListItem({ 
  icon, 
  title, 
  subtitle, 
  value, 
  labelSecondary,
  suffix,
  className 
}: DashboardListItemProps) {
  return (
    <div className={cn("flex items-center justify-between py-3 h-[52px]", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && <div className="shrink-0 flex items-center justify-center">{icon}</div>}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate leading-tight">{title}</span>
          {subtitle && <span className="text-xs text-muted-foreground truncate leading-tight">{subtitle}</span>}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0 ml-4">
        {(value || labelSecondary) && (
          <div className="flex items-baseline gap-1.5">
            {labelSecondary && <span className="text-xs text-muted-foreground">{labelSecondary}</span>}
            {value && <span className="text-sm font-bold">{value}</span>}
          </div>
        )}
        {suffix}
      </div>
    </div>
  )
}

export function DashboardList({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("divide-y divide-border", className)}>
      {children}
    </div>
  )
}
