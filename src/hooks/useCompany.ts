import * as React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useEstablishments } from './useEstablishments';

export const useCompany = () => {
    const { activeEstablishment } = useEstablishments();
    
    const convexCompany = useQuery(api.companies.getCompanyByEstablishment, 
        activeEstablishment?.id ? { establishmentId: activeEstablishment.id } : "skip"
    );
    
    const updateMutation = useMutation(api.companies.updateCompany);

    const updateCompany = React.useCallback(async (updates: any) => {
        if (!convexCompany?._id) return;
        return await updateMutation({
            id: convexCompany._id,
            ...updates
        });
    }, [convexCompany?._id, updateMutation]);

    return {
        company: convexCompany,
        updateCompany,
        isInitialized: convexCompany !== undefined
    };
};
