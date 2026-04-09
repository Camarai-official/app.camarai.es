
import * as React from 'react';
import { initialEstablishments, type Establishment } from '@/data/establishments';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const LOCAL_STORAGE_KEY = 'establishments';
const ACTIVE_ESTABLISHMENT_KEY = 'activeEstablishmentId';

export const useEstablishments = () => {
  const [establishments, setEstablishments] = React.useState<Establishment[]>([]);
  const [activeEstablishmentId, setActiveEstablishmentId] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Obtener el establecimiento más reciente de Convex - solo en el cliente
  const latestConvexEstablishment = typeof window !== 'undefined' ? useQuery(api.establishmentsHelpers.getEstablishmentByLocalId, { 
    localId: 'latest' 
  }) : null;

  // Sincronizar el establecimiento activo con el más reciente de Convex
  React.useEffect(() => {
    if (latestConvexEstablishment && !activeEstablishmentId) {
      // Si no hay establecimiento activo local, usar el más reciente de Convex
      // Buscar el establecimiento local correspondiente o crear uno temporal
      const matchingLocal = establishments.find(e => e.name === latestConvexEstablishment.name);
      if (matchingLocal) {
        setActiveEstablishmentId(matchingLocal.id);
      } else {
        // Si no hay coincidencia, crear un establecimiento temporal basado en Convex
        const tempEstablishment: Establishment = {
          id: `convex-${latestConvexEstablishment._id}`,
          name: latestConvexEstablishment.name,
          image: latestConvexEstablishment.logo_url || 'https://placehold.co/40x40',
          type: 'Restaurante',
          address: latestConvexEstablishment.address || '',
          postalCode: latestConvexEstablishment.postal_code || '',
          city: latestConvexEstablishment.city || '',
          province: latestConvexEstablishment.province || '',
          country: latestConvexEstablishment.country || '',
          phone: latestConvexEstablishment.phone || '',
          email: latestConvexEstablishment.email || '',
          hours: 'L-V: 12:00-23:00, S-D: 12:00-00:00',
          active: true,
        };
        setEstablishments(prev => [...prev, tempEstablishment]);
        setActiveEstablishmentId(tempEstablishment.id);
      }
    }
  }, [latestConvexEstablishment, activeEstablishmentId, establishments]);

  // Load from localStorage on initial render
  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_ESTABLISHMENT_KEY);

      const loadedEstablishments = savedData ? JSON.parse(savedData) : initialEstablishments;
      setEstablishments(loadedEstablishments);

      if (savedActiveId && loadedEstablishments.some((e: Establishment) => e.id === JSON.parse(savedActiveId))) {
        setActiveEstablishmentId(JSON.parse(savedActiveId));
      } else if (loadedEstablishments.length > 0) {
        setActiveEstablishmentId(loadedEstablishments[0].id);
      } else {
        setActiveEstablishmentId(null);
      }
    } catch (error) {
      console.error("Failed to access localStorage", error);
      setEstablishments(initialEstablishments);
      setActiveEstablishmentId(initialEstablishments[0]?.id || null);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever data changes
  React.useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(establishments));
      if (activeEstablishmentId) {
        localStorage.setItem(ACTIVE_ESTABLISHMENT_KEY, JSON.stringify(activeEstablishmentId));
      } else {
        localStorage.removeItem(ACTIVE_ESTABLISHMENT_KEY);
      }
    }
  }, [establishments, activeEstablishmentId, isInitialized]);

  const addEstablishment = () => {
    const newId = `est-${Date.now()}`;
    const newEstablishment: Establishment = {
      id: newId,
      name: `Nuevo Restaurante ${establishments.length + 1}`,
      image: 'https://placehold.co/40x40',
      type: 'Restaurante',
      address: '',
      postalCode: '',
      city: '',
      province: '',
      country: '',
      phone: '',
      email: '',
      hours: '',
      active: true,
    };
    setEstablishments(prev => [...prev, newEstablishment]);
    setActiveEstablishmentId(newEstablishment.id);
    return newId;
  };
  
  const updateEstablishment = (id: string, updates: Partial<Establishment>) => {
      setEstablishments(prev => prev.map(est => est.id === id ? { ...est, ...updates } : est));
  };

  const removeEstablishment = (id: string): string | null => {
    let newActiveId: string | null = null;
    const remaining = establishments.filter(est => est.id !== id);
    if (id === activeEstablishmentId) {
        newActiveId = remaining[0]?.id || null;
        setActiveEstablishmentId(newActiveId);
    }
    setEstablishments(remaining);
    return newActiveId;
  };

  const getEstablishmentById = (id: string) => {
      return establishments.find(est => est.id === id);
  }

  const activeEstablishment = React.useMemo(() => {
    if (!activeEstablishmentId) return null;
    return establishments.find(e => e.id === activeEstablishmentId) || null;
  }, [establishments, activeEstablishmentId]);

  return {
    establishments,
    activeEstablishment,
    setActiveEstablishmentId,
    addEstablishment,
    updateEstablishment,
    removeEstablishment,
    getEstablishmentById
  };
};
