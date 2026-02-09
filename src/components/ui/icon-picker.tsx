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
  Store,
  Building2,
  Coffee,
  Utensils,
  Pizza,
  Wine,
  Beer,
  IceCream,
  Cake,
  Cookie,
  Apple,
  Beef,
  Fish,
  Salad,
  Sandwich,
  Soup,
  UtensilsCrossed,
  ChefHat,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Star,
  Heart,
  Music,
  Palmtree,
  Umbrella,
  Waves,
  Mountain,
  TreePine,
  Flower2,
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
  Home,
  Store,
  Building2,
  Coffee,
  Utensils,
  Pizza,
  Wine,
  Beer,
  IceCream,
  Cake,
  Cookie,
  Apple,
  Beef,
  Fish,
  Salad,
  Sandwich,
  Soup,
  UtensilsCrossed,
  ChefHat,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Star,
  Heart,
  Music,
  Palmtree,
  Umbrella,
  Waves,
  Mountain,
  TreePine,
  Flower2,
};

const iconNames = Object.keys(iconMap);

// Spanish labels for icons
const iconLabels: Record<string, string> = {
  Home: 'Inicio',
  Store: 'Tienda',
  Building2: 'Edificio',
  Coffee: 'Café',
  Utensils: 'Cubiertos',
  Pizza: 'Pizza',
  Wine: 'Vino',
  Beer: 'Cerveza',
  IceCream: 'Helado',
  Cake: 'Pastel',
  Cookie: 'Galleta',
  Apple: 'Manzana',
  Beef: 'Carne',
  Fish: 'Pescado',
  Salad: 'Ensalada',
  Sandwich: 'Bocadillo',
  Soup: 'Sopa',
  UtensilsCrossed: 'Restaurante',
  ChefHat: 'Chef',
  Flame: 'Fuego',
  Snowflake: 'Frío',
  Sun: 'Sol',
  Moon: 'Luna',
  Star: 'Estrella',
  Heart: 'Corazón',
  Music: 'Música',
  Palmtree: 'Palmera',
  Umbrella: 'Sombrilla',
  Waves: 'Olas',
  Mountain: 'Montaña',
  TreePine: 'Pino',
  Flower2: 'Flor',
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
        <PopoverContent className="w-72 p-3" align="start">
          <div className="grid gap-3">
            {/* Search */}
            <SearchInput
              placeholder="Buscar icono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
            />

            {/* Icons Grid */}
            <ScrollArea className="h-48">
              <div className="grid grid-cols-5 gap-1.5">
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

            {/* Selected Icon Info */}
            <div className="flex items-center gap-2 pt-2 border-t text-sm text-muted-foreground">
              <SelectedIcon className="h-4 w-4" />
              <span>Seleccionado: {iconLabels[value] || value}</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Export the icon map for use in other components
export { iconMap, iconLabels };
