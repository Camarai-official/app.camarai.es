'use client';

import * as React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Layers, Package, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';

import { CartasTab } from './_components/cartas-tab';
import { CategoriasTab } from './_components/categorias-tab';
import { ProductosTab } from './_components/productos-tab';

export default function CartasCombinadasPage() {
    const [activeTab, setActiveTab] = React.useState('cartas');
    const [searchTerm, setSearchTerm] = React.useState('');

    return (
        <PageContainer>
            <PageHeader
                title="Gestión de Menú"
                subtitle="Diseña y organiza las cartas digitales, gestiona categorías y tu librería de productos."
            />
            <PageContent>
                <Tabs defaultValue="cartas" onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <TabsList className="md:inline-flex flex mb-0 shrink-0">
                            <TabsTrigger value="cartas" className="flex-1 md:flex-none">
                                <BookOpen className="mr-2 h-4 w-4 hidden md:block" />
                                Cartas
                            </TabsTrigger>
                            <TabsTrigger value="categorias" className="flex-1 md:flex-none">
                                <Layers className="mr-2 h-4 w-4 hidden md:block" />
                                Categorías
                            </TabsTrigger>
                            <TabsTrigger value="productos" className="flex-1 md:flex-none">
                                <Package className="mr-2 h-4 w-4 hidden md:block" />
                                Productos
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <SearchInput 
                                placeholder={`Buscar ${activeTab}...`} 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                containerClassName="flex-grow md:w-64"
                            />
                            <Button 
                                id={`btn-add-${activeTab}`}
                                size="md" 
                                className="shrink-0"
                                onClick={() => {
                                    // Disparar evento personalizado o usar refs (implementaremos via dispatchEvent por simplicidad o permitiendo que las tabs escuchen)
                                    // Para este caso, vamos a usar un evento global simple que las tabs escucharán
                                    window.dispatchEvent(new CustomEvent(`open-add-${activeTab}`));
                                }}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {activeTab === 'cartas' ? 'Nueva Carta' : 
                                     activeTab === 'categorias' ? 'Nueva Categoría' : 
                                     'Nuevo Producto'}
                                </span>
                                <span className="sm:hidden">Añadir</span>
                            </Button>
                        </div>
                    </div>
                    
                    <TabsContent value="cartas" className="mt-0 outline-none border-none">
                        <CartasTab searchTerm={searchTerm} />
                    </TabsContent>
                    
                    <TabsContent value="categorias" className="mt-0 outline-none border-none">
                        <CategoriasTab searchTerm={searchTerm} />
                    </TabsContent>
                    
                    <TabsContent value="productos" className="mt-0 outline-none border-none">
                        <ProductosTab searchTerm={searchTerm} />
                    </TabsContent>
                </Tabs>
            </PageContent>
        </PageContainer>
    );
}
