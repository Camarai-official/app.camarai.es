'use client';

import * as React from 'react';
import { 
    Users, 
    Search, 
    UserPlus, 
    Download, 
    TrendingUp, 
    TrendingDown, 
    Star, 
    CreditCard,
    Calendar,
    MessageSquare,
    MoreHorizontal,
    Trash,
    Edit,
    AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// UI Components
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { H3, TextSM, TextXS } from '@/components/ui/typography';
import { SearchInput } from '@/components/ui/search-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Layout Components
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';

// Feature Components
import { MetricCard } from '@/components/widgets/metric-card';
import { ActionTile } from '@/components/ui/action-tile';

const mockClients = [
    { id: '1', nombre: 'Juan Pérez', email: 'juan@gmail.com', spent: '1,240€', visits: 12, lastVisit: '2026-02-20', loyalty: 'Gold' },
    { id: '2', nombre: 'María García', email: 'm.garcia@outlook.com', spent: '850€', visits: 8, lastVisit: '2026-02-15', loyalty: 'Silver' },
    { id: '3', nombre: 'Carlos Rodríguez', email: 'carlos_r@empresa.es', spent: '2,100€', visits: 24, lastVisit: '2026-02-25', loyalty: 'Platinum' },
    { id: '4', nombre: 'Ana Martínez', email: 'ana.m@gmail.com', spent: '420€', visits: 4, lastVisit: '2026-01-30', loyalty: 'Bronze' },
    { id: '5', nombre: 'Laura Sánchez', email: 'laura.s@icloud.com', spent: '680€', visits: 6, lastVisit: '2026-02-10', loyalty: 'Silver' },
];

export default function ClientsPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = React.useState('');

    return (
        <PageContainer>
            <PageHeader 
                title="Clientes" 
                subtitle="Gestiona tu base de datos de clientes y programas de fidelización."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" startIcon={<Download />}>Exportar</Button>
                        <Button startIcon={<UserPlus />}>Nuevo Cliente</Button>
                    </div>
                }
            />
            
            <PageContent className="space-y-6">
                {/* METRICS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard 
                        title="Clientes Totales"
                        value="1,248"
                        change="+12.5%"
                        changeType="increase"
                        icon={Users}
                    />
                    <MetricCard 
                        title="Ticket Medio"
                        value="42.50€"
                        change="+5.2%"
                        changeType="increase"
                        icon={CreditCard}
                    />
                    <MetricCard 
                        title="Visitantes Semanales"
                        value="382"
                        change="-2.1%"
                        changeType="decrease"
                        icon={Calendar}
                    />
                    <MetricCard 
                        title="Nivel de Fidelidad"
                        value="84%"
                        change="+8.4%"
                        changeType="increase"
                        icon={Star}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* CLIENT LIST AREA */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader 
                                title="Listado de Clientes"
                                children={
                                    <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:items-center sm:justify-between w-full">
                                        <SearchInput 
                                            placeholder="Buscar cliente por nombre, email o ID..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full sm:max-w-xs"
                                        />
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="h-8">Recientes</Badge>
                                            <Badge variant="outline" className="h-8">VIP</Badge>
                                            <Badge variant="outline" className="h-8">Inactivos</Badge>
                                        </div>
                                    </div>
                                }
                            />
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead className="hidden md:table-cell">Gasto Total</TableHead>
                                            <TableHead className="hidden md:table-cell">Visitas</TableHead>
                                            <TableHead>Fidelidad</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockClients.map((client) => (
                                            <TableRow key={client.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarFallback className="font-bold text-xs">
                                                                {client.nombre.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-bold text-sm truncate">{client.nombre}</span>
                                                            <span className="text-xs text-muted-foreground truncate">{client.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell font-medium">
                                                    {client.spent}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {client.visits}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        client.loyalty === 'Platinum' ? 'completed' : 
                                                        client.loyalty === 'Gold' ? 'success' : 
                                                        client.loyalty === 'Silver' ? 'info' : 'secondary'
                                                    }>
                                                        {client.loyalty}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => toast({ title: "Editar cliente", description: `Editando a ${client.nombre}` })}>
                                                                <Edit className="h-4 w-4 mr-2" /> Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => toast({ title: "Enviar mensaje", description: `Enviando mensaje a ${client.nombre}` })}>
                                                                <MessageSquare className="h-4 w-4 mr-2" /> Mensaje
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => toast({ title: "Eliminar cliente", variant: "destructive", description: `Eliminando a ${client.nombre}` })}>
                                                                <Trash className="h-4 w-4 mr-2" /> Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* SIDE PANEL */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader title="Acciones Rápidas">
                                <CardDescription>Tareas comunes de gestión.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <ActionTile 
                                    icon={UserPlus} 
                                    title="Importar CSV" 
                                    description="Cargar base de datos masiva"
                                    onClick={() => {}}
                                />
                                <ActionTile 
                                    icon={Star} 
                                    title="Reglas de Puntos" 
                                    description="Configura la fidelización"
                                    onClick={() => {}}
                                />
                                <ActionTile 
                                    icon={MessageSquare} 
                                    title="Campaña SMS" 
                                    description="Enviar promo a todos"
                                    onClick={() => {}}
                                />
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader title="Insight de Clientes">
                                <CardDescription>Basado en datos de IA</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <TrendingUp className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold">Aumento de recurrencia</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                Los clientes Gold han aumentado sus visitas un 15% tras la última campaña.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                                            <AlertCircle className="h-4 w-4 text-warning" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold">Riesgo de abandono</p>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                42 clientes Silver no han visitado el local en los últimos 30 días.
                                            </p>
                                        </div>
                                    </div>
                                    <Button fullWidth variant="outline" className="h-8 text-[11px]">Ver Informe Completo</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageContent>
        </PageContainer>
    );
}
