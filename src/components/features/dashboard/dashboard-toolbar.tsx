"use client";

import * as React from 'react';
import { Download, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DateRange } from "react-day-picker";

interface DashboardToolbarProps {
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
    onExport: () => void;
}

export function DashboardToolbar({ date, setDate, onExport }: DashboardToolbarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
            <div className="flex items-center space-x-2">
                <CalendarDateRangePicker date={date} setDate={setDate} />

                {/* Placeholder for future specific filters */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10 border-dashed">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtros
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                        <DropdownMenuSeparator variant="label" />
                        <DropdownMenuCheckboxItem checked>Turno Mañana</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked>Turno Tarde</DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>Sala Principal</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked>Terraza</DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="h-10" onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Informe Global (Excel)
                </Button>
            </div>
        </div>
    );
}
