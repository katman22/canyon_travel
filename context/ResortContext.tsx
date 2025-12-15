// context/ResortContext.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";
import { Resort } from "@/constants/types";
import { fetchResorts } from "@/hooks/UseRemoteService";
import { useRouter } from "expo-router";
import { waitForInternet } from "@/lib/network";

const STORAGE_KEY = "SELECTED_RESORT_SLUG";

type ResortContextType = {
    resort: Resort | null;
    allResorts: Resort[];
    loading: boolean;
    refreshing: boolean;
    selectResort: (resort: Resort) => Promise<void>;
    refreshResorts: () => Promise<void>;
    handleResortSelection: (resort: Resort) => Promise<void>;
};

const ResortContext = createContext<ResortContextType | null>(null);

export const ResortProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    const [resort, setResort] = useState<Resort | null>(null);
    const [allResorts, setAllResorts] = useState<Resort[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // -----------------------------------------------------
    // Load all resorts
    // -----------------------------------------------------
    const loadResorts = useCallback(async () => {
        setRefreshing(true);
        try {
            await waitForInternet(12000);
            const { resorts } = await fetchResorts();
            const list = resorts ?? [];
            setAllResorts(list);

            // After loading list, restore the selected resort
            const storedSlug = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedSlug) {
                const found = list.find((r) => r.slug === storedSlug);
                if (found) setResort(found);
            }
        } catch (e) {
            console.log("loadResorts failed:", e);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const refreshResorts = async () => {
        await loadResorts();
    };

    // -----------------------------------------------------
    // Select a resort — store slug, notify widget
    // -----------------------------------------------------
    const selectResort = useCallback(
        async (selected: Resort) => {
            // Store slug, not resort_id
            await AsyncStorage.setItem(STORAGE_KEY, selected.slug);

            // Widget integration must use slug now too
            NativeModules.WidgetUpdater?.saveResortToPrefs?.(selected.slug);

            if (Platform.OS === "android") {
                NativeModules.WidgetUpdater?.updateWidgets?.();
            }

            setResort(selected);
        },
        []
    );

    // -----------------------------------------------------
    // First load
    // -----------------------------------------------------
    useEffect(() => {
        (async () => {
            try {
                await loadResorts();
            } finally {
                setLoading(false);
            }
        })();
    }, [loadResorts]);

    const handleResortSelection = useCallback(
        async (res: Resort) => {
            await selectResort(res);
            router.replace("/tabs/to_resort");
        },
        [selectResort, router]
    );

    const value = useMemo(
        () => ({
            resort,
            allResorts,
            loading,
            refreshing,
            selectResort,
            refreshResorts,
            handleResortSelection,
        }),
        [resort, allResorts, loading, refreshing, selectResort, refreshResorts, handleResortSelection]
    );

    return (
        <ResortContext.Provider value={value}>
            {children}
        </ResortContext.Provider>
    );
};

export const useSelectedResort = () => {
    const ctx = useContext(ResortContext);
    if (!ctx) throw new Error("useSelectedResort must be used within ResortProvider");
    return ctx;
};
