'use client';

import * as React from 'react';
import { 
  Users, 
  Utensils, 
  Activity, 
  Power, 
  Percent, 
  QrCode, 
  Pencil, 
  Trash,
  ChevronRight,
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, IconBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ActionTile } from '@/components/ui/action-tile';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/dialogs/global-alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '@/components/ui/color-picker';
import { IconPicker, iconMap } from '@/components/ui/icon-picker';
import { H5, TextXS } from '@/components/ui/typography';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnvironmentCardProps {
  env: any;
  onUpdate: (id: string, updates: any) => void;
  onRemove: (id: string, name: string) => void;
  onOpenQR: (env: any) => void;
  calculateStats: (env: any) => {
    totalTables: number;
    totalCapacity: number;
    occupiedTables: number;
    occupiedCapacity: number;
    occupancyPercentage: number;
  };
  onViewPlan: (id: string) => void;
}

const colorMap: Record<string, string> = {
  'blue-400': '#60a5fa',
  'violet-500': '#8b5cf6',
  'rose-500': '#f43f5e',
  'amber-500': '#f59e0b',
  'green-500': '#22c55e',
  'blue-500': '#3b82f6',
  'primary': '#9B6EFD',
};

const getColorValue = (color: string) => {
  if (!color) return '#9B6EFD';
  if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')) return color;
  return colorMap[color] || color;
};

export function EnvironmentCard({
  env,
  onUpdate,
  onRemove,
  onOpenQR,
  calculateStats,
  onViewPlan
}: EnvironmentCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingName, setEditingName] = React.useState(env.name);
  const [isOpen, setIsOpen] = React.useState(false);
  
  const stats = calculateStats(env);
  const Icon = iconMap[env.icon] || Utensils;

  const handleUpdateName = () => {
    if (editingName.trim() && editingName !== env.name) {
      onUpdate(env.id, { name: editingName });
    }
    setIsEditing(false);
  };

  const statusVariant = env.status === 'Abierto' ? 'success' : 'danger';
  const displayColor = getColorValue(env.color);

  return (
    <Card >
      
      
      <div className="p-4 space-y-4">
        {/* Top Header: Icon and Title together */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <IconBadge 
                  icon={Icon}
                  iconColor={env.color}
                  className="relative cursor-pointer"
                >
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-background shadow-md" 
                       style={{ backgroundColor: env.status === 'Abierto' ? '#22c55e' : '#ef4444' }} />
                </IconBadge>
              </PopoverTrigger>
              <PopoverContent className="w-80 space-y-4 " align="start">
                <div className="space-y-4">
                  <IconPicker 
                    label="Icono representativo"
                    value={env.icon}
                    onChange={(icon) => onUpdate(env.id, { icon })}
                  />
                  <ColorPicker 
                    label="Color de identidad"
                    value={env.color}
                    onChange={(color) => onUpdate(env.id, { color })}
                  />
                </div>
                
                <Separator />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <ActionTile
                      title="Eliminar Ambiente"
                      description={`Se borrarán ${env.tables.length} mesas asociadas.`}
                      icon={Trash}
                      iconColor="rose-500"
                    />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará "{env.name}" y todas sus {env.tables.length} mesas asociadas. No se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onRemove(env.id, env.name)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar Permanentemente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </PopoverContent>
            </Popover>

            <div className="min-w-0 flex-1">
              {isEditing ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleUpdateName}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                  autoFocus
                  className="text-left pl-0 text-sm md:text-md font-medium tracking-tight border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 bg-transparent shadow-none"
                />
              ) : (
                <H5 
                  
                  onClick={() => {
                    setIsEditing(true);
                    setEditingName(env.name);
                  }}
                >
                  {env.name}
                </H5>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary"
                    size="md"
                    onClick={() => onOpenQR(env)}
                    startIcon={<QrCode />}
                    
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Configurar QR de Mesas</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={env.status === 'Abierto' ? "ghost-success" : "ghost-destructive"}
                    size="md"
                    onClick={() => onUpdate(env.id, { status: env.status === 'Abierto' ? 'Cerrado' : 'Abierto' })}
                    startIcon={<Power />}
                    
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Ambiente {env.status}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        
        <div className="space-y-2">
          {/* Occupancy Section */}
        <ActionTile
          icon={Percent}
          iconColor="muted-foreground"
          title="Ocupación"
          rightContentType="progress"
          progressValue={stats.occupancyPercentage}
          progressIndicatorClassName="bg-muted-foreground"
        />

        {/* Stats Grid with ActionTiles */}
        <div className="grid grid-cols-2 gap-2">
          <ActionTile
            title="Mesas"
            description={`${stats.occupiedTables} de ${stats.totalTables}`}
            icon={Utensils}
            iconColor="muted-foreground"
          />
          <ActionTile
            title="Aforo"
            description={`${stats.occupiedCapacity} de ${stats.totalCapacity}`}
            icon={Users}
            iconColor="muted-foreground"
          />
        </div>
        </div>
        
        <Button 
          variant="outline" 
          fullWidth 
          className="mt-4 rounded-xl h-11 font-bold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all flex items-center justify-center gap-2"
          onClick={() => onViewPlan(env.id)}
        >
          <LayoutGrid className="h-4 w-4" />
          Ver Plano de Mesas
        </Button>
      </div>

    </Card>
  );
}
