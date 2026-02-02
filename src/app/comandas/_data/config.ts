import type { ExportField } from '@/components/features/export-modal';

export const exportFields: ExportField[] = [
  { id: 'order', label: 'Número de Orden', checked: true },
  { id: 'name', label: 'Cliente', checked: true },
  { id: 'table', label: 'Mesa', checked: true },
  { id: 'time', label: 'Hora', checked: true },
  { id: 'total', label: 'Total', checked: true },
  { id: 'status', label: 'Estado', checked: true },
  { id: 'items', label: 'Productos', checked: false },
];

export type ViewConfig = {
  showOrder: boolean;
  showName: boolean;
  showTable: boolean;
  showTime: boolean;
  showTotal: boolean;
  showStatus: boolean;
  itemsPerPage: number;
};

export const defaultViewConfig: ViewConfig = {
  showOrder: true,
  showName: true,
  showTable: true,
  showTime: true,
  showTotal: true,
  showStatus: true,
  itemsPerPage: 10,
};
