import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { showOnDesktop?: boolean }
>(({ className, showOnDesktop = false, ...props }, ref) => (
  <div className={cn("relative w-full overflow-hidden rounded-lg", showOnDesktop && "hidden md:block")}>
    <div className="overflow-auto custom-scrollbar text-xs">
      <table
        ref={ref}
        className={cn("w-full caption-bottom", className)}
        {...props}
      />
    </div>
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("border-b bg-muted/20 h-12 text-md", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & { isAnimating?: boolean }
>(({ className, isAnimating, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0 text-xs transition-opacity duration-300",
      isAnimating ? "opacity-0" : "opacity-100",
      className
    )}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/40 font-medium", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { 
    align?: 'left' | 'center' | 'right';
    variant?: 'default' | 'medium';
    visibility?: 'default' | 'hidden-mobile' | 'hidden-desktop';
    width?: string | number;
  }
>(({ className, align = 'left', variant = 'default', visibility = 'default', width, style, ...props }, ref) => (
  <th
    ref={ref}
    style={{ width, ...style }}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      align === 'center' && "text-center",
      align === 'right' && "text-right",
      variant === 'medium' && "font-bold text-foreground",
      visibility === 'hidden-mobile' && "hidden sm:table-cell",
      visibility === 'hidden-desktop' && "sm:hidden",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { 
    align?: 'left' | 'center' | 'right';
    variant?: 'default' | 'medium' | 'mono';
    height?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
    textTransform?: 'capitalize' | 'none';
    textSize?: 'xs' | 'sm' | 'base';
    visibility?: 'default' | 'hidden-mobile' | 'hidden-desktop';
    width?: string | number;
  }
>(({ className, align = 'left', variant = 'default', height = 'none', textTransform = 'none', textSize = 'default' as any, visibility = 'default', width, style, ...props }, ref) => (
  <td
    ref={ref}
    style={{ width, ...style }}
    className={cn(
      "p-4 align-middle",
      align === 'center' && "text-center",
      align === 'right' && "text-right",
      align === 'left' && "text-left",
      variant === 'medium' && "font-medium",
      variant === 'mono' && "font-mono",
      height === 'sm' && "h-10",
      height === 'md' && "h-12",
      height === 'lg' && "h-16",
      height === 'xl' && "h-24",
      textTransform === 'capitalize' && "capitalize",
      textSize === 'xs' && "text-xs",
      textSize === 'sm' && "text-sm",
      textSize === 'base' && "text-base",
      visibility === 'hidden-mobile' && "hidden sm:table-cell",
      visibility === 'hidden-desktop' && "sm:hidden",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
