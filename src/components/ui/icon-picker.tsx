'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchInput } from '@/components/ui/search-input';
import { cn } from '@/lib/utils';
import {
  Home,
  User,
  Store,
  Building2,
  Coffee,
  Utensils,
  Pizza,
  Wine,
  Beer,
  IceCream,
  Cake,
  ChefHat,
  Flame,
  Snowflake,
  Star,
  Heart,
  Music,
  Palmtree,
  Umbrella,
  Waves,
  TreePine,
  DoorOpen,
  HandPlatter,
  Bike,
  Beef,
  Notebook,
  Brush,
  Sandwich,
  Martini,
  type LucideIcon,
} from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
 
  // Kitchen & Food
  Utensils,
  Sandwich,
  Pizza,
  Beef,
  Cake,
  IceCream,
  
  // Bar & Drinks
  Coffee,
  Wine,
  Beer,
  Martini,
  
  // Venue & Ambience
  Home,
  Store,
  Building2,
  Palmtree,
  TreePine,
  Umbrella,
  Waves,

   // Staff & Roles
  User,
  ChefHat,
  HandPlatter,
  DoorOpen,
  Bike,
  Notebook,
  Brush,
  
  
  // Atmosphere & States
  Star,
  Heart,
  Music,
  Flame,
  Snowflake,
};

const iconNames = Object.keys(iconMap);

// Spanish labels for icons
const iconLabels: Record<string, string> = {
  // Staff & Roles
  User: 'Usuario',
  ChefHat: 'Chef',
  HandPlatter: 'Camarero',
  DoorOpen: 'Host',
  Bike: 'Delivery',
  Notebook: 'Manager',
  Brush: 'Limpieza',
  
  // Kitchen & Food
  Utensils: 'Cubiertos',
  Sandwich: 'Hamburguesa',
  Pizza: 'Pizza',
  Beef: 'Carne',
  Cake: 'Pastel',
  IceCream: 'Helado',
  
  // Bar & Drinks
  Coffee: 'Café',
  Wine: 'Vino',
  Beer: 'Cerveza',
  Martini: 'Cócteles',
  
  // Venue & Ambience
  Home: 'Inicio',
  Store: 'Tienda',
  Building2: 'Edificio',
  Palmtree: 'Palmera',
  TreePine: 'Pino',
  Umbrella: 'Sombrilla',
  Waves: 'Olas',
  
  // Atmosphere & States
  Star: 'Estrella',
  Heart: 'Corazón',
  Music: 'Música',
  Flame: 'Fuego',
  Snowflake: 'Frío',
};

export function IconPicker({
  value = 'Utensils',
  onChange,
  label,
  placeholder = 'Seleccionar icono',
  disabled = false,
  className,
}: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const SelectedIcon = iconMap[value] || Utensils;

  const filteredIcons = React.useMemo(() => {
    if (!search) return iconNames;
    const searchLower = search.toLowerCase();
    return iconNames.filter(
      (name) =>
        name.toLowerCase().includes(searchLower) ||
        iconLabels[name]?.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-start"
            disabled={disabled}
          >
            <SelectedIcon className="h-4 w-4 mr-2" />
            <span className="flex-1 text-left">{iconLabels[value] || value || placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 border-border" align="start">
          <div className="grid gap-2">
            
            <ScrollArea>
              <div className="grid grid-cols-5 gap-1">
                {filteredIcons.map((iconName) => {
                  const Icon = iconMap[iconName];
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleSelect(iconName)}
                      className={cn(
                        'h-10 w-10 rounded-md border flex items-center justify-center transition-colors hover:bg-accent',
                        value === iconName && 'bg-primary text-primary-foreground hover:bg-primary'
                      )}
                      title={iconLabels[iconName] || iconName}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
              {filteredIcons.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No se encontraron iconos
                </p>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Export the icon map for use in other components
export { iconMap, iconLabels };
