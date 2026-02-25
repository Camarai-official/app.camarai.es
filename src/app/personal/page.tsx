'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Clock, Calendar, Check, X, User, Briefcase, Key, Wallet, FileText, Eye, EyeOff, Upload, MessageSquare, QrCode, Smartphone, LogIn, LogOut, Coffee, Users, Filter, Download, RefreshCw, AlertTriangle, Wifi, WifiOff, Monitor, Tablet, Globe, Settings, Edit, Shield, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Progress } from '@/components/ui/progress';
import {
    mockTimeLogs,
    mockAbsenceRequests,
    mockStaffMembers,
    type StaffMember,
    type TimeLog,
    type AbsenceRequest
} from '@/data/mock-data';
import {
    mockIncidencias,
    mockDispositivos,
    tipoIncidenciaLabels,
    estadoIncidenciaLabels,
    tipoDispositivoLabels,
    estadoDispositivoLabels,
    type IncidenciaFichaje,
    type DispositivoFichaje,
    type EstadoIncidencia,
} from '@/types/fichaje';
import { StaffCardPro, type StaffStatus } from '@/components/features/staff-card-pro';
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { SearchInput } from '@/components/ui/search-input';

// Métodos de fichaje disponibles
const metodosFichaje = [
    { id: 'app', label: 'App Móvil', icon: Smartphone, description: 'Fichaje desde la app' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, description: 'Envía "Fichar" al bot' },
    { id: 'qr', label: 'Código QR', icon: QrCode, description: 'Escanea el QR del local' },
    { id: 'web', label: 'Panel Web', icon: User, description: 'Desde el ordenador' },
];

// Extended staff type
interface ExtendedStaffMember extends StaffMember {
    departamento?: string;
    tipo_contrato?: string;
    fecha_alta?: string;
    permisos?: string[];
    establecimientos_asignados?: string[];
    horas_extra_habilitadas?: boolean;
    documentos?: StaffDocument[];
    // Campos para fichaje
    metodos_fichaje_permitidos?: ('app' | 'whatsapp' | 'qr' | 'web')[];
    dispositivo_asignado?: string;
}

interface StaffDocument {
    id: string;
    nombre: string;
    tipo: string;
    fecha_subida: string;
}

const emptyEmployee: ExtendedStaffMember = {
    id: '',
    nombre: '',
    email: '',
    telefono: '',
    rol: '',
    roles: [],
    pin: '0000',
    fotoUrl: '',
    horasContratadas: 40,
    salarioPorHora: 12,
    estado: 'Activo',
    departamento: '',
    tipo_contrato: 'indefinido',
    fecha_alta: new Date().toISOString().split('T')[0],
    permisos: [],
    establecimientos_asignados: [],
    horas_extra_habilitadas: false,
    documentos: [],
    metodos_fichaje_permitidos: ['app', 'qr'],
    dispositivo_asignado: undefined,
};

const permisosDisponibles = [
    { id: 'pos', label: 'Acceso a POS' },
    { id: 'kds', label: 'Acceso a KDS' },
    { id: 'reportes', label: 'Ver Reportes' },
    { id: 'reportes_completos', label: 'Reportes Completos' },
    { id: 'inventario', label: 'Gestionar Inventario' },
    { id: 'personal', label: 'Gestionar Personal' },
    { id: 'configuracion', label: 'Configuración del Sistema' },
    { id: 'integraciones', label: 'Gestionar Integraciones' },
    { id: 'cierre_caja', label: 'Cierre de Caja' },
    { id: 'descuentos', label: 'Aplicar Descuentos' },
    { id: 'anular_comandas', label: 'Anular Comandas' },
    { id: 'editar_comandas', label: 'Editar Comandas de Otros' },
    { id: 'whatsapp_config', label: 'Configurar WhatsApp' },
];

// Sistema de roles con permisos predefinidos
type NivelAcceso = 'camarero' | 'encargado' | 'jefe' | 'personalizado';

const nivelesAcceso: { id: NivelAcceso; label: string; description: string; permisos: string[] }[] = [
    { 
        id: 'camarero', 
        label: 'Camarero', 
        description: 'Acceso básico: POS, KDS, comandas propias',
        permisos: ['pos', 'kds', 'cierre_caja'] 
    },
    { 
        id: 'encargado', 
        label: 'Encargado', 
        description: 'Todo lo de camarero + reportes, personal, inventario',
        permisos: ['pos', 'kds', 'reportes', 'inventario', 'personal', 'cierre_caja', 'descuentos', 'anular_comandas', 'editar_comandas'] 
    },
    { 
        id: 'jefe', 
        label: 'Jefe / Admin', 
        description: 'Acceso total a todas las funciones',
        permisos: permisosDisponibles.map(p => p.id) 
    },
    { 
        id: 'personalizado', 
        label: 'Personalizado', 
        description: 'Selecciona permisos manualmente',
        permisos: [] 
    },
];

// Mock establecimientos
const mockEstablecimientos = [
    { id: 'est-1', nombre: 'Restaurante Principal' },
    { id: 'est-2', nombre: 'Terraza de Verano' },
    { id: 'est-3', nombre: 'Local Centro' },
];

// Employee Dialog Component
function EmployeeDialog({
    open,
    onOpenChange,
    employeeToEdit,
    onSave
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeToEdit: ExtendedStaffMember | null;
    onSave: (employee: ExtendedStaffMember) => void;
}) {
    const [employee, setEmployee] = React.useState<ExtendedStaffMember>(emptyEmployee);
    const [activeTab, setActiveTab] = React.useState('datos');
    const [showPin, setShowPin] = React.useState(false);
    const [nivelAcceso, setNivelAcceso] = React.useState<NivelAcceso>('camarero');

    // Detectar nivel de acceso basado en permisos existentes
    const detectNivelAcceso = (permisos: string[]): NivelAcceso => {
        const jefePermisos = nivelesAcceso.find(n => n.id === 'jefe')!.permisos;
        const encargadoPermisos = nivelesAcceso.find(n => n.id === 'encargado')!.permisos;
        const camareroPermisos = nivelesAcceso.find(n => n.id === 'camarero')!.permisos;
        
        if (jefePermisos.every(p => permisos.includes(p))) return 'jefe';
        if (encargadoPermisos.every(p => permisos.includes(p))) return 'encargado';
        if (camareroPermisos.every(p => permisos.includes(p)) && permisos.length <= camareroPermisos.length + 1) return 'camarero';
        return 'personalizado';
    };

    React.useEffect(() => {
        if (employeeToEdit) {
            setEmployee({
                ...emptyEmployee,
                ...employeeToEdit,
                permisos: employeeToEdit.permisos || [],
                documentos: employeeToEdit.documentos || [],
                establecimientos_asignados: employeeToEdit.establecimientos_asignados || [],
            });
            setNivelAcceso(detectNivelAcceso(employeeToEdit.permisos || []));
        } else {
            setEmployee({
                ...emptyEmployee,
                pin: Math.floor(1000 + Math.random() * 9000).toString(),
            });
            setNivelAcceso('camarero');
        }
        setActiveTab('datos');
        setShowPin(false);
    }, [employeeToEdit, open]);

    const handleNivelAccesoChange = (nivel: NivelAcceso) => {
        setNivelAcceso(nivel);
        if (nivel !== 'personalizado') {
            const nivelConfig = nivelesAcceso.find(n => n.id === nivel);
            if (nivelConfig) {
                setEmployee(prev => ({ ...prev, permisos: [...nivelConfig.permisos] }));
            }
        }
    };

    const handleToggleEstablecimiento = (estId: string) => {
        setEmployee(prev => ({
            ...prev,
            establecimientos_asignados: prev.establecimientos_asignados?.includes(estId)
                ? prev.establecimientos_asignados.filter(e => e !== estId)
                : [...(prev.establecimientos_asignados || []), estId]
        }));
    };

    const handleInputChange = (field: keyof ExtendedStaffMember, value: any) => {
        setEmployee(prev => ({ ...prev, [field]: value }));
    };

    const handleTogglePermiso = (permisoId: string) => {
        setEmployee(prev => ({
            ...prev,
            permisos: prev.permisos?.includes(permisoId)
                ? prev.permisos.filter(p => p !== permisoId)
                : [...(prev.permisos || []), permisoId]
        }));
    };

    const handleSave = () => {
        const employeeToSave = {
            ...employee,
            id: employee.id || `staff-${Date.now()}`,
            fotoUrl: employee.fotoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.nombre}`,
            roles: employee.rol ? [employee.rol] : [],
        };
        onSave(employeeToSave);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle icon={User}>
                        {employeeToEdit ? 'Editar' : 'Añadir'} Empleado
                    </DialogTitle>
                    <DialogDescription>
                        Configura todos los datos del empleado organizados por secciones.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
                        <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-5 p-1">
                            <TabsTrigger value="datos" className="text-xs px-4 sm:px-0"><User className="h-3 w-3 mr-1" />Datos</TabsTrigger>
                            <TabsTrigger value="laboral" className="text-xs px-4 sm:px-0"><Briefcase className="h-3 w-3 mr-1" />Laboral</TabsTrigger>
                            <TabsTrigger value="acceso" className="text-xs px-4 sm:px-0"><Key className="h-3 w-3 mr-1" />Acceso</TabsTrigger>
                            <TabsTrigger value="nomina" className="text-xs px-4 sm:px-0"><Wallet className="h-3 w-3 mr-1" />Nómina</TabsTrigger>
                            <TabsTrigger value="documentos" className="text-xs px-4 sm:px-0"><FileText className="h-3 w-3 mr-1" />Docs</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="h-[45vh] -mx-6">
                        <div className="px-6 py-4 space-y-4">
                        {/* Tab Datos Personales */}
                        <TabsContent value="datos" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="col-span-1">
                                    <ImageUploader
                                        value={employee.fotoUrl}
                                        onChange={(url) => handleInputChange('fotoUrl', url)}
                                        placeholder="Foto del empleado"
                                        aspectRatio="square"
                                        className="max-w-[150px] mx-auto sm:max-w-none"
                                    />
                                </div>
                                <div className="col-span-1 sm:col-span-2 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">Nombre Completo *</Label>
                                        <Input
                                            id="nombre"
                                            value={employee.nombre}
                                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                                            placeholder="Ej: Juan Pérez García"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Correo Electrónico *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={employee.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                placeholder="juan@ejemplo.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="telefono">Teléfono</Label>
                                            <Input
                                                id="telefono"
                                                value={employee.telefono}
                                                onChange={(e) => handleInputChange('telefono', e.target.value)}
                                                placeholder="+34 600 000 000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab Laboral */}
                        <TabsContent value="laboral" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Rol Principal *</Label>
                                    <Select value={employee.rol} onValueChange={(v) => handleInputChange('rol', v)}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="camarero">Camarero/a</SelectItem>
                                            <SelectItem value="cocinero">Cocinero/a</SelectItem>
                                            <SelectItem value="bartender">Bartender</SelectItem>
                                            <SelectItem value="gerente">Gerente</SelectItem>
                                            <SelectItem value="host">Host</SelectItem>
                                            <SelectItem value="ayudante_cocina">Ayudante de Cocina</SelectItem>
                                            <SelectItem value="repartidor">Repartidor/a</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Departamento</Label>
                                    <Select value={employee.departamento || ''} onValueChange={(v) => handleInputChange('departamento', v)}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar departamento" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sala">Sala</SelectItem>
                                            <SelectItem value="cocina">Cocina</SelectItem>
                                            <SelectItem value="barra">Barra</SelectItem>
                                            <SelectItem value="administracion">Administración</SelectItem>
                                            <SelectItem value="reparto">Reparto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Contrato</Label>
                                    <Select value={employee.tipo_contrato || ''} onValueChange={(v) => handleInputChange('tipo_contrato', v)}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="indefinido">Indefinido</SelectItem>
                                            <SelectItem value="temporal">Temporal</SelectItem>
                                            <SelectItem value="practicas">Prácticas</SelectItem>
                                            <SelectItem value="jornada_parcial">Jornada Parcial</SelectItem>
                                            <SelectItem value="autonomo">Autónomo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha_alta">Fecha de Alta</Label>
                                    <Input
                                        id="fecha_alta"
                                        type="date"
                                        value={employee.fecha_alta || ''}
                                        onChange={(e) => handleInputChange('fecha_alta', e.target.value)}
                                        className="dark:[color-scheme:dark]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Estado</Label>
                                <Select value={employee.estado} onValueChange={(v) => handleInputChange('estado', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Activo">Activo</SelectItem>
                                        <SelectItem value="Vacaciones">Vacaciones</SelectItem>
                                        <SelectItem value="Baja">Baja</SelectItem>
                                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>

                        {/* Tab Acceso */}
                        <TabsContent value="acceso" className="space-y-6 mt-0">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">PIN de Acceso</CardTitle>
                                    <CardDescription>Código de 4 dígitos para fichar y acceder al sistema.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type={showPin ? 'text' : 'password'}
                                            value={employee.pin}
                                            onChange={(e) => handleInputChange('pin', e.target.value.slice(0, 4))}
                                            maxLength={4}
                                            className="w-32 text-center text-2xl tracking-widest font-mono"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => setShowPin(!showPin)}>
                                            {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleInputChange('pin', Math.floor(1000 + Math.random() * 9000).toString())}
                                        >
                                            Generar Nuevo
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Nivel de Acceso</CardTitle>
                                    <CardDescription>Selecciona el tipo de usuario para aplicar permisos predefinidos.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {nivelesAcceso.map(nivel => (
                                            <div 
                                                key={nivel.id}
                                                className={cn(
                                                    "p-3 border rounded-lg cursor-pointer transition-all",
                                                    nivelAcceso === nivel.id 
                                                        ? "border-primary bg-primary/5" 
                                                        : "hover:border-muted-foreground/50"
                                                )}
                                                onClick={() => handleNivelAccesoChange(nivel.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full border-2",
                                                        nivelAcceso === nivel.id 
                                                            ? "border-primary bg-primary" 
                                                            : "border-muted-foreground"
                                                    )} />
                                                    <span className="font-medium text-sm">{nivel.label}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 ml-6">
                                                    {nivel.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Permisos del Sistema</CardTitle>
                                    <CardDescription>
                                        {nivelAcceso === 'personalizado' 
                                            ? 'Selecciona los permisos manualmente.' 
                                            : 'Permisos asignados automáticamente según el nivel de acceso.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {permisosDisponibles.map(permiso => (
                                            <div key={permiso.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                        <Shield className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <Label htmlFor={`permiso-${permiso.id}`} className="text-sm font-semibold cursor-pointer">
                                                        {permiso.label}
                                                    </Label>
                                                </div>
                                                <Checkbox
                                                    id={`permiso-${permiso.id}`}
                                                    checked={employee.permisos?.includes(permiso.id)}
                                                    onCheckedChange={() => {
                                                        if (nivelAcceso !== 'personalizado') {
                                                            setNivelAcceso('personalizado');
                                                        }
                                                        handleTogglePermiso(permiso.id);
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Establecimientos Asignados</CardTitle>
                                    <CardDescription>En qué locales puede trabajar este empleado.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-3">
                                        {mockEstablecimientos.map(est => (
                                            <div key={est.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                                                        <Building2 className="h-4 w-4 text-orange-500" />
                                                    </div>
                                                    <Label htmlFor={`est-${est.id}`} className="text-sm font-semibold cursor-pointer">
                                                        {est.nombre}
                                                    </Label>
                                                </div>
                                                <Checkbox
                                                    id={`est-${est.id}`}
                                                    checked={employee.establecimientos_asignados?.includes(est.id)}
                                                    onCheckedChange={() => handleToggleEstablecimiento(est.id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    {(employee.establecimientos_asignados?.length || 0) === 0 && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Sin asignar = acceso a todos los establecimientos
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                            
                            {/* Métodos de Fichaje Permitidos (Fase 7) */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Métodos de Fichaje Permitidos</CardTitle>
                                    <CardDescription>Selecciona cómo puede fichar este empleado.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {metodosFichaje.map(metodo => {
                                            const Icon = metodo.icon;
                                            return (
                                                <div key={metodo.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                                            <Icon className="h-4 w-4 text-blue-500" />
                                                        </div>
                                                        <Label htmlFor={`metodo-${metodo.id}`} className="text-sm font-semibold cursor-pointer">
                                                            {metodo.label}
                                                        </Label>
                                                    </div>
                                                    <Checkbox
                                                        id={`metodo-${metodo.id}`}
                                                        checked={employee.metodos_fichaje_permitidos?.includes(metodo.id as 'app' | 'whatsapp' | 'qr' | 'web')}
                                                        onCheckedChange={() => {
                                                            const metodoId = metodo.id as 'app' | 'whatsapp' | 'qr' | 'web';
                                                            setEmployee(prev => ({
                                                                ...prev,
                                                                metodos_fichaje_permitidos: prev.metodos_fichaje_permitidos?.includes(metodoId)
                                                                    ? prev.metodos_fichaje_permitidos.filter(m => m !== metodoId)
                                                                    : [...(prev.metodos_fichaje_permitidos || []), metodoId]
                                                            }));
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab Nómina */}
                        <TabsContent value="nomina" className="space-y-6 mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="horasContratadas">Horas Contratadas (semanales)</Label>
                                    <Input
                                        id="horasContratadas"
                                        type="number"
                                        value={employee.horasContratadas}
                                        onChange={(e) => handleInputChange('horasContratadas', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salarioPorHora">Salario por Hora (€)</Label>
                                    <Input
                                        id="salarioPorHora"
                                        type="number"
                                        step="0.01"
                                        value={employee.salarioPorHora}
                                        onChange={(e) => handleInputChange('salarioPorHora', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <Card className="bg-muted/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Estimación Mensual</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Horas mensuales (aprox):</span>
                                        <span>{(employee.horasContratadas * 4.33).toFixed(0)} horas</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Salario bruto mensual:</span>
                                        <span className="font-medium">€{(employee.horasContratadas * 4.33 * employee.salarioPorHora).toFixed(2)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label>Horas Extra Habilitadas</Label>
                                    <p className="text-xs text-muted-foreground">Permitir registro de horas extra</p>
                                </div>
                                <Checkbox
                                    checked={employee.horas_extra_habilitadas}
                                    onCheckedChange={(checked) => handleInputChange('horas_extra_habilitadas', checked)}
                                />
                            </div>
                        </TabsContent>

                        {/* Tab Documentos */}
                        <TabsContent value="documentos" className="space-y-6 mt-0">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Documentos del Empleado</CardTitle>
                                    <CardDescription>Sube y gestiona documentos como DNI, contratos, certificados.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm font-medium">Arrastra archivos aquí</p>
                                        <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
                                        <Button variant="outline" size="sm" className="mt-2">
                                            Seleccionar Archivo
                                        </Button>
                                    </div>

                                    {employee.documentos && employee.documentos.length > 0 ? (
                                        <div className="space-y-2">
                                            {employee.documentos.map(doc => (
                                                <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm font-medium">{doc.nombre}</p>
                                                            <p className="text-xs text-muted-foreground">{doc.tipo} • {doc.fecha_subida}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm">Ver</Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-center text-muted-foreground py-4">
                                            No hay documentos subidos.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button variant="brand" onClick={handleSave}>Guardar Empleado</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function PersonalPage() {
    const [staffMembers, setStaffMembers] = React.useState<ExtendedStaffMember[]>(mockStaffMembers as ExtendedStaffMember[]);

    const [timeLogs, setTimeLogs] = React.useState<TimeLog[]>(mockTimeLogs);
    const [absenceRequests, setAbsenceRequests] = React.useState<AbsenceRequest[]>(mockAbsenceRequests);
    
    // Estado para incidencias y dispositivos (Fases 5-6)
    const [incidencias, setIncidencias] = React.useState<IncidenciaFichaje[]>(mockIncidencias);
    const [dispositivos, setDispositivos] = React.useState<DispositivoFichaje[]>(mockDispositivos);
    const [isDeviceDialogOpen, setIsDeviceDialogOpen] = React.useState(false);
    const [editingDevice, setEditingDevice] = React.useState<DispositivoFichaje | null>(null);

    const [searchTerm, setSearchTerm] = React.useState('');
    const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = React.useState(false);
    
    // Configuración de widgets (modal Settings)
    type PersonalConfig = { kpis: boolean; equipo: boolean; controlHorario: boolean; ausencias: boolean; incidencias: boolean; fichaje: boolean };
    const [personalConfig, setPersonalConfig] = React.useState<PersonalConfig>({
        kpis: true, equipo: true, controlHorario: true, ausencias: true, incidencias: true, fichaje: true,
    });
    const [configOpen, setConfigOpen] = React.useState(false);
    const handleConfigToggle = (key: keyof PersonalConfig) => setPersonalConfig(prev => ({ ...prev, [key]: !prev[key] }));
    
    // Filtros Control Horario
    const [timeLogFilterStaff, setTimeLogFilterStaff] = React.useState<string>('all');
    const [timeLogFilterAction, setTimeLogFilterAction] = React.useState<string>('all');
    const [editingEmployee, setEditingEmployee] = React.useState<ExtendedStaffMember | null>(null);
    const [isTimeLogOpen, setIsTimeLogOpen] = React.useState(false);
    const [editingTimeLog, setEditingTimeLog] = React.useState<TimeLog | null>(null);
    const [isAbsenceRequestOpen, setIsAbsenceRequestOpen] = React.useState(false);
    const { toast } = useToast();

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
        toast({ title: "Empleado eliminado", description: "El perfil se elimino del equipo." });
    }

    const getStaffMemberStatus = (id: string): StaffStatus => {
        const logs = timeLogs.filter(log => log.staffId === id);
        if (logs.length === 0) return 'inactive';

        const lastLog = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        if (lastLog.action === 'clock-in') return 'active';
        if (lastLog.action === 'start-break') return 'break';
        return 'inactive';
    }

    const handleManualTimeLog = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const staffId = formData.get('staffId') as string;
        const type = formData.get('type') as 'clock-in' | 'clock-out' | 'start-break' | 'end-break';
        const time = formData.get('time') as string; // HH:mm
        const date = new Date().toISOString().split('T')[0]; // Current date for simplicity in this mock

        const newLog: TimeLog = {
            id: `log-${Date.now()}`,
            staffId,
            timestamp: `${date}T${time}:00`,
            action: type,
            method: 'manual'
        };

        setTimeLogs(prev => [...prev, newLog]);
        setIsTimeLogOpen(false);
        toast({ title: "Fichaje registrado", description: "El registro de tiempo se ha guardado correctamente." });
    }
    
    const handleEditTimeLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTimeLog) return;
        const formData = new FormData(e.target as HTMLFormElement);
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const action = formData.get('action') as TimeLog['action'];
        const updatedLog: TimeLog = {
            ...editingTimeLog,
            timestamp: `${date}T${time}:00`,
            action,
        };
        setTimeLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
        setEditingTimeLog(null);
        toast({ title: "Registro actualizado", description: "El fichaje se ha modificado correctamente." });
    }

    const handleAbsenceRequest = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const staffId = formData.get('staffId') as string;
        const type = formData.get('type') as any;
        const startDate = formData.get('startDate') as string;
        const endDate = formData.get('endDate') as string;
        const reason = formData.get('reason') as string;

        const newRequest: AbsenceRequest = {
            id: `abs-${Date.now()}`,
            staffId,
            type,
            startDate,
            endDate,
            reason,
            status: 'pending'
        };

        setAbsenceRequests(prev => [...prev, newRequest]);
        setIsAbsenceRequestOpen(false);
        toast({ title: "Solicitud enviada", description: "La solicitud de ausencia ha sido registrada y está pendiente de aprobación." });
    }

    const updateAbsenceStatus = (id: string, status: 'approved' | 'rejected') => {
        setAbsenceRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
        toast({
            title: status === 'approved' ? "Solicitud aprobada" : "Solicitud rechazada",
            description: `La solicitud ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'}.`
        });
    }
    
    // Handlers para incidencias (Fase 6)
    const handleIncidenciaAction = (id: string, nuevoEstado: EstadoIncidencia) => {
        setIncidencias(prev => prev.map(inc => inc.id === id ? { ...inc, estado: nuevoEstado } : inc));
        toast({
            title: nuevoEstado === 'aprobada' ? "Incidencia aprobada" : "Incidencia rechazada",
            description: `La incidencia ha sido ${estadoIncidenciaLabels[nuevoEstado].toLowerCase()}.`
        });
    }
    
    // Handlers para dispositivos (Fase 5)
    const handleSaveDevice = (device: DispositivoFichaje) => {
        const isEditing = dispositivos.some(d => d.id === device.id);
        if (isEditing) {
            setDispositivos(prev => prev.map(d => d.id === device.id ? device : d));
            toast({ title: "Dispositivo actualizado", description: `${device.nombre} se ha actualizado.` });
        } else {
            setDispositivos(prev => [...prev, { ...device, id: `dev-${Date.now()}` }]);
            toast({ title: "Dispositivo añadido", description: `${device.nombre} se agregó a la lista.` });
        }
        setIsDeviceDialogOpen(false);
        setEditingDevice(null);
    }
    
    const handleDeleteDevice = (id: string) => {
        setDispositivos(prev => prev.filter(d => d.id !== id));
        toast({ title: "Dispositivo eliminado", description: "El dispositivo ha sido eliminado." });
    }

    const filteredStaff = staffMembers.filter(staff =>
        staff.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.rol || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats calculations
    const stats = React.useMemo(() => {
        const activos = staffMembers.filter(s => s.estado === 'Activo').length;
        const trabajandoAhora = staffMembers.filter(s => getStaffMemberStatus(s.id) === 'active').length;
        const enDescanso = staffMembers.filter(s => getStaffMemberStatus(s.id) === 'break').length;
        
        // Use a fixed date reference to avoid hydration mismatch
        const todayStr = '2024-07-12'; // Mock stable date
        const horasHoy = timeLogs.filter(l => l.timestamp.split('T')[0] === todayStr).length * 2;
        
        return { total: staffMembers.length, activos, trabajandoAhora, enDescanso, horasHoy };
    }, [staffMembers, timeLogs]);

    return (
        <div className="flex flex-1 flex-col h-full">
            {/* Header expandido con botón Settings */}
            <PageHeader
                title="Gestión de Personal"
                actions={
                    <Button variant="outline" size="icon" onClick={() => setConfigOpen(true)}>
                        <Settings className="h-4 w-4" />
                    </Button>
                }
            />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-2 md:gap-6 md:p-6 md:pt-3">
                {/* KPIs - Design System: sin iconos */}
                {personalConfig.kpis && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card className="border-none shadow-none rounded-lg p-4 bg-muted/30">
                        <CardContent className="p-0">
                            <p className="text-sm font-medium text-muted-foreground">Total Empleados</p>
                            <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-none rounded-lg p-4 bg-muted/30">
                        <CardContent className="p-0">
                            <p className="text-sm font-medium text-muted-foreground">Activos</p>
                            <p className="text-2xl font-bold text-primary mt-1">{stats.activos}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-none rounded-lg p-4 bg-muted/30 col-span-2 sm:col-span-1">
                        <CardContent className="p-0">
                            <p className="text-sm font-medium text-muted-foreground">Trabajando Ahora</p>
                            <p className="text-2xl font-bold text-primary mt-1">{stats.trabajandoAhora}</p>
                            <Badge variant="completed" className="text-xs mt-1">En línea</Badge>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-none rounded-lg p-4 bg-muted/30">
                        <CardContent className="p-0">
                            <p className="text-sm font-medium text-muted-foreground">En Descanso</p>
                            <p className="text-2xl font-bold text-primary mt-1">{stats.enDescanso}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-none rounded-lg p-4 bg-muted/30">
                        <CardContent className="p-0">
                            <p className="text-sm font-medium text-muted-foreground">Horas Hoy</p>
                            <p className="text-2xl font-bold text-primary mt-1">{stats.horasHoy}h</p>
                        </CardContent>
                    </Card>
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
                            <Dialog open={isTimeLogOpen} onOpenChange={setIsTimeLogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Clock className="mr-2 h-4 w-4" />Fichaje Manual
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle icon={Clock}>Registrar Fichaje Manual</DialogTitle>
                                        <DialogDescription>Añadir un registro de tiempo manualmente.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleManualTimeLog} className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="staffId">Empleado</Label>
                                            <Select name="staffId" required>
                                                <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                                                <SelectContent>
                                                    {staffMembers.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Tipo de registro</Label>
                                            <Select name="type" required>
                                                <SelectTrigger><SelectValue placeholder="Seleccionar acción" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="clock-in">Entrada</SelectItem>
                                                    <SelectItem value="start-break">Iniciar Pausa</SelectItem>
                                                    <SelectItem value="end-break">Fin Pausa</SelectItem>
                                                    <SelectItem value="clock-out">Salida</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="time">Hora</Label>
                                            <Input id="time" name="time" type="time" required />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit">Guardar Registro</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>

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
                            
                            {/* Grid con StaffCardPro (Fase 8) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredStaff.length === 0 && staffMembers.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                        <p className="text-muted-foreground mb-4">No hay empleados en el equipo.</p>
                                        <CreateActionCard label="Añadir primer empleado" onClick={() => handleOpenEmployeeDialog()} />
                                    </div>
                                ) : filteredStaff.length === 0 ? (
                                    <div className="col-span-full py-16 text-center text-muted-foreground">
                                        No se encontraron empleados con ese criterio de búsqueda.
                                    </div>
                                ) : null}
                                {filteredStaff.map(staff => {
                                    const status = getStaffMemberStatus(staff.id);
                                    return (
                                        <StaffCardPro
                                            key={staff.id}
                                            staff={{
                                                id: staff.id,
                                                nombre: staff.nombre,
                                                email: staff.email,
                                                telefono: staff.telefono,
                                                rol: staff.rol,
                                                estado: staff.estado,
                                                horasContratadas: staff.horasContratadas,
                                                horasTrabajadas: Math.floor(((staff.nombre.length * 7) % 100) / 100 * staff.horasContratadas), // Deterministic mock value
                                                metodos_fichaje_permitidos: staff.metodos_fichaje_permitidos,
                                            }}
                                            status={status as StaffStatus}
                                            onEdit={() => handleOpenEmployeeDialog(staff)}
                                            onDelete={() => handleRemoveStaff(staff.id)}
                                            onWhatsApp={() => window.open(`https://wa.me/${staff.telefono?.replace(/\D/g, '')}`, '_blank')}
                                        />
                                    );
                                })}
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
                                        <CardTitle>Registro de Actividad Reciente</CardTitle>
                                        <CardDescription>Últimos fichajes y movimientos del personal.</CardDescription>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Select value={timeLogFilterStaff} onValueChange={setTimeLogFilterStaff}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Todos los empleados" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los empleados</SelectItem>
                                                {staffMembers.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select value={timeLogFilterAction} onValueChange={setTimeLogFilterAction}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Todas las acciones" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las acciones</SelectItem>
                                                <SelectItem value="clock-in">Entrada</SelectItem>
                                                <SelectItem value="clock-out">Salida</SelectItem>
                                                <SelectItem value="start-break">Inicio Pausa</SelectItem>
                                                <SelectItem value="end-break">Fin Pausa</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                                <TableHead>Acción</TableHead>
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
                                                        <TableCell className="hidden sm:table-cell">{`${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`}</TableCell>
                                                        <TableCell>{`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {log.action === 'clock-in' ? 'Entrada' :
                                                                    log.action === 'clock-out' ? 'Salida' :
                                                                        log.action === 'start-break' ? 'Inicio Pausa' : 'Fin Pausa'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs capitalize">{log.method}</TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTimeLog(log)} aria-label="Editar registro">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                            {timeLogs.filter(log => timeLogFilterStaff === 'all' || log.staffId === timeLogFilterStaff).filter(log => timeLogFilterAction === 'all' || log.action === timeLogFilterAction).length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                        No hay registros con los filtros seleccionados.
                                                    </TableCell>
                                                </TableRow>
                                            )}
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
                                    <CardTitle>Solicitudes de Ausencia</CardTitle>
                                    <CardDescription>Gestiona vacaciones y bajas del personal.</CardDescription>
                                </div>
                                <Dialog open={isAbsenceRequestOpen} onOpenChange={setIsAbsenceRequestOpen}>
                                    <DialogTrigger asChild>
                                        <Button><Calendar className="mr-2 h-4 w-4" />Nueva Solicitud</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle icon={Calendar}>Registrar Solicitud de Ausencia</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleAbsenceRequest} className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="staffId">Empleado</Label>
                                                <Select name="staffId" required>
                                                    <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                                                    <SelectContent>
                                                        {staffMembers.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="type">Tipo de Ausencia</Label>
                                                <Select name="type" required>
                                                    <SelectTrigger><SelectValue placeholder="Seleccionar motivo" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="vacation">Vacaciones</SelectItem>
                                                        <SelectItem value="sick_leave">Baja Médica</SelectItem>
                                                        <SelectItem value="personal_days">Asuntos Propios</SelectItem>
                                                        <SelectItem value="other">Otro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="startDate">Desde</Label>
                                                    <Input name="startDate" type="date" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="endDate">Hasta</Label>
                                                    <Input name="endDate" type="date" required />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="reason">Motivo Detallado</Label>
                                                <Input name="reason" placeholder="Opcional" />
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit">Enviar Solicitud</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Empleado</TableHead>
                                                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                                                <TableHead>Fechas</TableHead>
                                                <TableHead>Estado</TableHead>
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
                                                        <TableCell>
                                                            <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                                                                {req.status === 'approved' ? 'Aprobado' : req.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {req.status === 'pending' && (
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateAbsenceStatus(req.id, 'approved')}>
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateAbsenceStatus(req.id, 'rejected')}>
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                            {absenceRequests.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No hay solicitudes pendientes.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                        )}
                    </TabsContent>
                    
                    {/* Tab Incidencias (Fase 6) */}
                    <TabsContent value="incidencias">
                        {personalConfig.incidencias && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Incidencias de Fichaje</CardTitle>
                                <CardDescription>Gestiona las incidencias reportadas por el sistema o los empleados.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Empleado</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Fecha/Hora</TableHead>
                                                <TableHead className="hidden md:table-cell">Motivo</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {incidencias.map(inc => {
                                                const staff = staffMembers.find(s => s.id === inc.staffId);
                                                return (
                                                    <TableRow key={inc.id}>
                                                        <TableCell className="font-medium">{staff?.nombre || 'Desconocido'}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {tipoIncidenciaLabels[inc.tipo]}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-xs sm:text-sm">{inc.fecha} {inc.hora}</TableCell>
                                                        <TableCell className="hidden md:table-cell max-w-[200px] truncate">{inc.motivo || '-'}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={inc.estado === 'aprobada' ? 'default' : inc.estado === 'rechazada' ? 'destructive' : 'secondary'}>
                                                                {estadoIncidenciaLabels[inc.estado]}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {inc.estado === 'pendiente' && (
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleIncidenciaAction(inc.id, 'aprobada')}>
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleIncidenciaAction(inc.id, 'rechazada')}>
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {incidencias.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No hay incidencias registradas.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                        )}
                    </TabsContent>
                    
                    {/* Nuevo Tab: Métodos de Fichaje - Inspirado en Sesame HR */}
                    <TabsContent value="fichaje" className="space-y-6">
                        {personalConfig.fichaje && (
                        <>
                        {/* Métodos de Fichaje Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {metodosFichaje.map((metodo) => {
                                const Icon = metodo.icon;
                                const isWhatsApp = metodo.id === 'whatsapp';
                                return (
                                    <Card key={metodo.id} className={cn(
                                        "cursor-pointer hover:shadow-md transition-all group",
                                        isWhatsApp && "border-brand-whatsapp/30"
                                    )}>
                                        <CardContent className="p-6 text-center">
                                            <div className={cn(
                                                "mx-auto h-14 w-14 rounded-full flex items-center justify-center mb-4 transition-colors",
                                                isWhatsApp ? "bg-brand-whatsapp/10 text-brand-whatsapp group-hover:bg-brand-whatsapp/20" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                                            )}>
                                                <Icon className="h-7 w-7" />
                                            </div>
                                            <h3 className="font-semibold mb-1">{metodo.label}</h3>
                                            <p className="text-sm text-muted-foreground">{metodo.description}</p>
                                            {isWhatsApp && (
                                                <Badge variant="outline" className="mt-3 text-brand-whatsapp border-brand-whatsapp/30">
                                                    Recomendado
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        
                        {/* Configuración WhatsApp Fichaje */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-brand-whatsapp" />
                                            Fichaje por WhatsApp
                                        </CardTitle>
                                        <CardDescription>
                                            Permite que los empleados fichen enviando un mensaje al bot de WhatsApp.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="default">Activo</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Instrucciones */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Cómo funciona</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">1</div>
                                                <div>
                                                    <p className="font-medium text-sm">Enviar mensaje</p>
                                                    <p className="text-xs text-muted-foreground">El empleado escribe &quot;Fichar&quot; al número del bot</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">2</div>
                                                <div>
                                                    <p className="font-medium text-sm">Seleccionar acción</p>
                                                    <p className="text-xs text-muted-foreground">Entrada, Salida, Inicio Pausa o Fin Pausa</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">3</div>
                                                <div>
                                                    <p className="font-medium text-sm">Confirmación</p>
                                                    <p className="text-xs text-muted-foreground">Recibe confirmación instantánea del registro</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Comandos disponibles */}
                                        <div className="p-4 border rounded-lg">
                                            <h5 className="text-sm font-medium mb-2">Comandos disponibles</h5>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <code className="px-2 py-1 bg-muted rounded">Fichar</code>
                                                <code className="px-2 py-1 bg-muted rounded">Entrada</code>
                                                <code className="px-2 py-1 bg-muted rounded">Salida</code>
                                                <code className="px-2 py-1 bg-muted rounded">Pausa</code>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* QR para añadir el número */}
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
                                            <Download className="mr-2 h-4 w-4" />
                                            Descargar QR
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Gestión de Dispositivos (Fase 5) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Dispositivos de Fichaje</CardTitle>
                                    <CardDescription>Gestiona tablets y terminales para el fichaje del personal.</CardDescription>
                                </div>
                                <Button onClick={() => { setEditingDevice(null); setIsDeviceDialogOpen(true); }}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Añadir Dispositivo
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
                                                            device.estado === 'offline' ? "bg-red-100 text-red-600" :
                                                            "bg-yellow-100 text-yellow-600"
                                                        )}>
                                                            {device.tipo === 'tablet' ? <Tablet className="h-5 w-5" /> :
                                                             device.tipo === 'terminal' ? <Monitor className="h-5 w-5" /> :
                                                             <Smartphone className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{device.nombre}</p>
                                                            <p className="text-xs text-muted-foreground">{device.ubicacion || 'Sin ubicación'}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant={device.estado === 'online' ? 'default' : device.estado === 'offline' ? 'destructive' : 'secondary'} className="gap-1">
                                                        {device.estado === 'online' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                                        {estadoDispositivoLabels[device.estado]}
                                                    </Badge>
                                                </div>
                                                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                                                    <div className="flex justify-between">
                                                        <span>Intervalo QR:</span>
                                                        <span>{device.intervalo_qr}s</span>
                                                    </div>
                                                    <div className="flex justify-between mt-1">
                                                        <span>Modo offline:</span>
                                                        <span>{device.modo_offline ? 'Sí' : 'No'}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex gap-2">
                                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingDevice(device); setIsDeviceDialogOpen(true); }}>
                                                        Configurar
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleDeleteDevice(device.id)}>
                                                        <X className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {dispositivos.length === 0 && (
                                        <div className="col-span-full text-center py-8 text-muted-foreground">
                                            No hay dispositivos configurados.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Estadísticas de Fichajes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen de Fichajes por Método</CardTitle>
                                <CardDescription>Distribución de fichajes en los últimos 30 días</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>WhatsApp</span>
                                            <span className="font-medium">45%</span>
                                        </div>
                                        <Progress value={45} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>App Móvil</span>
                                            <span className="font-medium">30%</span>
                                        </div>
                                        <Progress value={30} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>QR Code</span>
                                            <span className="font-medium">15%</span>
                                        </div>
                                        <Progress value={15} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Panel Web</span>
                                            <span className="font-medium">10%</span>
                                        </div>
                                        <Progress value={10} className="h-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        </>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            <EmployeeDialog
                open={isEmployeeDialogOpen}
                onOpenChange={setIsEmployeeDialogOpen}
                employeeToEdit={editingEmployee}
                onSave={handleSaveEmployee}
            />
            
            {/* Modal Editar Registro de Fichaje */}
            <Dialog open={!!editingTimeLog} onOpenChange={(open) => !open && setEditingTimeLog(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle icon={Edit}>Editar Registro de Fichaje</DialogTitle>
                        <DialogDescription>Modifica la fecha, hora o acción del registro.</DialogDescription>
                    </DialogHeader>
                    {editingTimeLog && (
                        <form onSubmit={handleEditTimeLog} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Empleado</Label>
                                <Input 
                                    value={staffMembers.find(s => s.id === editingTimeLog.staffId)?.nombre || 'Desconocido'} 
                                    disabled 
                                    className="bg-muted"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-date">Fecha</Label>
                                    <Input 
                                        id="edit-date" 
                                        name="date" 
                                        type="date" 
                                        defaultValue={editingTimeLog.timestamp.split('T')[0]}
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-time">Hora</Label>
                                    <Input 
                                        id="edit-time" 
                                        name="time" 
                                        type="time" 
                                        defaultValue={editingTimeLog.timestamp.split('T')[1]?.slice(0, 5) || '09:00'}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-action">Acción</Label>
                                <Select name="action" defaultValue={editingTimeLog.action} required>
                                    <SelectTrigger id="edit-action"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="clock-in">Entrada</SelectItem>
                                        <SelectItem value="start-break">Iniciar Pausa</SelectItem>
                                        <SelectItem value="end-break">Fin Pausa</SelectItem>
                                        <SelectItem value="clock-out">Salida</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingTimeLog(null)}>Cancelar</Button>
                                <Button type="submit">Guardar Cambios</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
            
            {/* Modal Configurar Vista Personal */}
            <Dialog open={configOpen} onOpenChange={setConfigOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle icon={Settings}>
                            Configurar Vista de Personal
                        </DialogTitle>
                        <DialogDescription>
                            Activa o desactiva las secciones que quieres ver en esta página.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>KPIs</Label>
                                <p className="text-xs text-muted-foreground">Total empleados, activos, trabajando, etc.</p>
                            </div>
                            <Switch checked={personalConfig.kpis} onCheckedChange={() => handleConfigToggle('kpis')} />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Equipo</Label>
                                <p className="text-xs text-muted-foreground">Tarjetas de miembros del equipo</p>
                            </div>
                            <Switch checked={personalConfig.equipo} onCheckedChange={() => handleConfigToggle('equipo')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Control Horario</Label>
                                <p className="text-xs text-muted-foreground">Registro de actividad reciente</p>
                            </div>
                            <Switch checked={personalConfig.controlHorario} onCheckedChange={() => handleConfigToggle('controlHorario')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Ausencias</Label>
                                <p className="text-xs text-muted-foreground">Solicitudes de vacaciones y bajas</p>
                            </div>
                            <Switch checked={personalConfig.ausencias} onCheckedChange={() => handleConfigToggle('ausencias')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Incidencias</Label>
                                <p className="text-xs text-muted-foreground">Incidencias de fichaje</p>
                            </div>
                            <Switch checked={personalConfig.incidencias} onCheckedChange={() => handleConfigToggle('incidencias')} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Métodos Fichaje</Label>
                                <p className="text-xs text-muted-foreground">Configuración de dispositivos y métodos</p>
                            </div>
                            <Switch checked={personalConfig.fichaje} onCheckedChange={() => handleConfigToggle('fichaje')} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfigOpen(false)}>Cerrar</Button>
                        <Button onClick={() => { toast({ title: 'Configuración guardada', description: 'Los cambios se han aplicado.' }); setConfigOpen(false); }}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Modal de Dispositivos (Fase 5) */}
            <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle icon={Tablet}>{editingDevice ? 'Editar' : 'Añadir'} Dispositivo</DialogTitle>
                        <DialogDescription>Configura los parámetros del dispositivo de fichaje.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target as HTMLFormElement);
                        handleSaveDevice({
                            id: editingDevice?.id || '',
                            nombre: formData.get('nombre') as string,
                            tipo: formData.get('tipo') as 'tablet' | 'terminal' | 'movil',
                            ubicacion: formData.get('ubicacion') as string,
                            intervalo_qr: parseInt(formData.get('intervalo_qr') as string) || 30,
                            modo_offline: formData.get('modo_offline') === 'on',
                            estado: editingDevice?.estado || 'offline',
                        });
                    }} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre del dispositivo</Label>
                            <Input id="nombre" name="nombre" defaultValue={editingDevice?.nombre || ''} placeholder="Ej: Tablet Entrada" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo de dispositivo</Label>
                            <Select name="tipo" defaultValue={editingDevice?.tipo || 'tablet'}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tablet">Tablet</SelectItem>
                                    <SelectItem value="terminal">Terminal fijo</SelectItem>
                                    <SelectItem value="movil">Móvil</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ubicacion">Ubicación</Label>
                            <Input id="ubicacion" name="ubicacion" defaultValue={editingDevice?.ubicacion || ''} placeholder="Ej: Recepción" />
                        </div>
                        <div className="space-y-2">
                            <Label>Intervalo de regeneración QR: {editingDevice?.intervalo_qr || 30}s</Label>
                            <input type="hidden" name="intervalo_qr" value={editingDevice?.intervalo_qr || 30} />
                            <Slider
                                defaultValue={[editingDevice?.intervalo_qr || 30]}
                                min={15}
                                max={120}
                                step={5}
                                onValueChange={(v) => {
                                    const input = document.querySelector('input[name="intervalo_qr"]') as HTMLInputElement;
                                    if (input) input.value = v[0].toString();
                                }}
                            />
                            <p className="text-xs text-muted-foreground">15s (más seguro) - 120s (menos tráfico)</p>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <Label>Modo Offline</Label>
                                <p className="text-xs text-muted-foreground">Permitir fichajes sin conexión</p>
                            </div>
                            <Checkbox name="modo_offline" defaultChecked={editingDevice?.modo_offline ?? true} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDeviceDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
