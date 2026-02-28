'use client';

import * as React from 'react';
import { 
  MessageSquare, 
  Smartphone, 
  QrCode, 
  Globe, 
  Clock, 
  Coffee, 
  Play,
  User,
  MoreVertical,
  Check,
  UserX,
  Sun,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, IconBadge } from '@/components/ui/badge';
import { ActionTile } from '@/components/ui/action-tile';
import { Progress } from '@/components/ui/progress';
import { H5, TextXS, TextSM } from '@/components/ui/typography';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getRoleColors } from '@/lib/role-colors';
import type { MetodoFichaje } from '@/types/fichaje';

// ============================================================================
// TYPES
// ============================================================================

export interface StaffCardData {
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

interface StaffCardProps {
  staff: StaffCardData;
  status?: StaffStatus;
  onEdit?: () => void;
  onWhatsApp?: () => void;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const metodoIcons: Record<MetodoFichaje, { icon: React.ElementType; label: string }> = {
  app: { icon: Smartphone, label: 'App Móvil' },
  whatsapp: { icon: MessageSquare, label: 'WhatsApp' },
  qr: { icon: QrCode, label: 'Código QR' },
  web: { icon: Globe, label: 'Panel Web' },
};

const statusConfig: Record<StaffStatus, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: React.ElementType }> = {
  active: { label: 'Trabajando', variant: 'default', icon: Play },
  break: { label: 'En Pausa', variant: 'outline', icon: Coffee },
  inactive: { label: 'Inactivo', variant: 'secondary', icon: Clock },
};

const roleLabels: Record<string, string> = {
  camarero: 'Camarero',
  encargado: 'Encargado',
  jefe: 'Jefe / Admin',
  cocinero: 'Cocinero',
  bartender: 'Bartender',
  gerente: 'Gerente',
  host: 'Host',
  ayudante_cocina: 'Ayudante de Cocina',
  repartidor: 'Repartidor',
};

const contractStatusIcons: Record<StaffCardData['estado'], React.ElementType> = {
  Activo: Check,
  Inactivo: UserX,
  Vacaciones: Sun,
  Baja: AlertCircle,
};

function getInitials(nombre: string): string {
  const parts = nombre.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return nombre.substring(0, 2).toUpperCase();
}

function formatRole(rol?: string): string {
  if (!rol) return 'Sin Rol';
  return roleLabels[rol] || rol.charAt(0).toUpperCase() + rol.slice(1).replace('_', ' ');
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StaffCard({
  staff,
  status = 'inactive',
  onEdit,
  onWhatsApp,
}: StaffCardProps) {
  const roleStyles = getRoleColors(staff.rol);
  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  // Calcular progreso de horas
  const horasTrabajadas = staff.horasTrabajadas || 0;
  const horasProgress = staff.horasContratadas > 0
    ? Math.min((horasTrabajadas / staff.horasContratadas) * 100, 100)
    : 0;

  // Formatear label de horas
  const horasRestantes = Math.max(staff.horasContratadas - horasTrabajadas, 0);
  const horasLabel = horasRestantes > 0
    ? `${horasTrabajadas}h / ${staff.horasContratadas}h`
    : horasTrabajadas > staff.horasContratadas
      ? `${horasTrabajadas - staff.horasContratadas}h extra`
      : 'Completadas';

  return (
    <Card className="p-4">

        {/* Header: Avatar + Name/Role + Status Badge & Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <IconBadge
              icon={User}
              className={cn(roleStyles.chipBg, roleStyles.text)}
            >
            
            </IconBadge>

            <div className="min-w-0 flex-1">
              <H5>{staff.nombre}</H5>
              <TextXS className="text-muted-foreground leading-none" >{formatRole(staff.rol)}</TextXS>
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    size="md"
                    variant={
                      staff.estado === 'Activo' ? 'success' : 
                      staff.estado === 'Inactivo' ? 'neutral' : 
                      staff.estado === 'Vacaciones' ? 'info' : 
                      'destructive'
                    }
                    className="w-10 px-0 flex items-center justify-center"
                  >
                    {React.createElement(contractStatusIcons[staff.estado])}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Estado: {staff.estado}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="secondary"
              size="md"
              onClick={onEdit}
              className="w-10 px-0 flex items-center justify-center shrink-0"
              startIcon={<MoreVertical />}
            />
          </div>
        </div>

        
          {/* Horas progress */}
          <div className="flex flex-col gap-2 px-1">
            <div className="flex items-baseline justify-between w-full gap-2">
              <TextXS>
                Horas esta semana
              </TextXS>
              <H5>
                {horasLabel}
              </H5>
            </div>
            <Progress 
              value={horasProgress} 
              className="h-1.5"
            />
          </div>

    </Card>
  );
}
