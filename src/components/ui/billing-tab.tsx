import * as React from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon, Download, MoreHorizontal, ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Eye, Monitor, Receipt } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { StaffMember } from '@/data/mock-data';
import type { Order } from '@/data/reportes';

type BillingTabProps = {
    date: DateRange | undefined;
    onDateChange: (range: DateRange | undefined) => void;
    selectedStaffId: string;
    onStaffChange: (value: string) => void;
    reportType: string;
    onReportTypeChange: (value: string) => void;
    staffMembers: StaffMember[];
    currentOrders: Order[];
    currentPage: number;
    totalPages: number;
    pageNumbers: number[];
    isAnimating: boolean;
    onPaginate: (pageNumber: number) => void;
    onViewDetails: (orderId: string) => void;
};

export function BillingTab({
    date,
    onDateChange,
    selectedStaffId,
    onStaffChange,
    reportType,
    onReportTypeChange,
    staffMembers,
    currentOrders,
    currentPage,
    totalPages,
    pageNumbers,
    isAnimating,
    onPaginate,
    onViewDetails }: BillingTabProps) {
    return (
        <TabsContent value="billing" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant="outline"
                                size="md"
                                className={cn('justify-start text-left font-normal truncate min-w-[240px]', !date && 'text-muted-foreground')}
                                startIcon={<CalendarIcon />}
                            >
                                {date?.from ? (
                                    date.to ? (<>{format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}</>)
                                        : (format(date.from, "dd/MM/yyyy"))) : (<span>Selecciona una fecha</span>)
                                }
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={onDateChange}
                                numberOfMonths={1}
                            />
                        </PopoverContent>
                    </Popover>

                    <Select value={selectedStaffId} onValueChange={onStaffChange}>
                        <SelectTrigger id="staff-select" className="w-[180px]">
                            <SelectValue placeholder="Empleado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {staffMembers.map(staff => (
                                <SelectItem key={staff.id} value={staff.id}>{staff.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={reportType} onValueChange={onReportTypeChange}>
                        <SelectTrigger id="report-type" className="w-[200px]">
                            <SelectValue placeholder="Tipo de Informe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="accounts">Reporte de Cuentas</SelectItem>
                            <SelectItem value="billing">Reporte de Facturación</SelectItem>
                            <SelectItem value="cash-drawer">Reporte de Cajas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="default" size="md" className="w-full sm:w-auto" startIcon={<Download />}>
                                Exportar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem><FileSpreadsheet className="h-4 w-4 mr-2" />Exportar a CSV</DropdownMenuItem>
                            <DropdownMenuItem><FileText className="h-4 w-4 mr-2" />Exportar a PDF</DropdownMenuItem>
                            <DropdownMenuItem><FileSpreadsheet className="h-4 w-4 mr-2" />Exportar a Excel</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <Card>
                <CardHeader title="Reporte de Cuentas" />
                <CardContent className="px-6 pb-2">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nº orden</TableHead>
                                    <TableHead>Hora</TableHead>
                                    <TableHead>Mesa</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead className="w-[40px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody
                                key={currentPage}
                                className={cn(
                                    'transition-opacity duration-300',
                                    isAnimating ? 'opacity-0' : 'opacity-100 animate-fade-in'
                                )}
                            >
                                {currentOrders.map((order) => (
                                    <TableRow key={order.order}>
                                        <TableCell className="font-medium">{order.order}</TableCell>
                                        <TableCell>{order.time}</TableCell>
                                        <TableCell>{order.table}</TableCell>
                                        <TableCell>{order.name}</TableCell>
                                        <TableCell>{order.total}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={
                                                    order.status === 'Completado'
                                                        ? 'completed'
                                                        : order.status === 'En Progreso'
                                                            ? 'in-progress'
                                                            : 'cancelled'
                                                }
                                            >
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size='md'>
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => onViewDetails(order.order)}><Eye />Ver detalles</DropdownMenuItem>
                                                    <DropdownMenuItem><Download />Descargar PDF</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem><Monitor />Reabrir en TPV</DropdownMenuItem>
                                                    <DropdownMenuItem><Receipt />Generar/Borrar factura</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onPaginate(currentPage - 1)} disabled={currentPage === 1}>
                        <ChevronLeft />
                    </Button>
                    {pageNumbers.map(number => (
                        <Button
                            key={number}
                            variant={currentPage === number ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPaginate(number)}
                        >
                            {number}
                        </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => onPaginate(currentPage + 1)} disabled={currentPage === totalPages}>
                        <ChevronRight />
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
    );
}

