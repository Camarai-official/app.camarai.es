'use client';

import * as React from 'react';
import { User, Briefcase, Key, Wallet, FileText, Smartphone, MessageSquare, QrCode, Shield, Building2, Upload, FileDown, Eye, EyeOff, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogClose } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { ImageUploader } from '@/components/ui/image-uploader';
import { H3 } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import type { StaffMember } from '@/data/mock-data';

// Métodos de fichaje disponibles
const metodosFichaje = [
    { id: 'app', label: 'App Móvil', icon: Smartphone, description: 'Fichaje desde la app' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, description: 'Envía "Fichar" al bot' },
    { id: 'qr', label: 'Código QR', icon: QrCode, description: 'Escanea el QR del local' },
    { id: 'web', label: 'Panel Web', icon: User, description: 'Desde el ordenador' },
];

export interface ExtendedStaffMember extends StaffMember {
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
    dispositivo_asignado: undefined 
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

const mockEstablecimientos = [
    { id: 'est-1', nombre: 'Restaurante Principal' },
    { id: 'est-2', nombre: 'Terraza de Verano' },
    { id: 'est-3', nombre: 'Local Centro' },
];

interface EmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeToEdit: ExtendedStaffMember | null;
    onSave: (employee: ExtendedStaffMember) => void;
}

export function EmployeeDialog({
    open,
    onOpenChange,
    employeeToEdit,
    onSave
}: EmployeeDialogProps) {
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
                establecimientos_asignados: employeeToEdit.establecimientos_asignados || [] 
            });
            setNivelAcceso(detectNivelAcceso(employeeToEdit.permisos || []));
        } else {
            setEmployee({
                ...emptyEmployee,
                pin: Math.floor(1000 + Math.random() * 9000).toString() 
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
            roles: employee.rol ? [employee.rol] : [] 
        };
        onSave(employeeToSave);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader
                    icon={User}
                    title={`${employeeToEdit ? 'Editar' : 'Añadir'} Empleado`}
                    description="Configura todos los datos del empleado organizados por secciones."
                />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 bg-muted/20 border-b">
                        <TabsList className="bg-transparent h-12 w-full justify-start gap-4">
                            <TabsTrigger value="datos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1"><User className="h-3 w-3 mr-1" />Datos</TabsTrigger>
                            <TabsTrigger value="laboral" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1"><Briefcase className="h-3 w-3 mr-1" />Laboral</TabsTrigger>
                            <TabsTrigger value="acceso" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1"><Key className="h-3 w-3 mr-1" />Acceso</TabsTrigger>
                            <TabsTrigger value="nomina" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1"><Wallet className="h-3 w-3 mr-1" />Nómina</TabsTrigger>
                            <TabsTrigger value="documentos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-1"><FileText className="h-3 w-3 mr-1" />Docs</TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-6">
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
                                    <H3 className="text-base">PIN de Acceso</H3>
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
                                        <Button variant="ghost" size="md" onClick={() => setShowPin(!showPin)}>
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
                                    <H3 className="text-base">Nivel de Acceso</H3>
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
                                    <H3 className="text-base">Permisos del Sistema</H3>
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
                                    <H3 className="text-base">Establecimientos Asignados</H3>
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
                            
                            <Card>
                                <CardHeader className="pb-2">
                                    <H3 className="text-base">Métodos de Fichaje Permitidos</H3>
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
                                    <H3 className="text-base">Estimación Mensual</H3>
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
                                    <H3 className="text-base">Documentos del Empleado</H3>
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
                        <Button variant="ghost">Cancelar</Button>
                    </DialogClose>
                    <Button variant="default" onClick={handleSave}>Guardar Empleado</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
