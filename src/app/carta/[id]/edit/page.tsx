'use client';
import { H3 } from '@/components/ui/typography';


import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Trash, Edit, Package, Layers, Image as ImageIcon, DollarSign, Percent, Info, Save, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardHeader, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/layout/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { mockCartas, mockCategories, mockMenuCombos, Carta, MenuCombo, Category, ElementoCarta } from '@/data/mock-data';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';

function EditCartaContent({ cartaId }: { cartaId: string }) {
    const router = useRouter();
    const { toast } = useToast();

    const categories = mockCategories;
    const menuCombos = mockMenuCombos;

    const [activeCarta, setActiveCarta] = React.useState<Carta | null>(null);

    React.useEffect(() => {
        const carta = mockCartas.find(c => c.id === cartaId);
        if (carta) {
            setActiveCarta(JSON.parse(JSON.stringify(carta))); // Deep copy to avoid direct state mutation
        }
    }, [cartaId]);

    if (!activeCarta) {
        return <div>Cargando carta...</div>;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setActiveCarta(prev => prev ? { ...prev, [id]: value } : null);
    };

    const handleSwitchChange = (checked: boolean) => {
        setActiveCarta(prev => prev ? { ...prev, activa: checked } : null);
    }

    const handleSave = () => {
        if (activeCarta) {
            // Update local mock data (simulation)
            const index = mockCartas.findIndex(c => c.id === cartaId);
            if (index !== -1) {
                mockCartas[index] = activeCarta;
            }
            toast({
                title: "Carta Guardada",
                description: `La carta "${activeCarta.nombre_carta}" se ha guardado correctamente.` });
            router.push('/carta');
        }
    };

    const handleAddElement = (tipo: 'categoria' | 'menu', id_elemento: string) => {
        setActiveCarta(prev => {
            if (!prev) return null;
            const newElement: ElementoCarta = {
                id: `elem-${Date.now()}`,
                tipo,
                id_elemento,
                orden: prev.elementos_carta.length
            };
            return {
                ...prev,
                elementos_carta: [...prev.elementos_carta, newElement]
            };
        });
        toast({
            title: "Elemento Añadido",
            description: `El elemento se ha añadido a la carta.` });
    };

    const handleRemoveElement = (elementId: string) => {
        setActiveCarta(prev => {
            if (!prev) return null;
            return {
                ...prev,
                elementos_carta: prev.elementos_carta.filter(e => e.id !== elementId)
            };
        });
        toast({
            variant: "destructive",
            title: "Elemento Eliminado",
            description: `El elemento se ha quitado de la carta.` });
    }

    const handleReorderElement = (elementId: string, direction: 'up' | 'down') => {
        setActiveCarta(prev => {
            if (!prev) return null;
            const elements = [...prev.elementos_carta];
            const index = elements.findIndex(e => e.id === elementId);
            if (index === -1) return prev;

            if (direction === 'up' && index > 0) {
                [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
            } else if (direction === 'down' && index < elements.length - 1) {
                [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
            }

            // Reassign order
            const reordered = elements.map((el, idx) => ({ ...el, orden: idx }));

            return {
                ...prev,
                elementos_carta: reordered
            };
        });
    }

    const getElementName = (el: ElementoCarta) => {
        if (el.tipo === 'categoria') {
            return categories.find(c => c.id === el.id_elemento)?.nombre_categoria || 'Categoría no encontrada';
        }
        if (el.tipo === 'menu') {
            return menuCombos.find(m => m.id === el.id_elemento)?.nombre_carta || 'Menú no encontrado';
        }
        return 'Elemento desconocido';
    }

    return (
        <div className="flex flex-1 flex-col h-full">
            <PageHeader title={<>Gestionar Carta: &quot;{activeCarta.nombre_carta}&quot;</>} />
            <PageContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    {/* Bento Grid Layout */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Carta Details - Large Card */}
                        <Card className="md:col-span-2 flex-col">
                            <CardHeader>
                                <H3 className="text-base font-bold text-muted-foreground">Detalles de la Carta</H3>
                                <CardDescription>Información general de la carta. Haz clic en guardar en las acciones rápidas para conservar los cambios.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-grow">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre_carta"><Info className="inline-block mr-2 h-4 w-4" />Nombre de la Carta</Label>
                                        <Input id="nombre_carta" value={activeCarta.nombre_carta} onChange={handleInputChange} />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-8">
                                        <Switch id="activa" checked={activeCarta.activa} onCheckedChange={handleSwitchChange} />
                                        <Label htmlFor="activa">Carta Activa (visible para clientes)</Label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="descripcion_carta"><Edit className="inline-block mr-2 h-4 w-4" />Descripción</Label>
                                    <Textarea id="descripcion_carta" value={activeCarta.descripcion_carta} onChange={handleInputChange} placeholder="Una breve descripción de lo que los clientes pueden encontrar en esta carta." />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Carta Content */}
                        <Card className="flex-col">
                            <CardHeader>
                                <H3 className="text-base font-bold text-muted-foreground">Contenido de la Carta</H3>
                                <CardDescription>Organiza el orden de los elementos.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3 min-h-[200px] max-h-80 overflow-y-auto custom-scrollbar pr-2 border rounded-lg p-4 bg-background/50">
                                {activeCarta.elementos_carta.map((el, index) => (
                                    <div key={el.id} className="flex items-center justify-between p-2 border rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            {el.tipo === 'categoria' ? <Layers className="h-5 w-5 text-purple-500" /> : <Package className="h-5 w-5 text-blue-500" />}
                                            <p className="font-semibold">{getElementName(el)}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="md" className="h-8 w-8" onClick={() => handleReorderElement(el.id, 'up')} disabled={index === 0}>
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="md" className="h-8 w-8" onClick={() => handleReorderElement(el.id, 'down')} disabled={index === activeCarta.elementos_carta.length - 1}>
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="md" className="h-8 w-8 hover:bg-destructive/10" onClick={() => handleRemoveElement(el.id)}>
                                                <Trash className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {activeCarta.elementos_carta.length === 0 && (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-sm text-center text-muted-foreground">Esta carta todavía no tiene contenido.<br />Añade categorías desde la derecha.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Available Categories */}
                        <Card className="flex-col">
                            <CardHeader>
                                <H3 className="text-base font-bold text-muted-foreground">Categorías Disponibles</H3>
                                <CardDescription>Arrastra o añade categorías a tu carta.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 flex-grow min-h-[200px] max-h-80 overflow-y-auto custom-scrollbar pr-2">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-2 border rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Layers className="h-5 w-5 text-purple-500" />
                                            <p className="font-semibold">{cat.nombre_categoria}</p>
                                        </div>
                                        <Button size="sm" onClick={() => handleAddElement('categoria', cat.id)}>Añadir</Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </PageContent>
            <footer className="p-4 md:p-6 pt-0 sticky bottom-0">
                <Card className="border-t bg-background/80 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                        <Button variant="outline" onClick={() => router.push('/carta')}>
                            <ArrowLeft className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Volver a Gestión de Cartas</span>
                        </Button>
                        <Button onClick={handleSave} size="md" startIcon={<Save className="h-4 w-4" />}>Guardar Carta</Button>
                    </div>
                </Card>
            </footer>
        </div>
    );
}

export default function EditCartaPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return (
        <React.Suspense fallback={<div>Cargando...</div>}>
            <EditCartaContent cartaId={id} />
        </React.Suspense>
    )
}
