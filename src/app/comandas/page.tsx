'use client';

import * as React from 'react';
import { addDays, format, isWithinInterval } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Download,
    Settings,
    Pencil,
    Printer,
    Eye,
    Activity,
    CheckCircle,
    XCircle,
    FileText,
    CreditCard,
    Ban } from 'lucide-react';

import type { Order, OrderDetails, OrderItem } from '@/types/orders';
import { exportFields, defaultViewConfig, type ViewConfig } from '@/app/comandas/_data/config';
import { EditOrderDialog } from '@/components/dialogs/comandas-edit-order-dialog';
import { OrderDetailsDialog } from '@/components/dialogs/comandas-order-details-dialog';
import { ViewConfigDialog } from '@/components/dialogs/comandas-config-dialog';
import { CancelPartialDialog } from '@/components/dialogs/comandas-cancel-partial-dialog';

// Convex imports
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useEstablishments } from '@/hooks/useEstablishments';

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/dialogs/global-alert-dialog";
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { ExportModal, type ExportFormat } from '@/components/dialogs/comandas-export-dialog';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { SearchInput } from '@/components/ui/search-input';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';

// Helper para formatear precios en euros
const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Helper para formatear timestamps
const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm');
};

const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'yyyy-MM-dd');
};

// Map de status para UI
const statusLabels: Record<string, string> = {
    'open': 'Abierto',
    'paid': 'Pagado',
    'cancelled': 'Cancelado',
    'refunded': 'Reembolsado'
};

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'completed' | 'in-progress' | 'cancelled'> = {
    'open': 'in-progress',
    'paid': 'completed',
    'cancelled': 'cancelled',
    'refunded': 'cancelled'
};

export default function ComandasPage() {
    const { toast } = useToast();
    const { activeEstablishment } = useEstablishments();

    // Estados para los filtros y la paginación
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: addDays(new Date(), -7),
        to: new Date()
    });
    const [searchTerm, setSearchTerm] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage, setItemsPerPage] = React.useState(defaultViewConfig.itemsPerPage);

    // Estados para selección múltiple
    const [selectedOrders, setSelectedOrders] = React.useState<Set<string>>(new Set());

    // Estados para el diálogo de detalles
    const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

    // Estado para el diálogo de edición
    const [editingOrderId, setEditingOrderId] = React.useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = React.useState(false);

    // Export and configuration states
    const [isExportOpen, setIsExportOpen] = React.useState(false);
    const [isConfigOpen, setIsConfigOpen] = React.useState(false);
    const [viewConfig, setViewConfig] = React.useState<ViewConfig>(defaultViewConfig);

    // Estado para el diálogo de anulación parcial
    const [isPartialCancelOpen, setIsPartialCancelOpen] = React.useState(false);
    const [orderToPartialCancel, setOrderToPartialCancel] = React.useState<Order | null>(null);

    // Query para obtener detalles de la orden a anular parcialmente
    const partialCancelOrderDetails = useQuery(
        api.orders.getOrderDetails,
        orderToPartialCancel ? { orderId: orderToPartialCancel._id as Id<"orders"> } : "skip"
    );

    // Convex Queries
    const startTimestamp = date?.from ? new Date(date.from.setHours(0, 0, 0, 0)).getTime() : undefined;
    const endTimestamp = date?.to ? new Date(date.to.setHours(23, 59, 59, 999)).getTime() : undefined;

    const ordersData = useQuery(
        api.orders.getOrdersForComandas,
        activeEstablishment?.id
            ? {
                establishmentId: activeEstablishment.id as Id<"establishments">,
                startDate: startTimestamp,
                endDate: endTimestamp,
                limit: 100, // Cargamos más para filtrar en cliente
            }
            : "skip"
    );

    const orderDetailsData = useQuery(
        api.orders.getOrderDetails,
        selectedOrderId ? { orderId: selectedOrderId as Id<"orders"> } : "skip"
    );

    const editingOrderDetails = useQuery(
        api.orders.getOrderDetails,
        editingOrderId ? { orderId: editingOrderId as Id<"orders"> } : "skip"
    );

    // Convex Mutations
    const cancelOrderMutation = useMutation(api.orders.cancelOrder);
    const partialCancelOrderMutation = useMutation(api.orders.partialCancelOrder);

    const orders: Order[] = ordersData?.orders || [];
    const ordersLoading = ordersData === undefined;

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
            description: 'Los ajustes de visualización se han aplicado.'
        });
        setIsConfigOpen(false);
    };

    const handleExport = async (options: {
        format: ExportFormat;
        fields: string[];
        dateRange?: { from: Date | undefined; to: Date | undefined };
    }) => {
        // TODO: Implement actual export logic (API call or file generation)
        console.log('Exporting orders:', options);
    };

    React.useEffect(() => {
        setCurrentPage(1);
        setSelectedOrders(new Set());
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
            const newSelected = new Set(currentOrders.map(o => o._id));
            setSelectedOrders(newSelected as Set<string>);
        }
    };

    const handlePrintSelected = () => {
        toast({
            title: "Imprimiendo tickets",
            description: `Enviando ${selectedOrders.size} tickets a la impresora...`
        });
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrderId(order._id);
        setIsDetailsOpen(true);
    };

    const handleEditOrder = (order: Order) => {
        setEditingOrderId(order._id);
        setIsEditOpen(true);
    };

    const handleSaveEditedOrder = (updatedOrder: OrderDetails) => {
        toast({
            title: "Comanda actualizada",
            description: `La comanda #${updatedOrder.orderNumber} ha sido modificada correctamente.`
        });
        setIsEditOpen(false);
        setEditingOrderId(null);
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        if (newStatus === 'cancelled') {
            try {
                await cancelOrderMutation({
                    orderId: orderId as Id<"orders">,
                    reason: "Cancelado desde panel de comandas"
                });
                toast({
                    title: "Comanda cancelada",
                    description: "La comanda ha sido cancelada correctamente."
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "No se pudo cancelar la comanda.",
                    variant: "destructive"
                });
            }
        } else {
            toast({
                title: "Estado Actualizado",
                description: `La comanda ahora está ${statusLabels[newStatus] || newStatus}.`
            });
        }
    };

    const handleAnularComanda = (order: Order) => {
        setOrderToPartialCancel(order);
        setIsPartialCancelOpen(true);
    };

    const handlePartialCancelConfirm = async (itemsToCancel: OrderItem[]) => {
        if (orderToPartialCancel && itemsToCancel.length > 0) {
            try {
                const itemIds = itemsToCancel.map(item => item._id);
                const result = await partialCancelOrderMutation({
                    orderId: orderToPartialCancel._id as Id<"orders">,
                    itemIdsToCancel: itemIds as Id<"order_items">[],
                    reason: "Anulación parcial desde panel de comandas"
                });

                if (result.newOrderId) {
                    toast({
                        title: "Anulación parcial completada",
                        description: `Se anularon ${itemsToCancel.length} productos. Se creó una nueva comanda con los productos restantes.`
                    });
                } else {
                    toast({
                        title: "Comanda anulada",
                        description: `La comanda #${orderToPartialCancel.orderNumber} ha sido anulada completamente.`
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "No se pudo procesar la anulación.",
                    variant: "destructive"
                });
            }
            setIsPartialCancelOpen(false);
            setOrderToPartialCancel(null);
        }
    };

    // Filtrar pedidos por término de búsqueda
    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(searchLower) ||
            (order.customerName?.toLowerCase() || '').includes(searchLower) ||
            (order.tableLabel?.toLowerCase() || '').includes(searchLower) ||
            (order.environmentName?.toLowerCase() || '').includes(searchLower);

        return matchesSearch;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <PageContainer>
            <PageHeader title="Historial de Pedidos" />
            <PageContent>


                <Card>
                    <CardHeader className="space-y-0">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <SearchInput
                                containerClassName="w-full lg:w-[400px]"
                                placeholder="Buscar por orden, mesa, cliente..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                                <CalendarDateRangePicker date={date} setDate={setDate} className="w-full sm:w-auto" />

                                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                    {selectedOrders.size > 0 && (
                                        <Button variant="secondary" startIcon={<Printer/>} onClick={handlePrintSelected}>
                                            Imprimir ({selectedOrders.size})
                                        </Button>
                                    )}

                                    <Button variant="outline" size="md" className="shrink-0" startIcon={<Settings/>} onClick={() => setIsConfigOpen(true)} />
                                    <Button variant='default' size='md' className="shrink-0" startIcon={<Download/>} onClick={() => setIsExportOpen(true)}>
                                        Exportar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent padding="flush">
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
                                        {viewConfig.showStatus && <TableHead className="text-center">Estado</TableHead>}
                                        <TableHead className="text-left">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody
                                    key={currentPage}
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
                                        <TableRow key={order._id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedOrders.has(order._id)}
                                                    onCheckedChange={() => toggleOrderSelection(order._id)}
                                                />
                                            </TableCell>
                                            {viewConfig.showOrder && <TableCell className="font-medium">{order.orderNumber}</TableCell>}
                                            {viewConfig.showTime && <TableCell>{formatTime(order.createdAt)}</TableCell>}
                                            {viewConfig.showTable && <TableCell>{order.tableLabel ? `${order.tableLabel}${order.environmentName ? ` (${order.environmentName})` : ''}` : '-'}</TableCell>}
                                            {viewConfig.showName && <TableCell>{order.customerName || order.staffName}</TableCell>}
                                            {viewConfig.showTotal && <TableCell>{formatEuro(order.totalAmount)}</TableCell>}
                                            {viewConfig.showStatus && <TableCell className="text-center">
                                                <Badge variant={order.totalAmount < 0 ? 'cancelled' : (statusVariants[order.status] || 'default')}>
                                                    {order.totalAmount < 0 ? 'Devuelto' : (statusLabels[order.status] || order.status)}
                                                </Badge>
                                            </TableCell>}
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size='md'>
                                                            <MoreHorizontal/>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                                            <Eye />
                                                            Ver detalles
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                                                            <Pencil />
                                                            Editar comanda
                                                        </DropdownMenuItem>
                                                        {order.status === 'open' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleAnularComanda(order)}>
                                                                    <Ban />
                                                                    Anular comanda
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
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
                            <Button variant="outline" size="md" startIcon={<ChevronLeft />} onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                            {pageNumbers.map(number => (
                                <Button
                                    key={number}
                                    variant={currentPage === number ? "default" : "outline"}
                                    size="md"
                                    className="hidden sm:inline-flex"
                                    onClick={() => paginate(number)}
                                >
                                    {number}
                                </Button>
                            ))}
                            <Button variant="outline" size="md" startIcon={<ChevronRight />} onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                        </div>
                    </CardFooter>
                </Card>
            </PageContent>
            <OrderDetailsDialog
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                order={orderDetailsData as OrderDetails | null}
                onEdit={(order) => {
                    setIsDetailsOpen(false);
                    handleEditOrder(order as Order);
                }}
                onPrint={(order) => {
                    toast({
                        title: "Imprimiendo ticket",
                        description: `Enviando ticket #${order.orderNumber} a la impresora...` });
                }}
            />

            <EditOrderDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                order={editingOrderDetails as OrderDetails | null}
                onSave={handleSaveEditedOrder}
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

            <CancelPartialDialog
                order={partialCancelOrderDetails || null}
                open={isPartialCancelOpen}
                onOpenChange={setIsPartialCancelOpen}
                onConfirm={handlePartialCancelConfirm}
            />
        </PageContainer>
    );
}

