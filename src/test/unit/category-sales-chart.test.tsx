import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategorySalesChart } from '@/components/charts/category-sales-chart';
import type { Product } from '@/data/mock-data';

const mockProducts: Product[] = [
  {
    id: '1',
    nombre_producto: 'Burger Camarai',
    precio_venta: 12.50,
    id_categoria: 'cat1',
    ingredientes_asociados: [],
    descripcion_producto: 'Nuestra hamburguesa estrella',
    disponible: true,
    id_impuesto: 'tax-1',
    url_imagen_producto: '',
  },
  {
    id: '2',
    nombre_producto: 'Pizza Margarita',
    precio_venta: 10.00,
    id_categoria: 'cat1',
    ingredientes_asociados: [],
    descripcion_producto: 'Pizza clásica',
    disponible: true,
    id_impuesto: 'tax-1',
    url_imagen_producto: '',
  },
];

const mockGetCategoryName = vi.fn((id: string) => {
  const categories: { [key: string]: string } = {
    cat1: 'Hamburguesas',
    cat2: 'Pizzas',
  };
  return categories[id] || 'Sin Categoría';
});

describe('CategorySalesChart', () => {
  it('debería renderizar el componente correctamente', () => {
    render(
      <CategorySalesChart 
        products={mockProducts} 
        getCategoryName={mockGetCategoryName}
      />
    );
    
    expect(screen.getByText('Top Productos')).toBeInTheDocument();
  });

  it('debería mostrar categorías de productos', () => {
    render(
      <CategorySalesChart 
        products={mockProducts} 
        getCategoryName={mockGetCategoryName}
      />
    );
    
    expect(mockGetCategoryName).toHaveBeenCalledWith('cat1');
  });

  it('debería manejar productos sin categoría', () => {
    const productsWithoutCategory: Product[] = [
      {
        id: '3',
        nombre_producto: 'Ensalada',
        precio_venta: 8.00,
        id_categoria: 'unknown',
        ingredientes_asociados: [],
        descripcion_producto: 'Ensalada fresca',
        disponible: true,
        id_impuesto: 'tax-1',
        url_imagen_producto: '',
      },
    ];

    render(
      <CategorySalesChart 
        products={productsWithoutCategory} 
        getCategoryName={mockGetCategoryName}
      />
    );
    
    expect(screen.getByText('Sin Categoría')).toBeInTheDocument();
  });

  it('debería manejar array de productos vacío', () => {
    render(
      <CategorySalesChart 
        products={[]} 
        getCategoryName={mockGetCategoryName}
      />
    );
    
    expect(screen.getByText('Top Productos')).toBeInTheDocument();
  });
});
