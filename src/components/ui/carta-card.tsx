'use client';

import * as React from 'react';
import { 
  BookOpen, 
  Trash, 
  Edit, 
  PlusCircle, 
  Power,
  ChevronDown,
  LayoutGrid,
  Settings
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TextXS } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Badge, IconBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ActionTile } from '@/components/ui/action-tile';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/dialogs/global-alert-dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '@/components/ui/color-picker';
import { IconPicker, iconMap as allIcons } from '@/components/ui/icon-picker';
import { H5 } from '@/components/ui/typography';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Carta, type ElementoCarta } from '@/data/mock-data';

interface CartaCardProps {
  carta: Carta;
  onUpdate: (id: string, updates: Partial<Carta>) => void;
  onRemove: (id: string) => void;
  onEdit: (carta: Carta) => void;
  onAddElement: (id: string) => void;
  onRemoveElement: (cartaId: string, elementId: string) => void;
  categories: any[];
}

const iconsFallback: Record<string, any> = {
  BookOpen, LayoutGrid
};

export function CartaCard({
  carta,
  onUpdate,
  onRemove,
  onEdit,
  onAddElement,
  onRemoveElement,
  categories
}: CartaCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingName, setEditingName] = React.useState(carta.nombre_carta);

  const Icon = (allIcons[carta.icon] || (iconsFallback as any)[carta.icon] || BookOpen);

  const handleUpdateName = () => {
    if (editingName.trim() && editingName !== carta.nombre_carta) {
      onUpdate(carta.id, { nombre_carta: editingName });
    }
    setIsEditing(false);
  };

  return (
    <Card>

      <div className="p-4 space-y-4">
        {/* Cabecera: Icono y Título */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <IconBadge 
                  icon={Icon}
                  iconColor={carta.color}
                  className="relative cursor-pointer"
                >
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-background shadow-md" 
                       style={{ backgroundColor: carta.activa ? '#22c55e' : '#94a3b8' }} />
                </IconBadge>
              </PopoverTrigger>
              <PopoverContent className="w-80 space-y-4" align="start">
                <div className="space-y-4">
                  <IconPicker 
                    label="Icono representativo"
                    value={carta.icon}
                    onChange={(icon) => onUpdate(carta.id, { icon })}
                  />
                  <ColorPicker 
                    label="Color de identidad"
                    value={carta.color}
                    onChange={(color) => onUpdate(carta.id, { color: color })}
                  />
                </div>
                
                <Separator />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <ActionTile
                      title="Eliminar Carta"
                      description="Se borrará todo el contenido configurado."
                      icon={Trash}
                      iconColor="rose-500"
                    />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará la carta "{carta.nombre_carta}" y todo su contenido configurado. No se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onRemove(carta.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar Carta
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
                  className="text-left pl-0 font-medium tracking-tight border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 bg-transparent shadow-none h-auto py-0"
                />
              ) : (
                <div className="flex flex-col">
                  <H5 
                    className="truncate cursor-pointer"
                    onClick={() => {
                      setIsEditing(true);
                      setEditingName(carta.nombre_carta);
                    }}
                  >
                    {carta.nombre_carta}
                  </H5>
                  
                </div>
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
                    onClick={() => onEdit(carta)}
                    startIcon={<Settings />}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Gestionar Carta</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={carta.activa ? "ghost-success" : "ghost-destructive"}
                    size="md"
                    onClick={() => onUpdate(carta.id, { activa: !carta.activa })}
                    startIcon={<Power />}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{carta.activa ? 'Desactivar' : 'Activar'} Carta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Info de Contenido */}
        <ActionTile
          icon={LayoutGrid}
          iconColor="muted-foreground"
          title="Contenido"
          description={`${carta.elementos_carta.length} categorías asignadas`}
          rightContentType="custom"
          customContent={
            <Button variant="ghost" size="md" onClick={() => onAddElement(carta.id)}>
              <PlusCircle />
            </Button>
          }
        />

        {/* Lista de Contenido */}
        <div className="pt-2">
          <ScrollArea className="h-[140px] pr-4 -mr-4 border rounded-xl bg-muted/20">
            <div className="p-3 space-y-1.5">
              {carta.elementos_carta.map((el, index) => {
                const category = categories.find(c => c.id === el.id_elemento);
                const name = category?.nombre_categoria || 'Categoría borrada';
                const color = category?.color || 'primary';

                return (
                  <div key={el.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-background border shadow-sm group/item hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-muted-foreground w-4">{index + 1}.</span>
                      <div 
                        className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          !color.startsWith('#') && `bg-${color}`
                        )} 
                        style={color.startsWith('#') ? { backgroundColor: color } : undefined} 
                      />
                      <span className="truncate font-medium">{name}</span>
                    </div>
                    <Button 
                      variant="ghost-destructive" 
                      size="md" 
                      className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                      onClick={() => onRemoveElement(carta.id, el.id)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
              {carta.elementos_carta.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-background/50 rounded-lg border border-dashed">
                  <TextXS className="text-muted-foreground">Esta carta no tiene contenido todavía.</TextXS>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

    </Card>
  );
}
