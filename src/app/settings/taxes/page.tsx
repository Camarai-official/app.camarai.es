
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash, ArrowLeft, Banknote } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { mockTaxes } from '@/data/mock-data';
import type { Tax } from '@/data/mock-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';

export default function TaxesPage() {
  const [taxes, setTaxes] = React.useState<Tax[]>(mockTaxes);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTax, setEditingTax] = React.useState<Tax | null>(null);
  const [taxName, setTaxName] = React.useState('');
  const [taxRate, setTaxRate] = React.useState(0);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    setIsInitialized(true);
  }, []);

  const handleOpenDialog = (tax?: Tax) => {
    if (tax) {
      setEditingTax(tax);
      setTaxName(tax.nombre_impuesto);
      setTaxRate(tax.porcentaje_impuesto);
    } else {
      setEditingTax(null);
      setTaxName('');
      setTaxRate(0);
    }
    setIsDialogOpen(true);
  };

  const addTax = (newTax: Omit<Tax, 'id'>) => {
    const tax: Tax = {
      ...newTax,
      id: `tax-${Date.now()}`
    };
    setTaxes(prev => [...prev, tax]);
    toast({ title: 'Impuesto creado', description: `${newTax.nombre_impuesto} ha sido añadido correctamente.` });
  };

  const updateTax = (id: string, updatedTax: Partial<Tax>) => {
    setTaxes(prev => prev.map(t => t.id === id ? { ...t, ...updatedTax } : t));
    toast({ title: 'Impuesto actualizado', description: 'Los cambios se han guardado correctamente.' });
  };

  const removeTax = (id: string) => {
    setTaxes(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Impuesto eliminado', description: 'El impuesto ha sido eliminado permanentemente.', variant: 'destructive' });
  };

  const handleSave = () => {
    const taxData = { nombre_impuesto: taxName, porcentaje_impuesto: taxRate };
    if (editingTax) {
      updateTax(editingTax.id, taxData);
    } else {
      addTax(taxData);
    }
    setIsDialogOpen(false);
  };

  if (!isInitialized) {
    return <div>Cargando...</div>
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      <PageHeader title="Gestión de Impuestos" />
      <main className="flex flex-1 flex-col gap-4 p-4 pt-2 md:gap-6 md:p-6 md:pt-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Todos los Impuestos</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Impuesto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle icon={Banknote}>{editingTax ? 'Editar' : 'Crear'} Impuesto</DialogTitle>
                  <DialogDescription>
                    Define un nuevo tipo impositivo para tus productos.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <Label htmlFor="tax-name">Nombre del Impuesto</Label>
                    <Input id="tax-name" value={taxName} onChange={(e) => setTaxName(e.target.value)} placeholder="Ej: IVA General, Tasa Turística..." />
                  </div>
                  <div>
                    <Label htmlFor="tax-rate">Porcentaje (%)</Label>
                    <Input id="tax-rate" type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} placeholder="Ej: 21" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="secondary">Cancelar</Button></DialogClose>
                  <Button variant="brand" onClick={handleSave}>Guardar Impuesto</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Impuesto</TableHead>
                  <TableHead>Porcentaje</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxes.length > 0 ? taxes.map((tax) => (
                  <TableRow key={tax.id}>
                    <TableCell className="font-medium">{tax.nombre_impuesto}</TableCell>
                    <TableCell>{tax.porcentaje_impuesto}%</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleOpenDialog(tax)}><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem><Trash className="mr-2 h-4 w-4 text-muted-foreground" />Eliminar</DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará el impuesto permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeTax(tax.id)} className={buttonVariants({ variant: 'destructive' })}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No has creado ningún impuesto todavía.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
