'use client';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { addDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { CalendarIcon, ChevronDown, TrendingUp, Download, MoreHorizontal, AlertTriangle, Package, CheckCircle, XCircle, ChevronLeft, ChevronRight, Target, BarChart, Donut, Users, Settings, LineChart, PieChart, Trash, Edit, ShoppingBag, Trophy, Star, Activity, LayoutGrid, FileText, Eye, PlayCircle, Printer, Ban, ArrowRight, Share2, Link, ExternalLink, Sparkles, Euro, Receipt, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { H4 } from '@/components/ui/typography';
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
import { ActionTile } from '@/components/ui/action-tile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { PageContent } from '@/components/layout/page-content';

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

const RecentOrders = dynamic(() => import('@/components/features/dashboard/recent-orders').then((mod) => mod.RecentOrders), {
    ssr: false,
    loading: () => <ChartFallback />,
});

/**
 * @fileoverview Página principal del panel de administración (Dashboard).
 * Ofrece una vista general del rendimiento del restaurante utilizando datos de demostración.
 * 
 * ✅ DESACOPLADO: Ahora usa mock data directamente sin hooks de datos
 */


const allOrders = mockOrders;

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
    badgeTable: boolean;
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
    badgeTable: true,
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

    // ✅ Calcular métricas basadas en la fecha global
    const metricsData = React.useMemo(() => {
        const dateFrom = date?.from ? date.from.getTime() : new Date(2024, 0, 1).getTime();
        const dateTo = date?.to ? date.to.getTime() : dateFrom;
        const dateFactor = (dateFrom + dateTo) / 1000000;

        const numberFormatter = new Intl.NumberFormat('es-ES');
        return {
            totalRevenue: `€${((2.6 + (dateFactor % 1))).toFixed(1)}M`,
            avgTicket: `€${(38.5 + (dateFactor % 2)).toFixed(2)}`,
            itemsPerOrder: (2.8 + (dateFactor % 0.5)).toFixed(1),
            conversion: `${(35 + (dateFactor % 15)).toFixed(0)}%`,
            serviceTime: `${(24 - (dateFactor % 8)).toFixed(0)} min`,
            totalOrders: numberFormatter.format(Math.floor(1248 + (dateFactor % 1000))),
            nps: (78 + (dateFactor % 12)).toFixed(0)
        };
    }, [date]);

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
                            size="md"
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
                            <Download/>
                        </Button>
                        <Button variant="outline" size="md" onClick={() => setConfigOpen(true)}>
                            <Settings/>
                        </Button>
                    </div>
                }
            />
            <PageContent>

                {/* Sección de Métricas Principales */}
                {dashboardConfig.metrics && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                title="Ingresos totales"
                                value={metricsData.totalRevenue}
                                change="+4.5% que la semana pasada"
                                changeType="increase"
                                icon={Euro}
                            />
                            <MetricCard
                                title="Ticket Medio"
                                value={metricsData.avgTicket}
                                change="-1.2% que la semana pasada"
                                changeType="decrease"
                                icon={Receipt}
                            />
                            <MetricCard
                                title="Productos por Comanda"
                                value={metricsData.itemsPerOrder}
                                change="+0.5% que la semana pasada"
                                changeType="increase"
                                icon={Package}
                            />
                            <MetricCard
                                title="Tasa Conversión Upsell"
                                value={metricsData.conversion}
                                change="+3% que la semana pasada"
                                changeType="increase"
                                icon={Sparkles}
                            />
                        </div>

                )}

                {/* Gráfico de Ventas por Hora */}
                {dashboardConfig.salesChart && (
                    <div className="w-full">
                        <SalesChart globalDate={date} />
                    </div>
                )}


                {/* Más Métricas - Reservas y Aforo */}
                {(dashboardConfig.revenueChart || dashboardConfig.occupancyChart) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Gráfico de Reservas */}
                        {dashboardConfig.revenueChart && (
                            <RevenueChart 
                                date={date} 
                                className={cn(dashboardConfig.occupancyChart ? "lg:col-span-2" : "lg:col-span-3")} 
                            />
                        )}
                        {/* Gráfico de Aforo */}
                        {dashboardConfig.occupancyChart && (
                            <OccupancyChart data={occupancyChartData} className={cn(dashboardConfig.revenueChart ? "lg:col-span-1" : "lg:col-span-3")} />
                        )}
                    </div>
                )}

                {/* Más Métricas - Operational & Satisfaction */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Tiempo Medio de Servicio"
                        value={metricsData.serviceTime}
                        change="-2.5%"
                        changeType="increase"
                        icon={Clock}
                    />
                    <MetricCard
                        title="Total Comandas"
                        value={metricsData.totalOrders}
                        change="+12.4%"
                        changeType="increase"
                        icon={ShoppingBag}
                    />
                    <MetricCard
                        title="NPS (Satisfacción)"
                        value={metricsData.nps}
                        change="+3pts"
                        changeType="increase"
                        icon={Star}
                    />
                </div>

                {/* Comandas y Stock */}
                {(dashboardConfig.recentOrders || dashboardConfig.stockAlerts) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tabla de Comandas Recientes */}
                        {dashboardConfig.recentOrders && (
                            <RecentOrders 
                                date={date} 
                                className={cn(dashboardConfig.stockAlerts ? "lg:col-span-2" : "lg:col-span-3")}
                            />
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
                            <CategorySalesChart products={mockProducts} getCategoryName={getCategoryName} date={date} className="lg:col-span-1" />
                        )}
                        {/* Gráfico de Desglose de Costes */}
                        {dashboardConfig.costBreakdown && (
                            <CostBreakdownChart date={date} />
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
                                        <ActionTile
                                            switchId="metrics"
                                            icon={TrendingUp}
                                            title="Métricas Principales"
                                            description="Ingresos, ticket medio y variación temporal."
                                            rightContentType="switch"
                                            switchChecked={dashboardConfig.metrics}
                                            onSwitchChange={() => handleConfigToggle('metrics')}
                                        />

                                        <ActionTile
                                            switchId="salesChart"
                                            icon={LineChart}
                                            title="Ventas por Hora"
                                            description="Curva de demanda distribuida por franjas horarias."
                                            rightContentType="switch"
                                            switchChecked={dashboardConfig.salesChart}
                                            onSwitchChange={() => handleConfigToggle('salesChart')}
                                            iconColor="blue-500"
                                        />

                                        <ActionTile
                                            switchId="revenueChart"
                                            icon={BarChart}
                                            title="Gráfico de Ingresos"
                                            description="Visualización comparativa de facturación bruta."
                                            rightContentType="switch"
                                            switchChecked={dashboardConfig.revenueChart}
                                            onSwitchChange={() => handleConfigToggle('revenueChart')}
                                            iconColor="green-500"
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
                                        <ActionTile
                                            switchId="recentOrders"
                                            icon={ShoppingBag}
                                            title="Comandas Recientes"
                                            description="Monitor en tiempo real de los últimos pedidos."
                                            rightContentType="switch"
                                            switchChecked={dashboardConfig.recentOrders}
                                            onSwitchChange={() => handleConfigToggle('recentOrders')}
                                            iconColor="orange-500"
                                        />

                                        <ActionTile
                                            switchId="stockAlerts"
                                            icon={AlertTriangle}
                                            title="Alertas de Stock"
                                            description="Aviso crítico de ingredientes bajo mínimos."
                                            rightContentType="switch"
                                            switchChecked={dashboardConfig.stockAlerts}
                                            onSwitchChange={() => handleConfigToggle('stockAlerts')}
                                            iconColor="red-500"
                                        />

                                        <ActionTile
                                            switchId="occupancyChart"
                                            icon={Users}
                                            title="Distribución de Aforo"
                                            description="Ocupación porcentual por salones y terrazas."
                                            rightContentType="switch"
                                            switchChecked={dashboardConfig.occupancyChart}
                                            onSwitchChange={() => handleConfigToggle('occupancyChart')}
                                            iconColor="purple-500"
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
                                        <ActionTile
                                            switchId="teamRanking"
                                            icon={Trophy}
                                            title="Ranking de Equipo"
                                            description="Leaderboard de ventas y desempeño del personal."
                                            rightContentType="switch"
                                            switchChecked={dashboardConfig.teamRanking}
                                            onSwitchChange={() => handleConfigToggle('teamRanking')}
                                            iconColor="yellow-500"
                                        />

                                        <ActionTile
                                            switchId="topProducts"
                                            icon={Star}
                                            title="Top Productos"
                                            description="Análisis de los platos y bebidas más populares."
                                            rightContentType="switch"
                                            switchChecked={dashboardConfig.topProducts}
                                            onSwitchChange={() => handleConfigToggle('topProducts')}
                                            iconColor="pink-500"
                                        />

                                        <ActionTile
                                            switchId="costBreakdown"
                                            icon={Activity}
                                            title="Desglose de Costes"
                                            description="Distribución de gastos fijos y variables."
                                            rightContentType="switch"
                                            switchChecked={dashboardConfig.costBreakdown}
                                            onSwitchChange={() => handleConfigToggle('costBreakdown')}
                                            iconColor="cyan-500"
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
            </PageContent>
        </div>
    );
}
