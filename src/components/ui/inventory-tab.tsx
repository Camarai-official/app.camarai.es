import * as React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { InventoryValuationCard, WasteReportCard, InventoryMetrics, LowStockCard } from '@/components/features/reports/inventory-reports';
import type { Product, Tax, Ingredient, IngredientCategory } from '@/data/mock-data';

type InventoryTabProps = {
    products: Product[];
    taxes: Tax[];
    ingredients: Ingredient[];
    ingredientCategories: IngredientCategory[];
    getTaxName: (id: string) => string;
};

export function InventoryTab({
    ingredients,
    ingredientCategories,
}: InventoryTabProps) {
    return (
        <TabsContent value="inventory" className="space-y-6">
            <InventoryMetrics ingredients={ingredients} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InventoryValuationCard ingredients={ingredients} ingredientCategories={ingredientCategories} />
                <LowStockCard ingredients={ingredients} />
            </div>

            <WasteReportCard />
        </TabsContent>
    );
}
