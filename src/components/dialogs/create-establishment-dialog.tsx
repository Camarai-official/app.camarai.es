'use client';

import * as React from 'react';
import { Building2, MapPin, Mail, Phone, Globe, ChevronRight } from 'lucide-react';
import { Dialog, DialogWindow, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEstablishments } from '@/hooks/useEstablishments';
import { useToast } from '@/hooks/use-toast';

interface CreateEstablishmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEstablishmentDialog({ open, onOpenChange }: CreateEstablishmentDialogProps) {
  const { addEstablishment, setActiveEstablishmentId } = useEstablishments();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: '',
    type: 'Restaurante',
    address: '',
    city: '',
    postalCode: '',
    country: 'España',
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.city) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, rellena al menos el nombre, la dirección y la ciudad.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newId = await addEstablishment(formData);
      if (newId) {
        setActiveEstablishmentId(newId.toString());
        toast({
          title: "Establecimiento creado",
          description: `Se ha creado el establecimiento "${formData.name}" correctamente.`
        });
        onOpenChange(false);
        // Reset form
        setFormData({
          name: '',
          type: 'Restaurante',
          address: '',
          city: '',
          postalCode: '',
          country: 'España',
          email: '',
        });
      }
    } catch (error) {
      toast({
        title: "Error al crear",
        description: "No se ha podido crear el establecimiento. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogWindow size="md">
        <DialogHeader
          icon={Building2}
          title="Asociar nuevo establecimiento"
          description="Introduce los datos del nuevo local para añadirlo a tu cuenta."
        />

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <DialogContent className="gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del establecimiento</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Camarai Gourmet"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de negocio</Label>
                <Input
                  id="type"
                  name="type"
                  placeholder="Ej: Restaurante, Bar, Cafetería..."
                  value={formData.type}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email de contacto</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4 border-border/50">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Ubicación
              </h4>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Calle, Número, Piso..."
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="Madrid"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      placeholder="28001"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="España"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </DialogContent>

          <DialogFooter className="flex-row justify-between sm:justify-between items-center">
            <Button 
              type="submit" 
              className="font-bold flex items-center gap-2 group order-first" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear Establecimiento"}
              {!isSubmitting && <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </Button>
            
            <Button 
              type="button"
              variant="ghost-destructive" 
              onClick={() => onOpenChange(false)}
              className="order-last"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogWindow>
    </Dialog>
  );
}
