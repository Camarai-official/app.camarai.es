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
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEstablishments } from '@/hooks/useEstablishments';
import { DateRange } from 'react-day-picker';

interface RecentOrdersProps {
    className?: string;
    date?: DateRange;
}

export function RecentOrders({ className, date }: RecentOrdersProps) {
    const { activeEstablishment } = useEstablishments();
    
    // Estado para la paginación de la tabla de comandas.
    const [currentPage, setCurrentPage] = React.useState(1);
    const [ordersPerPage] = React.useState(8);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // ✅ Real orders from Convex
    const recentOrders = useQuery(
        api.orders.getRecentOrders,
        activeEstablishment?.id ? { establishmentId: activeEstablishment.id as any, limit: 50 } : 'skip'
    );

    // ✅ Filtrar comandas basadas en la fecha global
    const { currentOrders, totalPages } = React.useMemo(() => {
        if (!recentOrders || recentOrders.length === 0) {
            return { currentOrders: [], totalPages: 1 };
        }

        let filtered = recentOrders;
        
        // Filter by date range if provided
        if (date?.from && date?.to) {
            const from = date.from.getTime();
            const to = date.to.getTime();
            filtered = recentOrders.filter(order => 
                order.created_at >= from && order.created_at <= to
            );
        }

        const totalPages = Math.ceil(filtered.length / ordersPerPage);
        const paginated = filtered.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);
        
        return { currentOrders: paginated, totalPages };
    }, [recentOrders, date, currentPage, ordersPerPage]);

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

    // Format time from timestamp
    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    // Format total from cents to euros
    const formatTotal = (amount: number) => {
        return `€${(amount / 100).toFixed(2)}`;
    };

    // Map status to badge variant
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'completed';
            case 'open': return 'in-progress';
            case 'cancelled': return 'cancelled';
            default: return 'default';
        }
    };

    // Map status to display text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid': return 'Completado';
            case 'open': return 'En Progreso';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    return (
        <Card height="full" className={className}>
            <CardHeader 
                title="Comandas Recientes" 
                icon={ShoppingBag}
                actions={
                    <div className="flex gap-2">
                        <Select defaultValue="csv">
                            <SelectTrigger width="xs">
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
            <CardContent flex>
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead visibility="hidden-mobile" align="center">
                                    <Checkbox aria-label="Seleccionar todo" />
                                </TableHead>
                                <TableHead>Orden</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Mesa</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead align="center">Estado</TableHead>
                                <TableHead align="center">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody isAnimating={isAnimating}>
                            {currentOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                                        No hay comandas disponibles
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell visibility="hidden-mobile" align="center">
                                            <Checkbox />
                                        </TableCell>
                                        <TableCell variant="medium">{order.orderNumber}</TableCell>
                                        <TableCell>{formatTime(order.created_at)}</TableCell>
                                        <TableCell>{order.tableLabel}</TableCell>
                                        <TableCell>{order.staffName}</TableCell>
                                        <TableCell>{formatTotal(order.totalAmount)}</TableCell>
                                        <TableCell align="center">
                                            <Badge variant={getStatusVariant(order.status)}>
                                                {getStatusText(order.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell align="center">
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter justify="end" gap="sm">
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
