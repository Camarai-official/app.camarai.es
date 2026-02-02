# Documentación de Vista: Inicio (Dashboard Principal)

## 🎯 Objetivo de la Vista
El objetivo principal de la vista de Inicio es proporcionar al gestor del restaurante una **visión de 360 grados** del rendimiento del negocio en tiempo real. Está diseñada para facilitar la toma de decisiones basada en datos mediante la visualización de métricas clave, tendencias de ventas y alertas operativas críticas.

---

## 🏗️ Estructura y Componentes
La interfaz se compone de **12 elementos principales** organizados de forma modular:

### 1. Cabecera Global Dinámica (`PageHeader`)
*   **Elementos:** Título de bienvenida personalizado y barra de herramientas global.
*   **Funcionalidades:** 
    *   **Selector de Rango de Fechas Maestro:** Controla el contexto temporal de TODA la aplicación.
    *   **Exportación Global:** Generación de informes CSV consolidados.
    *   **Configuración de Panel:** Selector para ocultar/mostrar widgets dinámicamente.

### 2. Panel de Métricas Financieras (4 Widgets)
*   **Componentes:** `MetricCard` (Ingresos Totales, Ticket Medio, Productos/Comanda, Conversión Upsell).
*   **Ventaja:** Permite ver de un vistazo la salud económica y la eficiencia de ventas.

### 3. Gráfico de Tendencia de Ventas (`SalesChart`)
*   **Tipo:** Área con gradiente.
*   **Innovación:** Posee **autonomía local**. Puede sincronizarse con el filtro global o desacoplarse para un análisis específico de ventas por hora/día sin perder la vista general.

### 4. Análisis de Reservas (`RevenueChart`)
*   **Tipo:** Gráfico de barras.
*   **Objetivo:** Visualizar el volumen de reservas mensual para la planificación de staff y recursos.

### 5. Distribución de Aforo (`OccupancyChart`)
*   **Tipo:** Donut chart (Gráfico circular hueco).
*   **Detalle:** Muestra el uso de los distintos ambientes del restaurante (Interior, Terraza, VIP), detectando zonas infrautilizadas.

### 6. Métricas Operacionales (3 Widgets)
*   **Indicadores:** Tiempo Medio de Servicio (KPI de eficiencia), Total Comandas y NPS (Satisfacción del cliente).
*   **Ventaja:** Foco directo en la calidad del servicio y la experiencia del comensal.

### 7. Gestión de Comandas (`RecentOrders`)
*   **Componente:** Tabla interactiva con estados (`Badge`).
*   **Funciones:** Paginación, selección múltiple, cambio de estado y exportación individual por formato (CSV/PDF/XLSX).

### 8. Sistema de Alerta de Stock (`LowStockAlerts`)
*   **Elemento:** Lista con barras de progreso de color crítico.
*   **Objetivo:** Evitar roturas de stock mediante alertas visuales inmediatas y botón de reposición rápida.

### 9. Ranking de Equipo (`TeamLeaderboard`)
*   **Componente:** Gamificación del staff.
*   **Función:** Muestra el rendimiento de ventas por empleado para incentivar la productividad.

### 10. Mix de Productos (`CategorySalesChart`)
*   **Tipo:** Barras horizontales.
*   **Análisis:** Identifica qué categorías (Carnes, Pescados, Bebidas) están traccionando el negocio.

### 11. Desglose de Costes (`CostBreakdownChart`)
*   **Visualización:** Estructura de gastos.
*   **Objetivo:** Controlar el peso de ingredientes, personal y suministros sobre los ingresos totales.

---

## 🚀 Ventajas de la Implementación Realizada

1.  **Sincronización Total (Context Awareness):** Al cambiar la fecha en la cabecera, todos los componentes (gráficos, tarjetas y tablas) se actualizan al unísono, eliminando discrepancias de datos.
2.  **Arquitectura "Master-Slave" con Override:** El diseño permite que widgets específicos tengan su propio filtro si el usuario lo desea, ofreciendo flexibilidad avanzada.
3.  **Prevención de Errores de Hidratación:** Implementación de lógica de montaje segura para Next.js, garantizando que el usuario no vea errores visuales durante la carga.
4.  **Diseño Premium (Glassmorphism & UX Dark):** Interfaz optimizada para reducir la fatiga visual, utilizando colores armónicos y micro-animaciones en los indicadores de sincronización.
5.  **Optimización Móvil:** Ajuste dinámico de rejillas (grid) y ocultamiento inteligente de elementos no críticos en pantallas pequeñas.

---
*Documento generado automáticamente por Antigravity AI - Dashboard v1.0*
