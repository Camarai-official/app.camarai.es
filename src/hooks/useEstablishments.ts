import * as React from 'react';
import { initialEstablishments, type Establishment } from '@/data/establishments';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const LOCAL_STORAGE_KEY = 'establishments';
const ACTIVE_ESTABLISHMENT_KEY = 'activeEstablishmentId';

// Safe useQuery wrapper for static export / SSR
const useSafeQuery = (query: any, args?: any) => {
  if (typeof window === 'undefined') return null;
  try {
    return useQuery(query, args);
  } catch (error) {
    return null;
  }
};

export const useEstablishments = () => {
  const [establishments, setEstablishments] = React.useState<Establishment[]>([]);
  const [activeEstablishmentId, setActiveEstablishmentId] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  const latestConvexEstablishment = useSafeQuery(api.establishmentsHelpers.getEstablishmentByLocalId, { 
    localId: 'latest' 
  });

  // 1. Initial Load from LocalStorage
  React.useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const savedActiveId = localStorage.getItem(ACTIVE_ESTABLISHMENT_KEY);

      const loadedEstablishments = savedData ? JSON.parse(savedData) : initialEstablishments;
      setEstablishments(loadedEstablishments);

      if (savedActiveId) {
        const parsedId = JSON.parse(savedActiveId);
        if (loadedEstablishments.some((e: Establishment) => e.id === parsedId)) {
          setActiveEstablishmentId(parsedId);
        }
      } else if (loadedEstablishments.length > 0) {
        setActiveEstablishmentId(loadedEstablishments[0].id);
      }
    } catch (error) {
      console.error("Failed to load local establishments", error);
      setEstablishments(initialEstablishments);
    }
    setIsInitialized(true);
  }, []);

  // 2. Sync with Convex (Remote -> Local)
  React.useEffect(() => {
    if (!latestConvexEstablishment || !isInitialized) return;

    // Check if we already have this establishment (by name or a specific convex ID tag)
    const exists = establishments.find(
      e => e.name === latestConvexEstablishment.name || e.id === `convex-${latestConvexEstablishment._id}`
    );

    if (!exists) {
      const newEstablishment: Establishment = {
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
      setEstablishments(prev => [...prev, newEstablishment]);
      // Only auto-switch if no active ID is set
      if (!activeEstablishmentId) setActiveEstablishmentId(newEstablishment.id);
    }
  }, [latestConvexEstablishment, isInitialized]); // Removed 'establishments' to prevent infinite loops

  // 3. Persist to LocalStorage
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

  // Actions
  const addEstablishment = React.useCallback(() => {
    const newId = `est-${Date.now()}`;
    const newEst: Establishment = {
      id: newId,
      name: `Nuevo Restaurante ${establishments.length + 1}`,
      image: 'https://placehold.co/40x40',
      type: 'Restaurante',
      address: '', postalCode: '', city: '', province: '', country: '', phone: '', email: '', hours: '',
      active: true,
    };
    setEstablishments(prev => [...prev, newEst]);
    setActiveEstablishmentId(newId);
    return newId;
  }, [establishments.length]);

  const updateEstablishment = React.useCallback((id: string, updates: Partial<Establishment>) => {
    setEstablishments(prev => prev.map(est => est.id === id ? { ...est, ...updates } : est));
  }, []);

  const removeEstablishment = React.useCallback((id: string) => {
    setEstablishments(prev => {
      const remaining = prev.filter(est => est.id !== id);
      if (id === activeEstablishmentId) {
        setActiveEstablishmentId(remaining[0]?.id || null);
      }
      return remaining;
    });
  }, [activeEstablishmentId]);

  const activeEstablishment = React.useMemo(() => 
    establishments.find(e => e.id === activeEstablishmentId) || null, 
  [establishments, activeEstablishmentId]);

  return {
    establishments,
    activeEstablishment,
    setActiveEstablishmentId,
    addEstablishment,
    updateEstablishment,
    removeEstablishment,
    isInitialized
  };
};