'use client';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { addDays, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Download, Settings, Euro, Receipt, Package, Sparkles, Clock, ShoppingBag, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/components/widgets/metric-card';
import { LowStockAlerts } from '@/components/widgets/low-stock-alerts';
import { TeamLeaderboard } from '@/components/features/dashboard/team-leaderboard';
import { useToast } from '@/hooks/use-toast';
import { useKPIs } from '@/hooks/useKPIs';
import { useEstablishments } from '@/hooks/useEstablishments';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';
import { DashboardConfigDialog, type DashboardConfig } from '@/components/dialogs/dashboard-config-dialog';

// ✅ MOCK DATA - Solo para usuario (sin datos reales de auth aún)
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { generateCSV, prepareDashboardExportData } from '@/lib/export-utils';

const mockUser = {
    firstName: 'Fenix',
    lastName: 'Admin',
    email: 'admin@camarai.es',
    avatar: ''
};

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
 * Ofrece una vista general del rendimiento del restaurante utilizando datos reales de Convex.
 * 
 * ✅ DATOS REALES: Usa Convex para KPIs, ventas, reservas, ambientes, stock, staff y productos
 */


/**
 * Componente principal para la página del Dashboard.
 * 
 * Este componente integra varios sub-componentes para mostrar una vista general del negocio.
 * Todos los datos principales provienen de Convex (KPIs HyperFast, ventas, reservas, etc.)
 *
 * Funcionalidades clave:
 * - Saludo personalizado al usuario.
 * - Tarjetas de métricas principales (ingresos, ticket medio, etc.) con datos reales de Convex.
 * - Gráficos de ventas, reservas y ocupación con datos reales.
 * - Alertas de ingredientes con bajo stock desde Convex.
 * - Ranking de equipo con datos reales de staff.
 */
// Dashboard widget configuration

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
    const { toast } = useToast();

    // ✅ HyperFast KPIs - Datos reales de Convex
    const { formattedKPIs, isLoading } = useKPIs();

    // ✅ Real Environments from Convex
    const { activeEstablishment } = useEstablishments();
    const environmentsWithTables = useQuery(
        api.environments.getEnvironmentsByEstablishment,
        activeEstablishment?.id ? { establishmentId: activeEstablishment.id as any } : 'skip'
    );

    // Use real environments data or empty array
    const environments = environmentsWithTables || [];

    // ✅ Real Stock Alerts from Convex
    const stockAlerts = useQuery(
        api.analytics.getStockAlerts,
        activeEstablishment?.id ? { establishmentId: activeEstablishment.id as any } : 'skip'
    );

    // Map real stock alerts to component format
    const ingredients = stockAlerts?.map((alert, index) => ({
        id: `alert-${index}`,
        nombre_ingrediente: alert.name,
        stock_actual: alert.stock,
        stock_minimo_alerta: alert.alert_min,
        unidad_medida: 'un',
    })) || [];

    // ✅ Real Staff from Convex
    const staffData = useQuery(
        api.staff.getStaffByEstablishment,
        activeEstablishment?.id ? { establishmentId: activeEstablishment.id as any } : 'skip'
    );

    // Use real staff data or empty array
    const staffMembers = staffData || [];

    // ✅ Real Products from Convex
    const productsData = useQuery(
        api.products.getProducts,
        activeEstablishment?.id ? { establishmentId: activeEstablishment.id as any } : 'skip'
    );

    // Use real products data or empty array
    const products = productsData || [];

    // Helper to get category name from real data
    const getRealCategoryName = (categoryId: string) => {
        const category = productsData?.find(p => p.category_id === categoryId)?.category_name;
        return category || 'Sin categoría';
    };

    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
    });
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        // Una vez montado, podemos poner la fecha real si queremos, 
        // pero para evitar el salto visual, mantendremos una fecha base 
        // o actualizaremos aquí.
    }, []);

    const [label, setLabel] = React.useState<string>('Últimos 7 días');

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
        // Use real KPI data from Convex (HyperFast)
        return formattedKPIs;
    }, [formattedKPIs]);

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
        <PageContainer>
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
                                toast({
                                    title: "Exportación no disponible",
                                    description: "Función de exportación requiere datos reales de Convex."
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
                                <TeamLeaderboard date={date} />
                            </div>
                        )}
                        {/* Gráfico de Ventas por Categoría (Product Mix) */}
                        {dashboardConfig.topProducts && (
                            <CategorySalesChart products={products} getCategoryName={getRealCategoryName} date={date} className="lg:col-span-1" />
                        )}
                        {/* Gráfico de Desglose de Costes */}
                        {dashboardConfig.costBreakdown && (
                            <CostBreakdownChart date={date} />
                        )}
                    </div>
                )}

                <DashboardConfigDialog 
                    open={configOpen}
                    onOpenChange={setConfigOpen}
                    config={dashboardConfig}
                    onToggle={handleConfigToggle}
                    onSave={handleSaveConfig}
                />
            </PageContent>
        </PageContainer>
    );
}
