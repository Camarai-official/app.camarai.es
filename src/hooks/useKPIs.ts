import * as React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useEstablishmentContext } from './EstablishmentContext';
import { useEstablishments } from './useEstablishments';
import { useCurrentYearMonth } from './useCurrentYearMonth';

export const useKPIs = () => {
  const { activeEstablishment } = useEstablishments();
  const activeId = activeEstablishment?.id;

  // Get global KPIs for the active establishment
  const globalKPIs = useQuery(
    api.analytics.getDashboardKPIs,
    activeId ? { establishmentId: activeId as Id<"establishments"> } : 'skip'
  );

  // Get current year-month for monthly KPIs
  const currentYearMonth = useCurrentYearMonth();

  // Get monthly KPIs for current month
  const monthlyKPIs = useQuery(
    api.analytics.getMonthlyKPIs,
    activeId && currentYearMonth 
      ? { establishmentId: activeId as Id<"establishments">, yearMonth: currentYearMonth }
      : 'skip'
  );

  // Format KPI data for display
  const formattedKPIs = React.useMemo(() => {
    if (!globalKPIs) {
      return {
        totalRevenue: '€0',
        avgTicket: '€0',
        itemsPerOrder: '0',
        conversion: '0%',
        serviceTime: '0 min',
        totalOrders: '0',
        nps: '0',
        lastUpdated: null,
      };
    }

    const numberFormatter = new Intl.NumberFormat('es-ES');
    
    // Values are already in euros
    const revenueInEuros = globalKPIs.total_revenue;
    const ticketInEuros = globalKPIs.average_ticket;
    
    // Format revenue with appropriate suffix
    let revenueDisplay: string;
    if (revenueInEuros >= 1000000) {
      revenueDisplay = `€${(revenueInEuros / 1000000).toFixed(1)}M`;
    } else if (revenueInEuros >= 1000) {
      revenueDisplay = `€${(revenueInEuros / 1000).toFixed(1)}K`;
    } else {
      revenueDisplay = `€${numberFormatter.format(revenueInEuros)}`;
    }

    // Calculate items per order
    const itemsPerOrder = globalKPIs.total_orders > 0 
      ? (globalKPIs.total_items_sold / globalKPIs.total_orders).toFixed(1)
      : '0';

    // Convert service time from ms to minutes
    const serviceTimeMinutes = Math.round(globalKPIs.avg_service_time_ms / 60000);

    return {
      totalRevenue: revenueDisplay,
      avgTicket: `€${numberFormatter.format(ticketInEuros)}`,
      itemsPerOrder,
      conversion: `${globalKPIs.upsell_rate.toFixed(0)}%`,
      serviceTime: `${serviceTimeMinutes} min`,
      totalOrders: numberFormatter.format(globalKPIs.total_orders),
      nps: globalKPIs.total_orders > 0 ? '78' : '0', // NPS would need separate tracking
      lastUpdated: globalKPIs.last_updated,
    };
  }, [globalKPIs]);

  return {
    globalKPIs,
    monthlyKPIs,
    formattedKPIs,
    isLoading: globalKPIs === undefined,
    currentYearMonth,
  };
};
