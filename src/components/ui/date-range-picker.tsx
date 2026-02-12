"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
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
}

export function CalendarDateRangePicker({
    className,
    date,
    setDate,
}: CalendarDateRangePickerProps) {
    const [internalDate, setInternalDate] = React.useState<DateRange | undefined>({
        from: new Date(2024, 5, 20), // June 2024 default for demo
        to: addDays(new Date(2024, 5, 20), 20),
    })

    // Use props if provided, otherwise internal state
    const selectedDate = date || internalDate
    const setSelectedDate = setDate || setInternalDate

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal sm:w-[260px]",
                            !selectedDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate?.from ? (
                            selectedDate.to ? (
                                <>
                                    {format(selectedDate.from, "LLL dd, y")} -{" "}
                                    {format(selectedDate.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(selectedDate.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={selectedDate?.from}
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
