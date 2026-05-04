import * as React from 'react';

/**
 * Hook que devuelve el año-mes actual en formato YYYY-MM
 * Útil para consultas y filtrado por períodos mensuales
 */
export const useCurrentYearMonth = () => {
  return React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);
};
