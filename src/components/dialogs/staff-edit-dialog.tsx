'use client';

import * as React from 'react';
import { User, Briefcase, Key, Wallet, FileText, Smartphone, MessageSquare, QrCode, Shield, Building2, Upload, Eye, EyeOff, Trash, Check } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageUploader } from '@/components/ui/image-uploader';
import { ActionTile } from '@/components/ui/action-tile';
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
    onDelete?: (id: string) => void;
}

export function EmployeeDialog({
    open,
    onOpenChange,
    employeeToEdit,
    onSave,
    onDelete
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
            <DialogWindow size="lg">
                <DialogHeader
                    icon={User}
                    title={employeeToEdit ? 'Editar Perfil de Empleado' : 'Añadir Nuevo Empleado'}
                    description="Gestiona la información personal, laboral y permisos de acceso al sistema."
                />

                <DialogContent className="p-0 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 border-b bg-muted/10 shrink-0">
                            <TabsList className="h-14 bg-transparent justify-start gap-4">
                                <TabsTrigger value="datos" icon={User}>Datos</TabsTrigger>
                                <TabsTrigger value="laboral" icon={Briefcase}>Laboral</TabsTrigger>
                                <TabsTrigger value="acceso" icon={Key}>Acceso</TabsTrigger>
                                <TabsTrigger value="nomina" icon={Wallet}>Nómina</TabsTrigger>
                                <TabsTrigger value="documentos" icon={FileText}>Docs</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 w-full">
                            <div className="p-6">
                                {/* TAB: DATOS PERSONALES */}
                                <TabsContent value="datos" className="mt-0 space-y-6">
                                    <div className="flex flex-col sm:flex-row items-stretch gap-6">
                                        <div className="shrink-0">
                                            <ImageUploader
                                                value={employee.fotoUrl}
                                                onChange={(url) => handleInputChange('fotoUrl', url)}
                                                className="w-44 h-full"
                                            />
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col justify-between gap-4 py-1">
                                            <div className="grid gap-2">
                                                <Label htmlFor="nombre" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Nombre Completo</Label>
                                                <Input 
                                                    id="nombre" 
                                                    value={employee.nombre} 
                                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                                    placeholder="Ej. Juan Pérez García"
                                                    className="h-11 rounded-xl bg-muted/5"
                                                />
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email de Contacto</Label>
                                                    <Input 
                                                        id="email" 
                                                        type="email"
                                                        value={employee.email} 
                                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                                        placeholder="juan@camarai.com"
                                                        className="h-11 rounded-xl bg-muted/5"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="telefono" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Teléfono</Label>
                                                    <Input 
                                                        id="telefono" 
                                                        value={employee.telefono} 
                                                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                                                        placeholder="+34 600 000 000"
                                                        className="h-11 rounded-xl bg-muted/5"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* TAB: LABORAL */}
                                <TabsContent value="laboral" className="mt-0 space-y-4">
                                    <ActionTile
                                        icon={Briefcase}
                                        title="Puesto / Rol"
                                        description="Cargo principal dentro del equipo."
                                        rightContentType="select"
                                        selectValue={employee.rol}
                                        onSelectChange={(v) => handleInputChange('rol', v)}
                                        selectOptions={[
                                            { value: 'camarero', label: 'Camarero/a' },
                                            { value: 'cocinero', label: 'Cocinero/a' },
                                            { value: 'bartender', label: 'Bartender' },
                                            { value: 'gerente', label: 'Gerente' },
                                            { value: 'host', label: 'Host' },
                                            { value: 'ayudante_cocina', label: 'Ayudante de Cocina' },
                                        ]}
                                    />
                                    <ActionTile
                                        icon={Building2}
                                        title="Departamento"
                                        description="Área de trabajo asignada."
                                        rightContentType="select"
                                        selectValue={employee.departamento || ''}
                                        onSelectChange={(v) => handleInputChange('departamento', v)}
                                        selectOptions={[
                                            { value: 'sala', label: 'Sala' },
                                            { value: 'cocina', label: 'Cocina' },
                                            { value: 'barra', label: 'Barra' },
                                            { value: 'administracion', label: 'Administración' },
                                        ]}
                                    />
                                    <ActionTile
                                        icon={FileText}
                                        title="Tipo de Contrato"
                                        description="Modalidad de contratación legal."
                                        rightContentType="select"
                                        selectValue={employee.tipo_contrato || ''}
                                        onSelectChange={(v) => handleInputChange('tipo_contrato', v)}
                                        selectOptions={[
                                            { value: 'indefinido', label: 'Indefinido' },
                                            { value: 'temporal', label: 'Temporal' },
                                            { value: 'practicas', label: 'Prácticas' },
                                            { value: 'autonomo', label: 'Autónomo' },
                                        ]}
                                    />
                                    <ActionTile
                                        icon={Shield}
                                        title="Estado del Empleado"
                                        description="Situación laboral actual."
                                        rightContentType="select"
                                        selectValue={employee.estado}
                                        onSelectChange={(v) => handleInputChange('estado', v)}
                                        selectOptions={[
                                            { value: 'Activo', label: 'Activo' },
                                            { value: 'Inactivo', label: 'Inactivo' },
                                            { value: 'Vacaciones', label: 'Vacaciones' },
                                            { value: 'Baja', label: 'Baja' },
                                        ]}
                                    />
                                </TabsContent>

                                {/* TAB: ACCESO */}
                                <TabsContent value="acceso" className="mt-0 space-y-6">
                                    <div className="space-y-4">
                                        <ActionTile
                                            icon={Key}
                                            title="PIN de Acceso"
                                            description="Código de seguridad de 4 dígitos."
                                            rightContentType="custom"
                                            customContent={
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type={showPin ? 'text' : 'password'}
                                                        value={employee.pin}
                                                        onChange={(e) => handleInputChange('pin', e.target.value.slice(0, 4))}
                                                        className="w-20 text-center font-mono font-bold"
                                                        maxLength={4}
                                                    />
                                                    <Button variant="ghost" size="sm" onClick={() => setShowPin(!showPin)} className="h-9 w-9 p-0">
                                                        {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            }
                                        />

                                        <ActionTile
                                            icon={Shield}
                                            title="Nivel de Permisos"
                                            description="Plantilla de acceso predefinida."
                                            rightContentType="select"
                                            selectValue={nivelAcceso}
                                            onSelectChange={(v) => handleNivelAccesoChange(v as NivelAcceso)}
                                            selectOptions={nivelesAcceso.map(n => ({ value: n.id, label: n.label }))}
                                        />

                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-muted-foreground ml-1">
                                                <Building2 className="h-3.5 w-3.5" /> Establecimientos Asignados
                                            </Label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {mockEstablecimientos.map(est => (
                                                    <ActionTile
                                                        key={est.id}
                                                        switchId={`est-${est.id}`}
                                                        icon={Building2}
                                                        title={est.nombre}
                                                        description="Habilitar acceso"
                                                        rightContentType="switch"
                                                        switchChecked={employee.establecimientos_asignados?.includes(est.id)}
                                                        onSwitchChange={() => handleToggleEstablecimiento(est.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2 text-muted-foreground ml-1">
                                            <Smartphone className="h-3.5 w-3.5" /> Métodos de Fichaje Permitidos
                                        </Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {metodosFichaje.map(metodo => (
                                                <ActionTile
                                                    key={metodo.id}
                                                    switchId={`metodo-${metodo.id}`}
                                                    icon={metodo.icon}
                                                    title={metodo.label}
                                                    description={metodo.description}
                                                    rightContentType="switch"
                                                    switchChecked={employee.metodos_fichaje_permitidos?.includes(metodo.id as any)}
                                                    onSwitchChange={() => {
                                                        const m = metodo.id as any;
                                                        const current = employee.metodos_fichaje_permitidos || [];
                                                        handleInputChange('metodos_fichaje_permitidos', 
                                                            current.includes(m) ? current.filter(x => x !== m) : [...current, m]
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* TAB: NOMINA */}
                                <TabsContent value="nomina" className="mt-0 space-y-4">
                                    <ActionTile
                                        icon={Wallet}
                                        title="Salario por Hora (€)"
                                        description="Base para cálculo de nómina."
                                        rightContentType="custom"
                                        customContent={
                                            <Input 
                                                type="number" 
                                                className="w-24 text-right" 
                                                value={employee.salarioPorHora}
                                                onChange={(e) => handleInputChange('salarioPorHora', parseFloat(e.target.value))}
                                            />
                                        }
                                    />
                                    <ActionTile
                                        icon={Smartphone}
                                        title="Horas Contratadas"
                                        description="Carga horaria semanal establecida."
                                        rightContentType="custom"
                                        customContent={
                                            <Input 
                                                type="number" 
                                                className="w-24 text-right" 
                                                value={employee.horasContratadas}
                                                onChange={(e) => handleInputChange('horasContratadas', parseFloat(e.target.value))}
                                            />
                                        }
                                    />
                                    <ActionTile
                                        icon={Check}
                                        switchId="horas-extras"
                                        title="Horas Extras"
                                        description="Permitir registro fuera de jornada."
                                        rightContentType="switch"
                                        switchChecked={employee.horas_extra_habilitadas}
                                        onSwitchChange={(checked) => handleInputChange('horas_extra_habilitadas', checked)}
                                    />
                                </TabsContent>

                                {/* TAB: DOCUMENTOS */}
                                <TabsContent value="documentos" className="mt-0 space-y-4">
                                    <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 bg-muted/5">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Upload className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold">Subir Documentos</p>
                                            <p className="text-xs text-muted-foreground max-w-[200px]">DNI, Contratos, Seguros Sociales o Certificados (PDF, JPG).</p>
                                        </div>
                                        <Button size="sm" variant="outline" className="mt-2">Seleccionar Archivos</Button>
                                    </div>
                                    
                                    {employee.documentos && employee.documentos.map(doc => (
                                        <ActionTile
                                            key={doc.id}
                                            icon={FileText}
                                            title={doc.nombre}
                                            description={`${doc.tipo} • Subido el ${doc.fecha_subida}`}
                                            rightContentType="custom"
                                            customContent={<Button variant="ghost" size="sm">Ver</Button>}
                                        />
                                    ))}
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                </DialogContent>

                <DialogFooter>
                    <div className="flex-1 flex items-center justify-start">
                        {employeeToEdit && onDelete && (
                            <Button 
                                variant="ghost-destructive" 
                                size="md" 
                                onClick={() => {
                                    if (window.confirm('¿Deseas eliminar permanentemente a este empleado?')) {
                                        onDelete(employeeToEdit.id);
                                        onOpenChange(false);
                                    }
                                }}
                                startIcon={<Trash />}
                            />
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button 
                            variant="default" 
                            onClick={handleSave}
                            disabled={!employee.nombre || !employee.email || !employee.rol}
                        >
                            {employeeToEdit ? 'Guardar Cambios' : 'Añadir Empleado'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogWindow>
        </Dialog>
    );
}
