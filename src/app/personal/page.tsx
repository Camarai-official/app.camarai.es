'use client';

import * as React from 'react';
import { 
    Search, 
    User, 
    Calendar, 
    Clock, 
    Settings, 
    Activity, 
    MoreHorizontal, 
    MessageSquare, 
    Smartphone, 
    Users, 
    Wifi, 
    WifiOff, 
    Monitor, 
    Tablet, 
    Check, 
    X, 
    Download,
    TrendingUp,
    TrendingDown,
    Zap,
    HeartPulse,
    AlertCircle,
    Plus,
    SmilePlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// UI Components
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { H3 } from '@/components/ui/typography';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/ui/search-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Layout Components
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';

// Feature Components
import { StaffCard, type StaffStatus } from '@/components/ui/personal-card';
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { ActionTile } from '@/components/ui/action-tile';

// Dialog Components
import { EmployeeDialog, type ExtendedStaffMember } from '@/components/dialogs/personal-edit-dialog';
import { TimeLogDialog } from '@/components/dialogs/personal-fichaje-dialog';
import { AbsenceRequestDialog } from '@/components/dialogs/absence-request-dialog';
import { DeviceDialog } from '@/components/dialogs/device-dialog';
import { PersonalConfigDialog, type PersonalConfig } from '@/components/dialogs/personal-config-dialog';

// Data & Types
import {
    mockTimeLogs,
    mockAbsenceRequests,
    mockStaffMembers,
    type TimeLog,
    type AbsenceRequest
} from '@/data/mock-data';
import {
    mockIncidencias,
    mockDispositivos,
    tipoIncidenciaLabels,
    estadoIncidenciaLabels,
    estadoDispositivoLabels,
    type IncidenciaFichaje,
    type DispositivoFichaje,
    type EstadoIncidencia 
} from '@/types/fichaje';

// Métodos de fichaje disponibles
const metodosFichaje = [
    { id: 'app', label: 'App Móvil', icon: Smartphone, description: 'Fichaje desde la app' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, description: 'Envía "Fichar" al bot' },
    { id: 'qr', label: 'Código QR', icon: Smartphone, description: 'Escanea el QR del local' },
    { id: 'web', label: 'Panel Web', icon: User, description: 'Desde el ordenador' },
];

export default function PersonalPage() {
    const { toast } = useToast();
    
    // Core State
    const [staffMembers, setStaffMembers] = React.useState<ExtendedStaffMember[]>(mockStaffMembers as ExtendedStaffMember[]);
    const [timeLogs, setTimeLogs] = React.useState<TimeLog[]>(mockTimeLogs);
    const [absenceRequests, setAbsenceRequests] = React.useState<AbsenceRequest[]>(mockAbsenceRequests);
    const [incidencias, setIncidencias] = React.useState<IncidenciaFichaje[]>(mockIncidencias);
    const [dispositivos, setDispositivos] = React.useState<DispositivoFichaje[]>(mockDispositivos);
    
    // UI State
    const [searchTerm, setSearchTerm] = React.useState('');
    const [metodosFichajeState, setMetodosFichajeState] = React.useState(metodosFichaje.map(m => ({ ...m, enabled: true })));
    const [personalConfig, setPersonalConfig] = React.useState<PersonalConfig>({
        kpis: true, equipo: true, controlHorario: true, ausencias: true, incidencias: true, fichaje: true 
    });
    const [timeLogFilterStaff, setTimeLogFilterStaff] = React.useState<string>('all');
    const [timeLogFilterAction, setTimeLogFilterAction] = React.useState<string>('all');

    // Dialogs State
    const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = React.useState(false);
    const [editingEmployee, setEditingEmployee] = React.useState<ExtendedStaffMember | null>(null);
    
    const [isTimeLogDialogOpen, setIsTimeLogDialogOpen] = React.useState(false);
    const [editingTimeLog, setEditingTimeLog] = React.useState<TimeLog | null>(null);
    
    const [isAbsenceRequestDialogOpen, setIsAbsenceRequestDialogOpen] = React.useState(false);
    
    const [isDeviceDialogOpen, setIsDeviceDialogOpen] = React.useState(false);
    const [editingDevice, setEditingDevice] = React.useState<DispositivoFichaje | null>(null);
    
    const [isConfigDialogOpen, setIsConfigDialogOpen] = React.useState(false);

    // Helpers
    const getStaffMemberStatus = (id: string): StaffStatus => {
        const logs = timeLogs.filter(log => log.staffId === id);
        if (logs.length === 0) return 'inactive';
        const lastLog = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        if (lastLog.action === 'clock-in') return 'active';
        if (lastLog.action === 'start-break') return 'break';
        return 'inactive';
    };

    // Handlers: Employees
    const handleOpenEmployeeDialog = (employee?: ExtendedStaffMember) => {
        setEditingEmployee(employee || null);
        setIsEmployeeDialogOpen(true);
    };

    const handleSaveEmployee = (employee: ExtendedStaffMember) => {
        const isEditing = staffMembers.some(s => s.id === employee.id);
        if (isEditing) {
            setStaffMembers(prev => prev.map(s => s.id === employee.id ? employee : s));
            toast({ title: "Empleado actualizado", description: `${employee.nombre} se ha actualizado.` });
        } else {
            setStaffMembers(prev => [...prev, employee]);
            toast({ title: "Empleado añadido", description: `${employee.nombre} se agregó al equipo.` });
        }
    };

    const handleRemoveStaff = (id: string) => {
        setStaffMembers(prev => prev.filter(staff => staff.id !== id));
        toast({ title: "Empleado eliminado", description: "El perfil se eliminó del equipo." });
    };

    // Handlers: Time Logs
    const handleSaveTimeLog = (data: any) => {
        if (editingTimeLog) {
            const updatedLog: TimeLog = {
                ...editingTimeLog,
                timestamp: `${data.date}T${data.time}:00`,
                action: data.type as TimeLog['action']
            };
            setTimeLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
            setEditingTimeLog(null);
            toast({ title: "Registro actualizado", description: "El fichaje se ha modificado correctamente." });
        } else {
            const newLog: TimeLog = {
                id: `log-${Date.now()}`,
                staffId: data.staffId,
                timestamp: `${data.date}T${data.time}:00`,
                action: data.type as TimeLog['action'],
                method: 'manual'
            };
            setTimeLogs(prev => [...prev, newLog]);
            toast({ title: "Fichaje registrado", description: "El registro de tiempo se ha guardado correctamente." });
        }
    };

    // Handlers: Absences
    const handleSaveAbsenceRequest = (data: any) => {
        const newRequest: AbsenceRequest = {
            id: `abs-${Date.now()}`,
            staffId: data.staffId,
            type: data.type,
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason,
            status: 'pending'
        };
        setAbsenceRequests(prev => [...prev, newRequest]);
        toast({ title: "Solicitud enviada", description: "La solicitud de ausencia ha sido registrada y está pendiente de aprobación." });
    };

    const updateAbsenceStatus = (id: string, status: 'approved' | 'rejected') => {
        setAbsenceRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
        toast({
            title: status === 'approved' ? "Solicitud aprobada" : "Solicitud rechazada",
            description: `La solicitud ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'}.`
        });
    };

    // Handlers: Incidencias
    const handleIncidenciaAction = (id: string, nuevoEstado: EstadoIncidencia) => {
        setIncidencias(prev => prev.map(inc => inc.id === id ? { ...inc, estado: nuevoEstado } : inc));
        toast({
            title: nuevoEstado === 'aprobada' ? "Incidencia aprobada" : "Incidencia rechazada",
            description: `La incidencia ha sido ${estadoIncidenciaLabels[nuevoEstado].toLowerCase()}.`
        });
    };

    // Handlers: Devices
    const handleSaveDevice = (device: DispositivoFichaje) => {
        const isEditing = dispositivos.some(d => d.id === device.id);
        if (isEditing) {
            setDispositivos(prev => prev.map(d => d.id === device.id ? device : d));
            toast({ title: "Dispositivo actualizado", description: `${device.nombre} se ha actualizado.` });
        } else {
            setDispositivos(prev => [...prev, { ...device, id: `dev-${Date.now()}` }]);
            toast({ title: "Dispositivo añadido", description: `${device.nombre} se agregó a la lista.` });
        }
        setEditingDevice(null);
    };

    const handleDeleteDevice = (id: string) => {
        setDispositivos(prev => prev.filter(d => d.id !== id));
        toast({ title: "Dispositivo eliminado", description: "El dispositivo ha sido eliminado." });
    };

    // Computed Stats
    const filteredStaff = React.useMemo(() => {
        return staffMembers.filter(staff =>
            staff.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (staff.rol || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [staffMembers, searchTerm]);

    const stats = React.useMemo(() => {
        const activos = staffMembers.filter(s => s.estado === 'Activo').length;
        const trabajandoAhora = staffMembers.filter(s => getStaffMemberStatus(s.id) === 'active').length;
        const enDescanso = staffMembers.filter(s => getStaffMemberStatus(s.id) === 'break').length;
        const todayStr = '2024-07-12'; // Mock stable date
        const horasHoy = timeLogs.filter(l => l.timestamp.split('T')[0] === todayStr).length * 2;
        return { total: staffMembers.length, activos, trabajandoAhora, enDescanso, horasHoy };
    }, [staffMembers, timeLogs]);

    return (
        <PageContainer>
            <PageHeader
                title="Gestión de Personal"
                actions={
                    <div className="flex items-center gap-2">
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="md" 
                                        onClick={() => setIsConfigDialogOpen(true)} 
                                        aria-label="Configurar vista" 
                                        startIcon={<Settings/>} 
                                    />
                                </TooltipTrigger>
                                <TooltipContent>Configurar Vista</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                }
            />
            
            <PageContent>
                <Tabs defaultValue="team" className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-start gap-4 mb-6">
                        <div className="overflow-x-auto pb-1 scrollbar-hide">
                            <TabsList>
                                <TabsTrigger value="team" icon={Users}>
                                    Equipo
                                </TabsTrigger>
                                <TabsTrigger value="time-tracking" icon={Clock}>
                                    Control Horario
                                </TabsTrigger>
                                <TabsTrigger value="absences" icon={Calendar}>
                                    Ausencias
                                </TabsTrigger>
                                <TabsTrigger value="incidencias" icon={AlertCircle}>
                                    Incidencias
                                </TabsTrigger>
                                <TabsTrigger value="fichaje" icon={Smartphone}>
                                    Métodos
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    <TabsContent value="team" className="space-y-6">
                        {/* KPIs as ActionTiles */}
                        {personalConfig.kpis && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                <ActionTile
                                    title={stats.total.toString()}
                                    description="Total Empleados"
                                    icon={Users}
                                />
                                <ActionTile
                                    title={stats.activos.toString()}
                                    description="Activos"
                                    icon={Check}
                                />
                                <ActionTile
                                    title={stats.trabajandoAhora.toString()}
                                    description="Trabajando Ahora"
                                    icon={Activity}
                                />
                                <ActionTile
                                    title={stats.enDescanso.toString()}
                                    description="En Descanso"
                                    icon={Clock}
                                />
                                <ActionTile
                                    title={`${stats.horasHoy}h`}
                                    description="Horas Hoy"
                                    icon={Zap}
                                />
                            </div>
                        )}
                        
                        {/* New Actions Row */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button 
                                    variant="default" 
                                    size="md" 
                                    onClick={() => handleOpenEmployeeDialog()}
                                    startIcon={<Plus />}
                                >
                                    Añadir nuevo empleado
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="md" 
                                    onClick={() => { setEditingTimeLog(null); setIsTimeLogDialogOpen(true); }}
                                    startIcon={<Clock />}
                                >
                                    Fichaje manual
                                </Button>
                            </div>
                            <SearchInput
                                containerClassName="w-full sm:w-64"
                                placeholder="Buscar empleado..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            {personalConfig.equipo && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredStaff.length === 0 && staffMembers.length === 0 ? (
                                        <EmptyState 
                                            icon={User}
                                            title="Equipo vacío"
                                            description="Añade empleados para gestionar turnos y asistencias"
                                            action={<CreateActionCard label="Añadir primer empleado" onClick={() => handleOpenEmployeeDialog()} />}
                                            className="col-span-full py-16 bg-muted/10 border-muted/50"
                                        />
                                    ) : filteredStaff.length === 0 ? (
                                        <EmptyState 
                                            icon={Search}
                                            title="Sin resultados"
                                            description="No se encontraron empleados con ese criterio de búsqueda"
                                            className="col-span-full py-16 border-none bg-transparent"
                                        />
                                    ) : null}
                                    {filteredStaff.map(staff => (
                                        <StaffCard
                                            key={staff.id}
                                            staff={staff}
                                            status={getStaffMemberStatus(staff.id)}
                                            onEdit={() => handleOpenEmployeeDialog(staff)}
                                            onWhatsApp={() => window.open(`https://wa.me/${staff.telefono?.replace(/\D/g, '')}`, '_blank')}
                                        />
                                    ))}
                                    <CreateActionCard className="h-32" label="Añadir Empleado" onClick={() => handleOpenEmployeeDialog()} />
                                </div>
                        )}
                    </div>
                </TabsContent>

                    <TabsContent value="time-tracking">
                        {personalConfig.controlHorario && (
                            <Card>
                                <CardHeader>
                                    <H3>Registro de Actividad Reciente</H3>
                                    <CardDescription>Últimos fichajes y movimientos del personal.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Empleado</TableHead>
                                                    <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                                                    <TableHead>Hora</TableHead>
                                                    <TableHead className="text-center">Acción</TableHead>
                                                    <TableHead className="hidden md:table-cell">Método</TableHead>
                                                    <TableHead className="w-[60px]"><span className="sr-only">Acciones</span></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {timeLogs
                                                    .filter(log => timeLogFilterStaff === 'all' || log.staffId === timeLogFilterStaff)
                                                    .filter(log => timeLogFilterAction === 'all' || log.action === timeLogFilterAction)
                                                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                                    .slice(0, 20)
                                                    .map(log => {
                                                        const staff = staffMembers.find(s => s.id === log.staffId);
                                                        const date = new Date(log.timestamp);
                                                        return (
                                                            <TableRow key={log.id}>
                                                                <TableCell className="font-medium">{staff?.nombre || 'Desconocido'}</TableCell>
                                                                <TableCell className="hidden sm:table-cell">{date.toLocaleDateString()}</TableCell>
                                                                <TableCell>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                                                <TableCell className="text-center">
                                                                    <Badge variant="outline" className="capitalize">
                                                                        {log.action.replace('-', ' ')}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="hidden md:table-cell text-muted-foreground text-xs capitalize">{log.method}</TableCell>
                                                                 <TableCell>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="md" 
                                                                        onClick={() => { setEditingTimeLog(log); setIsTimeLogDialogOpen(true); }}
                                                                    >
                                                                        <MoreHorizontal />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="absences">
                        {personalConfig.ausencias && (
                            <Card>
                                <CardHeader>
                                    <H3>Gestión de Ausencias</H3>
                                    <CardDescription>Solicitudes de vacaciones, permisos y bajas médicas.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Empleado</TableHead>
                                                    <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                                                    <TableHead>Fechas</TableHead>
                                                    <TableHead className="text-center">Estado</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {absenceRequests.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(req => {
                                                    const staff = staffMembers.find(s => s.id === req.staffId);
                                                    return (
                                                        <TableRow key={req.id}>
                                                            <TableCell className="font-medium">{staff?.nombre}</TableCell>
                                                            <TableCell className="hidden sm:table-cell capitalize">{req.type.replace('_', ' ')}</TableCell>
                                                            <TableCell className="text-xs sm:text-sm">
                                                                {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                                    {req.status === 'approved' ? 'Aprobado' : req.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {req.status === 'pending' && (
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button size="md" variant="ghost-success" onClick={() => updateAbsenceStatus(req.id, 'approved')} startIcon={<Check />} />
                                                                        <Button size="md" variant="ghost-destructive" onClick={() => updateAbsenceStatus(req.id, 'rejected')} startIcon={<X />} />
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="incidencias">
                        {personalConfig.incidencias && (
                            <Card>
                                <CardHeader>
                                    <H3>Incidencias de Fichaje</H3>
                                    <CardDescription>Gestiona las incidencias reportadas por el sistema o los empleados.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Empleado</TableHead>
                                                    <TableHead className="text-center">Tipo</TableHead>
                                                    <TableHead>Fecha/Hora</TableHead>
                                                    <TableHead className="hidden md:table-cell">Motivo</TableHead>
                                                    <TableHead className="text-center">Estado</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {incidencias.map(inc => {
                                                    const staff = staffMembers.find(s => s.id === inc.staffId);
                                                    return (
                                                        <TableRow key={inc.id}>
                                                            <TableCell className="font-medium">{staff?.nombre || 'Desconocido'}</TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="outline">{tipoIncidenciaLabels[inc.tipo]}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs sm:text-sm">{inc.fecha} {inc.hora}</TableCell>
                                                            <TableCell className="hidden md:table-cell max-w-[200px] truncate">{inc.motivo || '-'}</TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant={inc.estado === 'aprobada' ? 'success' : inc.estado === 'rechazada' ? 'destructive' : 'secondary'}>
                                                                    {estadoIncidenciaLabels[inc.estado]}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {inc.estado === 'pendiente' && (
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button size="md" variant="ghost-success" onClick={() => handleIncidenciaAction(inc.id, 'aprobada')} startIcon={<Check />} />
                                                                        <Button size="md" variant="ghost-destructive" onClick={() => handleIncidenciaAction(inc.id, 'rechazada')} startIcon={<X />} />
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="fichaje" className="space-y-6">
                        {personalConfig.fichaje && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <H3>Canales de Fichaje</H3>
                                            <CardDescription>Activa o desactiva los métodos disponibles para tu equipo.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                            {metodosFichajeState.map((metodo) => (
                                                <ActionTile
                                                    key={metodo.id}
                                                    icon={metodo.icon}
                                                    title={metodo.label}
                                                    description={metodo.description}
                                                    rightContentType="switch"
                                                    switchId={`method-${metodo.id}`}
                                                    switchChecked={metodo.enabled}
                                                    onSwitchChange={() => {
                                                        setMetodosFichajeState(prev => prev.map(m => 
                                                            m.id === metodo.id ? { ...m, enabled: !m.enabled } : m
                                                        ));
                                                        toast({
                                                            title: metodo.enabled ? "Método desactivado" : "Método activado",
                                                            description: `${metodo.label} se ha ${metodo.enabled ? 'desactivado' : 'activado'} correctamente.`
                                                        });
                                                    }}
                                                />
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <H3>Dispositivos de Fichaje</H3>
                                            <CardDescription>Tablets y terminales registrados en tus locales.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                            {dispositivos.map(device => (
                                                <ActionTile
                                                    key={device.id}
                                                    icon={device.tipo === 'tablet' ? Tablet : device.tipo === 'terminal' ? Monitor : Smartphone}
                                                    iconColor={device.estado === 'online' ? '#22c55e' : device.estado === 'offline' ? '#ef4444' : '#f59e0b'}
                                                    title={device.nombre}
                                                    description={device.ubicacion || 'Sin ubicación'}
                                                    rightContentType="dropdown"
                                                    dropdownItems={[
                                                        { label: 'Configurar', onClick: () => { setEditingDevice(device); setIsDeviceDialogOpen(true); }, icon: <Settings className="h-4 w-4 mr-2" /> },
                                                        { label: 'Eliminar', onClick: () => handleDeleteDevice(device.id), icon: <X className="h-4 w-4 mr-2" /> }
                                                    ]}
                                                />
                                            ))}
                                            <CreateActionCard 
                                                variant="list"
                                                label="Vincular nuevo dispositivo" 
                                                onClick={() => setIsDeviceDialogOpen(true)} 
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <H3>Integración WhatsApp</H3>
                                            <CardDescription>Configuración del bot de asistencia automática.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <ActionTile
                                                icon={MessageSquare}
                                                iconColor="#25D366"
                                                title="Estado del Servicio"
                                                description="Bot configurado y activo"
                                                rightContentType="badge"
                                                badgeText="Conectado"
                                                badgeVariant="success"
                                            />
                                            
                                            <div className="p-4 bg-muted/50 rounded-xl flex items-center gap-6">
                                                <div className="p-2 bg-white rounded-lg border shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img 
                                                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/34600000000?text=Fichar"
                                                        alt="QR WhatsApp Fichaje"
                                                        width={100}
                                                        height={100}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm">Escanea el código QR</p>
                                                    <p className="text-xs text-muted-foreground">Comparte este código con tus empleados para que añadan el bot rápidamente.</p>
                                                    <Button variant="link" size="sm" className="p-0 h-auto" startIcon={<Download className="h-3.5 w-3.5" />}>
                                                        Descargar Imagen QR
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {[
                                                    { step: 1, title: 'Enviar "Fichar"', desc: 'Al +34 600 000 000' },
                                                    { step: 2, title: 'Elegir Acción', desc: 'Entrada / Salida / Pausa' },
                                                    { step: 3, title: 'Confirmado', desc: 'Sincronización instantánea' }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{item.step}</div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold leading-none">{item.title}</p>
                                                            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <H3>Uso por Canal</H3>
                                            <CardDescription>Distribución de fichajes en los últimos 30 días.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-1">
                                            {[
                                                { label: 'WhatsApp', value: 45, icon: MessageSquare, color: '#25D366' },
                                                { label: 'App Móvil', value: 30, icon: Smartphone, color: '#9B6EFD' },
                                                { label: 'QR Code', value: 15, icon: Smartphone, color: '#78A3ED' },
                                                { label: 'Panel Web', value: 10, icon: Monitor, color: '#F7B731' }
                                            ].map((item, i) => (
                                                <ActionTile
                                                    key={i}
                                                    icon={item.icon}
                                                    iconColor={item.color}
                                                    title={item.label}
                                                    rightContentType="progress"
                                                    progressValue={item.value}
                                                />
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </PageContent>

            {/* Dialogs */}
            <EmployeeDialog
                open={isEmployeeDialogOpen}
                onOpenChange={setIsEmployeeDialogOpen}
                employeeToEdit={editingEmployee}
                onSave={handleSaveEmployee}
                onDelete={handleRemoveStaff}
            />

            <TimeLogDialog
                open={isTimeLogDialogOpen}
                onOpenChange={setIsTimeLogDialogOpen}
                editingTimeLog={editingTimeLog}
                staffMembers={staffMembers}
                onSave={handleSaveTimeLog}
            />

            <AbsenceRequestDialog
                open={isAbsenceRequestDialogOpen}
                onOpenChange={setIsAbsenceRequestDialogOpen}
                staffMembers={staffMembers}
                onSave={handleSaveAbsenceRequest}
            />

            <DeviceDialog
                open={isDeviceDialogOpen}
                onOpenChange={setIsDeviceDialogOpen}
                editingDevice={editingDevice}
                onSave={handleSaveDevice}
            />

            <PersonalConfigDialog
                open={isConfigDialogOpen}
                onOpenChange={setIsConfigDialogOpen}
                config={personalConfig}
                onToggle={(key) => setPersonalConfig(prev => ({ ...prev, [key]: !prev[key] }))}
            />
        </PageContainer>
    );
}
