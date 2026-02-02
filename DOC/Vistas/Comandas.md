# Documentación de Vista: Historial de Pedidos (Comandas)

## 🎯 Objetivo de la Vista
El objetivo de la vista de **Comandas** es actuar como el centro de auditoría y control de operaciones del restaurante. Permite a los gerentes revisar todas las transacciones pasadas, reimprimir tickets perdidos, corregir errores en cobros y analizar el rendimiento por servicio.

---

## 🏗️ Estructura y Componentes
La interfaz se ha refactorizado para incluir **5 módulos de funcionalidad clave**:

### 1. Sistema de Filtrado Unificado
*   **Componente:** `CalendarDateRangePicker` en cabecera + Barra de Búsqueda.
*   **Funcionalidad:**
    *   Permite acotar la búsqueda por rangos de fechas personalizados (Sincronizado con la librería `date-fns`).
    *   Búsqueda de texto libre por: Nombre de cliente, Nº de orden o Mesa.

### 2. Tabla de Datos Dinámica (`DataTable`)
*   **Características:**
    *   **Selección Múltiple:** Checkboxes para seleccionar varios pedidos y realizar acciones en lote (Ej. Imprimir selección).
    *   **Paginación:** Control de registros por página.
    *   **Columnas Inteligentes:** Integración con *View Config* para mostrar solo la información relevante.

### 3. Configurador de Vista (`ViewConfigDialog`)
*   **Acceso:** Botón de engranaje (⚙️).
*   **Innovación:** Permite al usuario **personalizar las columnas visibles** de la tabla.
    *   *Ejemplo:* Un gerente puede ocultar la columna "Hora" para centrarse solo en "Totales" y "Estado".
    *   **Persistencia:** La configuración se aplica en tiempo real.

### 4. Visor de Ticket Térmico (`OrderDetailsDialog`)
*   **Visualización:** Simulación exacta de un **Ticket de 80mm** (Recibo físico).
*   **Elementos Visuales:** Fuente monoespaciada (`font-mono`), bordes dentados (efecto papel cortado), desglose de impuestos y logo corporativo.
*   **Acciones:**
    *   🖨️ **Imprimir:** Lanza la orden a la impresora configurada.
    *   ✏️ **Editar:** Abre el modo de edición.

### 5. Editor Avanzado de Comandas (`EditOrderDialog`)
*   **Objetivo:** Corrección de errores post-servicio.
*   **Capacidades:**
    *   **Búsqueda de productos:** Autocompletado para añadir items olvidados.
    *   **Modificación de cantidades:** Botones `+` / `-`.
    *   **Gestión de Descuentos:** Aplicación de % de descuento que recalcula automáticamente Subtotal e IVA.
    *   **Notas:** Añadir observaciones (ej. "Alergia no reportada").

---

## 🚀 Ventajas de la Implementación Realizada

1.  **Auditoría Visual Realista:** Al ver el ticket tal cual sale impreso, se reducen los errores de interpretación por parte del staff.
2.  **Flexibilidad Operativa:** La capacidad de editar una comanda cerrada y aplicar descuentos a posteriori es vital para la resolución de quejas de clientes.
3.  **Eficiencia en Cierres de Caja:** La selección múltiple permite reimprimir rápidamente todas las comandas de un turno para el arqueo.
4.  **Consistencia de Marca:** La integración del logo dinámico asegura que todos los documentos (digitales o impresos) refuercen la identidad del restaurante.
