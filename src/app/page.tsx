
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { addDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon, ChevronDown, TrendingUp, Download, MoreHorizontal, AlertTriangle, Package, CheckCircle, XCircle, ChevronLeft, ChevronRight, Target, BarChart, Donut, Users, Settings, LineChart, PieChart, ShoppingBag, Trophy, Star, Activity, LayoutGrid, FileText, Eye, PlayCircle, Printer, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { MetricCard } from '@/components/widgets/metric-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { LowStockAlerts } from '@/components/widgets/low-stock-alerts';
import { TeamLeaderboard } from '@/components/features/dashboard/team-leaderboard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SettingItem } from '@/components/ui/settings-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';

// ✅ MOCK DATA - Importado directamente
import { mockUser, mockOrders, mockIngredients, mockStaffMembers, mockEnvironments, mockProducts, getCategoryName } from '@/data/mock-data';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { generateCSV, prepareDashboardExportData } from '@/lib/export-utils';
import { Filter } from 'lucide-react';

const ChartFallback = () => (
    <div className="h-[200px] w-full rounded-md bg-muted/30" />
);

const SalesChart = dynamic(() => import('@/components/charts/sales-chart').then((mod) => mod.SalesChart), {
    ssr: false,
    loading: () => <ChartFallback />,
});

const RevenueChart = dynamic(() => import('@/components/charts/revenue-chart').then((mod) => mod.RevenueChart), {
    ssr: false,
    loading: () => <ChartFallback />,
});

const CategorySalesChart = dynamic(() => import('@/components/charts/category-sales-chart').then((mod) => mod.CategorySalesChart), {
    ssr: false,
    loading: () => <ChartFallback />,
});

const OccupancyChart = dynamic(() => import('@/components/charts/occupancy-charts').then((mod) => mod.OccupancyChart), {
    ssr: false,
    loading: () => <ChartFallback />,
});

const CostBreakdownChart = dynamic(() => import('@/components/charts/cost-breakdown-chart').then((mod) => mod.CostBreakdownChart), {
    ssr: false,
    loading: () => <ChartFallback />,
});

/**
 * @fileoverview Página principal del panel de administración (Dashboard).
 * Ofrece una vista general del rendimiento del restaurante utilizando datos de demostración.
 * 
 * ✅ DESACOPLADO: Ahora usa mock data directamente sin hooks de datos
 */


// Datos de demostración para la tabla de comandas recientes.
const allOrders = mockOrders;

const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * Componente principal para la página del Dashboard.
 * 
 * Este componente integra varios sub-componentes para mostrar una vista general del negocio.
 * Actualmente, todos los datos son simulados y se obtienen de mock-data.ts
 *
 * Funcionalidades clave:
 * - Saludo personalizado al usuario.
 * - Tarjetas de métricas principales (ingresos, ticket medio, etc.).
 * - Tabla paginada de comandas recientes.
 * - Alertas de ingredientes con bajo stock.
 * - Diversos gráficos sobre ventas, reservas, ocupación y costes.
 */
// Dashboard widget configuration
interface DashboardConfig {
    metrics: boolean;
    salesChart: boolean;
    revenueChart: boolean;
    occupancyChart: boolean;
    recentOrders: boolean;
    stockAlerts: boolean;
    teamRanking: boolean;
    topProducts: boolean;
    costBreakdown: boolean;
}

const defaultDashboardConfig: DashboardConfig = {
    metrics: true,
    salesChart: true,
    revenueChart: true,
    occupancyChart: true,
    recentOrders: true,
    stockAlerts: true,
    teamRanking: true,
    topProducts: true,
    costBreakdown: true,
};

export default function Home() {
    // ✅ Datos mock directos (sin hooks)
    const user = mockUser;
    const ingredients = mockIngredients;
    const staffMembers = mockStaffMembers;
    const environments = mockEnvironments;
    const { toast } = useToast();

    const [date, setDate] = React.useState<DateRange | undefined>({
        from: addDays(new Date(2024, 0, 1), 0), // Base fija para evitar hidratación
        to: addDays(new Date(2024, 0, 1), 7),
    });
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        // Una vez montado, podemos poner la fecha real si queremos, 
        // pero para evitar el salto visual, mantendremos una fecha base 
        // o actualizaremos aquí.
    }, []);

    const [label, setLabel] = React.useState<string>('Últimos 7 días');
    const [popoverOpen, setPopoverOpen] = React.useState(false);

    // Dashboard configuration state
    const [configOpen, setConfigOpen] = React.useState(false);
    const [dashboardConfig, setDashboardConfig] = React.useState<DashboardConfig>(defaultDashboardConfig);

    const handleConfigToggle = (key: keyof DashboardConfig) => {
        setDashboardConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveConfig = () => {
        toast({
            title: 'Configuración guardada',
            description: 'Los widgets del dashboard se han actualizado.',
        });
        setConfigOpen(false);
    };

    // Estado para la paginación de la tabla de comandas.
    const [currentPage, setCurrentPage] = React.useState(1);
    const [ordersPerPage] = React.useState(8);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // Estado para el selector de mes en los gráficos.
    const [selectedMonth, setSelectedMonth] = React.useState<string>('Junio');

    // ✅ Filtrar comandas y métricas basadas en la fecha global
    const { currentOrders, metricsData } = React.useMemo(() => {
        // Usamos una semilla basada en la fecha para que las métricas cambien, 
        // pero sin depender de 'mounted' para evitar errores de hidratación.
        const dateFrom = date?.from ? date.from.getTime() : new Date(2024, 0, 1).getTime();
        const dateTo = date?.to ? date.to.getTime() : dateFrom;
        const dateFactor = (dateFrom + dateTo) / 1000000;

        // Simular que los datos cambian con la fecha
        const numberFormatter = new Intl.NumberFormat('es-ES');
        const metrics = {
            totalRevenue: `€${((2.6 + (dateFactor % 1))).toFixed(1)}M`,
            avgTicket: `€${(38.5 + (dateFactor % 2)).toFixed(2)}`,
            itemsPerOrder: (2.8 + (dateFactor % 0.5)).toFixed(1),
            conversion: `${(35 + (dateFactor % 15)).toFixed(0)}%`,
            // Nuevas métricas operacionales
            serviceTime: `${(24 - (dateFactor % 8)).toFixed(0)} min`,
            totalOrders: numberFormatter.format(Math.floor(1248 + (dateFactor % 1000))),
            nps: (78 + (dateFactor % 12)).toFixed(0)
        };

        // Simular filtrado de órdenes (en un caso real filtraríamos por o.time)
        const filtered = allOrders.slice(0, 15);

        return {
            currentOrders: filtered.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage),
            metricsData: metrics
        };
    }, [date, currentPage, ordersPerPage]);

    const totalPages = Math.ceil(allOrders.length / ordersPerPage);

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

    /**
     * Prepara los datos para el gráfico de ocupación por ambiente.
     * Calcula el porcentaje de aforo que representa cada ambiente sobre el total.
     */
    const occupancyChartData = React.useMemo(() => {
        const totalCapacity = environments.reduce((totalAcc, env) => {
            return totalAcc + env.tables.reduce((envAcc, table) => envAcc + table.capacity, 0);
        }, 0);

        if (totalCapacity === 0) return [];

        return environments.map(env => {
            const environmentCapacity = env.tables.reduce((acc, table) => acc + table.capacity, 0);
            return {
                name: env.name,
                value: environmentCapacity,
                color: env.color,
                percentage: (environmentCapacity / totalCapacity) * 100
            };
        }).filter(item => item.value > 0);
    }, [environments, date]);


    return (
        <div className="flex flex-1 flex-col h-full">
            {/* Header full width: título + acción */}
            <PageHeader
                title={<>Buenos días, {user?.firstName || 'Fenix'}!</>}
                actions={
                    <div className="flex items-stretch gap-2 flex-row sm:items-center">
                        <CalendarDateRangePicker date={date} setDate={setDate} />

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            title="Exportar Informe Global"
                            onClick={() => {
                                const data = prepareDashboardExportData({}, allOrders, mockProducts);
                                generateCSV(data, 'camarai_global_report');
                                toast({
                                    title: "Exportación iniciada",
                                    description: "El reporte global se está descargando."
                                });
                            }}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setConfigOpen(true)}>
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                }
            />
            <main className="flex flex-1 flex-col gap-6 p-4 pt-2 md:p-6 md:pt-3">

                {/* Sección de Métricas Principales */}
                {dashboardConfig.metrics && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                className="bg-card"
                                title="Ingresos totales"
                                value={metricsData.totalRevenue}
                                change="+4.5% que la semana pasada"
                                changeType="increase"
                            />
                            <MetricCard
                                className="bg-card"
                                title="Ticket Medio"
                                value={metricsData.avgTicket}
                                change="-1.2% que la semana pasada"
                                changeType="decrease"
                            />
                            <MetricCard
                                className="bg-card"
                                title="Productos por Comanda"
                                value={metricsData.itemsPerOrder}
                                change="+0.5% que la semana pasada"
                                changeType="increase"
                            />
                            <MetricCard
                                className="bg-card"
                                title="Tasa Conversión Upsell"
                                value={metricsData.conversion}
                                change="+3% que la semana pasada"
                                changeType="increase"
                            />
                        </div>

                )}

                {/* Gráfico de Ventas por Hora */}
                {dashboardConfig.salesChart && (
                    <div className="w-full h-full">
                        <SalesChart globalDate={date} />
                    </div>
                )}


                {/* Más Métricas - Reservas y Aforo */}
                {(dashboardConfig.revenueChart || dashboardConfig.occupancyChart) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Gráfico de Reservas */}
                        {dashboardConfig.revenueChart && (
                            <Card className="lg:col-span-2 flex flex-col">
                                <CardHeader>
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-base font-bold text-muted-foreground">Número de Reservas</CardTitle>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-[120px] justify-between">
                                                        <span>{selectedMonth}</span>
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align="end" className="w-auto p-2">
                                                    <div className="grid grid-cols-3 gap-1">
                                                        {months.map(month => (
                                                            <Button
                                                                key={month}
                                                                variant="ghost"
                                                                size="sm"
                                                                className={cn("justify-start", selectedMonth === month && "bg-primary text-primary-foreground hover:bg-primary")}
                                                                onClick={() => setSelectedMonth(month)}
                                                            >
                                                                {month}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            <Select defaultValue="2024">
                                                <SelectTrigger className="w-[90px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="2024">2024</SelectItem>
                                                    <SelectItem value="2023">2023</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button variant="outline" size="icon">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <RevenueChart date={date} />
                                </CardContent>
                            </Card>
                        )}
                        {/* Gráfico de Aforo */}
                        {dashboardConfig.occupancyChart && (
                            <Card className={cn("flex flex-col", dashboardConfig.revenueChart ? "lg:col-span-1" : "lg:col-span-3")}>
                                <CardHeader>
                                    <CardTitle className="text-base font-bold text-muted-foreground">Aforo Ambientes</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow flex justify-center items-center">
                                    <OccupancyChart data={occupancyChartData} />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Más Métricas - Operational & Satisfaction */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        className="bg-card"
                        title="Tiempo Medio de Servicio"
                        value={metricsData.serviceTime}
                        change="-2.5%"
                        changeType="increase"
                    />
                    <MetricCard
                        className="bg-card"
                        title="Total Comandas"
                        value={metricsData.totalOrders}
                        change="+12.4%"
                        changeType="increase"
                    />
                    <MetricCard
                        className="bg-card"
                        title="NPS (Satisfacción)"
                        value={metricsData.nps}
                        change="+3pts"
                        changeType="increase"
                    />
                </div>

                {/* Comandas y Stock */}
                {(dashboardConfig.recentOrders || dashboardConfig.stockAlerts) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tabla de Comandas Recientes */}
                        {dashboardConfig.recentOrders && (
                            <Card className={cn("flex flex-col", dashboardConfig.stockAlerts ? "lg:col-span-2" : "lg:col-span-3")}>
                                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 pt-6 pb-2">
                                    <div>
                                        <CardTitle className="text-base font-bold text-muted-foreground">Comandas Recientes</CardTitle>
                                    </div>
                                    <div className="flex gap-2">
                                        <Select defaultValue="csv">
                                            <SelectTrigger id="export-format" className="w-[120px]">
                                                <SelectValue placeholder="Exportar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="csv">CSV</SelectItem>
                                                <SelectItem value="pdf">PDF</SelectItem>
                                                <SelectItem value="xlsx">XLSX</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem>
                                                    <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    Exportar marcadas
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    Exportar todo
                                                </DropdownMenuItem>
                                                <DropdownMenuItem disabled>
                                                    <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    Cambiar estado (Próximamente)
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow p-6 pt-2">
                                    <div className="relative w-full overflow-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[40px] hidden md:table-cell"><Checkbox aria-label="Seleccionar todo" /></TableHead>
                                                    <TableHead>Nº orden</TableHead>
                                                    <TableHead>Hora</TableHead>
                                                    <TableHead>Mesa</TableHead>
                                                    <TableHead>Nombre</TableHead>
                                                    <TableHead>Total</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead className="w-[40px]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className={cn('transition-opacity duration-300', isAnimating ? 'opacity-0' : 'opacity-100')}>
                                                {currentOrders.map((order, index) => (
                                                    <TableRow key={order.order}>
                                                        <TableCell className="hidden md:table-cell"><Checkbox /></TableCell>
                                                        <TableCell className="font-medium">{order.order}</TableCell>
                                                        <TableCell>{order.time}</TableCell>
                                                        <TableCell>{order.table}</TableCell>
                                                        <TableCell>{order.name}</TableCell>
                                                        <TableCell>{order.total}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={order.status === 'Completado' ? 'completed' : order.status === 'En Progreso' ? 'in-progress' : 'cancelled'}>
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
                                                                    <DropdownMenuItem>
                                                                        <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                        Ver detalles
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSub>
                                                                        <DropdownMenuSubTrigger>
                                                                            <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                            Cambiar Estado
                                                                        </DropdownMenuSubTrigger>
                                                                        <DropdownMenuSubContent>
                                                                            <DropdownMenuItem>
                                                                                <PlayCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                                En Progreso
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                                Completado
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                                Cancelado
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuSubContent>
                                                                    </DropdownMenuSub>
                                                                    <DropdownMenuItem>
                                                                        <Printer className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                        Reimprimir
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
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
                                <CardFooter className="flex justify-end items-center gap-2">
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
                                </CardFooter>
                            </Card>
                        )}

                        {/* Alertas de Stock Bajo */}
                        {dashboardConfig.stockAlerts && (
                            <div className={cn("flex", dashboardConfig.recentOrders ? "lg:col-span-1" : "lg:col-span-3")}>
                                <LowStockAlerts ingredients={ingredients} />
                            </div>
                        )}
                    </div>
                )}



                {/* Team, TopProducts, CostBreakdown */}
                {(dashboardConfig.teamRanking || dashboardConfig.topProducts || dashboardConfig.costBreakdown) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Ranking de Equipo */}
                        {dashboardConfig.teamRanking && (
                            <div className="lg:col-span-1">
                                <TeamLeaderboard staff={staffMembers} date={date} />
                            </div>
                        )}
                        {/* Gráfico de Ventas por Categoría (Product Mix) */}
                        {dashboardConfig.topProducts && (
                            <Card className="lg:col-span-1 flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-center mb-2">
                                        <CardTitle className="text-base font-bold text-muted-foreground">Top Productos</CardTitle>
                                        <Select defaultValue="meses">
                                            <SelectTrigger className="w-[100px] h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="horas">Horas</SelectItem>
                                                <SelectItem value="dias">Días</SelectItem>
                                                <SelectItem value="meses">Meses</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow p-0 flex items-center justify-center">
                                    <div className="h-[250px] w-full">
                                        <CategorySalesChart products={mockProducts} getCategoryName={getCategoryName} date={date} />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {/* Gráfico de Desglose de Costes */}
                        {dashboardConfig.costBreakdown && (
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-base font-bold text-muted-foreground">Desglose de Costes</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow flex justify-center items-center">
                                    <CostBreakdownChart date={date} />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                <Dialog open={configOpen} onOpenChange={setConfigOpen}>
                    <DialogContent className="sm:max-w-[550px] overflow-hidden border-none shadow-2xl p-6">
                        <DialogHeader>
                            <DialogTitle icon={Settings}>
                                Configurar Dashboard
                            </DialogTitle>
                            <DialogDescription>
                                Personaliza los widgets y visibilidad de tu panel de control para optimizar tu gestión.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <ScrollArea className="max-h-[60vh] -mx-6">
                            <div className="space-y-6 px-6 py-4">
                                {/* Sección: Análisis de Ventas */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <TrendingUp className="h-3 w-3" /> Análisis de Ventas
                                    </h4>
                                    <div className="grid gap-3">
                                        <SettingItem
                                            id="metrics"
                                            icon={TrendingUp}
                                            label="Métricas Principales"
                                            description="Ingresos, ticket medio y variación temporal."
                                            checked={dashboardConfig.metrics}
                                            onCheckedChange={() => handleConfigToggle('metrics')}
                                        />

                                        <SettingItem
                                            id="salesChart"
                                            icon={LineChart}
                                            label="Ventas por Hora"
                                            description="Curva de demanda distribuida por franjas horarias."
                                            checked={dashboardConfig.salesChart}
                                            onCheckedChange={() => handleConfigToggle('salesChart')}
                                            iconClassName="text-blue-500"
                                            className="[&_.icon-container]:bg-blue-500/10 [&_.icon-container]:group-hover:bg-blue-500/20"
                                        />

                                        <SettingItem
                                            id="revenueChart"
                                            icon={BarChart}
                                            label="Gráfico de Ingresos"
                                            description="Visualización comparativa de facturación bruta."
                                            checked={dashboardConfig.revenueChart}
                                            onCheckedChange={() => handleConfigToggle('revenueChart')}
                                            iconClassName="text-green-500"
                                            className="[&_.icon-container]:bg-green-500/10 [&_.icon-container]:group-hover:bg-green-500/20"
                                        />
                                    </div>
                                </div>

                                <Separator className="opacity-50" />

                                {/* Sección: Operaciones */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <LayoutGrid className="h-3 w-3" /> Operaciones y Stock
                                    </h4>
                                    <div className="grid gap-3">
                                        <SettingItem
                                            id="recentOrders"
                                            icon={ShoppingBag}
                                            label="Comandas Recientes"
                                            description="Monitor en tiempo real de los últimos pedidos."
                                            checked={dashboardConfig.recentOrders}
                                            onCheckedChange={() => handleConfigToggle('recentOrders')}
                                            iconClassName="text-orange-500"
                                            className="[&_.icon-container]:bg-orange-500/10 [&_.icon-container]:group-hover:bg-orange-500/20"
                                        />

                                        <SettingItem
                                            id="stockAlerts"
                                            icon={AlertTriangle}
                                            label="Alertas de Stock"
                                            description="Aviso crítico de ingredientes bajo mínimos."
                                            checked={dashboardConfig.stockAlerts}
                                            onCheckedChange={() => handleConfigToggle('stockAlerts')}
                                            iconClassName="text-red-500"
                                            className="[&_.icon-container]:bg-red-500/10 [&_.icon-container]:group-hover:bg-red-500/20"
                                        />

                                        <SettingItem
                                            id="occupancyChart"
                                            icon={Users}
                                            label="Distribución de Aforo"
                                            description="Ocupación porcentual por salones y terrazas."
                                            checked={dashboardConfig.occupancyChart}
                                            onCheckedChange={() => handleConfigToggle('occupancyChart')}
                                            iconClassName="text-purple-500"
                                            className="[&_.icon-container]:bg-purple-500/10 [&_.icon-container]:group-hover:bg-purple-500/20"
                                        />
                                    </div>
                                </div>

                                <Separator className="opacity-50" />

                                {/* Sección: Rendimiento */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Trophy className="h-3 w-3" /> Rendimiento y Costes
                                    </h4>
                                    <div className="grid gap-3">
                                        <SettingItem
                                            id="teamRanking"
                                            icon={Trophy}
                                            label="Ranking de Equipo"
                                            description="Leaderboard de ventas y desempeño del personal."
                                            checked={dashboardConfig.teamRanking}
                                            onCheckedChange={() => handleConfigToggle('teamRanking')}
                                            iconClassName="text-yellow-500"
                                            className="[&_.icon-container]:bg-yellow-500/10 [&_.icon-container]:group-hover:bg-yellow-500/20"
                                        />

                                        <SettingItem
                                            id="topProducts"
                                            icon={Star}
                                            label="Top Productos"
                                            description="Análisis de los platos y bebidas más populares."
                                            checked={dashboardConfig.topProducts}
                                            onCheckedChange={() => handleConfigToggle('topProducts')}
                                            iconClassName="text-pink-500"
                                            className="[&_.icon-container]:bg-pink-500/10 [&_.icon-container]:group-hover:bg-pink-500/20"
                                        />

                                        <SettingItem
                                            id="costBreakdown"
                                            icon={Activity}
                                            label="Desglose de Costes"
                                            description="Distribución de gastos fijos y variables."
                                            checked={dashboardConfig.costBreakdown}
                                            onCheckedChange={() => handleConfigToggle('costBreakdown')}
                                            iconClassName="text-cyan-500"
                                            className="[&_.icon-container]:bg-cyan-500/10 [&_.icon-container]:group-hover:bg-cyan-500/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                        
                        <DialogFooter>
                            <p className="text-xs text-muted-foreground">Los cambios se aplicarán instantáneamente.</p>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setConfigOpen(false)}>Cerrar</Button>
                                <Button onClick={handleSaveConfig} variant="brand">
                                    Guardar Cambios
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
