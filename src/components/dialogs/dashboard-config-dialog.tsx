'use client';

import * as React from 'react';
import { Settings, TrendingUp, LineChart, BarChart, ShoppingBag, AlertTriangle, LayoutGrid, Users, Trophy, Star, Activity } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { ActionTile } from '@/components/ui/action-tile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

export interface DashboardConfig {
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

interface DashboardConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config: DashboardConfig;
    onToggle: (key: keyof DashboardConfig) => void;
    onSave: () => void;
}

export function DashboardConfigDialog({
    open,
    onOpenChange,
    config,
    onToggle,
    onSave
}: DashboardConfigDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="md">
                <DialogHeader
                    icon={Settings}
                    title="Configurar Dashboard"
                    description="Personaliza los widgets y visibilidad de tu panel de control para optimizar tu gestión."
                />
                
                <DialogContent className="p-0 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 w-full">
                    <div className="space-y-6 py-4 px-2 sm:p-6">
                        {/* Sección: Análisis de Ventas */}
                        <div className="space-y-4">
                            <Label icon={TrendingUp}>Análisis de Ventas</Label>
                            <div className="grid gap-3">
                                <ActionTile
                                    switchId="metrics"
                                    icon={TrendingUp}
                                    title="Métricas Principales"
                                    description="Ingresos, ticket medio y variación temporal."
                                    rightContentType="switch"
                                    switchChecked={config.metrics}
                                    onSwitchChange={() => onToggle('metrics')}
                                />

                                <ActionTile
                                    switchId="salesChart"
                                    icon={LineChart}
                                    title="Ventas por Hora"
                                    description="Curva de demanda distribuida por franjas horarias."
                                    rightContentType="switch"
                                    switchChecked={config.salesChart}
                                    onSwitchChange={() => onToggle('salesChart')}
                                    iconColor="blue-500"
                                />

                                <ActionTile
                                    switchId="revenueChart"
                                    icon={BarChart}
                                    title="Gráfico de Ingresos"
                                    description="Visualización comparativa de facturación bruta."
                                    rightContentType="switch"
                                    switchChecked={config.revenueChart}
                                    onSwitchChange={() => onToggle('revenueChart')}
                                    iconColor="green-500"
                                />
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        {/* Sección: Operaciones */}
                        <div className="space-y-4">
                            <Label icon={LayoutGrid}>Operaciones y Stock</Label>
                            <div className="grid gap-3">
                                <ActionTile
                                    switchId="recentOrders"
                                    icon={ShoppingBag}
                                    title="Comandas Recientes"
                                    description="Monitor en tiempo real de los últimos pedidos."
                                    rightContentType="switch"
                                    switchChecked={config.recentOrders}
                                    onSwitchChange={() => onToggle('recentOrders')}
                                    iconColor="orange-500"
                                />

                                <ActionTile
                                    switchId="stockAlerts"
                                    icon={AlertTriangle}
                                    title="Alertas de Stock"
                                    description="Aviso crítico de ingredientes bajo mínimos."
                                    rightContentType="switch"
                                    switchChecked={config.stockAlerts}
                                    onSwitchChange={() => onToggle('stockAlerts')}
                                    iconColor="red-500"
                                />

                                <ActionTile
                                    switchId="occupancyChart"
                                    icon={Users}
                                    title="Distribución de Aforo"
                                    description="Ocupación porcentual por salones y terrazas."
                                    rightContentType="switch"
                                    switchChecked={config.occupancyChart}
                                    onSwitchChange={() => onToggle('occupancyChart')}
                                    iconColor="purple-500"
                                />
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        {/* Sección: Rendimiento */}
                        <div className="space-y-4">
                            <Label icon={Trophy}>Rendimiento y Costes</Label>
                            <div className="grid gap-3">
                                <ActionTile
                                    switchId="teamRanking"
                                    icon={Trophy}
                                    title="Ranking de Equipo"
                                    description="Leaderboard de ventas y desempeño del personal."
                                    rightContentType="switch"
                                    switchChecked={config.teamRanking}
                                    onSwitchChange={() => onToggle('teamRanking')}
                                    iconColor="green-500"
                                />

                                <ActionTile
                                    switchId="topProducts"
                                    icon={Star}
                                    title="Top Productos"
                                    description="Análisis de los platos y bebidas más populares."
                                    rightContentType="switch"
                                    switchChecked={config.topProducts}
                                    onSwitchChange={() => onToggle('topProducts')}
                                    iconColor="yellow-500"
                                />

                                <ActionTile
                                    switchId="costBreakdown"
                                    icon={Activity}
                                    title="Desglose de Costes"
                                    description="Distribución de gastos fijos y variables."
                                    rightContentType="switch"
                                    switchChecked={config.costBreakdown}
                                    onSwitchChange={() => onToggle('costBreakdown')}
                                    iconColor="cyan-500"
                                />
                            </div>
                        </div>
                    </div>
                    </ScrollArea>
                </DialogContent>
                
                <DialogFooter
                    onCancel={() => onOpenChange(false)}
                />
            </DialogWindow>
        </Dialog>
    );
}
