'use client';

import * as React from 'react';
import { MoreHorizontal, Download, FileText, Activity, Eye, PlayCircle, CheckCircle, XCircle, Printer, Ban, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { mockOrders } from '@/data/mock-data';
import { DateRange } from 'react-day-picker';

interface RecentOrdersProps {
    className?: string;
    date?: DateRange;
}

export function RecentOrders({ className, date }: RecentOrdersProps) {
    // Estado para la paginación de la tabla de comandas.
    const [currentPage, setCurrentPage] = React.useState(1);
    const [ordersPerPage] = React.useState(8);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // ✅ Filtrar comandas basadas en la fecha global (Simulado)
    const { currentOrders } = React.useMemo(() => {
        // En una implementación real, filtraríamos mockOrders por la prop 'date'
        const filtered = mockOrders.slice(0, 15);
        return {
            currentOrders: filtered.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage),
        };
    }, [date, currentPage, ordersPerPage]);

    const totalPages = Math.ceil(mockOrders.length / ordersPerPage);

    /**
     * Cambia la página actual de la tabla de comandas.
     * @param {number} pageNumber - El número de página al que se quiere navegar.
     */
    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentPage(pageNumber);
            setIsAnimating(false);
        }, 300);
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader 
                title="Comandas Recientes" 
                icon={ShoppingBag}
                actions={
                    <div className="flex gap-2">
                        <Select defaultValue="csv">
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="xlsx">Excel</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="md">
                            <Download/>
                        </Button>
                    </div>
                }
            />
            <CardContent className="flex-grow">
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden md:table-cell text-center">
                                    <Checkbox aria-label="Seleccionar todo" />
                                </TableHead>
                                <TableHead>Orden</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Mesa</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead className="w-[60px] text-center">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody isAnimating={isAnimating}>
                            {currentOrders.map((order) => (
                                <TableRow key={order.order}>
                                    <TableCell className="hidden md:table-cell text-center">
                                        <Checkbox />
                                    </TableCell>
                                    <TableCell className="font-medium">{order.order}</TableCell>
                                    <TableCell>{order.time}</TableCell>
                                    <TableCell>{order.table}</TableCell>
                                    <TableCell>{order.name}</TableCell>
                                    <TableCell>{order.total}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={order.status === 'Completado' ? 'completed' : order.status === 'En Progreso' ? 'in-progress' : 'cancelled'}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size='md'>
                                                    <MoreHorizontal />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem>
                                                    <Eye />
                                                    Ver detalles
                                                </DropdownMenuItem>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>
                                                        <Activity />
                                                        Cambiar Estado
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem>
                                                            <PlayCircle />
                                                            En Progreso
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <CheckCircle />
                                                            Completado
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <XCircle />
                                                            Cancelado
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuItem>
                                                    <Printer />
                                                    Reimprimir
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <Ban />
                                                    Anular comanda
                                                </DropdownMenuItem>
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
                <Button variant="outline" size="md" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                    <ChevronLeft />
                </Button>
                {pageNumbers.map(number => (
                    <Button
                        key={number}
                        variant={currentPage === number ? "default" : "outline"}
                        size="md"
                        onClick={() => paginate(number)}
                    >
                        {number}
                    </Button>
                ))}
                <Button variant="outline" size="md" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                    <ChevronRight />
                </Button>
            </CardFooter>
        </Card>
    );
}
