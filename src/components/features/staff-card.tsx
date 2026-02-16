'use client';

import * as React from 'react';
import { Phone, Mail, Calendar, Clock, MoreVertical, Edit, Trash, MessageSquare, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getRoleColors } from '@/lib/role-colors';

// Types
export interface StaffMemberData {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: 'camarero' | 'encargado' | 'jefe' | 'cocinero' | 'bartender';
  avatar?: string;
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'baja';
  fechaContratacion: string;
  horasTrabajadas?: number;
  turnoActual?: {
    inicio: string;
    fin: string;
  };
}

interface StaffCardProps {
  staff: StaffMemberData;
  onEdit?: (staff: StaffMemberData) => void;
  onDelete?: (id: string) => void;
  onWhatsApp?: (staff: StaffMemberData) => void;
  onToggleStatus?: (id: string, newStatus: 'activo' | 'inactivo') => void;
  compact?: boolean;
  className?: string;
}

// Role configurations - design system: colores sutiles, sin gradientes excesivos
const roleLabels: Record<string, string> = {
  camarero: 'Camarero',
  encargado: 'Encargado',
  jefe: 'Jefe / Admin',
  cocinero: 'Cocinero',
  bartender: 'Bartender',
};

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  activo: { variant: 'default', label: 'Activo' },
  inactivo: { variant: 'secondary', label: 'Inactivo' },
  vacaciones: { variant: 'outline', label: 'Vacaciones' },
  baja: { variant: 'destructive', label: 'Baja' },
};

// Get initials from name
function getInitials(nombre: string, apellidos: string): string {
  return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
}

// Staff Card Component
export function StaffCard({
  staff,
  onEdit,
  onDelete,
  onWhatsApp,
  onToggleStatus,
  compact = false,
  className,
}: StaffCardProps) {
  const roleStyles = getRoleColors(staff.rol);
  const roleLabel = roleLabels[staff.rol] || 'Camarero';
  const status = statusConfig[staff.estado] || statusConfig.activo;

  if (compact) {
    return (
      <Card className={cn("overflow-hidden group hover:shadow-sm transition-shadow", className)}>
        <div className={cn("h-1", roleStyles.bg)} />
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={staff.avatar} alt={staff.nombre} />
              <AvatarFallback className={cn("text-sm", roleStyles.chipBg, roleStyles.text)}>
                {getInitials(staff.nombre, staff.apellidos)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{staff.nombre} {staff.apellidos}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            <Badge variant={status.variant} className="text-xs">
              {status.label}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden group hover:shadow-sm transition-all", className)}>
      {/* Header sutil - design system */}
      <div className={cn("h-12 relative flex items-center justify-between px-4", roleStyles.bg)}>
        <Badge variant="outline" className={cn("text-xs border-transparent", roleStyles.text, roleStyles.bg)}>
          {roleLabel}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="md" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(staff)}>
                <Edit className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                Editar
              </DropdownMenuItem>
            )}
            {onWhatsApp && (
              <DropdownMenuItem onClick={() => onWhatsApp(staff)}>
                <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                WhatsApp
              </DropdownMenuItem>
            )}
            {onToggleStatus && (
              <>
                <DropdownMenuSeparator />
                {staff.estado === 'activo' ? (
                  <DropdownMenuItem onClick={() => onToggleStatus(staff.id, 'inactivo')}>
                    <UserX className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    Desactivar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onToggleStatus(staff.id, 'activo')}>
                    <UserCheck className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    Activar
                  </DropdownMenuItem>
                )}
              </>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(staff.id)}>
                  <Trash className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="pt-4 pb-4">
        {/* Avatar and Name */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={staff.avatar} alt={staff.nombre} />
            <AvatarFallback className={cn("font-medium", roleStyles.chipBg, roleStyles.text)}>
              {getInitials(staff.nombre, staff.apellidos)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold leading-tight">
              {staff.nombre} {staff.apellidos}
            </h3>
            <Badge variant={status.variant} className="mt-1 text-xs">
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{staff.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{staff.telefono}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Desde {staff.fechaContratacion}</span>
          </div>
        </div>

        {/* Current Shift */}
        {staff.turnoActual && (
          <div className="mt-4 p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">Turno actual:</span>
              <span className="text-muted-foreground">
                {staff.turnoActual.inicio} - {staff.turnoActual.fin}
              </span>
            </div>
          </div>
        )}

        {/* Hours Stats */}
        {staff.horasTrabajadas !== undefined && (
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Horas este mes:</span>
            <span className="font-semibold">{staff.horasTrabajadas}h</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-4 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="md" 
                  className="flex-1 h-9"
                  onClick={() => window.location.href = `tel:${staff.telefono}`}
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
                  size="md" 
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
                    size="md" 
                    className="flex-1 h-9 text-brand-whatsapp hover:text-brand-whatsapp hover:bg-brand-whatsapp/10"
                    onClick={() => onWhatsApp(staff)}
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
                    size="md" 
                    className="flex-1 h-9"
                    onClick={() => onEdit(staff)}
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

// Grid component for displaying multiple staff cards
export function StaffCardGrid({
  staff,
  onEdit,
  onDelete,
  onWhatsApp,
  onToggleStatus,
  compact = false,
}: {
  staff: StaffMemberData[];
  onEdit?: (staff: StaffMemberData) => void;
  onDelete?: (id: string) => void;
  onWhatsApp?: (staff: StaffMemberData) => void;
  onToggleStatus?: (id: string, newStatus: 'activo' | 'inactivo') => void;
  compact?: boolean;
}) {
  return (
    <div className={cn(
      "grid gap-4",
      compact 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    )}>
      {staff.map(member => (
        <StaffCard
          key={member.id}
          staff={member}
          onEdit={onEdit}
          onDelete={onDelete}
          onWhatsApp={onWhatsApp}
          onToggleStatus={onToggleStatus}
          compact={compact}
        />
      ))}
    </div>
  );
}
