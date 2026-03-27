'use client';

import * as React from 'react';
import { 
    ChevronDown, 
    ChevronRight, 
    PlusCircle, 
    Edit, 
    Trash, 
    GripVertical,
    Package,
    Layers,
    BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { TextSM } from '@/components/ui/typography';
import { useToast } from '@/hooks/use-toast';
import type { Carta, ElementoCarta } from '@/types/menu';
import type { Category, Product } from '@/types/catalog';

interface CartaHierarchyManagerProps {
    carta: Carta;
    allCategories: Category[];
    allProducts: Product[];
    onUpdateCarta: (carta: Carta) => void;
    onAddCategory: (categoryId: string) => void;
    onRemoveElement: (elementId: string) => void;
    onEditCarta: () => void;
}

interface CategoryNodeProps {
    category: Category;
    products: Product[];
    cartaElement: ElementoCarta;
    onRemove: () => void;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({ category, products, cartaElement, onRemove }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);
    
    return (
        <div className="border rounded-lg bg-card">
            <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Layers className="h-4 w-4 text-blue-500" />
                    <div>
                        <div className="font-medium">{category.nombre_categoria}</div>
                        <TextSM className="text-muted-foreground">
                            {products.length} productos
                        </TextSM>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                        Categoría
                    </Badge>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost-destructive" size="sm">
                                <Trash className="h-3 w-3" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar categoría de la carta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Se eliminará "{category.nombre_categoria}" de esta carta. Los productos no se eliminarán del catálogo.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={onRemove}>Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            
            {isExpanded && (
                <div className="border-t bg-muted/20">
                    {products.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <TextSM>Esta categoría no tiene productos disponibles</TextSM>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {products.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3 ml-9">
                                        <Package className="h-4 w-4 text-green-500" />
                                        <div>
                                            <div className="font-medium text-sm">{product.nombre_producto}</div>
                                            <TextSM className="text-muted-foreground">
                                                €{product.precio_venta.toFixed(2)}
                                            </TextSM>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={product.disponible ? "success" : "destructive"} className="text-xs">
                                            {product.disponible ? "Disponible" : "No disponible"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const CartaHierarchyManager: React.FC<CartaHierarchyManagerProps> = ({
    carta,
    allCategories,
    allProducts,
    onUpdateCarta,
    onAddCategory,
    onRemoveElement,
    onEditCarta
}) => {
    const { toast } = useToast();
    
    // Get categories that are in this carta
    const cartaCategories = carta.elementos_carta
        .filter(element => element.tipo === 'categoria')
        .map(element => {
            const category = allCategories.find(cat => cat.id === element.id_elemento);
            return {
                category,
                element,
                products: category ? allProducts.filter(product => product.id_categoria === category.id) : []
            };
        })
        .filter(item => item.category !== undefined);
    
    // Get categories that are NOT in this carta
    const availableCategories = allCategories.filter(category => 
        !carta.elementos_carta.some(element => 
            element.tipo === 'categoria' && element.id_elemento === category.id
        )
    );
    
    const handleAddCategory = (categoryId: string) => {
        onAddCategory(categoryId);
        toast({
            title: "Categoría añadida",
            description: "La categoría se ha añadido a la carta correctamente."
        });
    };
    
    return (
        <div className="space-y-6">
            {/* Carta Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-muted/20">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{carta.nombre_carta}</CardTitle>
                                <TextSM className="text-muted-foreground">{carta.descripcion_carta}</TextSM>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={carta.activa ? "success" : "destructive"}>
                                {carta.activa ? "Activa" : "Inactiva"}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={onEditCarta}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Carta
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>
            
            {/* Categories in Carta */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Categorías en esta carta</h3>
                    <Badge variant="outline">
                        {cartaCategories.length} categorías
                    </Badge>
                </div>
                
                {cartaCategories.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Sin categorías</h3>
                            <TextSM className="text-muted-foreground mb-4">
                                Esta carta no tiene categorías asignadas. Añade categorías para empezar a organizar tu menú.
                            </TextSM>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {cartaCategories.map(({ category, element, products }) => (
                            <CategoryNode
                                key={element.id}
                                category={category!}
                                products={products}
                                cartaElement={element}
                                onRemove={() => onRemoveElement(element.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {/* Available Categories */}
            {availableCategories.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Categorías disponibles</h3>
                        <Badge variant="outline">
                            {availableCategories.length} disponibles
                        </Badge>
                    </div>
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="grid gap-2">
                                {availableCategories.map(category => {
                                    const productCount = allProducts.filter(p => p.id_categoria === category.id).length;
                                    return (
                                        <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Layers className="h-4 w-4 text-blue-500" />
                                                <div>
                                                    <div className="font-medium">{category.nombre_categoria}</div>
                                                    <TextSM className="text-muted-foreground">
                                                        {productCount} productos
                                                    </TextSM>
                                                </div>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleAddCategory(category.id)}
                                                className="shrink-0"
                                            >
                                                <PlusCircle className="h-3 w-3 mr-1" />
                                                Añadir
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
