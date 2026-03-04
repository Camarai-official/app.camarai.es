'use client';

import * as React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { PageContent } from '@/components/layout/page-content';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Layers, Package } from 'lucide-react';

import { CartasTab } from './_components/cartas-tab';
import { CategoriasTab } from './_components/categorias-tab';
import { ProductosTab } from './_components/productos-tab';

export default function CartasCombinadasPage() {
    return (
        <PageContainer>
            <PageHeader
                title="Gestión de Menú"
                subtitle="Diseña y organiza las cartas digitales, gestiona categorías y tu librería de productos."
            />
            <PageContent>
                <Tabs defaultValue="cartas" className="w-full">
                    <TabsList className="mb-6 md:inline-flex flex">
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
                    
                    <TabsContent value="cartas" className="mt-0 outline-none border-none">
                        <CartasTab />
                    </TabsContent>
                    
                    <TabsContent value="categorias" className="mt-0 outline-none border-none">
                        <CategoriasTab />
                    </TabsContent>
                    
                    <TabsContent value="productos" className="mt-0 outline-none border-none">
                        <ProductosTab />
                    </TabsContent>
                </Tabs>
            </PageContent>
        </PageContainer>
    );
}
