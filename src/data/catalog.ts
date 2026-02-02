
import type { AssociatedIngredient, Category, Ingredient, IngredientCategory, Product, Tax, UnitOfMeasure } from '@/types/catalog';

export type { AssociatedIngredient, Category, Ingredient, IngredientCategory, Product, Tax, UnitOfMeasure } from '@/types/catalog';

export const mockCategories: Category[] = [
  { id: 'cat-1', nombre_categoria: 'Carnes' },
  { id: 'cat-2', nombre_categoria: 'Bebidas' },
];

export const mockIngredientCategories: IngredientCategory[] = [
  { id: 'icat-1', nombre: 'Proteínas' },
  { id: 'icat-2', nombre: 'Vegetales' },
];

export const mockIngredients: Ingredient[] = [
  {
    id: 'ing-1',
    nombre_ingrediente: 'Solomillo de Ternera',
    stock_actual: 15,
    unidad_medida: 'kg',
    stock_minimo_alerta: 5,
    id_categoria_ingrediente: 'icat-1',
    costo_unitario: 18.5,
    id_impuesto: 'tax-1'
  },
  {
    id: 'ing-2',
    nombre_ingrediente: 'Lechuga',
    stock_actual: 3,
    unidad_medida: 'unidades',
    stock_minimo_alerta: 10,
    id_categoria_ingrediente: 'icat-2',
    costo_unitario: 0.8,
    id_impuesto: 'tax-1'
  },
  {
    id: 'ing-3',
    nombre_ingrediente: 'Tomate',
    stock_actual: 20,
    unidad_medida: 'kg',
    stock_minimo_alerta: 5,
    id_categoria_ingrediente: 'icat-2',
    costo_unitario: 1.2,
    id_impuesto: 'tax-1'
  },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    nombre_producto: 'Solomillo de Ternera',
    precio_venta: 28.00,
    id_categoria: 'cat-1',
    ingredientes_asociados: [],
    descripcion_producto: 'Solomillo de ternera a la brasa',
    disponible: true,
    id_impuesto: 'tax-1',
    url_imagen_producto: ''
  },
  {
    id: 'p2',
    nombre_producto: 'Ensalada César',
    precio_venta: 14.50,
    id_categoria: 'cat-1',
    ingredientes_asociados: [],
    descripcion_producto: 'Clásica ensalada césar',
    disponible: true,
    id_impuesto: 'tax-1',
    url_imagen_producto: ''
  },
  {
    id: 'p3',
    nombre_producto: 'Café Expreso',
    precio_venta: 1.80,
    id_categoria: 'cat-2',
    ingredientes_asociados: [],
    descripcion_producto: 'Café expreso intenso',
    disponible: true,
    id_impuesto: 'tax-1',
    url_imagen_producto: ''
  },
];

export const mockTaxes: Tax[] = [
  { id: 'tax-1', nombre_impuesto: 'IVA', porcentaje_impuesto: 21 },
];

export const getCategoryName = (id: string) => mockCategories.find(c => c.id === id)?.nombre_categoria || 'Sin categoría';
export const getIngredientCategoryName = (id: string) => mockIngredientCategories.find(c => c.id === id)?.nombre || 'Sin categoría';
export const getTaxName = (id: string) => mockTaxes.find(t => t.id === id)?.nombre_impuesto || 'IVA';
