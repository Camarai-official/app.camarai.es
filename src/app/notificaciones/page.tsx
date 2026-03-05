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

const eventData = [
    { id: '1', event: 'Check-in Personal', actor: 'Carlos Mendoza', detail: 'Inició turno en Barra Principal', type: 'staff', time: '14:25', status: 'info', icon: UserPlus },
    { id: '2', event: 'Alerta de Stock', actor: 'Sistema', detail: 'Stock de Cerveza Mahou bajo (8 unidades)', type: 'inventory', time: '14:10', status: 'warning', icon: Package },
    { id: '3', event: 'Pago Recibido', actor: 'Mesa 4', detail: 'Ticket #4502 pagado por tarjeta (€42.50)', type: 'payment', time: '13:55', status: 'success', icon: CreditCard },
    { id: '4', event: 'Nueva Reserva', actor: 'Laura Wilson', detail: 'Reserva para 4 personas (Mesa 12)', type: 'booking', time: '13:40', status: 'info', icon: Calendar },
    { id: '5', event: 'Vuelta de Descanso', actor: 'Elena Rivas', detail: 'Terminó descanso de 15 min', type: 'staff', time: '13:20', status: 'info', icon: Coffee },
    { id: '6', event: 'Solicitud Ausencia', actor: 'Roberto Gil', detail: 'Solicitó día libre para el 12/03', type: 'staff', time: '12:50', status: 'warning', icon: UserMinus },
    { id: '7', event: 'Ambiente Lleno', actor: 'Sensor Salón', detail: 'Ocupación del Salón al 100%', type: 'env', time: '12:15', status: 'critical', icon: AlertTriangle },
    { id: '8', event: 'Incidencia Fichaje', actor: 'Marcos Soto', detail: 'Olvidó fichar salida ayer (20:00)', type: 'staff', time: '11:30', status: 'critical', icon: Clock },
    { id: '9', event: 'Check-out Personal', actor: 'Sofía Lara', detail: 'Finalizó turno (Total 8h 15m)', type: 'staff', time: '11:05', status: 'info', icon: UserMinus },
    { id: '10', event: 'Pedido Stock', actor: 'Proveedor Central', detail: 'Pedido #902 confirmado (Carnes)', type: 'inventory', time: '10:45', status: 'success', icon: Package },
];

export default function NotificationsPage() {
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

    const filteredEvents = eventData.filter(item => {
        // Filter by category
        if (item.type === 'staff' && !filterConfig.showStaff) return false;
        if (item.type === 'inventory' && !filterConfig.showInventory) return false;
        if (item.type === 'payment' && !filterConfig.showPayments) return false;
        if (item.type === 'booking' && !filterConfig.showBookings) return false;
        if (item.type === 'env' && !filterConfig.showEnv) return false;
        
        // Filter by criticality if option is active
        if (filterConfig.showCritical && item.status !== 'critical' && item.status !== 'warning') return false;
        
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
                                    <TableHead>Actor / Origen</TableHead>
                                    <TableHead>Detalles</TableHead>
                                    <TableHead align="center">Categoría</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <TableRow key={item.id} className="group">
                                            <TableCell align="center">
                                                <TextSM className="font-semibold text-muted-foreground">
                                                    {item.time}
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
