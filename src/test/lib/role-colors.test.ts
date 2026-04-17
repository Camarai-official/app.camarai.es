import { describe, it, expect } from 'vitest';
import { roleColors, getRoleColors, type RoleColorConfig } from '@/lib/role-colors';

describe('role-colors', () => {
  describe('roleColors', () => {
    it('debería tener configuración para camarero', () => {
      expect(roleColors.camarero).toBeDefined();
      expect(roleColors.camarero.bg).toBe('bg-brand-blue/10');
      expect(roleColors.camarero.text).toBe('text-brand-blue');
      expect(roleColors.camarero.border).toBe('border-brand-blue/30');
      expect(roleColors.camarero.chipBg).toBe('bg-brand-blue/20');
    });

    it('debería tener configuración para cocinero', () => {
      expect(roleColors.cocinero).toBeDefined();
      expect(roleColors.cocinero.bg).toBe('bg-brand-yellow/10');
      expect(roleColors.cocinero.text).toBe('text-brand-yellow');
    });

    it('debería tener configuración para gerente', () => {
      expect(roleColors.gerente).toBeDefined();
      expect(roleColors.gerente.bg).toBe('bg-brand-green/10');
      expect(roleColors.gerente.text).toBe('text-brand-green');
    });

    it('debería tener configuración para host', () => {
      expect(roleColors.host).toBeDefined();
      expect(roleColors.host.bg).toBe('bg-brand-pink/10');
      expect(roleColors.host.text).toBe('text-brand-pink');
    });

    it('todas las configuraciones deberían tener las propiedades requeridas', () => {
      Object.values(roleColors).forEach((config: RoleColorConfig) => {
        expect(config).toHaveProperty('bg');
        expect(config).toHaveProperty('text');
        expect(config).toHaveProperty('border');
        expect(config).toHaveProperty('chipBg');
      });
    });
  });

  describe('getRoleColors', () => {
    it('debería retornar colores correctos para rol existente', () => {
      const colors = getRoleColors('camarero');
      expect(colors.bg).toBe('bg-brand-blue/10');
      expect(colors.text).toBe('text-brand-blue');
    });

    it('debería retornar colores de camarero por defecto cuando rol no existe', () => {
      const colors = getRoleColors('rol_inexistente');
      expect(colors.bg).toBe('bg-brand-blue/10');
      expect(colors.text).toBe('text-brand-blue');
    });

    it('debería retornar colores de camarero cuando rol es undefined', () => {
      const colors = getRoleColors(undefined);
      expect(colors.bg).toBe('bg-brand-blue/10');
      expect(colors.text).toBe('text-brand-blue');
    });

    it('debería retornar colores de camarero cuando rol es string vacío', () => {
      const colors = getRoleColors('');
      expect(colors.bg).toBe('bg-brand-blue/10');
      expect(colors.text).toBe('text-brand-blue');
    });

    it('debería funcionar para todos los roles definidos', () => {
      const roles = Object.keys(roleColors);
      roles.forEach(role => {
        const colors = getRoleColors(role);
        expect(colors).toBeDefined();
        expect(colors).toHaveProperty('bg');
        expect(colors).toHaveProperty('text');
      });
    });
  });
});
