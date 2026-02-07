'use client';

import * as React from 'react';
import { Phone, Mail, MoreVertical, Edit, Trash, MessageSquare, Smartphone, QrCode, Globe, Clock, Coffee, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { MetodoFichaje } from '@/types/fichaje';
import { getRoleColors } from '@/lib/role-colors';

// Tipos
export interface StaffCardProData {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    rol?: string;
    fotoUrl?: string;
    estado: 'Activo' | 'Inactivo' | 'Vacaciones' | 'Baja';
    horasContratadas: number;
    horasTrabajadas?: number;
    metodos_fichaje_permitidos?: MetodoFichaje[];
}

export type StaffStatus = 'active' | 'inactive' | 'break';

interface StaffCardProProps {
    staff: StaffCardProData;
    status?: StaffStatus;
    onEdit?: () => void;
    onDelete?: () => void;
    onWhatsApp?: () => void;
    className?: string;
}

// Iconos de métodos de fichaje
const metodoIcons: Record<MetodoFichaje, { icon: React.ElementType; label: string; color: string }> = {
    app: { icon: Smartphone, label: 'App Móvil', color: 'text-blue-500' },
    whatsapp: { icon: MessageSquare, label: 'WhatsApp', color: 'text-brand-whatsapp' },
    qr: { icon: QrCode, label: 'Código QR', color: 'text-purple-500' },
    web: { icon: Globe, label: 'Panel Web', color: 'text-orange-500' },
};

// Status config
const statusConfig: Record<StaffStatus, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: React.ElementType }> = {
    active: { label: 'Trabajando', variant: 'default', icon: Play },
    break: { label: 'En Pausa', variant: 'outline', icon: Coffee },
    inactive: { label: 'Inactivo', variant: 'secondary', icon: Clock },
};

// Obtener iniciales del nombre
function getInitials(nombre: string): string {
    const parts = nombre.trim().split(' ');
    if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
}

// Formatear rol
function formatRole(rol?: string): string {
    if (!rol) return 'Sin Rol';
    return rol.charAt(0).toUpperCase() + rol.slice(1).replace('_', ' ');
}

export function StaffCardPro({
    staff,
    status = 'inactive',
    onEdit,
    onDelete,
    onWhatsApp,
    className,
}: StaffCardProProps) {
    const roleStyles = getRoleColors(staff.rol);
    const currentStatus = statusConfig[status];
    const StatusIcon = currentStatus.icon;
    
    // Calcular progreso de horas
    const horasTrabajadas = staff.horasTrabajadas || 0;
    const horasProgress = Math.min((horasTrabajadas / staff.horasContratadas) * 100, 100);
    const horasRestantes = Math.max(staff.horasContratadas - horasTrabajadas, 0);

    return (
        <Card className={cn("overflow-hidden group hover:shadow-xl transition-all duration-200 hover:-translate-y-1 relative", className)}>
            {/* Left Border mimicking style={{ borderLeft: ... }} in environments */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", roleStyles.bg)} />
            
            {/* Header Area imitating the ConfigToggle style */}
            <div className="bg-muted/10 border-b p-5 flex items-start gap-3">
                {/* Avatar con iniciales coloreadas */}
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
                    roleStyles.chipBg,
                    roleStyles.text
                )}>
                    {getInitials(staff.nombre)}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold truncate">{staff.nombre}</h3>
                            <p className="text-sm text-muted-foreground">{formatRole(staff.rol)}</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -mr-2 -mt-2">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {onEdit && (
                                    <DropdownMenuItem onClick={onEdit}>
                                        <Edit className="h-4 w-4 mr-2 text-muted-foreground" />
                                        Editar
                                    </DropdownMenuItem>
                                )}
                                {onWhatsApp && (
                                    <DropdownMenuItem onClick={onWhatsApp}>
                                        <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                                        WhatsApp
                                    </DropdownMenuItem>
                                )}
                                {onDelete && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={onDelete}>
                                            <Trash className="h-4 w-4 mr-2 text-muted-foreground" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                    {/* Badge de estado actual */}
                    <Badge variant={currentStatus.variant} className="mt-2 gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {currentStatus.label}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4 pt-4">

                {/* Métodos de fichaje permitidos */}
                {staff.metodos_fichaje_permitidos && staff.metodos_fichaje_permitidos.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Métodos de fichaje</p>
                        <div className="flex gap-1">
                            <TooltipProvider>
                                {staff.metodos_fichaje_permitidos.map(metodo => {
                                    const config = metodoIcons[metodo];
                                    const Icon = config.icon;
                                    return (
                                        <Tooltip key={metodo}>
                                            <TooltipTrigger asChild>
                                                <div className={cn(
                                                    "w-8 h-8 rounded-md border flex items-center justify-center",
                                                    "hover:bg-muted transition-colors cursor-help"
                                                )}>
                                                    <Icon className={cn("h-4 w-4", config.color)} />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{config.label}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </TooltipProvider>
                        </div>
                    </div>
                )}

                {/* Progreso de horas */}
                <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Horas esta semana</span>
                        <span className="font-medium">
                            {horasTrabajadas}h / {staff.horasContratadas}h
                        </span>
                    </div>
                    <Progress value={horasProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                        {horasRestantes > 0 
                            ? `${horasRestantes}h restantes`
                            : horasTrabajadas > staff.horasContratadas 
                                ? `${horasTrabajadas - staff.horasContratadas}h extra`
                                : 'Horas completadas'
                        }
                    </p>
                </div>

                {/* Contacto rápido */}
                <div className="mt-4 flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="flex-1 h-9"
                                    onClick={() => window.location.href = `tel:${staff.telefono}`}
                                    disabled={!staff.telefono}
                                >
                                    <Phone className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Llamar</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="flex-1 h-9"
                                    onClick={() => window.location.href = `mailto:${staff.email}`}
                                >
                                    <Mail className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Email</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {onWhatsApp && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="flex-1 h-9 text-brand-whatsapp hover:text-brand-whatsapp hover:bg-brand-whatsapp/10"
                                        onClick={onWhatsApp}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>WhatsApp</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {onEdit && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="flex-1 h-9"
                                        onClick={onEdit}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
