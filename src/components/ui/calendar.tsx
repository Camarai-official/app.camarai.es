"use client"
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DropdownProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  variant?: 'default' | 'grid';
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  variant = 'default',
  ...props
}: CalendarProps) {
  const isGrid = variant === 'grid';
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", isGrid && "h-full p-0", className)}
      classNames={{
        months: cn("flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0", isGrid && "space-y-4 h-full"),
        month: cn("space-y-4", isGrid && "w-full h-full flex flex-col"),
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost", size: "sm" })
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: cn("w-full border-collapse space-y-1", isGrid && "space-y-0 h-full flex flex-col"),
        head_row: cn("flex", isGrid && "grid grid-cols-7"),
        head_cell: cn(
          "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
          isGrid && "w-full text-center"
        ),
        row: cn("flex w-full mt-2", isGrid && "grid grid-cols-7 w-full gap-1 flex-1 mt-0"),
        cell: cn(
          "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          isGrid && "h-full w-full [&:has([aria-selected])]:bg-transparent"
        ),
        day: cn(
          buttonVariants({ variant: "ghost", size: "md" }),
          "font-normal",
          isGrid && "h-full w-full text-base font-bold"
        ),
        day_range_end: "day-range-end",
        tbody: cn(isGrid && "flex-1 flex flex-col justify-between"),
        day_selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          isGrid && "bg-background text-background-foreground hover:bg-background hover:text-background-foreground"
        ),
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
