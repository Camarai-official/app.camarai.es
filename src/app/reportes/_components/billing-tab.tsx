import * as React from 'react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon, Download, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
    onViewDetails,
}: BillingTabProps) {
    return (
        <TabsContent value="billing" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-bold text-muted-foreground">Filtros del Informe</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="date-range">Rango de Fechas</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant="outline"
                                    className={cn('w-full justify-start text-left font-normal truncate', !date && 'text-muted-foreground')}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
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
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="staff-select">Empleado</Label>
                        <Select value={selectedStaffId} onValueChange={onStaffChange}>
                            <SelectTrigger id="staff-select">
                                <SelectValue placeholder="Seleccionar empleado..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los empleados</SelectItem>
                                {staffMembers.map(staff => (
                                    <SelectItem key={staff.id} value={staff.id}>{staff.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="report-type">Tipo de Informe</Label>
                        <Select value={reportType} onValueChange={onReportTypeChange}>
                            <SelectTrigger id="report-type">
                                <SelectValue placeholder="Seleccionar tipo..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="accounts">Reporte de Cuentas</SelectItem>
                                <SelectItem value="billing">Reporte de Facturación</SelectItem>
                                <SelectItem value="cash-drawer">Reporte de Cajas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="default" className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Exportar</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Exportar a CSV</DropdownMenuItem>
                                <DropdownMenuItem>Exportar a PDF</DropdownMenuItem>
                                <DropdownMenuItem>Exportar a Excel</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4">
                    <div>
                        <CardTitle className="text-base font-bold text-muted-foreground">Reporte de Cuentas</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nº orden</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Mesa</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Estado</TableHead>
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
                                    <TableCell>
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
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onViewDetails(order.order)}>Ver detalles</DropdownMenuItem>
                                                <DropdownMenuItem>Descargar PDF</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>Reabrir en TPV</DropdownMenuItem>
                                                <DropdownMenuItem>Generar/Borrar factura</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex justify-end items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPaginate(currentPage - 1)} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {pageNumbers.map(number => (
                        <Button
                            key={number}
                            variant={currentPage === number ? "default" : "outline"}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPaginate(number)}
                        >
                            {number}
                        </Button>
                    ))}
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onPaginate(currentPage + 1)} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
    );
}
