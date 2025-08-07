import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RESORTS, Resort, ResortId } from './ResortListContext';
import { NativeModules, Platform } from 'react-native';
const STORAGE_KEY = 'SELECTED_RESORT';

interface ResortContextType {
    resort: Resort | null;
    loading: boolean;
    selectResort: (id: ResortId) => Promise<void>;
    allResorts: Resort[];
}

const ResortContext = createContext<ResortContextType | null>(null);

export const ResortProvider = ({ children }: { children: React.ReactNode }) => {
    const [resort, setResort] = useState<Resort | null>(null);
    const [loading, setLoading] = useState(true);

    const loadResort = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored && RESORTS[stored as ResortId]) {
                setResort(RESORTS[stored as ResortId]);
            }
        } finally {
            setLoading(false);
        }
    };

    const selectResort = async (id: ResortId) => {
        await AsyncStorage.setItem(STORAGE_KEY, id);
        NativeModules.WidgetUpdater?.saveResortToPrefs?.(id);
        if (Platform.OS === 'android') {
            NativeModules.WidgetUpdater?.updateWidgets?.();
        }
        setResort(RESORTS[id]);
    };

    useEffect(() => {
        loadResort();
    }, []);

    return (
        <ResortContext.Provider
            value={{
                resort,
                loading,
                selectResort,
                allResorts: Object.values(RESORTS),
            }}
        >
            {children}
        </ResortContext.Provider>
    );
};

export const useSelectedResort = () => {
    const context = useContext(ResortContext);
    if (!context) {
        throw new Error('useSelectedResort must be used within ResortProvider');
    }
    return context;
};
