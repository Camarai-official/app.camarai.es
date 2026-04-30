'use client';

import * as React from 'react';
import { 
    Bell, 
    AlertTriangle, 
    Info, 
    Calendar,
    User,
    CreditCard,
    Package,
    Clock,
    UserMinus,
    UserPlus,
    Coffee,
    Search,
    Filter,
    BarChart3,
    Circle
} from 'lucide-react';

import { cn } from '@/lib/utils';

// Convex imports
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TextSM, TextXS } from '@/components/ui/typography';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';

// Layout Components
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';

import { NotificationsFilterDialog, type NotificationsFilterConfig } from '@/components/dialogs/notificaciones-filter-dialog';

export default function NotificationsPage() {
    // Obtener establecimientos de Convex
    const establishmentsData = useQuery(api.establishments.getEstablishments);
    
    // Usar el primer establecimiento disponible o null si no hay ninguno
    const establishmentId = establishmentsData && Array.isArray(establishmentsData) && establishmentsData.length > 0 
        ? establishmentsData[0]._id 
        : null;
    
    // Obtener eventos del log de Convex
    const eventsData = useQuery(api.eventLog.getEventLogs, establishmentId ? { establishmentId, limit: 100 } : "skip");
    
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [filterConfig, setFilterConfig] = React.useState<NotificationsFilterConfig>({
        showStaff: true,
        showInventory: true,
        showPayments: true,
        showBookings: true,
        showEnv: true,
        showCritical: false
    });

    const handleConfigChange = (key: keyof NotificationsFilterConfig, value: boolean) => {
        setFilterConfig(prev => ({ ...prev, [key]: value }));
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'staff': return <Badge variant="secondary">Personal</Badge>;
            case 'inventory': return <Badge variant="warning">Stock</Badge>;
            case 'payment': return <Badge variant="success">Cobros</Badge>;
            case 'booking': return <Badge variant="info">Reservas</Badge>;
            case 'env': return <Badge variant="destructive">Ambientes</Badge>;
            default: return <Badge variant="outline">General</Badge>;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'warning': return 'text-warning';
            case 'critical': return 'text-destructive';
            case 'success': return 'text-success';
            case 'info': return 'text-info';
            default: return 'text-muted-foreground';
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'UserPlus': return UserPlus;
            case 'UserMinus': return UserMinus;
            case 'Package': return Package;
            case 'CreditCard': return CreditCard;
            case 'Calendar': return Calendar;
            case 'Coffee': return Coffee;
            case 'AlertTriangle': return AlertTriangle;
            case 'Clock': return Clock;
            default: return Info;
        }
    };

    const filteredEvents = (eventsData || []).filter(item => {
        // Filter by category
        if (item.type === 'staff' && !filterConfig.showStaff) return false;
        if (item.type === 'inventory' && !filterConfig.showInventory) return false;
        if (item.type === 'payment' && !filterConfig.showPayments) return false;
        if (item.type === 'booking' && !filterConfig.showBookings) return false;
        if (item.type === 'env' && !filterConfig.showEnv) return false;
        
        // Filter by criticality if option is active
        if (filterConfig.showCritical && item.level !== 'critical' && item.level !== 'warning') return false;
        
        return true;
    });

    return (
        <PageContainer>
            <PageHeader 
                title="Sucesos del Establecimiento" 
                subtitle="Registro en tiempo real de toda la actividad operativa y administrativa."
                actions={
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="md"
                            onClick={() => setIsFilterOpen(true)}
                        >
                            <Filter className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Filtrar por Categoría</span>
                        </Button>
                    </div>
                }
            />
            
            <PageContent>
                <Card>
                    <NotificationsFilterDialog 
                        open={isFilterOpen}
                        onOpenChange={setIsFilterOpen}
                        filterConfig={filterConfig}
                        onConfigChange={handleConfigChange}
                    />
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead width="80px" align="center">Hora</TableHead>
                                    <TableHead>Evento</TableHead>
                                    <TableHead>
                                        <span className="sm:hidden">Origen</span>
                                        <span className="hidden sm:inline">Actor / Origen</span>
                                    </TableHead>
                                    <TableHead>Detalles</TableHead>
                                    <TableHead align="center">Categoría</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.map((item) => {
                                    const Icon = getIconComponent(item.icon);
                                    return (
                                        <TableRow key={item.id} className="group">
                                            <TableCell align="center">
                                                <TextSM className="font-semibold text-muted-foreground">
                                                    {formatTime(item.timestamp)}
                                                </TextSM>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-medium text-foreground">{item.event}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                    <span className="text-sm">{item.actor}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-[200px]">
                                                <TextXS className="text-muted-foreground leading-relaxed max-w-md">
                                                    {item.detail}
                                                </TextXS>
                                            </TableCell>
                                            <TableCell align="center">
                                                {getTypeBadge(item.type)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {filteredEvents.length === 0 && (
                            <div className="py-20 text-center text-muted-foreground opacity-50 flex flex-col items-center gap-2">
                                <Filter className="h-10 w-10 mb-2" />
                                <p>No hay sucesos que coincidan con los filtros seleccionados.</p>
                                <Button variant="link" size="sm" onClick={() => setFilterConfig({
                                    showStaff: true,
                                    showInventory: true,
                                    showPayments: true,
                                    showBookings: true,
                                    showEnv: true,
                                    showCritical: false
                                })}>Restablecer filtros</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </PageContent>
        </PageContainer>
    );
}
