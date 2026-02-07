
'use client';

import * as React from 'react';
import { addDays, format, isWithinInterval, parse } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
    CalendarIcon,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Search,
    Download,
    Settings,
    Pencil,
    Printer,
    Eye,
    Activity,
    PlayCircle,
    CheckCircle,
    XCircle,
    FileText,
    CreditCard,
    Ban,
} from 'lucide-react';

import type { Order, OrderDetails, OrderStatus } from '@/types/orders';
import { mockOrderDetails, mockOrderProducts, mockOrderTables, mockOrders } from '@/data/orders';
import { exportFields, defaultViewConfig, type ViewConfig } from '@/app/comandas/_data/config';
import { EditOrderDialog } from '@/app/comandas/_components/edit-order-dialog';
import { OrderDetailsDialog } from '@/app/comandas/_components/order-details-dialog';
import { ViewConfigDialog } from '@/app/comandas/_components/view-config-dialog';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { ExportModal } from '@/components/features/export-modal';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';

export default function ComandasPage() {
    const { toast } = useToast();

    // Estado local para las comandas (inicializado con mock data)
    const [orders, setOrders] = React.useState<Order[]>(mockOrders);
    const ordersLoading = false;

    // Estados para los filtros y la paginación.
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date(),
    });
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(defaultViewConfig.itemsPerPage);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // Estados para selección múltiple
    const [selectedOrders, setSelectedOrders] = React.useState<Set<string>>(new Set());

    // Estados para el diálogo de detalles.
    const [selectedOrder, setSelectedOrder] = React.useState<OrderDetails | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

    // Estado para el diálogo de edición
    const [editingOrder, setEditingOrder] = React.useState<OrderDetails | null>(null);
    const [isEditOpen, setIsEditOpen] = React.useState(false);

    // Export and configuration states
    const [isExportOpen, setIsExportOpen] = React.useState(false);
    const [isConfigOpen, setIsConfigOpen] = React.useState(false);
    const [viewConfig, setViewConfig] = React.useState<ViewConfig>(defaultViewConfig);

    type ExportOptions = { format: string; fields: string[]; dateRange?: DateRange };

    // Export handler
    const handleExport = async (options: ExportOptions) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Exporting:', options);
    };

    // Config handlers
    const handleConfigChange = <K extends keyof ViewConfig>(key: K, value: ViewConfig[K]) => {
        setViewConfig(prev => ({ ...prev, [key]: value }));
        if (key === 'itemsPerPage' && typeof value === 'number') {
            setItemsPerPage(value);
            setCurrentPage(1);
        }
    };

    const handleSaveConfig = () => {
        toast({
            title: 'Configuración guardada',
            description: 'Los ajustes de visualización se han aplicado.',
        });
        setIsConfigOpen(false);
    };

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, date]);

    // Handlers de selección
    const toggleOrderSelection = (orderId: string) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
        } else {
            newSelected.add(orderId);
        }
        setSelectedOrders(newSelected);
    };

    const toggleAllSelection = () => {
        if (selectedOrders.size === currentOrders.length && currentOrders.length > 0) {
            setSelectedOrders(new Set());
        } else {
            const newSelected = new Set();
            currentOrders.forEach(order => newSelected.add(order.order));
            setSelectedOrders(newSelected as Set<string>);
        }
    };

    const handlePrintSelected = () => {
        toast({
            title: "Imprimiendo tickets",
            description: `Enviando ${selectedOrders.size} tickets a la impresora...`,
        });
        // Aquí iría la lógica real de impresión
    };

    const handleViewDetails = (order: Order) => {
        const items = (mockOrderDetails as any)[order.order] || [];
        const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
        const tax = subtotal * 0.21;
        setSelectedOrder({ ...order, items, subtotal, tax });
        setIsDetailsOpen(true);
    };

    const handleEditOrder = (order: Order) => {
        const items = (mockOrderDetails as any)[order.order] || [];
        const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
        const tax = subtotal * 0.21;
        setEditingOrder({ ...order, items, subtotal, tax });
        setIsEditOpen(true);
    };

    const handleSaveEditedOrder = (updatedOrder: OrderDetails) => {
        setOrders(prevOrders => prevOrders.map(o =>
            o.order === updatedOrder.order
                ? { ...o, name: updatedOrder.name, table: updatedOrder.table, total: updatedOrder.total }
                : o
        ));

        (mockOrderDetails as any)[updatedOrder.order] = updatedOrder.items;

        toast({
            title: "Comanda actualizada",
            description: `La comanda #${updatedOrder.order} ha sido modificada correctamente.`,
        });
    };

    const handleStatusChange = (orderOrder: string, newStatus: OrderStatus) => {
        setOrders(prevOrders => prevOrders.map(o =>
            o.order === orderOrder ? { ...o, status: newStatus } : o
        ));

        toast({
            title: "Estado Actualizado",
            description: `La comanda #${orderOrder} ahora está ${newStatus}.`,
        });
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.order.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.table.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesDate = true;
        if (date?.from && date?.to && order.date) {
            const orderDate = parse(order.date, 'yyyy-MM-dd', new Date());
            matchesDate = isWithinInterval(orderDate, { start: date.from, end: date.to });
        }

        return matchesSearch && matchesDate;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setIsAnimating(true);
        setCurrentPage(pageNumber);
        setIsAnimating(false);
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex flex-1 flex-col h-full">
            <PageHeader title="Historial de Pedidos" />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-2 md:gap-6 md:p-6 md:pt-3">


                <Card>
                    <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar por orden, mesa, cliente..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                            <CalendarDateRangePicker date={date} setDate={setDate} />

                            {selectedOrders.size > 0 && (
                                <Button variant="secondary" onClick={handlePrintSelected}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimir ({selectedOrders.size})
                                </Button>
                            )}

                            <Button variant="outline" size="icon" onClick={() => setIsConfigOpen(true)}>
                                <Settings className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => setIsExportOpen(true)}>
                                <Download className="mr-2 h-4 w-4" />
                                Exportar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]">
                                            <Checkbox
                                                checked={currentOrders.length > 0 && selectedOrders.size === currentOrders.length}
                                                onCheckedChange={toggleAllSelection}
                                                aria-label="Seleccionar todo"
                                            />
                                        </TableHead>
                                        {viewConfig.showOrder && <TableHead>Nºorden</TableHead>}
                                        {viewConfig.showTime && <TableHead>Hora</TableHead>}
                                        {viewConfig.showTable && <TableHead>Mesa</TableHead>}
                                        {viewConfig.showName && <TableHead>Nombre</TableHead>}
                                        {viewConfig.showTotal && <TableHead>Total</TableHead>}
                                        {viewConfig.showStatus && <TableHead>Estado</TableHead>}
                                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody
                                    key={currentPage}
                                    className={cn(
                                        'transition-opacity duration-300',
                                        isAnimating ? 'opacity-0' : 'opacity-100'
                                    )}
                                >
                                    {false && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">Cargando comandas...</TableCell>
                                        </TableRow>
                                    )}
                                    {currentOrders.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">No se encontraron comandas.</TableCell>
                                        </TableRow>
                                    )}
                                    {currentOrders.map((order) => (
                                        <TableRow key={order.order}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedOrders.has(order.order)}
                                                    onCheckedChange={() => toggleOrderSelection(order.order)}
                                                />
                                            </TableCell>
                                            {viewConfig.showOrder && <TableCell className="font-medium">{order.order}</TableCell>}
                                            {viewConfig.showTime && <TableCell>{order.time}</TableCell>}
                                            {viewConfig.showTable && <TableCell>{order.table}</TableCell>}
                                            {viewConfig.showName && <TableCell>{order.name}</TableCell>}
                                            {viewConfig.showTotal && <TableCell>{order.total}</TableCell>}
                                            {viewConfig.showStatus && <TableCell>
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
                                            </TableCell>}
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
                                                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                                            Ver detalles
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                                                            <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                                                            Editar comanda
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                Cambiar Estado
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuSubContent>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(order.order, 'En Progreso')}>
                                                                    <PlayCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                    En Progreso
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(order.order, 'Completado')}>
                                                                    <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                    Completado
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(order.order, 'Cancelado')}>
                                                                    <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                    Cancelado
                                                                </DropdownMenuItem>
                                                            </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                        <DropdownMenuItem>
                                                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                                            Exportar a PDF
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                                                            Marcar como pagada
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Ban className="mr-2 h-4 w-4 text-muted-foreground" />
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
                    <CardFooter className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                            Mostrando <strong>{Math.min(indexOfFirstItem + 1, filteredOrders.length)}-{Math.min(indexOfLastItem, filteredOrders.length)}</strong> de <strong>{filteredOrders.length}</strong> comandas.
                        </div>
                        <div className="flex justify-end items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {pageNumbers.map(number => (
                                <Button
                                    key={number}
                                    variant={currentPage === number ? "default" : "outline"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => paginate(number)}
                                >
                                    {number}
                                </Button>
                            ))}
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </main>
            <OrderDetailsDialog
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                order={selectedOrder}
                onEdit={(order) => {
                    setIsDetailsOpen(false);
                    handleEditOrder(order as unknown as Order);
                }}
                onPrint={(order) => {
                    toast({
                        title: "Imprimiendo ticket",
                        description: `Enviando ticket #${order.order} a la impresora...`,
                    });
                }}
            />

            <EditOrderDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                order={editingOrder}
                onSave={handleSaveEditedOrder}
                products={mockOrderProducts}
                tables={mockOrderTables}
            />

            <ExportModal
                open={isExportOpen}
                onOpenChange={setIsExportOpen}
                title="Exportar Comandas"
                description="Exporta el historial de comandas con los filtros aplicados."
                fields={exportFields}
                showDateRange={true}
                onExport={handleExport}
            />

            <ViewConfigDialog
                open={isConfigOpen}
                onOpenChange={setIsConfigOpen}
                viewConfig={viewConfig}
                onConfigChange={handleConfigChange}
                onSave={handleSaveConfig}
            />
        </div>
    );
}
