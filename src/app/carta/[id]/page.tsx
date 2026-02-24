'use client';
import { H3 } from '@/components/ui/typography';


import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Trash, Edit, Package, Layers, Image as ImageIcon, DollarSign, Percent, Info, Save, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogFooter, DialogClose } from '@/components/layout/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { mockMenuCombos, mockProducts, mockCategories, mockTaxes, MenuCombo, Product, Category, Tax, ElementoMenuCombo } from '@/data/mock-data';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';

const emptyElement: Omit<ElementoMenuCombo, 'id' | 'tipo'> = {
    id_seleccion: '',
    cantidad: 1,
    max_seleccion: 1,
    descripcion_opcion: ''
};

function AddElementDialog({ menuId, type, open, onOpenChange, onAdd }: { menuId: string, type: 'producto' | 'categoria', open: boolean, onOpenChange: (open: boolean) => void, onAdd: (element: ElementoMenuCombo) => void }) {
    // Local mock data usage
    const products = mockProducts;
    const categories = mockCategories;

    const [element, setElement] = React.useState(emptyElement);

    const handleSave = () => {
        if (element.id_seleccion) {
            const newItem: ElementoMenuCombo = {
                ...element,
                tipo: type,
                id: `elem - ${Date.now()} `
            };
            onAdd(newItem);
            onOpenChange(false);
            setElement(emptyElement);
        }
    };

    const title = type === 'producto' ? 'Añadir Producto al Menú' : 'Añadir Opción de Categoría al Menú';
    const description = type === 'producto' ? 'Selecciona un producto específico para incluir en el menú.' : 'Permite al cliente elegir un producto de una categoría.';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader
                    icon={type === 'producto' ? Package : Layers}
                    title={title}
                    description={description}
                />
                <div className="py-4 space-y-4">
                    {type === 'producto' ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="product-select">Producto</Label>
                                <Select onValueChange={(value) => setElement(prev => ({ ...prev, id_seleccion: value }))}>
                                    <SelectTrigger id="product-select"><SelectValue placeholder="Selecciona un producto..." /></SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre_producto}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-quantity">Cantidad</Label>
                                <Input id="product-quantity" type="number" value={element.cantidad} onChange={(e) => setElement(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))} min="1" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="category-select">Categoría</Label>
                                <Select onValueChange={(value) => setElement(prev => ({ ...prev, id_seleccion: value }))}>
                                    <SelectTrigger id="category-select"><SelectValue placeholder="Selecciona una categoría..." /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre_categoria}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category-max-selection">Nº Máximo de Selecciones</Label>
                                <Input id="category-max-selection" type="number" value={element.max_seleccion} onChange={(e) => setElement(prev => ({ ...prev, max_seleccion: parseInt(e.target.value) || 1 }))} min="1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category-description">Descripción de la Opción</Label>
                                <Input id="category-description" placeholder="Ej: Elige tu plato principal" value={element.descripcion_opcion} onChange={(e) => setElement(prev => ({ ...prev, descripcion_opcion: e.target.value }))} />
                            </div>
                        </>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Cancelar</Button></DialogClose>
                    <Button onClick={handleSave} startIcon={<PlusCircle />}>Añadir Elemento</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function MenuDetailContent({ menuId }: { menuId: string }) {
    const router = useRouter();
    const { toast } = useToast();

    // Direct mock data imports
    const products = mockProducts;
    const categories = mockCategories;
    const taxes = mockTaxes;

    const [activeMenu, setActiveMenu] = React.useState<MenuCombo | null>(null);
    const [isAddProductOpen, setIsAddProductOpen] = React.useState(false);
    const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false);

    React.useEffect(() => {
        // Find menu in mock data
        const menu = mockMenuCombos.find(m => m.id === menuId);
        if (menu) {
            setActiveMenu(JSON.parse(JSON.stringify(menu)));
        }
    }, [menuId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setActiveMenu(prev => prev ? { ...prev, [id]: value } : null);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setActiveMenu(prev => prev ? { ...prev, [id]: parseFloat(value) || 0 } : null);
    };

    const handleSwitchChange = (checked: boolean) => {
        setActiveMenu(prev => prev ? { ...prev, disponible: checked } : null);
    }

    const handleSelectChange = (id: string, value: string) => {
        setActiveMenu(prev => prev ? { ...prev, [id]: value } : null);
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setActiveMenu(prev => prev ? { ...prev, url_imagen: reader.result as string } : null);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const costo_escandallo_menu = React.useMemo(() => {
        if (!activeMenu) return 0;

        return activeMenu.elementos_menu.reduce((totalCost, element) => {
            if (element.tipo === 'producto') {
                const product = products.find(p => p.id === element.id_seleccion);
                const productCost = product?.costo_escandallo_calculado || 0;
                return totalCost + (productCost * element.cantidad);
            }

            if (element.tipo === 'categoria') {
                const productsInCategory = products.filter(p => p.id_categoria === element.id_seleccion);
                if (productsInCategory.length === 0) return totalCost;

                const totalCostOfProductsInCategory = productsInCategory.reduce((sum, p) => sum + (p.costo_escandallo_calculado || 0), 0);
                const averageCost = totalCostOfProductsInCategory / productsInCategory.length;
                return totalCost + averageCost;
            }

            return totalCost;
        }, 0);
    }, [activeMenu, products]);

    if (!activeMenu) {
        return <div>Cargando menú...</div>;
    }

    const margen_beneficio_menu = activeMenu ? activeMenu.precio_carta - costo_escandallo_menu : 0;

    const handleSave = () => {
        if (activeMenu) {
            // In a real app, this would make an API call.
            // For now we just simulate success with a toast.
            toast({
                title: "Menú guardado",
                description: `El menú ${activeMenu.nombre_carta} ha sido actualizado correctamente.`
            });
            router.push('/carta');
        }
    };

    const getElementName = (el: ElementoMenuCombo) => {
        if (el.tipo === 'producto') {
            return products.find(p => p.id === el.id_seleccion)?.nombre_producto || 'Producto no encontrado';
        }
        return categories.find(c => c.id === el.id_seleccion)?.nombre_categoria || 'Categoría no encontrada';
    }

    const handleAddElement = (element: ElementoMenuCombo) => {
        setActiveMenu(prev => {
            if (!prev) return null;
            return {
                ...prev,
                elementos_menu: [...prev.elementos_menu, element]
            };
        });
    };

    const removeElementFromMenuCombo = (menuId: string, elementId: string) => {
        setActiveMenu(prev => {
            if (!prev) return null;
            return {
                ...prev,
                elementos_menu: prev.elementos_menu.filter(e => e.id !== elementId)
            };
        });
    };

    return (
        <div className="flex flex-1 flex-col h-full">
            <Link href="/carta">
                <PageHeader
                    className="cursor-pointer"
                    title={<>Gestionar Menú/Combo: &quot;{activeMenu.nombre_carta}&quot;</>}
                />
            </Link>
            <PageContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    {/* Left Column: Menu Details & Profitability */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <Card className="flex-col">
                            <CardHeader>
                                <H3 className="text-base font-bold text-muted-foreground">Detalles del Menú</H3>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre_carta"><Info className="inline-block mr-2" />Nombre del Menú</Label>
                                    <Input id="nombre_carta" value={activeMenu.nombre_carta} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="descripcion"><Edit className="inline-block mr-2" />Descripción</Label>
                                    <Textarea id="descripcion" value={activeMenu.descripcion} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="precio_carta"><DollarSign className="inline-block mr-2" />Precio del Menú (€)</Label>
                                    <Input id="precio_carta" type="number" value={activeMenu.precio_carta} onChange={handleNumberChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="id_impuesto"><Percent className="inline-block mr-2" />Impuesto Aplicable</Label>
                                    <Select value={activeMenu.id_impuesto} onValueChange={(value) => handleSelectChange('id_impuesto', value)}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona un impuesto..." /></SelectTrigger>
                                        <SelectContent>
                                            {taxes.map(tax => <SelectItem key={tax.id} value={tax.id}>{tax.nombre_impuesto}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="url_imagen"><ImageIcon className="inline-block mr-2" />Imagen</Label>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="relative w-32 h-32 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                                            {activeMenu.url_imagen ? (
                                                <Image src={activeMenu.url_imagen} alt={activeMenu.nombre_carta} fill className="object-cover" data-ai-hint="menu image" />
                                            ) : (
                                                <ImageIcon className="h-10 w-10 text-muted-foreground opacity-40" />
                                            )}
                                        </div>
                                        <Input type="file" onChange={handleImageChange} accept="image/*" className="text-xs" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch id="disponible" checked={activeMenu.disponible} onCheckedChange={handleSwitchChange} />
                                    <Label htmlFor="disponible">Disponible para la venta</Label>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <H3 className="flex items-center gap-2 text-base font-bold text-muted-foreground">
                                    <TrendingUp className="h-5 w-5" />
                                    Rentabilidad del Menú (Calculada)
                                </H3>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Precio de Venta:</span>
                                    <span className="font-medium">€{activeMenu.precio_carta.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Coste Estimado (Escandallo):</span>
                                    <span className="font-medium">€{costo_escandallo_menu.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-primary border-t pt-2 mt-2">
                                    <span>Margen de Beneficio Estimado:</span>
                                    <span>€{margen_beneficio_menu.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Menu Elements */}
                    <Card className="lg:col-span-2 flex-col">
                        <CardHeader>
                            <H3 className="text-base font-bold text-muted-foreground">Elementos del Menú</H3>
                            <CardDescription>Añade productos individuales o categorías de las que el cliente podrá elegir.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-2">
                            {activeMenu.elementos_menu.map(el => (
                                <div key={el.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        {el.tipo === 'producto' ? <Package className="h-5 w-5 text-blue-500" /> : <Layers className="h-5 w-5 text-purple-500" />}
                                        <div>
                                            <p className="font-semibold">{getElementName(el)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {el.tipo === 'producto' ? `Cantidad: ${el.cantidad} ` : `Elegir: ${el.max_seleccion} de la categoría`}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="ghost-destructive" size="icon" onClick={() => removeElementFromMenuCombo(menuId, el.id)} startIcon={<Trash />} />
                                </div>
                            ))}
                            {activeMenu.elementos_menu.length === 0 && (
                                <p className="text-sm text-center text-muted-foreground py-10">Este menú todavía no tiene elementos.</p>
                            )}
                        </CardContent>
                        <CardFooter className="flex-col sm:flex-row justify-end gap-2 border-t pt-6">
                            <Button variant="outline" onClick={() => setIsAddProductOpen(true)} startIcon={<PlusCircle />}>Añadir Producto</Button>
                            <Button variant="outline" onClick={() => setIsAddCategoryOpen(true)} startIcon={<PlusCircle />}>Añadir Categoría</Button>
                        </CardFooter>
                    </Card>
                </div>
                <AddElementDialog menuId={menuId} type="producto" open={isAddProductOpen} onOpenChange={setIsAddProductOpen} onAdd={handleAddElement} />
                <AddElementDialog menuId={menuId} type="categoria" open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen} onAdd={handleAddElement} />
            </PageContent>
            <footer className="p-4 md:p-6 pt-0 sticky bottom-0">
                <Card className="border-t">
                    <div className="flex justify-end">
                        <Button onClick={handleSave} size="md" startIcon={<Save />}>Guardar Cambios en el Menú</Button>
                    </div>
                </Card>
            </footer>
        </div>
    );
}

export default function MenuDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    return (
        <React.Suspense fallback={<div className="p-4">Cargando menú...</div>}>
            <MenuDetailContent menuId={id} />
        </React.Suspense>
    )
}

