import * as React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { CustomerLoyaltyCard, CampaignPerformanceCard } from '@/components/features/reports/customer-reports';
import { InventoryValuationCard, WasteReportCard } from '@/components/features/reports/inventory-reports';
import { TaxReportCard, ProfitAndLossCard } from '@/components/features/reports/financial-reports';
import type { Product, Tax, Ingredient, IngredientCategory } from '@/data/mock-data';

type InventoryTabProps = {
    products: Product[];
    taxes: Tax[];
    ingredients: Ingredient[];
    ingredientCategories: IngredientCategory[];
    getTaxName: (id: string) => string;
};

export function InventoryTab({
    products,
    taxes,
    ingredients,
    ingredientCategories,
    getTaxName,
}: InventoryTabProps) {
    return (
        <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TaxReportCard products={products} taxes={taxes} getTaxName={getTaxName} />
                <ProfitAndLossCard products={products} />
            </div>
            <InventoryValuationCard ingredients={ingredients} ingredientCategories={ingredientCategories} />
            <WasteReportCard />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomerLoyaltyCard />
                <CampaignPerformanceCard />
            </div>
        </TabsContent>
    );
}
