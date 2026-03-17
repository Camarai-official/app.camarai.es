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
    SmilePlus,
    QrCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Convex imports
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

// UI Components
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { H3, H5, H6, TextXS } from '@/components/ui/typography';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/ui/search-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Layout Components
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';

// Feature Components
import { StaffCard, type StaffStatus } from '@/components/ui/personal-card';
import { CreateActionCard } from '@/components/widgets/create-action-card';
import { ActionTile } from '@/components/ui/action-tile';

// Type imports
import type { TimeLog } from '@/types/staff';
import type { DispositivoFichaje } from '@/types/fichaje';

// Dialog Components
import { EmployeeDialog, type ExtendedStaffMember } from '@/components/dialogs/personal-edit-dialog';
import { TimeLogDialog } from '@/components/dialogs/personal-fichaje-dialog';
import { AbsenceRequestDialog } from '@/components/dialogs/personal-solicitudausencia-dialog';
import { DeviceDialog } from '@/components/dialogs/device-dialog';
import { PersonalConfigDialog, type PersonalConfig } from '@/components/dialogs/personal-config-dialog';

// Mock data temporal (hasta tener datos reales) - ELIMINADO
// import {
//     mockIncidencias,
//     mockDispositivos,
//     tipoIncidenciaLabels,
//     estadoIncidenciaLabels,
//     estadoDispositivoLabels,
//     type IncidenciaFichaje,
//     type DispositivoFichaje,
//     type EstadoIncidencia 
// } from '@/types/fichaje';

// Tipos para compatibilidad con Convex
type IncidenciaFichaje = {
    id: string;
    staffId: string;
    tipo: string;
    fecha: string;
    hora: string;
    motivo: string;
    estado: string;
    created_at: number;
};

type EstadoIncidencia = 'pendiente' | 'aprobada' | 'rechazada';

// Constantes para etiquetas (antes de mock data)
const tipoIncidenciaLabels: Record<string, string> = {
    'no_clock_out': 'Sin Fichar Salida',
    'duplicate': 'Duplicado',
    'late_clock_in': 'Llegada Tarde',
    'suspicious': 'Sospechoso'
};

const estadoIncidenciaLabels: Record<string, string> = {
    'pendiente': 'Pendiente',
    'aprobada': 'Aprobada',
    'rechazada': 'Rechazada',
    'open': 'Abierta',
    'justified': 'Justificada',
    'rejected': 'Rechazada'
};

// Tipos para compatibilidad
type AbsenceRequest = {
    id: string;
    staffId: string;
    type: 'vacation' | 'sick_leave' | 'personal_days' | 'other';
    startDate: string;
    endDate: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
};

// Métodos de fichaje disponibles
const metodosFichaje = [
    { id: 'app', label: 'App Móvil', icon: Smartphone, description: 'Fichaje desde la app' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, description: 'Envía "Fichar" al bot' },
    { id: 'qr', label: 'Código QR', icon: QrCode, description: 'Escanea el QR del local' },
    { id: 'web', label: 'Panel Web', icon: User, description: 'Desde el ordenador' },
];

export default function PersonalPage() {
    const { toast } = useToast();
    
    // ID del establecimiento - TODO: Obtener del contexto de autenticación o parámetros de ruta
    const establishmentId = "p9757g9mvgsf8vw4qzcse7whv5832xnf" as any;
    
    // Datos de Convex
    const staffMembersData = useQuery(api.staff.getStaffByEstablishment, { establishmentId });
    const timeLogsData = useQuery(api.staff.getTimeLogsByEstablishment, { establishmentId, limit: 50 });
    const absenceRequestsData = useQuery(api.staff.getAbsenceRequestsByEstablishment, { establishmentId });
    
    // Mutations de Convex
    const createStaffMember = useMutation(api.staff.createStaffMember);
    const updateStaffMember = useMutation(api.staff.updateStaffMember);
    const deleteStaffMember = useMutation(api.staff.deleteStaffMember);
    
    // Mutations para Time Logs
    const createTimeLog = useMutation(api.staff.createTimeLog);
    const updateTimeLog = useMutation(api.staff.updateTimeLog);
    const deleteTimeLog = useMutation(api.staff.deleteTimeLog);
    
    // Mutations para Ausencias
    const createAbsenceRequest = useMutation(api.staff.createAbsenceRequest);
    const updateAbsenceRequestStatus = useMutation(api.staff.updateAbsenceRequestStatus);
    
    // Queries para Incidencias y Dispositivos
    const clockIncidentsData = useQuery(api.staff.getClockIncidentsByEstablishment, { establishmentId });
    const clockDevicesData = useQuery(api.staff.getClockDevicesByEstablishment, { establishmentId });
    
    // Mutations para Incidencias y Dispositivos
    const createClockIncident = useMutation(api.staff.createClockIncident);
    const updateClockIncidentStatus = useMutation(api.staff.updateClockIncidentStatus);
    const createClockDevice = useMutation(api.staff.createClockDevice);
    const updateClockDevice = useMutation(api.staff.updateClockDevice);
    const deleteClockDevice = useMutation(api.staff.deleteClockDevice);
    
    // Convertir datos de Convex al formato esperado por el componente
    const timeLogs = React.useMemo(() => {
        if (!timeLogsData) return [];
        return timeLogsData.map(log => ({
            id: log.id,
            staffId: log.staffId,
            timestamp: log.timestamp,
            action: log.action.replace('_', '-') as any, // Mapeo: clock_in -> clock-in
            method: log.method,
        }));
    }, [timeLogsData]);

    // Calcular horas trabajadas esta semana para un empleado
    const getWeeklyHours = (staffId: string): number => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo como primer día
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado como último día
        endOfWeek.setHours(23, 59, 59, 999);

        // Obtener logs del empleado esta semana
        const staffLogs = timeLogs
            .filter(log => log.staffId === staffId)
            .filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate >= startOfWeek && logDate <= endOfWeek;
            })
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        let totalHours = 0;
        let clockInTime: Date | null = null;
        let breakStartTime: Date | null = null;

        for (const log of staffLogs) {
            const logTime = new Date(log.timestamp);
            
            if (log.action === 'clock-in') {
                clockInTime = logTime;
                breakStartTime = null;
            } else if (log.action === 'clock-out' && clockInTime) {
                // Calcular horas trabajadas (excluyendo pausas)
                let workEndTime = logTime;
                let workStartTime = clockInTime;
                
                // Si hubo una pausa, calcular solo el tiempo trabajado
                if (breakStartTime) {
                    // Tiempo antes de la pausa
                    totalHours += (breakStartTime.getTime() - workStartTime.getTime()) / (1000 * 60 * 60);
                    // Tiempo después de la pausa (simulamos que clock-out es después de break-end)
                    // En un sistema real, necesitaríamos un log de break-end
                    workStartTime = breakStartTime; // Simplificación
                }
                
                totalHours += (workEndTime.getTime() - workStartTime.getTime()) / (1000 * 60 * 60);
                clockInTime = null;
                breakStartTime = null;
            } else if (log.action === 'break' && clockInTime) {
                breakStartTime = logTime;
            }
        }

        // Si todavía está trabajando (sin clock-out), contar hasta ahora
        if (clockInTime) {
            totalHours += (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
        }

        return Math.round(totalHours * 10) / 10; // Redondear a 1 decimal
    };
    
    const staffMembers = React.useMemo(() => {
        if (!staffMembersData) return [];
        return staffMembersData.map(member => ({
            // Campos principales de la UI
            id: member.id,
            nombre: member.nombre,
            email: member.email,
            rol: member.rol,
            estado: member.estado as "Activo" | "Inactivo" | "Vacaciones" | "Baja",
            pin: member.pin,
            telefono: member.telefono,
            fotoUrl: member.fotoUrl,
            horasContratadas: member.horasContratadas,
            salarioPorHora: member.salarioPorHora,
            fecha_contratacion: member.fecha_contratacion,
            
            // Campos adicionales del schema Convex
            last_name: member.last_name,
            auth_id: member.auth_id,
            contract_type: member.contract_type,
            // Map Convex contract_type back to form values
            tipo_contrato: (() => {
                const reverseMapping: Record<string, string> = {
                    "indefinite": "indefinido",
                    "temporary": "temporal",
                    "practices": "practicas",
                    "freelance": "autonomo"
                };
                return reverseMapping[member.contract_type] || "indefinido";
            })(),
            contract_end: member.contract_end,
            salary: member.salary,
            iban: member.iban,
            irpf: member.irpf,
            ss_number: member.ss_number,
            break_duration_minutes: member.break_duration_minutes,
            max_late_minutes: member.max_late_minutes,
            dashboard_sections: member.dashboard_sections,
            clock_methods: member.clock_methods,
            documents: member.documents,
            notes: member.notes,
            departamento: member.departamento, // ¡CAMPO FALTANTE!
            created_at: member.created_at,
            
            // Campos de acceso para compatibilidad con ExtendedStaffMember
            roles: [member.rol],
            nivelAcceso: (() => {
                // Check if permissions match predefined patterns or are custom
                const permissions = member.dashboard_sections || [];
                const jefePermisos = ['pos', 'kds', 'reportes', 'reportes_completos', 'inventario', 'personal', 'configuracion', 'integraciones', 'cierre_caja', 'descuentos', 'anular_comandas', 'editar_comandas', 'whatsapp_config'];
                const encargadoPermisos = ['pos', 'kds', 'reportes', 'inventario', 'personal', 'cierre_caja', 'descuentos', 'anular_comandas', 'editar_comandas'];
                const camareroPermisos = ['pos', 'kds', 'cierre_caja'];
                
                // More flexible detection: check if permissions contain all required items for a level
                const isJefe = jefePermisos.every(p => permissions.includes(p));
                const isEncargado = encargadoPermisos.every(p => permissions.includes(p)) && !isJefe;
                const isCamarero = camareroPermisos.every(p => permissions.includes(p)) && !isEncargado && !isJefe;
                
                // If permissions exactly match any predefined set, use that level, otherwise use custom
                if (isJefe && permissions.length === jefePermisos.length) {
                    return 'jefe' as const;
                } else if (isEncargado && permissions.length === encargadoPermisos.length) {
                    return "encargado" as const;
                } else if (isCamarero && permissions.length === camareroPermisos.length) {
                    return 'camarero' as const;
                } else {
                    return 'personalizado' as const; // Custom permissions (different count or extra permissions)
                }
            })(),
            // Use the actual saved permissions from dashboard_sections, not predefined ones
            permisos: member.dashboard_sections || [],
            metodos_fichaje_permitidos: (member.clock_methods || ['app', 'qr']) as ('app' | 'whatsapp' | 'qr' | 'web')[],
            // Calcular horas trabajadas esta semana
            horasTrabajadas: (() => getWeeklyHours(member.id))(),
        }));
    }, [staffMembersData, timeLogs]);
    
    const absenceRequests = React.useMemo(() => {
        if (!absenceRequestsData) return [];
        return absenceRequestsData.map(req => ({
            id: req.id,
            staffId: req.staffId,
            type: req.type,
            startDate: req.startDate,
            endDate: req.endDate,
            reason: req.reason,
            status: req.status,
        }));
    }, [absenceRequestsData]);
    
    // Core State - Solo datos reales de Convex
    const [incidencias, setIncidencias] = React.useState<IncidenciaFichaje[]>([]);
    const [dispositivos, setDispositivos] = React.useState<DispositivoFichaje[]>([]);
    
    // Cargar datos reales de Convex
    React.useEffect(() => {
        if (clockIncidentsData) {
            // Mapear tipos de Convex a tipos de UI con type assertion
            const mappedIncidencias = clockIncidentsData.map(inc => ({
                ...inc,
                tipo: inc.tipo as any, // Forzar tipo para compatibilidad
                estado: inc.estado as any, // Forzar estado para compatibilidad
            })) as IncidenciaFichaje[];
            setIncidencias(mappedIncidencias);
        }
    }, [clockIncidentsData]);
    
    React.useEffect(() => {
        if (clockDevicesData) {
            // Mapear tipos de Convex a tipos de UI con type assertion
            const mappedDispositivos = clockDevicesData.map(dev => ({
                id: dev.id,
                nombre: dev.nombre,
                tipo: dev.tipo as any, // Forzar tipo para compatibilidad
                ubicacion: dev.ubicacion || '',
                intervalo_qr: (dev as any).intervalo_qr || 30, // Usar valor de Convex o por defecto
                modo_offline: (dev as any).modo_offline ?? true, // Usar valor de Convex o por defecto
                estado: dev.estado,
                ultimo_heartbeat: dev.last_seen ? new Date(dev.last_seen).toISOString() : undefined,
                establecimiento_id: establishmentId,
            })) as DispositivoFichaje[];
            setDispositivos(mappedDispositivos);
        }
    }, [clockDevicesData]);
    
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
        if (lastLog.action === 'break-start') return 'break';
        if (lastLog.action === 'break-end') return 'active'; // Después de pausa, está trabajando
        return 'inactive';
    };

    // Funciones de exportación
    const exportTimeLogs = () => {
        const csvContent = [
            ['Empleado', 'Fecha', 'Hora', 'Accion', 'Metodo'],
            ...timeLogs
                .filter(log => timeLogFilterStaff === 'all' || log.staffId === timeLogFilterStaff)
                .filter(log => timeLogFilterAction === 'all' || 
                    (timeLogFilterAction === 'break-start' && (log.action === 'break-start' || log.action === 'break-end')) ||
                    log.action === timeLogFilterAction)
                .map(log => {
                    const staff = staffMembers.find(s => s.id === log.staffId);
                    const date = new Date(log.timestamp);
                    return [
                        staff?.nombre || 'Desconocido',
                        date.toLocaleDateString(),
                        date.toLocaleTimeString(),
                        log.action.replace('-', ' '),
                        log.method
                    ];
                })
        ].map(row => row.join(',')).join('\n');

        // Añadir BOM UTF-8 para compatibilidad con Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `time_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportAbsenceRequests = () => {
        const csvContent = [
            ['Empleado', 'Tipo', 'Fecha Inicio', 'Fecha Fin', 'Dias', 'Motivo', 'Estado'],
            ...absenceRequests.map(req => {
                const staff = staffMembers.find(s => s.id === req.staffId);
                return [
                    staff?.nombre || 'Desconocido',
                    req.type,
                    req.startDate,
                    req.endDate,
                    Math.ceil((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
                    req.reason || '',
                    req.status
                ];
            })
        ].map(row => row.join(',')).join('\n');

        // Añadir BOM UTF-8 para compatibilidad con Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `absence_requests_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleOpenEmployeeDialog = (employee?: ExtendedStaffMember) => {
        if (employee) {
            // Mapear datos de Convex al formato que espera el diálogo
            const mappedEmployee = {
                ...employee,
                // Asegurar que los campos financieros estén correctamente formateados
                salarioPorHora: employee.salarioPorHora || 12, // Ya viene formateado de Convex
                horasContratadas: employee.horasContratadas || 40, // Ya viene formateado de Convex
                // Campos que podrían faltar
                permisos: employee.permisos || [],
                documentos: employee.documentos || [],
                establecimientos_asignados: employee.establecimientos_asignados || [],
                // Usar el valor exacto de Convex para el departamento
                departamento: employee.departamento,
                // Mapeo inverso de roles (Convex usa inglés, diálogo usa español)
                rol: employee.rol === 'waiter' ? 'camarero' : 
                     employee.rol === 'cook' ? 'cocinero' : 
                     employee.rol === 'host' ? 'anfitrión' : 
                     employee.rol === 'owner' ? 'dueño' : 
                     employee.rol === 'manager' ? 'gerente' : employee.rol,
            };
            setEditingEmployee(mappedEmployee);
        } else {
            setEditingEmployee(null);
        }
        setIsEmployeeDialogOpen(true);
    };

    const handleSaveEmployee = async (employee: ExtendedStaffMember) => {
        try {
            // Mapear roles del formulario al schema de Convex
            const roleMapping: Record<string, string> = {
                "camarero": "waiter",
                "cocinero": "cook", 
                "bartender": "bartender",
                "anfitrión": "host",
                "dueño": "owner",
                "admin": "admin",
                "gerente": "manager"
            };

            // Mapear tipos de contrato del formulario al schema de Convex
            const contractTypeMapping: Record<string, string> = {
                "indefinido": "indefinite",
                "temporal": "temporary", 
                "practicas": "practices",
                "autonomo": "freelance"
            };

            // Determinar si es una edición o creación
            const isEditing = employee.id && staffMembersData?.some(s => s.id === employee.id);
            
            const staffData = {
                name: employee.nombre,
                role: (roleMapping[employee.rol] || employee.rol) as any,
                email: employee.email,
                phone: employee.telefono,
                pin: employee.pin,
                photo_url: employee.fotoUrl,
                contract_type: (contractTypeMapping[employee.tipo_contrato] || "indefinite") as any,
                // Para edición: usar valores existentes, para creación: usar valores nuevos
                contract_start: isEditing ? (employee.fecha_contratacion ? new Date(employee.fecha_contratacion).getTime() : Date.now()) : Date.now(),
                salary: Math.round((employee.salarioPorHora || 12) * 40 * 100), // Convertir a cents/mes
                hourly_rate: Math.round((employee.salarioPorHora || 12) * 100), // Convertir a cents
                contracted_hours: employee.horasContratadas || 40,
                irpf: isEditing ? (employee.irpf || 0) : 0,
                status: (employee.estado === "Activo" ? "active" : employee.estado === "Inactivo" ? "inactive" : employee.estado === "Vacaciones" ? "on_leave" : employee.estado === "Baja" ? "sick_leave" : "active") as any,
                // Access data from the access section
                clock_methods: employee.metodos_fichaje_permitidos || ["app", "qr"], // Use selected clock methods
                // Save the actual permissions directly without restrictive mapping
                dashboard_sections: employee.permisos || [],
                departamento: employee.departamento || "", // Campo departamento
            };

            if (isEditing) {
                // Update existing staff member
                await updateStaffMember({ staffId: employee.id as any, ...staffData });
                toast({ title: "Empleado actualizado", description: `${employee.nombre} se ha actualizado.` });
            } else {
                // Create new staff member
                await createStaffMember({ establishmentId, ...staffData });
                toast({ title: "Empleado añadido", description: `${employee.nombre} se agregó al equipo.` });
            }
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "No se pudo guardar el empleado. Inténtalo de nuevo.",
                variant: "destructive"
            });
            throw error; // Re-throw para que el dialog maneje el error
        }
    };

    const handleRemoveStaff = async (id: string) => {
        try {
            await deleteStaffMember({ staffId: id as any });
            toast({ title: "Empleado eliminado", description: "El perfil se eliminó del equipo." });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "No se pudo eliminar el empleado.",
                variant: "destructive"
            });
        }
    };

    // Handlers: Time Logs
    const handleOpenTimeLogDialog = (timeLog?: TimeLog) => {
        if (timeLog) {
            setEditingTimeLog(timeLog);
        } else {
            setEditingTimeLog(null);
        }
        setIsTimeLogDialogOpen(true);
    };

    const handleSaveOrUpdateTimeLog = async (data: any) => {
        try {
            // Mapear tipos del diálogo al schema de Convex
            const actionMapping: Record<string, string> = {
                "clock-in": "clock_in",
                "clock-out": "clock_out", 
                "start-break": "break_start",
                "end-break": "break_end"
            };
            
            const isEditing = !!editingTimeLog;
            
            if (isEditing) {
                // Actualizar Time Log existente
                const timestamp = new Date(`${data.date}T${data.time}`).getTime();
                await updateTimeLog({
                    logId: editingTimeLog.id as any,
                    action: (actionMapping[data.type] || data.type) as any,
                    method: "manual" as const,
                    timestamp: timestamp,
                    modified_by: undefined, // TODO: Obtener ID del usuario actual
                });
                toast({ title: "Fichaje actualizado", description: "El registro se ha modificado correctamente." });
            } else {
                // Crear nuevo Time Log - Convex genera timestamp automáticamente
                const timeLogData = {
                    establishmentId,
                    staffId: data.staffId,
                    action: (actionMapping[data.type] || data.type) as any,
                    method: "manual" as const,
                    // NOTA: Convex genera timestamp automáticamente, no se envía
                };
                await createTimeLog(timeLogData);
                toast({ title: "Fichaje registrado", description: "El registro de tiempo se ha guardado correctamente." });
            }
            
            setIsTimeLogDialogOpen(false);
        } catch (error) {
            toast({ 
                title: "Error", 
                description: `No se pudo ${editingTimeLog ? 'actualizar' : 'registrar'} el fichaje.`,
                variant: "destructive"
            });
        }
    };

    const handleDeleteTimeLog = async (logId: string) => {
        try {
            await deleteTimeLog({ logId: logId as any });
            toast({ title: "Fichaje eliminado", description: "El registro se ha eliminado correctamente." });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "No se pudo eliminar el fichaje.",
                variant: "destructive"
            });
        }
    };

    // Handlers: Absences
    const handleSaveAbsenceRequest = async (data: any) => {
        try {
            const absenceData = {
                establishmentId,
                staffId: data.staffId,
                type: data.type as any,
                startDate: data.startDate,
                endDate: data.endDate,
                total_days: Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
                reason: data.reason,
            };

            await createAbsenceRequest(absenceData);
            toast({ title: "Solicitud enviada", description: "La solicitud de ausencia ha sido registrada y está pendiente de aprobación." });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "No se pudo enviar la solicitud.",
                variant: "destructive"
            });
        }
    };

    const updateAbsenceStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateAbsenceRequestStatus({ 
                requestId: id as any, 
                status, 
                reviewed_by: (staffMembersData?.[0]?.id as any) || "system" // Use first staff member or system as fallback
            });
            toast({
                title: status === 'approved' ? "Solicitud aprobada" : "Solicitud rechazada",
                description: `La solicitud ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'}.`
            });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "No se pudo actualizar el estado de la solicitud.",
                variant: "destructive"
            });
        }
    };

    // Handlers: Incidencias
    const handleIncidenciaAction = async (id: string, nuevoEstado: EstadoIncidencia) => {
        try {
            await updateClockIncidentStatus({ 
                incidentId: id as any, 
                status: nuevoEstado as any 
            });
            toast({
                title: nuevoEstado === 'aprobada' ? "Incidencia aprobada" : "Incidencia rechazada",
                description: `La incidencia ha sido ${estadoIncidenciaLabels[nuevoEstado].toLowerCase()}.`
            });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "No se pudo actualizar el estado de la incidencia.",
                variant: "destructive"
            });
        }
    };

    // Handlers: Devices
    const handleSaveDevice = async (device: DispositivoFichaje) => {
        try {
            const isEditing = dispositivos.some(d => d.id === device.id);
            if (isEditing) {
                await updateClockDevice({
                    deviceId: device.id as any,
                    name: device.nombre,
                    type: device.tipo as any,
                    location: device.ubicacion,
                    status: device.estado as any,
                });
                toast({ title: "Dispositivo actualizado", description: `${device.nombre} se ha actualizado.` });
            } else {
                await createClockDevice({
                    establishmentId,
                    name: device.nombre,
                    type: device.tipo as any,
                    location: device.ubicacion,
                });
                toast({ title: "Dispositivo añadido", description: `${device.nombre} se agregó a la lista.` });
            }
            setEditingDevice(null);
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "No se pudo guardar el dispositivo.",
                variant: "destructive"
            });
        }
    };

    const handleDeleteDevice = async (id: string) => {
        try {
            await deleteClockDevice({ deviceId: id as any });
            toast({ title: "Dispositivo eliminado", description: "El dispositivo ha sido eliminado." });
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "No se pudo eliminar el dispositivo.",
                variant: "destructive"
            });
        }
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
        const todayStr = new Date().toISOString().split('T')[0]; // Current date
        const horasHoy = (() => {
            // Calcular horas reales trabajadas hoy por todos los empleados
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            let totalHours = 0;
            
            // Agrupar logs por empleado
            const logsByEmployee = timeLogs.reduce((acc, log) => {
                const logDate = new Date(log.timestamp);
                if (logDate >= today && logDate < tomorrow) {
                    if (!acc[log.staffId]) acc[log.staffId] = [];
                    acc[log.staffId].push(log);
                }
                return acc;
            }, {} as Record<string, typeof timeLogs>);
            
            // Calcular horas por empleado
            Object.values(logsByEmployee).forEach(employeeLogs => {
                const sortedLogs = employeeLogs.sort((a, b) => 
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                );
                
                let clockInTime: Date | null = null;
                let breakStartTime: Date | null = null;
                
                for (const log of sortedLogs) {
                    const logTime = new Date(log.timestamp);
                    
                    if (log.action === 'clock-in') {
                        clockInTime = logTime;
                        breakStartTime = null;
                    } else if (log.action === 'clock-out' && clockInTime) {
                        // Calcular horas trabajadas (excluyendo pausas)
                        let workEndTime = logTime;
                        let workStartTime = clockInTime;
                        
                        if (breakStartTime) {
                            totalHours += (breakStartTime.getTime() - workStartTime.getTime()) / (1000 * 60 * 60);
                            workStartTime = breakStartTime;
                        }
                        
                        totalHours += (workEndTime.getTime() - workStartTime.getTime()) / (1000 * 60 * 60);
                        clockInTime = null;
                        breakStartTime = null;
                    } else if (log.action === 'break-start' && clockInTime) {
                        breakStartTime = logTime;
                    } else if (log.action === 'break-end' && clockInTime) {
                        breakStartTime = null;
                    }
                }
                
                // Si todavía está trabajando, contar hasta ahora
                if (clockInTime) {
                    const now = new Date();
                    totalHours += (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
                }
            });
            
            return Math.round(totalHours * 10) / 10; // Redondear a 1 decimal
        })();
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
                                    Personal
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
                                    iconColor="#3b82f6"
                                />
                                <ActionTile
                                    title={stats.activos.toString()}
                                    description="Activos"
                                    icon={Check}
                                    iconColor="#22c55e"
                                />
                                <ActionTile
                                    title={stats.trabajandoAhora.toString()}
                                    description="Trabajando Ahora"
                                    icon={Activity}
                                    iconColor="#a855f7"
                                />
                                <ActionTile
                                    title={stats.enDescanso.toString()}
                                    description="En Descanso"
                                    icon={Clock}
                                    iconColor="#f59e0b"
                                />
                                <ActionTile
                                    title={`${stats.horasHoy}h`}
                                    description="Horas Hoy"
                                    icon={Zap}
                                    iconColor="#ef4444"
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
                                    Añadir empleado
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

                    <TabsContent value="time-tracking" className="space-y-6">
                        {personalConfig.controlHorario && (
                            <>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                        <Select value={timeLogFilterStaff} onValueChange={setTimeLogFilterStaff}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Empleado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                {staffMembers.map(staff => (
                                                    <SelectItem key={staff.id} value={staff.id}>{staff.nombre}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={timeLogFilterAction} onValueChange={setTimeLogFilterAction}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Acción" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las acciones</SelectItem>
                                                <SelectItem value="clock-in">Entrada</SelectItem>
                                                <SelectItem value="clock-out">Salida</SelectItem>
                                                <SelectItem value="break-start">Descanso</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button 
                                            variant="outline" 
                                            size="md" 
                                            onClick={() => { setEditingTimeLog(null); setIsTimeLogDialogOpen(true); }}
                                            startIcon={<Plus />}
                                        >
                                            Añadir registro manual
                                        </Button>
                                    </div>
                                    
                                    <Button variant="outline" size="md" className="w-full sm:w-auto" startIcon={<Download />} onClick={exportTimeLogs}>
                                        Exportar
                                    </Button>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <H3>Registro de Actividad</H3>
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
                                                        .filter(log => timeLogFilterAction === 'all' || 
                        (timeLogFilterAction === 'break-start' && (log.action === 'break-start' || log.action === 'break-end')) ||
                        log.action === timeLogFilterAction)
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
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="absences" className="space-y-6">
                        {personalConfig.ausencias && (
                            <>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                        <Select value={timeLogFilterStaff} onValueChange={setTimeLogFilterStaff}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Empleado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos</SelectItem>
                                                {staffMembers.map(staff => (
                                                    <SelectItem key={staff.id} value={staff.id}>{staff.nombre}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Button 
                                            variant="default" 
                                            size="md" 
                                            onClick={() => setIsAbsenceRequestDialogOpen(true)}
                                            startIcon={<Plus />}
                                        >
                                            Nueva Solicitud
                                        </Button>
                                    </div>
                                    
                                    <Button variant="outline" size="md" className="w-full sm:w-auto" startIcon={<Download />} onClick={exportAbsenceRequests}>
                                        Exportar
                                    </Button>
                                </div>

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
                                                                            <Button size="sm" variant="ghost-success" onClick={() => updateAbsenceStatus(req.id, 'approved')} startIcon={<Check />} />
                                                                            <Button size="sm" variant="ghost-destructive" onClick={() => updateAbsenceStatus(req.id, 'rejected')} startIcon={<X />} />
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
                            </>
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
                                                    <H5>Escanea el código QR</H5>
                                                    <TextXS className="text-muted-foreground">Comparte este código con tus empleados para que añadan el bot rápidamente.</TextXS>
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
                                                            <H6>{item.title}</H6>
                                                            <TextXS className="text-muted-foreground">{item.desc}</TextXS>
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
                                                { label: 'QR Code', value: 15, icon: QrCode, color: '#78A3ED' },
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
                onSave={handleSaveOrUpdateTimeLog}
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
