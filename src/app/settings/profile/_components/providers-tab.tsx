import { H3 } from '@/components/ui/typography';
import * as React from 'react';
import { MoreVertical, Pencil, Trash, Plus, Building2, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/layout/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent as InnerTabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigItem } from '@/components/ui/config-item';

// Provider type definition
interface Provider {
    id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    nif: string;
    category: string;
    notes: string;
    paymentTerms: string;
}

const initialProviders: Provider[] = [
    {
        id: '1',
        name: 'Carnes de la Sierra',
        contactName: 'Juan Pérez',
        email: 'pedidos@carnesdelasierra.es',
        phone: '+34 912 345 678',
        address: 'Calle Mayor 15, Madrid',
        nif: 'B12345678',
        category: 'carnes',
        notes: 'Entregas los martes y viernes',
        paymentTerms: '30' },
    {
        id: '2',
        name: 'Vinos y Licores El Celler',
        contactName: 'Ana García',
        email: 'ana.g@celler.com',
        phone: '+34 934 567 890',
        address: 'Av. Diagonal 200, Barcelona',
        nif: 'B87654321',
        category: 'bebidas',
        notes: 'Pedido mínimo 500€',
        paymentTerms: '60' },
];

const emptyProvider: Provider = {
    id: '',
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    nif: '',
    category: 'otros',
    notes: '',
    paymentTerms: '30' };

const providerCategories = [
    { value: 'carnes', label: 'Carnes' },
    { value: 'pescados', label: 'Pescados' },
    { value: 'verduras', label: 'Verduras y Frutas' },
    { value: 'lacteos', label: 'Lácteos' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'otros', label: 'Otros' },
];

export function ProvidersTab() {
    const { toast } = useToast();
    const [providers, setProviders] = React.useState<Provider[]>(initialProviders);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [editingProvider, setEditingProvider] = React.useState<Provider | null>(null);
    const [providerToDelete, setProviderToDelete] = React.useState<Provider | null>(null);
    const [formData, setFormData] = React.useState<Provider>(emptyProvider);
    
    const handleOpenDialog = (provider?: Provider) => {
        if (provider) {
            setEditingProvider(provider);
            setFormData(provider);
        } else {
            setEditingProvider(null);
            setFormData({ ...emptyProvider, id: crypto.randomUUID() });
        }
        setIsDialogOpen(true);
    };
    
    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingProvider(null);
        setFormData(emptyProvider);
    };
    
    const handleSave = () => {
        if (!formData.name || !formData.email) {
            toast({
                variant: 'destructive',
                title: 'Campos requeridos',
                description: 'Por favor, completa el nombre y email del proveedor.' });
            return;
        }
        
        if (editingProvider) {
            setProviders(prev => prev.map(p => p.id === formData.id ? formData : p));
            toast({
                title: 'Proveedor actualizado',
                description: `${formData.name} ha sido actualizado correctamente.` });
        } else {
            setProviders(prev => [...prev, formData]);
            toast({
                title: 'Proveedor añadido',
                description: `${formData.name} ha sido añadido a la lista.` });
        }
        handleCloseDialog();
    };
    
    const handleDelete = () => {
        if (providerToDelete) {
            setProviders(prev => prev.filter(p => p.id !== providerToDelete.id));
            toast({
                variant: 'destructive',
                title: 'Proveedor eliminado',
                description: `${providerToDelete.name} ha sido eliminado.` });
            setProviderToDelete(null);
            setIsDeleteDialogOpen(false);
        }
    };
    
    const getCategoryLabel = (value: string) => {
        return providerCategories.find(c => c.value === value)?.label || 'Otros';
    };
    
    return (
        <TabsContent value="providers">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <H3 className="font-bold text-muted-foreground">Proveedores</H3>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Gestiona tus proveedores principales.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button onClick={() => handleOpenDialog()} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Proveedor
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {providers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No hay proveedores registrados.</p>
                            <p className="text-sm">Añade tu primer proveedor para empezar.</p>
                        </div>
                    ) : (
                        providers.map(provider => (
                            <ConfigItem
                                key={provider.id}
                                icon={Building2}
                                label={
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{provider.name}</span>
                                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{getCategoryLabel(provider.category)}</Badge>
                                    </div>
                                }
                                description={`Contacto: ${provider.contactName}`}
                            >
                                <div className="flex items-center gap-4 mr-4">
                                    <div className="hidden md:flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            <span>{provider.email}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Phone className="h-3 w-3" />
                                            <span>{provider.phone}</span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="md" className="h-8 w-8" startIcon={<MoreVertical />} />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => handleOpenDialog(provider)}>
                                                <Pencil />Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onSelect={() => {
                                                    setProviderToDelete(provider);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash />Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </ConfigItem>
                        ))
                    )}
                </CardContent>
            </Card>
            
            {/* Provider Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader
                        icon={Building2}
                        title={editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                        description={editingProvider ? 'Modifica los datos del proveedor.' : 'Añade un nuevo proveedor a tu lista.'}
                    />
                    
                    <Tabs defaultValue="datos" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="datos">Datos</TabsTrigger>
                            <TabsTrigger value="condiciones">Condiciones</TabsTrigger>
                        </TabsList>
                        
                        <InnerTabsContent value="datos" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="providerName">Nombre *</Label>
                                    <Input 
                                        id="providerName"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nombre de la empresa"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="providerNif">NIF</Label>
                                    <Input 
                                        id="providerNif"
                                        value={formData.nif}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nif: e.target.value.toUpperCase() }))}
                                        placeholder="B12345678"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="providerContact">Persona de Contacto</Label>
                                    <Input 
                                        id="providerContact"
                                        value={formData.contactName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                                        placeholder="Nombre del contacto"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="providerCategory">Categoría</Label>
                                    <Select 
                                        value={formData.category} 
                                        onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                                    >
                                        <SelectTrigger id="providerCategory">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {providerCategories.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="providerEmail">Email *</Label>
                                    <Input 
                                        id="providerEmail"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="email@proveedor.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="providerPhone">Teléfono</Label>
                                    <Input 
                                        id="providerPhone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+34 912 345 678"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="providerAddress">Dirección</Label>
                                <Input 
                                    id="providerAddress"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="Dirección completa"
                                />
                            </div>
                        </InnerTabsContent>
                        
                        <InnerTabsContent value="condiciones" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="providerPayment">Días de Pago</Label>
                                <Select 
                                    value={formData.paymentTerms} 
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, paymentTerms: v }))}
                                >
                                    <SelectTrigger id="providerPayment">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Pago inmediato</SelectItem>
                                        <SelectItem value="15">15 días</SelectItem>
                                        <SelectItem value="30">30 días</SelectItem>
                                        <SelectItem value="45">45 días</SelectItem>
                                        <SelectItem value="60">60 días</SelectItem>
                                        <SelectItem value="90">90 días</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="providerNotes">Notas</Label>
                                <Textarea 
                                    id="providerNotes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Información adicional sobre el proveedor, horarios de entrega, etc."
                                    rows={4}
                                />
                            </div>
                        </InnerTabsContent>
                    </Tabs>
                    
                    <DialogFooter>
                        <Button variant="ghost" onClick={handleCloseDialog}>Cancelar</Button>
                        <Button onClick={handleSave}>
                            {editingProvider ? 'Guardar Cambios' : 'Añadir Proveedor'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Estás a punto de eliminar a &quot;{providerToDelete?.name}&quot;. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TabsContent>
    );
}

