export type ElementoMenuCombo = {
  id: string;
  tipo: 'producto' | 'categoria';
  id_seleccion: string;
  cantidad: number;
  max_seleccion: number;
  descripcion_opcion: string;
};

export type MenuCombo = {
  id: string;
  nombre_carta: string;
  descripcion: string;
  precio_carta: number;
  id_impuesto: string;
  disponible: boolean;
  url_imagen: string;
  elementos_menu: ElementoMenuCombo[];
  active: boolean;
  icon: string;
  color: string;
  costo_escandallo_calculado?: number;
  margen_beneficio_menu?: number;
};

export type ElementoCarta = {
  id: string;
  tipo: 'categoria' | 'menu';
  id_elemento: string;
  orden?: number;
};

export type Carta = {
  id: string;
  nombre_carta: string;
  descripcion_carta: string;
  activa: boolean;
  elementos_carta: ElementoCarta[];
  icon: string;
  color: string;
  // WhatsApp configuration
  whatsapp_enabled?: boolean;
  whatsapp_voice_enabled?: boolean;
  whatsapp_welcome_message?: string;
  whatsapp_schedule_start?: string;
  whatsapp_schedule_end?: string;
};
