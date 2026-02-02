export type Movement = {
  id: string;
  concept: string;
  type: 'Ingreso' | 'Gasto';
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'N/A';
  amount: number;
};
