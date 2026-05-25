'use client';

import * as React from 'react';
import { Dialog, DialogWindow, DialogHeader, DialogContent, DialogFooter } from '@/components/layout/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Tag, Palette, Info, ListTree, Package } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

type Station = {
  _id: Id<"kitchen_stations">;
  establishment_id: Id<"establishments">;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  active: boolean;
};

type SubestacionEditDialogProps = {
  station: Station | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedData: Partial<Station>) => Promise<void>;
  categories?: any[];
  products?: any[];
  rules?: any[];
  onCreateRule?: (args: any) => Promise<void>;
  onDeleteRule?: (args: { ruleId: Id<"kds_routing_rules"> }) => Promise<void>;
};

export function SubestacionEditDialog({
  station,
  open,
  onOpenChange,
  onSave,
  categories = [],
  products = [],
  rules = [],
  onCreateRule,
  onDeleteRule,
}: SubestacionEditDialogProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState('');
  const [active, setActive] = React.useState(true);

  React.useEffect(() => {
    if (station) {
      setName(station.name);
      setDescription(station.description || '');
      setColor(station.color || '');
      setActive(station.active);
    }
  }, [station]);

  const handleSave = async () => {
    await onSave({ name, description, color, active });
    onOpenChange(false);
  };

  const handleToggleCategory = async (categoryId: string, isAssigned: boolean, ruleId?: string) => {
    if (!station || !onCreateRule || !onDeleteRule) return;
    
    if (isAssigned && ruleId) {
      await onDeleteRule({ ruleId: ruleId as Id<"kds_routing_rules"> });
    } else if (!isAssigned) {
      await onCreateRule({
        establishmentId: station.establishment_id,
        stationId: station._id,
        ruleType: "category",
        categoryId: categoryId as Id<"categories">,
        priority: 10,
        active: true
      });
    }
  };

  const handleToggleProduct = async (productId: string, isAssigned: boolean, ruleId?: string) => {
    if (!station || !onCreateRule || !onDeleteRule) return;
    
    if (isAssigned && ruleId) {
      await onDeleteRule({ ruleId: ruleId as Id<"kds_routing_rules"> });
    } else if (!isAssigned) {
      await onCreateRule({
        establishmentId: station.establishment_id,
        stationId: station._id,
        ruleType: "product",
        productId: productId as Id<"products">,
        priority: 20, // Productos tienen más prioridad que categorías
        active: true
      });
    }
  };

  if (!station) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow className="max-w-4xl w-[90vw]">
        <DialogHeader
          icon={Settings}
          title={`Ajustes: ${station.name}`}
          description="Edita las propiedades de la subestación y asigna sus productos."
        />
        <DialogContent className="flex-row p-0 min-h-[500px]">
          {/* Left panel: Configuración */}
          <div className="flex-1 flex flex-col border-r bg-muted/20 p-6 space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" /> Configuración General
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label icon={Tag}>Nombre</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Frituras" />
              </div>

              <div className="space-y-2">
                <Label icon={Info}>Descripción</Label>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Descripción de la zona de preparación..."
                />
              </div>

              <div className="space-y-2">
                <Label icon={Palette}>Color (UI)</Label>
                <Input type="color" className="h-10 w-full" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Label className="cursor-pointer" onClick={() => setActive(!active)}>Estado Activo</Label>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
          </div>

          {/* Right panel: Enrutamiento */}
          <div className="flex-[2] flex flex-col p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ListTree className="w-4 h-4" /> Reglas de Enrutamiento (Productos)
            </h3>
            <p className="text-sm text-muted-foreground">
              Selecciona qué categorías completas o productos específicos se enviarán a esta subestación.
            </p>
            
            <div className="flex-1 overflow-auto border rounded-md p-4 bg-background">
              {categories.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground p-4">Cargando categorías...</div>
              ) : (
                <div className="space-y-6">
                  {categories.map(category => {
                    // Check if whole category is assigned
                    const categoryRule = rules.find(r => r.rule_type === "category" && r.category_id === category._id);
                    const isCategoryAssigned = !!categoryRule;
                    
                    // Filter products for this category
                    const categoryProducts = products.filter(p => p.category_id === category._id);
                    
                    return (
                      <div key={category._id} className="space-y-2">
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <Checkbox 
                            checked={isCategoryAssigned}
                            onCheckedChange={() => handleToggleCategory(category._id, isCategoryAssigned, categoryRule?._id)}
                            id={`cat-${category._id}`}
                          />
                          <Label htmlFor={`cat-${category._id}`} className="font-bold text-md cursor-pointer flex-1">
                            {category.name} <span className="text-muted-foreground font-normal text-xs ml-2">({categoryProducts.length} productos)</span>
                          </Label>
                        </div>
                        
                        {!isCategoryAssigned && categoryProducts.length > 0 && (
                          <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {categoryProducts.map(product => {
                              const productRule = rules.find(r => r.rule_type === "product" && r.product_id === product._id);
                              const isProductAssigned = !!productRule;
                              return (
                                <div key={product._id} className="flex items-center gap-2">
                                  <Checkbox 
                                    checked={isProductAssigned}
                                    onCheckedChange={() => handleToggleProduct(product._id, isProductAssigned, productRule?._id)}
                                    id={`prod-${product._id}`}
                                  />
                                  <Label htmlFor={`prod-${product._id}`} className="cursor-pointer text-sm font-normal">
                                    {product.name}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {isCategoryAssigned && (
                          <div className="pl-6 text-xs text-muted-foreground italic">
                            Todos los productos de esta categoría se enviarán a {station.name}.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogFooter
          onCancel={() => onOpenChange(false)}
          cancelText="Cancelar"
          onConfirm={handleSave}
          confirmText="Guardar Cambios"
        />
      </DialogWindow>
    </Dialog>
  );
}
