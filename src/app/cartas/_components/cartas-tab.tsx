'use client';

import * as React from 'react';
import { 
    PlusCircle, 
    BookOpen,
    Edit, 
    Trash, 
    ChevronLeft, 
    ChevronRight,
    Eye,
    EyeOff
} from 'lucide-react';

import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    mockCartas, 
    mockCategories, 
    type Carta, 
    type ElementoCarta 
} from '@/data/mock-data';

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogWindow, 
    DialogFooter 
} from '@/components/layout/dialog';

import { CartasDialog, type CartaWhatsAppConfig } from '@/components/dialogs/cartas-cartas-dialog';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button, buttonVariants } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { ActionTile } from '@/components/ui/action-tile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { iconMap } from '@/components/ui/icon-picker';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from '@/components/dialogs/global-alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { TextSM } from '@/components/ui/typography';

// props

interface CartasTabProps {
    searchTerm?: string;
}

export function CartasTab({ searchTerm = '' }: CartasTabProps) {
    const { toast } = useToast();
    const [cartas, setCartas] = React.useState<Carta[]>(mockCartas);
    const [editingCarta, setEditingCarta] = React.useState<Partial<Carta> | null>(null);
    const [isCartaDialogOpen, setIsCartaDialogOpen] = React.useState(false);
    const [isElementDialogOpen, setIsElementDialogOpen] = React.useState(false);
    const [selectedCartaId, setSelectedCartaId] = React.useState<string | null>(null);
    const [newElementData, setNewElementData] = React.useState<{ id_elemento: string }>({ id_elemento: '' });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [itemsPerPage] = React.useState(10);
    
    // WhatsApp config state
    const [whatsAppConfig, setWhatsAppConfig] = React.useState<CartaWhatsAppConfig>({
        disponibleWhatsApp: true,
        permitirVoz: true,
        mensajeBienvenida: '¡Hola! Bienvenido a nuestro restaurante. ¿Qué te gustaría pedir hoy?',
        horarioInicio: '12:00',
        horarioFin: '23:00' 
    });
    
    // Reset pagination on search
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Listen for global event to open add dialog
    React.useEffect(() => {
        const handleOpenAdd = () => addCarta();
        window.addEventListener('open-add-cartas', handleOpenAdd);
        return () => window.removeEventListener('open-add-cartas', handleOpenAdd);
    }, []);

    // --- Helpers Local State ---

    const addCarta = () => {
        const newCarta: Carta = {
            id: `carta-${Date.now()}`,
            nombre_carta: 'Nueva Carta',
            descripcion_carta: '',
            activa: false,
            elementos_carta: [],
            icon: 'BookOpen',
            color: 'blue-400'
        };
        setCartas(prev => [...prev, newCarta]);
        setEditingCarta(newCarta);
        setIsCartaDialogOpen(true);
    };

    const updateCarta = (id: string, updates: Partial<Carta>) => {
        setCartas(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const removeCarta = (id: string) => {
        setCartas(prev => prev.filter(c => c.id !== id));
        toast({
            variant: "destructive",
            title: "Carta Eliminada",
            description: "La carta ha sido eliminada correctamente."
        });
    };

    const addElementToCarta = () => {
        if (selectedCartaId && newElementData.id_elemento) {
            const carta = cartas.find(c => c.id === selectedCartaId);
            if (carta) {
                const newElement: ElementoCarta = {
                    id: `el-${Date.now()}`,
                    tipo: 'categoria',
                    id_elemento: newElementData.id_elemento
                };
                updateCarta(selectedCartaId, { elementos_carta: [...carta.elementos_carta, newElement] });
                setIsElementDialogOpen(false);
                setNewElementData({ id_elemento: '' });
                toast({
                    title: "Categoría Añadida",
                    description: "Se ha añadido la categoría a la carta."
                });
            }
        }
    };

    const removeElementFromCarta = (cartaId: string, elementId: string) => {
        const carta = cartas.find(c => c.id === cartaId);
        if (carta) {
            updateCarta(cartaId, { elementos_carta: carta.elementos_carta.filter(el => el.id !== elementId) });
        }
    };

    const handleSaveCarta = () => {
        if (editingCarta && editingCarta.id) {
            updateCarta(editingCarta.id, editingCarta);
            setIsCartaDialogOpen(false);
            setEditingCarta(null);
            toast({
                title: "Carta Guardada",
                description: "Los cambios se han guardado correctamente."
            });
        }
    };

    const toggleCartaStatus = (id: string, status: boolean) => {
        updateCarta(id, { activa: status });
        toast({
            title: status ? "Carta Activada" : "Carta Desactivada",
            description: `Se ha actualizado el estado de la carta.`
        });
    };

    const filteredCartas = cartas.filter(carta => 
        carta.nombre_carta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carta.descripcion_carta?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCartas.length / itemsPerPage);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const currentCartas = filteredCartas.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead width="80px" align="center">Img</TableHead>
                            <TableHead>Carta</TableHead>
                            <TableHead visibility="hidden-mobile">Descripción</TableHead>
                            <TableHead align="center">Estado</TableHead>
                            <TableHead align="right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentCartas.map((carta) => {
                            const Icon = iconMap[carta.icon || 'BookOpen'] || BookOpen;
                            
                            return (
                                <TableRow key={carta.id}>
                                    <TableCell align="center">
                                        <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-md bg-muted/20" style={{ color: `var(--${carta.color || 'blue-400'})` }}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </TableCell>
                                    <TableCell variant="medium">{carta.nombre_carta}</TableCell>
                                    <TableCell visibility="hidden-mobile">
                                        <span className="text-muted-foreground line-clamp-1">{carta.descripcion_carta || 'Sin descripción'}</span>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Badge variant={carta.activa ? "success" : "destructive"}>
                                            {carta.activa ? "Activa" : "Inactiva"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button 
                                                variant="secondary" 
                                                size="md" 
                                                onClick={() => { setEditingCarta(carta); setIsCartaDialogOpen(true); }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="secondary" 
                                                size="md" 
                                                onClick={() => toggleCartaStatus(carta.id, !carta.activa)}
                                            >
                                                {carta.activa ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost-destructive" size="md">
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Eliminar carta?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Se eliminará la carta "{carta.nombre_carta}" permanentemente. Esta acción no se puede deshacer.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className={buttonVariants({ variant: 'outline', size: 'md' })}>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => removeCarta(carta.id)} 
                                                            className={buttonVariants({ variant: 'destructive', size: 'md' })}
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {currentCartas.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <BookOpen className="h-12 w-12 opacity-20" />
                            <p>{searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay cartas disponibles"}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                    <Button 
                        variant="outline" 
                        size="md" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Anterior
                    </Button>
                    <TextSM className="font-medium">
                        Página {currentPage} de {totalPages}
                    </TextSM>
                    <Button 
                        variant="outline" 
                        size="md" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            )}

            <CartasDialog
                isOpen={isCartaDialogOpen}
                onOpenChange={setIsCartaDialogOpen}
                carta={editingCarta}
                onSave={handleSaveCarta}
                whatsAppConfig={whatsAppConfig}
                onWhatsAppConfigChange={setWhatsAppConfig}
                allCategories={mockCategories}
            />

            <Dialog open={isElementDialogOpen} onOpenChange={setIsElementDialogOpen}>
                <DialogWindow size="md">
                    <DialogHeader
                        icon={PlusCircle}
                        title="Añadir Contenido"
                        description="Selecciona una categoría de productos para añadir a la carta."
                    />
                    <DialogContent>
                        <div className="space-y-4">
                            <ActionTile
                                icon={BookOpen}
                                title="Seleccionar Categoría"
                                description="Elige la sección de productos a mostrar"
                                rightContentType="custom"
                                rightContentClassName="min-w-[200px]"
                                customContent={
                                    <Select value={newElementData.id_elemento} onValueChange={(val) => setNewElementData(prev => ({ ...prev, id_elemento: val }))}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Elige una categoría..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockCategories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.nombre_categoria}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                }
                            />
                        </div>
                    </DialogContent>
                    <DialogFooter 
                        onCancel={() => setIsElementDialogOpen(false)}
                        onConfirm={addElementToCarta}
                        confirmText="Añadir Contenido"
                        confirmDisabled={!newElementData.id_elemento}
                    />
                </DialogWindow>
            </Dialog>
        </div>
    );
}
