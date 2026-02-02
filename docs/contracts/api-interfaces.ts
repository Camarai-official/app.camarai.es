
/**
 * @fileoverview This file defines the data structures (interfaces) to be shared
 * between the Admin Panel and the Point of Sale (POS) system. It acts as a contract
 * to ensure both systems speak the same language.
 */

// Represents a physical area in the establishment (e.g., "Main Hall", "Terrace")
export interface Ambiente {
  id: string;
  nombre: string;
}

// Represents a single table within an environment
export interface Mesa {
  id: string;
  id_ambiente: string;
  numero_mesa: number;
  capacidad: number;
  estado: 'Libre' | 'Ocupada' | 'Reservada';
}

// Represents a product category (e.g., "Appetizers", "Desserts")
export interface Categoria {
  id: string;
  nombre: string;
  orden: number;
}

// Represents a single sellable product
export interface Producto {
  id: string;
  id_categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  url_imagen: string;
  disponible: boolean;
}

// Represents an active staff member who can log into the POS
export interface PersonalActivo {
  id: string;
  nombre_completo: string;
  pin: string; // The POS would receive a hashed version or handle auth via tokens
  url_foto_perfil: string;
}

// Represents an entire menu structure to be sent to the POS
export interface MenuCompleto {
  categorias: Categoria[];
  productos: Producto[];
}

// Represents a new order created on the POS, to be sent to the server
export interface NuevaComandaPayload {
  id_comanda_local: string; // Unique ID from the POS device
  id_mesa: string;
  id_personal: string;
  fecha_apertura: string; // ISO 8601
  items: {
    id_producto: string;
    cantidad: number;
    precio_venta: number;
    notas?: string;
  }[];
  subtotal: number;
  total_impuestos: number;
  total: number;
}
