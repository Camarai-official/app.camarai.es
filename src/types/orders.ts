export type OrderStatus = 'En Progreso' | 'Cancelado' | 'Completado';

export type Order = {
  id?: string;
  order: string;
  time: string;
  date: string;
  table: string;
  name: string;
  total: string;
  status: OrderStatus;
};

export type OrderDetailItem = {
  name: string;
  quantity: number;
  price: number;
};

export type OrderDetails = Order & {
  items: OrderDetailItem[];
  subtotal: number;
  tax: number;
};
