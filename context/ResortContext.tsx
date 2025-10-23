// context/ResortContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { Resort } from '@/constants/types';
import { fetchResorts } from '@/hooks/UseRemoteService';
import { useRouter } from 'expo-router';
import { waitForInternet } from '@/lib/network';

const STORAGE_KEY = 'SELECTED_RESORT_ID';
// const RESORTS_CACHE_KEY = 'RESORTS_LAST_GOOD';

type ResortContextType = {
    resort: Resort | null;
    allResorts: Resort[];
    loading: boolean;
    refreshing: boolean;
    selectResort: (resort: Resort) => Promise<void>;
    refreshResorts: () => Promise<void>;
    handleResortSelection: (resort: Resort)  => Promise<void>;
};

const ResortContext = createContext<ResortContextType | null>(null);

export const ResortProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [resort, setResort] = useState<Resort | null>(null);
    const [allResorts, setAllResorts] = useState<Resort[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadSelectionFromStorage = async (fetched: Resort[]) => {
        const storedId = await AsyncStorage.getItem(STORAGE_KEY);
        if (!storedId) return;
        const found = fetched.find(r => String(r.resort_id) === storedId);
        if (found) setResort(found);
    };

    const loadResorts = async () => {
        setRefreshing(true);
        try {
            await waitForInternet(12000);
            const { resorts } = await fetchResorts();
            const list = resorts ?? [];
            setAllResorts(list);
            await loadSelectionFromStorage(list);

        } catch (e) {
            // If fetch fails, leave existing list on screen; don't repopulate from cache
            console.log("loadResorts failed:", e);
        } finally {
            setRefreshing(false);
        }
    };


    const refreshResorts = async () => {
        // Keep the same behavior screens expect; just calls the hardened loader
        await loadResorts();
    };

    const selectResort = async (selected: Resort) => {
        await AsyncStorage.setItem(STORAGE_KEY, String(selected.resort_id));
        NativeModules.WidgetUpdater?.saveResortToPrefs?.(String(selected.resort_id));
        if (Platform.OS === 'android') {
            NativeModules.WidgetUpdater?.updateWidgets?.();
        }
        setResort(selected);
    };

    useEffect(() => {
        (async () => {
            try {
                // no prefill from RESORTS_CACHE_KEY
                await loadResorts();
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleResortSelection = React.useCallback(async (res: Resort) => {
        await selectResort(res);
        router.replace('/tabs/to_resort');
    }, [selectResort, router]);

    const value = useMemo(
        () => ({
            resort,
            allResorts,
            loading,
            refreshing,
            selectResort,
            refreshResorts,
            handleResortSelection
        }),
        [resort, allResorts, loading, refreshing, selectResort, refreshResorts, handleResortSelection]
    );

    return <ResortContext.Provider value={value}>{children}</ResortContext.Provider>;
};

export const useSelectedResort = () => {
    const ctx = useContext(ResortContext);
    if (!ctx) throw new Error('useSelectedResort must be used within ResortProvider');
    return ctx;
};
