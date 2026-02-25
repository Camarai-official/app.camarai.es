
import type { Carta, ElementoCarta, ElementoMenuCombo, MenuCombo } from '@/types/menu';

export type { Carta, ElementoCarta, ElementoMenuCombo, MenuCombo } from '@/types/menu';

export const mockCartas: Carta[] = [
    {
        id: 'menu-1',
        nombre_carta: 'Carta Principal',
        activa: true,
        elementos_carta: [],
        descripcion_carta: 'Menú principal del restaurante',
        icon: 'Utensils',
        color: 'red-500'
    }
];

export const mockMenuCombos: MenuCombo[] = [];
