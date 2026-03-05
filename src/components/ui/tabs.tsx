"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { 
    marginBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  }
>(({ className, marginBottom = 'none', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-auto items-center justify-center text-muted-foreground overflow-x-auto no-scrollbar flex-nowrap w-full transition-all",
      // Mobile "Navbar" look
      "bg-muted/30 p-1.5 gap-1.5 rounded-2xl border border-border/50",
      // Desktop reset
      "sm:bg-transparent sm:p-0 sm:gap-1 sm:rounded-none sm:border-none sm:justify-start",
      marginBottom === 'sm' && "mb-2",
      marginBottom === 'md' && "mb-4",
      marginBottom === 'lg' && "mb-6",
      marginBottom === 'xl' && "mb-8",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    icon?: React.ElementType
    iconClassName?: string
  }
>(({ className, icon: Icon, iconClassName, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "group inline-flex items-center justify-center whitespace-nowrap rounded-xl px-2.5 sm:px-4 py-2 h-10 min-w-10 text-[11px] sm:text-sm font-semibold transition-all duration-300 shrink-0 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-none",
      className
    )}
    {...props}
  >
    {Icon && (
      <Icon 
        className={cn(
          "h-4 w-4 shrink-0 transition-all duration-300",
          children ? "sm:mr-2 group-data-[state=active]:mr-2 mr-0" : "",
          "text-muted-foreground group-data-[state=active]:text-secondary-foreground",
          iconClassName
        )} 
      />
    )}
    {children && (
      <span className="overflow-hidden transition-all duration-300 max-w-0 group-data-[state=active]:max-w-[200px] sm:max-w-none opacity-0 group-data-[state=active]:opacity-100 sm:opacity-100">
        {children}
      </span>
    )}
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & { spaced?: boolean }
>(({ className, spaced = false, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "focus-visible:outline-none",
      spaced && "space-y-6",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
