import * as React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import type { Product } from '@/data/mock-data';

// --- TopProductsCard ---
type TopProductsCardProps = {
  products: Product[];
};

export function TopProductsCard({ products }: TopProductsCardProps) {
  const topProducts = React.useMemo(() => {
    // Simulate sales to get top products
    return [...products]
      .sort((a, b) => b.precio_venta - a.precio_venta)
      .slice(0, 5)
      .map(p => ({
        ...p,
        revenue: p.precio_venta * (Math.floor(Math.random() * 20) + 10) // Simulated revenue
      }));
  }, [products]);

  return (
    <Card height="full">
      <CardHeader 
        title="Top 5 Productos Más Vendidos"
      >
        <CardDescription>Productos que más ingresos han generado en el período.</CardDescription>
      </CardHeader>
      <CardContent flex>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead align="right">Ingresos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map(product => (
              <TableRow key={product.id}>
                <TableCell className="flex items-center gap-3">
                  {product.url_imagen_producto ? (
                    <Image 
                      src={product.url_imagen_producto} 
                      alt={product.nombre_producto} 
                      width={32} 
                      height={32} 
                      className="rounded-sm object-cover" 
                      data-ai-hint="product image" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">
                      {product.nombre_producto.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium truncate">{product.nombre_producto}</span>
                </TableCell>
                <TableCell align="right" variant="medium">€{product.revenue.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// --- PeakHoursCard ---
type Order = {
  time: string;
  total: string;
};

type PeakHoursCardProps = {
  orders: Order[];
};

export function PeakHoursCard({ orders }: PeakHoursCardProps) {
  const peakHours = React.useMemo(() => {
    // If no orders, return default mock data
    if (!orders || orders.length === 0) {
      return {
        peakRevenueHour: '21:00',
        peakOrdersHour: '14:00',
        peakAvgTicketHour: '22:00'
      };
    }

    const ordersByHour: { [key: string]: { count: number; revenue: number } } = {};

    orders.forEach(order => {
      const hour = order.time.split(':')[0];
      if (!ordersByHour[hour]) {
        ordersByHour[hour] = { count: 0, revenue: 0 };
      }
      ordersByHour[hour].count++;
      ordersByHour[hour].revenue += parseFloat(order.total.replace('€', ''));
    });

    let peakRevenueHour = 'N/A';
    let maxRevenue = 0;
    let peakOrdersHour = 'N/A';
    let maxOrders = 0;
    let peakAvgTicketHour = 'N/A';
    let maxAvgTicket = 0;

    for (const hour in ordersByHour) {
      if (ordersByHour[hour].revenue > maxRevenue) {
        maxRevenue = ordersByHour[hour].revenue;
        peakRevenueHour = `${hour}:00`;
      }
      if (ordersByHour[hour].count > maxOrders) {
        maxOrders = ordersByHour[hour].count;
        peakOrdersHour = `${hour}:00`;
      }
      const avgTicket = ordersByHour[hour].revenue / ordersByHour[hour].count;
      if (avgTicket > maxAvgTicket) {
        maxAvgTicket = avgTicket;
        peakAvgTicketHour = `${hour}:00`;
      }
    }
    return { peakRevenueHour, peakOrdersHour, peakAvgTicketHour };
  }, [orders]);

  return (
    <Card>
      <CardHeader title="Eficiencia y Horas Punta" />
      <CardContent gap="md">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Hora de Más Ventas</p>
          <p className="font-bold text-lg">{peakHours.peakRevenueHour}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Hora con Más Comandas</p>
          <p className="font-bold text-lg">{peakHours.peakOrdersHour}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Ticket Medio Máximo</p>
          <p className="font-bold text-lg">{peakHours.peakAvgTicketHour}</p>
        </div>
      </CardContent>
    </Card>
  );
}


// --- SalesChannelCard ---
export function SalesChannelCard() {
  const camaraiPercentage = 65;
  const personalPercentage = 35;

  return (
    <Card>
      <CardHeader 
        title="Rendimiento por Canal"
      >
        <CardDescription className="text-xs">Comparativa de ventas automáticas vs. manuales.</CardDescription>
      </CardHeader>
      <CardContent gap="md">
        <div>
          <div className="flex justify-between items-center mb-1">
          <span className="font-medium">Camarai (Automático)</span>
            <span className="font-semibold">{camaraiPercentage}%</span>
          </div>
          <Progress value={camaraiPercentage} />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
          <span className="font-medium">Personal (Manual)</span>
            <span className="font-semibold">{personalPercentage}%</span>
          </div>
          <Progress value={personalPercentage} indicatorClassName="bg-blue-500" />
        </div>
      </CardContent>
    </Card>
  );
}

