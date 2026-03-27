
import * as React from 'react';
import { initialEnvironments, type Environment, type Table, calculateCapacity, type EnvironmentStatus } from '@/data/environments';

export const useEnvironments = () => {
    const [environments, setEnvironments] = React.useState<Environment[]>(initialEnvironments);
    const [isInitialized, setIsInitialized] = React.useState(false);

    React.useEffect(() => {
        try {
            const savedEnvs = localStorage.getItem('environments');
            if (savedEnvs) {
                setEnvironments(JSON.parse(savedEnvs));
            }
        } catch (error) {
            console.error("Failed to parse environments from localStorage", error);
            // If parsing fails, we stick with initialEnvironments
        }
        setIsInitialized(true);
    }, []);

    React.useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('environments', JSON.stringify(environments));
        }
    }, [environments, isInitialized]);
    
    const addEnvironment = () => {
        const newEnvName = `Ambiente ${environments.length + 1}`;
        const newEnvId = `${newEnvName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        const newEnvironment: Environment = {
            id: newEnvId,
            name: newEnvName,
            tables: [],
            status: 'Abierto',
            icon: 'Utensils',
            color: 'violet-500'
        }
        setEnvironments(prev => [...prev, newEnvironment]);
        return newEnvId;
    }

    const removeEnvironment = (idToRemove: string) => {
        setEnvironments(environments.filter(env => env.id !== idToRemove));
    }

    const updateEnvironment = (envId: string, updates: Partial<Environment>) => {
        setEnvironments(prev => prev.map(env => 
            env.id === envId ? { ...env, ...updates } : env
        ));
    };

    const addTable = (envId: string) => {
        const allTableIds = environments.flatMap(env => env.tables.map(t => parseInt(t.id)));
        const newId = allTableIds.length > 0 ? Math.max(...allTableIds) + 1 : 1;
        const newTable: Table = {
            id: newId.toString(),
            number: newId,
            x: 20,
            y: 20,
            width: 128,
            height: 96,
            capacity: calculateCapacity(128, 96),
            status: 'Libre'
        };
        
        setEnvironments(prev => prev.map(env => 
            env.id === envId ? { ...env, tables: [...env.tables, newTable] } : env
        ));
    };

    const removeTable = (envId: string, tableId: number) => {
         setEnvironments(prev => prev.map(env => 
            env.id === envId 
                ? { ...env, tables: env.tables.filter(table => table.id !== tableId.toString()) } 
                : env
        ));
    };

    const updateTable = (envId: string, tableId: number, updates: Partial<Table>) => {
        setEnvironments(prev => prev.map(env => {
            if (env.id === envId) {
                const updatedTables = env.tables.map(table => {
                    if (table.id === tableId.toString()) {
                        const updatedTable = { ...table, ...updates };
                        // Recalculate capacity if width or height changes
                        if(updates.width || updates.height) {
                           updatedTable.capacity = calculateCapacity(updatedTable.width, updatedTable.height);
                        }
                        return updatedTable;
                    }
                    return table;
                });
                return { ...env, tables: updatedTables };
            }
            return env;
        }));
    };

    return { 
        environments, 
        setEnvironments, 
        addEnvironment, 
        removeEnvironment, 
        updateEnvironment, 
        addTable, 
        removeTable,
        updateTable
    };
}
