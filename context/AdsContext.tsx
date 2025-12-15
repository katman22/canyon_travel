// context/AdsContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import { requestATT } from "@/lib/att";

type AdsState = {
    // iOS ATT result: "authorized" | "denied" | "restricted" | "not-determined" | "unavailable" | null
    attStatus: string | null;
    setATT: (s: string | null) => void;
};

const AdsContext = createContext<AdsState | undefined>(undefined);

export function AdsProvider({ children }: { children: React.ReactNode }) {
    const [attStatus, setATT] = useState<string | null>(null);

    // Run ATT once when provider mounts
    useEffect(() => {
        (async () => {
            if (Platform.OS === "ios") {
                const status = await requestATT();
                setATT(status);
            } else {
                // ATT not used on Android; treat as "authorized" for convenience
                setATT("authorized");
            }
        })();
    }, []);

    return (
        <AdsContext.Provider value={{ attStatus, setATT }}>
            {children}
        </AdsContext.Provider>
    );
}

export function useAds() {
    const ctx = useContext(AdsContext);
    if (!ctx) {
        throw new Error("useAds must be used inside <AdsProvider>");
    }
    return ctx;
}
