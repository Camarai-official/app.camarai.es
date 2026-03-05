'use client';
import * as React from 'react';
import { addDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { DollarSign, TrendingUp, Archive, Users2, MessageSquare, Send, Eye, MousePointer, Phone, Clock, Calendar } from 'lucide-react';
import {
    mockStaffMembers,
    mockProducts,
    mockTaxes,
    mockIngredients,
    mockIngredientCategories,
    mockAbsenceRequests,
    getCategoryName,
    getTaxName
} from '@/data/mock-data';
import type { AbsenceRequest } from '@/data/mock-data';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import {
    allOrders,
    mockReportOrderDetails as mockOrderDetails,
    mockStaffTotals,
    mockTimeReportData
} from '@/data/reportes';
import type { OrderDetails } from '@/data/reportes';
import { BillingTab } from '@/components/ui/billing-tab';
import { PerformanceTab } from '@/components/ui/performance-tab';
import { StaffTab } from '@/components/ui/staff-tab';
import { InventoryTab } from '@/components/ui/inventory-tab';
import { CashClosingTab } from '@/components/ui/cash-closing-tab';
import { OrderDetailsDialog } from '@/components/dialogs/reportes-orderdetails-dialog';
import { MovementsDetailsDialog } from '@/components/dialogs/movements-details-dialog';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MetricCard } from '@/components/widgets/metric-card';
import { ActionTile } from '@/components/ui/action-tile';

// Mock WhatsApp metrics
const mockWhatsAppMetrics = {
    mensajesEnviados: 1247,
    mensajesEntregados: 1198,
    mensajesLeidos: 1089,
    pedidosViaWhatsApp: 89,
    reservasViaWhatsApp: 34,
    tasaRespuesta: 92,
    tiempoRespuestaPromedio: '2.5 min',
    conversaciones: [
        { id: 'conv-1', cliente: 'Carlos M.', tipo: 'Pedido', fecha: '2024-01-29 14:30', estado: 'Completado' },
        { id: 'conv-2', cliente: 'Ana G.', tipo: 'Reserva', fecha: '2024-01-29 13:15', estado: 'Confirmada' },
        { id: 'conv-3', cliente: 'Luis P.', tipo: 'Consulta', fecha: '2024-01-29 12:00', estado: 'Pendiente' },
        { id: 'conv-4', cliente: 'María R.', tipo: 'Pedido', fecha: '2024-01-29 11:45', estado: 'En preparación' },
        { id: 'conv-5', cliente: 'Pedro S.', tipo: 'Pedido', fecha: '2024-01-29 10:30', estado: 'Completado' },
    ] };

export default function ReportesPage() {
    // Local state for absence requests to simulate updates
    const [absenceRequests, setAbsenceRequests] = React.useState<AbsenceRequest[]>(mockAbsenceRequests);
    const [isInitialized, setIsInitialized] = React.useState(false);

    // Simulate initialization
    React.useEffect(() => {
        setIsInitialized(true);
    }, []);

    // Construct appData object to maintain compatibility with existing code
    const appData = {
        staffMembers: mockStaffMembers,
        products: mockProducts,
        taxes: mockTaxes,
        ingredients: mockIngredients,
        ingredientCategories: mockIngredientCategories,
        absenceRequests: absenceRequests };

    const updateAbsenceRequest = (id: string, data: Partial<AbsenceRequest>) => {
        setAbsenceRequests(prev => prev.map(req => req.id === id ? { ...req, ...data } : req));
    };

    const { toast } = useToast();

    // Shared Filters
    const [selectedStaffId, setSelectedStaffId] = React.useState<string>('all');
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date() });
    const [reportType, setReportType] = React.useState<string>('accounts');
    const [currentPage, setCurrentPage] = React.useState(1);
    const [ordersPerPage] = React.useState(11);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // Absence Filters
    const [selectedAbsenceType, setSelectedAbsenceType] = React.useState<string>('all');
    const [selectedAbsenceStatus, setSelectedAbsenceStatus] = React.useState<string>('all');

    // Dialog States
    const [selectedOrder, setSelectedOrder] = React.useState<OrderDetails | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
    const [isMovementsOpen, setIsMovementsOpen] = React.useState(false);

    // Cash closing state
    const [realCash, setRealCash] = React.useState<string>("");
    const initialCash = 100.00;
    const totalSales = 2875.50; // Mock data
    const cashSales = 1250.25; // Mock data
    const cardSales = 1625.25; // Mock data
    const theoreticalCash = initialCash + cashSales;
    const cashDifference = realCash ? parseFloat(realCash) - theoreticalCash : null;

    const handleViewDetails = (orderId: string) => {
        const details = mockOrderDetails[orderId] || null;
        if (details) {
            setSelectedOrder(details);
            setIsDetailsOpen(true);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se encontraron los detalles para esta comanda.' })
        }
    }

    // Pagination logic
    const totalPages = Math.ceil(allOrders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = allOrders.slice(indexOfFirstOrder, indexOfLastOrder);

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


    // --- Time Logs Logic ---
    const timeReportData = React.useMemo(() => {
        if (!isInitialized) return [];

        const filteredByStaff = mockTimeReportData.filter(entry =>
            selectedStaffId === 'all' || entry.log.staffMemberId === selectedStaffId
        );

        return filteredByStaff.filter(entry => {
            const logDate = new Date(entry.log.entrada);
            const isAfterFrom = !date?.from || logDate >= date.from;
            const isBeforeTo = !date?.to || logDate <= date.to;
            return isAfterFrom && isBeforeTo;
        });
    }, [selectedStaffId, date, isInitialized]);


    // --- Absence Requests Logic ---
    const filteredAbsenceRequests = appData.absenceRequests.filter(req => {
        const matchesStaff = selectedStaffId === 'all' || req.staffId === selectedStaffId;
        const matchesType = selectedAbsenceType === 'all' || req.type === selectedAbsenceType;
        const matchesStatus = selectedAbsenceStatus === 'all' || req.status === selectedAbsenceStatus;
        return matchesStaff && matchesType && matchesStatus;
    });

    const handleUpdateRequest = (req: AbsenceRequest, newStatus: AbsenceRequest['status']) => {
        updateAbsenceRequest(req.id, { status: newStatus });
        toast({
            title: `Solicitud ${newStatus === 'approved' ? 'aprobada' : 'rechazada'}`,
            description: `La solicitud de ${appData.staffMembers.find(s => s.id === req.staffId)?.nombre} ha sido actualizada.` });
    };


    if (!isInitialized) {
        return <div>Cargando datos...</div>
    }

    return (
        <PageContainer>
            <PageHeader title="Panel de Reportes & Cierre de Caja" />
            <PageContent>
                <Tabs defaultValue="billing">
                        <TabsList className="mb-4">
                            <TabsTrigger value="billing" icon={DollarSign}>Facturación</TabsTrigger>
                            <TabsTrigger value="performance" icon={TrendingUp}>Ventas</TabsTrigger>
                            <TabsTrigger value="hours" icon={Clock}>Personal</TabsTrigger>
                            <TabsTrigger value="absences" icon={Calendar}>Ausencias</TabsTrigger>
                            <TabsTrigger value="inventory" icon={Archive}>Inventario</TabsTrigger>
                            <TabsTrigger value="whatsapp" icon={MessageSquare}>WhatsApp</TabsTrigger>
                            <TabsTrigger value="cash-closing">Cierre</TabsTrigger>
                        </TabsList>

                    <BillingTab
                        date={date}
                        onDateChange={setDate}
                        selectedStaffId={selectedStaffId}
                        onStaffChange={setSelectedStaffId}
                        reportType={reportType}
                        onReportTypeChange={setReportType}
                        staffMembers={appData.staffMembers}
                        currentOrders={currentOrders}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageNumbers={pageNumbers}
                        isAnimating={isAnimating}
                        onPaginate={paginate}
                        onViewDetails={handleViewDetails}
                    />
                    <PerformanceTab products={appData.products} orders={allOrders} getCategoryName={getCategoryName} />
                    <StaffTab
                        mode="hours"
                        staffMembers={appData.staffMembers}
                        selectedStaffId={selectedStaffId}
                        onStaffChange={setSelectedStaffId}
                        date={date}
                        onDateChange={setDate}
                        timeReportData={timeReportData}
                        staffTotals={mockStaffTotals}
                        selectedAbsenceType={selectedAbsenceType}
                        onAbsenceTypeChange={setSelectedAbsenceType}
                        selectedAbsenceStatus={selectedAbsenceStatus}
                        onAbsenceStatusChange={setSelectedAbsenceStatus}
                        filteredAbsenceRequests={filteredAbsenceRequests}
                        onUpdateRequest={handleUpdateRequest}
                    />
                    <StaffTab
                        mode="absences"
                        staffMembers={appData.staffMembers}
                        selectedStaffId={selectedStaffId}
                        onStaffChange={setSelectedStaffId}
                        date={date}
                        onDateChange={setDate}
                        timeReportData={timeReportData}
                        staffTotals={mockStaffTotals}
                        selectedAbsenceType={selectedAbsenceType}
                        onAbsenceTypeChange={setSelectedAbsenceType}
                        selectedAbsenceStatus={selectedAbsenceStatus}
                        onAbsenceStatusChange={setSelectedAbsenceStatus}
                        filteredAbsenceRequests={filteredAbsenceRequests}
                        onUpdateRequest={handleUpdateRequest}
                    />
                    <InventoryTab
                        products={appData.products}
                        taxes={appData.taxes}
                        ingredients={appData.ingredients}
                        ingredientCategories={appData.ingredientCategories}
                        getTaxName={getTaxName}
                    />
                    <CashClosingTab
                        realCash={realCash}
                        onRealCashChange={setRealCash}
                        initialCash={initialCash}
                        totalSales={totalSales}
                        cashSales={cashSales}
                        cardSales={cardSales}
                        theoreticalCash={theoreticalCash}
                        cashDifference={cashDifference}
                        onOpenMovements={() => setIsMovementsOpen(true)}
                    />

                    {/* WhatsApp Metrics Tab */}
                    <TabsContent value="whatsapp" className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard 
                                title="Mensajes Enviados" 
                                value={new Intl.NumberFormat('es-ES').format(mockWhatsAppMetrics.mensajesEnviados)}
                                icon={Send} 
                            />
                            <MetricCard 
                                title="Enviados/Leidos" 
                                value={`${Math.round((mockWhatsAppMetrics.mensajesLeidos / mockWhatsAppMetrics.mensajesEnviados) * 100)}%`}
                                icon={Eye} 
                            />
                            <MetricCard 
                                title="Pedidos WhatsApp" 
                                value={mockWhatsAppMetrics.pedidosViaWhatsApp.toString()}
                                icon={MessageSquare} 
                            />
                            <MetricCard 
                                title="Tiempo Respuesta" 
                                value={mockWhatsAppMetrics.tiempoRespuestaPromedio}
                                icon={Clock} 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Delivery Stats */}
                            <Card>
                                <CardHeader title="Estadísticas de Entrega">
                                    <CardDescription>Rendimiento de mensajes del mes</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Enviados</span>
                                            <span className="font-medium">{mockWhatsAppMetrics.mensajesEnviados}</span>
                                        </div>
                                        <Progress value={100} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Entregados</span>
                                            <span className="font-medium">{mockWhatsAppMetrics.mensajesEntregados} ({Math.round((mockWhatsAppMetrics.mensajesEntregados / mockWhatsAppMetrics.mensajesEnviados) * 100)}%)</span>
                                        </div>
                                        <Progress value={(mockWhatsAppMetrics.mensajesEntregados / mockWhatsAppMetrics.mensajesEnviados) * 100} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Leídos</span>
                                            <span className="font-medium">{mockWhatsAppMetrics.mensajesLeidos} ({Math.round((mockWhatsAppMetrics.mensajesLeidos / mockWhatsAppMetrics.mensajesEnviados) * 100)}%)</span>
                                        </div>
                                        <Progress value={(mockWhatsAppMetrics.mensajesLeidos / mockWhatsAppMetrics.mensajesEnviados) * 100} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Conversions */}
                            <Card>
                                <CardHeader title="Conversiones">
                                    <CardDescription>Acciones generadas vía WhatsApp</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <ActionTile 
                                        icon={DollarSign}
                                        title="Pedidos realizados"
                                        description="Total de ventas concretadas"
                                        rightContentType="badge"
                                        badgeText={mockWhatsAppMetrics.pedidosViaWhatsApp.toString()}
                                    />
                                    <ActionTile 
                                        icon={Calendar}
                                        title="Reservas confirmadas"
                                        description="Citas agendadas por el bot"
                                        rightContentType="badge"
                                        badgeText={mockWhatsAppMetrics.reservasViaWhatsApp.toString()}
                                        badgeVariant="secondary"
                                    />
                                    <ActionTile 
                                        icon={MessageSquare}
                                        title="Tasa de respuesta"
                                        description="Rendimiento del bot"
                                        rightContentType="badge"
                                        badgeText={`${mockWhatsAppMetrics.tasaRespuesta}%`}
                                        badgeVariant="outline"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Conversations */}
                        <Card>
                            <CardHeader title="Conversaciones Recientes">
                                <CardDescription>Últimas interacciones de clientes vía WhatsApp</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead className="text-center">Tipo</TableHead>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead className="text-center">Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mockWhatsAppMetrics.conversaciones.map((conv) => (
                                                <TableRow key={conv.id}>
                                                    <TableCell className="font-medium">{conv.cliente}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={conv.tipo === 'Pedido' ? 'default' : conv.tipo === 'Reserva' ? 'secondary' : 'outline'}>
                                                            {conv.tipo}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{conv.fecha}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={
                                                            conv.estado === 'Completado' || conv.estado === 'Confirmada' ? 'success' : 
                                                            conv.estado === 'Pendiente' ? 'warning' : 'info'
                                                        }>
                                                            {conv.estado}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <OrderDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} order={selectedOrder} />
                <MovementsDetailsDialog open={isMovementsOpen} onOpenChange={setIsMovementsOpen} />
            </PageContent>
        </PageContainer>
    );
}

