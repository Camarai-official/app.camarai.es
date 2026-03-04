'use client';
import { H3 } from '@/components/ui/typography';


import * as React from 'react';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Edit, Trash, ArrowLeft, Banknote } from 'lucide-react';
import {
  Dialog,
  DialogWindow,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogClose } from '@/components/layout/dialog';
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
  AlertDialogTrigger } from '@/components/dialogs/global-alert-dialog';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { PageContainer } from '@/components/layout/page-container';

import { TaxDialog } from '@/components/dialogs/configuracion-tax-dialog';

export default function TaxesPage() {
  const [taxes, setTaxes] = React.useState<Tax[]>(mockTaxes);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTax, setEditingTax] = React.useState<Tax | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    setIsInitialized(true);
  }, []);

  const handleOpenDialog = (tax?: Tax) => {
    setEditingTax(tax || null);
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

  const handleSave = (taxData: { nombre_impuesto: string; porcentaje_impuesto: number }) => {
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
    <PageContainer>
      <PageHeader title="Gestión de Impuestos" />
      <PageContent>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <H3>Todos los Impuestos</H3>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Impuesto
            </Button>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
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
                              <Button variant="ghost" size="md" startIcon={<MoreHorizontal />} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleOpenDialog(tax)}><Edit />Editar</DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem><Trash />Eliminar</DropdownMenuItem>
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
            </div>
          </CardContent>
        </Card>
      </PageContent>

      <TaxDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        editingTax={editingTax} 
        onSave={handleSave} 
      />
    </PageContainer>
    );
}

