import { H3 } from '@/components/ui/typography';
import * as React from 'react';
import dynamic from 'next/dynamic';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { TopProductsCard, PeakHoursCard, SalesChannelCard } from '@/components/features/dashboard/kpi-cards';
import type { Product } from '@/data/mock-data';
import type { Order } from '@/data/reportes';

const ChartFallback = () => (
    <div className="h-[200px] w-full rounded-md bg-muted/30" />
);

const SalesChart = dynamic(() => import('@/components/charts/sales-chart').then((mod) => mod.SalesChart), {
    ssr: false,
    loading: () => <ChartFallback /> });

const CategorySalesChart = dynamic(() => import('@/components/charts/category-sales-chart').then((mod) => mod.CategorySalesChart), {
    ssr: false,
    loading: () => <ChartFallback /> });

type PerformanceTabProps = {
    products: Product[];
    orders: Order[];
    getCategoryName: (id: string) => string;
};

export function PerformanceTab({ products, orders, getCategoryName }: PerformanceTabProps) {
    return (
        <TabsContent value="performance" className="space-y-6">
            <SalesChart />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TopProductsCard products={products} />
                </div>
                <div className="space-y-6">
                    <PeakHoursCard orders={orders} />
                    <SalesChannelCard />
                </div>
            </div>
            <CategorySalesChart products={products} getCategoryName={getCategoryName} />
        </TabsContent>
    );
}

