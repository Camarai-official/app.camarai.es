import * as React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Establishment } from '@/data/establishments';
import { useEstablishmentContext } from './EstablishmentContext';

const ACTIVE_ESTABLISHMENT_KEY = 'activeEstablishmentId';

export const useEstablishments = () => {
  const convexEstablishments = useQuery(api.establishments.getEstablishments);
  const { activeId, setActiveId } = useEstablishmentContext();

  const establishments = React.useMemo(() => {
    if (!convexEstablishments) return [];
    return convexEstablishments.map((est) => ({
      id: est._id,
      name: est.name,
      image: est.logo_url || 'https://res.cloudinary.com/dxh2i2rjo/image/upload/v1769436934/camarailogo_lbsc9d.png',
      type: 'Restaurante',
      address: est.address || '',
      postalCode: est.postal_code || '',
      city: est.city || '',
      province: est.province || '',
      country: est.country || '',
      phone: est.phone || '',
      email: est.email || '',
      hours: typeof est.operating_hours === 'string' ? est.operating_hours : (est as any).hours || '',
      active: typeof (est as any).active === 'boolean' ? (est as any).active : est.status === 'active',
      companyId: est.company_id,
    }));
  }, [convexEstablishments]);

  // Handle default active establishment if none set or if current one not found
  React.useEffect(() => {
    if (establishments.length > 0) {
      const exists = establishments.some(e => e.id === activeId);
      if (!activeId || !exists) {
        setActiveId(establishments[0].id);
      }
    }
  }, [establishments, activeId, setActiveId]);

  const activeEstablishment = React.useMemo(() =>
    establishments.find(e => e.id === activeId) || null,
  [establishments, activeId]);

  const updateMutation = useMutation(api.establishments.updateEstablishment);
  const deleteMutation = useMutation(api.establishments.deleteEstablishment);

  const updateEstablishment = React.useCallback(async (id: string, updates: Partial<Establishment>) => {
    await updateMutation({
      id: id as any,
      name: updates.name,
      address: updates.address,
      postal_code: updates.postalCode,
      city: updates.city,
      province: updates.province,
      country: updates.country,
      phone: updates.phone,
      email: updates.email,
      logo_url: updates.image,
      operating_hours: updates.hours,
      active: updates.active,
    });
  }, [updateMutation]);

  const removeEstablishment = React.useCallback(async (id: string) => {
    await deleteMutation({ id: id as any });
  }, [deleteMutation]);

  const createFirstMutation = useMutation(api.establishments.createFirstEstablishment);
  const createMutation = useMutation(api.establishments.createEstablishment);

  const addEstablishment = React.useCallback(async (data?: {
    name: string;
    type: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    email: string;
  }) => {
    if (data) {
      if (activeEstablishment?.companyId) {
        return await createMutation({
          companyId: activeEstablishment.companyId as any,
          name: data.name,
          type: data.type,
          address: data.address,
          city: data.city,
          postal_code: data.postalCode,
          country: data.country,
          email: data.email,
          ownerId: "user_owner_01",
        });
      } else {
        // TODO: REVISAR ESTA PARTE CUANDO EXISTA LOGIN
        // First establishment with data
        return await createFirstMutation({
          name: data.name,
          ownerId: "user_owner_01",
          // We should ideally pass more data here, but for now we follow the existing schema
        });
      }
    }

    return await createFirstMutation({
      name: "Mi Restaurante",
      ownerId: "user_owner_01",
    });
  }, [createFirstMutation, createMutation, activeEstablishment?.companyId]);

  return {
    establishments,
    activeEstablishment,
    companyId: activeEstablishment?.companyId,
    setActiveEstablishmentId: setActiveId,
    addEstablishment,
    updateEstablishment,
    removeEstablishment,
    isInitialized: !!convexEstablishments
  };
};
