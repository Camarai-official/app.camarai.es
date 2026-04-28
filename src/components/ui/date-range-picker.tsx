"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface CalendarDateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    date?: DateRange
    setDate?: (date: DateRange | undefined) => void
    /** Number of months to show, defaults to 2 */
    numberOfMonths?: number
    /** Placeholder text when no date is selected */
    placeholder?: string
    /** Align of the popover content */
    align?: "start" | "center" | "end"
    /** Close popover on select (only works for single dates normally, but we can wrap it) */
    closeOnSelect?: boolean
}

export function CalendarDateRangePicker({
    className,
    date,
    setDate,
    numberOfMonths = 2,
    placeholder = "Seleccionar fecha",
    align = "end",
    closeOnSelect = false,
    ...props
}: CalendarDateRangePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const [internalDate, setInternalDate] = React.useState<DateRange | undefined>()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Use props if provided, otherwise internal state
    const selectedDate = date !== undefined ? date : internalDate
    const setSelectedDate = (newDate: DateRange | undefined) => {
        if (setDate) {
            setDate(newDate)
        } else {
            setInternalDate(newDate)
        }
        
        // Logic to close based on range completion if needed
        if (closeOnSelect && newDate?.from && newDate?.to) {
            setOpen(false)
        }
    }

    // Return a simplified version for SSR/initial hydration to avoid ARIA mismatches
    if (!mounted) {
        return (
            <div className={cn("grid gap-2", className)} {...props}>
                <Button
                    variant={"outline"}
                    size="md"
                    className={cn(
                        "justify-start text-left font-normal w-full",
                        !selectedDate && "text-muted-foreground"
                    )}
                    startIcon={<CalendarIcon />}
                    responsive={false}
                >
                    {placeholder}
                </Button>
            </div>
        )
    }

    return (
        <div className={cn("grid gap-2", className)} {...props}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        size="md"
                        className={cn(
                            "justify-start text-left font-normal w-full",
                            !selectedDate && "text-muted-foreground"
                        )}
                        startIcon={<CalendarIcon />}
                        responsive={false}
                    >
                        {selectedDate?.from ? (
                            selectedDate.to ? (
                                <>
                                    {format(selectedDate.from, "LLL dd", { locale: es })} -{" "}
                                    {format(selectedDate.to, "LLL dd, y", { locale: es })}
                                </>
                            ) : (
                                format(selectedDate.from, "PPP", { locale: es })
                            )
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align={align}>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={selectedDate?.from}
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        numberOfMonths={numberOfMonths}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
