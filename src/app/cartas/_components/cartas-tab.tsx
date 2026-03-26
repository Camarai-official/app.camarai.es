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
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { 
    mockCategories, 
    mockProducts,
    type ElementoCarta 
} from '@/data/mock-data';
import { type Carta } from '@/types/menu';
import { useEstablishments } from '@/hooks/useEstablishments';

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogWindow, 
    DialogFooter 
} from '@/components/layout/dialog';

import { CartasDialog, type CartaWhatsAppConfig } from '@/components/dialogs/cartas-cartas-dialog';
import { CartaHierarchyManager } from '@/components/carta-hierarchy-manager';

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
    const { activeEstablishment } = useEstablishments();
    
    // Obtener el establecimiento de Convex usando el ID local
    const convexEstablishment = useQuery(api.establishmentsHelpers.getEstablishmentByLocalId, { 
        localId: activeEstablishment?.id || 'camarai' 
    });
    
    // Obtener las cartas del establecimiento
    const cartas = useQuery(api.menu.getCartas, { 
        establishmentId: convexEstablishment?._id
    }) || [];
    
    const createCarta = useMutation(api.menu.createCarta);
    const updateCartaMutation = useMutation(api.menu.updateCarta);
    const deleteCartaMutation = useMutation(api.menu.deleteCarta);
    const toggleCartaStatusMutation = useMutation(api.menu.toggleCartaStatus);
    const addElementToCartaMutation = useMutation(api.menu.addElementToCarta);
    const removeElementFromCartaMutation = useMutation(api.menu.removeElementFromCarta);

    // Convert Convex data to frontend format
    const formattedCartas = React.useMemo(() => {
        return cartas.map(carta => ({
            id: carta._id,
            nombre_carta: carta.name,
            descripcion_carta: carta.description || '',
            activa: carta.active,
            icon: carta.icon || 'BookOpen',
            color: carta.color || 'blue-400',
            elementos_carta: carta.elementos_carta || [],
            whatsapp_enabled: carta.whatsapp_enabled,
            whatsapp_voice_enabled: carta.whatsapp_voice_enabled,
            whatsapp_welcome_message: carta.whatsapp_welcome_message,
            whatsapp_schedule_start: carta.whatsapp_schedule_start,
            whatsapp_schedule_end: carta.whatsapp_schedule_end
        }));
    }, [cartas]);
    
    const [editingCarta, setEditingCarta] = React.useState<any>(null);
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

    // --- Helpers Local State ---
    
    const addCarta = () => {
        const newCarta = {
            nombre_carta: 'Nueva Carta',
            descripcion_carta: '',
            activa: false,
            elementos_carta: [],
            icon: 'BookOpen',
            color: 'blue-400'
        };
        setEditingCarta(newCarta);
        setIsCartaDialogOpen(true);
    };

    // Listen for global event to open add dialog
    React.useEffect(() => {
        const handleOpenAdd = () => addCarta();
        window.addEventListener('open-add-cartas', handleOpenAdd);
        return () => window.removeEventListener('open-add-cartas', handleOpenAdd);
    }, []);

    // Loading states - después de todos los hooks
    if (convexEstablishment === undefined) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Cargando establecimiento...</div>
            </div>
        );
    }

    if (!convexEstablishment) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">No se encontró el establecimiento</div>
            </div>
        );
    }

    const removeCarta = async (id: string) => {
        try {
            await deleteCartaMutation({ cartaId: id as Id<'menu'> });
            toast({
                variant: "destructive",
                title: "Carta Eliminada",
                description: "La carta ha sido eliminada correctamente."
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar la carta."
            });
        }
    };

    const addElementToCarta = async () => {
        if (selectedCartaId && newElementData.id_elemento) {
            try {
                await addElementToCartaMutation({ 
                    cartaId: selectedCartaId as Id<'menu'>,
                    elementType: 'category',
                    elementId: newElementData.id_elemento
                });
                setIsElementDialogOpen(false);
                setNewElementData({ id_elemento: '' });
                toast({
                    title: "Categoría Añadida",
                    description: "Se ha añadido la categoría a la carta."
                });
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo añadir la categoría."
                });
            }
        }
    };

    const addCategoryToCarta = async (cartaId: string, categoryId: string) => {
        try {
            await addElementToCartaMutation({ 
                cartaId: cartaId as Id<'menu'>,
                elementType: 'category',
                elementId: categoryId
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo añadir la categoría."
            });
        }
    };

    const removeElementFromCarta = async (cartaId: string, elementId: string) => {
        try {
            await removeElementFromCartaMutation({ elementId: elementId as Id<'menu_sections'> });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar el elemento."
            });
        }
    };

    const handleSaveCarta = async (cartaData: Partial<Carta>) => {
        if (cartaData && convexEstablishment) {
            console.log("Saving carta with data:", cartaData); // Debug log
            try {
                if (cartaData.id) {
                    // Update existing carta
                    await updateCartaMutation({
                        cartaId: cartaData.id as Id<'menu'>,
                        name: cartaData.nombre_carta,
                        description: cartaData.descripcion_carta,
                        active: cartaData.activa,
                        icon: cartaData.icon,
                        color: cartaData.color,
                        whatsappEnabled: cartaData.whatsapp_enabled ?? whatsAppConfig.disponibleWhatsApp,
                        whatsappVoiceEnabled: cartaData.whatsapp_voice_enabled ?? whatsAppConfig.permitirVoz,
                        whatsappWelcomeMessage: cartaData.whatsapp_welcome_message ?? whatsAppConfig.mensajeBienvenida,
                        whatsappScheduleStart: cartaData.whatsapp_schedule_start ?? whatsAppConfig.horarioInicio,
                        whatsappScheduleEnd: cartaData.whatsapp_schedule_end ?? whatsAppConfig.horarioFin
                    });
                    toast({
                        title: "Carta Guardada",
                        description: "Los cambios se han guardado correctamente."
                    });
                } else {
                    // Create new carta
                    console.log("Creating new carta with establishmentId:", convexEstablishment._id); // Debug log
                    await createCarta({
                        establishmentId: convexEstablishment._id,
                        name: cartaData.nombre_carta,
                        description: cartaData.descripcion_carta,
                        icon: cartaData.icon,
                        color: cartaData.color,
                        active: cartaData.activa, // Pasar el estado del usuario
                        whatsappEnabled: whatsAppConfig.disponibleWhatsApp,
                        whatsappVoiceEnabled: whatsAppConfig.permitirVoz,
                        whatsappWelcomeMessage: whatsAppConfig.mensajeBienvenida,
                        whatsappScheduleStart: whatsAppConfig.horarioInicio,
                        whatsappScheduleEnd: whatsAppConfig.horarioFin
                    });
                    toast({
                        title: "Carta Creada",
                        description: "La nueva carta se ha creado correctamente."
                    });
                }
                setIsCartaDialogOpen(false);
                setEditingCarta(null);
            } catch (error) {
                console.error("Error saving carta:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo guardar la carta."
                });
            }
        } else {
            console.log("Cannot save carta - cartaData:", cartaData, "convexEstablishment:", convexEstablishment); // Debug log
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se puede guardar la carta sin un establecimiento válido."
            });
        }
    };

    const toggleCartaStatus = async (id: string, status: boolean) => {
        try {
            await toggleCartaStatusMutation({ cartaId: id as Id<'menu'>, active: status });
            toast({
                title: status ? "Carta Activada" : "Carta Desactivada",
                description: `Se ha actualizado el estado de la carta.`
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo actualizar el estado de la carta."
            });
        }
    };

    const filteredCartas = formattedCartas.filter(carta => 
        carta.nombre_carta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carta.descripcion_carta?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCartas.length / itemsPerPage);
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const currentCartas = filteredCartas.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

    return (
        <div className="space-y-6">
            {/* Show table only when no carta is selected */}
            {!selectedCartaId && (
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
                                                    variant="outline" 
                                                    size="md" 
                                                    onClick={() => setSelectedCartaId(carta.id)}
                                                >
                                                    <BookOpen className="h-4 w-4 mr-2" />
                                                    Ver
                                                </Button>
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
            )}

            {/* Pagination Controls - only show when not viewing a specific carta */}
            {!selectedCartaId && totalPages > 1 && (
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

            {/* Carta Hierarchy View */}
            {selectedCartaId && (() => {
                const selectedCarta = cartas.find(c => c.id === selectedCartaId);
                if (!selectedCarta) return null;
                
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setSelectedCartaId(null)}
                                >
                                    ← Volver a la lista
                                </Button>
                                <h2 className="text-xl font-semibold">Gestionar: {selectedCarta.nombre_carta}</h2>
                            </div>
                        </div>
                        
                        <CartaHierarchyManager
                            carta={selectedCarta}
                            allCategories={mockCategories}
                            allProducts={mockProducts}
                            onUpdateCarta={async (updatedCarta) => {
                                try {
                                    await updateCartaMutation({
                                        cartaId: selectedCartaId as Id<'menu'>,
                                        name: updatedCarta.nombre_carta,
                                        description: updatedCarta.descripcion_carta,
                                        active: updatedCarta.activa,
                                        icon: updatedCarta.icon,
                                        color: updatedCarta.color
                                    });
                                    toast({
                                        title: "Carta Actualizada",
                                        description: "Los cambios se han guardado correctamente."
                                    });
                                } catch (error) {
                                    toast({
                                        variant: "destructive",
                                        title: "Error",
                                        description: "No se pudo actualizar la carta."
                                    });
                                }
                            }}
                            onAddCategory={(categoryId) => addCategoryToCarta(selectedCartaId, categoryId)}
                            onRemoveElement={(elementId) => removeElementFromCarta(selectedCartaId, elementId)}
                            onEditCarta={() => { setEditingCarta(selectedCarta); setIsCartaDialogOpen(true); }}
                        />
                    </div>
                );
            })()}

            <CartasDialog
                key={editingCarta?.id || 'new'}
                isOpen={isCartaDialogOpen}
                onOpenChange={setIsCartaDialogOpen}
                carta={editingCarta}
                onSave={handleSaveCarta}
                whatsAppConfig={whatsAppConfig}
                onWhatsAppConfigChange={setWhatsAppConfig}
                allCategories={mockCategories}
                isCreating={!editingCarta?.id}
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
