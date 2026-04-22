import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateCSV, prepareDashboardExportData } from '@/lib/export-utils';

describe('export-utils', () => {
  describe('generateCSV', () => {
    let mockElement: any;

    beforeEach(() => {
      // Mock DOM APIs
      global.URL.createObjectURL = vi.fn(() => 'mock-url');
      global.URL.revokeObjectURL = vi.fn();
      
      mockElement = {
        tagName: 'A',
        style: {},
        setAttribute: vi.fn(),
        click: vi.fn(),
        download: '',
      };
      
      document.createElement = vi.fn(() => mockElement);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
    });

    it('debería retornar temprano si data está vacío', () => {
      const result = generateCSV([], 'test');
      expect(result).toBeUndefined();
    });

    it('debería crear elemento anchor', () => {
      const data = [{ name: 'Test', value: 123 }];
      generateCSV(data, 'test');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('debería llamar a setAttribute con download', () => {
      const data = [{ name: 'Test', value: 123 }];
      generateCSV(data, 'myfile');
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('myfile'));
    });

    it('debería llamar a click en el elemento', () => {
      const data = [{ name: 'Test', value: 123 }];
      generateCSV(data, 'test');
      
      expect(mockElement.click).toHaveBeenCalled();
    });
  });

  describe('prepareDashboardExportData', () => {
    it('debería transformar orders correctamente', () => {
      const metrics = { total: 1000 };
      const orders = [
        { order: 'ORD001', time: '12:00', table: 'Table 1', name: 'John', total: 50, status: 'Completed', items: [] },
        { order: 'ORD002', time: '12:30', table: 'Table 2', name: 'Jane', total: 75, status: 'In Progress', items: [] },
      ];
      const products = [];

      const result = prepareDashboardExportData(metrics, orders, products);

      expect(result).toHaveLength(2);
      expect(result[0].OrderID).toBe('ORD001');
      expect(result[0].Time).toBe('12:00');
      expect(result[0].Table).toBe('Table 1');
      expect(result[0].Customer).toBe('John');
      expect(result[0].Total).toBe(50);
      expect(result[0].Status).toBe('Completed');
    });

    it('debería manejar items como array de objetos', () => {
      const orders = [
        { 
          order: 'ORD001', 
          time: '12:00', 
          table: 'Table 1', 
          name: 'John', 
          total: 50, 
          status: 'Completed', 
          items: [{ name: 'Burger', quantity: 2 }, { name: 'Fries', quantity: 1 }] 
        },
      ];
      const result = prepareDashboardExportData({}, orders, []);

      expect(result[0].Items).toBe('2x Burger; 1x Fries');
    });

    it('debería manejar items como array de strings', () => {
      const orders = [
        { 
          order: 'ORD001', 
          time: '12:00', 
          table: 'Table 1', 
          name: 'John', 
          total: 50, 
          status: 'Completed', 
          items: ['Burger', 'Fries'] 
        },
      ];
      const result = prepareDashboardExportData({}, orders, []);

      expect(result[0].Items).toBe('Burger; Fries');
    });

    it('debería manejar items vacío o undefined', () => {
      const orders = [
        { 
          order: 'ORD001', 
          time: '12:00', 
          table: 'Table 1', 
          name: 'John', 
          total: 50, 
          status: 'Completed',
          items: undefined 
        },
      ];
      const result = prepareDashboardExportData({}, orders, []);

      expect(result[0].Items).toBe('');
    });

    it('debería retornar array vacío si no hay orders', () => {
      const result = prepareDashboardExportData({}, [], []);
      expect(result).toEqual([]);
    });
  });
});
