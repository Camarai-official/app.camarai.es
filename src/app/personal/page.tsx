'use client';

import * as React from 'react';
import { 
    PlusCircle, 
    Search, 
    User, 
    Calendar, 
    Clock, 
    Settings, 
    Activity, 
    Edit, 
    MessageSquare, 
    Smartphone, 
    Users, 
    Wifi, 
    WifiOff, 
    Monitor, 
    Tablet, 
    Check, 
    X, 
    Download
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
import { H3 } from '@/components/ui/typography';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/ui/search-input';

// Layout Components
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';

// Feature Components
import { StaffCardPro, type StaffStatus } from '@/components/features/staff-card-pro';
import { CreateActionCard } from '@/components/widgets/create-action-card';

// Dialog Components
import { EmployeeDialog, type ExtendedStaffMember } from '@/components/dialogs/employee-dialog';
import { TimeLogDialog } from '@/components/dialogs/time-log-dialog';
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
                    <Button variant="outline" size="md" onClick={() => setIsConfigDialogOpen(true)} aria-label="Configurar vista">
                        <Settings className="h-4 w-4" />
                    </Button>
                }
            />
            
            <PageContent>
                {/* KPIs */}
                {personalConfig.kpis && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            { label: 'Total Empleados', value: stats.total },
                            { label: 'Activos', value: stats.activos },
                            { label: 'Trabajando Ahora', value: stats.trabajandoAhora, badge: 'En línea' },
                            { label: 'En Descanso', value: stats.enDescanso },
                            { label: 'Horas Hoy', value: `${stats.horasHoy}h` }
                        ].map((stat, i) => (
                            <Card key={i} className="border-none shadow-none rounded-lg bg-muted/30">
                                <CardContent className="p-4">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold text-primary mt-1">{stat.value}</p>
                                    {stat.badge && <Badge variant="completed" className="text-[10px] mt-1 px-1 py-0 h-4">{stat.badge}</Badge>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                
                <Tabs defaultValue="team" className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
                            <TabsList className="inline-flex w-max md:w-auto">
                                <TabsTrigger value="team" className="px-6 md:px-3">Equipo</TabsTrigger>
                                <TabsTrigger value="time-tracking" className="px-6 md:px-3">Control Horario</TabsTrigger>
                                <TabsTrigger value="absences" className="px-6 md:px-3">Ausencias</TabsTrigger>
                                <TabsTrigger value="incidencias" className="px-6 md:px-3">Incidencias</TabsTrigger>
                                <TabsTrigger value="fichaje" className="px-6 md:px-3">Métodos Fichaje</TabsTrigger>
                            </TabsList>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditingTimeLog(null); setIsTimeLogDialogOpen(true); }}>
                                <Clock className="mr-2 h-4 w-4" />Fichaje Manual
                            </Button>
                            <Button onClick={() => handleOpenEmployeeDialog()} size="sm">
                                <PlusCircle className="mr-2 h-4 w-4" />Añadir Empleado
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="team" className="space-y-4">
                        {personalConfig.equipo && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <h2 className="text-xl font-semibold tracking-tight">Mi Equipo</h2>
                                    <SearchInput
                                        containerClassName="sm:w-64"
                                        placeholder="Buscar empleado..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                
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
                                        <StaffCardPro
                                            key={staff.id}
                                            staff={staff}
                                            status={getStaffMemberStatus(staff.id)}
                                            onEdit={() => handleOpenEmployeeDialog(staff)}
                                            onDelete={() => handleRemoveStaff(staff.id)}
                                            onWhatsApp={() => window.open(`https://wa.me/${staff.telefono?.replace(/\D/g, '')}`, '_blank')}
                                        />
                                    ))}
                                    <CreateActionCard label="Añadir Empleado" onClick={() => handleOpenEmployeeDialog()} />
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="time-tracking">
                        {personalConfig.controlHorario && (
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <H3>Registro de Actividad Reciente</H3>
                                            <CardDescription>Últimos fichajes y movimientos del personal.</CardDescription>
                                        </div>
                                    </div>
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
                                                                    <Button variant="ghost" size="sm" onClick={() => { setEditingTimeLog(log); setIsTimeLogDialogOpen(true); }}>
                                                                        <Edit className="h-4 w-4" />
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
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <H3>Solicitudes de Ausencia</H3>
                                        <CardDescription>Gestiona vacaciones y bajas del personal.</CardDescription>
                                    </div>
                                    <Button startIcon={<Calendar className="h-4 w-4" />} onClick={() => setIsAbsenceRequestDialogOpen(true)}>Nueva Solicitud</Button>
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
                                                            <TableCell className="text-xs sm:text-sm">{req.startDate} - {req.endDate}</TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                                    {req.status === 'approved' ? 'Aprobado' : req.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {req.status === 'pending' && (
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateAbsenceStatus(req.id, 'approved')}>
                                                                            <Check className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateAbsenceStatus(req.id, 'rejected')}>
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
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
                                                                <Badge variant={inc.estado === 'aprobada' ? 'default' : inc.estado === 'rechazada' ? 'destructive' : 'secondary'}>
                                                                    {estadoIncidenciaLabels[inc.estado]}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {inc.estado === 'pendiente' && (
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleIncidenciaAction(inc.id, 'aprobada')}>
                                                                            <Check className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleIncidenciaAction(inc.id, 'rechazada')}>
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
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
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {metodosFichaje.map((metodo) => {
                                        const Icon = metodo.icon;
                                        const isWhatsApp = metodo.id === 'whatsapp';
                                        return (
                                            <Card key={metodo.id} className={cn("cursor-pointer hover:shadow-md transition-all group", isWhatsApp && "border-green-500/30")}>
                                                <CardContent className="p-6 text-center">
                                                    <div className={cn("mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-4 transition-colors", isWhatsApp ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary")}>
                                                        <Icon className="h-7 w-7" />
                                                    </div>
                                                    <h3 className="font-semibold mb-1">{metodo.label}</h3>
                                                    <p className="text-sm text-muted-foreground">{metodo.description}</p>
                                                    {isWhatsApp && <Badge variant="outline" className="mt-3 text-green-600 border-green-500/30">Recomendado</Badge>}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                                
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <H3 className="flex items-center gap-2">
                                                    <MessageSquare className="h-5 w-5 text-green-500" />
                                                    Fichaje por WhatsApp
                                                </H3>
                                                <CardDescription>Permite que los empleados fichen enviando un mensaje al bot de WhatsApp.</CardDescription>
                                            </div>
                                            <Badge variant="default">Activo</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h4 className="font-medium">Cómo funciona</h4>
                                                <div className="space-y-3">
                                                    {[
                                                        { step: 1, title: 'Enviar mensaje', desc: 'El empleado escribe "Fichar" al número del bot' },
                                                        { step: 2, title: 'Seleccionar acción', desc: 'Entrada, Salida, Inicio Pausa o Fin Pausa' },
                                                        { step: 3, title: 'Confirmación', desc: 'Recibe confirmación instantánea del registro' }
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">{item.step}</div>
                                                            <div>
                                                                <p className="font-medium text-sm">{item.title}</p>
                                                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
                                                <div className="p-3 bg-white rounded-lg border mb-4">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img 
                                                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/34600000000?text=Fichar"
                                                        alt="QR WhatsApp Fichaje"
                                                        width={120}
                                                        height={120}
                                                    />
                                                </div>
                                                <p className="text-sm font-medium">Escanea para añadir el número</p>
                                                <p className="text-xs text-muted-foreground mt-1">+34 600 000 000</p>
                                                <Button variant="outline" size="sm" className="mt-4">
                                                    <Download className="mr-2 h-4 w-4" />Descargar QR
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <H3>Dispositivos de Fichaje</H3>
                                            <CardDescription>Gestiona tablets y terminales para el fichaje del personal.</CardDescription>
                                        </div>
                                        <Button onClick={() => { setEditingDevice(null); setIsDeviceDialogOpen(true); }}>
                                            <PlusCircle className="mr-2 h-4 w-4" />Añadir Dispositivo
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {dispositivos.map(device => (
                                                <Card key={device.id} className="relative">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "h-10 w-10 rounded-lg flex items-center justify-center",
                                                                    device.estado === 'online' ? "bg-green-100 text-green-600" :
                                                                    device.estado === 'offline' ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                                                                )}>
                                                                    {device.tipo === 'tablet' ? <Tablet className="h-5 w-5" /> :
                                                                     device.tipo === 'terminal' ? <Monitor className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{device.nombre}</p>
                                                                    <p className="text-xs text-muted-foreground">{device.ubicacion || 'Sin ubicación'}</p>
                                                                </div>
                                                            </div>
                                                            <Badge variant={device.estado === 'online' ? 'default' : device.estado === 'offline' ? 'destructive' : 'secondary'} className="gap-1 px-1.5 h-6">
                                                                {device.estado === 'online' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                                                {estadoDispositivoLabels[device.estado]}
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-3 flex gap-2">
                                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingDevice(device); setIsDeviceDialogOpen(true); }}>Configurar</Button>
                                                            <Button variant="outline" size="sm" onClick={() => handleDeleteDevice(device.id)}><X className="h-4 w-4 text-muted-foreground" /></Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><H3>Resumen de Fichajes por Método</H3></CardHeader>
                                    <CardContent className="space-y-4">
                                        {[
                                            { label: 'WhatsApp', value: 45 },
                                            { label: 'App Móvil', value: 30 },
                                            { label: 'QR Code', value: 15 },
                                            { label: 'Panel Web', value: 10 }
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex justify-between text-sm"><span>{item.label}</span><span className="font-medium">{item.value}%</span></div>
                                                <Progress value={item.value} className="h-2" />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </>
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
