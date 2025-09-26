// context/ResortContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import { Resort } from '@/constants/types';
import { fetchResorts } from '@/hooks/UseRemoteService';
import { useRouter } from 'expo-router';
import { waitForInternet } from '@/lib/network';

const STORAGE_KEY = 'SELECTED_RESORT_ID';
const RESORTS_CACHE_KEY = 'RESORTS_LAST_GOOD';

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
        const found = fetched.find(r => r.resort_id === storedId);
        if (found) setResort(found);
    };

    const loadResorts = async () => {
        setRefreshing(true);
        try {
            console.log("first run");
            // 1) do not hammer while iOS networking is waking up (harmless on Android)
            await waitForInternet(12000);

            const { resorts } = await fetchResorts(); // your existing API fn
            const list = resorts ?? [];

            setAllResorts(list);
            await AsyncStorage.setItem(RESORTS_CACHE_KEY, JSON.stringify(list));
            await loadSelectionFromStorage(list);
        } catch (e) {
            // 2) if fetch fails and state is empty, try cache so UI isn’t blank
            console.log("second run");
            if (!allResorts || allResorts.length === 0) {
                const cached = await AsyncStorage.getItem(RESORTS_CACHE_KEY);
                if (cached) {
                    try {
                        console.log("loading cache");
                        const list: Resort[] = JSON.parse(cached);
                        setAllResorts(list);
                        await loadSelectionFromStorage(list);
                    } catch {}
                }
            }
            // NOTE: we purposely do NOT clear allResorts on error
        } finally {
            setRefreshing(false);
        }
    };

    const refreshResorts = async () => {
        // Keep the same behavior screens expect; just calls the hardened loader
        await loadResorts();
    };

    const selectResort = async (selected: Resort) => {
        await AsyncStorage.setItem(STORAGE_KEY, selected.resort_id);
        NativeModules.WidgetUpdater?.saveResortToPrefs?.(selected.resort_id);
        if (Platform.OS === 'android') {
            NativeModules.WidgetUpdater?.updateWidgets?.();
        }
        setResort(selected);
    };

    useEffect(() => {
        (async () => {
            try {
                // On first mount, try cache immediately for instant UI, then refresh
                const cached = await AsyncStorage.getItem(RESORTS_CACHE_KEY);
                if (cached) {
                    try {
                        const list: Resort[] = JSON.parse(cached);
                        if (list?.length) {
                            setAllResorts(list);
                            await loadSelectionFromStorage(list);
                        }
                    } catch {}
                }
                await loadResorts();
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleResortSelection = async (resort: Resort) => {
        await selectResort(resort);
        router.replace('/tabs/to_resort');
    };

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
        [resort, allResorts, loading, refreshing, handleResortSelection]
    );

    return <ResortContext.Provider value={value}>{children}</ResortContext.Provider>;
};

export const useSelectedResort = () => {
    const ctx = useContext(ResortContext);
    if (!ctx) throw new Error('useSelectedResort must be used within ResortProvider');
    return ctx;
};
