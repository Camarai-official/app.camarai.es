# Informe de Error: Sincronización de Filtros Globales

## 🛠️ Descripción del Problema
A pesar de la implementación de la lógica de sincronización global en el Dashboard (Dashboard `Home` component), los KPIs (tanto las métricas principales superiores como las operacionales inferiores) no responden dinámicamente al cambio de fechas en el `CalendarDateRangePicker`. Además, se han reportado errores de hidratación y fallos críticos que resultan en una "Pantalla Blanca" (Runtime Error) al cargar la aplicación.

## 📉 Estado Actual
- **Filtros Globales:** El estado `date` en `src/app/page.tsx` se actualiza, pero la lógica de `useMemo` para `metricsData` parece no estar reflejando los cambios visualmente en los componentes `MetricCard`.
- **KPIs Superiores e Inferiores:** Permanecen estáticos o fallan al sincronizarse.
- **Errores de UI:** Fallo de hidratación de React (`Text content did not match. Server: "€2.6M" Client: "€3.0M"`).

## ⚠️ Registro de Fallo Crítico
- **Fecha:** 2026-02-02
- **Síntoma:** Pantalla blanca total en el navegador (`localhost:3001`).
- **Causa probable:** Error en la lógica de generación de `dateFactor` o conflictos entre el renderizado del servidor y el cliente al usar valores aleatorios dependientes del tiempo.

## 📋 Acciones de Seguimiento
1. Revisar la integración del componente `CalendarDateRangePicker` con el estado local de la página.
2. Asegurar que las dependencias de `useMemo` sean estables y no causen bucles de renderizado o fallos de hidratación.
3. Evaluar el impacto de las funciones de simulación de datos (`dateFactor`) en la estabilidad del cliente.

---
*Este documento registra un fallo no tolerado en la estabilidad de la vista de inicio.*
