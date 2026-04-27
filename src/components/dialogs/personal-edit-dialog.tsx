'use client';

import * as React from 'react';
import { TextSM, TextXS } from "@/components/ui/typography";
import {
    User, Briefcase, Key, Wallet, FileText, Smartphone, MessageSquare, QrCode, Shield,
    Building2, Upload, Eye, EyeOff, Trash, Check, Mail, Phone, Palette,
    ChefHat, Utensils, Wine, Coffee, Music, Heart, Star, Pizza, Beer,
    Zap, Gem, Target, Camera, Smile, Monitor, ScreenShare, BarChart, PieChart, Package,
    Users, Settings, Percent, Trash2, Edit, Lock, Crown, UserCircle, Clock, CalendarIcon, Plus
} from 'lucide-react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageUploader } from '@/components/ui/image-uploader';
import { ActionTile } from '@/components/ui/action-tile';
import { ColorPicker } from '@/components/ui/color-picker';
import { IconPicker, iconMap } from '@/components/ui/icon-picker';
import { AccessSection } from '@/components/personal/access-section';
import { cn } from '@/lib/utils';
import { OperatingHoursEditor } from '@/components/ui/operating-hours-editor';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { StaffMember } from '@/types/staff';
import { mockEstablishments } from '@/data/mock-data';

// Métodos de fichaje disponibles
const metodosFichaje: Array<{id: 'app' | 'whatsapp' | 'qr' | 'web', label: string, icon: React.ElementType, description: string}> = [
    { id: 'app', label: 'App Móvil', icon: Smartphone, description: 'Fichaje desde la app' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, description: 'Envía "Fichar" al bot' },
    { id: 'qr', label: 'Código QR', icon: QrCode, description: 'Escanea el QR del local' },
    { id: 'web', label: 'Panel Web', icon: User, description: 'Desde el ordenador' },
];

export interface ExtendedStaffMember extends StaffMember {
    departamento?: string;
    tipo_contrato?: string;
    fecha_alta?: string;
    nivelAcceso?: 'camarero' | 'encargado' | 'jefe' | 'personalizado';
    permisos?: string[];
    establecimientos_asignados?: string[];
    horas_extra_habilitadas?: boolean;
    documents?: StaffDocument[];
    // Campos para fichaje
    metodos_fichaje_permitidos?: ('app' | 'whatsapp' | 'qr' | 'web')[];
    dispositivo_asignado?: string;
    // Identidad visual
    color?: string;
    icon?: string;
    // Campos financieros adicionales
    irpf?: number;
    // Horario laboral
    working_hours?: string;
}

interface StaffDocument {
    title: string;
    url: string;
    type: string;
    uploadDate: number;
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
    nivelAcceso: 'camarero',
    permisos: [], // Start with empty permissions for true customization
    establecimientos_asignados: [],
    horas_extra_habilitadas: false,
    documents: [],
    metodos_fichaje_permitidos: [], // Start with empty for true customization
    dispositivo_asignado: undefined,
    color: 'blue-500',
    icon: 'User',
    irpf: 0,
    working_hours: '',
};

const permisosDisponibles = [
    { id: 'pos', label: 'Acceso a POS', icon: Monitor, description: 'Ventas y cobros habituales.' },
    { id: 'kds', label: 'Acceso a KDS', icon: ScreenShare, description: 'Visualización de comandas en cocina.' },
    { id: 'reportes', label: 'Ver Reportes', icon: BarChart, description: 'Estadísticas de ventas diarias.' },
    { id: 'reportes_completos', label: 'Reportes Completos', icon: PieChart, description: 'Auditorías y cierres avanzados.' },
    { id: 'inventario', label: 'Gestionar Inventario', icon: Package, description: 'Control de stock y proveedores.' },
    { id: 'personal', label: 'Gestionar Personal', icon: Users, description: 'Gestión de horarios y empleados.' },
    { id: 'configuracion', label: 'Configuración del Sistema', icon: Settings, description: 'Ajustes globales del local.' },
    { id: 'integraciones', label: 'Gestionar Integraciones', icon: Zap, description: 'Conexión con servicios externos.' },
    { id: 'cierre_caja', label: 'Cierre de Caja', icon: Lock, description: 'Habilidad para cerrar el turno.' },
    { id: 'descuentos', label: 'Aplicar Descuentos', icon: Percent, description: 'Rebajas y cortesías en tickets.' },
    { id: 'anular_comandas', label: 'Anular Comandas', icon: Trash2, description: 'Eliminar comandas registradas.' },
    { id: 'editar_comandas', label: 'Editar Comandas de Otros', icon: Edit, description: 'Modificar tickets de terceros.' },
    { id: 'whatsapp_config', label: 'Configurar WhatsApp', icon: MessageSquare, description: 'Ajustes del bot de WhatsApp.' },
];

type NivelAcceso = 'camarero' | 'encargado' | 'jefe' | 'personalizado';

const nivelesAcceso: { id: NivelAcceso; label: string; description: string; permisos: string[]; icon: React.ElementType }[] = [
    {
        id: 'camarero',
        label: 'Camarero',
        description: 'Acceso básico: POS, KDS, comandas propias',
        permisos: ['pos', 'kds', 'cierre_caja'],
        icon: Utensils
    },
    {
        id: 'encargado',
        label: 'Encargado',
        description: 'Todo lo de camarero + funciones de gestión',
        permisos: ['pos', 'kds', 'reportes', 'inventario', 'personal', 'cierre_caja', 'descuentos', 'anular_comandas', 'editar_comandas'],
        icon: Shield
    },
    {
        id: 'jefe',
        label: 'Jefe / Admin',
        description: 'Acceso total a todas las funciones',
        permisos: permisosDisponibles.map(p => p.id),
        icon: Crown
    },
    {
        id: 'personalizado',
        label: 'Personalizado',
        description: 'Selecciona permisos manualmente',
        permisos: [],
        icon: Palette
    },
];

const mockEstablecimientos = [
    { id: 'est-1', nombre: 'Restaurante Principal' },
    { id: 'est-2', nombre: 'Terraza de Verano' },
    { id: 'est-3', nombre: 'Local Centro' },
];

const availableColors = ['violet-500', 'rose-500', 'amber-500', 'green-500', 'blue-500'];

interface EmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeToEdit: ExtendedStaffMember | null;
    onSave: (employee: ExtendedStaffMember) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    establishmentId?: string;
}

export function EmployeeDialog({
    open,
    onOpenChange,
    employeeToEdit,
    onSave,
    onDelete,
    establishmentId
}: EmployeeDialogProps): React.ReactElement {

    const { toast } = useToast();
    const [employee, setEmployee] = React.useState<ExtendedStaffMember>(emptyEmployee);
    const [activeTab, setActiveTab] = React.useState('datos');
    const [showPin, setShowPin] = React.useState(false);
    const [nivelAcceso, setNivelAcceso] = React.useState<NivelAcceso>('camarero');
    const [isSaving, setIsSaving] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [newDocTitle, setNewDocTitle] = React.useState('');
    const [newDocFile, setNewDocFile] = React.useState<File | null>(null);
    const docInputRef = React.useRef<HTMLInputElement>(null);

    // Detectar nivel de acceso basado en permisos existentes
    const detectNivelAcceso = (permisos: string[]): NivelAcceso => {
        const jefePermisos = nivelesAcceso.find(n => n.id === 'jefe')!.permisos;
        const encargadoPermisos = nivelesAcceso.find(n => n.id === 'encargado')!.permisos;
        const camareroPermisos = nivelesAcceso.find(n => n.id === 'camarero')!.permisos;

        if (jefePermisos.every(p => permisos.includes(p))) return 'jefe';
        if (encargadoPermisos.every(p => permisos.includes(p))) return 'encargado';
        if (camareroPermisos.every(p => permisos.includes(p))) return 'camarero';
        return 'personalizado';
    };

    React.useEffect(() => {
        if (employeeToEdit) {
            setEmployee({
                ...emptyEmployee,
                ...employeeToEdit,
                permisos: employeeToEdit.permisos || [],
                documents: employeeToEdit.documents || [],
                establecimientos_asignados: employeeToEdit.establecimientos_asignados || []
            });
            // Use the nivelAcceso that was already calculated in page.tsx
            setNivelAcceso(employeeToEdit.nivelAcceso || 'camarero');
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
        // Map access level to Convex role
        const roleMapping: Record<NivelAcceso, string> = {
            'camarero': 'camarero',
            'encargado': 'gerente',
            'jefe': 'admin',
            'personalizado': 'camarero' // Default for custom
        };

        // Define clock methods for each access level
        const clockMethodsByLevel: Record<NivelAcceso, ('app' | 'whatsapp' | 'qr' | 'web')[]> = {
            'camarero': ['app', 'qr'], // Basic methods
            'encargado': ['app', 'qr', 'web'], // + web access
            'jefe': ['app', 'whatsapp', 'qr', 'web'], // All methods
            'personalizado': ['app', 'qr'] // Default for custom
        };

        // Update the employee role and permissions when access level changes
        if (nivel !== 'personalizado') {
            const nivelConfig = nivelesAcceso.find(n => n.id === nivel);
            if (nivelConfig) {
                setEmployee(prev => ({
                    ...prev,
                    rol: roleMapping[nivel],
                    permisos: [...nivelConfig.permisos],
                    metodos_fichaje_permitidos: clockMethodsByLevel[nivel]
                }));
            }
        } else {
            // For personalizado, only update the role, keep existing permissions and methods
            setEmployee(prev => ({
                ...prev,
                rol: roleMapping[nivel]
                // Don't override permissions or clock methods for custom level
            }));
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

    const handleToggleMetodoFichaje = (metodoId: 'app' | 'whatsapp' | 'qr' | 'web') => {
        setEmployee(prev => ({
            ...prev,
            metodos_fichaje_permitidos: prev.metodos_fichaje_permitidos?.includes(metodoId)
                ? prev.metodos_fichaje_permitidos.filter(m => m !== metodoId)
                : [...(prev.metodos_fichaje_permitidos || []), metodoId]
        }));
    };

    const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Limit file size to 750KB (Convex has 1MB limit, base64 adds ~33% overhead)
            const maxSize = 750 * 1024; // 750KB in bytes
            if (file.size > maxSize) {
                toast({
                    title: "Archivo demasiado grande",
                    description: "El documento no puede superar 750KB",
                    variant: "destructive"
                });
                if (docInputRef.current) {
                    docInputRef.current.value = '';
                }
                return;
            }
            setNewDocFile(file);
            if (!newDocTitle.trim()) {
                setNewDocTitle(file.name.split('.')[0]);
            }
        }
    };

    const handleAddDocument = () => {
        if (!newDocFile || !newDocTitle.trim()) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const newDoc: StaffDocument = {
                title: newDocTitle.trim(),
                url: e.target?.result as string,
                type: newDocFile.type,
                uploadDate: Date.now(),
            };
            setEmployee(prev => ({
                ...prev,
                documents: [...(prev.documents || []), newDoc]
            }));
            setNewDocTitle('');
            setNewDocFile(null);
            if (docInputRef.current) {
                docInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(newDocFile);
    };

    const handleRemoveDocument = (index: number) => {
        setEmployee(prev => ({
            ...prev,
            documents: prev.documents?.filter((_, i) => i !== index) || []
        }));
    };

    const handleViewDocument = (doc: StaffDocument) => {
        try {
            // Convert Base64 to Blob
            const byteCharacters = atob(doc.url.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: doc.type });
            
            // Create object URL and open in new window
            const url = URL.createObjectURL(blob);
            const newWindow = window.open(url, '_blank');
            
            // Clean up object URL after window opens
            if (newWindow) {
                newWindow.onload = () => {
                    URL.revokeObjectURL(url);
                };
            } else {
                // If popup blocked, try to download instead
                const link = document.createElement('a');
                link.href = url;
                link.download = `${doc.title}.${doc.type.split('/')[1]}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Error viewing document:', error);
            // Fallback: try opening the Base64 URL directly
            window.open(doc.url, '_blank');
        }
    };

    const handleSave = async () => {
        if (!employee.nombre || !employee.email || !employee.rol) {
            return;
        }

        setIsSaving(true);
        try {
            const employeeToSave = {
                ...employee,
                id: employee.id || `staff-${Date.now()}`,
                fotoUrl: employee.fotoUrl,
                roles: employee.rol ? [employee.rol] : []
            };

            await onSave(employeeToSave);
            onOpenChange(false);
        } catch (error) {
            console.error('Error saving employee:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogWindow size="xl">
                <DialogHeader
                    icon={User}
                    title={employeeToEdit ? 'Editar Perfil de Empleado' : 'Añadir Empleado'}
                    description="Gestiona la información personal, laboral y permisos de acceso al sistema."
                />

                <DialogContent className="p-0 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0">
                            <TabsList className="w-full">
                                <TabsTrigger value="datos" icon={User}>Datos</TabsTrigger>
                                <TabsTrigger value="laboral" icon={Briefcase}>Laboral</TabsTrigger>
                                <TabsTrigger value="acceso" icon={Key}>Acceso</TabsTrigger>
                                <TabsTrigger value="nomina" icon={Wallet}>Nómina</TabsTrigger>
                                <TabsTrigger value="documentos" icon={FileText}>Docs</TabsTrigger>
                                <TabsTrigger value="horario" icon={Clock}>Horario</TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 w-full">
                            <div className="py-4 px-2 sm:p-6">
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
                                                <Label htmlFor="nombre">Nombre Completo</Label>
                                                <Input
                                                    id="nombre"
                                                    value={employee.nombre}
                                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                                    placeholder="Ej. Juan Pérez García"
                                                    className="h-11 rounded-xl bg-muted/5 focus-visible:ring-primary/20"
                                                />
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">Email de Contacto</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={employee.email}
                                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                                        placeholder="juan@camarai.com"
                                                        className="h-11 rounded-xl bg-muted/5 focus-visible:ring-primary/20"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="telefono">Teléfono</Label>
                                                    <Input
                                                        id="telefono"
                                                        value={employee.telefono}
                                                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                                                        placeholder="+34 600 000 000"
                                                        className="h-11 rounded-xl bg-muted/5 focus-visible:ring-primary/20"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Palette className="h-4 w-4" />
                                                Identidad Visual
                                            </CardTitle>
                                            <CardDescription>Personaliza cómo se verá este perfil en la aplicación.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-3">
                                            <ActionTile
                                                icon={Palette}
                                                title="Color de Identidad"
                                                description="Se usará para el perfil y reportes."
                                                rightContentType="custom"
                                                customContent={
                                                    <ColorPicker
                                                        availableColors={availableColors}
                                                        value={employee.color}
                                                        onChange={(color) => handleInputChange('color', color)}
                                                    />
                                                }
                                            />

                                            <ActionTile
                                                icon={iconMap[employee.icon || 'User']}
                                                iconColor={employee.color}
                                                title="Icono de Representación"
                                                description="Icono personalizado del empleado."
                                                rightContentType="custom"
                                                customContent={
                                                    <IconPicker
                                                        value={employee.icon}
                                                        onChange={(icon) => handleInputChange('icon', icon)}
                                                        className="w-48"
                                                    />
                                                }
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB: LABORAL */}
                                <TabsContent value="laboral" className="mt-0 space-y-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                Configuración Laboral
                                            </CardTitle>
                                            <CardDescription>Detalles sobre el puesto y situación del empleado.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-3">
                                            <ActionTile
                                                icon={Briefcase}
                                                title="Puesto / Rol"
                                                description="Cargo principal dentro del equipo."
                                                rightContentType="select"
                                                selectValue={employee.rol}
                                                onSelectChange={(v) => handleInputChange('rol', v)}
                                                variant="none"
                                                padding="none"
                                                selectOptions={[
                                                    { value: 'admin', label: 'Administrador/a' },
                                                    { value: 'camarero', label: 'Camarero/a' },
                                                    { value: 'cocinero', label: 'Cocinero/a' },
                                                    { value: 'bartender', label: 'Bartender' },
                                                    { value: 'gerente', label: 'Gerente' },
                                                    { value: 'anfitrión', label: 'Host' },
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
                                                variant="none"
                                                padding="none"
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
                                                variant="none"
                                                padding="none"
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
                                                variant="none"
                                                padding="none"
                                                selectOptions={[
                                                    { value: 'Activo', label: 'Activo' },
                                                    { value: 'Inactivo', label: 'Inactivo' },
                                                    { value: 'Vacaciones', label: 'Vacaciones' },
                                                    { value: 'Baja', label: 'Baja' },
                                                ]}
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB: ACCESO */}
                                <TabsContent value="acceso" className="mt-0 space-y-6">
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <Key className="h-4 w-4" />
                                                    Seguridad
                                                </CardTitle>
                                                <CardDescription>Configura las credenciales de acceso físico al terminal.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ActionTile
                                                    icon={Key}
                                                    title="PIN de Acceso"
                                                    description="Código de seguridad de 4 dígitos."
                                                    rightContentType="custom"
                                                    padding="none"
                                                    variant="none"
                                                    customContent={
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type={showPin ? 'text' : 'password'}
                                                                value={employee.pin}
                                                                onChange={(e) => handleInputChange('pin', e.target.value.slice(0, 4))}
                                                                className="w-24 text-center font-mono font-bold h-10 rounded-xl"
                                                                maxLength={4}
                                                            />
                                                            <Button variant="ghost" size="sm" onClick={() => setShowPin(!showPin)} className="h-10 w-10 p-0 rounded-xl">
                                                                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    }
                                                />
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
                                                        <ActionTile
                                                            key={nivel.id}
                                                            icon={nivel.icon}
                                                            title={nivel.label}
                                                            description={nivel.description}
                                                            onClick={() => handleNivelAccesoChange(nivel.id)}
                                                            variant={nivelAcceso === nivel.id ? 'accent' : 'outline'}
                                                            className={cn(
                                                                "transition-all",
                                                                nivelAcceso === nivel.id && "border-primary ring-1 ring-primary/20"
                                                            )}
                                                            rightContentType="custom"
                                                            customContent={
                                                                <div className={cn(
                                                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                                    nivelAcceso === nivel.id
                                                                        ? "border-primary bg-primary"
                                                                        : "border-muted-foreground/30"
                                                                )}>
                                                                    {nivelAcceso === nivel.id && <Check className="h-3 w-3 text-white" />}
                                                                </div>
                                                            }
                                                        />
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
                                                        <ActionTile
                                                            key={permiso.id}
                                                            icon={permiso.icon}
                                                            title={permiso.label}
                                                            description={permiso.description}
                                                            rightContentType="switch"
                                                            switchId={`permiso-${permiso.id}`}
                                                            switchChecked={employee.permisos?.includes(permiso.id) || false}
                                                            onSwitchChange={() => {
                                                                if (nivelAcceso !== 'personalizado') {
                                                                    setNivelAcceso('personalizado');
                                                                }
                                                                handleTogglePermiso(permiso.id);
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <Building2 className="h-4 w-4" />
                                                    Métodos de Fichaje Permitidos
                                                </CardTitle>
                                                <CardDescription>Selecciona los canales habilitados para el registro de jornada.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {metodosFichaje.map(metodo => (
                                                        <ActionTile
                                                            key={metodo.id}
                                                            switchId={`metodo-${metodo.id}`}
                                                            icon={metodo.icon}
                                                            title={metodo.label}
                                                            description={metodo.description}
                                                            rightContentType="switch"
                                                            switchChecked={employee.metodos_fichaje_permitidos?.includes(metodo.id)}
                                                            onSwitchChange={() => handleToggleMetodoFichaje(metodo.id as 'app' | 'whatsapp' | 'qr' | 'web')}
                                                        />
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                {/* TAB: NOMINA */}
                                <TabsContent value="nomina" className="mt-0 space-y-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Wallet className="h-4 w-4" />
                                                Configuración Salarial
                                            </CardTitle>
                                            <CardDescription>Detalles económicos y de jornada contratada.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-4">
                                            <ActionTile
                                                icon={Wallet}
                                                title="Salario por Hora (€)"
                                                description="Base para cálculo de nómina."
                                                rightContentType="custom"
                                                variant="none"
                                                padding="none"
                                                customContent={
                                                    <Input
                                                        type="number"
                                                        className="w-24 text-right h-10 rounded-xl"
                                                        value={employee.salarioPorHora || ''}
                                                        onChange={(e) => handleInputChange('salarioPorHora', parseFloat(e.target.value) || 0)}
                                                    />
                                                }
                                            />
                                            <ActionTile
                                                icon={Smartphone}
                                                title="Horas Contratadas"
                                                description="Carga horaria semanal establecida."
                                                rightContentType="custom"
                                                variant="none"
                                                padding="none"
                                                customContent={
                                                    <Input
                                                        type="number"
                                                        className="w-24 text-right h-10 rounded-xl"
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
                                                variant="none"
                                                padding="none"
                                                switchChecked={employee.horas_extra_habilitadas}
                                                onSwitchChange={(checked) => handleInputChange('horas_extra_habilitadas', checked)}
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* TAB: DOCUMENTOS */}
                                <TabsContent value="documentos" className="mt-0 space-y-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Upload className="h-4 w-4" />
                                                Subir Documentos
                                            </CardTitle>
                                            <CardDescription>Añade DNI, Contratos, Seguros Sociales o Certificados (PDF, JPG).</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Título del documento"
                                                    value={newDocTitle}
                                                    onChange={(e) => setNewDocTitle(e.target.value)}
                                                    className="flex-1"
                                                />
                                                <input
                                                    ref={docInputRef}
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={handleDocFileChange}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => docInputRef.current?.click()}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Seleccionar
                                                </Button>
                                                {newDocFile && (
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddDocument}
                                                        disabled={!newDocTitle.trim()}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Añadir
                                                    </Button>
                                                )}
                                            </div>
                                            {newDocFile && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <FileText className="h-4 w-4" />
                                                    <span>{newDocFile.name}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-2">
                                        {employee.documents && employee.documents.length > 0 ? (
                                            employee.documents.map((doc, index) => (
                                                <ActionTile
                                                    key={index}
                                                    icon={FileText}
                                                    title={doc.title}
                                                    description={`${doc.type} • Subido el ${new Date(doc.uploadDate).toLocaleDateString()}`}
                                                    rightContentType="custom"
                                                    customContent={
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewDocument(doc)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveDocument(index)}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    }
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                No hay documentos subidos
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* TAB: HORARIO */}
                                <TabsContent value="horario" className="mt-0 space-y-4">
                                    <div className="grid gap-6">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Horario de trabajo
                                                </CardTitle>
                                                <CardDescription>Configura una jornada específica si no usas un turno predefinido.</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <OperatingHoursEditor
                                                    value={employee.working_hours || ''}
                                                    onChange={(val) => handleInputChange('working_hours', val)}
                                                />
                                            </CardContent>
                                        </Card>
                                    </div>
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
                                disabled={isDeleting || isSaving}
                                onClick={async () => {
                                    if (window.confirm('¿Deseas eliminar permanentemente a este empleado?')) {
                                        setIsDeleting(true);
                                        try {
                                            await onDelete(employeeToEdit.id);
                                            onOpenChange(false);
                                        } catch (error) {
                                            console.error('Error deleting employee:', error);
                                        } finally {
                                            setIsDeleting(false);
                                        }
                                    }
                                }}
                                startIcon={<Trash />}
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving || isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleSave}
                            disabled={!employee.nombre || !employee.email || !employee.rol || isSaving || isDeleting}
                        >
                            {isSaving ? 'Guardando...' : (employeeToEdit ? 'Guardar Cambios' : 'Añadir Empleado')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogWindow>
        </Dialog>
    );
}
