import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/use-toast';

describe('useToast', () => {
  it('debería inicializar con toasts vacíos', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('debería añadir un toast correctamente', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test',
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
    expect(result.current.toasts[0].open).toBe(true);
  });

  it('debería permitir dismiss un toast específico', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      const { id } = result.current.toast({
        title: 'Test Toast',
      });
      result.current.dismiss(id);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('debería permitir dismiss todos los toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.dismiss();
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('debería actualizar un toast existente', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      const { update } = result.current.toast({
        title: 'Original Title',
      });
      update({ title: 'Updated Title', id: result.current.toasts[0].id });
    });

    expect(result.current.toasts[0].title).toBe('Updated Title');
  });
});
