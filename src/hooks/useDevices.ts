
import * as React from 'react';
import { initialDevices, type Device } from '@/data/devices';

const LOCAL_STORAGE_KEY = 'restaurantDevices';

export const useDevices = () => {
    const [devices, setDevices] = React.useState<Device[]>([]);
    const [isInitialized, setIsInitialized] = React.useState(false);

    React.useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            const loadedDevices = savedData ? JSON.parse(savedData) : initialDevices;
            setDevices(loadedDevices);
        } catch (error) {
            console.error("Failed to load devices from localStorage", error);
            setDevices(initialDevices);
        }
        setIsInitialized(true);
    }, []);

    React.useEffect(() => {
        if (isInitialized) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(devices));
        }
    }, [devices, isInitialized]);

    const addDevice = (deviceData: Omit<Device, 'id'>) => {
        const newDevice: Device = {
            ...deviceData,
            id: `${deviceData.type}-${Date.now()}`,
        };
        setDevices(prev => [...prev, newDevice]);
    };

    const updateDevice = (id: string, updates: Partial<Omit<Device, 'id'>>) => {
        setDevices(prev => prev.map(dev =>
            dev.id === id ? { ...dev, ...updates } : dev
        ));
    };

    const removeDevice = (id: string) => {
        setDevices(prev => prev.filter(dev => dev.id !== id));
    };

    return {
        devices,
        addDevice,
        updateDevice,
        removeDevice,
    };
};
