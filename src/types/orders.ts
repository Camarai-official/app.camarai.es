// Status del pedido según schema Convex
export type OrderStatus = 'open' | 'paid' | 'cancelled' | 'refunded';

// Status de pago
export type PaymentStatus = 'pending' | 'partial' | 'paid';

// Tipo de pedido
export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'counter';

// Tipo de pago
export type PaymentType = 'individual' | 'shared' | 'split';

// Origen del pedido
export type OrderSource = 'pos' | 'pda' | 'carta' | 'voice' | 'agent';

// Item del pedido (order_items)
export type OrderItem = {
  _id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: string;
  notes?: string;
  course: 'first' | 'second' | 'dessert' | 'drink';
  itemStatus: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'paid';
  sentToKitchenAt?: number;
  readyAt?: number;
  clientId?: string;
  paymentStatus?: 'pending' | 'paid';
  paymentMethod?: string;
  paidAt?: number;
};

// Pago
export type Payment = {
  _id: string;
  method: 'cash' | 'card' | 'bizum' | 'transfer' | 'apple_pay' | 'google_pay';
  amount: number;
  tip: number;
  reference?: string;
  staffId: string;
  timestamp: number;
};

// Pedido para la vista de comandas (datos del backend Convex)
export type Order = {
  _id: string;
  orderNumber: string;
  createdAt: number;
  updatedAt: number;
  closedAt?: number;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  discountReason?: string;
  notes?: string;
  paymentType: PaymentType;
  paymentStatus?: PaymentStatus;
  orderType?: OrderType;
  source: OrderSource;
  isRefund?: boolean;
  isCommissionOrder?: boolean;
  guests: number;
  // Table
  tableId?: string;
  tableLabel?: string | null;
  // Environment
  environmentId?: string;
  environmentName?: string | null;
  // Staff
  staffId: string;
  staffName: string;
  // Customer
  customerId?: string;
  customerName?: string | null;
  // Delivery
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPhone?: string;
  trackingCode?: string;
};

// Detalles completos del pedido (para diálogos)
export type OrderDetails = Order & {
  items: OrderItem[];
  payments: Payment[];
  tableNumber?: number | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  deliveryPostalCode?: string;
  origenWhatsapp?: boolean;
  metodoPago?: string;
};

// Respuesta paginada de comandas
export type OrdersForComandasResponse = {
  orders: Order[];
  hasMore: boolean;
  nextCursor: string | null;
};

// Legacy types for compatibility (remove after migration)
/** @deprecated Use OrderItem instead */
export type OrderDetailItem = {
  name: string;
  quantity: number;
  price: number;
};

/** @deprecated Use OrderDetails instead */
export type LegacyOrderDetails = {
  order: string;
  time: string;
  date: string;
  table: string;
  name: string;
  total: string;
  status: 'En Progreso' | 'Cancelado' | 'Completado';
  items: OrderDetailItem[];
  subtotal: number;
  tax: number;
};
