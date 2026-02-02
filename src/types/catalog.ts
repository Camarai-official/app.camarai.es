export type UnitOfMeasure = 'kg' | 'g' | 'l' | 'ml' | 'unidades';

export type IngredientCategory = {
  id: string;
  nombre: string;
};

export type Ingredient = {
  id: string;
  nombre_ingrediente: string;
  id_categoria_ingrediente: string;
  costo_unitario: number;
  unidad_medida: UnitOfMeasure;
  id_impuesto: string;
  stock_actual: number;
  stock_minimo_alerta: number;
};

export type AssociatedIngredient = {
  id_ingrediente: string;
  cantidad_requerida: number;
  unidad_medida: string;
};

export type Product = {
  id: string;
  nombre_producto: string;
  descripcion_producto: string;
  precio_venta: number;
  id_categoria: string;
  id_impuesto: string;
  disponible: boolean;
  url_imagen_producto: string;
  ingredientes_asociados: AssociatedIngredient[];
  costo_escandallo_calculado?: number;
  margen_beneficio?: number;
};

export type Category = {
  id: string;
  nombre_categoria: string;
};

export type Tax = {
  id: string;
  nombre_impuesto: string;
  porcentaje_impuesto: number;
};
