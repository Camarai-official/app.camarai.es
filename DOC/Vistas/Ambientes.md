# Documentación de Vista: Ambientes (Gestión de Salas y QR)

## 🎯 Objetivo de la Vista
La vista de **Ambientes** tiene un doble propósito: definir la estructura física del restaurante (Salón, Terraza, Barra) y habilitar la capa digital de "Pedido en Mesa" mediante la generación de códigos QR. Permite al gestor configurar cuántas mesas hay y cómo acceden los clientes al menú digital.

---

## 🏗️ Estructura y Componentes
La interfaz se organiza en un grid responsivo con tarjetas de gestión rápida:

### 1. Panel de Ambientes (`EnvironmentCard`)
*   **Visualización:** Tarjetas individuales por zona (ej. "Terraza Principal").
*   **Métricas:** Muestra ocupación en tiempo real y número de mesas activas.
*   **Acciones Directas:**
    *   ✏️ **Editar:** Modificar nombre o aforo.
    *   🗑️ **Eliminar:** Archivar zona fuera de temporada.
    *   🏷️ **Gestionar Mesas:** Acceso granular.

### 2. Generador de QR Inteligente (`QRGenerationModal`)
*   **Innovación:** Sistema de generación selectiva.
*   **Problema que resuelve:** Evita tener que regenerar (y reimprimir) TODOS los códigos del restaurante si solo se añaden 2 mesas nuevas.
*   **Funcionalidades:**
    *   **Selección por Lotes:** "Seleccionar todas las mesas de Terraza".
    *   **Selección Individual:** Click en mesas específicas.
    *   **Formatos:** Exportación en PNG (rápido) o SVG (alta calidad para imprenta).
    *   **Paginación del Preview:** Visualización de 12 QRs por página para evitar scroll infinito.

### 3. Widget de Acción Rápida (`CreateActionCard`)
*   **Diseño:** Tarjeta punteada con icono `PlusCircle`.
*   **UX:** Siempre visible al final del grid, invitando a la expansión del negocio.

### 4. Buscador Global
*   **Utilidad:** Filtrado en tiempo real de mesas y ambientes. Crucial para locales con >50 mesas.

---

## 🚀 Ventajas de la Implementación Realizada

1.  **Escalabilidad:** El sistema soporta desde un pequeño café hasta un multiespacio con cientos de mesas gracias a la paginación y el filtrado.
2.  **Ahorro de Costes de Impresión:** Al permitir generar QRs específicos, se reduce el desperdicio de papel/vinilo.
3.  **Independencia:** El dueño del local puede reconfigurar su terraza en verano sin llamar al soporte técnico.
4.  **Integración API:** Uso de `api.qrserver.com` para generación fiable y rápida sin carga en el servidor propio.
